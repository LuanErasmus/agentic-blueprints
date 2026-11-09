# Running and adapting the workflows

The nine standard blueprints distribute **one self-contained [gh-aw](https://github.github.com/gh-aw/) Markdown file**, beside their README. Copy only that workflow into your repository; they require no shared imports, scripts, or configuration files. [Into Azure Cost Reviewer](../blueprints/into-azure-cost-reviewer/) is a multi-file blueprint: copy its entry workflow, three agent contracts, and four policy/process files using its README.

## One-time prerequisites

Install the [GitHub CLI](https://cli.github.com/) and gh-aw:

```shell
gh extension install github/gh-aw
```

Make sure GitHub Actions is enabled in your repository and check the Copilot requirements below.

## Copilot licence and authentication requirements

The distributed sources default to **organisation billing** using `permissions: copilot-requests: write` with GitHub Actions' built-in `GITHUB_TOKEN`. This default needs no personal access token or model API key. For personal repositories, follow the optional [personal-plan setup](#personal-plan-setup) before compiling. Verify each blueprint's engine/runtime requirements; Into Azure Cost Reviewer uses Copilot SDK mode and has not been compiled or live-validated in this collection.

### Organisation setup (default)

- Use an **organisation-owned repository** whose organisation has an active **GitHub Copilot Business or GitHub Copilot Enterprise** subscription. **Copilot Business is the minimum standard organisation plan; Copilot Enterprise is not required.** Eligible enterprises using GitHub's separate **Copilot access** offering should confirm their organisation's inference entitlement and billing with their administrator.
- A personal Copilot Free, Student, Pro, Pro+, or Max plan alone does **not** enable this organisation-billed method in a personal repository. A personal fork of this collection therefore cannot run these blueprints unchanged. Copy a workflow into an eligible organisation repository.
- An administrator must enable **Copilot CLI** and **Allow use of Copilot CLI billed to the organization** under **Organisation settings → Copilot → Policies**. Enterprise policies, permitted models, available AI credits, and spending limits must also allow the run. A licence alone is not sufficient if these controls block inference.
- Keep `copilot-requests: write` in each installed workflow's main frontmatter. It permits inference requests, not repository writes. Inference is billed to the organisation's Copilot tenant; GitHub Actions compute is billed separately. Do not assume a subscription means unlimited or free workflow runs.

Reading the examples, compiling sources, and running collection maintenance tests do not invoke Copilot or require a Copilot licence. Executing a workflow does. Authentication does not automatically fall back between these methods.

### Personal-plan setup

Use this option when the token owner has active Copilot inference access under their personal subscription and the selected blueprint's runtime is supported. Check current plan eligibility, available models, allowance, and spending policies; this guide does not guarantee every personal plan can run every model.

1. Copy the chosen workflow into your repository as described below.
2. Remove **only** `copilot-requests: write` from its frontmatter `permissions` block. Preserve all other permissions, tools, limits, and safe outputs. If this permission remains, gh-aw ignores the personal token for inference.
3. In **GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens**, create a token with your **user account** as resource owner and **Account permissions → Copilot Requests: Read**. Choose a finite expiry. Do not add repository write permissions for inference.
4. In the destination repository, open **Settings → Secrets and variables → Actions → New repository secret**. Name it **`COPILOT_GITHUB_TOKEN`** and paste the token as its value. Never put it in workflow Markdown, shell command arguments, commits, issues, or logs.
5. Run `gh aw compile <name>` and commit the source and regenerated `.lock.yml`. No explicit secret binding or engine change is needed; gh-aw handles this named secret.
6. Follow the blueprint's **Try it** steps. If inference fails, check the token's expiry, account permission, owner's Copilot access, model availability, and usage allowance. Rotate the secret when the token expires or is revoked.

For example, Weekly Update's personal-mode permissions become:

```yaml
permissions:
  contents: read
  issues: read
  pull-requests: read
```

Other blueprints have different read scopes: retain their own scopes rather than copying this block wholesale. This changes **inference authentication only**. Repository reads and safe-output writes still use the built-in Actions token; do not set `GH_AW_GITHUB_TOKEN` or broaden repository permissions just to enable personal inference. Dependabot's PR policy and all other blueprint-specific prerequisites still apply.

Inference consumes the token owner's Copilot entitlement and allowance; Actions compute is separate. The organisation 100-credit cap must not be assumed to enforce a personal subscription allowance identically: verify current [billing and cap behavior](https://github.github.com/gh-aw/reference/billing/) for PAT inference and monitor usage.

This setup follows [gh-aw's documented personal-token authentication](https://github.github.com/gh-aw/reference/auth/#copilot_github_token). Source compilation can verify configuration, but not token validity, plan eligibility, or a successful live run. No personal-token live run has been verified for this collection.

Sources: [GitHub's organisation-token setup](https://docs.github.com/en/copilot/how-tos/github-agentic-workflows/creating-github-agentic-workflows#using-the-built-in-github_token), [gh-aw authentication](https://github.github.com/gh-aw/reference/auth/#copilot-requests-write-permission), [gh-aw billing](https://github.github.com/gh-aw/reference/billing/), and [Copilot plans](https://docs.github.com/en/copilot/get-started/plans). Check current eligibility and policies before enabling runs.

## Install one blueprint

For a concrete first installation and help choosing a blueprint, start with [Getting Started](getting-started.md). The steps below cover the standard single-file workflows; use the [Into Azure copy map](../blueprints/into-azure-cost-reviewer/README.md#set-it-up) for the multi-file blueprint.

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
| Into Azure Cost Reviewer | PR opened, synchronized, or reopened with `.bicep`/`.bicepparam` changes | One consolidated Azure cost review comment; replaces its older report |

Weekly schedules work as copied. To choose another day, change `schedule: weekly on monday` to `schedule: weekly on friday`, then recompile and commit both files. Keep `workflow_dispatch:` for manual testing. If you change the frequency, also review the prompt's lookback window and inference costs.

The gh-aw role gate restricts event-triggered workflows to people with `admin`, `maintainer`, or `write` access by default. Pull-request workflows also block forks by default. Do not assume every public issue or fork PR will trigger an agent run.

For Issue Helper, its README explains the optional `roles: all` setting for accepting issues from anyone. Widening event access changes abuse risk and inference costs; inspect the trigger and data access before enabling it. Do not apply that change indiscriminately to every blueprint.

### Inspect a run

Open the installed workflow in **Actions** to review job status and output. Scheduled workflows require the compiled lock file on the default branch; they run at a compiler-selected time on the specified day, not necessarily at midnight.

No comment, issue, or PR may be the intended result. A workflow can skip because an event is ineligible, there is no useful finding, evidence is missing, or a duplicate is already covered. Inspect the run's skip or `noop` reason before assuming it failed.

CI Failure Explainer checks existing open diagnoses; PR Simplification Review checks recent conversation comments; release notes track the verified merged change in hidden comment markers. These are bounded, best-effort duplicate checks, not an atomic guarantee against all concurrent or historical duplicates.

## Controlling cost

Each agent execution uses Copilot inference; an event filtered out before agent execution does not run the agent. The nine standard blueprints explicitly configure **`max-ai-credits: 100`** and a **five-minute timeout**. Credit accounting and enforcement depend on the authentication/provider path:

```yaml
max-ai-credits: 100
timeout-minutes: 5
```

The approximately 1,000-token prompt budget is guidance, not a hard token-meter limit. `max-ai-credits` configures an inference spending ceiling, not an estimate of what every run costs; its accounting and enforcement depend on the authentication/provider path. For personal-token inference, verify upstream billing behavior rather than treating it as a guaranteed cap on your personal allowance. Each prompt also bounds evidence reads, output size, and stop conditions.

To change a cap, edit the frontmatter, recompile, and commit both files. More frequent triggers mean more potential paid runs, even with the same per-run limit. Actions compute is billed separately. Check current billing and organisation spending policies instead of treating a subscription as unlimited usage. See [gh-aw cost management](https://github.github.com/gh-aw/reference/cost-management/#cap-ai-credits-per-run).

**Into Azure Cost Reviewer differs:** its source configures a
30-minute timeout and sequential agents, with no explicit `max-ai-credits`.
Its stage/research budgets are prompt guidance. The YAML cost policy controls
the comment's modeled Azure cost verdict, **not inference spending**. Review
engine support and inference policies before running it repeatedly.

## How the safety model works

- The agent runs in a sandbox with **read-only GitHub permissions** for analysis. Dependabot Readiness additionally has local workspace editing tools for its configuration-only proposal.
- It cannot write to GitHub directly. It proposes **one** comment, issue, or the configuration-only draft PR described below, and a separate gh-aw job checks and posts it.
- Issues, pull requests, and comments are treated as information, never as instructions.
- Selected repository content is sent to the Copilot service; follow your company's data policy.
- Outputs can be wrong or incomplete. People keep every decision.

Dependabot Readiness may edit a local configuration file, with an enforced PR allowlist restricted to `.github/dependabot.yml` and `.github/dependabot.yaml` and a one-file patch limit. It never upgrades packages or merges its proposal. The repository or organisation must allow Actions to create PRs; Dependabot security features must be enabled separately. Review its prerequisites and the generated configuration before merging. Built-in-token PRs may not trigger CI automatically.

CI Failure Explainer reads the selected run and bounded failure logs but never downloads artifacts, checks out failed-run code, or executes repository code. Its automatic trigger is restricted to failures on this repository's default branch. Preserve these boundaries when adapting it.

Into Azure Cost Reviewer reads trusted contracts from the triggering base SHA,
investigates Bicep evidence at exact base/head revisions, and queries public
pricing/documentation domains. It never deploys or grants GitHub approval.
Its comment-only cost verdict and multi-agent arithmetic require human review;
see its README for assumptions, data boundaries, and setup order.

## Collection maintenance only

Contributors and this collection's CI use **Node.js 24**, gh-aw, and these commands:

```shell
node scripts/blueprints/validate.mjs
node --test scripts/blueprints/blueprints.test.mjs
```

Validation stages the nine standard Markdown sources under `.blueprint-output/` and runs the compiler in strict mode without emitting locks. Into Azure Cost Reviewer is explicitly excluded from compiler staging; offline tests check its source packaging and contract references without compiling it. The offline tests make no inference calls. Adopters do **not** copy these scripts.
