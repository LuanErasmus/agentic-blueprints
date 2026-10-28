# Creating a Blueprint

A blueprint is a reusable implementation of an agentic workflow that solves a specific engineering or business problem. In this repository, runnable workflows are authored as native gh-aw Markdown sources and compiled in the adopting repository.

## What qualifies

A blueprint demonstrates a meaningful workflow loop, such as observing context, reasoning about a goal, choosing a bounded action or recommendation, and evaluating a result. It may show tool selection, iteration, explicit human approval, or a safe recommendation boundary.

A one-off prompt or single model call with no meaningful decision, tool use, evaluation, iteration, or human decision boundary does not qualify on its own. Explain how the implementation demonstrates agentic behaviour, not just what the prompt says.

## Required structure

Create a directory under `blueprints/` containing:

- `README.md` following the [blueprint template](../templates/blueprint-template/README.md).
- `blueprint.yml` with the small metadata schema below.
- Filled-in trigger/input and illustrative output examples, company configuration, and offline decision/evaluation tests. See [running workflows](running-workflows.md) for the reference gh-aw architecture and evidence boundaries.
- Only the workflow, prompt, configuration, and example files needed to run it; avoid empty directories.

The native workflow source belongs in `.github/workflows/<id>.md`, with shared runtime/contract files under `.github/workflows/shared/`. The adopting repository compiles it with `gh aw compile <id>` and commits the generated lock next to the source. This blueprint repository does not contain generated lock files.

The README must explain the problem, agent responsibilities, architecture, prerequisites, setup, how to run it, implementation decisions, guardrails, customisation, and a small challenge. Distinguish deterministic trusted evidence preparation from the sandboxed Copilot agent's analysis; describe the exact tools and safe outputs, and do not imply uncollected data was validated.

## Metadata

Use these fields in `blueprint.yml`:

```yaml
name: Example Blueprint
description: One-sentence summary of the engineering problem and workflow
difficulty: beginner
category: github
patterns:
  - human-in-the-loop
autonomy: recommend
requires:
  - github
```

`difficulty` is `beginner`, `intermediate`, or `advanced`. `patterns` lists relevant pattern slugs. `autonomy` describes the highest level of action the example performs, such as `recommend` or `read-only`. `requires` lists the services or capabilities needed to run it. Keep metadata descriptive and consistent with the implementation; v1.0 does not require a separate validation system.

## Guardrails

Document what the agent can access and do, what it cannot do, which actions require approval, and the permissions and credentials needed. Scope permissions narrowly, prefer read-only access, set bounds on data and steps, and state what information is sent to the Copilot service or retained in run logs/artifacts. Native workflows should use the gh-aw sandbox, declared read tools, and safe outputs rather than broad shell or write access. Never imply that sample mode is offline: it still invokes the native agent. The deterministic unit suite should remain runnable without credentials.

Treat user-controlled content and tool output as untrusted input. Never commit tokens, passwords, connection strings, private keys, or other credentials. Use repository secrets or an appropriate identity federation mechanism.

## Contribution expectations

Make setup reproducible from a clean checkout. Test what can be tested, distinguish verified behavior from assumptions, and explain any external access or limits that prevented testing. Keep examples focused; do not implement roadmap ideas as part of an unrelated change. See [CONTRIBUTING.md](../CONTRIBUTING.md) before opening a pull request.
