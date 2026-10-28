# Illustrative output — not executed tests

## Summary
Prioritise lock expiry and concurrent-attempt scenarios alongside the author-reported threshold tests.

## Findings
| Proposed scenario | Suggested level | Expected observation | Evidence |
| --- | --- | --- | --- |
| Four failures, then successful sign-in | Unit | Failure count resets; next failure does not lock account | PR behaviour |
| Attempt immediately before and at expiry | Clock-controlled unit | Lock remains before expiry; a new attempt is allowed at expiry | PR expiry rule; supplied guidance |
| Two simultaneous attempts at the threshold | Integration, subject to team conventions | State changes consistently under the chosen concurrency policy | PR known gap |

## Limitations
The concurrency policy needs an owner decision. Threshold results are an author statement, not an independently collected passing check. No test above was generated or run by this report.

## Next steps
Agree the concurrency outcome, implement selected tests, and run the project's established suite.

All sources and numbers are fictional illustrative context.
