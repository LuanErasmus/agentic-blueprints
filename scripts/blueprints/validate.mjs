import { access, cp, mkdir, mkdtemp, readdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export async function workflowSources() {
  const sources = [];
  for (const entry of await readdir('blueprints', { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const path = join('blueprints', slug, `${slug}.md`);
    await access(path);
    sources.push({ slug, id: slug, path, compile: slug !== 'into-azure-cost-reviewer' });
  }
  if (!sources.length) throw new Error('No blueprint workflow sources found.');
  return sources;
}

export async function stageWorkflowSources(directory) {
  await mkdir(directory, { recursive: true });
  for (const { id, path, compile } of await workflowSources()) {
    if (!compile) continue;
    await cp(path, join(directory, `${id}.md`));
  }
}

export async function validateSources() {
  console.log('Into Azure Cost Reviewer is source-only and excluded from compiler staging; compile it in the adopting repository.');
  await mkdir('.blueprint-output', { recursive: true });
  const directory = await mkdtemp(join('.blueprint-output', 'source-validation-'));
  try {
    await stageWorkflowSources(directory);
    const result = spawnSync('gh', ['aw', 'compile', '--dir', directory, '--no-emit',
      '--strict', '--validate', '--no-check-update'], { stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Workflow source validation failed (${result.status ?? result.signal}).`);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  validateSources().catch(error => { console.error(error.message); process.exitCode = 1; });
}
