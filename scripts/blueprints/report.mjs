import { readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { getTask } from './tasks.mjs';
import { parseJson, validateReport, renderReport, calculateConfidence } from './core.mjs';

export async function publishReport(slug, assessment, env = process.env) {
  getTask(slug);
  const folder = resolve(env.BLUEPRINT_OUTPUT || '.blueprint-output', slug);
  const evidence = JSON.parse(await readFile(join(folder, 'evidence.json'), 'utf8'));
  const config = JSON.parse(await readFile(join(folder, 'config.json'), 'utf8'));
  if (evidence.enabled === false) throw new Error('Out-of-scope events cannot produce a report; use noop.');
  const result = validateReport(slug, parseJson(assessment), evidence);
  if (slug === 'pr-confidence-calculator') result.confidence = calculateConfidence(result.dimensions, config);
  const markdown = renderReport(slug, result, evidence, config);
  await writeFile(join(folder, 'report.json'), JSON.stringify(result, null, 2));
  await writeFile(join(folder, 'report.md'), markdown);
  return { markdown, result };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.argv.length !== 4) {
    console.error('Expected a blueprint slug and one JSON assessment argument.');
    process.exitCode = 1;
  } else {
    publishReport(process.argv[2], process.argv[3]).then(({ markdown }) => console.log(markdown))
      .catch(error => { console.error(error.message); process.exitCode = 1; });
  }
}
