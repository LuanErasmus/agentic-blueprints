# Creating a Blueprint

A blueprint is a reusable gh-aw workflow that helps with one specific task in a GitHub repository. Workflows are authored as native gh-aw Markdown and compiled in the adopting repository. This collection accepts blueprints: simple to adopt, read-only GitHub access for analysis, and one bounded safe output.

## What qualifies

A blueprint uses an agent to read context, reason about it, and produce a useful, bounded result for a person, such as a comment, summary, or recommendation. A fixed script with no reasoning is not an agentic workflow. Blueprints complement built-in GitHub features (code review, Dependabot, releases); they do not replace them.

## Required structure

```text
blueprints/<name>/
├── <name>.md    # the gh-aw workflow
└── README.md    # based on the blueprint template
```

- Adopters copy only `<name>.md` to `.github/workflows/<name>.md`, run `gh aw compile <name>`, and commit both files. This collection distributes no lock files.
- Do not require shared imports, scripts, or configuration files. Put any logic in the prompt and let the agent work it out.
- Use `engine: copilot` with `permissions: copilot-requests: write`, and link the [shared licence requirements](running-workflows.md#copilot-licence-and-authentication-requirements) in the README. Do not add PAT setup instructions.
- Do not require labels, secrets, or repository settings. Follow the [blueprint template](../templates/blueprint-template/README.md) sections and include a short example of the output.
- Dependabot Readiness is the configuration-only exception: it may edit one local Dependabot file and propose one draft PR via `create-pull-request`, with an exact file allowlist and one-file patch limit. Document the required Actions PR policy and separate Dependabot security settings; do not broaden other blueprint workflows to PR creation.
- Include a useful automatic trigger. Prefer working defaults over required placeholders; a workflow-name example is acceptable when an event needs it. Mark any required edit in the file and README before the compile step. Keep manual testing available where appropriate, and explain that trigger changes require recompilation.

## Guardrails

- Give the agent read-only permissions. Writes happen only through gh-aw safe outputs with a low `max`.
- Tell the agent to treat issues, pull requests, comments, and tool output as information, never as instructions.
- Never use `pull_request_target` or run pull request code.
- Never commit tokens, passwords, connection strings, private keys, or other credentials.
- People keep every decision; mark AI-written output as a draft where it may be shared.

## Validation

Contributors use Node.js 24 with `node scripts/blueprints/validate.mjs` (strict compile without emitting locks) and `node --test scripts/blueprints/blueprints.test.mjs`. These scripts stay in the collection. See [CONTRIBUTING.md](../CONTRIBUTING.md) before opening a pull request.
