# Security Policy

## Safe use

Blueprints are learning examples, not a substitute for your organisation's security review. Before enabling a workflow, inspect its permissions, triggers, dependencies, data sent to AI services, and credential handling. Start with the narrowest access available and test with non-sensitive data.

Never commit API keys, access tokens, passwords, private keys, connection strings, or Azure or GitHub credentials. Prefer short-lived identity federation where supported; otherwise store required credentials only in the platform's secret store. Treat issue text, pull requests, logs, model output, and tool results as untrusted data.

## Report a vulnerability

Please do not report exploitable vulnerabilities in a public issue. Use the repository's **Security** tab and **Report a vulnerability** option to contact the maintainers privately. Include the affected file or workflow, impact, and safe reproduction details. Avoid including real credentials or sensitive production data.

If private vulnerability reporting is unavailable, contact the repository maintainers through their GitHub profile and request a private reporting channel.

## Response

The maintainers will assess reports and coordinate a fix and disclosure with the reporter. This community project is maintained on a best-effort basis; do not assume a particular response time.
