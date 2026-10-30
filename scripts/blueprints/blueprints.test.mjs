import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { stageWorkflowSources, tiers, workflowSources } from './validate.mjs';

const sources = await workflowSources();

function frontmatterOf(source) {
  return source.split(/^---\r?$/m)[1];
}

test('blueprints are limited to the beginner tier', async () => {
  assert.ok((await readFile(join('blueprints', 'README.md'), 'utf8')).length > 100);
  for (const tier of tiers) {
    assert.ok((await readFile(join('blueprints', tier, 'README.md'), 'utf8')).length > 100, `${tier}: missing README`);
  }
  const unexpected = (await readdir('blueprints', { withFileTypes: true }))
    .filter(entry => entry.isDirectory() && !tiers.includes(entry.name));
  assert.deepEqual(unexpected, []);
  assert.ok(sources.length > 0);
});

test('each blueprint README explains setup, use, and safety in plain sections', async () => {
  const sections = ['What it does', 'Before you start', 'Set it up', 'Try it', "What you'll see", 'Change it', 'Safety'];
  for (const { tier, slug, id } of sources) {
    const readme = await readFile(join('blueprints', tier, slug, 'README.md'), 'utf8');
    for (const section of sections) assert.ok(readme.includes(`## ${section}`), `${slug}: missing ${section}`);
    assert.ok(readme.includes(`gh aw compile ${id}`), `${slug}: missing compile command`);
    assert.ok(readme.includes('running-workflows.md#copilot-licence-and-authentication-requirements'));
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

test('beginner workflows only read the repository and write through one safe output', async () => {
  for (const { path, slug, tier } of sources.filter(source => source.tier === 'beginner')) {
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
    assert.equal(outputs.length, 1, `${slug}: ${tier} workflows use exactly one safe output`);
    assert.ok(['add-comment', 'create-issue'].includes(outputs[0]), `${slug}: unexpected ${outputs[0]}`);
    assert.match(safeOutputs, /^    max: 1$/m);
  }
});

test('release notes require changed-file evidence and prohibit generic claims', async () => {
  const source = await readFile(
    join('blueprints', 'beginner', 'plain-language-release-notes', 'plain-language-release-notes.md'),
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

test('documentation local links resolve', async () => {
  const files = ['README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'SUPPORT.md', 'CODE_OF_CONDUCT.md'];
  async function collect(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const path = join(folder, entry.name);
      if (entry.isDirectory()) await collect(path);
      else if (entry.name.endsWith('.md')) files.push(path);
    }
  }
  for (const folder of ['blueprints', 'docs', 'templates', 'patterns']) await collect(folder);
  for (const file of files) {
    const markdown = await readFile(file, 'utf8');
    for (const match of markdown.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)) {
      const target = match[1].split('#')[0];
      if (!target || /^https?:\/\//.test(target)) continue;
      await assert.doesNotReject(() => access(resolve(dirname(file), target)), `${file}: broken link ${target}`);
    }
  }
});

test('a single copied Markdown file per blueprint is all the compiler staging needs', async () => {
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
