# Illustrative input — not a live PR

PR #73: Introduce account lockout

## Change
Five failed attempts lock an account for 15 minutes. A successful sign-in resets the counter.

## Validation
The author reports threshold unit tests passed.

## Known gaps
Lock expiry and simultaneous attempts have not been tested.

## Supporting context
A supplied guidance excerpt prefers clock-controlled unit tests for time-based domain rules.
The sample does not contain a live check run or the complete authentication implementation.

For an issue run, put the same behaviour and acceptance criteria in an issue and use its number. The runner detects the source kind through the issue API.
