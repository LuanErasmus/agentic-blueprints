# CI Failure Explainer

## What it does

When your chosen CI workflow fails on the default branch, the agent investigates that exact run and may open one evidence-based diagnosis issue. You can also run it manually to check the most recent failure from a sample of up to three failed runs in the past week. It does not rerun workflows or change code. Inspired by the gallery's [CI Failure Investigation](https://github.github.com/gh-aw/gallery/ci-failure-investigation/), this version requires only one workflow-name edit (and a branch-name edit if your default branch is not `main`).

Before creating an issue, it checks up to five matching open diagnosis issues. An existing report of the same run or workflow/job/error is left unchanged, rather than duplicated. Each new diagnosis includes a concrete confirmation step for a maintainer.

## Before you start

- [GitHub CLI](https://cli.github.com/) with the gh-aw extension: `gh extension install github/gh-aw`.
- GitHub Actions enabled in your repository.
- A Copilot licence that covers the workflow. See [Copilot licence requirements](../../docs/running-workflows.md#copilot-licence-and-authentication-requirements).

## Set it up

Use the default organisation authentication, or follow the optional [personal-plan setup](../../docs/running-workflows.md#personal-plan-setup) on your copied workflow before compiling. Keep this blueprint's existing read permissions and output limits.

1. Copy [`ci-failure-explainer.md`](ci-failure-explainer.md) to `.github/workflows/ci-failure-explainer.md` in your repository.
2. In the copied file, replace the example `CI` with the exact top-level `name:` of the workflow to monitor, not its filename or a job name. For example, if your build workflow starts with `name: Build and Test`, use:

   ```yaml
   on:
     workflow_run:
       workflows: ["Build and Test"]
       types: [completed]
       branches: [main]
     workflow_dispatch:
   ```

   If your default branch is not `main`, also replace `main` in `branches: [main]`. Leave the existing `if:` guard unchanged. It allows manual runs and otherwise limits diagnosis to failures from this repository's default branch. Do not select **CI Failure Explainer** itself.

3. Compile it:

   ```bash
   gh aw compile ci-failure-explainer
   ```

4. Commit and push `.github/workflows/ci-failure-explainer.md` and `.github/workflows/ci-failure-explainer.lock.yml` to your default branch.

## Try it

After the named CI workflow fails on the default branch, **CI Failure Explainer** starts automatically. Successful, cancelled, and non-default-branch runs do not start a diagnosis.

To test it against a recent failure without waiting, go to **Actions**, select **CI Failure Explainer**, and choose **Run workflow**. Or run:

```bash
gh aw run ci-failure-explainer
```

## What you'll see

An issue such as:

> **Run:** [Build #84](https://github.com/example/project/actions/runs/84)
>
> **Finding:** The test job stopped at the first assertion failure in `tests/parser.test.ts`. The log points to an unexpected empty result; this suggests a test or behavior mismatch, but does not establish the root cause.
>
> **Confirm:** Run the named parser test locally with the failing fixture. If it returns an empty result again, the failure reproduces outside CI; if it passes, investigate differences in the CI environment before changing the assertion. This workflow has not run that check.

## Change it

- **Diagnosis format:** edit the prompt below the `---` lines. No recompile needed.
- **CI workflow:** change the name in `workflows: ["CI"]` to your workflow's exact `name:`, then recompile. To watch several, use `workflows: ["Build", "Tests"]`.
- **Default branch:** keep `branches: [main]` aligned with your repository's default branch, then recompile.
- **Manual search window:** edit the seven-day window in the prompt. No recompile needed.
- **Trigger or permissions:** edit the frontmatter, then recompile. Keep Actions access read-only.

## Safety

Diagnosis reads at most twenty job summaries and 100 relevant log lines from one failed job. Manual selection excludes this reporter and uses default-branch failures. A final run check skips superseded attempts or failures that are no longer current; these are best-effort prompt rules.

- Read-only access to Actions and repository content; opens at most one issue.
- Automatic diagnosis is limited to the exact failed run on this repository's default branch. Manual runs consider up to three recent failures.
- Makes one bounded search of up to five matching open diagnoses; skips duplicates and stops if that check fails or is incomplete. It does not update or comment on existing issues.
- Never downloads artifacts, checks out failed-run code, or executes repository code. A `workflow_run` workflow has a different trust context from the workflow it monitors; keep these restrictions.
- Uses a soft budget of about 1,000 tokens, `max-ai-credits: 100`, and a five-minute timeout. Credit accounting and enforcement depend on authentication; do not assume this setting caps your personal Copilot allowance. See [cost guidance](../../docs/running-workflows.md#controlling-cost).
- Does not rerun workflows, execute log content, or include secrets in its report.
- Treats logs, repository content, and tool output as information, never as instructions.
