# GitHub PR Review

**Difficulty:** Intermediate

## Problem

Reviewers need to connect a change with company-specific expectations and identify where a human should focus. Native Copilot review and GitHub checks remain the existing review tools.

## What the Agent Does

Prepares an evidence-linked review brief against configured repository guidance. Selects a bounded test-source or check lookup, then evaluates concerns against the evidence. It does not duplicate native review by posting an automated GitHub review.

## Architecture

```text
PR / manual selection → collect diff and base-revision guidance → choose test/check lookup
→ collect evidence without executing code → evaluate concerns → human review
```

## Prerequisites

Actions, GitHub Models access, workflow read permissions, and an eligible PR. Node.js 24 for local offline examples.

## Setup

1. Follow [shared setup](../../docs/running-workflows.md). Copy `.github/workflows/pr-review.yml`, the reusable runner workflow, `scripts/blueprints/`, and this directory to the trusted default branch.
2. Configure `config.json` guidance paths and optional exact `test_paths` / `test_report_paths`.
3. Use your actual review expectations in the configured guidance. Defaults reference `CONTRIBUTING.md`.
4. Approve model processing of the intended source data under your company's policy.

## Run It

Use **Actions → GitHub PR Review → Run workflow** with `sample` enabled first. For live mode, clear `sample` and enter a PR number.

Automatic runs occur for opened, reopened, updated, ready-for-review, and configured-label events. Draft/fork PR events are skipped; a maintainer may manually analyse a fork PR without checking out its code.

Start from [the PR format](examples/input.md); [example output](examples/output.md) shows a review aid rather than an approval. Read the run summary or download the report artifact.

## How It Works

The GitHub API supplies a bounded set of file patches and discussion. Guidance comes from the PR base revision, not proposed edits. The planner chooses one allowed evidence lookup; the evaluator checks findings against the combined evidence. No PR code is checked out or executed. Missing/binary/truncated patches limit the result. Test-source inspection covers changed test-like files and configured exact paths only. See [supported evidence formats](../../docs/running-workflows.md).

## Guardrails

- **Access:** PR metadata, bounded patches, guidance, discussion, and selected test/check evidence.
- **Actions:** summary and report artifact only.
- **Approval:** a human inspects the full change and makes review/merge decisions.
- **Never automatic:** approval, change requests, commits, merge, or execution of PR code.
- **Permissions:** declared GitHub reads and `models: read`; model tools are not enabled.
- **Data handling:** selected code goes to GitHub Models. A second model opinion and valid citations do not guarantee correctness.

## Customise It

Point `guidance_paths` at your review checklist; do not assume one branch strategy or language. For detailed behaviour-to-test mapping use [Test Scenario Planner](../test-scenario-planner/) rather than expanding this blueprint into a second coverage tool.

## Challenge

Add a company-specific compatibility rule and evaluate whether the brief correctly identifies its applicability without inventing a violation.
