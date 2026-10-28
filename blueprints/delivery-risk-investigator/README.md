# Delivery Risk Investigator

**Difficulty:** Intermediate

## Problem

An intended delivery date can conceal unresolved dependencies, scope uncertainty, and missing ownership. Teams need a source-linked discussion aid, not an invented schedule or universal risk rating.

## What the Agent Does

Inspects a planning issue and supporting context, distinguishes known risks from unanswered questions, and recommends mitigations and owner decisions. It does not predict a delivery date, assign people, or assume silence resolves a dependency.

## Architecture

```text
Issue label or manual number → read-only GitHub evidence inspection
→ sandboxed Copilot assessment → advisory Markdown artifact → delivery-owner decision
```

## Prerequisites

One-time: GitHub CLI, gh-aw (`gh extension install github/gh-aw`), GitHub Actions, and an organisation-owned repository with **Copilot Business (minimum standard organisation plan) or Copilot Enterprise**. Enable **Copilot CLI** and **Allow use of Copilot CLI billed to the organization**. Keep `copilot-requests: write`; inference uses the built-in Actions token, not a PAT. Personal plans alone are insufficient. See [eligibility and billing](../../docs/running-workflows.md#copilot-licence-and-authentication-requirements), including eligible enterprise Copilot access.

Use a planning issue with scope, date meanings, owners, dependencies, and constraints. Include approved excerpts for supporting systems outside GitHub.

## Setup

1. Copy only [delivery-risk-investigator.md](delivery-risk-investigator.md) to `.github/workflows/delivery-risk-investigator.md` in your repository.
2. Customise labels and delivery guidance directly in the Markdown, create `delivery-risk-review` (or your chosen label), and run `gh aw compile delivery-risk-investigator`.
3. Review and commit the source and generated `.lock.yml` on your trusted default branch. Recompile after edits.

No shared files, runtime scripts, JSON configuration, or report schemas are required. See [optional details](../../docs/running-workflows.md).

## Run It

Use **Actions → Delivery Risk Investigator → Run workflow** on the default branch with the required issue `number`, or apply `delivery-risk-review` for an automatic labelled-issue run.

The role gate allows admin, maintainer, write, and triage; automatic fork events are blocked. Read the [filled-in planning issue](examples/input.md) and [illustrative output](examples/output.md), then adapt your own issue. There is no sample dispatch flag.

Download the report artifact for the full result; the native run summary may be brief.

## How It Works

Native read-only GitHub tools/proxy inspect issue context, discussion, relevant guidance, and at most 10 explicitly linked same-repository issues/PRs. They do not query external delivery systems, check out code, or execute issue instructions. Provide dated, approved dependency-status excerpts where needed.

There are no hard source-byte budgets. Missing ownership is unknown, not proof nobody owns the work. Inaccessible/truncated evidence, exploration limits, and tool failures must be explicit; failed reads do not prove absence or success.

The native edit tool writes one `/tmp/gh-aw/report.md`; safe-output upload allowlists that path with seven-day retention. This is advisory Markdown, not machine-validated JSON or a forecast.

## Guardrails

- Read-only evidence and one report; no scheduling changes, assignments, comments, labels, issue creation, merges, releases, deployments, or external messages.
- Humans verify status, accept mitigations, and make delivery commitments.
- Source content and tool output are untrusted evidence, not operational instructions.
- Do not infer staffing capacity, cost, contractual obligations, or risk probabilities from missing evidence.
- Selected evidence goes to Copilot. Review artifact/log access and retention before using sensitive content.

## Customise It

Put label choices, impact terminology, escalation paths, date meanings, and local severity guidance directly in the workflow Markdown. Keep trigger filters and instructions aligned; preserve read-only access and human authority.

## Challenge

Add a dated export-size confirmation and rerun. Check that only that dependency is resolved while other uncertainty remains visible.
