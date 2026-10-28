# Azure Deployment Investigator

**Difficulty:** Advanced

## Problem

Deployment failures can leave behind many events and status messages. Operators need to collect relevant evidence, form hypotheses, and decide on the next diagnostic step without risking an automatic infrastructure change.

## What the Agent Does

A maintainer manually starts the workflow with a subscription, resource group, and deployment name. The workflow reads deployment evidence, asks Copilot CLI to choose from a fixed allowlist of read-only diagnostics, executes only that selected query, and asks a separate evaluator to assess the result and recommend next steps. It writes hypotheses and possible remediation for operator review to the Actions run summary.

## Architecture

```text
Maintainer starts a workflow_dispatch run
        ↓
Azure login using a federated, read-only identity
        ↓
Collect deployment status and up to 20 operation details
        ↓
Planner selects one allowlisted read-only diagnostic or stops
        ↓
Execute only the selected fixed read-only query
        ↓
Evaluator assesses the diagnostic result and recommends remediation
        ↓
Operator verifies evidence and chooses any remediation
```

## Prerequisites

- A GitHub repository with Actions enabled and a GitHub Copilot entitlement that permits Copilot CLI use.
- A token authorised for Copilot CLI, stored as the repository secret `COPILOT_PAT`.
- An Azure subscription containing the target resource group deployment.
- An Azure application or managed identity configured for GitHub Actions OpenID Connect federation.
- The identity must have only the Azure **Reader** role at the narrowest practical scope.
- Repository variables `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID`.
- GitHub Actions workflow permissions for `id-token: write` and `contents: read`.

## Setup

1. Add `.github/workflows/azure-deployment-investigator.yml` to your repository.
2. Configure an Azure federated credential for the repository and the branch or environment allowed to run the workflow. Do not use a client secret.
3. Add an Actions secret named `COPILOT_PAT` containing a token authorised for Copilot CLI.
4. Set the three Azure values as repository variables with the names above.
5. Assign the identity the Reader role at the resource group or narrower scope. Do not grant Contributor or Owner.
6. Confirm Copilot CLI access, then review the evidence sent to the model and your organisation's data policy before running.

## Run It

In **Actions**, select **Azure Deployment Investigator**, choose **Run workflow**, and enter the resource group and deployment name. The subscription comes from `AZURE_SUBSCRIPTION_ID`. Inspect the run summary and independently verify the suggested diagnostics in Azure.

## How It Works

The workflow uses `azure/login` with GitHub's OIDC token, then runs Azure CLI read commands to retrieve the deployment and up to 20 operation details. The planner can select only `inspect_failed_resource`, `inspect_recent_activity`, or `stop`. A deterministic validation step rejects malformed or unsupported decisions; the workflow maps accepted IDs to fixed Azure CLI read commands and never executes model-generated shell commands. A separate evaluator assesses the returned evidence and recommends next steps. The final analysis is written to the Actions run summary; it does not post to Azure or GitHub issues.

## Guardrails

- **Access:** read-only deployment, operation, failed-resource, and activity-log data; Copilot CLI inference.
- **Actions:** collect deployment evidence; optionally inspect one failed resource or up to 20 recent activity events; produce a run summary.
- **Approval:** an operator validates hypotheses and chooses any remediation outside this workflow.
- **Never automatic:** deployment, resource modification, restart, deletion, role assignment, or other write operation. Model output is never executed as a command.
- **Credentials:** OIDC federation for Azure and the `COPILOT_PAT` Actions secret for Copilot CLI; no Azure client secret or stored Azure credential.
- Diagnostic details are sent to GitHub Copilot for inference and appear in workflow execution context. Avoid running on sensitive deployments unless this data processing is approved. Do not put credentials or secrets into deployment names or diagnostic messages.

## Customise It

Add other read-only Azure CLI queries that are necessary for your environment. Keep the Azure role read-only, scope permissions narrowly, cap collected output, and document the specific data sent to the model. Never add remediation commands to this workflow.

## Challenge

Add one relevant read-only diagnostic query for your deployment type and ask the model to state which evidence supports each hypothesis. Verify that the new command cannot modify Azure resources.
