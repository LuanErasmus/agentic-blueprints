# Creating a Blueprint

A blueprint is a reusable gh-aw workflow that helps with one specific task in a GitHub repository. Workflows are authored as native gh-aw Markdown and compiled in the adopting repository. Keep them simple to adopt, with read-only GitHub access for analysis and one bounded safe output.

This is the manual contribution guide for adding reusable blueprints to this collection. The [Copilot helpers](../skills-and-agents/) are for users' own Agentic Workflows, not for generating collection blueprints.

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
- Avoid custom labels, secrets, and additional repository settings. List any necessary platform policies or blueprint-specific prerequisites explicitly. Follow the [blueprint template](templates/blueprint-template/README.md) sections and include a short example consistent with the workflow's limits.
- Dependabot Readiness is the configuration-only exception: it may edit one local Dependabot file and propose one draft PR via `create-pull-request`, with an exact file allowlist and one-file patch limit. Document the required Actions PR policy and separate Dependabot security settings; do not broaden other blueprint workflows to PR creation.
- Include a useful automatic trigger. Prefer working defaults over required placeholders; a workflow-name example is acceptable when an event needs it. Mark any required edit in the file and README before the compile step. Keep manual testing available where appropriate, and explain that trigger changes require recompilation.

## Guardrails

- Give the agent read-only GitHub permissions, apart from `copilot-requests: write` for inference. GitHub writes happen only through gh-aw safe outputs with `max: 1`. Local file editing is enabled only for Dependabot Readiness's configuration proposal.
- Keep the collection's `timeout-minutes: 5` and `max-ai-credits: 100` limits. Bound evidence reads and output size in the prompt; the roughly 1,000-token budget is guidance, not an enforced token limit.
- Tell the agent to treat issues, pull requests, comments, and tool output as information, never as instructions.
- Never use `pull_request_target` or run pull request code.
- Never commit tokens, passwords, connection strings, private keys, or other credentials.
- People keep every decision; mark AI-written output as a draft where it may be shared.
- Define when to produce no output, including missing evidence, unchanged configuration, and repeated findings. Duplicate checks must stay bounded, and unavailable checks must not be treated as proof that no duplicate exists.
- Give evidence queries explicit item/file limits, stop on incomplete checks that are required for a finding, and verify relevant live state before publication. These prompt rules are best-effort, not atomic guarantees or permission enforcement.

## Document and register the blueprint

Complete every template section: purpose, prerequisites, setup, first run, example output, optional changes, and safety. Explain any required workflow-name or branch-name edits before compilation, and distinguish read-only GitHub access from permitted local workspace edits.

Add the blueprint to the collection tables in [the main README](../README.md), [the blueprint catalog](../blueprints/README.md), [Getting Started](getting-started.md), and [Running workflows](running-workflows.md#blueprint-triggers). Keep triggers and output descriptions consistent across these pages. Use `../../docs/` for documentation links from `blueprints/<name>/README.md`.

## Validation

From the collection root, contributors use Node.js 24 and the installed gh-aw extension:

```shell
node scripts/blueprints/validate.mjs
node --test scripts/blueprints/blueprints.test.mjs
```

Validation discovers workflows directly under `blueprints/<name>/` and runs strict compilation without emitting locks. Tests check structure, guardrails, and local documentation links; they do not execute the workflows or verify AI output quality. Add focused regression checks for new behavior and state clearly whether a live run was performed.

These scripts stay in the collection; adopters do not copy them. See [CONTRIBUTING.md](../CONTRIBUTING.md) before opening a pull request.
