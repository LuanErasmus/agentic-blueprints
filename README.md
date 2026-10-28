# Agentic Blueprints

> From idea to agent. Practical blueprints for real-world agentic workflows.

🧠 Practical blueprints, patterns, and working examples for building real-world agentic workflows.

Agentic Blueprints is an open-source developer resource for learning from, running, adapting, and contributing reusable implementations of agentic workflows.

## Start here

New to agentic workflows? Begin with [GitHub Issue Triage](blueprints/github-issue-triage/), the beginner blueprint. Follow its setup, run it on an issue, and inspect its recommendation.

## Blueprints

| Difficulty | Blueprint | Workflow |
|---|---|---|
| 🟢 Beginner | [GitHub Issue Triage](blueprints/github-issue-triage/) | Classify issues, check for missing information, and recommend next steps |
| 🟠 Intermediate | [GitHub PR Review](blueprints/github-pr-review/) | Assess pull request changes and repository standards for a human reviewer |
| 🔴 Advanced | [Azure Deployment Investigator](blueprints/azure-deployment-investigator/) | Investigate deployment evidence and recommend read-only diagnostics |
| 🟠 Intermediate | [Requirements Gap Investigator](blueprints/requirements-gap-investigator/) | Clarify business rules, contradictions, and acceptance criteria |
| 🟠 Intermediate | [Test Scenario Planner](blueprints/test-scenario-planner/) | Map issue or PR behaviour to test evidence and suggest scenarios |
| 🟠 Intermediate | [Delivery Risk Investigator](blueprints/delivery-risk-investigator/) | Investigate delivery blockers and explicit dependencies |
| 🔴 Advanced | [Release Readiness Helper](blueprints/release-readiness-helper/) | Assess candidate-specific company readiness evidence |
| 🔴 Advanced | [PR Confidence Calculator](blueprints/pr-confidence-calculator/) | Explain a policy-based confidence score and missing evidence |
| 🟠 Intermediate | [Stakeholder Release Notes Generator](blueprints/stakeholder-release-notes-generator/) | Translate verified changes into plain-language draft updates |

Each blueprint includes metadata, a native gh-aw Markdown workflow, setup and trigger instructions, filled-in input/output examples, and explicit guardrails. Copy and compile a selected workflow in your own repository; generated lock files are intentionally not included here. Adopt one independently; company policies and evidence remain yours. These complement GitHub features rather than replace Dependabot, code review, checks, or release tooling.

Workflow Markdown sources live in each blueprint's own folder; shared imports live in `blueprints/shared/`. Copy them into your own repository's `.github/workflows/` layout and compile there.

**Copilot licence required to run:** these blueprints use `permissions: copilot-requests: write` and the built-in Actions token for organisation billing. Use an organisation-owned repository with **Copilot Business (minimum standard organisation plan) or Copilot Enterprise**, and have an administrator enable **Copilot CLI** and **Allow use of Copilot CLI billed to the organization**. Personal Copilot plans alone do not enable this method in a personal repository; no PAT fallback is configured. See [full eligibility, policy, and billing requirements](docs/running-workflows.md#copilot-licence-and-authentication-requirements), including the separate offering for eligible enterprises. Offline tests and source compilation do not require a Copilot licence.

## Patterns

- [Human-in-the-Loop](patterns/human-in-the-loop.md)
- [Planner-Executor](patterns/planner-executor.md)

## Building blocks

- [Approval Gate](building-blocks/approval-gate.md)
- [Evaluator](building-blocks/evaluator.md)

## Getting started

Choose a blueprint, clone this repository, configure its required access, and run it using its documented steps. See the [Getting Started guide](docs/getting-started.md) for details and [What Is Agentic?](docs/what-is-agentic.md) for a practical introduction. To propose or create a blueprint, read [Contributing](CONTRIBUTING.md) and [Creating a Blueprint](docs/creating-a-blueprint.md).

## Roadmap

**Implemented:** the nine gh-aw blueprint sources above, synthetic sample dispatch, deterministic evidence/report helpers, and an offline validation suite. Live use requires gh-aw's native Copilot inference authentication and, for Azure, a scoped OIDC identity. Synthetic dispatch also requires inference authentication; offline tests do not.

**Future:** read-only evidence adapters, additional report formats, and more company-focused examples. No automatic dependency-upgrade agent is planned to duplicate Dependabot.

See [workflow usage](docs/running-workflows.md) for copy/setup/compile instructions and [the fictional company walkthrough](docs/company-walkthrough.md) for optional handoffs.

## Contributing

Community blueprints and improvements are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) to report a bug, suggest an idea, or submit a pull request.

## Security

See [SECURITY.md](SECURITY.md) for safe-use guidance and vulnerability reporting.

## License

Released under the [MIT License](LICENSE).

⭐ Star Agentic Blueprints to follow new blueprints as they are released.
