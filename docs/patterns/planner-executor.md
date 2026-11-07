# Planner-Executor

## What it is

Planner-Executor separates deciding on a sequence of steps from carrying them out. The planner uses a goal and available context to propose a bounded plan; an executor performs only permitted steps and returns results.

```text
Goal → Planner → Plan → Executor → Result
```

An evaluator can inspect the result before the next step is selected.

## When to use it

Use this pattern when a task has multiple diagnostic or operational steps, and the next step should depend on evidence gathered earlier. It is not a reason to grant an agent broad tool access.

## Advantages

- Makes proposed actions easier to inspect before execution.
- Separates reasoning from tool permissions.
- Makes it clearer where to validate results and stop.

## Risks

- A plausible plan may still be wrong or omit an important constraint.
- Untrusted observations can influence later planning.
- Repeated planning can loop or expand beyond the original goal.

## Guardrails

- Define allowed tools and stop conditions before execution.
- Validate every step against the original goal and permissions.
- Bound step count, data volume, and retries.
- Require human approval for impactful actions; prefer read-only execution.
- Treat tool results as evidence, not instructions.

## Related example

The [Weekly Update](../../blueprints/weekly-update/) collects repository activity with read-only tools and hands one bounded issue to a separate safe-output job to create.
