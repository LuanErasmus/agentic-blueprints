import { getTask } from './tasks.mjs';

export function parseJson(text) {
  if (typeof text !== 'string' || !text.trim()) throw new Error('Empty model response.');
  return JSON.parse(text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
}

export function validateConfig(config) {
  if (!Array.isArray(config.trigger_labels) || !config.trigger_labels.every(x => typeof x === 'string') ||
      !Array.isArray(config.guidance_paths) || !config.guidance_paths.every(x => typeof x === 'string') ||
      !Number.isInteger(config.max_items) || config.max_items < 1 || config.max_items > 50) {
    throw new Error('Config requires trigger_labels, guidance_paths, and max_items (1..50).');
  }
  for (const field of ['test_paths', 'test_report_paths']) {
    if (config[field] !== undefined && (!Array.isArray(config[field]) ||
        !config[field].every(path => typeof path === 'string' && path.length > 0))) {
      throw new Error(`${field} must be an array of exact repository file paths.`);
    }
  }
  return config;
}

export function issueNumbers(text, maxItems) {
  return [...new Set([...text.matchAll(/(?:^|[\s(])#([1-9]\d*)\b/g)].map(x => Number(x[1])))].slice(0, maxItems);
}

export function releaseRange(body, base, head) {
  const from = base || body.match(/^From:\s*(\S+)\s*$/im)?.[1];
  const to = head || body.match(/^To:\s*(\S+)\s*$/im)?.[1];
  if (!from || !to) throw new Error('Release notes require From/To refs or manual base_ref/head_ref.');
  return { base: from, head: to };
}

const string = value => typeof value === 'string' && value.trim().length > 0;
const strings = value => Array.isArray(value) && value.every(string);

export function validateReport(slug, result, evidence) {
  if (!result || !string(result.summary) || !Array.isArray(result.findings) ||
      !strings(result.limitations) || !strings(result.next_steps)) {
    throw new Error('Report requires summary, findings, limitations, and next_steps.');
  }
  const sourceIds = new Set(evidence.sources.map(source => source.id));
  if (result.suggested_labels !== undefined && !strings(result.suggested_labels)) {
    throw new Error('suggested_labels must be an array of non-empty strings.');
  }
  const statuses = slug === 'release-readiness-helper'
    ? new Set(['satisfied', 'unsatisfied', 'unknown', 'not_applicable'])
    : new Set(['observed', 'gap', 'risk', 'unknown', 'satisfied', 'unsatisfied', 'not_applicable']);
  const cited = refs => strings(refs) && refs.every(ref => sourceIds.has(ref));
  for (const finding of result.findings) {
    if (!finding || !statuses.has(finding.status) || !string(finding.detail) ||
        !cited(finding.sources) || (finding.status !== 'unknown' && finding.sources.length === 0)) {
      throw new Error('Finding has an invalid status, missing detail, or missing/unknown source IDs.');
    }
  }
  if (slug === 'github-issue-triage') {
    if (!strings(result.suggested_labels) ||
        !result.suggested_labels.every(label => evidence.available_labels.includes(label))) {
      throw new Error('Suggested labels must exist in the collected repository labels.');
    }
  }
  if (slug === 'pr-confidence-calculator') {
    if (!result.dimensions || typeof result.dimensions !== 'object') throw new Error('Missing confidence dimensions.');
    if (Object.keys(result.dimensions).length !== 4) throw new Error('Expected exactly four confidence dimensions.');
    for (const name of ['scope', 'execution', 'scenarios', 'review']) {
      const dimension = result.dimensions[name];
      if (dimension !== null && (!dimension || !Number.isFinite(dimension.score) ||
          dimension.score < 0 || dimension.score > 100 || !string(dimension.reason) ||
          !cited(dimension.sources) || !dimension.sources.length)) {
        throw new Error(`Invalid confidence dimension: ${name}`);
      }
    }
    // Generic CI status cannot establish scenario-level execution or coverage.
    const executionSources = evidence.sources.filter(source =>
      source.kind === 'test-report' && source.data?.sha === evidence.candidate &&
      ['success', 'failure'].includes(source.data?.conclusion) && Array.isArray(source.data.scenarios) &&
      source.data.scenarios.some(scenario => ['passed', 'failed'].includes(scenario.result)));
    const citedExecution = executionSources.filter(source => result.dimensions.execution?.sources.includes(source.id));
    if (!citedExecution.length) {
      result.dimensions.execution = null;
    } else if (executionSources.some(source => source.data.conclusion === 'failure' ||
        source.data.scenarios.some(scenario => scenario.result === 'failed'))) {
      result.dimensions.execution.score = 0;
      result.dimensions.execution.sources = [...new Set([...result.dimensions.execution.sources,
        ...executionSources.filter(source => source.data.conclusion === 'failure' ||
          source.data.scenarios.some(scenario => scenario.result === 'failed')).map(source => source.id)])];
      result.dimensions.execution.reason = 'Current supplied scenario evidence contains failures; execution assurance is zero.';
    }
    if (!evidence.sources.some(source => source.kind === 'test-source' &&
        result.dimensions.scenarios?.sources.includes(source.id))) result.dimensions.scenarios = null;
  }
  return result;
}

export function calculateConfidence(dimensions, config) {
  const names = ['scope', 'execution', 'scenarios', 'review'];
  const weights = config.weights;
  if (!weights || Object.keys(weights).length !== 4 ||
      names.some(name => !Number.isFinite(weights[name]) || weights[name] <= 0)) {
    throw new Error('Confidence weights must be positive finite values for the four dimensions.');
  }
  const minimum = config.minimum_evidence_dimensions;
  if (!Number.isInteger(minimum) || minimum < 1 || minimum > 4) throw new Error('Minimum evidence dimensions must be 1..4.');
  const known = names.filter(name => dimensions[name] !== null);
  const complete = known.length === 4;
  // Never redistribute unknown weights: missing evidence must not inflate the score.
  const total = names.reduce((sum, name) => sum + weights[name], 0);
  const score = known.length < minimum ? null : Math.round(known.reduce(
    (sum, name) => sum + dimensions[name].score * weights[name], 0) / total);
  return { score, completeness: `${known.length}/4 (${complete ? 'complete' : 'partial'})`, unknown: names.filter(name => dimensions[name] === null) };
}

export function renderReport(slug, result, evidence, config) {
  const lines = [
    `# ${getTask(slug).title}`,
    evidence.sample ? '**SYNTHETIC SAMPLE — not a live result.**' : '**Advisory only — not an approval.**',
    `Candidate: ${evidence.candidate || 'not supplied'}`,
    `Evidence observed at: ${evidence.observed_at || 'not supplied'}`,
  ];
  if (slug === 'pr-confidence-calculator') {
    const confidence = calculateConfidence(result.dimensions, config);
    lines.push(`## Confidence\nScore: ${confidence.score === null ? 'withheld — insufficient evidence' : `${confidence.score}/100`}`,
      `Evidence completeness: ${confidence.completeness}`,
      'This is a configurable evidence assessment, not a probability of correctness or proof of bug-free code.',
      ...Object.entries(result.dimensions).map(([name, value]) => `- ${name}: ${value ? `${value.score}/100 — ${value.reason}` : 'unknown'}`));
  }
  lines.push('## Summary', result.summary, '## Findings',
    ...result.findings.map(item => `- **${item.status}**: ${item.detail} (${item.sources.join(', ') || 'no evidence'})`),
    '## Limitations', ...[...new Set([...evidence.limitations, ...result.limitations])].map(x => `- ${x}`),
    '## Next steps', ...result.next_steps.map(x => `- ${x}`), '## Internal evidence references',
    ...evidence.sources.map(source => `- ${source.id}: ${source.url || source.kind}`));
  if (result.suggested_labels?.length) lines.push('## Suggested labels', result.suggested_labels.join(', '));
  return `${lines.join('\n\n')}\n`;
}
