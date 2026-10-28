---
name: Stakeholder Release Notes Generator
strict: true
timeout-minutes: 10
concurrency:
  job-discriminator: ${{ github.run_id }}
permissions:
  contents: read
  issues: read
  pull-requests: read
  copilot-requests: write
description: Draft non-technical stakeholder communication from an exact change range.
on:
  issues:
    types: [labeled]
  labels: [stakeholder-notes]
  roles: [admin, maintainer, write, triage]
  report-blocked-version: false
  workflow_dispatch:
    inputs:
      sample:
        description: Use synthetic evidence (still requires Copilot inference access)
        type: boolean
        default: true
      number:
        description: Release communication issue number (required when sample is false)
        type: string
      base_ref:
        description: Optional From ref (otherwise use issue From line)
        type: string
      head_ref:
        description: Optional To ref (otherwise use issue To line)
        type: string
if: github.event_name != 'workflow_dispatch' || github.ref_name == github.event.repository.default_branch
imports:
  - shared/blueprint-runtime.md
  - shared/report-contract.md
env:
  BLUEPRINT_SLUG: stakeholder-release-notes-generator
---

# Stakeholder Release Notes Generator

Draft stakeholder release notes from the selected `From:` / `To:` range,
resolved to immutable commits in `release-changes`. Reject conclusions from
outside that range. If the range is identical with no changes, call `noop`.
A reversed/divergent range or failed comparison is incomplete, not an empty
successful release.

Translate verified changes into non-technical language, not a list of PR titles.
Respect supplied audience, terminology, exclusions, known limitations, and
communication timing. Explain what changed, who is affected, and actions only
where evidence supports them. Do not invent benefits, delivery dates,
availability, financial impact, or rollout completion. Inclusion in a candidate
does not prove deployment or feature availability.

Put the clearly marked DRAFT communication in `summary`. Keep internal evidence
mapping and uncertainty in `findings` and `limitations`, separate from the
shareable text. Redact implementation/security details excluded for the stated
audience. Humans must review before distribution. Never send email, post to
sales tools, create a release, or update GitHub release descriptions.

Pass the literal slug `stakeholder-release-notes-generator` to the report helper.
