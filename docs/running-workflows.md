# Running and adapting the workflows

These nine examples are native [GitHub Agentic Workflows (`gh-aw`)](https://github.github.com/gh-aw/) source files. Each workflow is distributed beside its guide as `blueprints/<slug>/<id>.md`, with common imports in `blueprints/shared/`. The adopting repository installs it into `.github/workflows/` and compiles the corresponding `.lock.yml`. This blueprint repository intentionally does not include generated lock files or executable blueprint workflows under `.github/workflows/`; that directory only contains this collection's validation CI.

## Copilot licence and authentication requirements

These blueprints use **only `permissions: copilot-requests: write`** for Copilot inference, with GitHub Actions' built-in `GITHUB_TOKEN`. No personal access token or model API key is required. This is the **organisation-billed** authentication method, not personal-seat authentication.

- Use an **organisation-owned repository** whose organisation has an active **GitHub Copilot Business or GitHub Copilot Enterprise** subscription. **Copilot Business is the minimum standard organisation plan; Copilot Enterprise is not required.** Eligible enterprises using GitHub's separate **Copilot access** offering should confirm their organisation's inference entitlement and billing with their administrator.
- A personal Copilot Free, Student, Pro, Pro+, or Max plan alone does **not** enable this organisation-billed method in a personal repository. A personal fork of this collection therefore cannot run these blueprints unchanged. Copy them into an eligible organisation repository.
- An administrator must enable **Copilot CLI** and **Allow use of Copilot CLI billed to the organization** under **Organisation settings → Copilot → Policies**. Enterprise policies, permitted models, available AI credits, and spending limits must also allow the run. A licence alone is not sufficient if these controls block inference.
- Keep `copilot-requests: write` in each installed workflow's main frontmatter. It permits inference requests, not repository writes. Inference is billed to the organisation's Copilot tenant; GitHub Actions compute is billed separately. Do not assume a subscription means unlimited or free workflow runs.

Both live runs and `sample: true` dispatch require this Copilot entitlement and policy setup. Reading/copying the blueprints, compiling them, and running the offline helper tests do not invoke Copilot and do not require a Copilot licence. These examples do not document or configure a PAT fallback.

Sources: [GitHub's organisation-token setup](https://docs.github.com/en/copilot/how-tos/github-agentic-workflows/creating-github-agentic-workflows#using-the-built-in-github_token), [gh-aw authentication](https://github.github.com/gh-aw/reference/auth/#copilot-requests-write-permission), [gh-aw billing](https://github.github.com/gh-aw/reference/billing/), and [Copilot plans](https://docs.github.com/en/copilot/get-started/plans). Check current eligibility and policies before enabling runs.

## Install one blueprint

1. Copy your chosen `blueprints/<slug>/<id>.md` to `.github/workflows/<id>.md` in the destination repository. Copy both files from `blueprints/shared/` to `.github/workflows/shared/` so the source's `shared/...` imports resolve. Also copy the complete `scripts/blueprints/` directory and the selected blueprint directory with `config.json` to the same repository-relative locations. Azure Deployment Investigator has no blueprint `config.json`. Keep the installed source, imports, scripts, and config on your trusted default branch. The Markdown source stored beside this README is a distribution template; compile the installed copy, not the file in `blueprints/`.
2. Install the GitHub CLI and gh-aw extension in the destination repository:

   ```shell
   gh extension install github/gh-aw
   gh aw compile <id>
   ```

   Review the generated `.github/workflows/<id>.lock.yml` and commit it together with its Markdown source in your repository. Recompile there whenever you change the workflow source. This repository does not ship or compile lock files.
3. Confirm the [Copilot licence and authentication requirements](#copilot-licence-and-authentication-requirements) above. Each main workflow already declares `copilot-requests: write`; retain it and enable organisation billing. Do not add a PAT secret. The native Copilot engine uses the compiler's default model; change it only if the organisation's subscription and model policies permit it. Compile only after reviewing the chosen configuration.
4. Review the chosen blueprint's event filters, role gate, label configuration, evidence scope, and data handling. When changing a trigger label, keep `config.json`'s `trigger_labels` aligned with frontmatter `on.labels`.
5. In **Actions**, select the compiled workflow and use **Run workflow**. Start with `sample: true` to run a synthetic example; this still uses native Copilot inference and requires its authentication. For live GitHub evidence, use `sample: false` and provide the requested issue or PR number. Azure live mode additionally needs the Azure identity setup described in its blueprint.

The sample flag never means the live repository evidence is used. Conversely, an example report in this repository is illustrative, not a workflow result.

## Trigger reference

| Workflow | Automatic trigger | Default label | Manual live input |
|---|---|---|---|
| Issue Triage | Issue opened/reopened or labelled; exact `triage-review` label required | `triage-review` | Issue number |
| PR Review | PR opened/reopened/synchronize/ready-for-review or labelled; exact `review-preparation` label required | `review-preparation` | PR number |
| Requirements Gaps | Issue labelled | `requirements-review` | Issue number |
| Test Scenarios | Issue or PR labelled | `test-planning` / `test-review` | Issue or PR number |
| Delivery Risk | Issue labelled | `delivery-risk-review` | Issue number |
| Release Readiness | Issue labelled | `release-readiness` | Issue number |
| PR Confidence | PR labelled | `confidence-review` | PR number |
| Stakeholder Notes | Issue labelled | `stakeholder-notes` | Issue number; optional base/head refs |
| Azure Investigation | Manual only | None | Resource group and deployment name |

The gh-aw role gate allows only `admin`, `maintainer`, `write`, or `triage` roles by default; configure it only for roles your organisation intends to trust. gh-aw blocks automatic fork runs, drafts are skipped where applicable, and workflows use `pull_request`, not `pull_request_target`. They check out trusted default-branch workflow code without checking out or executing PR head code. Manual dispatch selects the default branch. The evidence helper also checks the configured exact label. Create the required labels before relying on label triggers.

## Evidence and reports

Preparation is deterministic and trusted: `node scripts/blueprints/evidence.mjs <slug>` gathers bounded evidence before the native Copilot agent runs. It collects relevant linked items, test sources/reports, checks, and review context as configured. Source text is capped at 6,000 characters per source and 18,000 characters total; `max_items` is 1–50. The agent can read this JSON and use read-only GitHub tools through `gh-proxy` when useful. It does not execute tests, PR code, or model-selected diagnostics.

The Azure helper is an exception to the GitHub evidence path. It reads a deployment, at most 20 operations, and fixed resource/activity diagnostics using bounded Azure CLI commands, then logs out before the Copilot agent starts. The agent only reasons over the evidence already collected; it has no Azure CLI access or Azure credentials.

The agent produces an assessment through the narrow reporting interface. `node scripts/blueprints/report.mjs <slug> '<JSON assessment>'` validates citations and response structure, renders the Markdown/JSON report, and deterministically calculates the PR Confidence score. It is not a second model runner. A genuinely out-of-scope request can produce `noop` and does not create a tracker issue. `report_incomplete` is for a blocked assessment when tools or required evidence are unavailable; it avoids fabricated conclusions.

Reports are uploaded as run artifacts with paths restricted to `/tmp/gh-aw/blueprints/*/report.md` and `report.json`, a maximum of two files, and seven-day retention. Read the report artifact for the full result; the native run summary and logs do not promise to reproduce the complete report. Safe outputs explicitly disable automatic issue creation, failure-reporting issues, and noop-tracker issues. No workflow automatically comments, labels, assigns, creates issues, submits reviews, merges, deploys, emails, or publishes a release.

Every README links a filled-in input and illustrative output. Use them as starting points for issue forms, PR templates, or company process docs. Same-repository links are evidence references; external URLs are not fetched. Preserve machine-readable input syntax documented by the selected blueprint, including the exact 40-character candidate SHA for readiness and paired `From:` / `To:` refs for stakeholder notes. Release ranges resolve to immutable commits, reject reversed or divergent ranges, and identical endpoints yield `noop`.

Guidance is read from the trusted default branch or PR base as configured. Reports identify source references, but source snapshots are supplied evidence, not independent attestation. Test reports are claims from the supplied snapshot, not proof that tests ran. Additional findings from native GitHub tools must not be presented as part of PR Confidence's scored evidence unless the helper collected and validated them.

## Azure identity

Configure an Azure OIDC identity with Reader access scoped to the specific resource group, and repository variables `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID`. Do not use a client secret or grant write roles. The workflow gathers deployment status, a bounded operation list, and fixed diagnostics before inference; no model-selected diagnostic command runs. See the Azure blueprint for its exact sample/live inputs and trust boundaries.

## Offline validation

Install Node.js 24 and run the deterministic helper tests from the repository root:

```shell
node --test scripts/blueprints/blueprints.test.mjs
```

These tests require no GitHub, Copilot, or Azure credentials and make no live model calls. Synthetic dispatch through gh-aw is different: it still invokes the native Copilot agent and therefore needs valid inference authentication.

This repository's source validation command is `node scripts/blueprints/validate.mjs`. It stages the nine sources and their imports in a temporary directory under `.blueprint-output/`, runs `gh aw compile --dir <staging-directory> --no-emit --strict --validate --no-check-update`, and removes the staged files afterwards. It does not emit lock files, invoke Copilot, or approve safe-update changes. In an adopting repository, use `gh aw compile <id>` on the installed `.github/workflows/<id>.md` to generate the lock you will review and commit there. If the compiler proposes safe updates, inspect each change rather than blindly bypassing or accepting it.

## Permissions, output, and limitations

The GitHub workflows use narrow read-only GitHub access for their evidence, gh-aw's read-only `gh-proxy` tools (`gh issue view` and `gh pr view`), and Copilot inference authentication. Bash is limited to reading prepared files with `cat` and invoking the fixed report helper; it is not general shell access. The agent runs in the gh-aw sandbox with only the declared tools; GitHub writes are not enabled. The trusted evidence and report scripts perform bounded deterministic preparation and validation. Azure uses OIDC only in its collection step and logs out before inference.

Evidence may be incomplete because of permissions, unavailable tools, truncation, item caps, unsupported source types, or the absence of a required input. Treat reports as advisory, verify citations and conclusions, and make all operational or business decisions yourself. Selected source content is sent to the Copilot service; follow your organisation's data policy. Only the two report files are uploaded, but native run logs and summaries remain subject to GitHub's retention and access controls.
