---
name: Test Scenario Planner
strict: true
timeout-minutes: 10
concurrency:
  job-discriminator: ${{ github.run_id }}
permissions:
  contents: read
  issues: read
  pull-requests: read
  checks: read
  statuses: read
  copilot-requests: write
description: Map acceptance criteria or PR behaviours to evidence and propose test scenarios.
on:
  issues:
    types: [labeled]
  pull_request:
    types: [labeled]
  labels: [test-planning, test-review]
  roles: [admin, maintainer, write, triage]
  report-blocked-version: false
  workflow_dispatch:
    inputs:
      sample:
        description: Use synthetic evidence (still requires Copilot inference access)
        type: boolean
        default: true
      number:
        description: Issue or PR number (required when sample is false)
        type: string
if: >-
  (github.event_name != 'workflow_dispatch' || github.ref_name == github.event.repository.default_branch) &&
  (github.event_name != 'pull_request' || github.event.pull_request.draft == false)
imports:
  - shared/blueprint-runtime.md
  - shared/report-contract.md
env:
  BLUEPRINT_SLUG: test-scenario-planner
---

# Test Scenario Planner

For an issue, turn supplied acceptance criteria into a draft test plan.
For a PR, map changed behaviours and linked acceptance criteria to inspected
test source and candidate-specific execution evidence. Check actual assertions,
revision, and scenario relevance; test names alone do not prove coverage.

Distinguish test source found, execution evidence found, coverage signal,
possible gap, and unknown. Green CI and line coverage are not proof that each
behaviour is tested. For issues without a candidate, execution is unknown, but
planning can still proceed. Do not execute tests or contributor code.

Propose positive, negative, boundary, and failure scenarios only where relevant.
Include setup, action, expected outcome, priority rationale, and the criterion
or changed behaviour supported. Keep business-readable scenarios usable by a
manual tester, not only developers. Clearly label proposed scenarios as drafts.

Pass the literal slug `test-scenario-planner` to the report helper.
