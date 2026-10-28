# Getting Started

Agentic Blueprints are native GitHub Agentic Workflows (`gh-aw`) examples that use a sandboxed Copilot agent to help with a specific engineering or business process. Start with one example, follow its guardrails, and adapt it only after you understand its permissions and data flow.

## Choose a blueprint

- [GitHub Issue Triage](../blueprints/github-issue-triage/) is the beginner starting point. It analyses an issue and recommends a response.
- [GitHub PR Review](../blueprints/github-pr-review/) analyses pull request changes and repository guidance for a human reviewer.
- [Azure Deployment Investigator](../blueprints/azure-deployment-investigator/) collects bounded read-only deployment diagnostics before inference and recommends next steps.
- [Requirements Gap Investigator](../blueprints/requirements-gap-investigator/) checks business requests for ambiguity and missing criteria.
- [Test Scenario Planner](../blueprints/test-scenario-planner/) investigates requirements or PR behaviour against available test evidence.
- [Delivery Risk Investigator](../blueprints/delivery-risk-investigator/) investigates blockers and dependencies without rescheduling work.
- [Release Readiness Helper](../blueprints/release-readiness-helper/) builds an evidence-linked candidate readiness brief.
- [PR Confidence Calculator](../blueprints/pr-confidence-calculator/) explains a configurable evidence assessment, not a guarantee of correctness.
- [Stakeholder Release Notes Generator](../blueprints/stakeholder-release-notes-generator/) drafts non-technical release communication for approval.

Each blueprint lists its difficulty, prerequisites, required credentials, and data handling. Read its **Guardrails** section before setting it up.

## Clone the repository

```shell
git clone https://github.com/LuanErasmus/agentic-blueprints.git
cd agentic-blueprints
```

You can also fork the repository and clone your fork if you plan to customise or contribute.

## Configure a blueprint

Follow the blueprint's **Setup** steps and [workflow usage guide](running-workflows.md). Copy the native workflow Markdown source, shared workflow files, required scripts, and blueprint config into your repository, then install gh-aw and compile the workflow there. This repository intentionally does not include generated lock files. Copilot inference uses gh-aw's native authentication; follow the [official authentication guide](https://github.github.com/gh-aw/reference/auth/). Azure live mode additionally requires OIDC federation and a read-only Reader identity. Synthetic dispatch still invokes Copilot inference; the offline Node.js 24 test suite is credential-free.

Before enabling a workflow, review its permissions, triggers, prompt, and the data sent to the model. Use a test repository or non-sensitive example first.

## Run it

Use the **Run It** section of the selected blueprint. Automatic triggers are label-gated, and manual dispatch supports synthetic samples or live evidence. The gh-aw sandbox blocks automatic fork runs; draft PRs are skipped where applicable. Inspect the uploaded report artifact and independently verify recommendations. The native run summary is not the full report. These examples do not grant the agent authority to approve a review, change GitHub content, or modify Azure resources.

## Where to go next

- Learn the difference between [automation, AI-assisted workflows, and agentic workflows](what-is-agentic.md).
- Explore reusable [patterns](../patterns/) and [building blocks](../building-blocks/).
- Adapt the [blueprint template](../templates/blueprint-template/) and read [Creating a Blueprint](creating-a-blueprint.md).
- Report issues or contribute using [CONTRIBUTING.md](../CONTRIBUTING.md).
