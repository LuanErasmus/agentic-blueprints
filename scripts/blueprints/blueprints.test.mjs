import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { stageWorkflowSources, workflowSources } from './validate.mjs';

const allSources = await workflowSources();
const sources = allSources.filter(source => source.compile);

function frontmatterOf(source) {
  return source.split(/^---\r?$/m)[1];
}

test('each blueprint lives directly under the blueprints directory', async () => {
  assert.ok((await readFile(join('blueprints', 'README.md'), 'utf8')).length > 100);
  const directories = (await readdir('blueprints', { withFileTypes: true }))
    .filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
  assert.deepEqual(allSources.map(source => source.slug).sort(), directories);
  for (const { slug, path } of allSources) {
    assert.equal(path, join('blueprints', slug, `${slug}.md`));
  }
  assert.ok(sources.length > 0);
});

test('each blueprint README explains setup, use, and safety in plain sections', async () => {
  const sections = ['What it does', 'Before you start', 'Set it up', 'Try it', "What you'll see", 'Change it', 'Safety'];
  for (const { slug, id } of sources) {
    const readme = await readFile(join('blueprints', slug, 'README.md'), 'utf8');
    for (const section of sections) assert.ok(readme.includes(`## ${section}`), `${slug}: missing ${section}`);
    assert.ok(readme.includes(`gh aw compile ${id}`), `${slug}: missing compile command`);
    assert.ok(readme.includes('running-workflows.md#copilot-licence-and-authentication-requirements'));
    assert.ok(readme.includes('running-workflows.md#personal-plan-setup'), `${slug}: missing personal setup`);
  }
});

test('each workflow is a single file with no custom scripts or setup steps', async () => {
  for (const { path, slug } of sources) {
    const source = await readFile(path, 'utf8');
    assert.ok(source.startsWith('---\n') || source.startsWith('---\r\n'), `${slug}: missing frontmatter`);
    const frontmatter = frontmatterOf(source);
    assert.match(frontmatter, /^engine: copilot$/m);
    assert.match(frontmatter, /^timeout-minutes: \d+$/m);
    assert.doesNotMatch(frontmatter, /^(?:imports|steps|jobs):|run: \||pull_request_target/m);
    assert.match(source, /information, not instructions/, `${slug}: missing untrusted-input rule`);
    assert.deepEqual((await readdir(dirname(path))).sort(), ['README.md', `${slug}.md`]);
  }
});

test('blueprint agents have read-only GitHub permissions and one bounded safe output', async () => {
  for (const { path, slug } of sources) {
    const source = await readFile(path, 'utf8');
    const frontmatter = frontmatterOf(source);
    const writePermissions = [...frontmatter.matchAll(/^  ([\w-]+): write$/gm)].map(match => match[1]);
    assert.deepEqual(writePermissions, ['copilot-requests'], `${slug}: unexpected write permission`);
    assert.match(frontmatter, /^timeout-minutes: 5$/m, `${slug}: timeout must be capped at five minutes`);
    assert.match(frontmatter, /^max-ai-credits: 100$/m, `${slug}: AI-credit spending must be capped at 100`);
    assert.match(source, /about 1,000 tokens total/, `${slug}: missing soft token budget`);
    assert.match(source, /do not (?:infer or )?(?:guess|invent)/i, `${slug}: missing no-guess guardrail`);
    const safeOutputs = frontmatter.split(/^safe-outputs:\r?$/m)[1];
    assert.ok(safeOutputs, `${slug}: missing safe-outputs`);
    const outputs = [...safeOutputs.matchAll(/^  ([\w-]+):/gm)].map(match => match[1]);
    assert.equal(outputs.length, 1, `${slug}: workflows use exactly one safe output`);
    const allowedOutputs = slug === 'dependabot-readiness'
      ? ['create-pull-request']
      : ['add-comment', 'create-issue'];
    assert.ok(allowedOutputs.includes(outputs[0]), `${slug}: unexpected ${outputs[0]}`);
    assert.match(safeOutputs, /^    max: 1$/m);
  }
});

test('Dependabot PRs are restricted to one configuration file and preserve review boundaries', async () => {
  const source = await readFile(
    join('blueprints', 'dependabot-readiness', 'dependabot-readiness.md'), 'utf8',
  );
  const frontmatter = frontmatterOf(source);
  assert.match(frontmatter, /^  edit:$/m);
  assert.match(frontmatter, /^  pull-requests: read$/m);
  assert.match(frontmatter, /ref: \$\{\{ github\.event\.repository\.default_branch \}\}/);
  assert.match(frontmatter, /base-branch: \$\{\{ github\.event\.repository\.default_branch \}\}/);
  assert.match(frontmatter, /^    draft: true$/m);
  assert.match(frontmatter, /^    fallback-as-issue: false$/m);
  assert.match(frontmatter, /^    max-patch-files: 1$/m);
  assert.match(frontmatter,
    /    allowed-files:\r?\n      - \.github\/dependabot\.yml\r?\n      - \.github\/dependabot\.yaml\r?\n    protected-files:/);
  assert.match(frontmatter,
    /    protected-files:\r?\n      policy: blocked\r?\n      exclude:\r?\n        - \/\.github\/dependabot\.yml\r?\n        - \/\.github\/dependabot\.yaml/);
  for (const level of ['major', 'minor', 'patch']) {
    assert.match(source, new RegExp(
      `     ${level}:\\r?\\n       applies-to: version-updates\\r?\\n       patterns: \\["\\*"\\]\\r?\\n       update-types: \\["${level}"\\]`,
    ));
  }
  assert.match(source, /     security:\r?\n       applies-to: security-updates\r?\n       patterns: \["\*"\]/);
  assert.match(source, /Do not restrict security fixes by version level/);
  assert.match(source, /Omit the security group for ecosystems without Dependabot security-update support/);
  assert.match(source, /Do not claim grouping enables security updates/i);
  assert.match(source, /do not add security groups to non-default `target-branch` entries/i);
  assert.match(source, /Do not add a separate update entry for every workspace/);
  assert.match(source, /If both exist, parsing fails, the file listing is incomplete/);
  assert.match(source, /do not create a duplicate or overwrite another person's branch/);
  assert.match(source, /Preserve existing schedules, registries, secret references, allow\/ignore rules/);
  assert.match(source, /first matching group wins/);
  assert.match(source, /configuration already meets these requirements/);
  assert.match(source, /Do not execute repository code or modify manifests, lockfiles, workflows, or repository settings/);
});

test('repository checks run weekly with manual testing available', async () => {
  for (const slug of ['dependabot-readiness', 'docs-drift-report', 'workflow-permission-check', 'actions-health-report']) {
    const source = await readFile(join('blueprints', slug, `${slug}.md`), 'utf8');
    const frontmatter = frontmatterOf(source);
    assert.match(frontmatter, /^  schedule: weekly on monday(?: #.*)?$/m, `${slug}: missing automatic schedule`);
    assert.match(frontmatter, /^  workflow_dispatch:$/m, `${slug}: missing manual trigger`);
    const readme = await readFile(join('blueprints', slug, 'README.md'), 'utf8');
    assert.match(readme, /Every Monday/);
    assert.match(readme, /weekly on friday/);
  }
});

test('CI diagnosis monitors failed default-branch runs and targets the triggering run', async () => {
  const source = await readFile(
    join('blueprints', 'ci-failure-explainer', 'ci-failure-explainer.md'), 'utf8',
  );
  const frontmatter = frontmatterOf(source);
  assert.match(frontmatter, /^  workflow_run:$/m);
  assert.match(frontmatter, /workflows: \["CI"\] # Required:/);
  assert.match(frontmatter, /types: \[completed\]/);
  assert.match(frontmatter, /branches: \[main\]/);
  assert.match(frontmatter, /^  workflow_dispatch:$/m);
  assert.match(frontmatter, /github\.event_name == 'workflow_dispatch' \|\|/);
  assert.match(frontmatter, /github\.event\.workflow_run\.conclusion == 'failure'/);
  assert.match(frontmatter, /head_branch == github\.event\.repository\.default_branch/);
  assert.match(frontmatter, /head_repository\.full_name == github\.repository/);
  assert.match(source, /investigate only the run identified by `\$\{\{ github\.event\.workflow_run\.id \}\}`/);
  assert.match(source, /Do not substitute a newer failure/);
  assert.match(source, /download artifacts, check out the failed run's code, or execute repository code/);
  const readme = await readFile(
    join('blueprints', 'ci-failure-explainer', 'README.md'), 'utf8',
  );
  assert.match(readme, /exact top-level `name:`/);
  assert.match(readme, /workflows: \["Build and Test"\]/);
});

test('release notes require changed-file evidence and prohibit generic claims', async () => {
  const source = await readFile(
    join('blueprints', 'plain-language-release-notes', 'plain-language-release-notes.md'),
    'utf8',
  );
  assert.match(source, /inspect its changed-file list and focused diff evidence/);
  assert.match(source, /up to three relevant, non-generated files/);
  assert.match(source, /Every claim must be supported by the changed files or diff/);
  assert.match(source, /do not describe this workflow or its purpose unless that is the actual change in the linked PR/i);
  assert.match(source, /diff cannot be retrieved/);
  assert.match(source, /exactly one clearly linked pull request and it is still \*\*open\*\*, post one short comment/);
  assert.match(source, /Do not claim that merging the pull request alone will trigger this workflow again/);
});

test('PR suggestions skip drafts, superseded runs, and repeated comments', async () => {
  const source = await readFile(
    join('blueprints', 'pr-simplification-review', 'pr-simplification-review.md'), 'utf8',
  );
  const frontmatter = frontmatterOf(source);
  assert.match(frontmatter, /types: \[opened, synchronize, ready_for_review\]/);
  assert.match(frontmatter, /^if: github\.event\.pull_request\.draft == false$/m);
  assert.match(frontmatter, /group: gh-aw-\$\{\{ github\.workflow \}\}-\$\{\{ github\.event\.pull_request\.number \}\}/);
  assert.match(frontmatter, /^  cancel-in-progress: true$/m);
  assert.match(source, /at most twenty recent conversation comments/);
  assert.match(source, /same simplification for the same code/);
  assert.match(source, /comments cannot be checked completely within this limit/);
  assert.match(source, /same head SHA as the triggering event/);
  assert.match(source, /<!-- blueprint:pr-simplification-review -->/);
});

test('CI diagnoses search for existing failures and provide confirmation criteria', async () => {
  const source = await readFile(
    join('blueprints', 'ci-failure-explainer', 'ci-failure-explainer.md'), 'utf8',
  );
  assert.match(frontmatterOf(source), /toolsets: \[actions, repos, issues\]/);
  assert.match(source, /one concrete confirmation step/);
  assert.match(source, /expected observation that would support or reject/);
  assert.match(source, /returning at most five matches without pagination/);
  assert.match(source, /failed job and distinctive error, not just similar titles/);
  assert.match(source, /If this check fails or the results are incomplete/);
  assert.match(source, /Do not comment on or update the existing issue/);
});

test('release notes distinguish repeated merged notes from waiting messages', async () => {
  const source = await readFile(
    join('blueprints', 'plain-language-release-notes', 'plain-language-release-notes.md'), 'utf8',
  );
  assert.match(source, /up to twenty recent comments once/);
  assert.match(source, /comment check fails or is incomplete within the limit/);
  assert.match(source, /repository, number, and merge commit SHA/);
  assert.match(source, /A waiting message is not a completed release note/);
  assert.match(source, /blueprint:plain-language-release-notes pending:OWNER\/REPO#NUMBER/);
  assert.match(source, /blueprint:plain-language-release-notes merged:OWNER\/REPO#NUMBER@SHA/);
  assert.match(source, /Keep this technical bookkeeping hidden/);
});

test('Actions health counts unfinished runs separately and bounds timing claims', async () => {
  const source = await readFile(
    join('blueprints', 'actions-health-report', 'actions-health-report.md'), 'utf8',
  );
  assert.match(source, /Exclude runs of this reporting workflow by its workflow ID or path/);
  assert.match(source, /Do not fetch replacement runs or paginate/);
  assert.match(source, /queued, waiting, and in-progress runs separately as unfinished/);
  assert.match(source, /separate "other" count/);
  assert.match(source, /longest timed run in the sample/);
  assert.match(source, /Exclude queue time and unfinished runs/);
  assert.match(source, /timing coverage is partial/);
});

test('weekly summaries exclude report issues without dropping useful automation', async () => {
  const source = await readFile(
    join('blueprints', 'weekly-update', 'weekly-update.md'), 'utf8',
  );
  for (const prefix of ['weekly update', 'Actions health', 'CI diagnosis', 'documentation check', 'workflow permissions']) {
    assert.ok(source.includes(`\`[${prefix}]\``), `missing report filter: ${prefix}`);
  }
  assert.match(source, /filter the returned sample without fetching replacements/);
  assert.match(source, /Do not exclude substantive dependency PRs or all bot-authored work/);
  assert.match(source, /eligible items were reviewed in each category after filtering/);
  assert.match(source, /never claim nothing happened across the repository/);
});

test('documentation and permission findings require focused, complete evidence', async () => {
  const docs = await readFile(
    join('blueprints', 'docs-drift-report', 'docs-drift-report.md'), 'utf8',
  );
  assert.match(docs, /rather than automatically choosing the newest/);
  assert.match(docs, /up to two related documentation pages/);
  assert.match(docs, /suggested replacement sentence as a draft/);
  assert.match(docs, /If an exact replacement is not supported, omit it/);
  const permissions = await readFile(
    join('blueprints', 'workflow-permission-check', 'workflow-permission-check.md'), 'utf8',
  );
  assert.match(permissions, /job-level `permissions` overrides workflow-level permissions/);
  assert.match(permissions, /omitted scopes in an explicit mapping are `none`/);
  assert.match(permissions, /reusable workflows called with job-level `uses:`/);
  assert.match(permissions, /"needs verification", not "unused"/);
  assert.match(permissions, /Unknown action requirements alone do not justify opening an issue/);
});

test('issue questions and Dependabot summaries are tailored to available evidence', async () => {
  const issue = await readFile(join('blueprints', 'issue-helper', 'issue-helper.md'), 'utf8');
  assert.match(issue, /Do not ask for details already provided/);
  assert.match(issue, /placeholder text such as "No response" are not answers/);
  assert.match(issue, /at most two questions/);
  const readme = await readFile(join('blueprints', 'issue-helper', 'README.md'), 'utf8');
  assert.equal([...readme.matchAll(/^> \d+\. /gm)].length, 2);
  const dependabot = await readFile(
    join('blueprints', 'dependabot-readiness', 'dependabot-readiness.md'), 'utf8',
  );
  assert.match(dependabot, /`Ecosystem`, `Directories`, `Grouping change`, and `Security limitations`/);
  assert.match(dependabot, /Distinguish added, updated, and unchanged coverage/);
});

test('instruction-aligned blueprints bound duplicate checks and mutable evidence', async () => {
  for (const slug of ['actions-health-report', 'docs-drift-report', 'workflow-permission-check', 'weekly-update']) {
    const source = await readFile(join('blueprints', slug, `${slug}.md`), 'utf8');
    assert.match(source, /at most five open/);
    assert.match(source, /incomplete/);
    assert.match(frontmatterOf(source), /toolsets: \[[^\]]*issues/);
  }
  const dependabot = await readFile(join('blueprints', 'dependabot-readiness', 'dependabot-readiness.md'), 'utf8');
  assert.match(dependabot, /at most 500 paths/);
  assert.match(dependabot, /at most twenty relevant manifests/);
  assert.match(dependabot, /at most twenty open PRs/);
  assert.match(dependabot, /recheck the default-branch commit SHA once/);
  assert.match(dependabot, /under 300 words/);
  const issue = await readFile(join('blueprints', 'issue-helper', 'issue-helper.md'), 'utf8');
  assert.match(issue, /at most twenty recent comments/);
  assert.match(issue, /same title and body/);
  assert.match(issue, /blueprint:issue-helper/);
  const ci = await readFile(join('blueprints', 'ci-failure-explainer', 'ci-failure-explainer.md'), 'utf8');
  assert.match(ci, /at most twenty job summaries/);
  assert.match(ci, /at most 100 lines/);
  assert.match(ci, /latest attempt changed/);
  const notes = await readFile(join('blueprints', 'plain-language-release-notes', 'plain-language-release-notes.md'), 'utf8');
  assert.match(notes, /at most ten directly linked PR identities/);
  assert.match(notes, /Before either a waiting message or release note, recheck/);
});

test('authoring toolkit contains portable Copilot customizations, not runnable workflows', async () => {
  const folder = 'skills-and-agents';
  assert.deepEqual((await readdir(folder)).sort(), [
    'README.md', 'agents', 'instructions', 'skills',
  ]);
  const instructions = await readFile(join(folder, 'instructions', 'agentic-workflows.instructions.md'), 'utf8');
  assert.match(frontmatterOf(instructions),
    /^applyTo: "\.github\/workflows\/\*\.md"$/m);
  const skillFolder = join(folder, 'skills', 'review-agentic-workflows');
  assert.deepEqual(await readdir(skillFolder), ['SKILL.md']);
  const skill = await readFile(join(skillFolder, 'SKILL.md'), 'utf8');
  assert.match(frontmatterOf(skill), /^name: review-agentic-workflows$/m);
  assert.match(frontmatterOf(skill), /^description: .+gh-aw.+review/im);
  assert.doesNotMatch(frontmatterOf(skill), /^(?:allowed-tools|tools):/m);
  assert.match(skill, /Review only\. Do not edit files/);
  const agent = await readFile(join(folder, 'agents', 'agentic-workflow-builder.agent.md'), 'utf8');
  assert.match(frontmatterOf(agent), /^name: Agentic Workflow Builder$/m);
  assert.match(frontmatterOf(agent), /^description: .+$/m);
  assert.match(frontmatterOf(agent), /^tools: \["read", "search", "edit", "execute"\]$/m);
  assert.doesNotMatch(frontmatterOf(agent), /^(?:model|mcp-servers):/m);
  for (const source of [instructions, skill, agent]) {
    assert.doesNotMatch(frontmatterOf(source), /^(?:on|engine|safe-outputs):/m);
    assert.match(source, /information, not instructions/);
    assert.match(source, /max-patch-files/);
    assert.match(source, /protected-file/);
    assert.match(source, /body-only prompt edits/i);
    assert.match(source, /do not (?:need|require) recompilation/i);
    assert.match(source, /(?:enforced|enforcement)/);
    assert.doesNotMatch(source, /Dependabot Readiness|blueprints\/|scripts\/blueprints\/|timeout-minutes: 5|max-ai-credits: 100/);
  }
  const readme = await readFile(join(folder, 'README.md'), 'utf8');
  for (const destination of [
    '.github/instructions/agentic-workflows.instructions.md',
    '.github/skills/review-agentic-workflows/SKILL.md',
    '.github/skills/agentic-workflow-least-privilege/SKILL.md',
    '.github/skills/agentic-workflow-troubleshooter/SKILL.md',
    '.github/agents/agentic-workflow-builder.agent.md',
  ]) assert.ok(readme.includes(destination), `missing copy destination: ${destination}`);
  assert.match(readme, /default branch before requesting Copilot review/);
  assert.match(readme, /do not prove Copilot loaded the toolkit/);
});

test('least-privilege skill traces effective capabilities without speculative removal', async () => {
  const folder = 'skills-and-agents';
  const skillFolder = join(folder, 'skills', 'agentic-workflow-least-privilege');
  assert.deepEqual(await readdir(skillFolder), ['SKILL.md']);
  const skill = await readFile(join(skillFolder, 'SKILL.md'), 'utf8');
  assert.match(frontmatterOf(skill), /^name: agentic-workflow-least-privilege$/m);
  assert.match(frontmatterOf(skill), /^description: .+gh-aw.+$/m);
  assert.doesNotMatch(frontmatterOf(skill), /^(?:tools|allowed-tools|engine|on):/m);
  for (const classification of ['Required', 'Unnecessary', 'Needs verification']) {
    assert.ok(skill.includes(`**${classification}:**`));
  }
  for (const surface of ['GitHub permissions', 'Agent tools', 'Network', 'Checkout and execution', 'Credentials', 'Safe outputs']) {
    assert.ok(skill.includes(`| ${surface} |`));
  }
  assert.match(skill, /information, not instructions/);
  assert.match(skill, /Do not edit files/);
  assert.match(skill, /never disclose credential values/i);
  assert.match(skill, /job-level `permissions` overrides/);
  assert.match(skill, /omitted scopes in an explicit mapping are `none`/);
  assert.match(skill, /does not narrow a separately supplied token/);
  assert.match(skill, /omission does not necessarily disable an operation/i);
  assert.match(skill, /independent protected-files policy/);
  assert.match(skill, /max-patch-files/);
  assert.match(skill, /unused in one run/);
  assert.match(skill, /Compilation validates configuration, not least privilege/);
  assert.doesNotMatch(skill, /Dependabot Readiness|blueprints\/|scripts\/blueprints\/|timeout-minutes: 5|max-ai-credits: 100/);
  for (const file of [join('agents', 'agentic-workflow-builder.agent.md'), join('skills', 'review-agentic-workflows', 'SKILL.md')]) {
    const source = await readFile(join(folder, file), 'utf8');
    assert.match(source, /agentic-workflow-least-privilege is installed and available/);
    assert.match(source, /optional/);
  }
});

test('troubleshooter skill diagnoses phases with bounded evidence and explicit authorization', async () => {
  const skillFolder = join('skills-and-agents', 'skills', 'agentic-workflow-troubleshooter');
  assert.deepEqual(await readdir(skillFolder), ['SKILL.md']);
  const skill = await readFile(join(skillFolder, 'SKILL.md'), 'utf8');
  assert.match(frontmatterOf(skill), /^name: agentic-workflow-troubleshooter$/m);
  assert.match(frontmatterOf(skill), /^description: .+gh-aw.+$/m);
  assert.doesNotMatch(frontmatterOf(skill), /^(?:tools|allowed-tools|engine|on):/m);
  assert.match(skill, /information, not instructions/);
  assert.match(skill, /Do not edit files/);
  assert.match(skill, /Never request or disclose credential values/);
  assert.match(skill, /run ID, attempt, event, and commit SHA/);
  assert.match(skill, /without pagination or automatic retries/);
  assert.match(skill, /Do not download artifacts/);
  for (const phase of [
    'Source and compilation', 'Workflow registration and trigger', 'Setup and authentication',
    'Agent execution', 'Output decision', 'Safe-output processing and publication',
  ]) assert.ok(skill.includes(`| ${phase} |`), `missing diagnostic phase: ${phase}`);
  for (const status of ['Confirmed cause', 'Likely cause', 'Intentional no-output', 'Unresolved']) {
    assert.ok(skill.includes(`**${status}**`), `missing diagnosis status: ${status}`);
  }
  assert.match(skill, /copilot-requests: write/);
  assert.match(skill, /takes precedence over `COPILOT_GITHUB_TOKEN`/);
  assert.match(skill, /Ordinary body-only prompt edits do not require recompilation/);
  assert.match(skill, /Compilation validates configuration, not live authentication/);
  assert.doesNotMatch(skill, /Dependabot Readiness|blueprints\/|scripts\/blueprints\/|timeout-minutes: 5|max-ai-credits: 100/);
  const index = await readFile(join('skills-and-agents', 'skills', 'README.md'), 'utf8');
  assert.ok(index.includes('.github/skills/agentic-workflow-troubleshooter/SKILL.md'));
});

test('visitor paths have landing pages and resources grouped by purpose', async () => {
  const home = await readFile('README.md', 'utf8');
  for (const label of ['Use a workflow', 'Build your own', 'Learn']) {
    assert.ok(home.includes(`**${label}**`), `missing visitor path: ${label}`);
  }
  for (const folder of [
    'docs', join('docs', 'patterns'),
    join('skills-and-agents', 'instructions'),
    join('skills-and-agents', 'skills'),
    join('skills-and-agents', 'agents'),
  ]) {
    assert.ok((await readFile(join(folder, 'README.md'), 'utf8')).length > 100);
  }
  await access(join('docs', 'templates', 'blueprint-template', 'README.md'));
  for (const oldPath of ['patterns', 'templates', join('skills-and-agents', 'agentic-workflow-authoring')]) {
    await assert.rejects(() => access(oldPath), { code: 'ENOENT' });
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
  for (const folder of ['blueprints', 'docs', 'skills-and-agents']) await collect(folder);
  for (const file of files) {
    const markdown = await readFile(file, 'utf8');
    for (const match of markdown.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)) {
      const target = match[1].split('#')[0];
      if (!target || /^https?:\/\//.test(target)) continue;
      await assert.doesNotReject(() => access(resolve(dirname(file), target)), `${file}: broken link ${target}`);
    }
  }
});

test('Into Azure demo distributes all trusted contracts without compilation or locks', async () => {
  const slug = 'into-azure-cost-reviewer';
  const folder = join('blueprints', slug);
  const demo = allSources.find(source => source.slug === slug);
  assert.ok(demo);
  assert.equal(demo.compile, false);
  const workflow = await readFile(demo.path, 'utf8');
  const frontmatter = frontmatterOf(workflow);
  assert.match(frontmatter, /^name: Into Azure Cost Reviewer$/m);
  assert.match(frontmatter, /^timeout-minutes: 30$/m);
  assert.match(frontmatter, /^  copilot-sdk: true$/m);
  assert.match(frontmatter, /^  bare: true$/m);
  assert.match(frontmatter, /^  copilot-requests: write$/m);
  assert.match(frontmatter, /^    max: 1$/m);
  assert.match(frontmatter, /^    replace-older-comments: true$/m);
  assert.match(frontmatter, /ref: "\$\{\{ github\.event\.pull_request\.base\.sha \}\}"/);
  assert.doesNotMatch(frontmatter, /pull_request_target|workflow_dispatch/);
  const contracts = [
    join('agents', '01-investigator.agent.md'),
    join('agents', '02-finops.agent.md'),
    join('agents', '03-architect.agent.md'),
    join('cost-review', 'review-process.md'),
    join('cost-review', 'output-format.md'),
    join('cost-review', 'cost-policy.md'),
    join('cost-review', 'cost-policy.yml'),
  ];
  const readme = await readFile(join(folder, 'README.md'), 'utf8');
  for (const section of ['What it does', 'Before you start', 'Set it up', 'Try it', "What you'll see", 'Change it', 'Safety']) {
    assert.ok(readme.includes(`## ${section}`), `demo: missing ${section}`);
  }
  for (const contract of contracts) {
    assert.ok((await readFile(join(folder, contract), 'utf8')).length > 50);
    const portablePath = contract.split('\\').join('/');
    const destination = portablePath.startsWith('agents/')
      ? portablePath.replace('agents/', '.github/workflows/')
      : `.github/${portablePath}`;
    assert.ok(workflow.includes(destination), `missing workflow contract: ${contract}`);
    assert.ok(readme.includes(portablePath), `missing copy instructions: ${contract}`);
    assert.ok(readme.includes(destination), `missing copy destination: ${contract}`);
  }
  const process = await readFile(join(folder, 'cost-review', 'review-process.md'), 'utf8');
  assert.match(process, /Tool contract revision: `azure-cost-review-tools-v2`/);
  assert.match(workflow, /`azure-cost-review-tools-v2`/);
  assert.match(process, /investigator[\s\S]*finops[\s\S]*architect/);
  assert.match(process, /Cost assessment only; no GitHub PR approval was submitted/);
  assert.match(readme, /gh aw compile into-azure-cost-reviewer --validate --strict/);
  assert.match(readme, /personal-plan-setup/);
  assert.match(readme, /No compilation or lock file is supplied/);
  const policy = await readFile(join(folder, 'cost-review', 'cost-policy.yml'), 'utf8');
  assert.match(policy, /^currency: USD$/m);
  assert.match(policy, /^max_monthly_increase: 50$/m);
  assert.match(policy, /^max_yearly_increase: 1000$/m);
  const files = [];
  async function collect(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await collect(path);
      else files.push(path);
    }
  }
  await collect(folder);
  assert.deepEqual(files.sort(), [
    join(folder, 'README.md'), demo.path,
    ...contracts.map(path => join(folder, path)),
  ].sort());
});

test('compiler staging includes standard single-file sources and excludes the Into Azure demo', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'blueprint-stage-test-'));
  try {
    await stageWorkflowSources(folder);
    assert.equal((await readdir(folder)).length, sources.length);
    for (const { id, path } of sources) {
      assert.equal(await readFile(join(folder, `${id}.md`), 'utf8'), await readFile(path, 'utf8'));
    }
  } finally { await rm(folder, { recursive: true, force: true }); }
});

test('the distribution contains no executable blueprint workflows or generated locks', async () => {
  assert.deepEqual(await readdir(join('.github', 'workflows')), ['validate-blueprints.yml']);
  for (const { path } of sources) {
    assert.ok(!(await readdir(dirname(path))).some(file => file.endsWith('.lock.yml')));
  }
  assert.deepEqual((await readdir(join('scripts', 'blueprints'))).sort(),
    ['blueprints.test.mjs', 'validate.mjs']);
});
