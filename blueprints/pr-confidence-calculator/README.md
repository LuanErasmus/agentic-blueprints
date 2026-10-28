# PR Confidence Calculator

**Difficulty:** Intermediate

## Problem

A green check alone does not explain how well a PR's scope, execution evidence, scenarios, and review support a decision. A team-specific evidence index can expose gaps, but a generated number must not masquerade as a probability of correctness.

## What the Agent Does

Assesses four evidence dimensions with source references. A deterministic report helper validates the native Copilot agent's assessments and calculates an index using configured weights, withholding the aggregate when fewer than the configured minimum dimensions have evidence. Unknown dimensions retain their weight in the denominator rather than inflating the result by renormalisation. The result is a review aid, never a bug-free claim, merge approval, or calibrated probability.

## Architecture

```text
PR label or manual dispatch
  → exact-label gate → trusted helper collects bounded PR evidence
  → sandboxed Copilot analysis with read-only GitHub tools
  → deterministic validation and weighted calculation
  → restricted report artifact → maintainer decision
```

## Prerequisites

- GitHub Actions, gh-aw, Copilot inference access, and Node.js 24 for offline helper tests. See [gh-aw authentication](https://github.github.com/gh-aw/reference/auth/).
- A PR with an explanation of scope, validation evidence, scenario coverage, and review context. Claims in a PR body are not equivalent to independent check or review records.

## Setup

1. Copy `.github/workflows/pr-confidence-calculator.md`, both shared workflow Markdown files, the complete `scripts/blueprints/` directory, and this whole blueprint directory with `config.json`.
2. Install gh-aw and run `gh aw compile pr-confidence-calculator`; review and commit the generated lock beside its source in your repository.
3. Keep executable code on the trusted default branch. Configure native Copilot authentication, including explicit permissions in this main workflow's frontmatter as described in [shared setup](../../docs/running-workflows.md).
4. Create `confidence-review` or change `trigger_labels`; keep it aligned with workflow frontmatter.
5. Review `guidance_paths`, `max_items`, the four weights, and `minimum_evidence_dimensions`. Defaults are scope 20, execution 30, scenarios 30, review 20, and at least three evidenced dimensions. These are example policy choices, not industry standards.

## Run It

Dispatch with `sample: true` (default) to use synthetic evidence; `number` is optional. Sample dispatch still requires Copilot inference authentication. Offline helper tests exercise validation/calculation without a model.

For live evidence, choose `sample: false` and a PR `number`, or apply the configured label. gh-aw's default role gate is admin, maintainer, write, and triage; automatic fork runs are blocked. Use a filled-in PR body such as:

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

Download the report artifact for the full result; the native run summary may be brief. No PR comments or merge actions occur automatically.

## How It Works

The trusted [`evidence.mjs`](../../scripts/blueprints/evidence.mjs) helper collects bounded PR evidence including patch, checks, review context, test sources, and configured reports. The sandboxed Copilot agent assesses the dimensions and may consult read-only GitHub tools through `gh-proxy`. [`report.mjs`](../../scripts/blueprints/report.mjs) validates cited sources and dimensions and computes the aggregate deterministically outside the model. Only evidence collected and validated by the helper may enter the score; supplemental findings from native GitHub tools are unscored unless the helper validates them. The response contains a `dimensions` map with exactly these concepts:

| Dimension | Evidence to supply | Default weight |
| --- | --- | --- |
| `scope` | Intended behaviour, changed surface, known exclusions | 20 |
| `execution` | Supplied candidate-matching JSON test report and scenario results; checks alone are insufficient | 30 |
| `scenarios` | Described tested behaviours, boundaries, and unresolved cases | 30 |
| `review` | Collected review decisions and unresolved feedback | 20 |

Each dimension is either `null` for unavailable evidence or `{ "score": 0..100, "sources": ["source IDs"], "reason": "explanation" }`. The `0..100` notation describes the range, not literal JSON. Source IDs must refer to evidence collected and validated by the helper; invented references are not acceptable. Copilot supplies assessments, not the final numeric result. Fixed inputs and configuration produce the same calculator result, but assessments can vary between inference runs.

`minimum_evidence_dimensions: 3` means fewer than three evidenced dimensions withholds the aggregate. When the minimum is met, the weighted numerator uses supported dimension scores while the denominator includes all configured weights, including unknown dimensions. Unknowns therefore cannot inflate the index by dropping their weight; they remain explicitly unknown, not proven failures. Missing/truncated source context and collection caps must remain visible. A withheld result is not zero, a failure, or an approval. Do not compare indexes across teams or weight changes as though they used the same scale.

Collection supports same-repository `#number` references, issue comments, configured `guidance_paths` at the default/base ref, changed test-like files, and optional `test_paths` arrays of exact repository-relative file paths. It does not fetch arbitrary URLs. Test source and check success alone do not demonstrate scenario execution.

Optional `test_report_paths` names exact repository-relative JSON reports shaped as `{ "sha": "<40-character PR head SHA>", "conclusion": "success", "scenarios": [{ "name": "permission denial", "result": "passed" }] }`. Scenario results are `passed`, `failed`, or `skipped`. The helper forces `execution` to unknown without a supplied report matching the candidate SHA, even if checks succeeded or Copilot proposed a score. It does not automatically download artifacts or parse JUnit. Reports read from the trusted default branch are supplied snapshots, not attestations. The optional `test_paths` and `test_report_paths` fields are supported but are not enabled in the supplied `config.json`.

Supply candidate-matching reports, concrete scenario evidence, and actual review context. If evidence is missing, configure an appropriate report file or restore access to the relevant source, then manually rerun with the PR number and `sample: false`. Never substitute invented dimension scores.

## Guardrails

- No GitHub write tools, test execution, arbitrary PR code execution, comments, edits, approvals, or merges; only declared read-only GitHub tools are available.
- A 100-point index is not “100% correct,” a security assessment, release readiness, or a bug-free guarantee.
- Company-specific scoring guidance belongs in configured repository guidance; humans retain merge authority.
- Treat PR content and collected output as untrusted data. Only trusted default-branch workflow and helper code executes.
- Copilot processes supplied context. Review sensitive-data exposure and artifact/log retention; the full report is in a seven-day artifact, not guaranteed in the native run summary. Safe outputs explicitly disable issue creation, failure-reporting issues, and noop-tracker issues.

## Customise It

Adjust weights and the minimum evidence count in `config.json` only with team agreement; keep the four dimension names aligned with `report.mjs`. Align trigger labels with workflow frontmatter. Put dimension interpretation and acceptable evidence in configured guidance. Document policy changes when comparing reports over time. Do not add a merge threshold or call the index a probability without a separately designed and validated process.

## Challenge

Run an example with missing review and scenario evidence and verify that the score is withheld. Add real evidence, rerun, and inspect both limitations and dimension reasons before interpreting any aggregate.
