# Test Scenario Planner

**Difficulty:** Intermediate

## Problem

Requirements and changed code can suggest different testing risks. Teams need a practical scenario shortlist without mistaking generated suggestions for implemented or passing tests. Coverage priorities should follow your product and testing conventions, not a universal checklist.

## What the Agent Does

Uses issue requirements or PR context to suggest normal, boundary, failure, and regression scenarios where evidence warrants them. Identifies unresolved assumptions and recommends a suitable test level. It does not write or execute test code, and it does not certify coverage.

## Architecture

```text
Issue/PR label or manual dispatch
  → exact-label gate and trusted evidence preparation
  → sandboxed Copilot analysis with read-only GitHub tools
  → deterministic report validation → restricted artifact
  → human test planning
```

## Prerequisites

- GitHub Actions, gh-aw, Copilot inference access, and Node.js 24 for offline helper tests. See [gh-aw authentication](https://github.github.com/gh-aw/reference/auth/).
- An issue with acceptance criteria, or a PR describing behaviour and validation. Missing test context must be reported rather than inferred as passing.

## Setup

1. Copy `.github/workflows/test-scenario-planner.md`, both shared workflow Markdown files, the complete `scripts/blueprints/` directory, and this blueprint directory including `config.json`.
2. Install gh-aw and run `gh aw compile test-scenario-planner` in your repository; review and commit the generated lock there.
3. Keep the sources on your trusted default branch and configure native Copilot authentication as described in [shared setup](../../docs/running-workflows.md). Put compiler permissions in this main workflow's frontmatter; remove `copilot-requests: write` before using the PAT fallback, then recompile.
4. Align `test-planning` (issues) and `test-review` (PRs) in config and workflow frontmatter. Set `guidance_paths` and `max_items` for your repository.

## Run It

Manually dispatch with `sample: true` (default); `number` is optional. Synthetic mode still uses native Copilot inference. Offline helper tests make no model call.

For live planning, dispatch with `sample: false` and an issue or PR `number`, or apply the matching label. The evidence helper resolves whether the number identifies an issue or PR. gh-aw's default role gate is admin, maintainer, write, and triage; automatic fork runs are blocked.

Filled-in issue format:

```markdown
## Behaviour
Lock sign-in for 15 minutes after five failed attempts for the same account.
## Acceptance criteria
- Successful sign-in resets the failure count.
- Expired locks allow a new attempt.
## Constraints
Do not reveal whether the account exists.
## Existing validation
Unit tests cover a single failed attempt; no expiry scenario is documented.
```

Filled-in PR format:

```markdown
## Change
Add a clock-injected account lockout service for issue #42.
## Behaviour and scope
Five failures start a 15-minute lock; successful authentication resets count.
## Validation
Added threshold unit tests; ran the auth unit suite successfully.
## Known gaps
Concurrent attempts and lock expiry have not yet been tested.
```

Download the report artifact for the full result; the native run summary may be brief. The workflow does not post a comment.

## How It Works

The trusted [`evidence.mjs`](../../scripts/blueprints/evidence.mjs) helper collects issue or PR context, guidance, changed test-like files, and configured exact test/report paths. The sandboxed Copilot agent may use read-only GitHub tools through `gh-proxy`; it does not run tests, PR code, or model-selected follow-up queries. [`report.mjs`](../../scripts/blueprints/report.mjs) validates cited sources and renders the report. Source text is bounded to 6,000 characters per source and 18,000 total.

Provide observable expected behaviour, changed boundaries, existing test descriptions/results, and environment assumptions. Collection supports same-repository `#number` references, issue comments, configured `guidance_paths` at the default/base ref, changed test-like files, and optional `test_paths` arrays of exact repository-relative file paths. It does not fetch arbitrary URLs. Test source suggests scenarios; it does not demonstrate execution. A PR author's statement or a successful check alone does not establish which scenarios passed.

For supplied execution evidence, optional `test_report_paths` names exact repository-relative JSON report paths. Each report has the form `{ "sha": "<40-character candidate SHA>", "conclusion": "success", "scenarios": [{ "name": "lock expiry", "result": "passed" }] }`; scenario results are `passed`, `failed`, or `skipped`. Reports must match the candidate to support its execution evidence. There is no automatic artifact download or JUnit parsing. These optional config fields are supported but are not enabled in the supplied `config.json`.

Only collected sources can support findings. Missing or truncated diffs, inaccessible guidance, and item caps must reduce the report's claims. Add an approved missing requirement to the source issue/PR, or provide an appropriate configured test/report file, then rerun manually. Test source or a PR author's statement does not prove execution. Offline tests validate deterministic helper behavior and do not assess live Copilot output.

## Guardrails

- No test execution, arbitrary PR code checkout/execution, code generation, automatic comments, edits, or merge decisions.
- Trusted default-branch workflow code collects data; PR changes are untrusted evidence, not executable instructions.
- Scenarios are proposals, not evidence that tests exist or pass. A human selects, implements, and runs them.
- Copilot receives the supplied context. The full report is in a seven-day artifact, not guaranteed in the native run summary.
- Do not infer security, accessibility, or regulatory requirements absent team guidance; identify them as questions when relevant.

## Customise It

Use `config.json` for trigger labels, repository-relative guidance paths, and maximum items; keep labels aligned with workflow frontmatter. Document team-specific test levels, naming conventions, and risk priorities in guidance. Changes must stay aligned with the trusted evidence helper, workflow, and report contract.

## Challenge

Supply a previously missing expiry test result and rerun. Check that the planner distinguishes the demonstrated case from concurrent-attempt scenarios that remain unverified.
