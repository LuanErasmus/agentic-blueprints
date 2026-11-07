# Agentic Blueprints

> From idea to agent. Practical blueprints, patterns, and working examples for real-world agentic workflows.

Agentic Blueprints is an open-source developer resource for learning from, running, adapting, and contributing reusable implementations of agentic workflows.

## Start here

New to agentic workflows? Pick a [blueprint](blueprints/). Each one is a single file you copy, compile, and commit. Automatic triggers are included; only CI Failure Explainer needs your CI workflow's name and, if different from `main`, your default branch's name.

## Blueprints

Browse the [blueprint collection](blueprints/):

| Blueprint | Runs when | Result |
|---|---|---|
| [Issue Helper](blueprints/issue-helper/) | An issue is opened | A friendly comment that summarises the issue and asks for missing details |
| [Plain-Language Release Notes](blueprints/plain-language-release-notes/) | An issue is completed by a merged pull request | A comment that explains the change for non-technical colleagues |
| [Weekly Update](blueprints/weekly-update/) | Every Monday, or on demand | An issue summarising the past week |
| [Dependabot Readiness](blueprints/dependabot-readiness/) | Every Monday, or on demand | A draft PR adding or updating grouped Dependabot configuration |
| [CI Failure Explainer](blueprints/ci-failure-explainer/) | Your named CI workflow fails on the default branch, or on demand | An evidence-based diagnosis of a failed Actions run |
| [Documentation Drift Report](blueprints/docs-drift-report/) | Every Monday, or on demand | A report of a verified mismatch between recent code and documentation |
| [Pull Request Simplification Review](blueprints/pr-simplification-review/) | A non-draft PR is opened, updated, or marked ready for review | One optional suggestion to simplify changed code without changing behavior |
| [Workflow Permission Check](blueprints/workflow-permission-check/) | Every Monday, or on demand | A review of clearly unused permissions in a bounded sample of workflows |
| [Actions Health Report](blueprints/actions-health-report/) | Every Monday, or on demand | A snapshot of sampled Actions runs and repeated failures |

These six new blueprints take ideas from the GitHub Agentic Workflows Gallery and reshape them for this collection: no cross-repository credentials and one bounded, reviewable output.
Each blueprint is **one self-contained gh-aw Markdown file** with a README. Most read your repository and post one comment or open one issue. Dependabot Readiness instead proposes one draft PR restricted to Dependabot configuration; it never upgrades packages or merges changes. It requires Actions PR creation to be allowed, and security updates must be enabled separately. They complement GitHub features such as code review, Dependabot, and releases rather than replace them. Generated `.lock.yml` files are intentionally not included; you compile in your own repository.

### Setup in three steps

One-time prerequisites: install the [GitHub CLI](https://cli.github.com/) and gh-aw (`gh extension install github/gh-aw`), and confirm the Copilot licence below.

1. Copy the blueprint's `.md` file to `.github/workflows/` in your repository. For CI Failure Explainer, replace the example `CI` with your workflow's exact `name:` and change `main` if your default branch is named differently.
2. Run `gh aw compile <name>`.
3. Commit and push the `.md` and generated `.lock.yml` to your default branch.

**Copilot licence required to run:** these blueprints use `permissions: copilot-requests: write` and the built-in Actions token for organisation billing. Use an organisation-owned repository with **Copilot Business (minimum standard organisation plan) or Copilot Enterprise**, and have an administrator enable **Copilot CLI** and **Allow use of Copilot CLI billed to the organization**. Personal Copilot plans alone do not enable this method in a personal repository. See [full eligibility, policy, and billing requirements](docs/running-workflows.md#copilot-licence-and-authentication-requirements). Offline tests and source compilation do not require a Copilot licence.

## Skills, agents, and instructions

Want help creating or reviewing your own Agentic Workflows? The optional [Agentic Workflow Authoring Toolkit](skills-and-agents/agentic-workflow-authoring/) includes path-specific Copilot instructions, review and least-privilege skills, and a builder agent. Copy the pieces you want into your repository; they follow your workflow requirements, not this collection's blueprint restrictions, and need no compilation.

These customizations support your own workflows, not blueprint generation for this collection. Blueprint contributors use the separate contribution guide and README template.

## Patterns

- [Human-in-the-Loop](patterns/human-in-the-loop.md)
- [Planner-Executor](patterns/planner-executor.md)

## Getting started

Choose a blueprint and copy its single workflow file; cloning this collection is optional. See the [Getting Started guide](docs/getting-started.md) and [What Is Agentic?](docs/what-is-agentic.md) for a practical introduction. To propose or create a blueprint, read [Contributing](CONTRIBUTING.md) and [Creating a Blueprint](docs/creating-a-blueprint.md).

## Contributing

Community blueprints and improvements are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) to report a bug, suggest an idea, or submit a pull request.

## Security

See [SECURITY.md](SECURITY.md) for safe-use guidance and vulnerability reporting.

## License

Released under the [MIT License](LICENSE).

⭐ Star Agentic Blueprints to follow new blueprints as they are released.
