# Issue Helper

## What it does

When someone opens an issue, the agent reads it and posts **one** friendly comment that:

- thanks the author;
- summarises the issue in one sentence;
- asks up to two questions about essential missing details;
- suggests at most one **existing** label when clearly relevant.

It does not change the issue. A person still decides on labels, assignees, and next steps.

It checks answers already provided in issue-template fields, checked options, logs, and reproduction steps before asking questions. Empty headings and "No response" placeholders do not count as answers.

## Before you start

- [GitHub CLI](https://cli.github.com/) with the gh-aw extension: `gh extension install github/gh-aw`.
- GitHub Actions enabled in your repository.
- A Copilot licence that covers the workflow. See [Copilot licence requirements](../../docs/running-workflows.md#copilot-licence-and-authentication-requirements).

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
- Uses a soft budget of about 1,000 tokens, a 100 AI-credit spending cap, and a five-minute timeout. The token budget is guidance; AI credits are the enforceable spending limit.
- Reads only the issue and, if needed, existing label names; stops rather than guessing or retrying failed lookups.
- Ignores issues opened by bots.
- Treats the issue text as information, never as instructions.
