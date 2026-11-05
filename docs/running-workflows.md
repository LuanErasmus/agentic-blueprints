# Running and adapting the workflows

Each blueprint distributes **one self-contained [gh-aw](https://github.github.com/gh-aw/) Markdown file**, beside its README. Copy only that workflow into your repository. No shared imports, scripts, or configuration files are needed.

## One-time prerequisites

Install the [GitHub CLI](https://cli.github.com/) and gh-aw:

```shell
gh extension install github/gh-aw
```

Make sure GitHub Actions is enabled in your repository and check the Copilot requirements below.

## Copilot licence and authentication requirements

These blueprints use **only `permissions: copilot-requests: write`** for Copilot inference, with GitHub Actions' built-in `GITHUB_TOKEN`. No personal access token or model API key is required. This is the **organisation-billed** authentication method, not personal-seat authentication.

- Use an **organisation-owned repository** whose organisation has an active **GitHub Copilot Business or GitHub Copilot Enterprise** subscription. **Copilot Business is the minimum standard organisation plan; Copilot Enterprise is not required.** Eligible enterprises using GitHub's separate **Copilot access** offering should confirm their organisation's inference entitlement and billing with their administrator.
- A personal Copilot Free, Student, Pro, Pro+, or Max plan alone does **not** enable this organisation-billed method in a personal repository. A personal fork of this collection therefore cannot run these blueprints unchanged. Copy a workflow into an eligible organisation repository.
- An administrator must enable **Copilot CLI** and **Allow use of Copilot CLI billed to the organization** under **Organisation settings → Copilot → Policies**. Enterprise policies, permitted models, available AI credits, and spending limits must also allow the run. A licence alone is not sufficient if these controls block inference.
- Keep `copilot-requests: write` in each installed workflow's main frontmatter. It permits inference requests, not repository writes. Inference is billed to the organisation's Copilot tenant; GitHub Actions compute is billed separately. Do not assume a subscription means unlimited or free workflow runs.

Reading the examples, compiling sources, and running collection maintenance tests do not invoke Copilot or require a Copilot licence. Executing a workflow does. There is no PAT fallback.

Sources: [GitHub's organisation-token setup](https://docs.github.com/en/copilot/how-tos/github-agentic-workflows/creating-github-agentic-workflows#using-the-built-in-github_token), [gh-aw authentication](https://github.github.com/gh-aw/reference/auth/#copilot-requests-write-permission), [gh-aw billing](https://github.github.com/gh-aw/reference/billing/), and [Copilot plans](https://docs.github.com/en/copilot/get-started/plans). Check current eligibility and policies before enabling runs.

## Install one blueprint

For a concrete first installation and help choosing from all nine blueprints, start with [Getting Started](getting-started.md).

1. **Copy one file.** Copy `blueprints/<name>/<name>.md` to `.github/workflows/<name>.md` in your repository.
   For CI Failure Explainer, replace the example `CI` with your CI workflow's top-level `name:` and change `branches: [main]` if your default branch is named differently.
2. **Compile.** Run `gh aw compile <name>`. This creates `.github/workflows/<name>.lock.yml`, the GitHub Actions file that actually runs.
3. **Commit.** Commit and push both files to your default branch. This collection distributes no lock files.
4. **Try it.** Follow the **Try it** section in the blueprint's README.

### Changing a blueprint

- **Instructions** (the Markdown below the second `---`) are read at run time. Edit and commit; no recompile needed.
- **Settings** (the frontmatter between the `---` lines, such as triggers, schedule, or permissions) require `gh aw compile <name>` again.

## Blueprint triggers

| Blueprint | Trigger | Output |
|---|---|---|
| Issue Helper | Issue opened (not by a bot) | One comment on that issue |
| Plain-Language Release Notes | Issue closed as completed with one clearly linked PR | One release-note comment after merge, or a waiting comment while the PR is open |
| Weekly Update | Every Monday, or **Actions → Run workflow** | One new issue; closes the previous update issue |
| Dependabot Readiness | Every Monday, or **Actions → Run workflow** | One draft PR for grouped Dependabot configuration |
| CI Failure Explainer | Named CI workflow fails on the default branch, or **Actions → Run workflow** | One diagnosis issue |
| Documentation Drift Report | Every Monday, or **Actions → Run workflow** | One documentation-gap issue |
| Pull Request Simplification Review | Non-draft PR opened, updated, or marked ready for review | One optional comment |
| Workflow Permission Check | Every Monday, or **Actions → Run workflow** | One permission-review issue |
| Actions Health Report | Every Monday, or **Actions → Run workflow** | One sampled-health issue |

Weekly schedules work as copied. To choose another day, change `schedule: weekly on monday` to `schedule: weekly on friday`, then recompile and commit both files. Keep `workflow_dispatch:` for manual testing. If you change the frequency, also review the prompt's lookback window and inference costs.

The gh-aw role gate restricts event-triggered workflows to people with `admin`, `maintainer`, or `write` access by default. Pull-request workflows also block forks by default. Do not assume every public issue or fork PR will trigger an agent run.

For Issue Helper, its README explains the optional `roles: all` setting for accepting issues from anyone. Widening event access changes abuse risk and inference costs; inspect the trigger and data access before enabling it. Do not apply that change indiscriminately to every blueprint.

### Inspect a run

Open the installed workflow in **Actions** to review job status and output. Scheduled workflows require the compiled lock file on the default branch; they run at a compiler-selected time on the specified day, not necessarily at midnight.

No comment, issue, or PR may be the intended result. A workflow can skip because an event is ineligible, there is no useful finding, evidence is missing, or a duplicate is already covered. Inspect the run's skip or `noop` reason before assuming it failed.

CI Failure Explainer checks existing open diagnoses; PR Simplification Review checks recent conversation comments; release notes track the verified merged change in hidden comment markers. These are bounded, best-effort duplicate checks, not an atomic guarantee against all concurrent or historical duplicates.

## Controlling cost

Each agent execution uses Copilot inference; an event filtered out before agent execution does not run the agent. Every blueprint in this collection explicitly sets a **100 AI-credit per-run cap** and a **five-minute timeout**:

```yaml
max-ai-credits: 100
timeout-minutes: 5
```

The approximately 1,000-token prompt budget is guidance, not a hard token-meter limit; `max-ai-credits` is the enforced inference spending cap. It is a ceiling, not an estimate of what every run costs. Each prompt also bounds evidence reads, output size, and stop conditions.

To change a cap, edit the frontmatter, recompile, and commit both files. More frequent triggers mean more potential paid runs, even with the same per-run limit. Actions compute is billed separately. Check current billing and organisation spending policies instead of treating a subscription as unlimited usage. See [gh-aw cost management](https://github.github.com/gh-aw/reference/cost-management/#cap-ai-credits-per-run).

## How the safety model works

- The agent runs in a sandbox with **read-only GitHub permissions** for analysis. Dependabot Readiness additionally has local workspace editing tools for its configuration-only proposal.
- It cannot write to GitHub directly. It proposes **one** comment, issue, or the configuration-only draft PR described below, and a separate gh-aw job checks and posts it.
- Issues, pull requests, and comments are treated as information, never as instructions.
- Selected repository content is sent to the Copilot service; follow your company's data policy.
- Outputs can be wrong or incomplete. People keep every decision.

Dependabot Readiness may edit a local configuration file, with an enforced PR allowlist restricted to `.github/dependabot.yml` and `.github/dependabot.yaml` and a one-file patch limit. It never upgrades packages or merges its proposal. The repository or organisation must allow Actions to create PRs; Dependabot security features must be enabled separately. Review its prerequisites and the generated configuration before merging. Built-in-token PRs may not trigger CI automatically.

CI Failure Explainer reads the selected run and bounded failure logs but never downloads artifacts, checks out failed-run code, or executes repository code. Its automatic trigger is restricted to failures on this repository's default branch. Preserve these boundaries when adapting it.

## Collection maintenance only

Contributors and this collection's CI use **Node.js 24**, gh-aw, and these commands:

```shell
node scripts/blueprints/validate.mjs
node --test scripts/blueprints/blueprints.test.mjs
```

Validation stages the Markdown sources under `.blueprint-output/` and runs the compiler in strict mode without emitting locks. The offline tests make no inference calls. Adopters do **not** copy these scripts.
