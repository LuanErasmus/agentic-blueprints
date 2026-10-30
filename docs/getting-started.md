# Getting Started

Agentic Blueprints are native GitHub Agentic Workflows (`gh-aw`) examples. Each one uses a sandboxed Copilot agent to help with one everyday task in a GitHub repository.

## Choose a level

Browse the [Beginner blueprints](../blueprints/):

- [Issue Helper](../blueprints/beginner/issue-helper/) welcomes new issues and asks for missing details.
- [Plain-Language Release Notes](../blueprints/beginner/plain-language-release-notes/) explains completed work for non-technical colleagues.
- [Weekly Update](../blueprints/beginner/weekly-update/) opens a weekly summary issue.

Beginner blueprints need no labels, secrets, or settings. Copy them as they are.

## One-time prerequisites

Install the [GitHub CLI](https://cli.github.com/) and gh-aw with `gh extension install github/gh-aw`. Cloning this collection is optional; you only need one workflow file.

**Copilot licence required to run:** use an organisation-owned repository with **Copilot Business (minimum standard organisation plan) or Copilot Enterprise**, with **Copilot CLI** and **Allow use of Copilot CLI billed to the organization** enabled by an administrator. A personal Copilot plan alone does not enable this method in a personal repository. See [eligibility, policies, and billing](running-workflows.md#copilot-licence-and-authentication-requirements).

## Setup in three steps

1. Copy the blueprint's `.md` file to `.github/workflows/` in your repository.
2. Run `gh aw compile <name>`.
3. Commit and push the `.md` and generated `.lock.yml` to your default branch.

Then follow the **Try it** section in the blueprint's README.

## Where to go next

- Read [Running workflows](running-workflows.md) for triggers, cost limits, and the safety model.
- Learn the difference between [automation, AI-assisted workflows, and agentic workflows](what-is-agentic.md).
- Explore reusable [patterns](../patterns/).
- Create your own with the [blueprint template](../templates/blueprint-template/) and [Creating a Blueprint](creating-a-blueprint.md).
