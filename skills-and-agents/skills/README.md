# Copilot skills

Choose a focused review or diagnosis. Skills guide Copilot; they do not grant permissions or guarantee findings.

| Task | Skill | Copy destination |
| --- | --- | --- |
| Review correctness, triggers, and output boundaries | [Review agentic workflows](review-agentic-workflows/SKILL.md) | `.github/skills/review-agentic-workflows/SKILL.md` |
| Trace access and propose justified reductions | [Least privilege](agentic-workflow-least-privilege/SKILL.md) | `.github/skills/agentic-workflow-least-privilege/SKILL.md` |
| Diagnose failures, unexpected skips, or missing outputs | [Troubleshooter](agentic-workflow-troubleshooter/SKILL.md) | `.github/skills/agentic-workflow-troubleshooter/SKILL.md` |

Keep the folder name and uppercase `SKILL.md`. In a supported Copilot client, ask to use the skill by name and provide the workflow or diff. For example:

> Use agentic-workflow-least-privilege to assess this workflow's access. Show required, unnecessary, and needs-verification capabilities with evidence. Do not edit files.

For troubleshooting, provide the workflow source and a run URL or redacted compiler error:

> Use agentic-workflow-troubleshooter to diagnose why this workflow produced no issue. Identify the failing phase or intentional no-output reason and the smallest correction. Do not edit files or rerun it.

[Full installation, review examples, and compatibility](../README.md#set-it-up) · [Choose another helper](../README.md)
