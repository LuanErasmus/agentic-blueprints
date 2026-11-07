# Actions Health Report

## What it does

Every Monday, or when you start it manually, the agent samples up to ten GitHub Actions runs from the past week and opens one issue with observed outcomes and links to repeated failures. It does not store metrics or claim to measure overall reliability. Inspired by the gallery's [Metrics and Analytics](https://github.github.com/gh-aw/gallery/metrics-analytics/), this version avoids repo-memory setup and reports only a small, auditable sample.

It excludes its own workflow, separates unfinished runs from completed outcomes, and links the longest timed run in the sample when timestamps are available. It does not read logs for this report.

## Before you start

- [GitHub CLI](https://cli.github.com/) with the gh-aw extension: `gh extension install github/gh-aw`.
- GitHub Actions enabled in your repository.
- A Copilot licence that covers the workflow. See [Copilot licence requirements](../../docs/running-workflows.md#copilot-licence-and-authentication-requirements).

## Set it up

Use the default organisation authentication, or follow the optional [personal-plan setup](../../docs/running-workflows.md#personal-plan-setup) on your copied workflow before compiling. Keep this blueprint's existing read permissions and output limits.

1. Copy [`actions-health-report.md`](actions-health-report.md) to `.github/workflows/actions-health-report.md` in your repository.
2. Compile it:

   ```bash
   gh aw compile actions-health-report
   ```

3. Commit and push `.github/workflows/actions-health-report.md` and `.github/workflows/actions-health-report.lock.yml` to your default branch.

## Try it

It runs automatically every Monday once installed on the default branch. To test it now, in the **Actions** tab, select **Actions Health Report** and choose **Run workflow**. Or run:

```bash
gh aw run actions-health-report
```

## What you'll see

An issue such as:

> **Sample window:** 27 May–2 June (8 runs reviewed)
>
> **Observed runs:** 5 succeeded, 2 failed, 1 was cancelled. No unfinished runs.
>
> **Repeated failure:** The test workflow failed twice. [Run 81](https://github.com/example/project/actions/runs/81) and [run 84](https://github.com/example/project/actions/runs/84) are available for review. These summaries do not establish a shared cause.
>
> **Longest timed run in sample:** [Run 84](https://github.com/example/project/actions/runs/84), 6 minutes from start to completion (excluding queue time).

## Change it

- **Sample size or reporting period:** edit the prompt below the `---` lines. No recompile needed.
- **Schedule:** change `schedule: weekly on monday` to `schedule: weekly on friday`, for example, then recompile. No placeholders need replacing. Keep the seven-day reporting period aligned if you change the frequency.
- **Trigger or permissions:** edit the frontmatter, then recompile. Keep Actions access read-only.

## Safety

Before publishing, it checks up to five open matching reports for the same window and run sample. A failed or incomplete duplicate check stops publication. This is best-effort prompt guidance, not an atomic posting guarantee.

- Read-only access to Actions and repository content; opens at most one issue.
- Reviews at most ten runs from seven days and reports sampled counts only.
- Excludes its own runs without fetching replacements. Unfinished runs and other conclusions are counted separately; missing timestamps are not invented.
- Uses a soft budget of about 1,000 tokens, `max-ai-credits: 100`, and a five-minute timeout. Credit accounting and enforcement depend on authentication; do not assume this setting caps your personal Copilot allowance. See [cost guidance](../../docs/running-workflows.md#controlling-cost).
- Does not store metrics or infer causes and trends from limited run summaries.
- Treats run names, logs, repository content, and tool output as information, never as instructions.
