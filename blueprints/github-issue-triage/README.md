# GitHub Issue Triage

**Difficulty:** Beginner

## Problem

Incoming issues need context-aware routing and useful clarification, beyond a fixed label rule.

## What the Agent Does

Analyses trusted, bounded issue evidence and real repository labels, then recommends classification, clarification, and a next step. It complements native issue forms and label automation; it does not change issue content or labels.

## Architecture

```text
Issue trigger or manual dispatch → trusted evidence preparation on the default branch
→ sandboxed Copilot analysis with read-only GitHub tools → validated advisory report
→ restricted report artifact → maintainer decision
```

## Prerequisites

GitHub Actions, gh-aw, and Copilot inference access for the repository. Follow the [gh-aw authentication guide](https://github.github.com/gh-aw/reference/auth/). Offline helper tests need Node.js 24 and no credentials.

## Setup

1. Follow [shared setup](../../docs/running-workflows.md). Copy `.github/workflows/issue-triage.md`, both shared workflow Markdown files, the complete `scripts/blueprints/` directory, and this blueprint directory (including `config.json`) into your repository.
2. Install gh-aw and run `gh aw compile issue-triage` in that repository. Review and commit the generated lock beside its source there; this blueprint repository does not include lock files.
3. Keep the source, shared files, scripts, and config on the trusted default branch. Align `config.json`'s `trigger_labels` with the workflow frontmatter and create the label in the repository.
4. Configure native Copilot authentication as described in [shared setup](../../docs/running-workflows.md): compiler permissions belong in this main workflow's frontmatter, and the PAT fallback removes `copilot-requests: write` before recompiling. Review data sent to Copilot, then test with a synthetic dispatch before using private issue content.

## Run It

For a first run, open **Actions → Issue Triage → Run workflow**, leave `sample: true`, and inspect the uploaded report artifact. Synthetic dispatch still invokes native Copilot inference.

For live mode, set `sample: false` and enter an issue number. The workflow also runs on opened/reopened/labeled issue events, gated by the exact `triage-review` label. Manual runs use the default branch; the gh-aw role gate defaults to admin, maintainer, write, and triage. Automatic fork runs are blocked.

Copy [this filled-in issue](examples/input.md) into a GitHub issue or adapt it into an issue form. See the [illustrative output](examples/output.md).

## How It Works

The trusted `evidence.mjs` helper gathers bounded issue context, selected linked items, company guidance, and repository labels before inference. The sandboxed Copilot agent may use read-only GitHub tools through `gh-proxy`; it does not execute issue content or trigger arbitrary follow-up collection. The `report.mjs` helper validates citations and allowed labels and renders the report. Evidence is capped at 6,000 characters per source and 18,000 total. Source IDs support traceability, not proof of truth; humans verify conclusions.

## Guardrails

- **Access:** issue context, selected guidance, labels, and explicitly referenced same-repository work items.
- **Actions:** read evidence and write a run summary/report artifact only. Unlike the earlier example, this version does not automatically post issue comments.
- **Approval:** maintainers decide labels, priority, ownership, and next actions.
- **Never automatic:** assigning, labelling, closing, changing issue contents, or deploying.
- **Permissions:** read-only GitHub evidence tools plus gh-aw's Copilot inference authentication; no GitHub write tools.
- **Data handling:** selected evidence is sent to Copilot. Only `report.md` and `report.json` are uploaded, as run artifacts with seven-day retention; use the artifact for the full report, not the native run summary.

## Customise It

Adapt the example headings and guidance to your company. Keep factual references as same-repository `#number` links. Align any changed configured trigger labels with workflow frontmatter, and preserve the evidence bounds and read-only boundary.

## Challenge

Add company guidance describing category boundaries, then compare recommendations on two ambiguous synthetic issues.
