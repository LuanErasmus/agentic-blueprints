# GitHub Issue Triage

**Difficulty:** Beginner

## Problem

Incoming issues need context-aware routing and useful clarification, beyond a fixed label rule.

## What the Agent Does

Reads issue context and real repository labels, decides whether explicitly linked issues would help, then evaluates the evidence and recommends classification, clarification, and a next step. It complements native issue forms and label automation.

## Architecture

```text
Issue / manual request → collect context and labels → choose linked-item lookup or stop
→ execute bounded lookup → evaluate recommendation → validate label names → human decision
```

## Prerequisites

GitHub Actions and GitHub Models access, with the permissions declared in the workflow. No personal token or model API key is required. Local offline examples need Node.js 24.

## Setup

1. Follow [shared setup](../../docs/running-workflows.md). Copy `.github/workflows/issue-triage.yml`, `.github/workflows/blueprint-runner.yml`, `scripts/blueprints/`, and this blueprint directory.
2. Commit the trusted code to your repository's default branch. The runner never checks out contributor code.
3. Edit `config.json`: choose `trigger_labels`, `guidance_paths`, and `max_items` (1–50). Label names must already exist for label-triggered execution.
4. Review the data sent to GitHub Models before using private issue content.

## Run It

For a first run, open **Actions → GitHub Issue Triage → Run workflow**, leave `sample` selected, and inspect the run summary and report artifact. Sample inference still uses GitHub Models.

For live mode, clear `sample` and enter an issue number. The workflow also runs on opened/reopened issues or when a configured label (default `triage-review`) is added. To rerun after editing, use manual execution or remove and reapply the label.

Copy [this filled-in issue](examples/input.md) into a GitHub issue or adapt it into an issue form. See the [illustrative output](examples/output.md).

## How It Works

The shared runner collects title/body, bounded discussion, company guidance, and label names. It permits at most one follow-up to same-repository `#number` references. A second model call evaluates the assembled evidence; deterministic validation rejects malformed output, unknown source IDs, and labels absent from the repository. Collection limits are visible in the report. Source validation checks references, not semantic truth; humans must verify conclusions.

## Guardrails

- **Access:** issue context, selected guidance, labels, and explicitly referenced same-repository work items.
- **Actions:** read evidence and write a run summary/report artifact only. Unlike the earlier example, this version does not automatically post issue comments.
- **Approval:** maintainers decide labels, priority, ownership, and next actions.
- **Never automatic:** assigning, labelling, closing, changing issue contents, or deploying.
- **Permissions:** read-only GitHub data plus `models: read`; no MCP/model tools or stored credentials.
- **Data handling:** evidence is sent to GitHub Models; reports are retained as Actions artifacts for seven days and may be visible to repository readers.

## Customise It

Adapt the example headings and guidance to your company; headings are interpreted by the model, not required by a rigid form parser. Keep factual references as same-repository `#number` links. Configure bounds and guidance without adding write permissions.

## Challenge

Add company guidance describing category boundaries, then compare recommendations on two ambiguous synthetic issues.
