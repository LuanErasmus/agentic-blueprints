# Getting Started

Agentic Blueprints are reusable GitHub Agentic Workflows (`gh-aw`). Each blueprint is one Markdown workflow and a README under `blueprints/<name>/`. Copy the workflow into your own repository, compile it, and let it help with one everyday task.

## Choose a blueprint

Start with **Issue Helper** for issue-based help or **Weekly Update** for a report you can try immediately. You can install one blueprint without installing the others.

| If you want to… | Choose | Runs when |
| --- | --- | --- |
| Welcome issue authors and ask for missing details | [Issue Helper](../blueprints/issue-helper/) | An issue is opened |
| Explain a completed change to non-technical colleagues | [Plain-Language Release Notes](../blueprints/plain-language-release-notes/) | An issue is completed with one linked merged PR |
| Share a short summary of repository activity | [Weekly Update](../blueprints/weekly-update/) | Every Monday, or manually |
| Set up or improve grouped dependency updates | [Dependabot Readiness](../blueprints/dependabot-readiness/) | Every Monday, or manually |
| Understand a failed build or test run | [CI Failure Explainer](../blueprints/ci-failure-explainer/) | Your selected CI workflow fails on the default branch, or manually |
| Spot documentation that no longer matches the code | [Documentation Drift Report](../blueprints/docs-drift-report/) | Every Monday, or manually |
| Get one optional suggestion for simpler code | [Pull Request Simplification Review](../blueprints/pr-simplification-review/) | A non-draft PR is opened, updated, or marked ready for review |
| Review clearly unused workflow permissions | [Workflow Permission Check](../blueprints/workflow-permission-check/) | Every Monday, or manually |
| See a small snapshot of recent workflow outcomes | [Actions Health Report](../blueprints/actions-health-report/) | Every Monday, or manually |

Most blueprints only post one comment or issue per run. **Dependabot Readiness** instead proposes one draft PR restricted to a Dependabot configuration file. It never upgrades packages or merges its proposal. People review the results and decide what happens next.

## One-time prerequisites

Install the [GitHub CLI](https://cli.github.com/), sign in with `gh auth login` if needed, and install the gh-aw extension:

```shell
gh extension install github/gh-aw
```

GitHub Actions must be enabled in the repository where you install the workflow. Cloning this collection is optional; you only need the chosen blueprint's workflow file.

**Copilot licence required to run:** use an organisation-owned repository with **Copilot Business (minimum standard organisation plan) or Copilot Enterprise**, with **Copilot CLI** and **Allow use of Copilot CLI billed to the organization** enabled by an administrator. A personal Copilot plan alone does not enable this method in a personal repository. See [eligibility, policies, and billing](running-workflows.md#copilot-licence-and-authentication-requirements).

## Install your first blueprint

For example, to install **Weekly Update**:

1. Copy `blueprints/weekly-update/weekly-update.md` from this collection to `.github/workflows/weekly-update.md` in your repository. Create `.github/workflows/` if it does not exist.
2. From your repository's root, compile it:

   ```shell
   gh aw compile weekly-update
   ```

3. Commit and push both `.github/workflows/weekly-update.md` and the generated `.github/workflows/weekly-update.lock.yml` to your default branch.

GitHub Actions runs the generated lock file. This collection deliberately does not distribute lock files; compile them in the adopting repository. For another blueprint, use its own filename and compile command from its README.

### Check blueprint-specific setup

No custom labels, PATs, or model API keys are required. Read the chosen README's **Before you start** and **Set it up** sections before compiling:

- **CI Failure Explainer:** replace `CI` in `workflows: ["CI"]` with your CI workflow's exact top-level `name:`, not its filename or a job name. Change `branches: [main]` if your default branch has another name.
- **Dependabot Readiness:** Actions must be allowed to create PRs. For security update PRs, enable the dependency graph, Dependabot alerts, and Dependabot security updates where supported. The generated grouping configuration does not enable these settings.
- **Plain-Language Release Notes:** the completed issue needs one clearly linked merged PR, for example through `Fixes #123` or the issue's **Development** panel.

## Try the workflow

For **Weekly Update**, open **Actions > Weekly Update > Run workflow**, or run:

```shell
gh aw run weekly-update
```

The weekly blueprints and CI Failure Explainer support manual testing. For issue- and PR-triggered blueprints, follow the README's **Try it** section to create the relevant event. Event-triggered workflows allow people with `admin`, `maintainer`, or `write` access by default; see [Running workflows](running-workflows.md#blueprint-triggers) before widening access.

Check the run in **Actions**, then inspect the resulting issue, comment, or draft PR. Some workflows deliberately produce nothing when there is no useful finding or the evidence is incomplete. Check the run output for the reason rather than expecting a report every time.

## Make small changes

Weekly schedules work as copied. To choose another day, change `schedule: weekly on monday` to `schedule: weekly on friday`. Keep `workflow_dispatch:` if you want manual testing.

- **Trigger, schedule, permissions, or safe-output changes:** run `gh aw compile <name>` again and commit both files.
- **Prompt changes below the frontmatter:** edit and commit the Markdown; no recompile is needed.

Keep evidence limits, read-only GitHub permissions, and bounded outputs in place. More frequent schedules mean more paid inference runs; adjust the prompt's review window if you change the frequency.

## Create your own Agentic Workflow

The optional [Copilot authoring toolkit](../skills-and-agents/agentic-workflow-authoring/) provides instructions, review and least-privilege skills, and a builder agent for workflows in your own repository. Install only the pieces you want. They follow your requirements rather than this collection's blueprint restrictions, and are not required to run an existing blueprint.

Writing a reusable blueprint to contribute here is a separate task: follow the [blueprint contribution guide](creating-a-blueprint.md) and [README template](../templates/blueprint-template/).

## Where to go next

- Read [Running workflows](running-workflows.md) for triggers, cost limits, and the safety model.
- Learn the difference between [automation, AI-assisted workflows, and agentic workflows](what-is-agentic.md).
- Explore reusable [patterns](../patterns/).
