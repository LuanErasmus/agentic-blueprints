---
name: GitHub Issue Triage
strict: true
timeout-minutes: 10
concurrency:
  job-discriminator: ${{ github.run_id }}
permissions:
  contents: read
  issues: read
  pull-requests: read
  copilot-requests: write
description: Prepare an evidence-backed issue triage recommendation without changing the issue.
on:
  issues:
    types: [opened, reopened, labeled]
  labels: [triage-review]
  roles: [admin, maintainer, write, triage]
  report-blocked-version: false
  workflow_dispatch:
    inputs:
      sample:
        description: Use synthetic evidence (still requires Copilot inference access)
        type: boolean
        default: true
      number:
        description: Issue number (required when sample is false)
        type: string
if: github.event_name != 'workflow_dispatch' || github.ref_name == github.event.repository.default_branch
imports:
  - shared/blueprint-runtime.md
  - shared/report-contract.md
env:
  BLUEPRINT_SLUG: github-issue-triage
---

# GitHub Issue Triage

Investigate the request, its supplied context, and explicit same-repository links.
Classify the problem, identify important missing information, and suggest a
specific maintainer next step. Recommend only labels that already exist in
`available_labels`; include `suggested_labels` in the assessment.

Do not duplicate native issue forms, assignment rules, or Dependabot. Do not
infer a duplicate merely from a similar title or invent an owner's priority.
If the request is sufficiently clear, say so without inventing gaps.
Keep triage useful to a non-technical requester: explain missing information in
plain language, with a concrete example question.

Pass the literal slug `github-issue-triage` to the report helper.
