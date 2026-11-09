# Cost-only comment decision

Read `.github/cost-review/cost-policy.yml` from the entry workflow's trusted
checkout, never from PR head or a comment. All three keys are required: currency
must be a three-letter uppercase code and both limits must be finite,
nonnegative numbers. Invalid/missing/unreadable policy cannot grant approval:
report **Human approval required - cost policy unavailable/invalid**.
Never silently substitute limits from memory or untrusted input.

The limits are maximum **increases** in the combined monthly/annualized cost
of Bicep-affected resources, not maximum total deployment costs or absolute
changes. Use the signed net delta across the same complete component set:
verified savings may offset increases. Annualized delta is monthly delta x 12;
these are two independent limits, so the lower effective limit wins.
Use unrounded intermediate values and compare before display rounding.

- If monthly increase **>** max_monthly_increase **OR** annualized increase
  **>** max_yearly_increase, say **Human approval required - cost limit exceeded**.
- If both are **<=** their limits, say **Cost approved - within configured limits**.
  Equality is within the limit. Verified decreases/zero are within nonnegative
  increase limits; this is not a safety/performance approval.
- If a materially affected billable component or comparison is unquantified,
  incomplete, ambiguous, or in a currency different from the policy, say
  **Human approval required - cost could not be established**. Do not compare
  a partial subtotal as if it were the full change, assume unknowns are zero,
  or invent exchange rates.

Explicit modeling assumptions (such as one instance and 730 hours) may support
a fully quantified **modeled** cost delta; label them. Synthetic evidence,
missing workload justification, or unrelated architecture/business unknowns
do not alone change the cost decision. Unresolved assumptions that prevent a
billable quantity/meter from being established still block cost approval.
Assessment coverage may remain Partial for non-cost questions while the
cost-only decision is within limits. Explain that distinction briefly.

The parent applies this policy after the three stages; FinOps supplies the
complete comparable deltas and Architect checks the monetary evidence.
Do not base this cost decision on `mergeable_state`, branch protection,
workload justification, performance, resilience, or the Architect's general
recommendation. Keep relevant Bicep architecture risks as a separate concise
advisory note, never as the reason for cost escalation.

This decision is **comment-only**. Do not submit a GitHub APPROVE review,
merge, deploy, change checks/labels/protection, or imply this satisfies
repository review requirements. Finish every report with:

`Cost assessment only; no GitHub PR approval was submitted.`
