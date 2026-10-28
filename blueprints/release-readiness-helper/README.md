# Release Readiness Helper

**Difficulty:** Intermediate

## Problem

Release evidence often spans a checklist, validation results, rollout notes, and outstanding decisions. A concise report can help a release owner spot gaps, but readiness depends on the organisation's policy and cannot be established by a generic checklist.

## What the Agent Does

Reviews a release issue and collected supporting evidence against supplied repository guidance. Separates documented evidence, unresolved conditions, and missing information, then recommends follow-up. It does not approve or block a release, deploy software, or claim that passing checks establish readiness.

## Architecture

```text
Issue release-readiness label / workflow_dispatch
  → exact-label gate → trusted runner gathers bounded release context
  → evidence + prompt → GitHub Models, no model tool grants
  → validate JSON → Actions summary + report artifact
  → authorised release owner makes the release decision
```

## Prerequisites

- GitHub Actions, GitHub Models access permitted for the repository, and Node.js 24.
- `GITHUB_TOKEN` with `models: read` and read permissions for repository and issue context collected by the workflow.
- A release issue identifying the release, scope, validation evidence, rollout/rollback context, and outstanding approvals where your process requires them.

## Setup

1. Copy [the root workflow](../../.github/workflows/release-readiness-helper.yml) into `.github/workflows/release-readiness-helper.yml`.
2. Also copy reusable `.github/workflows/blueprint-runner.yml`, the complete shared `scripts/blueprints/` directory (including `run.mjs` and centralized `samples.mjs`), and this complete blueprint directory with `config.json`. Install all of them on the destination's trusted default branch; copying only the entry workflow will not work.
3. Keep workflow execution and shared scripts on the trusted default branch. The inference step uses `actions/ai-inference@v1` with GitHub Models (`openai/gpt-4o`), `GITHUB_TOKEN`, and `models: read`. No Copilot CLI or `COPILOT_PAT` is needed. Review `max-tokens` and access before enabling.
4. Create `release-readiness` or update `trigger_labels` in `config.json`. The workflow receives labeled events; exact-label gating happens in the runner. Configure repository-relative `guidance_paths` and `max_items` to fit your process.

## Run It

Manually dispatch with `sample: true` (default) and optionally omit `number`. Centralized `scripts/blueprints/samples.mjs` data replaces live source collection, not live model inference: GitHub Models access is still required. Offline fixture tests do not call a model.

For live evidence, dispatch with `sample: false` and the release issue `number`, or add the configured label. A filled-in issue format:

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

Read the Actions summary and download the report artifact; the workflow posts no issue comments.

## How It Works

The entry workflow calls reusable `.github/workflows/blueprint-runner.yml`. The shared [`run.mjs`](../../scripts/blueprints/run.mjs) uses `prepare`, `followup`, and `report` stages to prepare initial evidence, validate a bounded planning call and collect permitted follow-up context, then validate the final evaluation's `summary`, `findings`, `limitations`, and `next_steps` before rendering. Inference has no model tool grants and cannot run release validation.

The issue must contain a line using the exact syntax `Candidate: <40-character SHA>`, as in the filled-in example; a short SHA, tag, or prose reference is not a substitute for the parsed candidate. Supply scope, validation timestamps/results, rollout and rollback instructions, and any approvals your team requires.

Collection supports same-repository `#number` references, issue comments, configured `guidance_paths` at the default/base ref, changed test-like files, and optional `test_paths` arrays of exact repository-relative paths. It does not fetch arbitrary URLs. An issue's reported result is not independent execution evidence, and check results alone do not establish which scenarios ran.

Optional `test_report_paths` configures exact repository-relative JSON report paths with `{ "sha": "0123456789abcdef0123456789abcdef01234567", "conclusion": "success", "scenarios": [{ "name": "invoice export smoke", "result": "passed" }] }`. Scenario results are `passed`, `failed`, or `skipped`; the report SHA must match the candidate. No artifacts or JUnit reports are automatically downloaded or parsed. The supplied `config.json` does not enable these optional test fields.

Source references explain provenance, while missing/truncated context and collection caps constrain recommendations. If context is missing, add an approved excerpt or dated status to the issue, or configure a candidate-matching report file, then rerun manually with the issue number and `sample: false`.

## Guardrails

- Read-only collection and reporting; no release creation, approvals, deployments, rollback execution, issue edits, or automatic comments.
- Human release authority remains unchanged. A recommendation is neither a go/no-go decision nor proof of safety.
- Treat issue text, guidance, and source excerpts as untrusted input; never execute embedded instructions or arbitrary test code.
- Send only approved content to GitHub Models. Review Actions summary/artifact access and retention for potentially sensitive rollout information.
- Do not invent required sign-offs or treat an unprovided sign-off as a policy breach without supplied policy.

## Customise It

Use `config.json` to configure labels, guidance files, and item limits. Put your own readiness expectations in a configured guidance file: for example, pilot rollback ownership or support acknowledgement for customer-facing changes. Policy is company-specific; preserve the distinction between a required control and a suggested improvement.

## Challenge

Add a support acknowledgement with a timestamp and candidate identity. Rerun and check that the report resolves only that question rather than declaring the entire release ready.
