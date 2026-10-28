---
name: PR Confidence Calculator
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
description: Explain a policy-based evidence index, never a probability of correctness.
on:
  pull_request:
    types: [labeled]
  labels: [confidence-review]
  roles: [admin, maintainer, write, triage]
  report-blocked-version: false
  workflow_dispatch:
    inputs:
      sample:
        description: Use synthetic evidence (still requires Copilot inference access)
        type: boolean
        default: true
      number:
        description: PR number (required when sample is false)
        type: string
if: >-
  (github.event_name != 'workflow_dispatch' || github.ref_name == github.event.repository.default_branch) &&
  (github.event_name != 'pull_request' || github.event.pull_request.draft == false)
imports:
  - shared/blueprint-runtime.md
  - shared/report-contract.md
env:
  BLUEPRINT_SLUG: pr-confidence-calculator
---

# PR Confidence Calculator

Assess evidence in exactly four dimensions, each a score from 0 to 100 with
source IDs and a reason, or `null` when evidence is unavailable:

- `scope`: size, reviewability, criticality, and coupling, not size alone.
- `execution`: relevant scenario results at the exact candidate SHA.
- `scenarios`: actual assertions for positive, negative, boundary, failure paths.
- `review`: concrete bug risks, current review records, and inspection limits.

Use company guidance to explain each assessment rather than arbitrary precision.
Without a current supplied scenario report, execution MUST be null even when
all checks are green. Any observed current scenario failure makes execution
zero, not unknown; do not omit a failing report to increase the score.
Entirely skipped reports do not establish execution. Without inspected
test-source evidence, scenarios MUST be null. Review records from other commits
are not candidate approval. Inspect the diff for bug risks yourself; do not
claim that a passing check or another review proves absence of bugs.

Do not calculate the total yourself. Pass dimensions to the fixed helper,
which applies configured weights (example 20/30/30/20), retains unknown weights
in the denominator, and withholds the total below the configured evidence
minimum (example three dimensions). Explain evidence completeness and missing
dimensions. The index is not a calibrated probability, security assessment,
bug-free guarantee, release decision, or permission to merge.

Pass the literal slug `pr-confidence-calculator` to the report helper.
