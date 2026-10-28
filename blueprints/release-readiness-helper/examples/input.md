# Illustrative input — not a live release

Issue #95: Invoice export pilot 1.8.0

## Candidate and scope
Candidate: 0123456789abcdef0123456789abcdef01234567

The candidate enables CSV export for two internal pilot accounts. The workflow requires the exact `Candidate: <40-character SHA>` line; the SHA above is fictional.

## Validation evidence
Issue author reports unit suites and a staging smoke test passed for this candidate. No readable candidate-matching scenario-level results are linked, so these statements do not independently establish scenario execution. Existing readable reports are sufficient; no custom JSON format is necessary.

## Company checklist
- Confirm candidate-matching validation and staging smoke-test evidence.
- Document rollout and rollback.
- Obtain support acknowledgement before this pilot.

## Rollout and rollback
Enable the export flag for the pilot accounts. Disable it to roll back; no schema migration.

## Outstanding decisions
Support acknowledgement is pending. Supplied team guidance asks for acknowledgement before this pilot.

The candidate, issue, checklist, and results are fictional. No live CI or deployment was inspected. Adapt this issue template, replace the candidate, and supply its real number for manual dispatch; there is no sample flag.
