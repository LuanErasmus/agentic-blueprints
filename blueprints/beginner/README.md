# Beginner blueprints

Start here if this is your first agentic workflow. Each blueprint:

- is **one Markdown file** that you copy as-is: no labels, secrets, or settings to create;
- **only reads** your repository, then posts **one** comment or opens **one** issue;
- runs automatically on a normal GitHub event or schedule.

| Blueprint | Runs when | Result |
| --- | --- | --- |
| [Issue Helper](issue-helper/) | An issue is opened | A friendly comment that summarises the issue and asks for missing details. |
| [Plain-Language Release Notes](plain-language-release-notes/) | An issue is closed as completed by a merged pull request | A comment that explains the change for non-technical colleagues. |
| [Weekly Update](weekly-update/) | Every Monday, or on demand | An issue summarising the past week's activity. |

## Set up any Beginner blueprint

1. Copy the blueprint's `.md` file into `.github/workflows/` in your repository.
2. Run `gh aw compile <name>` to create the matching `.lock.yml` file.
3. Commit and push both files to your default branch.

Before your first run, check the [Copilot licence requirements](../../docs/running-workflows.md#copilot-licence-and-authentication-requirements).
