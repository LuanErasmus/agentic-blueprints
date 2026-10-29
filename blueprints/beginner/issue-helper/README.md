# Issue Helper

## What it does

When someone opens an issue, the agent reads it and posts **one** friendly comment that:

- thanks the author;
- summarises the issue in plain language;
- asks up to three questions about missing details;
- suggests up to two of your **existing** labels.

It does not change the issue. A person still decides on labels, assignees, and next steps.

## Before you start

- [GitHub CLI](https://cli.github.com/) with the gh-aw extension: `gh extension install github/gh-aw`.
- GitHub Actions enabled in your repository.
- A Copilot licence that covers the workflow. See [Copilot licence requirements](../../../docs/running-workflows.md#copilot-licence-and-authentication-requirements).

## Set it up

1. Copy [`issue-helper.md`](issue-helper.md) to `.github/workflows/issue-helper.md` in your repository.
2. Compile it:

   ```bash
   gh aw compile issue-helper
   ```

3. Commit and push `.github/workflows/issue-helper.md` and `.github/workflows/issue-helper.lock.yml` to your default branch.

Nothing else to configure.

## Try it

Open a new issue, for example:

> **Title:** Export button does nothing
>
> When I click Export on the reports page nothing happens.

Within a few minutes, the **Issue Helper** run appears on the **Actions** tab and the comment appears on the issue.

## What you'll see

> **Thanks** for reporting this!
>
> **Summary:** The Export button on the reports page doesn't respond when clicked.
>
> **Questions**
> 1. Which browser and version are you using?
> 2. Does this happen for every report, or only some?
> 3. Do you see any error message?
>
> **Suggested labels:** `bug`

## Change it

All changes are optional. Edit the Markdown below the `---` lines (no recompile needed):

- Change the comment sections, word limit, or tone.
- Add your team's own questions, for example "Which customer is affected?"

By default, the workflow runs for issues opened by people with **write** access or higher. To run it for issues from anyone, add `roles: all` under `on:` and recompile.

## Safety

- Read-only access to your repository.
- Can post at most one comment, on the issue that triggered it.
- Ignores issues opened by bots.
- Treats the issue text as information, never as instructions.
