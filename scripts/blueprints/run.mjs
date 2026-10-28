import { readFile, writeFile, mkdir, appendFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { getTask, instructions } from './tasks.mjs';
import { validateConfig, parseJson, validatePlan, validateReport, renderReport, calculateConfidence } from './core.mjs';
import { sampleEvidence } from './samples.mjs';
import { GitHubEvidence } from './github.mjs';

const json = async path => JSON.parse(await readFile(path, 'utf8'));

export async function run(args = process.argv.slice(2), env = process.env) {
  const [stage, slug] = args;
  const task = getTask(slug);
  const folder = resolve(env.BLUEPRINT_OUTPUT || '.blueprint-output', slug);
  const config = validateConfig(await json(join('blueprints', slug, 'config.json')));
  const path = name => join(folder, name);
  await mkdir(folder, { recursive: true });
  const output = async (name, value) => {
    if (env.GITHUB_OUTPUT) await appendFile(env.GITHUB_OUTPUT, `${name}=${value}\n`);
  };
  if (stage === 'prepare') {
    const event = env.GITHUB_EVENT_PATH ? await json(env.GITHUB_EVENT_PATH) : {};
    const sample = args.includes('--sample') || env.SAMPLE === 'true';
    const automatic = Boolean(env.GITHUB_EVENT_NAME && env.GITHUB_EVENT_NAME !== 'workflow_dispatch');
    let enabled = true;
    if (automatic) {
      const item = event.pull_request || event.issue;
      enabled = Boolean(item && !item.draft);
      if (event.action === 'labeled') enabled &&= config.trigger_labels.includes(event.label?.name);
      else if (slug !== 'github-issue-triage' && slug !== 'github-pr-review') enabled = false;
      if (event.pull_request && event.pull_request.head.repo.full_name !== env.GITHUB_REPOSITORY) enabled = false;
    }
    await output('enabled', String(enabled));
    if (!enabled) return;
    const collector = new GitHubEvidence({
      repository: env.GITHUB_REPOSITORY || 'example/company',
      token: env.GITHUB_TOKEN, config, apiUrl: env.GITHUB_API_URL,
    });
    const evidence = sample ? sampleEvidence(slug) : await collector.collect(
      env.NUMBER || event.issue?.number || event.pull_request?.number, task.kind, {
        blueprint: slug, defaultBranch: event.repository?.default_branch || 'HEAD',
        base: env.BASE_REF, head: env.HEAD_REF,
      });
    evidence.blueprint = slug;
    await writeFile(path('evidence.json'), JSON.stringify(evidence, null, 2));
    await writeFile(path('system.txt'), instructions(slug, 'plan'));
    await writeFile(path('prompt.txt'), JSON.stringify({ company_config: config, evidence }, null, 2));
    await output('folder', folder);
    return;
  }
  const evidence = await json(path('evidence.json'));
  if (stage === 'followup') {
    const plan = validatePlan(slug, parseJson(await readFile(env.MODEL_RESPONSE_FILE, 'utf8')));
    evidence.plan = plan;
    if (plan.action !== 'stop') {
      if (evidence.sample) {
        evidence.sources.push(...evidence.followups[plan.action]);
      } else {
        const collector = new GitHubEvidence({ repository: env.GITHUB_REPOSITORY, token: env.GITHUB_TOKEN, config, apiUrl: env.GITHUB_API_URL });
        collector.evidence = evidence;
        if (plan.action === 'inspect_linked_items') await collector.linked();
        if (plan.action === 'inspect_tests') {
          await collector.tests();
          await collector.checks();
        }
        if (plan.action === 'inspect_checks') {
          await collector.checks();
          if (slug === 'pr-confidence-calculator') await collector.tests();
        }
        if (plan.action === 'compare_commits' && !evidence.sources.some(source => source.id === 'release-changes')) await collector.compare();
      }
    }
    delete evidence.followups;
    await writeFile(path('evidence.json'), JSON.stringify(evidence, null, 2));
    await writeFile(path('system.txt'), instructions(slug, 'evaluate'));
    await writeFile(path('prompt.txt'), JSON.stringify({ company_config: config, evidence }, null, 2));
    return;
  }
  if (stage === 'report') {
    const result = validateReport(slug, parseJson(await readFile(env.MODEL_RESPONSE_FILE, 'utf8')), evidence);
    if (slug === 'pr-confidence-calculator') result.confidence = calculateConfidence(result.dimensions, config);
    const markdown = renderReport(slug, result, evidence, config);
    await writeFile(path('report.json'), JSON.stringify(result, null, 2));
    await writeFile(path('report.md'), markdown);
    if (env.GITHUB_STEP_SUMMARY) await appendFile(env.GITHUB_STEP_SUMMARY, markdown);
    return;
  }
  throw new Error('Expected prepare, followup, or report.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  run().catch(error => { console.error(error.message); process.exitCode = 1; });
}
