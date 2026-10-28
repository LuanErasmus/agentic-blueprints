# GitHub PR Review

**Difficulty:** Intermediate

## Problem

Reviewers need to connect a change with company-specific expectations and identify where a human should focus. Native Copilot review and GitHub checks remain the existing review tools.

## What the Agent Does

Prepares an evidence-linked review brief against configured repository guidance. The trusted helper gathers bounded diff, test, check, and review context before the sandboxed Copilot agent assesses concerns. It complements native Copilot review and GitHub checks; it does not post an automated review.

## Architecture

```text
PR event or manual dispatch → trusted default-branch evidence preparation
→ sandboxed Copilot analysis with read-only GitHub tools → validated advisory report
→ restricted report artifact → human review
```

## Prerequisites

GitHub Actions, gh-aw, Copilot inference access, read permissions for evidence, and an eligible PR. Follow the [gh-aw authentication guide](https://github.github.com/gh-aw/reference/auth/). Node.js 24 is needed for offline helper tests.

## Setup

1. Follow [shared setup](../../docs/running-workflows.md). Copy `.github/workflows/pr-review.md`, both shared workflow Markdown files, the complete `scripts/blueprints/` directory, and this blueprint directory with `config.json`.
2. Install gh-aw and run `gh aw compile pr-review` in your repository; review and commit the generated lock there.
3. Configure `guidance_paths` and any supported test evidence paths. Keep the workflow on the trusted default branch; it reads the PR base for guidance and never checks out or executes PR code.
4. Configure native Copilot authentication as described in [shared setup](../../docs/running-workflows.md): compiler permissions belong in this main workflow's frontmatter, and the PAT fallback removes `copilot-requests: write` before recompiling. Review data processing policy and align the `review-preparation` label in config and workflow frontmatter.

## Run It

Use **Actions → PR Review → Run workflow** with `sample: true` first. Synthetic dispatch still invokes Copilot. For live mode, set `sample: false` and enter a PR number.

Automatic runs occur for opened, reopened, synchronized, ready-for-review, and labeled PR events; the default exact label is `review-preparation`. The gh-aw role gate defaults to admin, maintainer, write, and triage. Automatic fork runs and drafts are blocked/skipped. Manual dispatch selects the default branch and does not check out PR head code.

Start from [the PR format](examples/input.md); [example output](examples/output.md) shows a review aid rather than an approval. Read the run summary or download the report artifact.

## How It Works

The trusted `evidence.mjs` helper gathers bounded PR patches, discussion, checks, review context, test sources/reports, and guidance from the base revision. It caps each source at 6,000 characters and the total at 18,000. The sandboxed Copilot agent may consult read-only GitHub tools through `gh-proxy`, but no PR code or tests are executed. `report.mjs` validates citations and renders the report. Missing, binary, or truncated patches limit conclusions. See [shared evidence and report limits](../../docs/running-workflows.md).

## Guardrails

- **Access:** PR metadata, bounded patches, guidance, discussion, and selected test/check evidence.
- **Actions:** report artifact only; no automatic comments, labels, or review submissions.
- **Approval:** a human inspects the full change and makes review/merge decisions.
- **Never automatic:** approval, change requests, commits, merge, or execution of PR code.
- **Permissions:** declared GitHub reads and native Copilot inference authentication; no GitHub write tools.
- **Data handling:** selected code/evidence goes to Copilot. Read the uploaded report artifact for the full result; the native run summary is not the complete report.

## Customise It

Point `guidance_paths` at your review checklist; do not assume one branch strategy or language. Align trigger label config with workflow frontmatter. For detailed behaviour-to-test mapping use [Test Scenario Planner](../test-scenario-planner/) rather than expanding this blueprint into a second coverage tool.

## Challenge

Add a company-specific compatibility rule and evaluate whether the brief correctly identifies its applicability without inventing a violation.
