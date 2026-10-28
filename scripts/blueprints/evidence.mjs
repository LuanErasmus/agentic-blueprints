import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { getTask } from './tasks.mjs';
import { validateConfig } from './core.mjs';
import { sampleEvidence } from './samples.mjs';
import { GitHubEvidence } from './github.mjs';
import { collectAzureEvidence } from './azure.mjs';

const json = async path => JSON.parse(await readFile(path, 'utf8'));

export function enabledForEvent(slug, event, eventName, repository, config) {
  if (!eventName || eventName === 'workflow_dispatch') return true;
  const task = getTask(slug);
  const item = event.pull_request || event.issue;
  if (!item || item.draft || item.state === 'closed') return false;
  if (event.pull_request && event.pull_request.head.repo.full_name !== repository) return false;
  if (task.kind === 'pr' && !event.pull_request) return false;
  if (task.kind === 'issue' && (!event.issue || event.issue.pull_request)) return false;
  if (event.action === 'labeled') return config.trigger_labels.includes(event.label?.name);
  return slug === 'github-issue-triage' || slug === 'github-pr-review';
}

export async function prepareEvidence(slug, env = process.env) {
  const task = getTask(slug);
  const folder = resolve(env.BLUEPRINT_OUTPUT || '.blueprint-output', slug);
  const config = slug === 'azure-deployment-investigator' ? {} :
    validateConfig(await json(join('blueprints', slug, 'config.json')));
  const event = env.GITHUB_EVENT_PATH ? await json(env.GITHUB_EVENT_PATH) : {};
  const enabled = enabledForEvent(slug, event, env.GITHUB_EVENT_NAME, env.GITHUB_REPOSITORY, config);
  const sample = env.SAMPLE === 'true';
  let evidence;
  if (!enabled) {
    evidence = { blueprint: slug, sample: false, enabled: false, sources: [],
      limitations: ['Event is outside this blueprint scope.'] };
  } else if (slug === 'azure-deployment-investigator') {
    evidence = await collectAzureEvidence(env);
  } else if (sample) {
    evidence = sampleEvidence(slug);
    for (const action of task.actions.filter(action => action !== 'stop')) {
      evidence.sources.push(...evidence.followups[action]);
    }
    delete evidence.followups;
  } else {
    const collector = new GitHubEvidence({
      repository: env.GITHUB_REPOSITORY, token: env.GITHUB_TOKEN, config, apiUrl: env.GITHUB_API_URL,
    });
    evidence = await collector.collect(env.NUMBER || event.issue?.number || event.pull_request?.number, task.kind, {
      blueprint: slug, defaultBranch: event.repository?.default_branch || env.DEFAULT_BRANCH,
      base: env.BASE_REF, head: env.HEAD_REF,
    });
    if (task.actions.includes('inspect_linked_items') &&
        !(slug === 'test-scenario-planner' && evidence.pr)) await collector.linked();
    if (task.actions.includes('inspect_tests')) await collector.tests();
    if (task.actions.includes('inspect_checks') && slug !== 'release-readiness-helper') await collector.checks();
    if (evidence.pr && ['github-pr-review', 'pr-confidence-calculator'].includes(slug)) await collector.reviews();
  }
  evidence.blueprint = slug;
  evidence.enabled = enabled;
  await mkdir(folder, { recursive: true });
  await writeFile(join(folder, 'evidence.json'), JSON.stringify(evidence, null, 2));
  await writeFile(join(folder, 'config.json'), JSON.stringify(config, null, 2));
  return evidence;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  prepareEvidence(process.argv[2]).catch(error => { console.error(error.message); process.exitCode = 1; });
}
