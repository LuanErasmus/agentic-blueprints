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
2. Copy `templates/blueprint-template/README.md` into a new directory under `blueprints/`.
3. Fill in every section and keep the README consistent with the workflow.
4. Add only files and directories needed for a working example; do not create empty directories to match a suggested layout.
5. Author one self-contained gh-aw Markdown source in each `blueprints/<slug>/` folder, not this collection's `.github/workflows/`. Adopters copy only that file: no shared imports, JavaScript runtime, JSON configuration, or report schemas. Put labels and instructions directly in it. Use `copilot-requests: write` with organisation billing and document the [Copilot licence and policy requirements](docs/running-workflows.md#copilot-licence-and-authentication-requirements). Use the sandbox and native read-only GitHub tools/proxy, with no checkout or PR code execution. Write one advisory Markdown report with the native edit tool and upload only `report.md` in the empty workspace with seven-day retention. Keep impactful actions outside the workflow under human control.
6. With Node.js 24 and gh-aw installed, validate standalone sources without emitting locks using `node scripts/blueprints/validate.mjs`, and run `node --test scripts/blueprints/blueprints.test.mjs`. These are collection maintenance tools, not adopter dependencies. Do not add compiled lock files to this blueprint repository; explain what could not be verified, including any untested live integrations.
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
- [ ] Filled-in trigger/input and illustrative output examples are included.
- [ ] Setup copies one Markdown file; no sample dispatch flag or custom JSON report contract is required.
- [ ] Evidence limits, inaccessible/truncated results, and tool errors are explicit; no missing result is treated as success.
- [ ] Native Markdown workflow source lives beside its blueprint guide and validates with `node scripts/blueprints/validate.mjs`; no generated lock file is added here.
- [ ] Copilot authentication uses `copilot-requests: write`; prerequisites explain the organisation's Copilot entitlement and billing policies.
- [ ] Offline validation passes: `node --test scripts/blueprints/blueprints.test.mjs`.
- [ ] Recommendations complement native platform features and do not imply human approval.
