# Agentic Blueprints

> From idea to agent. Practical blueprints for real-world agentic workflows.

🧠 Practical blueprints, patterns, and working examples for building real-world agentic workflows.

Agentic Blueprints is an open-source developer resource for learning from, running, adapting, and contributing reusable implementations of agentic workflows.

## Start here

New to agentic workflows? Pick a [Beginner blueprint](blueprints/beginner/). Each one is a single file you copy, compile, and commit, with nothing else to set up.

## Blueprints

Blueprints are grouped by [experience level](blueprints/):

| Level | Blueprint | Runs when | Result |
|---|---|---|---|
| 🟢 Beginner | [Issue Helper](blueprints/beginner/issue-helper/) | An issue is opened | A friendly comment that summarises the issue and asks for missing details |
| 🟢 Beginner | [Plain-Language Release Notes](blueprints/beginner/plain-language-release-notes/) | An issue is completed by a merged pull request | A comment that explains the change for non-technical colleagues |
| 🟢 Beginner | [Weekly Update](blueprints/beginner/weekly-update/) | Every Monday, or on demand | An issue summarising the past week |
| 🟠 Intermediate | [Coming soon](blueprints/intermediate/) | | |
| 🔴 Expert | [Coming soon](blueprints/expert/) | | |

Each blueprint is **one self-contained gh-aw Markdown file** with a README. Beginner blueprints only read your repository and post one comment or open one issue. They complement GitHub features such as code review, Dependabot, and releases rather than replace them. Generated `.lock.yml` files are intentionally not included; you compile in your own repository.

### Setup in three steps

One-time prerequisites: install the [GitHub CLI](https://cli.github.com/) and gh-aw (`gh extension install github/gh-aw`), and confirm the Copilot licence below.

1. Copy the blueprint's `.md` file to `.github/workflows/` in your repository.
2. Run `gh aw compile <name>`.
3. Commit and push the `.md` and generated `.lock.yml` to your default branch.

**Copilot licence required to run:** these blueprints use `permissions: copilot-requests: write` and the built-in Actions token for organisation billing. Use an organisation-owned repository with **Copilot Business (minimum standard organisation plan) or Copilot Enterprise**, and have an administrator enable **Copilot CLI** and **Allow use of Copilot CLI billed to the organization**. Personal Copilot plans alone do not enable this method in a personal repository. See [full eligibility, policy, and billing requirements](docs/running-workflows.md#copilot-licence-and-authentication-requirements). Offline tests and source compilation do not require a Copilot licence.

## Patterns

- [Human-in-the-Loop](patterns/human-in-the-loop.md)
- [Planner-Executor](patterns/planner-executor.md)

## Building blocks

- [Approval Gate](building-blocks/approval-gate.md)
- [Evaluator](building-blocks/evaluator.md)

## Getting started

Choose a blueprint and copy its single workflow file; cloning this collection is optional. See the [Getting Started guide](docs/getting-started.md) and [What Is Agentic?](docs/what-is-agentic.md) for a practical introduction. To propose or create a blueprint, read [Contributing](CONTRIBUTING.md) and [Creating a Blueprint](docs/creating-a-blueprint.md).

## Roadmap

**Included:** three Beginner gh-aw blueprints and repository-only source validation tests.

**Next:** Intermediate blueprints (labels, manual runs, team settings) and Expert blueprints (external evidence, multi-step investigations). No agent is planned to duplicate Dependabot or other built-in GitHub features.

## Contributing

Community blueprints and improvements are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) to report a bug, suggest an idea, or submit a pull request.

## Security

See [SECURITY.md](SECURITY.md) for safe-use guidance and vulnerability reporting.

## License

Released under the [MIT License](LICENSE).

⭐ Star Agentic Blueprints to follow new blueprints as they are released.
