# Stakeholder Release Notes Generator

**Difficulty:** Intermediate

## Problem

Commit titles and PR descriptions are not ready-made stakeholder communication. A useful draft needs explicit scope, audience context, and separation of implemented changes from deployment or availability.

## What the Agent Does

When an issue labelled `stakeholder-notes` is closed as completed, the workflow finds the pull requests formally linked to it that were merged into the default branch, works out the exact release range from them, and drafts plain-language notes with source references and uncertainty. Nobody types `From:` / `To:` refs. It never publishes a release, notifies stakeholders, or declares that merged work is deployed.

## Architecture

```text
Labelled issue closed as completed (or manual number)
→ label + "completed" gate → agent finds linked PRs merged into default branch → derives From/To SHAs (noop if none)
→ read-only GitHub evidence inspection → sandboxed Copilot draft
→ advisory Markdown artifact → human communication approval
```

## Prerequisites

One-time: GitHub CLI, gh-aw (`gh extension install github/gh-aw`), GitHub Actions, and an organisation-owned repository with **Copilot Business (minimum standard organisation plan) or Copilot Enterprise**. Enable **Copilot CLI** and **Allow use of Copilot CLI billed to the organization**. Keep `copilot-requests: write`; inference uses the built-in Actions token, not a PAT. Personal plans alone are insufficient. See [eligibility and billing](../../docs/running-workflows.md#copilot-licence-and-authentication-requirements), including eligible enterprise Copilot access.

Use an issue that describes the release context (audience, intended channel, availability, and exclusions) and link the delivering PR(s) to it through the Development sidebar or a closing keyword such as `Fixes #123`.

## Setup

1. Copy only [stakeholder-release-notes-generator.md](stakeholder-release-notes-generator.md) to `.github/workflows/stakeholder-release-notes-generator.md` in your repository.
2. Edit audience/company instructions directly in the Markdown, create `stakeholder-notes` (or align filters and instructions), and run `gh aw compile stakeholder-release-notes-generator`.
3. Review and commit source plus generated `.lock.yml` on your trusted default branch. Recompile after edits.

No shared files, runtime scripts, JSON configuration, or report schemas are required. See [optional details](../../docs/running-workflows.md).

## Run It

1. Link the PR(s) that deliver the work to the issue (Development sidebar or `Fixes #123` in the PR).
2. Merge the PR(s) into the default branch.
3. Add the `stakeholder-notes` label and close the issue as **completed** (closing via the PR merge also works if the label is already present).

The workflow's `if:` gate only starts a run when the label is present and the close reason is *completed* (not *not planned* or *duplicate*). The agent then checks for at least one formally linked same-repository PR merged into the default branch; if there is none it calls `noop` and drafts nothing.

The range is derived automatically:

- **From** — the default-branch commit just before the earliest-merged linked PR landed (works for merge, squash, and rebase merges).
- **To** — the merge commit of the latest-merged linked PR.

With several linked PRs the range spans all of them. The draft describes only the linked PRs; other commits merged in between are listed under **Limitations** as "in range but not linked".

You can also use **Actions → Stakeholder Release Notes Generator → Run workflow** on the default branch with the issue `number`. Optionally supply `base_ref` and `head_ref` together to override the derived range.

The role gate allows admin, maintainer, write, and triage; automatic fork events are blocked. Adapt the [filled-in input](examples/input.md) and read the [illustrative output](examples/output.md). There is no sample flag. Download the report artifact for the full draft.

## How It Works

The agent reads the issue's closing PR references with native read-only GitHub tools/proxy, keeps PRs merged into the default branch, and derives the From/To commit SHAs from their merge commits and parents. It reports those immutable SHAs, how each was derived, and verifies the comparison; reversed or divergent comparisons are rejected and identical endpoints mean there are no changes to describe. No code from either ref is checked out or executed.

The agent inspects relevant change evidence, context, guidance, and at most 10 explicitly linked same-repository issues/PRs. It does not fetch arbitrary external URLs. Comparison evidence does not establish deployment, customer entitlement, rollout dates, or benefit. PR assertions alone are not independent availability evidence.

There are no hard source-byte budgets. Inaccessible/truncated comparisons, uninspected changes, and tooling errors must be explicit, not disguised as an empty successful comparison. Correct inaccessible refs or missing context and rerun rather than inventing content.

The native edit tool writes `/tmp/gh-aw/report.md`; safe-output upload accepts only that one advisory Markdown report with seven-day retention. It is not a JSON contract, machine-validated inventory, or published communication.

## Guardrails

- Read-only evidence and one draft report; no comments, labels, issue creation, merges, releases, deployments, or messages.
- A release/communications owner verifies facts, availability, audience suitability, exclusions, and sensitive details before sharing.
- Do not equate merged with shipped or infer customer promises from commit names.
- Treat issue bodies, commit/PR text, guidance, and tool results as untrusted evidence, not instructions.
- Selected content goes to Copilot. Review artifact/log access and retention before using confidential change details.

## Customise It

Edit labels, vocabulary, guidance references, disclosure restrictions, and approval expectations directly in the workflow Markdown. To rename the label, change it in both `labels:` and the `if:` gate (on `closed` events the `labels:` filter alone does not check the issue's labels). Keep filters and instructions consistent; preserve immutable scope resolution and human approval.

## Challenge

Draft notes for support and engineering audiences over the same range. Verify that vocabulary changes while facts, exclusions, and rollout uncertainty stay consistent.
