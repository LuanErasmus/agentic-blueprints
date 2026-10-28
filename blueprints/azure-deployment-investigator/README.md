# Azure Deployment Investigator

**Difficulty:** Advanced

## Problem

Deployment failures need evidence-led investigation without granting an agent infrastructure write access.

## What the Agent Does

Reads an Azure resource-group deployment, chooses a fixed read-only diagnostic, evaluates the result, and recommends next steps. Its implementation is Azure-specific; the bounded investigation pattern is reusable elsewhere.

## Architecture

```text
Manual request → initial deployment evidence → allowlisted diagnostic decision
→ fixed Azure CLI read (or stop) → evaluate result → operator decision
```

## Prerequisites

Actions and GitHub Models access. Live mode additionally requires an existing Azure resource-group deployment, OIDC federation, and a dedicated identity with only the Azure Reader role at the resource group scope. Local sample checks need Node.js 24, not Azure credentials.

## Setup

1. Copy `.github/workflows/azure-deployment-investigator.yml`, `scripts/blueprints/`, and this directory to your trusted default branch. See [shared setup](../../docs/running-workflows.md).
2. Run with `sample` enabled first: no Azure login occurs.
3. For live use, configure an Azure application or managed identity with a GitHub OIDC federated credential restricted to this repository and approved branch. Do not use a client secret.
4. Set repository variables `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID`.
5. Grant only Reader at the relevant resource group, and verify that identity has no inherited write roles. The workflow grants `id-token: write` for login, not Azure mutation authority.
6. If using a protected GitHub environment, explicitly add it to the job and align the federated credential subject. No environment is assumed by default.

## Run It

Open **Actions → Azure Deployment Investigator → Run workflow**.

- **Sample:** leave `sample` enabled; Azure fields can be empty.
- **Live:** clear `sample`; enter `resource_group` and `deployment_name`. Subscription comes from the repository variable.

See [example field values](examples/input.md) and [illustrative report](examples/output.md). Output is the run summary and a seven-day advisory report artifact, never an Azure change.

## How It Works

The collector reads deployment status and at most 20 operations. The model chooses `inspect_failed_resource`, `inspect_recent_activity`, or `stop`. Code validates the action and uses fixed argument lists—never model-generated commands. The resource diagnostic requires a collected ARM resource ID; activity lookup is capped at 20 events over 24 hours. An absent resource is returned as `ResourceNotFound` evidence. Authentication, permission, and unexpected query failures remain visible failures, not successful investigations.

The evaluator separates facts, hypotheses, limitations, and recommendations. Messages are bounded; not all deployment evidence or older activity is inspected.

## Guardrails

- **Access:** scoped deployment, operation, resource metadata, and activity-log reads.
- **Actions:** at most one follow-up diagnostic and a report.
- **Approval:** the operator validates findings and performs any approved remediation outside this workflow.
- **Never automatic:** deploy, modify, restart, delete, or change roles.
- **Credentials:** OIDC for Azure; short-lived `GITHUB_TOKEN` with `models: read` for inference. No Copilot PAT or Azure client secret.
- **Data handling:** selected diagnostics go to GitHub Models; use synthetic or approved non-sensitive evidence. Reports can be viewed by repository readers.

## Customise It

Adapt the allowlist only with a matching fixed read-only implementation and tests. Do not broaden roles to make remediation automatic. The sample exercises the same decision/report stages without Azure access.

## Challenge

Add a read-only diagnostic for one resource type, with tests rejecting unsupported actions and a sample result illustrating missing evidence.
