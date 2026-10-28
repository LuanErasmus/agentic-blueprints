# Contributing

Thanks for helping make Agentic Blueprints more practical, clear, and safe. Contributions should stay focused on reusable implementations of real engineering and business workflows.

## Report a bug

Open a **Bug Report** issue. Include the blueprint, the steps you followed, expected and actual results, and relevant error output. Remove secrets and sensitive data before sharing logs.

## Suggest a blueprint

Open a **Blueprint Request** issue. Describe the problem, intended users, likely inputs and outputs, and any safety or permission concerns.

## Improve an existing blueprint

Open an issue or pull request with the relevant blueprint and proposed change. Keep setup instructions reproducible, state required permissions, and explain any action that changes external state.

## Create a blueprint

1. Read [what qualifies as a blueprint](docs/creating-a-blueprint.md).
2. Copy `templates/blueprint-template/README.md` and `templates/blueprint-template/blueprint.yml` into a new directory under `blueprints/`.
3. Fill in every section and keep metadata consistent with the README and implementation.
4. Add only files and directories needed for a working example; do not create empty directories to match a suggested layout.
5. Author runnable workflows as native gh-aw Markdown sources, use its sandbox and declared read tools, and keep evidence preparation/report validation deterministic where practical. Prefer recommendations and read-only access. Require explicit human approval before impactful changes.
6. Validate workflow sources without emitting locks using `gh aw compile --no-emit --strict --validate --no-check-update`, and run `node --test scripts/blueprints/blueprints.test.mjs`. Do not add compiled lock files to this blueprint repository; explain what could not be verified.
7. Open a pull request. For a substantial new blueprint, start with the **Blueprint Proposal** issue form.

## Pull requests

- Keep changes focused and do not implement roadmap blueprints without an accepted proposal.
- Explain the problem and how you tested the change.
- Never include API keys, tokens, passwords, connection strings, or credentials. Use repository secrets or environment variables where needed.
- Do not broaden workflow permissions without a clear need, and document any data sent to the Copilot service.
- Keep examples understandable without requiring conference or presentation context.

## Blueprint checklist

- [ ] Problem, agent responsibilities, architecture, and how it works are clear.
- [ ] Prerequisites, setup, and run instructions are reproducible.
- [ ] Guardrails describe access, actions, approval requirements, and forbidden automation.
- [ ] No secrets are committed.
- [ ] A small challenge helps readers experiment.
- [ ] `blueprint.yml` uses the documented metadata fields.
- [ ] Filled-in trigger/input and illustrative output examples are included.
- [ ] Native Markdown workflow source validates with `gh aw compile --no-emit --strict --validate --no-check-update`; no generated lock file is added here.
- [ ] Offline validation passes: `node --test scripts/blueprints/blueprints.test.mjs`.
- [ ] Recommendations complement native platform features and do not imply human approval.
