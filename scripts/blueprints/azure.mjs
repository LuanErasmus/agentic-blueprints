import { execFileSync } from 'node:child_process';

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

export async function collectAzureEvidence(env = process.env, read = azureRead) {
  const sample = env.SAMPLE === 'true';
  let deployment, operations;
  if (sample) {
    deployment = { name: 'sample-deployment', provisioningState: 'Failed', error: 'Resource creation failed; inspect operation evidence.' };
    operations = [{ provisioningState: 'Failed', targetResource: { id: '/subscriptions/sample/resourceGroups/demo/providers/Microsoft.Storage/storageAccounts/example' }, statusMessage: 'Resource unavailable' }];
  } else {
    if (!/^[\w.()-]+$/.test(env.RESOURCE_GROUP || '') || !/^[\w.()-]+$/.test(env.DEPLOYMENT_NAME || '')) {
      throw new Error('Live mode requires valid resource_group and deployment_name values.');
    }
    const common = ['--resource-group', env.RESOURCE_GROUP, '--name', env.DEPLOYMENT_NAME];
    deployment = read(['deployment', 'group', 'show', ...common, '--query',
      '{name:name,provisioningState:properties.provisioningState,timestamp:properties.timestamp,error:properties.error.message}', '-o', 'json']);
    operations = read(['deployment', 'operation', 'group', 'list', ...common, '--query',
      '[0:20].{provisioningState:properties.provisioningState,targetResource:properties.targetResource,statusMessage:properties.statusMessage}', '-o', 'json']);
  }
  const bounded = operations.map(operation => ({
    ...operation, statusMessage: JSON.stringify(operation.statusMessage ?? null).slice(0, 1000),
  }));
  const evidence = {
    sample, blueprint: 'azure-deployment-investigator', observed_at: new Date().toISOString(),
    resourceGroup: sample ? 'demo' : env.RESOURCE_GROUP,
    resourceId: operations.find(operation => operation.provisioningState === 'Failed')?.targetResource?.id,
    sources: [{ id: 'deployment', kind: 'deployment', data: {
      ...deployment, error: typeof deployment.error === 'string' ? deployment.error.slice(0, 4000) : deployment.error,
    } }, { id: 'operations', kind: 'operations', data: bounded }],
    limitations: ['At most 20 operations inspected; diagnostic messages capped at 1,000 characters.', ...(sample ? ['SYNTHETIC sample, not a live investigation.'] : [])],
  };
  for (const action of ['inspect_failed_resource', 'inspect_recent_activity']) {
    if (action === 'inspect_failed_resource') {
      if (!evidence.resourceId) {
        evidence.limitations.push('No failed-resource ID was collected; resource inspection omitted.');
        continue;
      }
      const parts = evidence.resourceId.split('/');
      if (parts[4]?.toLowerCase() !== evidence.resourceGroup.toLowerCase() ||
          (!sample && parts[2]?.toLowerCase() !== env.AZURE_SUBSCRIPTION_ID?.toLowerCase())) {
        evidence.limitations.push('Failed resource lies outside the configured subscription/resource group; inspection omitted.');
        continue;
      }
    }
    const command = diagnosticArguments(action, evidence);
    const result = sample
      ? action === 'inspect_failed_resource'
        ? { found: false, code: 'ResourceNotFound', resourceId: evidence.resourceId }
        : [{ operation: 'Microsoft.Resources/deployments/write', status: 'Failed', resourceId: evidence.resourceId }]
      : read(command);
    const text = JSON.stringify(result);
    evidence.sources.push({ id: action, kind: 'diagnostic',
      data: text.length > 6000 ? { truncated: true, excerpt: text.slice(0, 6000) } : result });
    if (text.length > 6000) evidence.limitations.push(`${action}: truncated to 6,000 characters.`);
  }
  return evidence;
}
