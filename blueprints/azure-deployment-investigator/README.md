# Azure Deployment Investigator

**Difficulty:** Advanced

## Problem

Deployment failures need evidence-led investigation without granting an agent infrastructure write access.

## What the Agent Does

Reasons over bounded Azure deployment and diagnostic evidence collected by a trusted deterministic step, then recommends next steps. The collector uses fixed read-only Azure CLI commands; the agent has no Azure credentials or CLI access and does not choose or execute diagnostics.

## Architecture

```text
Manual request → trusted OIDC collector reads deployment and fixed diagnostics
→ Azure logout → sandboxed Copilot analysis → validated advisory report
→ restricted report artifact → operator decision
```

## Prerequisites

GitHub Actions, gh-aw, and Copilot inference access. Live mode additionally requires an existing Azure resource-group deployment, OIDC federation, and a dedicated identity with only the Azure Reader role at the resource group scope. Offline helper tests need Node.js 24, not credentials.

## Setup

1. Copy `.github/workflows/azure-deployment-investigator.md`, `.github/workflows/shared/blueprint-runtime.md`, `.github/workflows/shared/report-contract.md`, the complete `scripts/blueprints/` directory, and this blueprint directory to your trusted default branch. See [shared setup](../../docs/running-workflows.md).
2. Install gh-aw and run `gh aw compile azure-deployment-investigator` in your repository; review and commit the generated lock there. The compiler may warn that a safe update introduces `azure/login`; inspect the action version and OIDC trust configuration, verify the identity is limited to Reader at the target resource group, and review the change before approving it. The example uses no new secret. Do not blindly bypass safe-update warnings.
3. Configure Copilot inference authentication using the [official gh-aw guide](https://github.github.com/gh-aw/reference/auth/).
4. Run with `sample: true` first: no Azure login occurs, but Copilot inference is still required.
5. For live use, configure an Azure application or managed identity with a GitHub OIDC federated credential restricted to this repository and approved branch. Do not use a client secret.
6. Set repository variables `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID`.
7. Grant only Reader at the relevant resource group, and verify that identity has no inherited write roles. The workflow grants `id-token: write` for login, not Azure mutation authority.
8. If using a protected GitHub environment, explicitly add it to the job and align the federated credential subject. No environment is assumed by default.

## Run It

Open **Actions → Azure Deployment Investigator → Run workflow** on the default branch.

- **Sample:** leave `sample: true` (the default); Azure fields can be empty. This still invokes Copilot.
- **Live:** set `sample: false`; enter `resource_group` and `deployment_name`. Subscription comes from the repository variable.

See [example field values](examples/input.md) and [illustrative report](examples/output.md). Download the report artifact for the full result; it is retained for seven days. The native run summary is not the complete report. No Azure change is made.

## How It Works

The trusted collector reads deployment status and at most 20 operations, along with fixed resource and activity diagnostics. It uses fixed Azure CLI argument lists and never constructs commands from model output. Resource lookup uses a collected ARM resource ID; activity lookup is capped at 20 events over 24 hours. An absent resource is returned as `ResourceNotFound` evidence. Authentication, permission, and unexpected query failures remain visible failures. The collector logs out before Copilot starts, so the agent cannot query Azure or initiate further diagnostics.

The agent separates facts, hypotheses, limitations, and recommendations from the collected evidence. Messages are bounded; not all deployment evidence or older activity is inspected. The deterministic report helper validates the response and produces the artifact.

## Guardrails

- **Access:** scoped deployment, operation, resource metadata, and activity-log reads.
- **Actions:** bounded read-only collection before inference and report generation only.
- **Approval:** the operator validates findings and performs any approved remediation outside this workflow.
- **Never automatic:** deploy, modify, restart, delete, or change roles.
- **Credentials:** Azure OIDC is used only by the collector, which logs out before the agent step. Copilot inference uses gh-aw's native authentication. No Azure client secret is needed.
- **Data handling:** collected evidence is sent to Copilot. Upload is limited to the two report files with seven-day retention; use synthetic or approved non-sensitive evidence.

## Customise It

Change the diagnostics only by updating the deterministic collector with fixed read-only commands and tests. The Copilot agent may select which already-collected evidence supports its hypothesis; it does not select or run diagnostics. Do not broaden roles to make remediation automatic. Sample mode uses synthetic evidence and does not log in to Azure.

## Challenge

Add a read-only diagnostic for one resource type, with tests rejecting unsupported actions and a sample result illustrating missing evidence.
