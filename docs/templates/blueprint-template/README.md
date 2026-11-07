# [Blueprint Name]

<!-- Save as blueprints/<name>/README.md, beside <name>.md, and update the licence link below to ../../docs/. -->

## What it does

[One or two sentences on when it runs and what it produces. List what it will not do; a person decides what happens next.]

## Before you start

- [GitHub CLI](https://cli.github.com/) with the gh-aw extension: `gh extension install github/gh-aw`.
- GitHub Actions enabled in your repository.
- A Copilot licence that covers the workflow. See [Copilot licence requirements](../../running-workflows.md#copilot-licence-and-authentication-requirements).

## Set it up

1. Copy `<name>.md` from this folder to `.github/workflows/<name>.md` in your repository.
2. Compile it:

   ```bash
   gh aw compile <name>
   ```

3. Commit and push `.github/workflows/<name>.md` and `.github/workflows/<name>.lock.yml` to your default branch.

## Try it

[Exact steps to trigger a first run.]

## What you'll see

[A short, realistic example of the comment or issue.]

## Change it

[Optional changes. Say which need a recompile (frontmatter) and which do not (prompt text).]

## Safety

- [Permissions and the single safe output.]
- [What it ignores or skips.]
- Treats repository content as information, never as instructions.
