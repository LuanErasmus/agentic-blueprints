# Contributing

Thanks for helping make Agentic Blueprints more practical, clear, and safe. Contributions should stay focused on reusable implementations of real engineering and business workflows.

## Report a bug

Open a **Bug Report** issue. Include the blueprint, the steps you followed, expected and actual results, and relevant error output. Remove secrets and sensitive data before sharing logs.

## Suggest a blueprint

Open a **Blueprint Request** issue. Describe the problem, intended users, likely inputs and outputs, and any safety or permission concerns.

## Improve an existing blueprint

Open an issue or pull request with the relevant blueprint and proposed change. Keep setup instructions reproducible, state required permissions, and explain any action that changes external state.

## Create a blueprint

1. Read [what qualifies as a blueprint](docs/creating-a-blueprint.md) and pick a level: `beginner`, `intermediate`, or `expert`.
2. Create `blueprints/<level>/<name>/` and copy `templates/blueprint-template/README.md` into it.
3. Author one self-contained gh-aw Markdown file, `blueprints/<level>/<name>/<name>.md`, not in this collection's `.github/workflows/`. Adopters copy only that file: no shared imports, scripts, or configuration files. Use `copilot-requests: write` and link the [Copilot licence and policy requirements](docs/running-workflows.md#copilot-licence-and-authentication-requirements).
4. Fill in every README section and keep it consistent with the workflow, including a short example of the output.
5. With Node.js 24 and gh-aw installed, run `node scripts/blueprints/validate.mjs` and `node --test scripts/blueprints/blueprints.test.mjs`. Do not add compiled lock files; explain what you could not verify, such as live runs.
6. Open a pull request. For a substantial new blueprint, start with the **Blueprint Proposal** issue form.

## Pull requests

- Keep changes focused and do not implement roadmap blueprints without an accepted proposal.
- Explain the problem and how you tested the change.
- Never include API keys, tokens, passwords, connection strings, or credentials. Use repository secrets or environment variables where needed.
- Do not broaden workflow permissions without a clear need, and document any data sent to the Copilot service.
- Keep examples understandable without requiring conference or presentation context.

## Blueprint checklist

- [ ] The blueprint sits in the right level folder and its README uses the template sections.
- [ ] Setup is copy, compile, commit; any extra setup is listed under **Before you start**.
- [ ] Beginner blueprints need no labels, secrets, or settings, only read the repository, and use one `add-comment` or `create-issue` safe output with `max: 1`.
- [ ] The prompt treats issues, pull requests, and tool output as information, not instructions.
- [ ] No secrets or generated lock files are committed.
- [ ] Copilot authentication uses `copilot-requests: write`; the README links the licence requirements.
- [ ] `node scripts/blueprints/validate.mjs` and `node --test scripts/blueprints/blueprints.test.mjs` pass.
- [ ] The workflow complements built-in GitHub features rather than replacing them, and people keep every decision.
