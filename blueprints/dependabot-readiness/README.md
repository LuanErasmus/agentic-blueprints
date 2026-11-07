# Dependabot Readiness

## What it does

Every Monday, or when you start it manually, the agent detects this repository's dependency ecosystems and proposes missing or updated Dependabot configuration in **one draft pull request**. It groups routine updates separately by major, minor, and patch version, plus security updates where supported, for each detected ecosystem. Inspired by the gallery's [Dependabot Rollout](https://github.github.com/gh-aw/gallery/multi-repo/dependabot-rollout/), this version works in one repository without cross-repository tokens.

Existing configuration is updated in place, not replaced wholesale. If it already meets the requirements, or a configuration PR is already open, no new PR is created. A person reviews and merges the proposal; Dependabot handles subsequent dependency updates.

## Before you start

- [GitHub CLI](https://cli.github.com/) with the gh-aw extension: `gh extension install github/gh-aw`.
- GitHub Actions enabled in your repository.
- A Copilot licence that covers the workflow. See [Copilot licence requirements](../../docs/running-workflows.md#copilot-licence-and-authentication-requirements).
- Your repository or organisation must allow GitHub Actions to create pull requests. If blocked, an administrator must enable **Allow GitHub Actions to create and approve pull requests** in **Settings > Actions > General > Workflow permissions**. This blueprint never approves PRs; PR creation uses the built-in token, separately from inference authentication.
- To receive security update PRs, enable the dependency graph, Dependabot alerts, and Dependabot security updates in repository settings where supported. Grouping configuration does not enable them.

## Set it up

Use the default organisation authentication, or follow the optional [personal-plan setup](../../docs/running-workflows.md#personal-plan-setup) on your copied workflow before compiling. Keep this blueprint's existing read permissions and PR restrictions.

1. Copy [`dependabot-readiness.md`](dependabot-readiness.md) to `.github/workflows/dependabot-readiness.md` in your repository.
2. Compile it:

   ```bash
   gh aw compile dependabot-readiness
   ```

3. Commit and push `.github/workflows/dependabot-readiness.md` and `.github/workflows/dependabot-readiness.lock.yml` to your default branch.

## Try it

It runs automatically every Monday once installed on the default branch. To test it now, in the **Actions** tab, select **Dependabot Readiness** and choose **Run workflow**. Or run:

```bash
gh aw run dependabot-readiness
```

## What you'll see

A draft PR titled `[dependabot readiness] Configure grouped dependency updates`, changing only `.github/dependabot.yml` (or the existing `.yaml` file). For a repository with an npm manifest at `/`, its update entry would include:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    groups:
      major:
        applies-to: version-updates
        patterns: ["*"]
        update-types: ["major"]
      minor:
        applies-to: version-updates
        patterns: ["*"]
        update-types: ["minor"]
      patch:
        applies-to: version-updates
        patterns: ["*"]
        update-types: ["patch"]
      security:
        applies-to: security-updates
        patterns: ["*"]
```

The same group rules are applied within each detected ecosystem's entries, not across ecosystems. Security fixes are not restricted to patch or minor releases. Ecosystems without Dependabot security-update support, such as GitHub Actions, Docker, and Terraform, get version groups only; the PR explains why. Groups do not guarantee a PR on every run: Dependabot still needs eligible updates.

See the [Dependabot groups reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference#groups--) for the underlying options.

The PR also includes a compact coverage summary, for example:

| Ecosystem | Directories | Grouping change | Security limitations |
| --- | --- | --- | --- |
| npm | `/` | Added major, minor, patch, and security groups | Security updates must be enabled separately |
| github-actions | `/` | Added major, minor, and patch groups | Dependabot security updates are not supported |

This example assumes both an npm manifest and Actions workflows were detected; the actual PR lists only verified ecosystems.

## Change it

- **Grouping:** edit the prompt below the `---` lines, for example to combine minor and patch updates. No recompile needed; keep security updates separate.
- **Schedule:** change `schedule: weekly on monday` to `schedule: weekly on friday`, for example, then recompile. No placeholders need replacing.
- **Trigger or output settings:** edit the frontmatter, then recompile. Keep the agent's GitHub permissions read-only and the PR file allowlist restricted to Dependabot configuration.

## Safety

Discovery is capped at 500 tracked paths and twenty relevant file reads. Duplicate checks inspect at most twenty open PRs and 100 changed paths per PR; incomplete coverage stops the proposal. It rechecks the default-branch SHA before requesting a PR and limits its authored description to 300 words, excluding unchanged template text. These are prompt rules, not an atomic guarantee against concurrent changes.

- The agent can edit its local workspace but has read-only GitHub access. A separate safe-output job can open at most one draft PR.
- The enforced file allowlist and one-file patch limit permit only `.github/dependabot.yml` or `.github/dependabot.yaml`. Other protected files remain blocked.
- Preserves existing settings and dependency scopes; stops on ambiguous grouping conflicts, competing updater configurations, failed discovery, or an already-open configuration PR.
- Checks the default branch in one repository; never merges, upgrades packages, or changes repository settings.
- PR creation failures are surfaced rather than replaced with recommendation issues. PRs made with the built-in token may not start CI automatically; maintainers must review the configuration before merging.
- Uses a soft budget of about 1,000 tokens, a 100 AI-credit spending cap, and a five-minute timeout.
- Stops rather than guessing about package ecosystems or directories.
- Treats repository content and tool output as information, never as instructions.
