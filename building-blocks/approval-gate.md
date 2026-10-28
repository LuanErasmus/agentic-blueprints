# Approval Gate

An approval gate pauses a workflow before an impactful action and asks an authorised person to review the proposal.

```text
Agent decision
    ↓
Approval required
    ↓
Human review
    ↓
Approved → Continue
Rejected → Stop or revise
```

## Reusable approach

1. Prepare a specific proposed action with its rationale, evidence, and expected effect.
2. Check that the action requires approval under the workflow's policy.
3. Present the proposal to an authorised reviewer.
4. Continue only after an explicit approval that applies to this proposal.
5. On rejection, missing approval, or a changed proposal, stop or request a new review.
6. Record the decision and the action taken.

## Guardrails

Approval is not a substitute for least privilege. The executor should still be unable to perform actions outside its permitted scope. Do not interpret timeouts, missing responses, or errors as approval.

## Demonstrated by

The GitHub blueprints leave label changes and pull request decisions to maintainers. The Azure investigator has no write-capable executor, so a recommendation cannot become an Azure change through that workflow.
