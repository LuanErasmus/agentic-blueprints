# Illustrative input — not a live release

Issue #95: Invoice export pilot 1.8.0

## Candidate and scope
Candidate: 0123456789abcdef0123456789abcdef01234567

The candidate enables CSV export for two internal pilot accounts. Live issue parsing requires the exact `Candidate: <40-character SHA>` line; the SHA above is fictional.

## Validation evidence
Issue author reports unit suites and a staging smoke test passed for this candidate. No candidate-matching supplied JSON test report is included, so these statements do not establish scenario execution.

## Rollout and rollback
Enable the export flag for the pilot accounts. Disable it to roll back; no schema migration.

## Outstanding decisions
Support acknowledgement is pending. Supplied team guidance asks for acknowledgement before this pilot.

The candidate, issue, policy excerpt, and results are fictional. No live CI or deployment was inspected.
