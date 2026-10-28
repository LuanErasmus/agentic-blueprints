# Stakeholder Release Notes Generator

**Difficulty:** Intermediate

## Problem

Commit titles and PR descriptions are not ready-made stakeholder communication. A useful draft needs an explicit release scope, audience context, and careful separation of implemented changes from deployment or availability claims. Communication conventions differ by company and product.

## What the Agent Does

Turns collected changes within an explicit base/head range into a plain-language draft, highlighting relevant impact and uncertainty. Preserves source traceability and distinguishes supplied change evidence from unverified availability. It does not publish a release, notify stakeholders, or declare that merged work is deployed.

## Architecture

```text
Issue stakeholder-notes label / workflow_dispatch
  → exact-label gate → resolve explicit release scope
  → trusted runner gathers bounded comparison evidence + guidance
  → GitHub Models drafts summary and structured findings, no model tools
  → validate response → Actions summary + artifact
  → human edits and approves communication
```

## Prerequisites

- GitHub Actions, approved repository access to GitHub Models, and Node.js 24.
- `GITHUB_TOKEN` with `models: read` plus read permissions for repository comparison, issue, and collected change context.
- A release-context issue and a resolvable base/head range for live runs. Include audience, intended channel, availability, and exclusions where relevant.

## Setup

1. Copy [the root workflow](../../.github/workflows/stakeholder-release-notes-generator.yml) into `.github/workflows/stakeholder-release-notes-generator.yml`.
2. Also copy reusable `.github/workflows/blueprint-runner.yml`, the complete shared `scripts/blueprints/` directory (including `run.mjs` and centralized `samples.mjs`), and this blueprint directory with `config.json`. Install all of them on the destination's trusted default branch; the entry workflow alone is insufficient.
3. Keep executable workflow and runner code on the trusted default branch. Review `actions/ai-inference@v1`, GitHub Models model `openai/gpt-4o`, `max-tokens`, and permissions. Inference uses `GITHUB_TOKEN` with `models: read`; no Copilot CLI or `COPILOT_PAT` is needed.
4. Create `stakeholder-notes` or change `trigger_labels`. The workflow receives labeled events; exact configured-label gating happens in the runner. Configure repository-relative `guidance_paths` for your communication conventions and `max_items` for bounded evidence.

## Run It

Dispatch with `sample: true` (default). `number`, `base_ref`, and `head_ref` are optional for sample mode because it uses centralized `scripts/blueprints/samples.mjs` data. It still calls GitHub Models; offline fixture tests do not.

For live drafting, choose `sample: false` and the release-context issue `number`. Supply optional manual `base_ref` and `head_ref` to identify the comparison range, or use the issue's `## Release scope` section as shown below. For labeled issue runs, the issue must supply the range. Provide a complete, resolvable pair; do not assume the tool can infer your intended release from a date or issue title.

Filled-in issue format:

```markdown
## Release scope
From: v1.7.0
To: v1.8.0

## Audience
Internal account-support team and the two pilot account administrators.
## Communication goal
Explain the invoice CSV pilot in plain language; avoid implementation jargon.
## Availability
Planned for two pilot accounts after release-owner approval; not generally available.
## Important context
Exports exclude archived invoices. No bulk account export is included.
## Known limitations
Large exports remain subject to the pilot size cap.
```

A manual fallback is to dispatch with the issue number, `sample: false`, `base_ref: v1.7.0`, and `head_ref: v1.8.0` if the issue lacks scope fields. Prefer immutable refs or record the resolved source identity when reproducibility matters. Ref comparison gathers data; it does not execute code from the selected refs.

Review the Actions summary and report artifact. No issue comment, release publication, or stakeholder notification is automatic.

## How It Works

The entry workflow calls reusable `.github/workflows/blueprint-runner.yml`. The shared [`run.mjs`](../../scripts/blueprints/run.mjs) resolves source scope from manual inputs or the supported issue section and uses `prepare`, `followup`, and `report` stages: prepare initial evidence, validate a bounded planning call and collect permitted follow-up context, then validate the final evaluation. Inference has no model tool grants. The runner validates `summary`, `findings`, `limitations`, and `next_steps`; the `summary` contains the plain-language draft, while structured findings describe evidence-backed status and uncertainty.

Provide range, audience, intended channel, rollout status, and known exclusions. Alongside the scoped comparison, collection supports same-repository `#number` references, issue comments, and configured `guidance_paths` at the default/base ref; it does not fetch arbitrary URLs or external announcements. Source references identify collected changes; they do not prove deployment, user benefit, or customer entitlement. A PR body alone is not independent availability evidence. Missing or truncated comparisons and `max_items` limits mean the draft may omit changes and must say so. If the range is unavailable or context is incomplete, correct the refs or add an approved excerpt to the issue and rerun manually rather than inventing release content.

## Guardrails

- Read-only evidence collection and draft generation; no publication, comments, edits, release creation, deployment, or external messages.
- A communications or release owner verifies audience suitability, availability, claims, and any sensitive details before sharing.
- Do not equate merged with shipped or infer rollout dates, compliance, performance improvements, or customer promises from commit names.
- Treat issue bodies, commit text, PRs, and guidance as untrusted source data, never executable instructions. Only trusted default-branch workflow code runs.
- GitHub Models receives the supplied evidence; consider confidential change details and Actions summary/artifact access and retention.

## Customise It

Change labels, guidance paths, and item limits in `config.json`. Put team-specific vocabulary, audience expectations, disclosure restrictions, and approval requirements in configured guidance. These are local communication policies, not universal release-note rules. Keep any structured-response changes aligned with runner validation.

## Challenge

Draft notes for the same range for support and engineering audiences. Verify that vocabulary changes, but source-backed facts, rollout uncertainty, exclusions, and approval boundaries do not.
