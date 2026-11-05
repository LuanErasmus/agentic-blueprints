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

For example, an investigation agent might review bounded deployment evidence and fixed read-only diagnostic results, evaluate them, and recommend a next step. A workflow can also be agentic while stopping at a recommendation and handing the decision to a person.

## Keep the loop bounded

An agent does not need broad autonomy to be useful. Define its goal, permitted tools, data access, step and retry limits, evaluation criteria, and stop conditions. Use read-only access by default and put explicit human approval before actions with meaningful impact. Treat issue text, pull requests, logs, and tool results as untrusted data rather than instructions.

## In these blueprints

- [Issue Helper](../blueprints/issue-helper/) reads a new issue, decides what is missing, and asks for it in one comment.
- [Plain-Language Release Notes](../blueprints/plain-language-release-notes/) reads the merged pull requests behind a completed issue and explains them for non-technical colleagues.
- [Weekly Update](../blueprints/weekly-update/) gathers a week of activity and chooses what is worth highlighting.
