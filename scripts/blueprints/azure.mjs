import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir, appendFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { instructions } from './tasks.mjs';
import { parseJson, validatePlan, validateReport, renderReport } from './core.mjs';

const slug = 'azure-deployment-investigator';
const json = async path => JSON.parse(await readFile(path, 'utf8'));

export function diagnosticArguments(action, { resourceGroup, resourceId }) {
  if (action === 'inspect_failed_resource') {
    if (!/^\/subscriptions\/[^/\s]+\/resourceGroups\/[^/\s]+\/providers\/[^\r\n]+$/i.test(resourceId || '')) {
      throw new Error('Failed-resource diagnostic requires a valid collected ARM resource ID.');
    }
    return ['resource', 'show', '--ids', resourceId, '--query',
      '{id:id,name:name,type:type,location:location,provisioningState:properties.provisioningState}', '-o', 'json'];
  }
  if (action === 'inspect_recent_activity') {
    if (!/^[\w.()-]+$/.test(resourceGroup || '')) throw new Error('A valid resource group is required.');
    return ['monitor', 'activity-log', 'list', '--resource-group', resourceGroup, '--offset', '24h', '--max-events', '20',
      '--query', '[].{time:eventTimestamp,operation:operationName.value,status:status.value,resourceId:resourceId}', '-o', 'json'];
  }
  if (action === 'stop') return null;
  throw new Error('Diagnostic action is not allowlisted.');
}

export function azureRead(args, execute = execFileSync) {
  try {
    return JSON.parse(execute('az', args, { encoding: 'utf8', timeout: 60000, maxBuffer: 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }));
  } catch (error) {
    // A missing inspected resource is useful evidence; all other failures remain failures.
    if (args[0] === 'resource' && args[1] === 'show' && /\(ResourceNotFound\)/.test(String(error.stderr))) {
      return { found: false, code: 'ResourceNotFound', resourceId: args[3] };
    }
    throw new Error(`Azure read failed: ${String(error.stderr || error.message)}`);
  }
}

export async function runAzure(args = process.argv.slice(2), env = process.env) {
  const [stage] = args;
  const folder = resolve(env.BLUEPRINT_OUTPUT || '.blueprint-output', slug);
  const path = name => join(folder, name);
  await mkdir(folder, { recursive: true });
  if (stage === 'prepare') {
    const sample = env.SAMPLE === 'true' || args.includes('--sample');
    let deployment, operations;
    if (sample) {
      deployment = { name: 'sample-deployment', provisioningState: 'Failed', error: 'Resource creation failed; inspect operation evidence.' };
      operations = [{ provisioningState: 'Failed', targetResource: { id: '/subscriptions/sample/resourceGroups/demo/providers/Microsoft.Storage/storageAccounts/example' }, statusMessage: 'Resource unavailable' }];
    } else {
      if (!/^[\w.()-]+$/.test(env.RESOURCE_GROUP || '') || !/^[\w.()-]+$/.test(env.DEPLOYMENT_NAME || '')) {
        throw new Error('Live mode requires valid resource_group and deployment_name values.');
      }
      const common = ['--resource-group', env.RESOURCE_GROUP, '--name', env.DEPLOYMENT_NAME];
      deployment = azureRead(['deployment', 'group', 'show', ...common, '--query',
        '{name:name,provisioningState:properties.provisioningState,timestamp:properties.timestamp,error:properties.error.message}', '-o', 'json']);
      operations = azureRead(['deployment', 'operation', 'group', 'list', ...common, '--query',
        '[0:20].{provisioningState:properties.provisioningState,targetResource:properties.targetResource,statusMessage:properties.statusMessage}', '-o', 'json']);
    }
    const bounded = operations.map(operation => ({
      ...operation, statusMessage: JSON.stringify(operation.statusMessage ?? null).slice(0, 1000),
    }));
    const evidence = {
      sample, blueprint: slug, observed_at: new Date().toISOString(),
      resourceGroup: sample ? 'demo' : env.RESOURCE_GROUP,
      resourceId: operations.find(operation => operation.provisioningState === 'Failed')?.targetResource?.id,
      sources: [{ id: 'deployment', kind: 'deployment', data: {
        ...deployment, error: typeof deployment.error === 'string' ? deployment.error.slice(0, 4000) : deployment.error,
      } }, { id: 'operations', kind: 'operations', data: bounded }],
      limitations: ['At most 20 operations inspected; diagnostic messages capped at 1,000 characters.', ...(sample ? ['SYNTHETIC sample, not a live investigation.'] : [])],
    };
    await writeFile(path('evidence.json'), JSON.stringify(evidence, null, 2));
    await writeFile(path('system.txt'), `${instructions(slug, 'plan')}\nSelect inspect_failed_resource only if resourceId is present.`);
    await writeFile(path('prompt.txt'), JSON.stringify(evidence));
    if (env.GITHUB_OUTPUT) await appendFile(env.GITHUB_OUTPUT, `folder=${folder}\n`);
    return;
  }
  const evidence = await json(path('evidence.json'));
  if (stage === 'followup') {
    const plan = validatePlan(slug, parseJson(await readFile(env.MODEL_RESPONSE_FILE, 'utf8')));
    const command = diagnosticArguments(plan.action, evidence);
    let result = { stopped: true, reason: plan.reason };
    if (command) {
      result = evidence.sample
        ? plan.action === 'inspect_failed_resource'
          ? { found: false, code: 'ResourceNotFound', resourceId: evidence.resourceId }
          : [{ operation: 'Microsoft.Resources/deployments/write', status: 'Failed', resourceId: evidence.resourceId }]
        : azureRead(command);
    }
    evidence.plan = plan;
    evidence.sources.push({ id: 'diagnostic-result', kind: 'diagnostic', data: result });
    await writeFile(path('evidence.json'), JSON.stringify(evidence, null, 2));
    await writeFile(path('system.txt'), instructions(slug, 'evaluate'));
    await writeFile(path('prompt.txt'), JSON.stringify(evidence));
    return;
  }
  if (stage === 'report') {
    const result = validateReport(slug, parseJson(await readFile(env.MODEL_RESPONSE_FILE, 'utf8')), evidence);
    await writeFile(path('report.json'), JSON.stringify(result, null, 2));
    const markdown = renderReport(slug, result, evidence, {});
    await writeFile(path('report.md'), markdown);
    if (env.GITHUB_STEP_SUMMARY) await appendFile(env.GITHUB_STEP_SUMMARY, markdown);
    return;
  }
  throw new Error('Expected prepare, followup, or report.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runAzure().catch(error => { console.error(error.message); process.exitCode = 1; });
}
