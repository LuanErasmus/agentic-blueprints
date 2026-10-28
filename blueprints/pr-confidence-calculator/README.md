# PR Confidence Calculator

**Difficulty:** Intermediate

## Problem

A green check alone does not explain how well a PR's scope, execution evidence, scenarios, and review support a decision. A team-specific evidence index can expose gaps, but a generated number must not masquerade as a probability of correctness.

## What the Agent Does

Assesses four evidence dimensions with source references. The shared runner validates those assessments and deterministically calculates an index using configured weights, withholding the aggregate when fewer than the configured minimum dimensions have evidence. Unknown dimensions retain their weight in the denominator rather than inflating the result by renormalisation. The result is a review aid, never a bug-free claim, merge approval, or calibrated probability.

## Architecture

```text
PR confidence-review label / workflow_dispatch
  → exact-label gate → trusted runner collects bounded PR evidence
  → GitHub Models proposes source-linked dimension assessments
  → validate response and dimensions → deterministic runner calculator
  → Actions summary + artifact → maintainer decision
```

## Prerequisites

- GitHub Actions, repository-approved GitHub Models access, and Node.js 24.
- `GITHUB_TOKEN` with `models: read` and read permissions for repository contents, PRs, and collected validation/review evidence as declared in the workflow.
- A PR with an explanation of scope, validation evidence, scenario coverage, and review context. Claims in a PR body are not equivalent to independent check or review records.

## Setup

1. Copy [the root workflow](../../.github/workflows/pr-confidence-calculator.yml) into `.github/workflows/pr-confidence-calculator.yml`.
2. Also copy reusable `.github/workflows/blueprint-runner.yml`, the complete shared `scripts/blueprints/` directory (including `run.mjs` and centralized `samples.mjs`), and this whole blueprint directory with `config.json`. Install all of them on the destination's trusted default branch; the entry workflow needs all of them.
3. Keep executable code on the trusted default branch. The inference step uses `actions/ai-inference@v1` with GitHub Models (`openai/gpt-4o`), `GITHUB_TOKEN`, and `models: read`; no Copilot CLI or PAT is required. Review model access, `max-tokens`, and permissions.
4. Create `confidence-review` or change `trigger_labels`. Labeled events reach the workflow; the runner gates the exact configured label.
5. Review `guidance_paths`, `max_items`, the four weights, and `minimum_evidence_dimensions`. Defaults are scope 20, execution 30, scenarios 30, review 20, and at least three evidenced dimensions. These are example policy choices, not industry standards.

## Run It

Dispatch with `sample: true` (default) to use centralized `scripts/blueprints/samples.mjs` data; `number` is optional. Sample inference still requires GitHub Models access. Offline fixture tests exercise validation/calculation without a model.

For live evidence, choose `sample: false` and a PR `number`, or apply the configured label. Use a filled-in PR body such as:

```markdown
## Scope
Add a bounded CSV export for account administrators; closes #42.
## Execution evidence
Invoice unit suite check passed for the current PR head in CI.
No candidate-matching supplied JSON test report is configured yet.
No browser smoke-test result is available yet.
## Scenario evidence
Tests cover empty exports and permission denial; export-size boundary is unverified.
## Review
Finance reviewer confirmed the columns. Platform review is still requested.
## Known limitations
Pilot accounts only; no bulk account export.
```

Read the Actions summary and report artifact. No PR comments or merge actions occur automatically.

## How It Works

The entry workflow calls reusable `.github/workflows/blueprint-runner.yml`. The shared [`run.mjs`](../../scripts/blueprints/run.mjs) uses `prepare`, `followup`, and `report` stages to prepare initial evidence, validate a bounded planning call and collect permitted follow-up context, then validate the final evaluation and calculate the index outside the model. The response includes `summary`, `findings`, `limitations`, and `next_steps`, plus a `dimensions` map with exactly these concepts:

| Dimension | Evidence to supply | Default weight |
| --- | --- | --- |
| `scope` | Intended behaviour, changed surface, known exclusions | 20 |
| `execution` | Supplied candidate-matching JSON test report and scenario results; checks alone are insufficient | 30 |
| `scenarios` | Described tested behaviours, boundaries, and unresolved cases | 30 |
| `review` | Collected review decisions and unresolved feedback | 20 |

Each dimension is either `null` for unavailable evidence or `{ "score": 0..100, "sources": ["source IDs"], "reason": "explanation" }`. The `0..100` notation describes the range, not literal JSON. Source IDs must refer to collected evidence; invented references are not acceptable. The model supplies assessments, not the final numeric result. Fixed inputs and configuration produce the same calculator result, but model assessments can vary between inference runs.

`minimum_evidence_dimensions: 3` means fewer than three evidenced dimensions withholds the aggregate. When the minimum is met, the weighted numerator uses supported dimension scores while the denominator includes all configured weights, including unknown dimensions. Unknowns therefore cannot inflate the index by dropping their weight; they remain explicitly unknown, not proven failures. Missing/truncated source context and collection caps must remain visible. A withheld result is not zero, a failure, or an approval. Do not compare indexes across teams or weight changes as though they used the same scale.

Collection supports same-repository `#number` references, issue comments, configured `guidance_paths` at the default/base ref, changed test-like files, and optional `test_paths` arrays of exact repository-relative file paths. It does not fetch arbitrary URLs. Test source and check success alone do not demonstrate scenario execution.

Optional `test_report_paths` names exact repository-relative JSON reports shaped as `{ "sha": "<40-character PR head SHA>", "conclusion": "success", "scenarios": [{ "name": "permission denial", "result": "passed" }] }`. Scenario results are `passed`, `failed`, or `skipped`. The runner forces `execution` to unknown without a supplied report matching the candidate SHA, even if checks succeeded or the model proposed a score. It does not automatically download artifacts or parse JUnit. The optional `test_paths` and `test_report_paths` fields are supported but are not enabled in the supplied `config.json`.

Supply candidate-matching reports, concrete scenario evidence, and actual review context. If evidence is missing, configure an appropriate report file or restore access to the relevant source, then manually rerun with the PR number and `sample: false`. Never substitute invented dimension scores.

## Guardrails

- No model tool grants, test execution, arbitrary PR code execution, comments, edits, approvals, or merges.
- A 100-point index is not “100% correct,” a security assessment, release readiness, or a bug-free guarantee.
- Company-specific scoring guidance belongs in configured repository guidance; humans retain merge authority.
- Treat PR content and collected output as untrusted data. Only trusted default-branch workflow and runner code executes.
- GitHub Models processes the supplied context. Review sensitive-data exposure and Actions summary/artifact retention and access.

## Customise It

Adjust weights and the minimum evidence count in `config.json` only with team agreement; keep the four dimension names aligned with the runner. Put dimension interpretation and acceptable evidence in configured guidance. Document policy changes when comparing reports over time. Do not add a merge threshold or call the index a probability without a separately designed and validated process.

## Challenge

Run an example with missing review and scenario evidence and verify that the score is withheld. Add real evidence, rerun, and inspect both limitations and dimension reasons before interpreting any aggregate.
