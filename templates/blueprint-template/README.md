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

- [List accounts, permissions, tools, and services needed.]

## Setup

1. Copy the native workflow Markdown source, shared runtime/contract files, required scripts, and this blueprint's config into the adopter repository.
2. Install gh-aw and run `gh aw compile <id>` there. Review and commit the generated lock next to its source; do not add generated lock files to this blueprint repository.
3. Configure Copilot authentication as described in the [official gh-aw guide](https://github.github.com/gh-aw/reference/auth/). Put `copilot-requests: write` explicitly in the main workflow's frontmatter for organisation-backed billing. For the documented PAT fallback, remove that permission from the main workflow, set `COPILOT_GITHUB_TOKEN` with a fine-grained token granting Copilot Requests: Read, and recompile.

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
