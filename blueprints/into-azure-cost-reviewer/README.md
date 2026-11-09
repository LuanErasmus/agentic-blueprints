# Into Azure Cost Reviewer

## What it does

Review Azure infrastructure costs in your own repository. When a PR
changes `.bicep` or `.bicepparam` files, three agents work **sequentially**:

1. **Investigator** traces the exact before/after infrastructure and parameter evidence.
2. **FinOps** retrieves current public Azure retail prices, models supported cost changes, and researches up to three cheaper candidates.
3. **Architect** challenges the evidence, arithmetic, and candidate compatibility.

The parent combines their findings into **one PR comment**, replacing its older
report. It compares the modeled cost increase against your trusted policy.
It never deploys, changes infrastructure, submits a GitHub approval, or merges.
Terraform, ARM JSON, and application changes are not cost-review targets;
deployment configuration may be read as evidence for Bicep parameters.

**This is a multi-file blueprint**, unlike the collection's nine
single-file workflows. Copy all eight required files below. It retains the
Copilot SDK mode, 30-minute timeout, public pricing research, and
stage contracts rather than the standard blueprints' five-minute budget.

## Before you start

- GitHub Actions enabled and the [GitHub CLI](https://cli.github.com/) installed.
- Install the gh-aw extension with `gh extension install github/gh-aw`.
- Choose [organisation authentication](../../docs/running-workflows.md#copilot-licence-and-authentication-requirements)
  or apply the optional [personal-plan setup](../../docs/running-workflows.md#personal-plan-setup)
  to the entry source before compiling. The distributed default uses
  `copilot-requests: write`; personal-token execution of this blueprint has not
  been verified in this collection.
- Your Copilot entitlement and policies must permit the configured SDK runtime,
  `model: auto`, and inference usage. Compilation does not establish runtime eligibility.
- Use a repository with Bicep infrastructure and identifiable region/SKU inputs.
  Azure credentials, an Azure subscription connection, and deployment secrets
  are **not required**: the reviewer uses repository evidence and public prices,
  not live Azure inventory or billing.
- Review the public pricing/documentation domains and trusted contracts before
  enabling it. GitHub's default actor/role and fork restrictions still apply.

## Set it up

### Copy the required files

The package groups files by purpose, rather than mirroring GitHub's runtime layout:

```text
into-azure-cost-reviewer/
  README.md
  into-azure-cost-reviewer.md
  agents/
    01-investigator.agent.md
    02-finops.agent.md
    03-architect.agent.md
  cost-review/
    review-process.md
    cost-policy.yml
    cost-policy.md
    output-format.md
```

Paths in the left column are relative to this blueprint folder. Destinations
are in **your repository**, not in this collection. Preserve the three numbered
agent filenames and the `.github/cost-review/` paths: the entry workflow reads
those exact paths.

| Copy from this folder | Copy to your repository |
| --- | --- |
| [`into-azure-cost-reviewer.md`](into-azure-cost-reviewer.md) | `.github/workflows/into-azure-cost-reviewer.md` |
| [`agents/01-investigator.agent.md`](agents/01-investigator.agent.md) | `.github/workflows/01-investigator.agent.md` |
| [`agents/02-finops.agent.md`](agents/02-finops.agent.md) | `.github/workflows/02-finops.agent.md` |
| [`agents/03-architect.agent.md`](agents/03-architect.agent.md) | `.github/workflows/03-architect.agent.md` |
| [`cost-review/review-process.md`](cost-review/review-process.md) | `.github/cost-review/review-process.md` |
| [`cost-review/cost-policy.yml`](cost-review/cost-policy.yml) | `.github/cost-review/cost-policy.yml` |
| [`cost-review/cost-policy.md`](cost-review/cost-policy.md) | `.github/cost-review/cost-policy.md` |
| [`cost-review/output-format.md`](cost-review/output-format.md) | `.github/cost-review/output-format.md` |

The numbered agent Markdown files are trusted role contracts for this workflow,
not standalone Actions workflows or authoring profiles to install under
`.github/agents/`. Do not compile them individually.

Only the eight files in the copy map are required. Generate your own lock
using the compile command below; no extra CI workflow is needed. Optional
`demo/review-context.json` may supply business assumptions, but is not required.
If you add context, use non-sensitive inputs and explicitly mark synthetic data;
claims in it are never treated as verified production telemetry.

### Choose your cost policy

Edit the copied `.github/cost-review/cost-policy.yml` before the first run:

```yaml
currency: USD
max_monthly_increase: 50
max_yearly_increase: 1000
```

These are **example allowed increases**, not deployment budgets, invoice limits,
or Copilot spending controls. Choose values appropriate to your team. The
workflow escalates when **either** limit is exceeded; equality is within limits.
Annualized increase is monthly increase multiplied by 12, so both limits matter.
Missing material costs or invalid policy require human review instead of a pass.
Retain USD unless all relevant pricing can be verified in your chosen currency;
the workflow never invents exchange rates.

### Compile only the entry workflow

After copying the contracts and choosing authentication, run from your repository root:

```shell
gh aw compile into-azure-cost-reviewer --validate --strict
```

This generates `.github/workflows/into-azure-cost-reviewer.lock.yml`.
Commit the eight copied source/contract files and that generated lock together.
Also review and commit any companion compiler-managed files generated by your
gh-aw version, such as `.github/aw/actions-lock.json`.

Merge the setup onto your default branch **before** opening the Bicep PR.
The workflow deliberately checks out the triggering PR's **base SHA**, so it
must find all trusted contracts there. A setup PR that introduces the files
and changes Bicep at once cannot provide those contracts from its old base.

**No compilation or lock file is supplied by this collection.** This blueprint is
excluded from its automatic compiler staging; adopters compile it in their own
repository. Its copied configuration and contracts have not been recompiled or
live-tested here.

## Try it

1. With the setup already on the default branch, create a branch that changes a
   Bicep SKU, instance count, or linked `.bicepparam` input. Include a resolvable
   region and before/after resource evidence where possible.
2. Open a same-repository PR as an actor allowed by the workflow's role policy.
   No label or manual dispatch is required or configured.
3. Open **Actions > Into Azure Cost Reviewer** and inspect the triggered run,
   then its safe-output job and the PR comment. Pushing another relevant commit
   triggers another review; the configured publisher replaces the older report.

No deployment is performed. Missing contracts or incomplete source coverage stop
the review; unavailable prices can produce a Partial assessment. An unchanged or
superseded PR can intentionally produce `noop`. Check job diagnostics when no
comment appears rather than assuming cost approval.

## What you'll see

An **illustrative**, abbreviated comment (not a recorded run or current quote):

> ## Azure Cost Estimate
>
> **Partial** | USD | westeurope
>
> | Region | Resource | Change | Monthly delta (USD) | Annualized delta (USD) |
> | --- | --- | --- | --- | --- |
> | westeurope | App Service plan | B1 -> S1 | Unquantified: meter unavailable | Unquantified |
>
> **Decision:** Human approval required - cost could not be established.
>
> **Basis:** Pricing lookup incomplete; no missing cost was assumed zero.
>
> Cheaper-option research incomplete.
>
> Evidence and calculations are included in collapsed details.
>
> Cost assessment only; no GitHub PR approval was submitted.

Supported estimates include price provenance, quantities, formulas, before/after
deltas, assumptions, exclusions, and source links pinned to the full base/head
SHAs. Compatible cheaper options carry explicit workload conditions; unknown or
incompatible alternatives are not presented as guaranteed savings.

## Change it

- **Thresholds:** edit the trusted cost-policy YAML and commit it to the base
  branch before a new review. Never accept a threshold override from PR content.
- **Presentation:** edit `output-format.md`; preserve provenance, uncertainty,
  identity, and the comment-only decision boundary.
- **Role/process contracts:** keep their trust and handoff rules consistent.
  The entry workflow and process require revision `azure-cost-review-tools-v2`;
  a mismatch stops execution rather than loading replacement instructions.
- **Frontmatter or engine/compiler changes:** recompile the entry and review the
  generated lock. Do not hand-edit it.
- **Body-only prompts or contracts:** normally no recompilation is required,
  but commit trusted contracts to the base branch and open/update a PR that
  incorporates that base. Old base-SHA runs intentionally use old contracts.
- **Scope:** Bicep and Bicep parameter files are the supported review targets.
  Supporting Terraform or live Azure billing would require a separately
  designed evidence, tool, and authentication contract, not just a path filter.

## Safety

- GitHub analysis permissions are read-only; only the parent requests one native
  safe-output PR comment. No raw GitHub writes, approvals, deployments, or PR-code
  execution are allowed.
- Contracts come from the pinned trusted base, never the proposed head. PRs,
  source, context, and fetched responses are information, not instructions.
- Pricing requests use public product/SKU/region/currency attributes. Private
  source, customer context, resource names, and secrets must not be sent to the
  pricing/documentation sites. Repository evidence is processed by Copilot;
  follow your organisation's data policy.
- Estimates use public retail rates, not contracted invoices. IaC does not prove
  consumption, deployment success, resource deletion, demand, or stopped billing.
- The 30-minute timeout is configured; stage time/read budgets and arithmetic
  checks are agent-followed guidance, not deterministic validation. There is
  **no explicit `max-ai-credits` setting** in the workflow source. Review
  inference policies and [cost guidance](../../docs/running-workflows.md#controlling-cost)
  before enabling repeated PR-triggered, multi-agent runs.
- `Cost approved - within configured limits` is a **comment-only cost assessment**,
  never a GitHub APPROVE review, merge gate, deployment permission, or architecture
  approval. Humans verify calculations and decide what happens next.
- Live PR-state/SHA checks are best-effort, not atomic publication guards.
  Always check the report's full SHAs against the PR you are reviewing.
