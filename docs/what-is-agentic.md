# What Is Agentic?

The word *agentic* is useful when a workflow does more than run a fixed sequence or generate a one-off response. A practical agentic workflow observes context, reasons about a goal, chooses a bounded next step, and checks what happened.

## Traditional automation

Traditional automation follows steps defined in advance:

```text
Trigger → Fixed rules → Fixed action
```

For example, when a file is added, a workflow can run a linter and fail if the linter reports errors. The same conditions lead to the same steps; the workflow does not decide what to investigate next.

## AI-assisted workflows

An AI-assisted workflow uses a model for one or more tasks, such as summarising text, classifying a request, or drafting a response:

```text
Input → Model response → Human or fixed workflow decides what follows
```

This can be useful, but a single model call that returns text is not by itself a complete agentic blueprint. The model may not select a tool, change the next step based on evidence, or evaluate an outcome.

## Agentic workflows

An agentic workflow combines model reasoning with bounded tools and decision points:

```text
Observe → Reason → Decide → Act or recommend → Evaluate → Continue or stop
```

For example, an investigation agent might inspect a failed CI run, choose the earliest meaningful error, compare it with existing diagnoses, and decide whether a new report is warranted. A workflow can be agentic while stopping at a recommendation and handing the decision to a person.

## Keep the loop bounded

An agent does not need broad autonomy to be useful. Define its goal, permitted tools, data access, step and retry limits, evaluation criteria, and stop conditions. Use read-only GitHub access by default and put human review before changes are merged or recommendations acted on. Treat issue text, pull requests, logs, and tool results as untrusted data rather than instructions.

An automatic trigger does not mean unlimited autonomy. These blueprints run on an issue, PR, CI event, or schedule, but each has one permitted safe output and explicit limits. Producing no output when evidence is missing, the change is unnecessary, or the finding has already been reported is a valid outcome.

## In these blueprints

- [Issue Helper](../blueprints/issue-helper/) reads a new issue, decides what is missing, and asks for it in one comment.
- [Plain-Language Release Notes](../blueprints/plain-language-release-notes/) verifies one linked merged PR, reads focused diff evidence, and explains the change for non-technical colleagues.
- [Weekly Update](../blueprints/weekly-update/) gathers a week of activity and chooses what is worth highlighting.
- [Dependabot Readiness](../blueprints/dependabot-readiness/) detects dependency ecosystems, preserves existing configuration, and proposes one configuration-only draft PR when changes are needed. Dependabot itself still performs dependency updates.
- [CI Failure Explainer](../blueprints/ci-failure-explainer/) interprets failure evidence and recommends a confirmation step without running repairs.
- [Documentation Drift Report](../blueprints/docs-drift-report/) compares a selected user-facing code change with related documentation and reports an evidence-backed gap.
- [Pull Request Simplification Review](../blueprints/pr-simplification-review/) chooses one optional suggestion from changed code, avoiding drafts and repeated advice.
- [Workflow Permission Check](../blueprints/workflow-permission-check/) reasons about effective job permissions and only proposes a reduction when relevant consumers are understood.
- [Actions Health Report](../blueprints/actions-health-report/) interprets a bounded run sample without presenting it as a repository-wide reliability measurement.

## Start small

Choose the blueprint that solves one actual need, inspect its permissions and outputs, and review its first results. Keep the limits and human decisions intact when adapting it. See [Getting Started](getting-started.md) to install one, or [Creating a Blueprint](creating-a-blueprint.md) to contribute your own.
