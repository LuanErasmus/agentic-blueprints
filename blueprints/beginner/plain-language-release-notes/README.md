# Plain-Language Release Notes

## What it does

When an issue is closed as **completed** and a merged pull request is linked to it, the agent reads that pull request and posts **one** comment on the issue explaining the change for non-technical colleagues, such as product, sales, support, or leadership.

The pull request is still the technical record. This comment explains it in everyday words. If no merged pull request is linked, the agent does nothing.

## Before you start

- [GitHub CLI](https://cli.github.com/) with the gh-aw extension: `gh extension install github/gh-aw`.
- GitHub Actions enabled in your repository.
- A Copilot licence that covers the workflow. See [Copilot licence requirements](../../../docs/running-workflows.md#copilot-licence-and-authentication-requirements).
- Pull requests that close issues, for example with `Fixes #123` in the pull request description, or linked through the issue's **Development** panel.

## Set it up

1. Copy [`plain-language-release-notes.md`](plain-language-release-notes.md) to `.github/workflows/plain-language-release-notes.md` in your repository.
2. Compile it:

   ```bash
   gh aw compile plain-language-release-notes
   ```

3. Commit and push `.github/workflows/plain-language-release-notes.md` and `.github/workflows/plain-language-release-notes.lock.yml` to your default branch.

Nothing else to configure.

## Try it

1. Open an issue, for example "Let customers download invoices as PDF".
2. Open a pull request with `Fixes #<issue number>` in its description, and merge it.
3. GitHub closes the issue as completed. The **Plain-Language Release Notes** run appears on the **Actions** tab, and the comment appears on the issue.

## What you'll see

> ## What's new
>
> Customers can now download their invoices as a PDF straight from their account page, so they no longer need to ask support for a copy.
>
> ## What this means for you
>
> - **Support:** fewer requests for invoice copies.
> - **Customers:** a new **Download PDF** button next to each invoice.
>
> ## Anything to do?
>
> Nothing — this works automatically.
>
> ---
> _Draft written by an AI assistant. Please check it before sharing._

## Change it

All changes are optional. Edit the Markdown below the `---` lines (no recompile needed):

- Change the audience, for example "customers" instead of "colleagues".
- Change the comment layout, tone, or word limit.

## Safety

- Read-only access to your repository.
- Can post at most one comment, on the closed issue.
- Skips issues closed as "not planned" and issues with no merged pull request.
- Every comment is marked as an AI draft for a person to check before sharing.
