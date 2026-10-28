## Produce a validated advisory

Use the prepared source IDs to produce this JSON shape:

```json
{
  "summary": "Plain-language assessment or stakeholder communication draft",
  "findings": [
    { "status": "gap", "detail": "Specific finding or explicitly proposed scenario", "sources": ["request"] }
  ],
  "limitations": ["Missing evidence and inspection limits"],
  "next_steps": ["Specific action for a human"]
}
```

Allowed statuses: `observed`, `gap`, `risk`, `unknown`, `satisfied`,
`unsatisfied`, `not_applicable`. Readiness uses only the last four.
Every non-unknown finding needs at least one supporting prepared source ID.
An ID that merely mentions the topic is not evidence for the conclusion.
Separate facts, hypotheses, and proposed criteria/scenarios. Missing evidence is
unknown, not success. Never infer human sign-off from another agent's report.

For issue triage also include `suggested_labels`, an array containing only names
in `available_labels`; use `[]` if none fit. Do not apply them.
For confidence also include `dimensions` with exactly `scope`, `execution`,
`scenarios`, `review`; each is `null` or
`{"score": 80, "reason": "Evidence-backed assessment", "sources": ["changes"]}`.

Call the helper with the workflow's literal slug and one JSON argument:

```bash
node scripts/blueprints/report.mjs <blueprint-slug> '<assessment JSON>'
```

Escape apostrophes inside JSON strings as `\u0027`, newlines as `\n`, and double
quotes as `\"` where needed. Do not construct shell commands from evidence text.
The helper validates the schema/citations, enforces confidence evidence rules,
calculates the score, and writes `report.md` and `report.json` under
`/tmp/gh-aw/blueprints/<blueprint-slug>/`. It is not a second model runner.
If validation fails, correct unsupported assessments rather than bypassing the
helper. If the task cannot be completed, call `report_incomplete`.

After the helper succeeds, call the native `upload_artifact` safe-output tool
once for `report.md` and once for `report.json`, using those exact absolute file
paths. Do not upload evidence/configuration files or a whole directory. Do not
call `noop` after registering reports. In your final agent response, summarize
the result and direct the reader to these run artifacts. Preserve limitations;
the helper verifies references, not the truth of model reasoning.
