import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { stageWorkflowSources, workflowSources } from './validate.mjs';

const sources = await workflowSources();

function inlineScripts(source) {
  const scripts = [];
  let lines;
  for (const line of [...source.split(/\r?\n/), '']) {
    if (line === '    run: |') lines = [];
    else if (lines && line.startsWith('      ')) lines.push(line.slice(6));
    else if (lines) { scripts.push(lines.join('\n')); lines = undefined; }
  }
  return scripts;
}

test('all nine blueprints document usage, eligibility, and illustrative input/output', async () => {
  assert.equal(sources.length, 9);
  const sections = ['Problem', 'What the Agent Does', 'Architecture', 'Prerequisites',
    'Setup', 'Run It', 'How It Works', 'Guardrails', 'Customise It', 'Challenge'];
  for (const { slug, id } of sources) {
    const root = join('blueprints', slug);
    const readme = await readFile(join(root, 'README.md'), 'utf8');
    for (const section of sections) assert.ok(readme.includes(`## ${section}`), `${slug}: missing ${section}`);
    assert.ok(readme.includes(`gh aw compile ${id}`), `${slug}: missing compile command`);
    assert.match(readme, /Copilot Business/);
    assert.match(readme, /Copilot Enterprise/);
    assert.match(readme, /copilot-requests: write/);
    assert.ok(readme.includes('running-workflows.md#copilot-licence-and-authentication-requirements'));
    for (const file of ['input.md', 'output.md']) {
      assert.ok((await readFile(join(root, 'examples', file), 'utf8')).length > 100, `${slug}: empty ${file}`);
    }
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

test('each workflow is a single file with no custom runtime dependencies', async () => {
  for (const { path, slug } of sources) {
    const source = await readFile(path, 'utf8');
    assert.ok(source.startsWith('---\n') || source.startsWith('---\r\n'), `${slug}: missing frontmatter`);
    assert.doesNotMatch(source, /^imports:|scripts\/blueprints|config\.json|BLUEPRINT_|sample:/m);
    assert.match(source, /engine: copilot/);
    assert.match(source, /strict: true/);
    assert.match(source, /checkout: false/);
    assert.match(source, /copilot-requests: write/);
    assert.match(source, /report-blocked-version: false/);
    assert.match(source, /roles: \[admin, maintainer, write/);
    assert.match(source, /github\.event\.repository\.default_branch/);
    assert.match(source, /allowed: \[\]/);
    assert.match(source, /untrusted evidence/);
    assert.match(source, /missing-data\/tool/);
    assert.match(source, slug === 'stakeholder-release-notes-generator' ? /add_comment/ : /upload_artifact/);
    await assert.rejects(() => access(join(dirname(path), 'config.json')));
  }
});

test('reports are artifacts (or one labelled-issue comment), with no other repository-write safe outputs', async () => {
  for (const { path, slug } of sources) {
    const source = await readFile(path, 'utf8');
    const frontmatter = source.split(/^---\r?$/m)[1];
    assert.match(frontmatter, /create-issue: false/);
    assert.match(frontmatter, /report-failure-as-issue: false/);
    assert.match(frontmatter, /report-as-issue: false/);
    if (slug === 'stakeholder-release-notes-generator') {
      assert.match(frontmatter, /add-comment:\r?\n\s+max: 1\r?\n\s+target: "\*"/);
      assert.match(frontmatter, /required-labels: \[stakeholder-notes\]/);
      assert.doesNotMatch(frontmatter, /add-labels:|create-pull-request:|update-release:|upload-artifact:/);
    } else {
      assert.match(frontmatter, /max-uploads: 1/);
      assert.match(frontmatter, /retention-days: 7/);
      assert.match(frontmatter, /allowed-paths: \[report\.md\]/);
      assert.doesNotMatch(frontmatter, /add-comment:|add-labels:|create-pull-request:|update-release:/);
    }
    const writePermissions = [...frontmatter.matchAll(/^  ([\w-]+): write$/gm)].map(match => match[1]);
    assert.deepEqual(writePermissions.sort(), slug === 'azure-deployment-investigator'
      ? ['copilot-requests', 'id-token'] : ['copilot-requests']);
  }
});

test('event labels and required manual inputs stay usable without JSON configuration', async () => {
  const labels = {
    'github-issue-triage': 'triage-review',
    'github-pr-review': 'review-preparation',
    'requirements-gap-investigator': 'requirements-review',
    'test-scenario-planner': 'test-planning, test-review',
    'delivery-risk-investigator': 'delivery-risk-review',
    'release-readiness-helper': 'release-readiness',
    'pr-confidence-calculator': 'confidence-review',
    'stakeholder-release-notes-generator': 'stakeholder-notes',
  };
  for (const { slug, path } of sources.filter(source => source.slug in labels)) {
    const source = await readFile(path, 'utf8');
    assert.ok(source.includes(`labels: [${labels[slug]}]`));
    assert.match(source, /number:\r?\n\s+description:[^\n]+\r?\n\s+type: string\r?\n\s+required: true/);
    assert.match(source, /mode: gh-proxy/);
    assert.match(source, /gh api --method GET \*/);
    assert.doesNotMatch(source, /pull_request_target|^steps:/m);
    if (['github-pr-review', 'test-scenario-planner', 'pr-confidence-calculator'].includes(slug)) {
      assert.match(source, /github\.event\.pull_request\.draft == false/);
      assert.match(source, /head repository/);
    }
  }
  const planner = await readFile(join('blueprints', 'test-scenario-planner', 'test-scenario-planner.md'), 'utf8');
  assert.match(planner, /a PR has a `pull_request` field/);
});

test('confidence is explicitly advisory and retains unknown-evidence scoring safeguards', async () => {
  const source = await readFile(join('blueprints', 'pr-confidence-calculator', 'pr-confidence-calculator.md'), 'utf8');
  assert.match(source, /AI-assessed advisory index/);
  assert.match(source, /no deterministic/);
  assert.match(source, /at least THREE/);
  assert.match(source, /unknown dimensions\r?\ncontribute zero without redistributing/);
  assert.match(source, /48\/100/);
  assert.match(source, /failure makes execution\r?\nzero/);
  assert.match(source, /withhold the total and mark\r?\nthe assessment stale/);
});

test('release workflows require exact candidate or immutable change-range evidence', async () => {
  const readiness = await readFile(join('blueprints', 'release-readiness-helper', 'release-readiness-helper.md'), 'utf8');
  assert.match(readiness, /Candidate: <40-character SHA>/);
  assert.match(readiness, /absent human sign-off remain unknown/);
  const notes = await readFile(join('blueprints', 'stakeholder-release-notes-generator', 'stakeholder-release-notes-generator.md'), 'utf8');
  assert.match(notes, /merge-base SHA equal to BASE_SHA/);
  assert.match(notes, /Reject reversed\/divergent/);
  assert.match(notes, /withhold a complete-release draft/);
});

test('Azure collection is inline, read-only, scoped, and logged out before inference', async () => {
  const source = await readFile(join('blueprints', 'azure-deployment-investigator', 'azure-deployment-investigator.md'), 'utf8');
  const frontmatter = source.split(/^---\r?$/m)[1];
  assert.match(frontmatter, /uses: azure\/login@v2/);
  assert.match(frontmatter, /resource_group:[\s\S]*?required: true/);
  assert.match(frontmatter, /deployment_name:[\s\S]*?required: true/);
  assert.match(frontmatter, /AZURE_CONFIG_DIR: \$\{\{ runner\.temp \}\}/);
  assert.match(frontmatter, /RESOURCE_GROUP: \$\{\{ inputs\.resource_group \}\}/);
  assert.match(frontmatter, /DEPLOYMENT_NAME: \$\{\{ inputs\.deployment_name \}\}/);
  for (const script of inlineScripts(frontmatter)) assert.doesNotMatch(script, /\$\{\{/);
  assert.match(frontmatter, /az deployment group show/);
  assert.match(frontmatter, /az deployment operation group list/);
  assert.match(frontmatter, /--offset 24h --max-events 20/);
  assert.match(frontmatter, /"\$\{resource_id,,\}" != "\$\{scope,,\}"\*/);
  assert.match(frontmatter, /grep -Fq '\(ResourceNotFound\)'/);
  assert.match(frontmatter, /if: always\(\)/);
  assert.match(frontmatter, /trap 'az account clear' EXIT\r?\n\s+az logout/);
  assert.doesNotMatch(frontmatter, /az (?:deployment group create|resource delete|role assignment create)/);
  const tools = frontmatter.split('tools:')[1].split('safe-outputs:')[0];
  assert.match(tools, /cat \/tmp\/gh-aw\/azure\/\*/);
  assert.doesNotMatch(tools, /az |github:/);
});

test('Azure inline collection and cleanup have valid Bash syntax', async () => {
  const source = await readFile(join('blueprints', 'azure-deployment-investigator', 'azure-deployment-investigator.md'), 'utf8');
  const scripts = inlineScripts(source);
  assert.equal(scripts.length, 2);
  for (const script of scripts) {
    const result = spawnSync('bash', ['-n'], { input: script, encoding: 'utf8' });
    if (result.error) throw result.error;
    assert.equal(result.status, 0, result.stderr);
  }
});

test('Azure inline collection handles scoped reads, missing resources, and failures without live calls', async () => {
  const source = await readFile(join('blueprints', 'azure-deployment-investigator', 'azure-deployment-investigator.md'), 'utf8');
  const collection = inlineScripts(source)[0].replaceAll('/tmp/gh-aw/azure', '"$EVIDENCE"');
  const mocks = `
az() {
  printf '%s\\n' "$*" >> "$CALLS"
  case "$1 $2 $3" in
    "deployment group show") printf '{"name":"example","provisioningState":"Failed"}' ;;
    "deployment operation group")
      node -e 'process.stdout.write(JSON.stringify([{provisioningState:"Failed",targetResource:{id:process.env.RESOURCE_ID}}]))' ;;
    "monitor activity-log list") printf '[]' ;;
    "resource show --ids")
      case "$MODE" in
        missing) echo '(ResourceNotFound) no such resource' >&2; return 3 ;;
        denied) echo '(AuthorizationFailed) access denied' >&2; return 4 ;;
        *) printf '{"provisioningState":"Failed"}' ;;
      esac ;;
    *) echo "Unexpected Azure command" >&2; return 99 ;;
  esac
}
jq() {
  if [[ "$1" == "-r" ]]; then
    node -e 'const fs=require("node:fs");const rows=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));process.stdout.write(rows.find(row=>row.provisioningState==="Failed")?.targetResource?.id??"")' "$3"
  else
    node -e 'process.stdout.write(JSON.stringify({found:false,code:"ResourceNotFound",resourceId:process.argv[1]}))' "$4"
  fi
}
`;
  for (const mode of ['success', 'missing', 'denied', 'out-of-scope', 'invalid-input']) {
    const folder = await mkdtemp(join(tmpdir(), 'blueprint-azure-test-'));
    try {
      const evidence = join(folder, 'evidence');
      const calls = join(folder, 'calls.txt');
      const result = spawnSync('bash', ['-s'], {
        input: `${mocks}\n${collection}`,
        encoding: 'utf8',
        env: {
          ...process.env,
          MSYS_NO_PATHCONV: '1', MSYS2_ARG_CONV_EXCL: '*', MSYS2_ENV_CONV_EXCL: 'RESOURCE_ID',
          EVIDENCE: evidence.replaceAll('\\', '/'), CALLS: calls.replaceAll('\\', '/'),
          RESOURCE_GROUP: mode === 'invalid-input' ? 'rg;echo unsafe' : 'example-rg',
          DEPLOYMENT_NAME: 'example', SUBSCRIPTION_ID: 'test-subscription', MODE: mode,
          RESOURCE_ID: `/subscriptions/${mode === 'out-of-scope' ? 'other' : 'test-subscription'}/resourceGroups/example-rg/providers/Example/widgets/demo`,
        },
      });
      if (result.error) throw result.error;
      if (mode === 'invalid-input') {
        assert.notEqual(result.status, 0);
        assert.match(result.stdout, /Invalid resource group/);
        await assert.rejects(() => access(calls));
        continue;
      }
      const log = await readFile(calls, 'utf8');
      assert.match(log, /deployment group show --resource-group example-rg --name example/);
      assert.match(log, /--offset 24h --max-events 20/);
      if (mode === 'denied') {
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /AuthorizationFailed/);
      } else {
        assert.equal(result.status, 0, result.stderr);
        if (mode === 'missing') {
          assert.equal(JSON.parse(await readFile(join(evidence, 'resource.json'), 'utf8')).code, 'ResourceNotFound');
        } else if (mode === 'out-of-scope') {
          assert.doesNotMatch(log, /resource show/);
          assert.match(await readFile(join(evidence, 'resource-note.txt'), 'utf8'), /outside/);
        } else {
          assert.equal(JSON.parse(await readFile(join(evidence, 'resource.json'), 'utf8')).provisioningState, 'Failed');
        }
      }
    } finally { await rm(folder, { recursive: true, force: true }); }
  }
});

test('a single copied Markdown file per blueprint is all the compiler staging needs', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'blueprint-stage-test-'));
  try {
    await stageWorkflowSources(folder);
    assert.equal((await readdir(folder)).length, 9);
    for (const { id, path } of sources) {
      assert.equal(await readFile(join(folder, `${id}.md`), 'utf8'), await readFile(path, 'utf8'));
    }
  } finally { await rm(folder, { recursive: true, force: true }); }
});

test('the distribution contains no executable blueprint workflows or generated locks', async () => {
  const files = await readdir(join('.github', 'workflows'));
  assert.deepEqual(files, ['validate-blueprints.yml']);
  for (const { path } of sources) {
    assert.ok(!(await readdir(dirname(path))).some(file => file.endsWith('.lock.yml')));
  }
  assert.deepEqual((await readdir(join('scripts', 'blueprints'))).sort(),
    ['blueprints.test.mjs', 'validate.mjs']);
});
