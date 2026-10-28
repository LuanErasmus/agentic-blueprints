# Stakeholder Release Notes Generator

**Difficulty:** Intermediate

## Problem

Commit titles and PR descriptions are not ready-made stakeholder communication. A useful draft needs an explicit release scope, audience context, and careful separation of implemented changes from deployment or availability claims. Communication conventions differ by company and product.

## What the Agent Does

Turns collected changes within an explicit base/head range into a plain-language draft, highlighting relevant impact and uncertainty. Preserves source traceability and distinguishes supplied change evidence from unverified availability. It does not publish a release, notify stakeholders, or declare that merged work is deployed.

## Architecture

```text
Issue trigger or manual dispatch
  → exact-label gate → resolve explicit release scope
  → trusted helper gathers bounded comparison evidence and guidance
  → sandboxed Copilot analysis with read-only GitHub tools
  → validated draft report artifact
  → human edits and approves communication
```

## Prerequisites

**Copilot licence:** an organisation-owned repository with **Copilot Business (minimum standard organisation plan) or Copilot Enterprise**, and Copilot CLI organisation billing enabled. These blueprints use `copilot-requests: write`, not a PAT. Personal Copilot plans alone do not enable this method. See [licence, policy, and billing requirements](../../docs/running-workflows.md#copilot-licence-and-authentication-requirements), including the separate offering for eligible enterprises.

- GitHub Actions, gh-aw, Copilot inference access, and Node.js 24 for offline helper tests. See [gh-aw authentication](https://github.github.com/gh-aw/reference/auth/).
- A release-context issue and a resolvable base/head range for live runs. Include audience, intended channel, availability, and exclusions where relevant.

## Setup

1. Copy [stakeholder-release-notes-generator.md](stakeholder-release-notes-generator.md) from this folder to `.github/workflows/stakeholder-release-notes-generator.md` in your repository. Copy both files from [`../shared/`](../shared/) to `.github/workflows/shared/`, the complete `scripts/blueprints/` directory to the same path, and this blueprint directory with `config.json` to `blueprints/stakeholder-release-notes-generator/`.
2. Install gh-aw and run `gh aw compile stakeholder-release-notes-generator` in your repository; review and commit the generated lock beside its source there.
3. Keep executable workflow and helper code on the trusted default branch. Configure native Copilot authentication, including explicit permissions in the main workflow frontmatter as described in [shared setup](../../docs/running-workflows.md).
4. Create `stakeholder-notes` or align `trigger_labels` with workflow frontmatter. Configure repository-relative `guidance_paths` and `max_items`.

## Run It

Dispatch with `sample: true` (default). `number`, `base_ref`, and `head_ref` are optional in sample mode because it uses synthetic evidence. It still invokes Copilot; offline helper tests do not.

For live drafting, choose `sample: false` and the release-context issue `number`. Supply optional manual `base_ref` and `head_ref` to identify the comparison range, or use the issue's `## Release scope` section as shown below. For labeled issue runs, the issue must supply the range. Provide a complete, resolvable pair; do not assume the tool can infer your intended release from a date or issue title. gh-aw's default role gate is admin, maintainer, write, and triage; automatic fork runs are blocked.

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

A manual fallback is to dispatch with the issue number, `sample: false`, `base_ref: v1.7.0`, and `head_ref: v1.8.0` if the issue lacks scope fields. The helper resolves both to immutable commits, rejects reversed or divergent ranges, and returns `noop` for identical endpoints. Prefer immutable refs or record the resolved source identity when reproducibility matters. Ref comparison gathers data; it does not execute code from the selected refs.

Download the report artifact for the full draft; the native run summary may be brief. No issue comment, release publication, or stakeholder notification is automatic.

## How It Works

The trusted [`evidence.mjs`](../../scripts/blueprints/evidence.mjs) helper resolves scope from manual inputs or the supported issue section and gathers bounded changes, linked items, and configured guidance. The sandboxed Copilot agent may use read-only GitHub tools through `gh-proxy`, but it cannot execute code from either ref. [`report.mjs`](../../scripts/blueprints/report.mjs) validates the assessment and renders the report; the draft text is an advisory artifact, not a publication.

Provide range, audience, intended channel, rollout status, and known exclusions. Alongside the scoped comparison, collection supports same-repository `#number` references, issue comments, and configured `guidance_paths` at the default/base ref; it does not fetch arbitrary URLs or external announcements. Source references identify collected changes; they do not prove deployment, user benefit, or customer entitlement. Source snapshots are supplied claims, not attested facts. A PR body alone is not independent availability evidence. Missing or truncated comparisons and `max_items` limits mean the draft may omit changes and must say so. If the range is unavailable or context is incomplete, correct the refs or add an approved excerpt to the issue and rerun manually rather than inventing release content. Offline tests do not validate live Copilot results.

## Guardrails

- Read-only evidence collection and draft generation; no publication, comments, edits, release creation, deployment, or external messages.
- A communications or release owner verifies audience suitability, availability, claims, and any sensitive details before sharing.
- Do not equate merged with shipped or infer rollout dates, compliance, performance improvements, or customer promises from commit names.
- Treat issue bodies, commit text, PRs, and guidance as untrusted source data, never executable instructions. Only trusted default-branch workflow code runs.
- Copilot receives supplied evidence; consider confidential change details and artifact/log access and retention. The full report is in a seven-day artifact, not guaranteed in the native run summary. Safe outputs disable issue creation, failure-reporting issues, and noop-tracker issues.

## Customise It

Change labels, guidance paths, and item limits in `config.json`, keeping labels aligned with workflow frontmatter. Put team-specific vocabulary, audience expectations, disclosure restrictions, and approval requirements in configured guidance. These are local communication policies, not universal release-note rules. Keep changes aligned with the evidence helper, workflow, and report contract.

## Challenge

Draft notes for the same range for support and engineering audiences. Verify that vocabulary changes, but source-backed facts, rollout uncertainty, exclusions, and approval boundaries do not.
