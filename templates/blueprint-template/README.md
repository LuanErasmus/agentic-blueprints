# [Blueprint Name]

**Difficulty:** [beginner / intermediate / advanced]

Create a `blueprint.yml` alongside this README. Start from the metadata example in [`blueprint.yml`](blueprint.yml) and update every value to match your implementation.

## Problem

[Describe the real-world problem this blueprint addresses and who encounters it.]

## What the Agent Does

[Describe the agent's responsibilities, inputs, outputs, and actions it can take.]

## Architecture

```text
[GitHub event or manual dispatch]
        ↓
[Trusted bounded evidence preparation]
        ↓
[Sandboxed Copilot analysis with declared read tools]
        ↓
[Deterministic report validation + restricted artifact]
        ↓
[Human decision]
```

## Prerequisites

- An organisation-owned repository with Copilot Business (minimum standard organisation plan) or Copilot Enterprise, and organisation-billed Copilot CLI enabled. See [licence and policy requirements](../../docs/running-workflows.md#copilot-licence-and-authentication-requirements), including the separate offering for eligible enterprises. A personal Copilot plan alone is not sufficient for this authentication method.
- [List accounts, permissions, tools, and services needed.]

## Setup

1. Distribute the native workflow source beside this README. Adopters copy it to `.github/workflows/<id>.md`, files from `blueprints/shared/` to `.github/workflows/shared/`, and required scripts/config to their documented repository-relative paths.
2. Install gh-aw and run `gh aw compile <id>` there. Review and commit the generated lock next to its source; do not add generated lock files to this blueprint repository.
3. Retain `copilot-requests: write` in the main workflow's frontmatter and have the organisation administrator enable Copilot CLI and organisation billing. Authentication uses the built-in Actions token; do not configure a PAT. Follow the [shared authentication requirements](../../docs/running-workflows.md#copilot-licence-and-authentication-requirements). Both live and synthetic dispatch require Copilot access; source compilation and offline tests do not.

## Run It

[Give exact steps for sample and live mode, trigger events, labels, and rerunning after edits. Include filled-in examples/input.md and illustrative examples/output.md. Distinguish required user input from automatically collected evidence. Explain how companies can turn the example into a template.]

## How It Works

[Explain deterministic evidence preparation, what the sandboxed Copilot agent may read, the deterministic report helper, source provenance, freshness checks, bounds, and limitations. Explain that sample dispatch still invokes inference and offline tests do not. Do not imply the agent can execute PR code or that supplied snapshots are independently attested.]

## Guardrails

- **Access:** [What information and services can the agent access?]
- **Actions:** [What can it do?]
- **Cannot do:** [What is outside its permissions or scope?]
- **Approval:** [What requires human approval?]
- **Never automatic:** [What must it never do automatically?]
- **Credentials:** [What credentials or permissions are required, and how are they stored?]
- **Data handling:** [What information is sent to Copilot or retained in run logs/artifacts? State artifact restrictions and retention.]

## Customise It

[Explain how to adapt the example without weakening its safety boundaries.]

## Challenge

[Give the reader one small, safe extension to try.]
