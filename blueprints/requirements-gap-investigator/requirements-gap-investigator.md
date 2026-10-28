---
name: Requirements Gap Investigator
strict: true
timeout-minutes: 10
concurrency:
  job-discriminator: ${{ github.run_id }}
permissions:
  contents: read
  issues: read
  pull-requests: read
  copilot-requests: write
description: Identify ambiguous business rules and draft focused clarification questions.
on:
  issues:
    types: [labeled]
  labels: [requirements-review]
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
  BLUEPRINT_SLUG: requirements-gap-investigator
---

# Requirements Gap Investigator

Compare the stated business outcome, rules, acceptance criteria, and linked
context against supplied company guidance. Find missing, ambiguous,
contradictory, or untestable requirements. Do not impose Scrum, a universal
definition of ready, or industry-specific rules.

Ask focused questions not already answered in the collected discussion.
For each material gap, explain the decision it blocks and propose an example
criterion clearly marked DRAFT for the business owner to adapt.
Distinguish a missing fact from a rule that needs a human decision.
Use non-technical language suitable for project managers, finance, sales, or
support as appropriate to the actual request. Do not invent company policies.

Pass the literal slug `requirements-gap-investigator` to the report helper.
