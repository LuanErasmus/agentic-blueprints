---
name: GitHub PR Review
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
description: Prepare a company-specific reviewer brief, complementing native code review.
on:
  pull_request:
    types: [opened, reopened, synchronize, ready_for_review, labeled]
  labels: [review-preparation]
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
  BLUEPRINT_SLUG: github-pr-review
---

# GitHub PR Review

Prepare a reviewer brief against the supplied repository/company guidance.
Identify the exact candidate SHA, affected behaviours, linked criteria,
concrete bug risks, missing evidence, and useful reviewer questions.
Inspect the prepared diffs and tests rather than trusting PR-body assertions.
Check review `commit_id` before treating a review as current candidate evidence.

Prioritize evidence-backed concerns over generic style suggestions. Explain why
each concern matters and what a human should inspect. Do not repeat native
Copilot review, linters, or check summaries as if you performed them.
Never approve/merge, declare code bug-free, or execute the PR.
If there are no actionable concerns, produce a concise brief explaining the
inspected scope and limitations, not a correctness guarantee.

Pass the literal slug `github-pr-review` to the report helper.
