# Creating a Blueprint

A blueprint is a reusable implementation of an agentic workflow that solves a specific engineering problem. It should be useful to a developer who has not seen a talk or demonstration about it.

## What qualifies

A blueprint demonstrates a meaningful workflow loop, such as observing context, reasoning about a goal, choosing a bounded action or recommendation, and evaluating a result. It may show tool selection, iteration, explicit human approval, or a safe recommendation boundary.

A one-off prompt or single model call with no meaningful decision, tool use, evaluation, iteration, or human decision boundary does not qualify on its own. Explain how the implementation demonstrates agentic behaviour, not just what the prompt says.

## Required structure

Create a directory under `blueprints/` containing:

- `README.md` following the [blueprint template](../templates/blueprint-template/README.md).
- `blueprint.yml` with the small metadata schema below.
- Only the workflow, prompt, configuration, and example files needed to run it; avoid empty directories.

The README must explain the problem, agent responsibilities, architecture, prerequisites, setup, how to run it, implementation decisions, guardrails, customisation, and a small challenge.

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

Document what the agent can access and do, what it cannot do, which actions require approval, and the permissions and credentials needed. Scope permissions narrowly, prefer read-only access, set bounds on data and steps, and state what information is sent to a model or retained in logs.

Treat user-controlled content and tool output as untrusted input. Never commit tokens, passwords, connection strings, private keys, or other credentials. Use repository secrets or an appropriate identity federation mechanism.

## Contribution expectations

Make setup reproducible from a clean checkout. Test what can be tested, distinguish verified behavior from assumptions, and explain any external access or limits that prevented testing. Keep examples focused; do not implement roadmap ideas as part of an unrelated change. See [CONTRIBUTING.md](../CONTRIBUTING.md) before opening a pull request.
