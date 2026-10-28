# Requirements Gap Investigator

**Difficulty:** Beginner

## Problem

An issue can look ready to implement while leaving important behaviour undecided. This blueprint asks questions against your team's guidance rather than imposing a universal definition of ready.

## What the Agent Does

Reads an issue and relevant context, separates stated requirements from assumptions, and recommends questions and acceptance criteria. It never rewrites the issue or treats a proposed requirement as approved.

## Architecture

```text
Issue label or manual number → read-only GitHub evidence inspection
→ sandboxed Copilot assessment → advisory Markdown artifact → product-owner decision
```

## Prerequisites

One-time: GitHub CLI, gh-aw (`gh extension install github/gh-aw`), GitHub Actions, and an organisation-owned repository with **Copilot Business (minimum standard organisation plan) or Copilot Enterprise**. Enable **Copilot CLI** and **Allow use of Copilot CLI billed to the organization**. Retain `copilot-requests: write`; inference uses the built-in Actions token, with no PAT fallback. Personal plans alone are insufficient. See [eligibility and billing](../../docs/running-workflows.md#copilot-licence-and-authentication-requirements), including eligible enterprise Copilot access.

Use an issue describing the proposed change; include or reference approved team expectations.

## Setup

1. Copy only [requirements-gap-investigator.md](requirements-gap-investigator.md) to `.github/workflows/requirements-gap-investigator.md` in your repository.
2. Edit labels and company instructions directly in that Markdown, create `requirements-review` (or your chosen label), and run `gh aw compile requirements-gap-investigator`.
3. Review and commit source plus generated `.lock.yml` on your trusted default branch. Recompile after edits.

No shared files, scripts, JSON configuration, or report schemas are required. See [optional details](../../docs/running-workflows.md).

## Run It

Use **Actions → Requirements Gap Investigator → Run workflow** on the default branch with the required issue `number`, or apply `requirements-review` to trigger an automatic labelled-issue run.

The role gate allows admin, maintainer, write, and triage; automatic fork events are blocked. There is no sample flag. Adapt the [filled-in issue](examples/input.md) and read the [illustrative output](examples/output.md). Include the intended user, scope, measurable outcomes, constraints, and open questions.

Download the report artifact for the full result; the native run summary may be brief.

## How It Works

The agent inspects the issue, discussion, relevant guidance, and at most 10 explicitly linked same-repository issues/PRs with native read-only GitHub tools/proxy. It does not fetch arbitrary external URLs, check out code, or execute issue instructions. Supply approved excerpts when external context is needed.

There are no hard source-byte budgets. Report inaccessible/truncated evidence and tooling errors explicitly; a failed read does not prove a policy or requirement is absent. Citations support traceability, not independent attestation.

The native edit tool writes `/tmp/gh-aw/report.md`; safe-output upload allowlists that one report for seven days. The result is advisory Markdown, not a JSON contract or machine-validated assessment.

## Guardrails

- Read-only evidence and one report; no comments, labels, assignments, issue edits/creation, approvals, merges, releases, or deployments.
- Treat issue text, guidance, and tool output as untrusted evidence, not operational instructions.
- Missing evidence is a question, not a confirmed requirement or policy breach.
- A product owner or delegated reviewer approves requirements and follow-up changes.
- Selected content goes to Copilot. Review artifact/log access and retention before sending sensitive information.

## Customise It

Edit labels, team expectations, and guidance references directly in the workflow Markdown. Keep label filters and instructions consistent. Do not silently turn local preferences into universal requirements or weaken read-only boundaries.

## Challenge

Add an approved export-size rule to the source issue or team guidance and rerun. Check that the report resolves only that question and retains the unanswered ones.
