# Creating a Blueprint

A blueprint is a reusable implementation of an agentic workflow that solves a specific engineering or business problem. In this repository, runnable workflows are authored as native gh-aw Markdown sources and compiled in the adopting repository.

## What qualifies

A blueprint demonstrates a meaningful workflow loop, such as observing context, reasoning about a goal, choosing a bounded action or recommendation, and evaluating a result. It may show tool selection, iteration, explicit human approval, or a safe recommendation boundary.

A one-off prompt or single model call with no meaningful decision, tool use, evaluation, iteration, or human decision boundary does not qualify on its own. Explain how the implementation demonstrates agentic behaviour, not just what the prompt says.

## Required structure

Create a directory under `blueprints/` containing:

- `README.md` following the [blueprint template](../templates/blueprint-template/README.md).
- One self-contained native workflow Markdown file and filled-in illustrative input/output examples. Put company customisation in the workflow itself. See [running workflows](running-workflows.md) for evidence boundaries.
- Only the documentation, workflow, and examples needed to explain it; avoid empty directories and runtime dependencies.

Distribute one native workflow source in `blueprints/<slug>/<id>.md`, beside its README and examples. Adopters copy only that source to `.github/workflows/<id>.md`, customise labels/instructions directly, compile with `gh aw compile <id>`, and review and commit source plus generated lock in their repository. Do not require shared imports, JavaScript runtime helpers, JSON configuration, custom report schemas, or sample dispatch. This collection distributes no locks. Contributors use Node.js 24 with `node scripts/blueprints/validate.mjs` and `node --test scripts/blueprints/blueprints.test.mjs`; validation stages standalone sources and runs the compiler without emitting locks. These scripts stay in the collection, not the adopting repository.

Use the native Copilot engine with `permissions: copilot-requests: write` in the main workflow. Document the required organisation-owned repository, Copilot Business or Enterprise entitlement, and organisation billing policies in every blueprint's prerequisites; link the [shared licence/authentication requirements](running-workflows.md#copilot-licence-and-authentication-requirements). Do not introduce PAT setup instructions or suggest a personal Copilot plan alone enables this method.

Keep the template's ten README section headings and make Setup three or four short steps after one-time prerequisites. Explain native read-only evidence inspection, advisory Markdown reporting, and human decisions. Azure's trusted inline collection happens before inference; distinguish it from the agent's interpretation. Never imply uncollected evidence, citations, or AI output were machine-validated.

## Guardrails

Document access, forbidden actions, human authority, permissions, and data handling. GitHub evidence tools use the native read-only proxy, with no checkout or PR code execution; linked-item exploration is limited to 10 explicit same-repository issues/PRs. Report inaccessible/truncated evidence and tooling errors rather than treating failed reads as absence or success. Do not impose hard source-byte budgets. The native edit tool writes only `report.md` in the empty workspace; safe-output upload allowlists that one report for seven days. No automatic comments, labels, merges, releases, or other GitHub changes are allowed.

Require manual `number` input and default-branch dispatch; skip drafts and block automatic fork events. Preserve the role gate. Use illustrative examples rather than synthetic dispatch. Keep maintenance tests credential-free and distinguish static checks from live integration verification. Any confidence index must be described as AI-assessed and advisory, not deterministic or calibrated; follow the [confidence policy](running-workflows.md#pr-confidence-is-an-advisory-index).

Treat user-controlled content and tool output as untrusted input. Never commit tokens, passwords, connection strings, private keys, or other credentials. Use repository secrets or an appropriate identity federation mechanism.

## Contribution expectations

Make setup reproducible from a clean checkout. Test what can be tested, distinguish verified behavior from assumptions, and explain any external access or limits that prevented testing. Keep examples focused; do not implement roadmap ideas as part of an unrelated change. See [CONTRIBUTING.md](../CONTRIBUTING.md) before opening a pull request.
