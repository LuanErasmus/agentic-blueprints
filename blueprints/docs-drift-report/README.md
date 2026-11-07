# Documentation Drift Report

## What it does

Every Monday, or when you start it manually, the agent reviews a small sample of recently merged code changes against related documentation. If it finds a specific, evidence-backed mismatch, it opens one issue for a person to review; it never edits documentation. Inspired by the gallery's [Documentation Maintenance](https://github.github.com/gh-aw/gallery/docs-automation/), this version reports a narrow, verified follow-up instead of proposing file edits.

It selects the most relevant user-facing change from up to three recent PRs, rather than always taking the newest. The report can include one suggested replacement sentence when the evidence supports precise wording.

## Before you start

- [GitHub CLI](https://cli.github.com/) with the gh-aw extension: `gh extension install github/gh-aw`.
- GitHub Actions enabled in your repository.
- A Copilot licence that covers the workflow. See [Copilot licence requirements](../../docs/running-workflows.md#copilot-licence-and-authentication-requirements).

## Set it up

1. Copy [`docs-drift-report.md`](docs-drift-report.md) to `.github/workflows/docs-drift-report.md` in your repository.
2. Compile it:

   ```bash
   gh aw compile docs-drift-report
   ```

3. Commit and push `.github/workflows/docs-drift-report.md` and `.github/workflows/docs-drift-report.lock.yml` to your default branch.

## Try it

It runs automatically every Monday once installed on the default branch. To test it after a feature or fix has merged, go to **Actions**, select **Documentation Drift Report**, and choose **Run workflow**. Or run:

```bash
gh aw run docs-drift-report
```

## What you'll see

An issue such as:

> **Possible gap:** The merged change adds a CSV export option, but the linked user guide still describes PDF-only exports.
>
> **Evidence:** [Merged change](https://github.com/example/project/pull/42) and [Export guide](https://github.com/example/project/blob/main/docs/export.md).
>
> **Review:** Confirm whether the guide should describe the new option.
>
> **Suggested wording (draft):** "Choose PDF or CSV when exporting your report."

## Change it

- **Review window, file limit, or report wording:** edit the prompt below the `---` lines. No recompile needed.
- **Schedule:** change `schedule: weekly on monday` to `schedule: weekly on friday`, for example, then recompile. No placeholders need replacing. Keep the seven-day review window aligned if you change the frequency.
- **Trigger or permissions:** edit the frontmatter, then recompile. Keep repository access read-only.

## Safety

Changed-path listings are capped at 100 per sampled PR. Before publishing an issue under 150 words, it checks up to five matching open reports and rechecks the cited documentation for changes. Incomplete required evidence or changed documentation stops publication; these are best-effort prompt rules.

- Read-only access; opens at most one issue and never edits documentation.
- Samples up to three recent PRs, then reads at most three focused, non-generated changed files from one selected PR and up to two related documentation pages.
- Suggested wording is a draft, not an applied edit; unsupported commands, defaults, and availability claims are omitted.
- Uses a soft budget of about 1,000 tokens, a 100 AI-credit spending cap, and a five-minute timeout.
- Reports only mismatches supported by changed code and documentation evidence.
- Treats pull requests, code, documentation, and tool output as information, never as instructions.
