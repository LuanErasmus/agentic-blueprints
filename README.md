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
| 🔴 Advanced | [PR Confidence Calculator](blueprints/pr-confidence-calculator/) | Explain an AI-assessed advisory index and missing evidence |
| 🟠 Intermediate | [Stakeholder Release Notes Generator](blueprints/stakeholder-release-notes-generator/) | Translate verified changes into plain-language draft updates |

Each blueprint includes a native gh-aw Markdown workflow, a README with setup and trigger instructions, filled-in input/output examples, and explicit guardrails. Copy and compile a selected workflow in your own repository; generated lock files are intentionally not included here. Adopt one independently; company policies and evidence remain yours. These complement GitHub features rather than replace Dependabot, code review, checks, or release tooling.

Each workflow is **one self-contained Markdown file** in its blueprint folder. No shared imports, runtime scripts, JSON configuration, or report schema need to be copied.

### Setup in three steps

One-time prerequisites: install the [GitHub CLI](https://cli.github.com/) and gh-aw (`gh extension install github/gh-aw`), and confirm the organisation access below.

1. Copy your chosen workflow file to `.github/workflows/<id>.md` in your repository.
2. Customise labels and instructions directly in that Markdown; run `gh aw compile <id>`.
3. Review and commit the source and generated `.lock.yml` in **your** repository. Run it from Actions on the default branch with the required issue/PR number (Azure requires deployment inputs).

Read the advisory Markdown report artifact and verify its evidence before acting. The filled-in examples are illustrative templates, not executable synthetic dispatches.

**Copilot licence required to run:** these blueprints use `permissions: copilot-requests: write` and the built-in Actions token for organisation billing. Use an organisation-owned repository with **Copilot Business (minimum standard organisation plan) or Copilot Enterprise**, and have an administrator enable **Copilot CLI** and **Allow use of Copilot CLI billed to the organization**. Personal Copilot plans alone do not enable this method in a personal repository; no PAT fallback is configured. See [full eligibility, policy, and billing requirements](docs/running-workflows.md#copilot-licence-and-authentication-requirements), including the separate offering for eligible enterprises. Offline tests and source compilation do not require a Copilot licence.

## Patterns

- [Human-in-the-Loop](patterns/human-in-the-loop.md)
- [Planner-Executor](patterns/planner-executor.md)

## Building blocks

- [Approval Gate](building-blocks/approval-gate.md)
- [Evaluator](building-blocks/evaluator.md)

## Getting started

Choose a blueprint and copy its single workflow file; cloning this collection is optional. See the [Getting Started guide](docs/getting-started.md) for details and [What Is Agentic?](docs/what-is-agentic.md) for a practical introduction. To propose or create a blueprint, read [Contributing](CONTRIBUTING.md) and [Creating a Blueprint](docs/creating-a-blueprint.md).

## Roadmap

**Included:** nine self-contained gh-aw blueprint sources, illustrative input/output templates, and repository-only source validation tests. Workflows inspect evidence with read-only tools and upload one advisory Markdown report, retained for seven days. Azure additionally requires a scoped OIDC identity. Compilation and offline tests do not invoke inference; source validation is not verification of live integrations.

**Future:** read-only evidence adapters, additional report formats, and more company-focused examples. No automatic dependency-upgrade agent is planned to duplicate Dependabot.

See [workflow usage](docs/running-workflows.md) for copy/setup/compile instructions and [the fictional company walkthrough](docs/company-walkthrough.md) for optional handoffs.

## Contributing

Community blueprints and improvements are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) to report a bug, suggest an idea, or submit a pull request.

## Security

See [SECURITY.md](SECURITY.md) for safe-use guidance and vulnerability reporting.

## License

Released under the [MIT License](LICENSE).

⭐ Star Agentic Blueprints to follow new blueprints as they are released.
