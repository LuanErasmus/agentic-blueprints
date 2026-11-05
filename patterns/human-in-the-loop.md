# Human-in-the-Loop

## What it is

The Human-in-the-Loop pattern places a person between an agent's recommendation and an action with meaningful impact.

```text
Agent → Recommendation → Human approval → Action
```

The model may interpret evidence and propose a next step, but a person retains the authority to approve, reject, or revise it.

## Why it exists

Model output can be incomplete, mistaken, or influenced by untrusted input. Human review provides context and accountability before consequential changes are made.

## When to use it

Use this pattern when an action changes user-visible state, affects infrastructure, incurs cost, changes access, or is difficult to reverse. It is also useful while evaluating a new workflow or model.

## Advantages

- Keeps consequential decisions accountable to a person.
- Lets teams learn from recommendations before automating further.
- Creates a clear point to inspect evidence and correct a proposal.

## Risks

- Reviewers may approve recommendations without checking them.
- Approval queues can become a bottleneck or a source of alert fatigue.
- The workflow may collect or expose more information than the reviewer needs.

## Guardrails

- Show the evidence, recommendation, and uncertainty together.
- Make the approval step explicit; do not treat silence or a failed check as approval.
- Scope permissions to the approved action and require fresh approval when the proposal changes.
- Keep an auditable record of the decision and the action that followed.

## Demonstrated by

- [Issue Helper](../blueprints/issue-helper/) suggests labels in a comment but never applies them.
- [Plain-Language Release Notes](../blueprints/plain-language-release-notes/) marks every note as a draft for a person to check before sharing.
