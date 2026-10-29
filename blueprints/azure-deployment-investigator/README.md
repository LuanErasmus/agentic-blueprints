# Azure Deployment Investigator

**Difficulty:** Advanced

## Problem

Deployment failures need evidence-led investigation without granting an agent infrastructure write access.

## What the Agent Does

Reasons over deployment and diagnostic evidence gathered by trusted inline read-only commands before inference. It separates facts, hypotheses, limitations, and recommendations. The agent has no Azure credentials or CLI access and never selects or executes diagnostics.

## Architecture

```text
Manual deployment inputs → trusted inline OIDC collection → Azure logout
→ sandboxed Copilot reads prepared evidence → advisory Markdown artifact
→ operator verifies findings and decides
```

## Prerequisites

One-time: GitHub CLI, gh-aw (`gh extension install github/gh-aw`), GitHub Actions, and an organisation-owned repository with **Copilot Business (minimum standard organisation plan) or Copilot Enterprise**. Enable **Copilot CLI** and **Allow use of Copilot CLI billed to the organization**. Keep `copilot-requests: write`; inference uses the built-in Actions token, not a PAT. Personal plans alone are insufficient. See [eligibility and billing](../../docs/running-workflows.md#copilot-licence-and-authentication-requirements), including eligible enterprise Copilot access.

Azure requires an existing resource-group deployment and a GitHub OIDC federated identity restricted to this repository and approved branch. Give it **Reader only, scoped to the target resource group**, and verify no inherited write roles. No client secret is needed.

## Setup

1. Copy only [azure-deployment-investigator.md](azure-deployment-investigator.md) to `.github/workflows/azure-deployment-investigator.md` in your repository. All collection is inline; no external scripts, imports, or JSON configuration are needed.
2. Configure OIDC as above and repository variables `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID`. If adding a protected environment, align the job and federated credential subject explicitly; none is assumed.
3. Customise instructions directly in the Markdown and run `gh aw compile azure-deployment-investigator`. Inspect action versions, identity scope, and any compiler safe-update proposals rather than blindly accepting or bypassing them.
4. Review and commit source plus generated `.lock.yml` on your trusted default branch. Recompile after source edits.

`id-token: write` enables federation, not Azure write authority. Keep organisation-billed Copilot authentication separate from Azure identity. See [optional details](../../docs/running-workflows.md).

## Run It

Open **Actions → Azure Deployment Investigator → Run workflow** on the default branch. Supply both required inputs:

```text
resource_group: example-test-rg
deployment_name: example-deployment
```

Replace these illustrative names with an authorised existing deployment. Subscription comes from the repository variable. This workflow is manual-only; the role gate allows admin, maintainer, write, and triage.

There is no sample flag. Read the [illustrative input](examples/input.md) and [output](examples/output.md) before an approved non-sensitive run. Download the report artifact for the full result.

## How It Works

Trusted fixed commands inside the workflow collect the deployment, **at most 20 operations**, optional metadata for **one in-scope failed resource**, and resource-group activity from the **last 24 hours, at most 20 events**. Resource selection comes from collected deployment evidence, not model output. Authentication, permissions, unexpected query failures, and inaccessible evidence remain explicit; they are not converted into success or assumed missing resources.

Azure logs out before inference. The agent can only `cat /tmp/gh-aw/azure/*` to read prepared evidence and use the native edit tool to write `report.md` in the empty workspace. It has no GitHub or Azure CLI access, Azure credentials, checkout, or model-selected diagnostic execution.

Safe-output upload allowlists that one report with seven-day retention. The report is advisory Markdown, not machine-validated JSON or proof of root cause. Collection limits and missing/truncated evidence must constrain claims.

## Guardrails

- **Access:** trusted scoped deployment, operation, optional resource metadata, and activity-log reads before inference.
- **Actions:** read-only collection and one report; no deploy, modify, restart, delete, role changes, GitHub comments, labels, merges, releases, or other external writes.
- **Approval:** operators verify hypotheses and perform approved remediation outside this workflow.
- **Credentials:** OIDC only in trusted collection, logout before inference, no Azure client secret or PAT.
- **Trust:** collected messages are untrusted evidence, not executable instructions.
- **Data handling:** selected diagnostics go to Copilot. Review artifact/log access and retention before using sensitive resource details.

## Customise It

Edit instructions directly in the workflow Markdown. Change diagnostics only through reviewed fixed read-only inline commands with the same scope and collection limits. Never let the agent choose commands or broaden identity roles to enable remediation.

## Challenge

Compare two approved deployment reports and identify which hypothesis needs an operator's additional evidence. Do not expand permissions or turn a recommendation into automatic remediation.
