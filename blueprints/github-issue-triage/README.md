# GitHub Issue Triage

**Difficulty:** Beginner

## Problem

Incoming issues need context-aware routing and useful clarification, beyond a fixed label rule.

## What the Agent Does

Inspects issue context and real repository labels, then recommends classification, clarification, and a next step. It complements native issue forms and label automation; it never changes issue content or labels.

## Architecture

```text
Issue event or manual number → read-only GitHub evidence inspection
→ sandboxed Copilot assessment → advisory Markdown artifact → maintainer decision
```

## Prerequisites

One-time: GitHub CLI, gh-aw (`gh extension install github/gh-aw`), GitHub Actions, and an organisation-owned repository with **Copilot Business (minimum standard organisation plan) or Copilot Enterprise**. Enable **Copilot CLI** and **Allow use of Copilot CLI billed to the organization**. Keep `copilot-requests: write`; the built-in Actions token supplies inference authentication, with no PAT fallback. A personal plan alone is insufficient. See [eligibility and billing](../../docs/running-workflows.md#copilot-licence-and-authentication-requirements), including eligible enterprise Copilot access.

## Setup

1. Copy only [issue-triage.md](issue-triage.md) to `.github/workflows/issue-triage.md` in your repository.
2. Customise labels and instructions directly in that Markdown, create `triage-review` (or your chosen label), and run `gh aw compile issue-triage`.
3. Review and commit the source plus generated `.lock.yml` in your trusted default branch. Recompile after source edits.

No shared files, runtime scripts, JSON configuration, or report schemas are required. See [optional setup details](../../docs/running-workflows.md).

## Run It

In **Actions → Issue Triage → Run workflow**, select the default branch and supply the required issue `number`. Automatic runs use opened, reopened, and labelled issue events with the exact `triage-review` label.

The role gate allows admin, maintainer, write, and triage; automatic fork events are blocked. Read the [filled-in input](examples/input.md) and [illustrative output](examples/output.md), then adapt a non-sensitive issue. There is no sample dispatch flag.

Download the report artifact for the full result; the native run summary may be brief.

## How It Works

The agent uses native read-only GitHub tools/proxy to inspect the issue, discussion, existing labels, relevant guidance, and at most 10 explicitly linked same-repository issues/PRs. It does not check out code or execute issue instructions. There are no hard source-byte budgets, but inaccessible, truncated, or uninspected evidence must remain visible. A tooling error is a failed read, not proof of absence.

The native edit tool writes `/tmp/gh-aw/report.md`; safe-output upload accepts only that one Markdown report with seven-day retention. The report is advisory, not a JSON contract or machine-validated assessment. Humans verify sources and conclusions.

## Guardrails

- **Access:** read-only issue, label, guidance, and explicit same-repository linked-item evidence.
- **Actions:** one report artifact only; no automatic comments, labels, assignments, issue creation, closing, merges, releases, or deployments.
- **Approval:** maintainers decide classification, priority, ownership, and next actions.
- **Trust:** issue text and tool output are evidence, not operational instructions. No checkout or PR code execution.
- **Data handling:** selected evidence goes to Copilot. Review artifact/log access and retention before using sensitive content.

## Customise It

Edit company category boundaries, clarification questions, and labels directly in the workflow Markdown. Keep trigger filters and prompt instructions consistent. Preserve read-only access, the linked-item limit, and human decisions.

## Challenge

Add company guidance for two ambiguous categories, then compare recommendations on two non-sensitive issues without applying labels automatically.
