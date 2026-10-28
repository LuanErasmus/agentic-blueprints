# GitHub PR Review

**Difficulty:** Intermediate

## Problem

Reviewers need to understand a pull request's intent, inspect its changes, and decide where to focus. A concise risk-oriented summary can help, but should not replace a human review.

## What the Agent Does

When a same-repository pull request is opened, updated, or marked ready for review, the workflow gathers its title, description, available text patches, and the base revision's `CONTRIBUTING.md` guidance. Copilot CLI drafts a risk-focused analysis, then a separate evaluator checks its claims against the evidence and repository guidance. The workflow writes the evaluated review aid to the Actions run summary for a human reviewer to consider.

## Architecture

```text
Pull request opened or updated
        ↓
Workflow reads pull request metadata and file patches
        ↓
Copilot CLI assesses changes, risks, and repository guidance
        ↓
Evaluator checks findings against the supplied evidence
        ↓
Evaluated recommendation appears in the Actions run summary
        ↓
Human reviewer inspects the diff and submits a review
```

## Prerequisites

- A GitHub repository with Actions enabled.
- A GitHub Copilot entitlement that permits Copilot CLI use.
- A token authorised for Copilot CLI, stored as the repository secret `COPILOT_PAT`.
- Pull request read access for the workflow token.

## Setup

1. Add `.github/workflows/pr-review.yml` to your repository (or adapt this repository's workflow).
2. Add an Actions secret named `COPILOT_PAT` containing a token authorised for Copilot CLI.
3. Confirm the repository and token are permitted to use Copilot CLI.
4. Review the prompt, model, and data-processing policy before enabling the workflow.

The workflow does not check out or execute pull request code. It reads pull request metadata and patches through the GitHub API.

## Run It

Open or update a same-repository pull request, or mark it ready for review. Open the corresponding Actions run and read its summary. The model sees at most the first 50 changed files, up to 24,000 characters of text patches, up to 5,000 characters each of the PR description and `CONTRIBUTING.md`; binary files and files without a patch are not included.

## How It Works

The workflow fetches changed-file patches and the base revision's `CONTRIBUTING.md` using the GitHub API, caps the context to limit prompt size, and sends the evidence to an analysis call. A second inference call evaluates the draft findings against the same evidence, removes unsupported claims, and checks whether repository guidance was considered. If no contribution guidance exists, the workflow says none was provided. The evaluated recommendation is written to the run summary. The workflow does not submit a GitHub review or post a comment, so the reviewer remains responsible for validating findings and taking action.

## Guardrails

- **Access:** pull request metadata and the GitHub API's available text patches; Copilot CLI inference.
- **Actions:** write an analysis to the Actions run summary only.
- **Approval:** all review decisions and approvals remain with a human reviewer.
- **Never automatic:** approving, requesting changes, merging, pushing commits, or creating comments.
- **Credentials:** uses a read-only `GITHUB_TOKEN` for pull request data and the `COPILOT_PAT` Actions secret for Copilot CLI.
- Pull request content is untrusted input and is sent to GitHub Copilot for inference. The workflow skips pull requests from forks because repository secrets are not available to them. Do not use this workflow for confidential code or data unless that processing is approved for your organisation.

## Customise It

Adapt the prompt to your team's review checklist and risk categories. Keep context limits visible and explain when patches are missing or truncated. For forks, the workflow intentionally avoids write permissions and does not execute contributor code.

## Challenge

Add one repository-specific review criterion to the prompt, then compare the recommendation against a human review on a sample pull request.
