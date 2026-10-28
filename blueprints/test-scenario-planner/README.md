# Test Scenario Planner

**Difficulty:** Intermediate

## Problem

Requirements and changed code can suggest different testing risks. Teams need a practical scenario shortlist without mistaking generated suggestions for implemented or passing tests. Coverage priorities should follow your product and testing conventions, not a universal checklist.

## What the Agent Does

Uses issue requirements or PR context to suggest normal, boundary, failure, and regression scenarios where evidence warrants them. Identifies unresolved assumptions and recommends a suitable test level. It does not write or execute test code, and it does not certify coverage.

## Architecture

```text
Issue test-planning / PR test-review / workflow_dispatch
  → exact-label gate; manual number resolved through issue API
  → trusted shared runner collects issue or PR evidence + guidance
  → GitHub Models proposes scenarios without model tools
  → validate response → Actions summary + artifact → human test planning
```

## Prerequisites

- GitHub Actions, repository-approved GitHub Models access, and Node.js 24.
- `GITHUB_TOKEN` with `models: read` plus read access for repository content, issues, and pull requests as needed by the workflow.
- An issue with acceptance criteria, or a PR describing behaviour and validation. Missing test context must be reported rather than inferred as passing.

## Setup

1. Copy [the root workflow](../../.github/workflows/test-scenario-planner.yml) into `.github/workflows/test-scenario-planner.yml`.
2. Also copy reusable `.github/workflows/blueprint-runner.yml`, the complete shared `scripts/blueprints/` directory (including `run.mjs` and centralized `samples.mjs`), and this blueprint directory with `config.json`. Copy all of them to the destination's trusted default branch; a standalone entry workflow cannot run.
3. Install these files on the trusted default branch; review Actions permissions and GitHub Models eligibility. The inference step uses `actions/ai-inference@v1`, `openai/gpt-4o`, and `GITHUB_TOKEN` with `models: read`; no Copilot CLI or PAT is required.
4. Create the default labels or edit `trigger_labels`. Use `test-planning` on issues and `test-review` on PRs. The workflow receives labeled events and the runner checks the exact configured label. Set `guidance_paths` and `max_items` for your repository.

## Run It

Manually dispatch with `sample: true` (default); `number` is optional. This uses centralized `scripts/blueprints/samples.mjs` data but still performs live GitHub Models inference. Offline fixture tests make no model call.

For live planning, dispatch with `sample: false` and an issue or PR `number`. The runner queries the issue API to detect whether that number represents a PR; no separate kind input is required. Alternatively, label the issue or PR as described above.

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

Review the Actions summary and report artifact. The workflow does not post a comment.

## How It Works

The entry workflow calls reusable `.github/workflows/blueprint-runner.yml`. The shared [`run.mjs`](../../scripts/blueprints/run.mjs) uses `prepare`, `followup`, and `report` stages to prepare initial evidence, validate a bounded planning call and collect permitted follow-up context, then validate the final evaluation's `summary`, `findings`, `limitations`, and `next_steps`. The model has no tool grants; the runner controls source collection and report rendering.

Provide observable expected behaviour, changed boundaries, existing test descriptions/results, and environment assumptions. Collection supports same-repository `#number` references, issue comments, configured `guidance_paths` at the default/base ref, changed test-like files, and optional `test_paths` arrays of exact repository-relative file paths. It does not fetch arbitrary URLs. Test source suggests scenarios; it does not demonstrate execution. A PR author's statement or a successful check alone does not establish which scenarios passed.

For supplied execution evidence, optional `test_report_paths` names exact repository-relative JSON report paths. Each report has the form `{ "sha": "<40-character candidate SHA>", "conclusion": "success", "scenarios": [{ "name": "lock expiry", "result": "passed" }] }`; scenario results are `passed`, `failed`, or `skipped`. Reports must match the candidate to support its execution evidence. There is no automatic artifact download or JUnit parsing. These optional config fields are supported but are not enabled in the supplied `config.json`.

Only collected sources can support findings. Missing or truncated diffs, inaccessible guidance, and item caps must reduce the report's claims. Add an approved missing requirement to the source issue/PR, or provide an appropriate configured test/report file, then rerun manually. Do not present an uncollected link or check name as scenario execution.

## Guardrails

- No test execution, arbitrary PR code checkout/execution, code generation, automatic comments, edits, or merge decisions.
- Trusted default-branch workflow code collects data; PR changes are untrusted evidence, not executable instructions.
- Scenarios are proposals, not evidence that tests exist or pass. A human selects, implements, and runs them.
- GitHub Models receives the supplied context. Review sensitive-data handling and Actions summary/artifact retention before enabling.
- Do not infer security, accessibility, or regulatory requirements absent team guidance; identify them as questions when relevant.

## Customise It

Use `config.json` for trigger labels, repository-relative guidance paths, and maximum items. Document team-specific test levels, naming conventions, and risk priorities in the configured guidance. Keep the response contract aligned with the runner if extending the implementation; adjusting `max-tokens` in the workflow may be necessary for longer reports.

## Challenge

Supply a previously missing expiry test result and rerun. Check that the planner distinguishes the demonstrated case from concurrent-attempt scenarios that remain unverified.
