# Blueprints

Start here if this is your first agentic workflow. These gallery-inspired blueprints are adapted for this collection's simple, minimal-setup style rather than copied as full gallery implementations. Each blueprint:

- is **one Markdown file**, with no custom labels and no inference secret for the default organisation setup;
- uses read-only GitHub access for analysis, then produces **one** bounded safe output;
- runs automatically on a normal GitHub event or schedule.

| Blueprint | Runs when | Result |
| --- | --- | --- |
| [Issue Helper](issue-helper/) | An issue is opened | A friendly comment that summarises the issue and asks for missing details. |
| [Plain-Language Release Notes](plain-language-release-notes/) | An issue is closed as completed by a merged pull request | A comment that explains the change for non-technical colleagues. |
| [Weekly Update](weekly-update/) | Every Monday, or on demand | An issue summarising the past week's activity. |
| [Dependabot Readiness](dependabot-readiness/) | Every Monday, or on demand | A draft PR adding or updating grouped Dependabot configuration. |
| [CI Failure Explainer](ci-failure-explainer/) | Your named CI workflow fails on the default branch, or on demand | An evidence-based diagnosis of a failed Actions run. |
| [Documentation Drift Report](docs-drift-report/) | Every Monday, or on demand | A report of a verified mismatch between recent code and documentation. |
| [Pull Request Simplification Review](pr-simplification-review/) | A non-draft PR is opened, updated, or marked ready for review | One optional suggestion to simplify changed code without changing behavior. |
| [Workflow Permission Check](workflow-permission-check/) | Every Monday, or on demand | A review of clearly unused permissions in a bounded sample of workflows. |
| [Actions Health Report](actions-health-report/) | Every Monday, or on demand | A snapshot of sampled Actions runs and repeated failures. |

## Set up any blueprint

1. Copy the blueprint's `.md` file into `.github/workflows/` in your repository. For CI Failure Explainer, replace the example `CI` with your workflow's exact `name:` and change `main` if your default branch is named differently.
2. Choose organisation authentication or apply the optional [personal-plan setup](../docs/running-workflows.md#personal-plan-setup), then run `gh aw compile <name>` to create the matching `.lock.yml` file.
3. Commit and push both files to your default branch.

Before your first run, check the [Copilot licence requirements](../docs/running-workflows.md#copilot-licence-and-authentication-requirements).

Most blueprints only post a comment or issue. Dependabot Readiness can propose one draft PR changing only Dependabot configuration. Actions PR creation must be allowed, and security updates must be enabled separately; see its **Before you start** section. It never upgrades dependencies or merges its proposal.

## Adjust the triggers

The weekly blueprints work without replacing placeholders. To choose another day, change `schedule: weekly on monday` to `schedule: weekly on friday` in the workflow's frontmatter. Keep `workflow_dispatch:` so you can still test from **Actions > Run workflow**.

CI Failure Explainer has one required example value: `workflows: ["CI"]`. Replace `CI` with the exact top-level `name:` of your build or test workflow, not its filename. Also change `branches: [main]` if your default branch is named differently. Its README includes a complete example.

After changing any trigger, re-run `gh aw compile <name>` and commit both the Markdown and generated lock file. Schedule changes can increase the number of paid agent runs; keep review windows aligned with the frequency.
