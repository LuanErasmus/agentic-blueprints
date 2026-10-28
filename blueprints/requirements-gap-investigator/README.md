# Requirements Gap Investigator

**Difficulty:** Beginner

## Problem

An issue can look ready to implement while leaving important behaviour undecided. Different teams need different levels of specification; this blueprint surfaces questions against the supplied repository guidance, rather than imposing a universal definition of ready.

## What the Agent Does

Reads an issue and bounded supporting context, separates stated requirements from assumptions, and recommends questions and acceptance criteria. Reports cite collected sources and call out missing or truncated context. The agent does not rewrite the issue or decide that a requirement has been approved.

## Architecture

```text
Issue trigger or manual dispatch
  → trusted default-branch helper gathers bounded evidence
  → sandboxed Copilot agent analysis with read-only GitHub tools
  → deterministic report validation → restricted report artifact
  → product owner reviews recommendations
```

## Prerequisites

- GitHub Actions, gh-aw, and Copilot inference access. Follow the [gh-aw authentication guide](https://github.github.com/gh-aw/reference/auth/).
- Node.js 24 for offline helper tests; those tests need no credentials.
- An issue describing the proposed change; repository guidance such as `CONTRIBUTING.md` should describe your team's expectations.

## Setup

1. Copy `.github/workflows/requirements-gap-investigator.md`, both `.github/workflows/shared/` Markdown files, the complete `scripts/blueprints/` directory, and this entire blueprint directory with `config.json` into your repository.
2. Install gh-aw and run `gh aw compile requirements-gap-investigator`; review and commit the generated lock beside its source in your repository. This blueprint repository does not ship lock files.
3. Keep all source files on the trusted default branch and configure Copilot authentication as described in [shared setup](../../docs/running-workflows.md). Compiler permissions belong in this main workflow's frontmatter; the PAT fallback removes `copilot-requests: write` before recompiling.
4. Create `requirements-review`, or keep it aligned with `trigger_labels` and workflow frontmatter. Configure repository-relative `guidance_paths` and tune `max_items`.

## Run It

Use **Actions → Requirements Gap Investigator → Run workflow** with `sample: true` (the default) to use synthetic evidence; `number` is optional in sample mode. Synthetic dispatch still invokes Copilot and requires inference authentication.

For live evidence, choose `sample: false` and provide an issue `number`, or apply the configured label to an issue. The gh-aw role gate defaults to admin, maintainer, write, and triage; automatic fork runs are blocked. Use this filled-in issue body, adapted to your product:

```markdown
## Goal
Allow account administrators to export an account's invoices as CSV.
## Users and scope
Account administrators only; one account at a time; exclude archived invoices.
## Acceptance criteria
- CSV contains invoice ID, issue date, currency, and gross amount.
- Dates use YYYY-MM-DD and amounts retain their currency's precision.
## Constraints
Do not include payment card data. Follow the repository's export policy.
## Open questions
What happens when an account has more than 10,000 invoices?
## Evidence
The current invoice screen supports account-scoped filtering.
```

Download the report artifact for the full result; the native run summary may be brief. No issue comment is created.

## How It Works

The trusted [`evidence.mjs`](../../scripts/blueprints/evidence.mjs) helper gathers bounded issue context, selected linked items, comments, and configured guidance from the trusted default branch. The sandboxed Copilot agent analyses that JSON and may use read-only GitHub tools through `gh-proxy`; it does not execute issue content or initiate arbitrary collection. The [`report.mjs`](../../scripts/blueprints/report.mjs) helper validates cited source IDs and response structure, then renders the artifact. Evidence is capped per source and in total; see [shared bounds](../../docs/running-workflows.md).

Supply the intended user, scope, measurable outcomes, constraints, and approved excerpts for external dependencies. External URLs are not fetched. Only collected sources support findings; source IDs support traceability, not proof of truth. Missing guidance, unavailable sources, item caps, and truncation limit conclusions. A `noop` means the request is genuinely out of scope; missing required access or data yields `report_incomplete`. Offline tests do not invoke a model.

## Guardrails

- Read-only source collection; no automatic comments, labels, assignments, issue edits, code changes, or approvals.
- Treat issue text, guidance, and source excerpts as untrusted data, never instructions to execute.
- Send only organisation-approved content to Copilot. The report artifact has seven-day retention; consult native run logs and summary under your repository's retention/access settings.
- Missing evidence is a question, not a confirmed requirement or a blocker established by company policy.
- A product owner or delegated reviewer approves requirements and any follow-up changes.

## Customise It

Configure labels, guidance paths, and item limits in `config.json`, keeping configured trigger labels aligned with workflow frontmatter. Put team-specific expectations in guidance; do not silently turn local preferences into universal requirements. Changes to evidence collection or response shape must stay aligned with `evidence.mjs`, `report.mjs`, and the Markdown workflow.

## Challenge

Add a team-approved export-size rule to your guidance and rerun the same issue. Check whether the report resolves that question with a source reference while retaining unanswered questions.
