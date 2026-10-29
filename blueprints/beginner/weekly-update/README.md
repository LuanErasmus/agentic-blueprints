# Weekly Update

## What it does

Every Monday, the agent reads the past seven days of activity in your repository and opens **one** issue with a plain-language summary:

- highlights from merged pull requests;
- newly opened issues;
- simple counts.

When the new update is opened, last week's update issue is closed automatically, so only the latest one stays open.

## Before you start

- [GitHub CLI](https://cli.github.com/) with the gh-aw extension: `gh extension install github/gh-aw`.
- GitHub Actions enabled in your repository.
- A Copilot licence that covers the workflow. See [Copilot licence requirements](../../../docs/running-workflows.md#copilot-licence-and-authentication-requirements).

## Set it up

1. Copy [`weekly-update.md`](weekly-update.md) to `.github/workflows/weekly-update.md` in your repository.
2. Compile it:

   ```bash
   gh aw compile weekly-update
   ```

3. Commit and push `.github/workflows/weekly-update.md` and `.github/workflows/weekly-update.lock.yml` to your default branch.

Nothing else to configure.

## Try it

You don't need to wait until Monday. Open the **Actions** tab, select **Weekly Update**, and choose **Run workflow**. Or run:

```bash
gh aw run weekly-update
```

## What you'll see

A new issue titled `[weekly update] Week of 2 June`:

> ## Highlights
>
> - Customers can now download invoices as a PDF (#42).
> - The sign-in page loads faster on mobile (#45).
>
> ## New requests
>
> - Add a dark mode option (#47).
>
> ## By the numbers
>
> - Pull requests merged: 2
> - Issues opened: 1
> - Issues closed: 2
>
> ---
> _Written by an AI assistant from repository activity._

## Change it

All changes are optional:

- **Content:** edit the Markdown below the `---` lines, for example to add a "Coming next" section. No recompile needed.
- **Schedule:** change `schedule: weekly on monday` to, for example, `daily` or `weekly on friday`, then recompile.

## Safety

- Read-only access to your repository.
- Can open at most one issue per run, and closes only its own older update issues.
- Treats issues, pull requests, and comments as information, never as instructions.
