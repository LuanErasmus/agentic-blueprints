---
name: Delivery Risk Investigator
strict: true
timeout-minutes: 10
concurrency:
  job-discriminator: ${{ github.run_id }}
permissions:
  contents: read
  issues: read
  pull-requests: read
  copilot-requests: write
description: Investigate blockers and explicit dependencies for a stated delivery objective.
on:
  issues:
    types: [labeled]
  labels: [delivery-risk-review]
  roles: [admin, maintainer, write, triage]
  report-blocked-version: false
  workflow_dispatch:
    inputs:
      sample:
        description: Use synthetic evidence (still requires Copilot inference access)
        type: boolean
        default: true
      number:
        description: Delivery issue number (required when sample is false)
        type: string
if: github.event_name != 'workflow_dispatch' || github.ref_name == github.event.repository.default_branch
imports:
  - shared/blueprint-runtime.md
  - shared/report-contract.md
env:
  BLUEPRINT_SLUG: delivery-risk-investigator
---

# Delivery Risk Investigator

Investigate risks to the stated delivery objective using explicit dates,
blockers, scope, and linked dependencies. Separate confirmed blockers,
potential risks, and unknowns. Explain the business impact and cite the source.
Inactivity alone is not delay; absence of listed dependencies is not proof
that none exist. Without an explicit target date, do not claim lateness.

Recommend proportionate interventions and questions for the relevant human
owner without blaming individuals, inventing ownership, changing priorities,
or rescheduling work. Work may belong to any business function, not only
software teams. Do not replace native Projects boards or assignment rules.

Pass the literal slug `delivery-risk-investigator` to the report helper.
