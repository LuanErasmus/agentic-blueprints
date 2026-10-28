import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm, readdir, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { tasks } from './tasks.mjs';
import { sampleEvidence } from './samples.mjs';
import { parseJson, validateConfig, validateReport, calculateConfidence, issueNumbers, releaseRange } from './core.mjs';
import { prepareEvidence, enabledForEvent } from './evidence.mjs';
import { publishReport } from './report.mjs';
import { azureRead, diagnosticArguments, collectAzureEvidence } from './azure.mjs';
import { GitHubEvidence } from './github.mjs';
import { stageWorkflowSources } from './validate.mjs';

const config = { trigger_labels: ['review'], guidance_paths: [], max_items: 20,
  weights: { scope: 20, execution: 30, scenarios: 30, review: 20 }, minimum_evidence_dimensions: 3 };
const report = () => ({
  summary: 'Inspect the cancellation boundary before proceeding.',
  findings: [{ status: 'gap', detail: 'The request does not define the refund outcome.', sources: ['request'] }],
  limitations: ['Sample evidence only.'], next_steps: ['Ask the business owner to define the refund rule.'],
  suggested_labels: ['bug'],
});

test('all nine blueprints contain usage sections and filled-in input/output examples', async () => {
  const sections = ['Problem', 'What the Agent Does', 'Architecture', 'Prerequisites', 'Setup',
    'Run It', 'How It Works', 'Guardrails', 'Customise It', 'Challenge'];
  for (const slug of Object.keys(tasks)) {
    const root = join('blueprints', slug);
    const readme = await readFile(join(root, 'README.md'), 'utf8');
    for (const section of sections) assert.ok(readme.includes(`## ${section}`), `${slug}: missing ${section}`);
    const prerequisites = readme.split('## Prerequisites')[1].split('## Setup')[0];
    assert.match(prerequisites, /Copilot Business/);
    assert.match(prerequisites, /Copilot Enterprise/);
    assert.match(prerequisites, /organisation-owned repository/);
    assert.match(prerequisites, /copilot-requests: write/);
    assert.ok(readme.includes('running-workflows.md#copilot-licence-and-authentication-requirements'));
    assert.doesNotMatch(readme, /COPILOT_GITHUB_TOKEN|remove `copilot-requests: write`/);
    for (const filename of ['input.md', 'output.md']) {
      assert.ok((await readFile(join(root, 'examples', filename), 'utf8')).length > 100, `${slug}: empty ${filename}`);
    }
    assert.match(await readFile(join(root, 'blueprint.yml'), 'utf8'), /difficulty:/);
  }
});

test('documentation local links resolve', async () => {
  const files = ['README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'SUPPORT.md', 'CODE_OF_CONDUCT.md'];
  async function collect(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const path = join(folder, entry.name);
      if (entry.isDirectory()) await collect(path);
      else if (entry.name.endsWith('.md')) files.push(path);
    }
  }
  for (const folder of ['blueprints', 'docs', 'templates', 'patterns', 'building-blocks']) await collect(folder);
  for (const file of files) {
    const markdown = await readFile(file, 'utf8');
    for (const match of markdown.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)) {
      const target = match[1].split('#')[0];
      if (!target || /^https?:\/\//.test(target)) continue;
      await assert.doesNotReject(() => access(resolve(dirname(file), target)), `${file}: broken link ${target}`);
    }
  }
});

test('parses JSON fences and rejects empty and malformed model output', () => {
  assert.deepEqual(parseJson('```json\n{"action":"stop"}\n```'), { action: 'stop' });
  assert.throws(() => parseJson(''));
  assert.throws(() => parseJson('Here is a plan: {}'));
});

test('reports require real source IDs; invalid labels fail closed', () => {
  const evidence = sampleEvidence('github-issue-triage');
  assert.doesNotThrow(() => validateReport('github-issue-triage', report(), evidence));
  const unknown = report();
  unknown.findings[0].sources = ['invented'];
  assert.throws(() => validateReport('github-issue-triage', unknown, evidence));
  const invalid = report();
  invalid.suggested_labels = ['does-not-exist'];
  assert.throws(() => validateReport('github-issue-triage', invalid, evidence));
});

test('readiness rejects success-shaped risk statuses and accepts unknown evidence', () => {
  const result = report();
  assert.throws(() => validateReport('release-readiness-helper', result, sampleEvidence('release-readiness-helper')));
  result.findings[0] = { status: 'unknown', detail: 'No acceptance report supplied.', sources: [] };
  assert.doesNotThrow(() => validateReport('release-readiness-helper', result, sampleEvidence('release-readiness-helper')));
});

test('unknown confidence weights are not redistributed; insufficient evidence withholds', () => {
  const dimensions = { scope: { score: 100 }, execution: null, scenarios: { score: 100 }, review: { score: 100 } };
  assert.equal(calculateConfidence(dimensions, config).score, 70);
  dimensions.scenarios = null;
  assert.equal(calculateConfidence(dimensions, config).score, null);
  assert.throws(() => calculateConfidence(dimensions, { ...config, weights: { scope: 1 } }));
  assert.throws(() => calculateConfidence(dimensions, { ...config, minimum_evidence_dimensions: 0 }));
});

test('green CI does not establish scenario execution; stale reports do not count', () => {
  const evidence = sampleEvidence('pr-confidence-calculator');
  evidence.sources.push(...evidence.followups.inspect_checks, ...evidence.followups.inspect_tests);
  const dimension = { score: 90, sources: ['checks'], reason: 'Assess evidence.' };
  const result = { ...report(), dimensions: { scope: dimension, execution: dimension,
    scenarios: { ...dimension, sources: ['test-source'] }, review: dimension } };
  evidence.sources.push({ id: 'old-report', kind: 'test-report', data: { sha: 'old', conclusion: 'success' } });
  validateReport('pr-confidence-calculator', result, evidence);
  assert.equal(result.dimensions.execution, null);
  assert.notEqual(result.dimensions.scenarios, null);
});

test('confidence requires cited current scenario evidence and penalises observed failures', () => {
  const evidence = sampleEvidence('pr-confidence-calculator');
  evidence.sources.push({ id: 'scenario-report', kind: 'test-report', data: {
    sha: evidence.candidate, conclusion: 'success', scenarios: [{ name: 'Reject dispatched order', result: 'passed' }],
  } });
  const dimension = { score: 80, sources: ['request'], reason: 'Scoped change.' };
  const result = { ...report(), dimensions: { scope: dimension, execution: {
    score: 90, sources: ['scenario-report'], reason: 'Current candidate scenario result.',
  }, scenarios: null, review: dimension } };
  validateReport('pr-confidence-calculator', result, evidence);
  assert.equal(result.dimensions.execution.score, 90);
  evidence.sources.at(-1).data.scenarios[0].result = 'failed';
  validateReport('pr-confidence-calculator', result, evidence);
  assert.equal(result.dimensions.execution.score, 0);
  assert.ok(result.dimensions.execution.sources.includes('scenario-report'));
});

test('native-agent CLI report command accepts one JSON argument and fails on invalid assessments', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'blueprint-cli-test-'));
  try {
    const env = { ...process.env, BLUEPRINT_OUTPUT: folder, SAMPLE: 'true',
      GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_EVENT_PATH: '' };
    execFileSync(process.execPath, [join('scripts', 'blueprints', 'evidence.mjs'), 'github-issue-triage'],
      { env, encoding: 'utf8' });
    const result = report();
    result.summary = "The customer's requested outcome needs clarification.";
    const output = execFileSync(process.execPath,
      [join('scripts', 'blueprints', 'report.mjs'), 'github-issue-triage', JSON.stringify(result)],
      { env, encoding: 'utf8' });
    assert.match(output, /customer's requested outcome/);
    assert.match(output, /SYNTHETIC SAMPLE/);
    assert.throws(() => execFileSync(process.execPath,
      [join('scripts', 'blueprints', 'report.mjs'), 'github-issue-triage', '{}'],
      { env, stdio: 'pipe' }));
  } finally { await rm(folder, { recursive: true, force: true }); }
});

test('source collection caps text and marks missing context instead of silent success', () => {
  const collector = new GitHubEvidence({ repository: 'sample/repo', token: 'test-only', config });
  for (let i = 0; i < 10; i++) collector.add(`source-${i}`, 'text', 'x'.repeat(10000));
  assert.ok(collector.evidence.sources.length < 10);
  assert.ok(collector.evidence.limitations.some(item => item.includes('omitted')));
  assert.ok(JSON.stringify(collector.evidence.sources).length < 20000);
  assert.throws(() => validateConfig({ ...config, max_items: 0 }));
  assert.throws(() => validateConfig({ ...config, test_paths: '*.test.js' }));
});

test('extracts bounded same-repository issue links and requires release range', () => {
  assert.deepEqual(issueNumbers('Work #12, then #12 and (#13). external https://example.com/#99', 2), [12, 13]);
  assert.deepEqual(releaseRange('From: v1\nTo: v2', '', ''), { base: 'v1', head: 'v2' });
  assert.throws(() => releaseRange('No release scope.'));
});

for (const slug of Object.keys(tasks)) {
  test(`${slug}: offline evidence and validated native-agent report contract`, async () => {
    const folder = await mkdtemp(join(tmpdir(), 'blueprint-test-'));
    try {
      const env = { BLUEPRINT_OUTPUT: folder, SAMPLE: 'true' };
      const evidence = await prepareEvidence(slug, env);
      assert.equal(evidence.followups, undefined);
      assert.equal(evidence.enabled, true);
      const result = report();
      if (slug === 'azure-deployment-investigator') {
        result.findings[0].sources = ['inspect_failed_resource'];
      }
      if (slug === 'release-readiness-helper') result.findings[0].status = 'unknown';
      if (slug === 'pr-confidence-calculator') result.dimensions = { scope: null, execution: null, scenarios: null, review: null };
      await publishReport(slug, JSON.stringify(result), env);
      const markdown = await readFile(join(folder, slug, 'report.md'), 'utf8');
      assert.match(markdown, /SYNTHETIC SAMPLE/);
      assert.match(markdown, /Internal evidence references/);
      if (slug === 'pr-confidence-calculator') {
        assert.match(markdown, /withheld/);
        const structured = JSON.parse(await readFile(join(folder, slug, 'report.json'), 'utf8'));
        assert.equal(structured.confidence.score, null);
      }
    } finally { await rm(folder, { recursive: true, force: true }); }
  });
}

test('Azure collects fixed read-only snapshots, never model-selected commands', async () => {
  const evidence = await collectAzureEvidence({ SAMPLE: 'true' });
  assert.deepEqual(evidence.sources.map(source => source.id),
    ['deployment', 'operations', 'inspect_failed_resource', 'inspect_recent_activity']);
  const commands = [];
  const live = await collectAzureEvidence({
    RESOURCE_GROUP: 'demo', DEPLOYMENT_NAME: 'deployment', AZURE_SUBSCRIPTION_ID: 'allowed',
  }, args => {
    commands.push(args);
    if (args[1] === 'operation') return [{
      provisioningState: 'Failed',
      targetResource: { id: '/subscriptions/other/resourceGroups/demo/providers/Test/resource/demo' },
    }];
    return {};
  });
  assert.equal(commands.length, 3);
  assert.ok(live.limitations.some(item => item.includes('outside the configured')));
  assert.ok(commands.every(args => !['delete', 'create', 'update'].some(word => args.includes(word))));
});

test('Azure executes only allowlisted argument lists and handles missing resources explicitly', () => {
  assert.throws(() => diagnosticArguments('delete', {}));
  assert.throws(() => diagnosticArguments('inspect_failed_resource', {}));
  const args = diagnosticArguments('inspect_failed_resource', {
    resourceId: '/subscriptions/demo/resourceGroups/demo/providers/Microsoft.Storage/storageAccounts/demo',
  });
  assert.deepEqual(args.slice(0, 3), ['resource', 'show', '--ids']);
  const missing = () => { throw Object.assign(new Error('missing'), { stderr: '(ResourceNotFound) Not found.' }); };
  assert.equal(azureRead(args, missing).found, false);
  assert.throws(() => azureRead(args, () => { throw new Error('Authentication expired'); }), /Authentication/);
});

test('GitHub API errors remain failures; optional inaccessible resources are explicit', async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  const collector = new GitHubEvidence({ repository: 'sample/repo', token: 'test-only', config });
  globalThis.fetch = async () => ({ status: 403, ok: false });
  await assert.rejects(() => collector.request('/issues/1'), /403/);
  globalThis.fetch = async () => ({ status: 404, ok: false });
  assert.equal(await collector.request('/issues/1', { optional: true }), null);
  collector.evidence.linked_items = [12];
  await collector.linked();
  assert.match(collector.evidence.limitations[0], /not accessible/);
});

test('live PR collection links criteria, reads guidance at base and does not execute contributor code', async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  const calls = [];
  globalThis.fetch = async url => {
    const path = new URL(url).pathname.replace('/repos/sample/repo', '');
    calls.push(`${path}${new URL(url).search}`);
    const fixtures = {
      '/issues/5': { number: 5, title: 'Cancellation', body: 'Closes #12', state: 'open', labels: [], pull_request: {}, html_url: 'https://github.com/sample/repo/pull/5' },
      '/pulls/5': { head: { sha: 'a'.repeat(40) }, base: { sha: 'b'.repeat(40) }, changed_files: 2 },
      '/pulls/5/files': [{ filename: 'orders.mjs', patch: '+if (dispatched) throw Error();' }],
      '/contents/CONTRIBUTING.md': { type: 'file', encoding: 'base64', content: Buffer.from('Preserve public error formats.').toString('base64') },
      '/issues/5/comments': [],
      '/issues/12': { title: 'Acceptance criteria', body: 'Reject cancellation after dispatch.', state: 'open', labels: [] },
    };
    assert.ok(Object.hasOwn(fixtures, path), `Unexpected GitHub request ${path}`);
    return { ok: true, status: 200, json: async () => fixtures[path] };
  };
  const collector = new GitHubEvidence({
    repository: 'sample/repo', token: 'test-only', config: { ...config, guidance_paths: ['CONTRIBUTING.md'] },
  });
  const evidence = await collector.collect(5, 'either', { blueprint: 'test-scenario-planner', defaultBranch: 'main' });
  assert.equal(evidence.candidate, 'a'.repeat(40));
  assert.ok(evidence.sources.some(source => source.id === 'linked-12'));
  assert.ok(calls.some(path => path.includes(`ref=${'b'.repeat(40)}`)));
  assert.ok(evidence.limitations.some(item => item.includes('Only 1 of 2')));
});

test('native confidence preparation collects tests, checks, and review records before assessment', async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  const folder = await mkdtemp(join(tmpdir(), 'blueprint-confidence-test-'));
  const candidate = 'a'.repeat(40);
  globalThis.fetch = async url => {
    const path = new URL(url).pathname.replace('/repos/sample/repo', '');
    const text = body => ({ type: 'file', encoding: 'base64', content: Buffer.from(body).toString('base64') });
    const fixtures = {
      '/issues/5': { number: 5, title: 'Cancellation', body: 'Reject cancellation after dispatch.',
        state: 'open', labels: [], pull_request: {} },
      '/pulls/5': { head: { sha: candidate }, base: { sha: 'b'.repeat(40) }, changed_files: 1 },
      '/pulls/5/files': [{ filename: 'tests/order.test.mjs', patch: '+assert.throws(() => cancel(dispatched));' }],
      '/contents/CONTRIBUTING.md': text('Inspect failure scenarios and preserve public error formats.'),
      '/issues/5/comments': [],
      '/contents/tests/order.test.mjs': text('test("reject dispatched orders", () => assert.throws(() => cancel(dispatched)));'),
      [`/commits/${candidate}/check-runs`]: { total_count: 1, check_runs: [{ name: 'unit', conclusion: 'success', head_sha: candidate }] },
      [`/commits/${candidate}/status`]: { total_count: 0, statuses: [] },
      '/pulls/5/reviews': [{ state: 'COMMENTED', body: 'Check the dispatch boundary.', commit_id: candidate }],
    };
    assert.ok(Object.hasOwn(fixtures, path), `Unexpected GitHub request ${path}`);
    return { ok: true, status: 200, json: async () => fixtures[path] };
  };
  try {
    const env = { BLUEPRINT_OUTPUT: folder, GITHUB_REPOSITORY: 'sample/repo',
      GITHUB_TOKEN: 'test-only', DEFAULT_BRANCH: 'main', NUMBER: '5' };
    const evidence = await prepareEvidence('pr-confidence-calculator', env);
    for (const id of ['test-1', 'checks', 'reviews']) assert.ok(evidence.sources.some(source => source.id === id));
    const dimension = (score, id) => ({ score, sources: [id], reason: 'Prepared evidence supports this assessment.' });
    const result = { ...report(), dimensions: { scope: dimension(90, 'changes'),
      execution: dimension(100, 'checks'), scenarios: dimension(75, 'test-1'), review: dimension(80, 'reviews') } };
    const published = await publishReport('pr-confidence-calculator', JSON.stringify(result), env);
    assert.equal(published.result.dimensions.execution, null);
    assert.equal(published.result.confidence.score, 57);
    assert.match(published.markdown, /partial/);
  } finally { await rm(folder, { recursive: true, force: true }); }
});

test('report snapshots use trusted default branch and reject stale scenario reports', async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  const urls = [];
  globalThis.fetch = async url => {
    urls.push(url);
    return { ok: true, status: 200, json: async () => ({
      type: 'file', encoding: 'base64',
      content: Buffer.from(JSON.stringify({ sha: 'old', conclusion: 'success', scenarios: [{ name: 'Old scenario', result: 'passed' }] })).toString('base64'),
    }) };
  };
  const collector = new GitHubEvidence({
    repository: 'sample/repo', token: 'test-only', config: { ...config, test_report_paths: ['evidence/tests.json'] },
  });
  collector.evidence.candidate = 'a'.repeat(40);
  collector.evidence.report_ref = 'main';
  await collector.tests();
  assert.ok(urls[0].endsWith('?ref=main'));
  assert.ok(collector.evidence.limitations.some(item => item.includes('lacks candidate-specific')));
  assert.equal(collector.evidence.sources.length, 0);
});

test('release comparison resolves immutable candidate refs and rejects divergent history', async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  let divergent = false;
  globalThis.fetch = async url => {
    const path = new URL(url).pathname;
    const data = path.includes('/compare/')
      ? { status: divergent ? 'diverged' : 'ahead', total_commits: 1, commits: [{ sha: 'a'.repeat(40), commit: { message: 'Cancellation (#12)' } }], files: [] }
      : { sha: path.endsWith('/v1') ? 'b'.repeat(40) : 'a'.repeat(40) };
    return { ok: true, status: 200, json: async () => data };
  };
  const collector = new GitHubEvidence({ repository: 'sample/repo', token: 'test-only', config });
  collector.evidence.range = { base: 'v1', head: 'v2' };
  await collector.compare();
  assert.equal(collector.evidence.candidate, 'a'.repeat(40));
  assert.deepEqual(collector.evidence.linked_items, [12]);
  divergent = true;
  await assert.rejects(() => collector.compare(), /divergent/);
});

test('irrelevant labels and fork PR events do not invoke collection', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'blueprint-trigger-test-'));
  try {
    const eventPath = join(folder, 'event.json');
    await writeFile(eventPath, JSON.stringify({ action: 'labeled', label: { name: 'unrelated' }, issue: { number: 12 } }));
    const disabled = await prepareEvidence('requirements-gap-investigator', {
      BLUEPRINT_OUTPUT: folder, GITHUB_EVENT_PATH: eventPath,
      GITHUB_EVENT_NAME: 'issues', GITHUB_REPOSITORY: 'company/repo',
    });
    assert.equal(disabled.enabled, false);
    await assert.rejects(() => publishReport('requirements-gap-investigator', JSON.stringify(report()),
      { BLUEPRINT_OUTPUT: folder }), /Out-of-scope/);
    await writeFile(eventPath, JSON.stringify({ action: 'opened', pull_request: { number: 12, head: { repo: { full_name: 'fork/repo' } } } }));
    const fork = await prepareEvidence('github-pr-review', {
      BLUEPRINT_OUTPUT: folder, GITHUB_EVENT_PATH: eventPath,
      GITHUB_EVENT_NAME: 'pull_request', GITHUB_REPOSITORY: 'company/repo',
    });
    assert.equal(fork.enabled, false);
  } finally { await rm(folder, { recursive: true, force: true }); }
});

test('native sources align trigger labels, imports, and source-only distribution', async () => {
  const directory = join('.github', 'workflows');
  const files = await readdir(directory);
  assert.equal(files.filter(file => file.endsWith('.md')).length, 0);
  assert.equal(files.filter(file => file.endsWith('.lock.yml')).length, 0);
  await assert.rejects(() => access(join(directory, 'shared')));
  for (const slug of Object.keys(tasks)) {
    const id = slug.replace(/^github-/, '');
    const source = await readFile(join('blueprints', slug, `${id}.md`), 'utf8');
    assert.match(source, /shared\/blueprint-runtime\.md/);
    assert.match(source, /shared\/report-contract\.md/);
    assert.match(source, /strict: true/);
    assert.match(source, /roles: \[admin, maintainer, write/);
    assert.match(source, /copilot-requests: write/);
    assert.ok(source.includes(`BLUEPRINT_SLUG: ${slug}`));
    if (slug !== 'azure-deployment-investigator') {
      const companyConfig = JSON.parse(await readFile(join('blueprints', slug, 'config.json'), 'utf8'));
      const labels = source.match(/^  labels: \[([^\]]+)\]/m)[1].split(',').map(label => label.trim());
      assert.deepEqual(labels, companyConfig.trigger_labels);
    }
    await assert.rejects(() => access(join(directory, `${id}.yml`)));
  }
  const runtime = await readFile(join('blueprints', 'shared', 'blueprint-runtime.md'), 'utf8');
  assert.match(runtime, /engine: copilot/);
  assert.match(runtime, /mode: gh-proxy/);
  assert.match(runtime, /pull-request: false/);
  assert.match(runtime, /edit: false/);
  assert.match(runtime, /allowed: \[\]/);
  assert.match(runtime, /upload-artifact:/);
  assert.match(runtime, /create-issue: false/);
});

test('validation stages the same source layout adopters install, without generated locks', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'blueprint-stage-test-'));
  try {
    await stageWorkflowSources(folder);
    const files = await readdir(folder);
    assert.equal(files.filter(file => file.endsWith('.md')).length, 9);
    assert.equal(files.filter(file => file.endsWith('.lock.yml')).length, 0);
    for (const slug of Object.keys(tasks)) {
      const id = slug.replace(/^github-/, '');
      const source = await readFile(join(folder, `${id}.md`), 'utf8');
      assert.equal(source, await readFile(join('blueprints', slug, `${id}.md`), 'utf8'));
      for (const match of source.matchAll(/^\s+- (shared\/[^\s]+\.md)$/gm)) {
        await access(join(folder, match[1]));
      }
    }
  } finally { await rm(folder, { recursive: true, force: true }); }
});

test('draft, closed, wrong-kind, and unrequested issue events are out of scope', () => {
  const pr = { head: { repo: { full_name: 'sample/repo' } } };
  assert.equal(enabledForEvent('github-pr-review', { action: 'opened', pull_request: { ...pr, draft: true } },
    'pull_request', 'sample/repo', config), false);
  assert.equal(enabledForEvent('github-issue-triage', { action: 'reopened', issue: { state: 'closed' } },
    'issues', 'sample/repo', config), false);
  assert.equal(enabledForEvent('requirements-gap-investigator', { action: 'labeled', pull_request: pr },
    'pull_request', 'sample/repo', config), false);
  assert.equal(enabledForEvent('delivery-risk-investigator', { action: 'opened', issue: {} },
    'issues', 'sample/repo', config), false);
});

test('a current failure cannot be hidden by citing only a passing scenario report', () => {
  const evidence = sampleEvidence('pr-confidence-calculator');
  const passing = { sha: evidence.candidate, conclusion: 'success', scenarios: [{ name: 'one', result: 'passed' }] };
  evidence.sources.push({ id: 'pass', kind: 'test-report', data: passing },
    { id: 'fail', kind: 'test-report', data: { ...passing, conclusion: 'failure' } });
  const dimension = { score: 90, sources: ['request'], reason: 'Scoped change.' };
  const result = { ...report(), dimensions: { scope: dimension, execution: {
    score: 100, sources: ['pass'], reason: 'Only pass cited.',
  }, scenarios: null, review: dimension } };
  validateReport('pr-confidence-calculator', result, evidence);
  assert.equal(result.dimensions.execution.score, 0);
  assert.ok(result.dimensions.execution.sources.includes('fail'));
});
