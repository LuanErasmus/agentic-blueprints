# Contributing

Thanks for helping make Agentic Blueprints more practical, clear, and safe. Contributions should stay focused on reusable implementations of real engineering and business workflows.

## Report a bug

Open a **Bug Report** issue. Include the blueprint, the steps you followed, expected and actual results, and relevant error output. Remove secrets and sensitive data before sharing logs.

## Suggest a blueprint

Open a **Blueprint Request** issue. Describe the problem, intended users, likely inputs and outputs, and any safety or permission concerns.

## Improve an existing blueprint

Open an issue or pull request with the relevant blueprint and proposed change. Keep setup instructions reproducible, state required permissions, and explain any action that changes external state.

## Create a blueprint

The steps below apply to standard single-file blueprints. [Into Azure Cost
Reviewer](blueprints/into-azure-cost-reviewer/) is the documented multi-file
exception; preserve its required contract paths and check its packaging without
compiling it in this collection. Adopters compile its entry workflow themselves.

1. Read [what qualifies as a blueprint](docs/creating-a-blueprint.md).
2. Create `blueprints/<name>/` and copy `docs/templates/blueprint-template/README.md` into it.
3. Author one self-contained gh-aw Markdown file, `blueprints/<name>/<name>.md`, not in this collection's `.github/workflows/`. Adopters copy only that file: no shared imports, scripts, or configuration files. Use `copilot-requests: write` and link the [Copilot licence and policy requirements](docs/running-workflows.md#copilot-licence-and-authentication-requirements).
4. Fill in every README section and keep it consistent with the workflow, including a short example of the output.
5. With Node.js 24 and gh-aw installed, run `node scripts/blueprints/validate.mjs` and `node --test scripts/blueprints/blueprints.test.mjs`. Do not add compiled lock files; explain what you could not verify, such as live runs.
6. Open a pull request. For a substantial new blueprint, start with the **Blueprint Proposal** issue form.

## Contribute skills, agents, or instructions

The optional [Copilot helpers](skills-and-agents/) help users create and review their own Agentic Workflows; they are not a blueprint generator. Place instructions in `skills-and-agents/instructions/`, skills in `skills-and-agents/skills/<name>/`, and agents in `skills-and-agents/agents/`. Keep these customizations independent of this collection's folder layout, fixed budgets, and output exceptions. Update the appropriate section's landing page and the shared installation guide, document copy destinations and supported surfaces, and run the existing tests. Do not install the distributed customizations into this collection automatically.

## Pull requests

- Keep changes focused and discuss substantial new blueprints in a **Blueprint Proposal** issue first.
- Explain the problem and how you tested the change.
- Never include API keys, tokens, passwords, connection strings, or credentials. Use repository secrets or environment variables where needed.
- Do not broaden workflow permissions without a clear need, and document any data sent to the Copilot service.
- Keep examples understandable without requiring conference or presentation context.

## Blueprint checklist

- [ ] The blueprint is in `blueprints/` and its README uses the template sections.
- [ ] Setup is copy, compile, commit; any extra setup is listed under **Before you start**.
- [ ] Blueprint agents have read-only GitHub permissions and use one `add-comment` or `create-issue` safe output with `max: 1`. Dependabot Readiness alone may use one draft `create-pull-request`, restricted to one Dependabot file by an exact allowlist; its required repository policies are documented.
- [ ] The prompt treats issues, pull requests, and tool output as information, not instructions.
- [ ] No secrets or generated lock files are committed.
- [ ] Distributed sources default to `copilot-requests: write`; the README links licence requirements and the optional personal-plan setup before compilation.
- [ ] Standard sources pass `node scripts/blueprints/validate.mjs`; all packaging passes `node --test scripts/blueprints/blueprints.test.mjs`. Into Azure Cost Reviewer is excluded from compiler staging.
- [ ] The workflow complements built-in GitHub features rather than replacing them, and people keep every decision.
