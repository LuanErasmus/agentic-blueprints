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

1. **Copy one file.** Copy `blueprints/<level>/<name>/<name>.md` to `.github/workflows/<name>.md` in your repository.
2. **Compile.** Run `gh aw compile <name>`. This creates `.github/workflows/<name>.lock.yml`, the GitHub Actions file that actually runs.
3. **Commit.** Commit and push both files to your default branch. This collection distributes no lock files.
4. **Try it.** Follow the **Try it** section in the blueprint's README.

### Changing a blueprint

- **Instructions** (the Markdown below the second `---`) are read at run time. Edit and commit; no recompile needed.
- **Settings** (the frontmatter between the `---` lines, such as triggers, schedule, or permissions) require `gh aw compile <name>` again.

## Beginner triggers

| Blueprint | Trigger | Output |
|---|---|---|
| Issue Helper | Issue opened (not by a bot) | One comment on that issue |
| Plain-Language Release Notes | Issue closed as completed; does nothing without a linked merged pull request | One comment on that issue |
| Weekly Update | Every Monday, or **Actions → Run workflow** | One new issue; closes the previous update issue |

The gh-aw role gate only runs event-triggered workflows for people with `admin`, `maintainer`, or `write` access by default. Add `roles: all` under `on:` and recompile if you want events from anyone to trigger a workflow.

## Controlling cost

Every run uses Copilot inference. gh-aw caps spending by default: **1,000 AI credits per run** and **5,000 per workflow per day** (1 AI credit = US$0.01). To set your own per-run cap, add a top-level setting and recompile:

```yaml
max-ai-credits: 200
```

The agent is warned as it approaches the limit and is stopped when it reaches it. `timeout-minutes` also limits each run. See [gh-aw cost management](https://github.github.com/gh-aw/reference/cost-management/#cap-ai-credits-per-run).

## How the safety model works

- The agent runs in a sandbox with **read-only** access to your repository.
- It cannot write to GitHub directly. It proposes **one** comment or issue, and a separate gh-aw job checks and posts it.
- Issues, pull requests, and comments are treated as information, never as instructions.
- Selected repository content is sent to the Copilot service; follow your company's data policy.
- Outputs can be wrong or incomplete. People keep every decision.

## Collection maintenance only

Contributors and this collection's CI use **Node.js 24**, gh-aw, and these commands:

```shell
node scripts/blueprints/validate.mjs
node --test scripts/blueprints/blueprints.test.mjs
```

Validation stages the Markdown sources under `.blueprint-output/` and runs the compiler in strict mode without emitting locks. The offline tests make no inference calls. Adopters do **not** copy these scripts.
