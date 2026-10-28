# Requirements Gap Investigator

**Difficulty:** Beginner

## Problem

An issue can look ready to implement while leaving important behaviour undecided. Different teams need different levels of specification; this blueprint surfaces questions against the supplied repository guidance, rather than imposing a universal definition of ready.

## What the Agent Does

Reads an issue and bounded supporting context, separates stated requirements from assumptions, and recommends questions and acceptance criteria. Reports cite collected sources and call out missing or truncated context. The agent does not rewrite the issue or decide that a requirement has been approved.

## Architecture

```text
Issue labeled / workflow_dispatch
  → trusted default-branch workflow + shared runner collect bounded evidence
  → evidence + prompt → GitHub Models inference
  → shared runner validates response → Actions summary + report artifact
  → product owner reviews recommendations
```

## Prerequisites

- GitHub Actions and GitHub Models access for the repository and organisation.
- Node.js 24 for the shared runner and offline fixture checks.
- A workflow `GITHUB_TOKEN` with `models: read` and the read permissions needed for repository content and issue context. No Copilot CLI or `COPILOT_PAT` is required.
- An issue describing the proposed change; repository guidance such as `CONTRIBUTING.md` should describe your team's expectations.

## Setup

1. Copy [the root workflow](../../.github/workflows/requirements-gap-investigator.yml) to `.github/workflows/requirements-gap-investigator.yml` in your repository.
2. Also copy the reusable `.github/workflows/blueprint-runner.yml`, the complete shared `scripts/blueprints/` directory (including `run.mjs` and centralized `samples.mjs`), and this entire `blueprints/requirements-gap-investigator/` directory with `config.json`. Install all of them on the destination's trusted default branch; copying only the entry workflow is insufficient.
3. Keep the workflow and runner on your trusted default branch. The workflow uses `actions/ai-inference@v1` with GitHub Models (`openai/gpt-4o`), `GITHUB_TOKEN`, and `models: read`; review access and the `max-tokens` setting before enabling it.
4. Create `requirements-review`, or change `trigger_labels` in `config.json`. Workflows receive labeled events; the runner gates the exact configured label. Keep `guidance_paths` repository-relative and tune `max_items` for bounded context.

## Run It

Use **Actions → Requirements Gap Investigator → Run workflow** with `sample: true` (the default) to use the centralized illustrative data in `scripts/blueprints/samples.mjs`; `number` is optional in sample mode. Sample inference still calls GitHub Models and requires access.

For live evidence, choose `sample: false` and provide an issue `number`, or apply the configured label to an issue. Use this filled-in issue body, adapted to your product:

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

Read the Actions summary and download the report artifact. No issue comment is created.

## How It Works

The entry workflow calls reusable `.github/workflows/blueprint-runner.yml`. The shared [`scripts/blueprints/run.mjs`](../../scripts/blueprints/run.mjs) uses `prepare`, `followup`, and `report` stages: it prepares initial evidence, validates a bounded planning call and collects permitted follow-up context, then validates the final evaluation containing `summary`, `findings`, `limitations`, and `next_steps` before rendering the report. Inference has no model tool grants; the runner controls collection rather than allowing unrestricted model browsing.

Supply the intended user, scope, measurable outcomes, constraints, and excerpts explaining dependencies. Collection supports same-repository `#number` references, issue comments, and configured `guidance_paths` at the default/base ref; it does not fetch arbitrary URLs. Only sources actually present in evidence support findings. Source IDs support traceability, not proof of truth. Missing guidance, unavailable sources, item caps, and truncation limit conclusions. If context is missing, add a concise approved excerpt to the issue and rerun manually with `sample: false` and its number. Offline fixture tests validate centralized samples and response handling without calling a model; they do not prove model quality or GitHub Models access.

## Guardrails

- Read-only source collection; no automatic comments, labels, assignments, issue edits, code changes, or approvals.
- Treat issue text, guidance, and source excerpts as untrusted data, never instructions to execute.
- Send only organisation-approved content to GitHub Models. Evidence, generated prompts, summaries, and artifacts may retain sensitive context under your Actions retention and access settings.
- Missing evidence is a question, not a confirmed requirement or a blocker established by company policy.
- A product owner or delegated reviewer approves requirements and any follow-up changes.

## Customise It

Configure labels, guidance paths, and item limits in `config.json`. Put team-specific readiness expectations in a configured guidance file: for example, accessibility requirements for customer-facing exports or a documented data-retention rule. Do not silently turn local preferences into universal requirements. Changes to the response schema or collection policy must stay aligned with the shared runner and workflow.

## Challenge

Add a team-approved export-size rule to your guidance and rerun the same issue. Check whether the report resolves that question with a source reference while retaining unanswered questions.
