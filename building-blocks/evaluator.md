# Evaluator

An evaluator checks an operation's result against explicit criteria before a workflow decides what happens next.

```text
Action → Result → Evaluate
                   ├─ Pass → Continue
                   ├─ Retry → Try again within a bound
                   └─ Stop → Report the failure
```

## Reusable approach

1. Define success criteria before the action runs.
2. Collect the result and the evidence needed to assess it.
3. Check the criteria; distinguish observed facts from model interpretation.
4. Continue on pass, retry only when the operation is safe and retries are bounded, or stop and report.

## Guardrails

Retries can repeat side effects. Retry only operations known to be safe to repeat, cap attempts, and preserve the original error. An evaluator should not silently convert missing or ambiguous evidence into success.

## Demonstrated by

The Azure Deployment Investigator asks the model to distinguish evidence from hypotheses and recommend further diagnostics. A maintainer evaluates that analysis before taking action.
