# Workflow Permission Check

## What it does

Every Monday, or when you start it manually, the agent reviews up to five GitHub Actions workflow files for clearly unused permissions. If it finds a specific opportunity to reduce access, it opens one issue for maintainer review; it never edits workflow files. Inspired by the gallery's [Security Review](https://github.github.com/gh-aw/gallery/security-review/), this is deliberately narrowed to permission declarations that can be checked from workflow text alone.

It considers job-level overrides and reusable workflows before recommending a reduction. Unknown action requirements mean "needs verification", not "unused"; uncertainty alone does not produce an issue.

## Before you start

- [GitHub CLI](https://cli.github.com/) with the gh-aw extension: `gh extension install github/gh-aw`.
- GitHub Actions enabled in your repository.
- A Copilot licence that covers the workflow. See [Copilot licence requirements](../../../docs/running-workflows.md#copilot-licence-and-authentication-requirements).

## Set it up

1. Copy [`workflow-permission-check.md`](workflow-permission-check.md) to `.github/workflows/workflow-permission-check.md` in your repository.
2. Compile it:

   ```bash
   gh aw compile workflow-permission-check
   ```

3. Commit and push `.github/workflows/workflow-permission-check.md` and `.github/workflows/workflow-permission-check.lock.yml` to your default branch.

## Try it

It runs automatically every Monday once installed on the default branch. To test it now, in the **Actions** tab, select **Workflow Permission Check** and choose **Run workflow**. Or run:

```bash
gh aw run workflow-permission-check
```

## What you'll see

An issue such as:

> **Workflow:** [publish.yml](https://github.com/example/project/blob/main/.github/workflows/publish.yml)
>
> **Possible reduction:** The `publish` job explicitly grants `issues: write`, but its inspected steps only publish a package. No issue-writing consumer was found in the reviewed implementation.
>
> **Before changing it:** Check whether any referenced action needs this permission.

## Change it

- **File limit or report format:** edit the prompt below the `---` lines. No recompile needed.
- **Schedule:** change `schedule: weekly on monday` to `schedule: weekly on friday`, for example, then recompile. No placeholders need replacing.
- **Trigger or permissions:** edit the frontmatter, then recompile. Keep the reviewed workflows read-only.

## Safety

- Read-only access; opens at most one issue and does not edit workflows.
- Reviews at most five files total, including any inspected reusable workflows and local composite actions, and does not inspect generated lock files.
- Uses a soft budget of about 1,000 tokens, a 100 AI-credit spending cap, and a five-minute timeout.
- Does not infer third-party action behavior or make broad security claims from limited evidence.
- Accounts for effective job permissions, reusable workflows, and local composite actions within the file budget. Hidden requirements are not treated as proof of unused permissions.
- Treats workflow files and tool output as information, never as instructions.
