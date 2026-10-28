import { issueNumbers, releaseRange } from './core.mjs';

export class GitHubEvidence {
  constructor({ repository, token, config, apiUrl = 'https://api.github.com' }) {
    if (!/^[\w.-]+\/[\w.-]+$/.test(repository || '')) throw new Error('GITHUB_REPOSITORY must be owner/repository.');
    this.root = `${apiUrl}/repos/${repository}`;
    this.token = token;
    this.config = config;
    this.evidence = { sample: false, observed_at: new Date().toISOString(), sources: [], limitations: [], available_labels: [], linked_items: [] };
  }

  async request(path, { optional = false } = {}) {
    const response = await fetch(`${this.root}${path}`, {
      headers: { Authorization: `Bearer ${this.token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
      signal: AbortSignal.timeout(30000),
    });
    if (response.status === 404 && optional) return null;
    if (!response.ok) throw new Error(`GitHub evidence collection failed (${response.status}) for ${path}.`);
    return response.json();
  }

  add(id, kind, data, url) {
    this.evidence.sources = this.evidence.sources.filter(source => source.id !== id);
    const text = JSON.stringify(data);
    const used = this.evidence.sources.reduce((sum, source) => sum + JSON.stringify(source.data).length, 0);
    const remaining = Math.max(0, 18000 - used);
    if (!remaining) {
      this.evidence.limitations.push(`${id}: omitted because the 18,000-character evidence budget was reached.`);
      return;
    }
    const limit = Math.min(6000, remaining);
    if (text.length > limit) {
      this.evidence.limitations.push(`${id}: source truncated to ${limit} characters.`);
      data = { truncated: true, excerpt: text.slice(0, limit) };
    }
    this.evidence.sources.push({ id, kind, data, ...(url ? { url } : {}) });
  }

  async file(path, ref, optional = true) {
    const file = await this.request(`/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(ref)}`, { optional });
    if (!file) return null;
    if (file.type !== 'file' || file.encoding !== 'base64') {
      this.evidence.limitations.push(`${path}: unavailable as bounded text.`);
      return null;
    }
    return { text: Buffer.from(file.content, 'base64').toString('utf8'), url: file.html_url };
  }

  async collect(number, kind, refs = {}) {
    if (!/^[1-9]\d*$/.test(String(number))) throw new Error('A positive issue or PR number is required in live mode.');
    this.evidence.report_ref = refs.defaultBranch || 'HEAD';
    const issue = await this.request(`/issues/${number}`);
    const isPr = Boolean(issue.pull_request);
    if (kind === 'pr' && !isPr) throw new Error('This blueprint requires a pull request.');
    if (kind === 'issue' && isPr) throw new Error('This blueprint requires an issue, not a pull request.');
    this.add('request', isPr ? 'pr' : 'issue', {
      number: issue.number, title: issue.title, body: issue.body, state: issue.state,
      labels: issue.labels.map(label => label.name),
    }, issue.html_url);
    this.evidence.linked_items = issueNumbers(issue.body || '', this.config.max_items).filter(x => x !== issue.number);
    let ref = refs.defaultBranch;
    if (isPr) {
      const pr = await this.request(`/pulls/${number}`);
      this.evidence.candidate = pr.head.sha;
      this.evidence.pr = number;
      this.evidence.base = pr.base.sha;
      ref = pr.base.sha;
      const files = await this.request(`/pulls/${number}/files?per_page=${this.config.max_items}`);
      this.evidence.files = files.map(file => file.filename);
      this.add('changes', 'diff', files.map(file => ({
        filename: file.filename, status: file.status, additions: file.additions,
        deletions: file.deletions, patch: file.patch || '(No text patch available)',
      })), pr.html_url);
      if (pr.changed_files > files.length) this.evidence.limitations.push(`Only ${files.length} of ${pr.changed_files} changed files collected.`);
      this.evidence.limitations.push('Diffs can be truncated by GitHub. Test source is not proof of execution or complete behaviour coverage.');
    } else {
      const candidate = (issue.body || '').match(/^Candidate:\s*([a-f0-9]{40})\s*$/im)?.[1];
      if (candidate) this.evidence.candidate = candidate;
    }
    for (const [index, path] of this.config.guidance_paths.entries()) {
      const content = await this.file(path, ref);
      if (content) this.add(`guidance-${index + 1}`, 'guidance', content.text, content.url);
      else this.evidence.limitations.push(`Guidance unavailable: ${path}.`);
    }
    const comments = await this.request(`/issues/${number}/comments?per_page=${this.config.max_items}`);
    for (const comment of comments) {
      this.add(`comment-${comment.id}`, 'comment', { body: comment.body, updated_at: comment.updated_at }, comment.html_url);
    }
    if (comments.length === this.config.max_items) this.evidence.limitations.push('Only the first bounded page of comments was collected; later discussion may be omitted.');
    if (refs.blueprint === 'github-issue-triage') {
      // Label names are fetched in full; only these names may be recommended.
      for (let page = 1; page <= 10; page++) {
        const labels = await this.request(`/labels?per_page=100&page=${page}`);
        this.evidence.available_labels.push(...labels.map(label => label.name));
        if (labels.length < 100) break;
        if (page === 10) this.evidence.limitations.push('Label collection capped at 1,000 labels.');
      }
    }
    if (refs.blueprint === 'stakeholder-release-notes-generator') {
      this.evidence.range = releaseRange(issue.body || '', refs.base, refs.head);
      await this.compare();
    }
    if (refs.blueprint === 'release-readiness-helper') {
      if (this.evidence.candidate) await this.checks();
      else this.evidence.limitations.push('No exact Candidate: <40-character SHA> supplied; readiness checks cannot be verified.');
    }
    if (refs.blueprint === 'test-scenario-planner' && isPr) {
      // Criteria are initial context; the planner can spend its follow-up on test evidence.
      await this.linked();
    }
    return this.evidence;
  }

  async compare() {
    if (!this.evidence.range) {
      this.evidence.limitations.push('No release range is available.');
      return;
    }
    const { base, head } = this.evidence.range;
    const baseCommit = await this.request(`/commits/${encodeURIComponent(base)}`);
    const headCommit = await this.request(`/commits/${encodeURIComponent(head)}`);
    this.evidence.candidate = headCommit.sha;
    this.evidence.range = { base: baseCommit.sha, head: headCommit.sha };
    const comparison = await this.request(`/compare/${baseCommit.sha}...${headCommit.sha}?per_page=${this.config.max_items}`);
    if (!['ahead', 'identical'].includes(comparison.status)) {
      throw new Error('Release range must be forward/identical history; divergent or reversed ranges are not release evidence.');
    }
    this.add('release-changes', 'release-changes', {
      base: baseCommit.sha, head: headCommit.sha, total_commits: comparison.total_commits,
      commits: comparison.commits.map(commit => ({ sha: commit.sha, message: commit.commit.message })),
      files: (comparison.files || []).slice(0, this.config.max_items).map(file => ({ filename: file.filename, patch: file.patch })),
    }, comparison.html_url);
    if (comparison.total_commits > comparison.commits.length || (comparison.files || []).length >= this.config.max_items) {
      this.evidence.limitations.push('Release comparison reached a collection bound; release notes may omit changes.');
    }
    this.evidence.linked_items = [...new Set([...this.evidence.linked_items,
      ...issueNumbers(comparison.commits.map(commit => commit.commit.message).join('\n'), this.config.max_items)])].slice(0, this.config.max_items);
  }

  async linked() {
    for (const number of this.evidence.linked_items) {
      const item = await this.request(`/issues/${number}`, { optional: true });
      if (!item) {
        this.evidence.limitations.push(`Linked item #${number} was not accessible.`);
        continue;
      }
      this.add(`linked-${number}`, 'issue', {
        title: item.title, body: item.body, state: item.state,
        labels: item.labels.map(label => label.name), updated_at: item.updated_at,
        milestone: item.milestone && { title: item.milestone.title, due_on: item.milestone.due_on },
      }, item.html_url);
    }
    if (!this.evidence.linked_items.length) this.evidence.limitations.push('No explicit same-repository #number links were supplied.');
  }

  async tests() {
    if (!this.evidence.candidate) {
      this.evidence.limitations.push('No candidate available for test-source inspection.');
      return;
    }
    const paths = [...new Set([...(this.config.test_paths || []),
      ...(this.evidence.files || []).filter(file => /(?:^|[/.])(?:test|tests|spec|specs)(?:[/.]|$)|(?:test|spec)\.[^/]+$/i.test(file))])].slice(0, this.config.max_items);
    for (const [index, path] of paths.entries()) {
      const file = await this.file(path, this.evidence.candidate);
      if (file) this.add(`test-${index + 1}`, 'test-source', file.text, file.url);
      else this.evidence.limitations.push(`Test source unavailable: ${path}.`);
    }
    for (const [index, path] of (this.config.test_report_paths || []).slice(0, this.config.max_items).entries()) {
      const file = await this.file(path, this.evidence.report_ref || 'HEAD');
      if (!file) {
        this.evidence.limitations.push(`Test report unavailable: ${path}.`);
        continue;
      }
      const report = JSON.parse(file.text);
      if (report.sha !== this.evidence.candidate || !Array.isArray(report.scenarios) ||
          !report.scenarios.length || !report.scenarios.every(s => typeof s.name === 'string' && ['passed', 'failed', 'skipped'].includes(s.result))) {
        this.evidence.limitations.push(`Report ${path} lacks candidate-specific scenario results.`);
        continue;
      }
      this.add(`test-report-${index + 1}`, 'test-report', report, file.url);
    }
    this.evidence.limitations.push('Only changed test-like files and configured exact test_paths are inspected; external test systems and unlisted tests are not searched. Supplied reports are claims, not independently attested results.');
  }

  async checks() {
    const sha = this.evidence.candidate;
    if (!sha) {
      this.evidence.limitations.push('No exact candidate available for checks.');
      return;
    }
    const checks = await this.request(`/commits/${sha}/check-runs?per_page=${this.config.max_items}`);
    const statuses = await this.request(`/commits/${sha}/status?per_page=${this.config.max_items}`);
    this.add('checks', 'checks', { sha,
      check_runs: checks.check_runs.map(run => ({ name: run.name, head_sha: run.head_sha, status: run.status, conclusion: run.conclusion, url: run.html_url })),
      statuses: statuses.statuses.map(status => ({ context: status.context, state: status.state, url: status.target_url })),
    });
    if (checks.total_count > checks.check_runs.length || statuses.total_count > statuses.statuses.length) this.evidence.limitations.push('Check/status results truncated by max_items.');
    this.evidence.limitations.push('CI status does not establish scenario coverage or human approval. Company-required check names must be stated in the request or guidance.');
  }
}
