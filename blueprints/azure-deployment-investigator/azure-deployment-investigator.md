---
name: Azure Deployment Investigator
strict: true
timeout-minutes: 10
concurrency:
  job-discriminator: ${{ github.run_id }}
description: Investigate read-only Azure deployment evidence and advise an operator.
on:
  roles: [admin, maintainer, write]
  report-blocked-version: false
  workflow_dispatch:
    inputs:
      sample:
        description: Use synthetic evidence without Azure login (still requires Copilot inference)
        type: boolean
        default: true
      resource_group:
        description: Existing resource group (required when sample is false)
        type: string
      deployment_name:
        description: Existing deployment name (required when sample is false)
        type: string
if: github.ref_name == github.event.repository.default_branch
imports:
  - shared/blueprint-runtime.md
  - shared/report-contract.md
permissions:
  contents: read
  issues: read
  pull-requests: read
  copilot-requests: write
  id-token: write
env:
  BLUEPRINT_SLUG: azure-deployment-investigator
steps:
  - name: Azure OIDC login using a resource-group-scoped Reader identity
    if: inputs.sample == false
    uses: azure/login@v2
    env:
      AZURE_CONFIG_DIR: ${{ runner.temp }}/blueprint-azure
    with:
      client-id: ${{ vars.AZURE_CLIENT_ID }}
      tenant-id: ${{ vars.AZURE_TENANT_ID }}
      subscription-id: ${{ vars.AZURE_SUBSCRIPTION_ID }}
  - name: Collect deployment and fixed read-only diagnostic evidence
    run: node scripts/blueprints/evidence.mjs azure-deployment-investigator
    env:
      AZURE_CONFIG_DIR: ${{ runner.temp }}/blueprint-azure
      SAMPLE: ${{ inputs.sample }}
      RESOURCE_GROUP: ${{ inputs.resource_group }}
      DEPLOYMENT_NAME: ${{ inputs.deployment_name }}
      AZURE_SUBSCRIPTION_ID: ${{ vars.AZURE_SUBSCRIPTION_ID }}
  - name: Remove Azure login before agent execution
    if: always() && inputs.sample == false
    env:
      AZURE_CONFIG_DIR: ${{ runner.temp }}/blueprint-azure
    run: |
      az logout
      az account clear
---

# Azure Deployment Investigator

Investigate the prepared deployment, bounded operation records, and fixed
resource/activity diagnostic snapshots. Choose which evidence is useful to
test a hypothesis, evaluate whether it actually supports that hypothesis, and
stop when the available evidence cannot establish more.
If the deployment succeeded and there is no failure evidence, call `noop`
instead of inventing an incident.

Azure data collection occurs deterministically BEFORE the native agent starts.
The agent has no Azure tool, login, or authority to run proposed commands.
The only reads are deployment group show, operation group list (20 records),
resource show for one collected in-scope failed resource, and a 24-hour activity
snapshot (20 events). There is no model-generated command execution.

Distinguish confirmed facts, plausible causes, and unresolved questions.
ResourceNotFound is evidence, not proof of the root cause. Authentication and
permission errors are failures, never missing-resource evidence.
Recommend a proportionate next human diagnostic or remediation and identify
what would confirm it. Do not change Azure resources, redeploy, broaden IAM,
or claim that a suggested fix has been executed.

In sample mode do not use GitHub tools or imply that Azure was contacted.
Pass the literal slug `azure-deployment-investigator` to the report helper.
