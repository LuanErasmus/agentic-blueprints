# GitHub Issue Triage

**Difficulty:** Beginner

## Problem

New issues often arrive with incomplete descriptions or need to be routed to the right people. Manually reading and categorising every issue takes time and can lead to inconsistent suggestions.

## What the Agent Does

When an issue is opened or reopened, a GitHub Actions workflow reads the issue and the repository's available labels. The model recommends a category, relevant labels to consider, missing information, and a next step. A deterministic evaluator checks the response structure and rejects labels that do not exist before the workflow posts a recommendation comment. It does not apply labels or close the issue.

## Architecture

```text
Issue opened or reopened
        ↓
Collect issue context and available labels through the GitHub API
        ↓
Copilot CLI decides category, labels, missing information, and next step
        ↓
Validate output and label names against the collected repository data
        ↓
Create or update a clearly marked recommendation comment
        ↓
Maintainer decides what to do
```

## Prerequisites

- A GitHub repository with Actions enabled.
- A GitHub Copilot entitlement that permits Copilot CLI use.
- A token authorised for Copilot CLI, stored as the repository secret `COPILOT_PAT`.

## Setup

1. Add `.github/workflows/issue-triage.yml` to your repository (or adapt this repository's workflow).
2. Add a repository Actions secret named `COPILOT_PAT` containing a token authorised for Copilot CLI. Store it as a secret; never put it in the workflow file.
3. Confirm that the repository and token are permitted to use Copilot CLI.
4. Review the workflow prompt and selected model for your organisation before enabling it.

## Run It

Open a new issue or reopen an existing one. The workflow runs automatically and adds a recommendation comment. Re-running the workflow updates its marked comment instead of adding another one.

## How It Works

The workflow installs the Copilot CLI, collects actual label names using the GitHub API, and uses `actions/ai-inference` to make a structured triage decision. Issue bodies are capped at 10,000 characters, and the model is told when a body was truncated. A separate validation step checks the response fields and confirms every suggested label exists before publishing. Invalid or malformed recommendations stop the workflow rather than being presented as valid. Issue content is untrusted input: the prompt tells the model to treat it as data, not instructions. The workflow only creates or updates its own recommendation comment; it never changes labels, assignees, milestones, or issue state.

## Guardrails

- **Access:** issue title, body, and available repository label names; Copilot CLI inference; write access to issue comments.
- **Actions:** create or update one triage recommendation comment.
- **Approval:** a maintainer decides whether to apply a suggested label or take another action.
- **Never automatic:** changing labels or assignees, closing issues, editing issue content, or triggering deployment or release actions.
- **Credentials:** uses the `COPILOT_PAT` Actions secret for Copilot CLI and the workflow's `GITHUB_TOKEN` for the marked comment.
- Issue content is sent to GitHub Copilot for inference. Do not use this workflow for confidential issue data unless that processing is approved for your organisation.

## Customise It

Adjust the prompt to match your issue taxonomy and response style. Ask for labels that exist in your repository, but keep them as suggestions. If you change the workflow's output or comment behavior, keep the recommendation clearly identified and preserve the human decision boundary.

## Challenge

Add a short, repository-specific list of valid labels to the prompt and ask the model to select only from that list. Verify that the workflow still recommends labels without applying them.
