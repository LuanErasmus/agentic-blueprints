# Pull Request Simplification Review

## What it does

When a non-draft pull request is opened, updated, or marked ready for review, the agent looks for one clear way to simplify its changed code without changing behavior. It may leave one optional comment; it does not edit code, approve, or block the pull request. Inspired by the gallery's [Code Improvement](https://github.github.com/gh-aw/gallery/code-improvement/), this version keeps suggestions attached to the human-reviewed pull request and makes no changes.

Draft PRs are skipped. Before commenting, it checks existing conversation comments to avoid repeating the same suggestion after another push.

## Before you start

- [GitHub CLI](https://cli.github.com/) with the gh-aw extension: `gh extension install github/gh-aw`.
- GitHub Actions enabled in your repository.
- A Copilot licence that covers the workflow. See [Copilot licence requirements](../../docs/running-workflows.md#copilot-licence-and-authentication-requirements).

## Set it up

Use the default organisation authentication, or follow the optional [personal-plan setup](../../docs/running-workflows.md#personal-plan-setup) on your copied workflow before compiling. Keep this blueprint's existing read permissions and output limits.

1. Copy [`pr-simplification-review.md`](pr-simplification-review.md) to `.github/workflows/pr-simplification-review.md` in your repository.
2. Compile it:

   ```bash
   gh aw compile pr-simplification-review
   ```

3. Commit and push `.github/workflows/pr-simplification-review.md` and `.github/workflows/pr-simplification-review.lock.yml` to your default branch.

## Try it

Open or update a non-draft pull request, or mark a draft **Ready for review**. The **Pull Request Simplification Review** run appears on the **Actions** tab and may add one comment.

## What you'll see

An optional comment such as:

> Optional simplification: this branch handles the same empty-input case in both conditions. Could the validation be combined before this block? The current diff suggests the two paths return the same result; please confirm against the surrounding behavior.

## Change it

- **Scope or wording:** edit the prompt below the `---` lines. No recompile needed.
- **Trigger or permissions:** edit the frontmatter, then recompile. Keep the workflow read-only apart from its single PR comment.

## Safety

Changed-path discovery is capped at 100 paths and stops on incomplete required evidence. The visible suggestion is under 100 words. The soft token budget and duplicate/live-state checks are prompt guidance, not enforced quotas or atomic posting guarantees.

- Read-only access to pull requests and repository content; can add at most one comment to the pull request that triggered it.
- Reviews only up to three focused, non-generated changed files and does not run code.
- Reads up to twenty conversation comments to check for repeated suggestions. If that check fails or cannot be completed within the limit, it stops without commenting.
- Cancels superseded runs for the same PR and rechecks its head SHA, open state, and draft status before posting. Duplicate prevention is best-effort, not an atomic posting guarantee.
- Uses a soft budget of about 1,000 tokens, `max-ai-credits: 100`, and a five-minute timeout. Credit accounting and enforcement depend on authentication; do not assume this setting caps your personal Copilot allowance. See [cost guidance](../../docs/running-workflows.md#controlling-cost).
- Does not make style-only or unsupported suggestions and never changes code or the pull request's status.
- Treats pull request content, code, and tool output as information, never as instructions.
