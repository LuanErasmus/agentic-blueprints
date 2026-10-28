import { cp, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { tasks } from './tasks.mjs';

export async function stageWorkflowSources(directory) {
  await mkdir(directory, { recursive: true });
  for (const slug of Object.keys(tasks)) {
    const id = slug.replace(/^github-/, '');
    await cp(join('blueprints', slug, `${id}.md`), join(directory, `${id}.md`));
  }
  await cp(join('blueprints', 'shared'), join(directory, 'shared'), { recursive: true });
}

export async function validateSources() {
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
