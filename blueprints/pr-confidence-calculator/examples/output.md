# Illustrative output — not a live score

## Summary
**Confidence index: withheld.** Only scope has supporting scoring evidence; the minimum of three dimensions is not met.

## Findings
| Dimension | Assessment | Default weight | Basis |
| --- | --- | --- | --- |
| Scope | Evidence available | 20 | Supplied PR scope |
| Execution | Unknown (`null`) | 30 | Successful check alone is insufficient; no supplied candidate-matching JSON test report |
| Scenarios | Unknown (`null`) | 30 | No scenario-level evidence supplied |
| Review | Unknown (`null`) | 20 | No review record supplied |

## Limitations
A successful check does not establish scenario execution or complete coverage. Unknown dimensions are not passing results. If the minimum evidence count were met, unknown dimensions would still retain their weight in the denominator. The index is not a probability of correctness, a bug-free claim, or merge approval.

## Next steps
Provide a candidate-matching JSON test report through configured `test_report_paths`, scenario-level evidence, and review context, then rerun. A maintainer still decides whether to merge.

This fictional example intentionally contains no aggregate number. The runner, not the model or this Markdown file, calculates eligible live results.
