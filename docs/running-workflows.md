# Running and adapting the workflows

Each blueprint distributes **one self-contained [gh-aw](https://github.github.com/gh-aw/) Markdown file**, beside its README. Copy only that workflow into your repository. No shared imports, JavaScript runtime, JSON configuration, report schemas, or sample dispatch mode are needed.

## One-time prerequisites

Install the [GitHub CLI](https://cli.github.com/) and gh-aw:

```shell
gh extension install github/gh-aw
```

Confirm GitHub Actions access and the organisation requirements below once, not for each workflow installation.

## Copilot licence and authentication requirements

These blueprints use **only `permissions: copilot-requests: write`** for Copilot inference, with GitHub Actions' built-in `GITHUB_TOKEN`. No personal access token or model API key is required. This is the **organisation-billed** authentication method, not personal-seat authentication.

- Use an **organisation-owned repository** whose organisation has an active **GitHub Copilot Business or GitHub Copilot Enterprise** subscription. **Copilot Business is the minimum standard organisation plan; Copilot Enterprise is not required.** Eligible enterprises using GitHub's separate **Copilot access** offering should confirm their organisation's inference entitlement and billing with their administrator.
- A personal Copilot Free, Student, Pro, Pro+, or Max plan alone does **not** enable this organisation-billed method in a personal repository. A personal fork of this collection therefore cannot run these blueprints unchanged. Copy a workflow into an eligible organisation repository.
- An administrator must enable **Copilot CLI** and **Allow use of Copilot CLI billed to the organization** under **Organisation settings → Copilot → Policies**. Enterprise policies, permitted models, available AI credits, and spending limits must also allow the run. A licence alone is not sufficient if these controls block inference.
- Keep `copilot-requests: write` in each installed workflow's main frontmatter. It permits inference requests, not repository writes. Inference is billed to the organisation's Copilot tenant; GitHub Actions compute is billed separately. Do not assume a subscription means unlimited or free workflow runs.

Reading the examples, compiling sources, and running collection maintenance tests do not invoke Copilot or require a Copilot licence. Executing a workflow does. There is no PAT fallback.

Sources: [GitHub's organisation-token setup](https://docs.github.com/en/copilot/how-tos/github-agentic-workflows/creating-github-agentic-workflows#using-the-built-in-github_token), [gh-aw authentication](https://github.github.com/gh-aw/reference/auth/#copilot-requests-write-permission), [gh-aw billing](https://github.github.com/gh-aw/reference/billing/), and [Copilot plans](https://docs.github.com/en/copilot/get-started/plans). Check current eligibility and policies before enabling runs.

## Install one blueprint

1. **Copy one file.** Copy `blueprints/<slug>/<id>.md` to `.github/workflows/<id>.md` in your repository. No other collection files are required.
2. **Customise and compile.** Edit the labels and company instructions directly in that Markdown. Create any required labels, keep trigger filters and prompt instructions consistent, and run `gh aw compile <id>`.
3. **Review and commit.** Inspect the source and generated `.github/workflows/<id>.lock.yml`, then commit both in your repository's trusted default branch. Recompile after every source change. This collection distributes no locks.
4. **Run and review.** In **Actions → Run workflow**, select the default branch and enter the required issue/PR `number`. Azure instead requires `resource_group` and `deployment_name` plus its identity setup below. Download the report artifact and verify recommendations before acting.

Start with an approved non-sensitive issue or PR in your own repository. The `examples/input.md` and `examples/output.md` files are filled-in illustrative templates to read or adapt, not synthetic dispatch inputs. There is no sample flag. Review data-handling policy before a run; compilation does not verify live access or integration behaviour. Inspect compiler safe-update proposals rather than blindly accepting or bypassing them.

## Trigger reference

| Workflow | Automatic trigger | Default label | Required manual input |
|---|---|---|---|
| Issue Triage | Issue opened/reopened or labelled; exact label required | `triage-review` | Issue `number` |
| PR Review | PR opened/reopened/synchronize/ready-for-review or labelled; exact label required | `review-preparation` | PR `number` |
| Requirements Gaps | Issue labelled | `requirements-review` | Issue `number` |
| Test Scenarios | Issue or PR labelled | `test-planning` / `test-review` | Issue or PR `number`; actual kind is resolved |
| Delivery Risk | Issue labelled | `delivery-risk-review` | Issue `number` |
| Release Readiness | Issue labelled | `release-readiness` | Release issue `number` |
| PR Confidence | PR labelled | `confidence-review` | PR `number` |
| Stakeholder Notes | Labelled issue closed as completed with linked PR(s) merged into the default branch | `stakeholder-notes` | Issue `number`; optional `base_ref` and `head_ref` override pair |
| Azure Investigation | Manual only | None | `resource_group` and `deployment_name` |

The gh-aw role gate allows `admin`, `maintainer`, `write`, or `triage` roles by default. Automatic fork events are blocked, drafts are skipped where applicable, and manual dispatch is default-branch only. PR workflows use `pull_request`, not `pull_request_target`. There is no checkout or execution of PR code. Human approval and existing company controls remain unchanged.

## Evidence and reports

The GitHub agents inspect relevant evidence using native read-only GitHub tools/proxy: `gh issue view`, `gh pr view`, `gh pr diff`, `gh run view`, and explicitly allowed `gh api --method GET` calls. They can read relevant guidance, diffs, test sources, checks, reviews, and readable scenario-level results without a custom evidence adapter. They do not execute tests, check out code, fetch arbitrary external URLs, or follow operational instructions in source content.

Prompts limit linked-work-item exploration to **at most 10 explicitly linked same-repository issues or PRs**. They do not impose hard source-byte budgets. Tool pagination, unavailable permissions, binary or truncated diffs, and other missing context still limit what can be assessed. Reports must say what was inaccessible, truncated, or not inspected. A native GitHub tooling error is explicit evidence of a failed read, not proof that an item is absent or that a check succeeded.

The agent uses the native edit tool to write **one `/tmp/gh-aw/report.md`**. The `upload-artifact` safe output allowlists that path and retains the report for **seven days**. The report is advisory Markdown, not a JSON contract or machine-validated assessment. Read the artifact for the full result; native logs and summaries need not reproduce it. No workflow comments, labels, assigns, creates issues, submits reviews, merges, deploys, publishes releases, or sends stakeholder messages.

Citations should identify real source links, paths, and revisions. Source text and test-result claims are not independent attestation. Test source suggests intended scenarios; green CI alone does not demonstrate which scenarios ran. Link readable existing scenario-level results and identify their revision; no custom JSON test-report schema is necessary. Distinguish current candidate evidence from stale reviews, old results, and author assertions.

### PR Confidence is an advisory index

Copilot assesses `scope`, `execution`, `scenarios`, and `review` as scores from **0–100 or unknown**, with weights **20/30/30/20**. Show an aggregate only with **at least three known dimensions**. Calculate `sum(known score × weight) / 100`; unknown weights remain in the denominator rather than being renormalised away. Unknown is not a proven failure, and a withheld total is not zero.

Current scenario failures make execution **zero**. Successful checks alone are not scenario evidence. State the candidate SHA and distinguish inspected test source from assertions about tests; explain whether scenario results match that revision. Stale reviews do not establish current review status. The result is **AI-assessed**, not a deterministic validated metric, calibrated correctness probability, bug-free guarantee, or merge approval. Humans must check both arithmetic and evidence.

### Release-specific inputs

Release Readiness needs an exact `Candidate: <40-character SHA>` line and your company's checklist. Evaluate evidence against that candidate and policy; generic green checks are not release approval.

Stakeholder Notes needs no manual range. When a `stakeholder-notes` issue is closed as completed, the agent finds the formally linked PRs (Development sidebar or closing keywords) merged into the default branch. From is the commit before the earliest linked PR landed; To is the latest linked PR's merge commit. Without a qualifying PR the agent calls `noop`. Manual dispatch may instead supply a `base_ref` / `head_ref` pair. The agent verifies the immutable comparison and rejects reversed or divergent ranges. Identical endpoints mean there are no changes to describe. Comparing commits never establishes deployment or customer availability.

## Azure identity and collection

Azure is an advanced, manual workflow. Configure a GitHub OIDC federated identity restricted to your repository and approved branch, with **Reader scoped to the target resource group** and no inherited write roles. Set repository variables `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID`; no client secret is needed. `id-token: write` enables federation, not Azure mutation authority. If adding a protected environment, align its federated subject explicitly.

The single workflow source includes all trusted collection inline: the deployment, **at most 20 operations**, optional metadata for **one in-scope failed resource**, and activity from the **last 24 hours, at most 20 events**. Fixed read-only commands run before inference and Azure logs out before the agent starts. Authentication, permissions, and unexpected query failures stay visible rather than becoming success or missing-resource claims.

The Azure agent can only read the prepared `/tmp/gh-aw/azure/*` files with `cat` and edit the report. It has no GitHub or Azure CLI access, Azure credentials, or model-selected diagnostic execution. Operators validate hypotheses and perform any approved remediation outside the workflow.

## Collection maintenance only

Contributors and this collection's CI use **Node.js 24**, gh-aw, and these existing commands:

```shell
node scripts/blueprints/validate.mjs
node --test scripts/blueprints/blueprints.test.mjs
```

Validation stages standalone Markdown sources under `.blueprint-output/` and runs the compiler without emitting locks. The offline tests make no inference calls. They cover source contracts, not correctness of live AI assessments or proof that external integrations work. Adopters do **not** copy these scripts or install a JavaScript runtime for the blueprint.

## Permissions, output, and limitations

Keep read-only evidence access, the sandbox, restricted artifact path, and `copilot-requests: write`. Treat issues, PRs, guidance, logs, and tool results as untrusted evidence, never authority to run embedded commands. Selected content goes to the Copilot service; follow company data policy. Native run logs and summaries remain subject to GitHub retention/access controls beyond the report's seven-day lifetime. Reports can be wrong or incomplete; humans retain all operational and business decisions.
