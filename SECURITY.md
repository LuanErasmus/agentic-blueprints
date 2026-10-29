# Security Policy

## Safe use

Blueprints are learning examples, not a substitute for your organisation's security review. Before enabling a workflow, inspect its gh-aw source and compiled lock, permissions, triggers, tools, safe outputs, dependencies, data sent to Copilot, and credential handling. Compile and review in your own repository; the blueprint repository intentionally does not distribute lock files. Start with the narrowest access available and test with non-sensitive data.

Never commit API keys, access tokens, passwords, private keys, connection strings, or Azure or GitHub credentials. Follow [gh-aw's Copilot authentication guidance](https://github.github.com/gh-aw/reference/auth/) and use short-lived identity federation for Azure where supported; otherwise store required credentials only in the platform's secret store. Treat issue text, pull requests, logs, model output, and tool results as untrusted data. The agent's analysis is advisory, source snapshots are not independently attested, and repository writes are limited to the safe outputs each workflow declares.

## Report a vulnerability

Please do not report exploitable vulnerabilities in a public issue. Use the repository's **Security** tab and **Report a vulnerability** option to contact the maintainers privately. Include the affected file or workflow, impact, and safe reproduction details. Avoid including real credentials or sensitive production data.

If private vulnerability reporting is unavailable, contact the repository maintainers through their GitHub profile and request a private reporting channel.

## Response

The maintainers will assess reports and coordinate a fix and disclosure with the reporter. This community project is maintained on a best-effort basis; do not assume a particular response time.
