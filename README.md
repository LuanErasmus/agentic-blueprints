# Agentic Blueprints

![Agentic Blueprints — a friendly LE robot holding a workflow blueprint, with the tagline “Your next workflow starts here.”](assets/social-preview.jpg)

> From idea to agent. Practical blueprints, patterns, and working examples for real-world agentic workflows.

Agentic Blueprints is an open-source developer resource for learning from, running, adapting, and contributing reusable implementations of agentic workflows.

## Start here

| What would you like to do? | Start here | Next step |
| --- | --- | --- |
| **Use a workflow** | [Browse the blueprints](blueprints/) | [Install your first workflow](docs/getting-started.md) |
| **Build your own** | [Skills, agents, and instructions](skills-and-agents/) | Choose a Copilot helper and follow its copy/install steps |
| **Learn** | [Learning guides](docs/) | Understand the concepts, safety model, and reusable patterns |

You do not need the whole repository. Copy one workflow or install only the Copilot helpers you want.

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

The collection adapts ideas from the GitHub Agentic Workflows Gallery into single-repository workflows with bounded, reviewable outputs.
Each blueprint is **one self-contained gh-aw Markdown file** with a README. Most read your repository and post one comment or open one issue. Dependabot Readiness instead proposes one draft PR restricted to Dependabot configuration; it never upgrades packages or merges changes. It requires Actions PR creation to be allowed, and security updates must be enabled separately. They complement GitHub features such as code review, Dependabot, and releases rather than replace them. Generated `.lock.yml` files are intentionally not included; you compile in your own repository.

### Setup in three steps

One-time prerequisites: install the [GitHub CLI](https://cli.github.com/) and gh-aw (`gh extension install github/gh-aw`), and confirm the Copilot licence below.

1. Copy the blueprint's `.md` file to `.github/workflows/` in your repository. For CI Failure Explainer, replace the example `CI` with your workflow's exact `name:` and change `main` if your default branch is named differently.
2. Run `gh aw compile <name>`.
3. Commit and push the `.md` and generated `.lock.yml` to your default branch.

**Copilot licence required to run:** these blueprints use `permissions: copilot-requests: write` and the built-in Actions token for organisation billing. Use an organisation-owned repository with **Copilot Business (minimum standard organisation plan) or Copilot Enterprise**, and have an administrator enable **Copilot CLI** and **Allow use of Copilot CLI billed to the organization**. Personal Copilot plans alone do not enable this method in a personal repository. See [full eligibility, policy, and billing requirements](docs/running-workflows.md#copilot-licence-and-authentication-requirements). Offline tests and source compilation do not require a Copilot licence.

## Build your own

The [Copilot helpers](skills-and-agents/) support your own Agentic Workflows, not blueprint generation for this collection. Choose [instructions](skills-and-agents/instructions/), a [builder agent](skills-and-agents/agents/), or [review and least-privilege skills](skills-and-agents/skills/). Each section explains where to copy its files and how to use them; no compilation is needed for the helpers.

## Learn

The [documentation hub](docs/) connects the introduction, installation guide, runtime requirements, and patterns. Start with [What Is Agentic?](docs/what-is-agentic.md) if the concepts are new.

## Repository map

```text
blueprints/          Ready-to-adapt workflows, each with setup instructions
skills-and-agents/  Copilot instructions, skills, and agents grouped by type
docs/               Guides, patterns, and the blueprint contribution template
assets/             Repository banner and artwork
scripts/            Contributor validation, not needed by adopters
```

## Contributing

Community blueprints and improvements are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) to report a bug, suggest an idea, or submit a pull request. For a collection blueprint, use the [contribution guide](docs/creating-a-blueprint.md) and [README template](docs/templates/blueprint-template/).

## Security

See [SECURITY.md](SECURITY.md) for safe-use guidance and vulnerability reporting.

## License

Released under the [MIT License](LICENSE).

⭐ Star Agentic Blueprints to follow new blueprints as they are released.
