# GitHub PR Review

**Difficulty:** Intermediate

## Problem

Reviewers need to connect a change with company-specific expectations and identify where a human should focus. Native Copilot review and GitHub checks remain the existing review tools.

## What the Agent Does

Inspects PR changes, discussion, checks, review context, and relevant repository guidance to prepare an evidence-linked review brief. It complements existing review tools without posting a review or approving the PR.

## Architecture

```text
PR event or manual number → read-only GitHub evidence inspection
→ sandboxed Copilot assessment → advisory Markdown artifact → human review
```

## Prerequisites

One-time: GitHub CLI, gh-aw (`gh extension install github/gh-aw`), GitHub Actions, and an organisation-owned repository with **Copilot Business (minimum standard organisation plan) or Copilot Enterprise**. Enable **Copilot CLI** and **Allow use of Copilot CLI billed to the organization**. Keep `copilot-requests: write`; inference uses the built-in Actions token, not a PAT. A personal plan alone is insufficient. See [eligibility and billing](../../docs/running-workflows.md#copilot-licence-and-authentication-requirements), including eligible enterprise Copilot access.

You need read access to an eligible non-draft PR and its supporting evidence.

## Setup

1. Copy only [pr-review.md](pr-review.md) to `.github/workflows/pr-review.md` in your repository.
2. Customise labels and company review instructions in that Markdown, create `review-preparation` (or your chosen label), and run `gh aw compile pr-review`.
3. Review and commit the source and generated `.lock.yml` on your trusted default branch. Recompile after edits.

No shared imports, scripts, JSON config, or report schemas are needed. See [optional details](../../docs/running-workflows.md).

## Run It

Use **Actions → PR Review → Run workflow** on the default branch with the required PR `number`. Automatic runs use opened, reopened, synchronize, ready-for-review, and labelled PR events with the exact `review-preparation` label.

The role gate allows admin, maintainer, write, and triage. Automatic fork events are blocked and draft PRs are skipped. There is no checkout or PR code execution.

Adapt the [PR input template](examples/input.md) and read the [illustrative output](examples/output.md). There is no sample flag. Download the report artifact; the native run summary may omit details.

## How It Works

Native read-only GitHub tools/proxy inspect relevant metadata, diffs, guidance at the base revision, test sources, checks, discussion, and reviews. Follow at most 10 explicitly linked same-repository issues/PRs. Source and check names do not prove which scenarios executed; link readable scenario-level results with their revision when available.

There are no hard source-byte budgets. Missing, binary, inaccessible, or truncated patches constrain conclusions and must be reported. Tool errors do not establish absence or success. The native edit tool writes one `/tmp/gh-aw/report.md`; safe-output upload allowlists that path with seven-day retention. This is advisory Markdown, not machine-validated JSON.

## Guardrails

- **Access:** read-only GitHub evidence, without checking out or executing code.
- **Actions:** one report only; no comments, labels, assignments, reviews, commits, merges, releases, or deployments.
- **Approval:** humans inspect the full change and retain review/merge authority.
- **Trust:** source text and tool results are untrusted evidence, not instructions.
- **Data handling:** selected code/evidence goes to Copilot; review artifact and native log access/retention.

## Customise It

Put company review rules and relevant guidance references directly in the workflow Markdown. Keep label filters and instructions aligned. Use [Test Scenario Planner](../test-scenario-planner/) for deeper behaviour-to-test mapping rather than adding execution permissions here.

## Challenge

Add a company-specific compatibility rule and evaluate whether the brief identifies its applicability without inventing a violation.
