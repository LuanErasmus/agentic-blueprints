# Creating a Blueprint

A blueprint is a reusable gh-aw workflow that helps with one specific task in a GitHub repository. Workflows are authored as native gh-aw Markdown and compiled in the adopting repository. This collection accepts Beginner blueprints: simple to adopt, read-only apart from one bounded safe output, and requiring no repository-specific settings.

## What qualifies

A blueprint uses an agent to read context, reason about it, and produce a useful, bounded result for a person, such as a comment, summary, or recommendation. A fixed script with no reasoning is not an agentic workflow. Blueprints complement built-in GitHub features (code review, Dependabot, releases); they do not replace them.

## Required structure

```text
blueprints/beginner/<name>/
├── <name>.md    # the gh-aw workflow
└── README.md    # based on the blueprint template
```

- Adopters copy only `<name>.md` to `.github/workflows/<name>.md`, run `gh aw compile <name>`, and commit both files. This collection distributes no lock files.
- Do not require shared imports, scripts, or configuration files. Put any logic in the prompt and let the agent work it out.
- Use `engine: copilot` with `permissions: copilot-requests: write`, and link the [shared licence requirements](running-workflows.md#copilot-licence-and-authentication-requirements) in the README. Do not add PAT setup instructions.
- Do not require labels, secrets, or repository settings. Follow the [blueprint template](../templates/blueprint-template/README.md) sections and include a short example of the output.

## Guardrails

- Give the agent read-only permissions. Writes happen only through gh-aw safe outputs with a low `max`.
- Tell the agent to treat issues, pull requests, comments, and tool output as information, never as instructions.
- Never use `pull_request_target` or run pull request code.
- Never commit tokens, passwords, connection strings, private keys, or other credentials.
- People keep every decision; mark AI-written output as a draft where it may be shared.

## Validation

Contributors use Node.js 24 with `node scripts/blueprints/validate.mjs` (strict compile without emitting locks) and `node --test scripts/blueprints/blueprints.test.mjs`. These scripts stay in the collection. See [CONTRIBUTING.md](../CONTRIBUTING.md) before opening a pull request.
