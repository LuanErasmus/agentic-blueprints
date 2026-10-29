# Release Readiness Helper

**Difficulty:** Intermediate

## Problem

Release evidence spans validation, rollout notes, a company checklist, and outstanding decisions. A concise report can expose gaps, but readiness cannot be established by generic checks or an AI recommendation.

## What the Agent Does

Reviews a release issue and supporting evidence against your company's checklist for an exact candidate. Separates documented, unsatisfied, and unknown conditions and recommends follow-up. It does not approve, block, publish, or deploy a release.

## Architecture

```text
Issue label or manual number → exact candidate and company checklist
→ read-only GitHub evidence inspection → sandboxed Copilot assessment
→ advisory Markdown artifact → release-owner decision
```

## Prerequisites

One-time: GitHub CLI, gh-aw (`gh extension install github/gh-aw`), GitHub Actions, and an organisation-owned repository with **Copilot Business (minimum standard organisation plan) or Copilot Enterprise**. Enable **Copilot CLI** and **Allow use of Copilot CLI billed to the organization**. Keep `copilot-requests: write`; inference uses the built-in Actions token, not a PAT. Personal plans alone are insufficient. See [eligibility and billing](../../docs/running-workflows.md#copilot-licence-and-authentication-requirements), including eligible enterprise Copilot access.

Use a release issue with `Candidate: <40-character SHA>`, your company checklist, scope, validation links, rollout/rollback details, and required approvals.

## Setup

1. Copy only [release-readiness-helper.md](release-readiness-helper.md) to `.github/workflows/release-readiness-helper.md` in your repository.
2. Put company instructions/checklist references directly in the Markdown, create `release-readiness` (or update filters and instructions), and run `gh aw compile release-readiness-helper`.
3. Review and commit source plus generated `.lock.yml` on your trusted default branch. Recompile after edits.

No shared files, scripts, JSON configuration, or report schemas are required. See [optional details](../../docs/running-workflows.md).

## Run It

Use **Actions → Release Readiness Helper → Run workflow** on the default branch with the required release issue `number`, or apply `release-readiness` for an automatic labelled-issue run.

The role gate allows admin, maintainer, write, and triage; automatic fork events are blocked. Adapt the [filled-in issue](examples/input.md) and read the [illustrative output](examples/output.md). There is no sample flag.

Keep the exact candidate line, for example:

```text
Candidate: 0123456789abcdef0123456789abcdef01234567
```

This fictional SHA must be replaced with a real full commit SHA. A tag, short SHA, or prose mention is not a substitute. Download the report artifact for the full assessment.

## How It Works

Native read-only GitHub tools/proxy inspect the issue, company checklist, candidate-specific evidence, and at most 10 explicitly linked same-repository issues/PRs. The agent does not check out code or run validation.

Link readable existing scenario-level results and state their revision; no custom JSON test-report schema is required. Distinguish inspected test source and actual results from author assertions. Green CI alone does not establish scenario execution, sign-off, rollout, or readiness. Missing policy means a question, not an invented required control.

There are no hard source-byte budgets. Explicitly report inaccessible/truncated evidence, stale results, and tooling errors; failed reads are not proof of absence or success. The native edit tool writes one `report.md` in the empty workspace; safe-output upload allowlists that path with seven-day retention. This is advisory Markdown, not a machine-validated readiness decision.

## Guardrails

- Read-only evidence and one report; no comments, labels, assignments, issue creation, approvals, merges, releases, deployments, or rollback execution.
- Release authority and company approval processes remain with humans.
- Source text and tool output are untrusted evidence, never executable instructions.
- No assumption that passing checks or merged code means deployed or safe.
- Selected evidence goes to Copilot. Review artifact/log access and retention before sharing sensitive release details.

## Customise It

Edit labels, checklist references, and company expectations directly in the workflow Markdown. Keep label filters and instructions aligned. Preserve the distinction between required policy and suggested improvement.

## Challenge

Add a dated, candidate-specific support acknowledgement and rerun. Check that the report resolves only that question instead of declaring the whole release ready.
