# Build your own Agentic Workflow

Optional Copilot customizations to help users create and review their own GitHub Agentic Workflows (`gh-aw`) in their repositories. They are not tools for producing blueprints for this collection. These files are not runnable Actions workflows and do not need compilation. Install any combination.

## What's included

Choose by what you need: [baseline instructions](instructions/), [a builder agent](agents/), or [focused review and troubleshooting skills](skills/). Start with the builder for a new workflow; use the skills when reviewing or diagnosing an existing one.

| File | Purpose |
| --- | --- |
| [Path-specific instructions](instructions/agentic-workflows.instructions.md) | Baseline guidance when Copilot works on workflow sources |
| [Review skill](skills/review-agentic-workflows/SKILL.md) | An evidence-based review checklist for workflow changes |
| [Least-privilege skill](skills/agentic-workflow-least-privilege/SKILL.md) | Trace required access and recommend justified reductions without breaking the task |
| [Troubleshooter skill](skills/agentic-workflow-troubleshooter/SKILL.md) | Diagnose compilation, authentication, trigger, execution, and publication problems from evidence |
| [Builder agent](agents/agentic-workflow-builder.agent.md) | Help turn an idea into a focused workflow and README |

Each file is self-contained. The toolkit is distributed here rather than installed into this collection's `.github/` automatically.

## Set it up

Copy the files into your own repository using these destinations. Create missing directories; inspect and merge with existing customizations rather than overwriting them.

| Source in this folder | Destination in your repository |
| --- | --- |
| `instructions/agentic-workflows.instructions.md` | `.github/instructions/agentic-workflows.instructions.md` |
| `skills/review-agentic-workflows/SKILL.md` | `.github/skills/review-agentic-workflows/SKILL.md` |
| `skills/agentic-workflow-least-privilege/SKILL.md` | `.github/skills/agentic-workflow-least-privilege/SKILL.md` |
| `skills/agentic-workflow-troubleshooter/SKILL.md` | `.github/skills/agentic-workflow-troubleshooter/SKILL.md` |
| `agents/agentic-workflow-builder.agent.md` | `.github/agents/agentic-workflow-builder.agent.md` |

Commit the chosen files. The instructions' `applyTo` pattern covers `.github/workflows/*.md`; adjust it if your source lives elsewhere. Matching README files are documentation, not workflow sources.

### Install by copying

No package installation is needed. Download the files using the links above, or copy them from a local clone of this repository. Put them in the repository where you want Copilot to help, not in the blueprint collection.

Your destination should look like this (omit anything you do not need):

```text
your-repository/
  .github/
    instructions/
      agentic-workflows.instructions.md
    skills/
      review-agentic-workflows/
        SKILL.md
      agentic-workflow-least-privilege/
        SKILL.md
      agentic-workflow-troubleshooter/
        SKILL.md
    agents/
      agentic-workflow-builder.agent.md
```

Keep each skill's folder name and uppercase `SKILL.md` filename. Do not copy these customization files into `.github/workflows/`; that directory is for the workflows you create.

Open the destination repository in your Copilot client. If new customizations are not discovered, reload the workspace or start a new session and check your client's customization list. Copying into this distribution folder alone does not install a skill.

For personal skills in supported local Copilot clients, you can instead copy a skill folder to `~/.copilot/skills/` or `~/.agents/skills/`. On Windows, `~` means your user home directory. Personal installation does not automatically make a skill available to GitHub PR reviews or cloud sessions; use `.github/skills/` and commit it for repository sharing.

Use a Copilot surface that supports the customization you install. GitHub documents skills for Copilot code review, cloud agent, CLI, the app, and supported IDEs; availability and discovery depend on the surface and version. Repository custom instructions must be enabled for code review. Installing a skill does not request a PR review or guarantee that it will be selected.

These files do not install gh-aw, grant repository permissions, or enable inference billing. Compilation requires the [GitHub CLI](https://cli.github.com/) and gh-aw extension (`gh extension install github/gh-aw`). Running your workflow requires the authentication and policies for the engine you choose. Using the authoring toolkit follows your chosen Copilot surface's own access requirements.

## Try it

### Use the instructions

Instructions are applied automatically when Copilot works with files matching `applyTo`; there is no agent to select or skill to invoke. Open or attach an existing `.github/workflows/<name>.md` and ask, for example:

> Update this agentic workflow to run weekly and manually. Follow the repository's agentic-workflow instructions, preserve its output boundaries, and explain what needs recompilation.

When available, check Copilot's response references or customization/context list to confirm the instruction file was included. A matching path does not prove every client loaded it.

### Use the builder agent

Select **Agentic Workflow Builder** in your surface's custom-agent picker, then ask:

> Create a weekly documentation drift workflow for this repository. Report one verified mismatch in an issue, preserve human review, and include a setup README.

If your client does not offer custom-agent selection, verify support for `.github/agents/` in that client's documentation. Merely mentioning the agent's name in a normal chat is not proof the profile was selected.

### Use the review skill

For an interactive review, ask:

> Use the review-agentic-workflows skill to review the changes to my agentic workflow Markdown and its README. Report actionable findings with file and line references. Do not edit files or post comments.

For GitHub PR reviews, install the instructions and skill on the repository's default branch before requesting Copilot review. Do not assume a customization added by the PR under review is already active.

Skills are selected based on the task and their descriptions on supported surfaces. Naming the skill in your prompt makes the intended task explicit; check the client's skill-loading indication when available. If it reports the skill is unavailable, verify the install location and support rather than assuming it ran. GitHub code review may load a relevant skill, but installation does not guarantee selection.

### Use the least-privilege skill

For a focused access assessment, ask:

> Use agentic-workflow-least-privilege to assess this workflow's permissions, tools, network, checkout, credentials, and safe outputs. Classify access as required, unnecessary, or needs verification, with evidence. Do not edit files.

The least-privilege skill separates the analysis agent's capabilities from setup and safe-output jobs. Read-only GitHub permissions alone do not make the entire workflow read-only. The builder and review skill can use it when installed and available; it is not a required dependency.

### Use the troubleshooter skill

Provide the workflow source and the exact run URL or redacted compiler error, then ask:

> Use agentic-workflow-troubleshooter to diagnose this workflow's failure or missing output. Trace the failing phase, cite the evidence, and recommend the smallest correction and a confirmation check. Do not edit files, change settings, or rerun the workflow.

The skill separates compilation, trigger eligibility, authentication, agent execution, intentional no-output decisions, and safe-output publication. It uses bounded read-only evidence and does not request token values or automatically run live workflows. A missing secret or unavailable log may require an owner to verify metadata; never share credentials to complete the diagnosis.

The builder should explain unresolved choices, produce scoped files, and report compilation results or limitations. The reviewer should report concrete defects, not rewrite the workflow. The troubleshooter should distinguish confirmed causes from hypotheses and report unresolved evidence gaps. A clean review or local compilation is not proof of runtime safety or output quality.

## Boundaries and customization

The toolkit follows your workflow's requirements and repository policies, not this collection's blueprint restrictions. It helps select triggers, engines, authentication, tools, outputs, and budgets appropriate to the task. PR creation, multiple bounded outputs, imports, and scripts are supported options when justified and validated.

Instructions and skills guide model behavior; they are not permission enforcement. The builder's tool list permits reading, searching, editing, and command execution but does not sandbox shell commands. Review generated frontmatter, compiled jobs, and repository policies before running anything.

Adapt the files to your repository's documented policies. Keep claims about enforced limits separate from prompt guidance, and verify version-sensitive syntax against the installed compiler.

## Contributing and validation

Toolkit changes should preserve the copy destinations, self-contained files, and distinction between authoring and runtime permissions. Do not introduce collection-specific blueprint rules into the copy-in customizations.

From the collection root, run:

```shell
node --test scripts/blueprints/blueprints.test.mjs
```

These tests check packaging, selected frontmatter and guardrails, and local links. They do not prove Copilot loaded the toolkit or performed a successful review. Test discovery and behavior on your intended Copilot surface separately.

## References

[Repository home](../README.md) · [Use an existing workflow](../blueprints/) · [Learning guides](../docs/)

- [GitHub repository custom instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions)
- [GitHub agent skills](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills)
- [GitHub custom-agent configuration](https://docs.github.com/en/copilot/reference/custom-agents-configuration)
- [gh-aw workflow structure](https://github.github.com/gh-aw/reference/workflow-structure/)
- [gh-aw safe outputs](https://github.github.com/gh-aw/reference/safe-outputs/)
