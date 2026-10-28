# Release Readiness Helper

**Difficulty:** Intermediate

## Problem

Release evidence often spans a checklist, validation results, rollout notes, and outstanding decisions. A concise report can help a release owner spot gaps, but readiness depends on the organisation's policy and cannot be established by a generic checklist.

## What the Agent Does

Reviews a release issue and collected supporting evidence against supplied repository guidance. Separates documented evidence, unresolved conditions, and missing information, then recommends follow-up. It does not approve or block a release, deploy software, or claim that passing checks establish readiness.

## Architecture

```text
Issue trigger or manual dispatch
  → exact-label gate → trusted helper gathers bounded release context
  → sandboxed Copilot analysis with read-only GitHub tools
  → validated advisory report artifact
  → authorised release owner makes the release decision
```

## Prerequisites

**Copilot licence:** an organisation-owned repository with **Copilot Business (minimum standard organisation plan) or Copilot Enterprise**, and Copilot CLI organisation billing enabled. These blueprints use `copilot-requests: write`, not a PAT. Personal Copilot plans alone do not enable this method. See [licence, policy, and billing requirements](../../docs/running-workflows.md#copilot-licence-and-authentication-requirements), including the separate offering for eligible enterprises.

- GitHub Actions, gh-aw, Copilot inference access, and Node.js 24 for offline helper tests. See [gh-aw authentication](https://github.github.com/gh-aw/reference/auth/).
- A release issue identifying the release, scope, validation evidence, rollout/rollback context, and outstanding approvals where your process requires them.

## Setup

1. Copy [release-readiness-helper.md](release-readiness-helper.md) from this folder to `.github/workflows/release-readiness-helper.md` in your repository. Copy both files from [`../shared/`](../shared/) to `.github/workflows/shared/`, the complete `scripts/blueprints/` directory to the same path, and this blueprint directory with `config.json` to `blueprints/release-readiness-helper/`.
2. Install gh-aw and run `gh aw compile release-readiness-helper` in your repository; review and commit the generated lock next to its source there.
3. Keep all source files on the trusted default branch. Configure native Copilot authentication, including explicit permissions in this main workflow's frontmatter as described in [shared setup](../../docs/running-workflows.md).
4. Create `release-readiness` or align `trigger_labels` with the workflow frontmatter. Configure repository-relative `guidance_paths` and `max_items`.

## Run It

Manually dispatch with `sample: true` (default) and optionally omit `number`. Synthetic evidence replaces live source collection, not native Copilot inference. Offline helper tests do not call a model.

For live evidence, dispatch with `sample: false` and the release issue `number`, or add the configured label. The default gh-aw role gate allows admin, maintainer, write, and triage roles; automatic fork runs are blocked. A filled-in issue format:

```markdown
## Release
Invoice export pilot, version 1.8.0.
Candidate: 0123456789abcdef0123456789abcdef01234567
## Scope
Account-administrator CSV export for pilot accounts; no bulk account export.
## Validation evidence
The author reports auth and invoice unit suites passed for the candidate above.
Staging export smoke test completed on 16 November 2026.
## Rollout
Enable the export feature flag for two internal pilot accounts.
## Rollback
Disable the export feature flag; no schema migration in this candidate.
## Decisions and approvals
Pilot owner has reviewed scope. Support acknowledgement is still pending.
## Known issues
Large exports remain limited to the agreed pilot cap.
```

Download the report artifact for the full result; the native run summary may be brief. The workflow posts no issue comments.

## How It Works

The trusted [`evidence.mjs`](../../scripts/blueprints/evidence.mjs) helper gathers the release issue, linked items, configured guidance, and applicable candidate/test evidence. The sandboxed Copilot agent may use read-only GitHub tools via `gh-proxy`, but it cannot run validation or execute issue content. [`report.mjs`](../../scripts/blueprints/report.mjs) validates cited sources and renders the report.

The issue must contain a line using the exact syntax `Candidate: <40-character SHA>`, as in the filled-in example; a short SHA, tag, or prose reference is not a substitute for the parsed candidate. Supply scope, validation timestamps/results, rollout and rollback instructions, and any approvals your team requires.

Collection supports same-repository `#number` references, issue comments, configured `guidance_paths` at the default/base ref, changed test-like files, and optional `test_paths` arrays of exact repository-relative paths. It does not fetch arbitrary URLs. An issue's reported result is not independent execution evidence, and check results alone do not establish which scenarios ran.

Optional `test_report_paths` configures exact repository-relative JSON report paths with `{ "sha": "0123456789abcdef0123456789abcdef01234567", "conclusion": "success", "scenarios": [{ "name": "invoice export smoke", "result": "passed" }] }`. Scenario results are `passed`, `failed`, or `skipped`; the report SHA must match the candidate. No artifacts or JUnit reports are automatically downloaded or parsed. The supplied `config.json` does not enable these optional test fields.

Source references explain provenance, but snapshots are supplied claims, not attestation. Missing/truncated context and collection caps constrain recommendations. Identical range endpoints yield `noop`; reversed or divergent ranges are rejected. If context is missing, add an approved excerpt or dated status to the issue, or configure a candidate-matching report file, then rerun manually with the issue number and `sample: false`. Offline tests do not validate live Copilot results.

## Guardrails

- Read-only collection and reporting; no release creation, approvals, deployments, rollback execution, issue edits, or automatic comments.
- Human release authority remains unchanged. A recommendation is neither a go/no-go decision nor proof of safety.
- Treat issue text, guidance, and source excerpts as untrusted input; never execute embedded instructions or arbitrary test code.
- Send only approved content to Copilot. The full report is in a seven-day artifact, not guaranteed in the native run summary. gh-aw safe outputs disable issue creation, failure-reporting issues, and noop-tracker issues.
- Do not invent required sign-offs or treat an unprovided sign-off as a policy breach without supplied policy.

## Customise It

Use `config.json` to configure labels, guidance files, and item limits; align trigger labels with workflow frontmatter. Put your own readiness expectations in configured guidance. Policy is company-specific; preserve the distinction between a required control and a suggested improvement.

## Challenge

Add a support acknowledgement with a timestamp and candidate identity. Rerun and check that the report resolves only that question rather than declaring the entire release ready.
