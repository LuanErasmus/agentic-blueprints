# Illustrative output — not a live score

## Summary
**AI-assessed advisory index: withheld.** Only scope has supporting assessment evidence; the minimum of three known dimensions is not met. Candidate: `0123456789abcdef0123456789abcdef01234567` (fictional).

## Findings
| Dimension | Assessment | Default weight | Basis |
| --- | --- | --- | --- |
| Scope | 80 (illustrative AI assessment) | 20 | Supplied PR scope and exclusions |
| Execution | Unknown | 30 | Successful check alone is insufficient; no readable candidate-matching scenario results |
| Scenarios | Unknown | 30 | No inspected test source or scenario-level evidence supplied |
| Review | Unknown | 20 | No current review record supplied |

## Limitations
A successful check does not establish scenario execution or complete coverage. Unknown dimensions are not passing results or proven failures. If at least three dimensions were known, the total would use `sum(known score × weight) / 100`, retaining unknown weights in the denominator. Current scenario failures require execution zero, and stale reviews do not establish current review status. The index is not a deterministic validated metric, calibrated correctness probability, bug-free claim, or merge approval.

## Next steps
Link readable existing scenario-level results with the candidate SHA, inspect test source rather than relying on assertions, and supply current review evidence, then rerun with the required PR number. No special JSON schema or configured report path is needed. A maintainer verifies evidence and arithmetic and decides whether to merge.

This fictional example intentionally contains no aggregate number. Copilot assesses dimensions and performs any eligible advisory calculation; there is no deterministic report helper or machine validation. Reports can vary between runs.
