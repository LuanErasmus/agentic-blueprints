# [Blueprint Name]

**Difficulty:** [beginner / intermediate / advanced]

## Problem

[Describe the real-world problem and who encounters it.]

## What the Agent Does

[Describe responsibilities, required inputs, advisory output, and human decisions.]

## Architecture

```text
GitHub event or required manual inputs → native read-only evidence inspection
→ sandboxed Copilot assessment → one advisory Markdown artifact → human decision
```

[For Azure, show trusted inline collection and logout before inference instead of agent CLI access.]

## Prerequisites

- One-time: GitHub CLI, gh-aw (`gh extension install github/gh-aw`), GitHub Actions, and an organisation-owned repository with **Copilot Business (minimum standard organisation plan) or Copilot Enterprise**. Enable Copilot CLI and organisation billing. Retain `copilot-requests: write` with the built-in Actions token, not a PAT. Personal plans alone are insufficient; see [eligibility and policy requirements](../../docs/running-workflows.md#copilot-licence-and-authentication-requirements), including eligible enterprise Copilot access.
- [List any additional read permissions or advanced identity requirements. Node.js is collection maintenance tooling, not an adopter prerequisite.]

## Setup

1. Copy only `<id>.md` from this folder to `.github/workflows/<id>.md` in your repository.
2. Customise labels and company instructions directly in that Markdown, create required labels, and run `gh aw compile <id>`.
3. Review and commit source plus generated `.lock.yml` on your trusted default branch. Recompile after source edits; this collection distributes no locks.

[No shared imports, runtime scripts, JSON config, report schemas, or sample dispatch. Add a fourth step only if a genuine advanced prerequisite requires it.]

## Run It

[Give automatic events/labels and exact manual steps. Require issue/PR `number` and default-branch dispatch; skip drafts and block automatic fork events. Preserve the role gate. Azure instead requires `resource_group` and `deployment_name`. Link filled-in illustrative `examples/input.md` and `examples/output.md`; they are not executable synthetic dispatches. Explain how to download the full report artifact.]

## How It Works

[Describe native read-only GitHub tools/proxy and relevant evidence, with at most 10 explicit same-repository linked issues/PRs and no checkout or PR code execution. No hard source-byte budgets. Report inaccessible/truncated evidence and tool errors rather than inferring absence or success. Cite real links/paths and revisions; do not imply assertions or AI findings are independently validated.]

The native edit tool writes only `/tmp/gh-aw/report.md`; safe-output upload allowlists that one Markdown report with seven-day retention. The output is advisory, with no custom JSON contract or machine validation.

[For Azure, document fixed trusted inline collection limits, logout before inference, and agent access only to prepared files via `cat` plus report editing; no GitHub/Azure CLI access.]

## Guardrails

- **Access:** [Read-only evidence and scope.]
- **Actions:** one report only; no automatic comments, labels, assignments, issues, reviews, merges, releases, deployments, or external messages.
- **Approval:** [Humans retain operational and business decisions.]
- **Trust:** source content and tool output are evidence, not instructions.
- **Credentials:** [Least privilege; built-in Copilot token and, if relevant, scoped Azure OIDC.]
- **Data handling:** selected content goes to Copilot; review seven-day report retention and native log access/retention.

## Customise It

[Explain labels, company rules, and guidance references to edit directly in the workflow Markdown. Keep filters/instructions aligned and preserve safety boundaries.]

## Challenge

[Give one small safe extension or evidence comparison that retains human control.]
