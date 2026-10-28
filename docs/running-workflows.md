# Running and adapting the workflows

## What runs where

Eight GitHub blueprints use a small reusable Actions workflow and dependency-free Node.js scripts. Azure has a separate workflow with the same plan → constrained follow-up → evaluation → validated report stages. There is no agent framework, database, or required company project-management product.

The released `actions/ai-inference@v1` uses **GitHub Models**, not the Copilot CLI. These workflows request `models: read` and use the short-lived `GITHUB_TOKEN`. They do not require `COPILOT_PAT`, an Azure client secret, or a separately stored model API key. GitHub Models access, organisation policy, rate limits, and the selected model's availability still apply. The model receives text only; GitHub MCP/model tools are not enabled.

The default model is the action's `openai/gpt-4o`. Set the repository Actions variable `BLUEPRINT_MODEL` to an available, company-approved GitHub Models model ID to override it. The selected model must support the supplied prompts, JSON response contract, and token budget; unavailable models fail the run rather than falling back silently.

## Install one blueprint

1. Fork this repository, or copy your selected blueprint directory, `scripts/blueprints/`, its entry workflow, and `.github/workflows/blueprint-runner.yml` into your repository. Azure does not need the reusable runner workflow.
2. Put those files on your trusted default branch. The workflow deliberately checks out that branch with persisted credentials disabled, not the PR head. A manual run on a different branch still reads the default branch's code/config; merge your intended configuration before running it.
3. Enable Actions, allow the referenced actions under your organisation's policy, and confirm GitHub Models is available. If model access is denied, the run fails visibly; no analysis is fabricated.
4. Review the chosen blueprint's setup and data-handling rules. Configure `blueprints/<name>/config.json` for your company. Azure has specific identity setup instead.
5. In **Actions**, select the named workflow, choose **Run workflow**, and leave **sample** enabled for the first run. This uses synthetic evidence but still makes model calls.
6. Inspect the summary and download the report artifact. For live GitHub runs, clear **sample** and supply an issue/PR number. Azure instead takes a resource group and deployment name.

Do not copy an illustrative report and treat it as an actual workflow result.

## Trigger reference

| Workflow | Automatic trigger | Default label | Manual live input |
|---|---|---|---|
| Issue Triage | Issue opened/reopened or labelled | `triage-review` | Issue number |
| PR Review | PR opened/reopened/updated/ready or labelled | `review-preparation` | PR number |
| Requirements Gaps | Issue labelled | `requirements-review` | Issue number |
| Test Scenarios | Issue or PR labelled | `test-planning` / `test-review` | Issue or PR number |
| Delivery Risk | Issue labelled | `delivery-risk-review` | Tracking issue number |
| Release Readiness | Issue labelled | `release-readiness` | Release issue number |
| PR Confidence | PR labelled | `confidence-review` | PR number |
| Stakeholder Notes | Issue labelled | `stakeholder-notes` | Release issue number; optional base/head refs |
| Azure Investigation | None | None | Resource group and deployment name |

Create your chosen labels first. Label events are filtered against `trigger_labels` in config; changing the config requires no workflow edit. Labelled workflows do not automatically rerun on later edits: remove/reapply the label or run manually. Draft and fork PR events are skipped. A maintainer can manually analyse a fork PR through API reads; contributor code is never executed by these analysis workflows.

## Company configuration and input formats

```json
{
  "trigger_labels": ["requirements-review"],
  "guidance_paths": ["CONTRIBUTING.md", "docs/company-readiness.md"],
  "max_items": 20,
  "test_paths": [],
  "test_report_paths": []
}
```

The first three fields are required for GitHub blueprints. `max_items` is 1–50. Test fields are optional exact repository file paths, not glob patterns or arbitrary URLs. Guidance comes from the PR base or the repository default branch. Company policies can be placed there; do not assume one company's status names, release checks, deadlines, or approval model.

Each README links filled-in `examples/input.md` and `examples/output.md`. Copy the headings into a GitHub issue form or PR template, or change them to your terminology. Most headings are interpreted by the model, not parsed as a rigid form. These machine-readable exceptions must be preserved:

- Same-repository links: `#123`. External links are references only and are not fetched. Put relevant external policy/evidence in an approved repository file or supply a sanitised excerpt.
- Release readiness candidate: `Candidate: <exact 40-character commit SHA>` on its own line. Without it, current candidate checks are unavailable.
- Stakeholder notes range: `From: <tag or SHA>` and `To: <tag or SHA>` on their own lines, or manual `base_ref` / `head_ref` fields. The collector resolves immutable commits and rejects reversed/divergent ranges.

The synthetic starting point is `scripts/blueprints/samples.mjs`; it is not a claim about a real company. Requirements-only Test Scenario Planner does not require code. PR mode additionally reads available patches and selected test evidence.

## Test evidence and confidence scoring

Test inspection reads changed test-like files and configured `test_paths`; it does not search the whole codebase or run tests. Candidate-specific GitHub check/status metadata is separate evidence. External test tools and binary coverage artifacts are not automatically parsed.

For a supplied scenario report, use a configured `test_report_paths` file containing JSON:

```json
{
  "sha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "conclusion": "success",
  "scenarios": [
    { "name": "Cancellation after dispatch is rejected", "result": "passed" }
  ]
}
```

Publish or provide an approved report matching the actual candidate. Test source is read at the candidate, but report snapshots are read from the trusted default branch so a post-execution report can refer to an existing candidate SHA without a self-referential commit. For example, your existing CI can publish a reviewed, sanitised report snapshot there after testing a PR head. A repository report is supplied evidence, not independent attestation; an old or fabricated candidate SHA must never be used to imply current execution. A direct CI artifact-store adapter is a future extension, not built in.

PR Confidence has configurable positive weights for `scope`, `execution`, `scenarios`, and `review`, and `minimum_evidence_dimensions` (1–4). Unknown evidence retains its weight in the denominator rather than inflating known scores. Below the minimum, the overall score is withheld. Generic green CI does not establish scenario execution, and an old report cannot establish current execution. No score proves that code is bug-free or grants approval.

A current cited scenario report with failures contributes zero execution assurance rather than being mistaken for missing evidence. Entirely skipped reports cannot establish execution. The computed score, completeness, and unknown dimensions are included in `report.json` as well as the human-readable summary.

## Offline validation without model or production credentials

Install Node.js 24 and run from the repository root:

```powershell
node --test scripts\blueprints\blueprints.test.mjs
```

This executes all nine sample decision/report paths with deterministic model-response fixtures and mocked API errors. It does **not** evaluate real model quality or exercise live Azure/GitHub credentials.

To inspect initial sample evidence and prompts:

```powershell
node scripts\blueprints\run.mjs prepare requirements-gap-investigator --sample
node scripts\blueprints\azure.mjs prepare --sample
```

Local output goes into ignored `.blueprint-output`. To replay a model response, set `MODEL_RESPONSE_FILE` to a JSON response file and invoke `followup`, then replace it with a final report response and invoke `report`. The required response contracts are in `scripts/blueprints/tasks.mjs`. CI runs the same offline suite in `validate-blueprints.yml`.

## Permissions, output, and limitations

The shared runner uses the union of read permissions needed across the eight GitHub examples, plus model inference. This is read-only, not a promise of per-blueprint minimal token scopes. There are no automatic comments, labels, assignments, review submissions, emails, release publications, or deployments. GitHub remains the authority for native checks and approvals.

At most one model-selected follow-up executes. GitHub source data is capped at 6,000 characters per source and an approximately 18,000-character total data budget, with metadata/limitations outside that budget. Request bodies, patches, or discussion can therefore be incomplete. Item limits also apply; truncation and unavailable evidence appear in limitations. The report validator checks structure, allowed decisions/labels, and source IDs, not semantic truth. Humans must verify conclusions and decisions.

Only the advisory Markdown/JSON report is uploaded for seven days, not the full evidence bundle. Selected source content is sent to GitHub Models. Model output may reproduce sensitive input; use only approved data and treat summaries/artifacts according to your repository visibility policy.

Useful future extensions are dedicated read-only adapters for your project system, CI artifact store, or document repository. Map them into the same evidence shape and freshness checks; do not grant the model arbitrary browsing, shell access, or write authority.
