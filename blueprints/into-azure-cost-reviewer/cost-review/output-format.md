# Cost review output format

This file controls the presentation of the consolidated PR comment, not agent
permissions, investigation scope, pricing rules, or publication behavior.
Use the compact, table-first layout below with findings from the three completed
stages. This is the actual PR comment format, not a format for internal handoffs.
Do not paste the agents' full reports or write an essay. Replace bracketed
guidance with evidence-backed content; do not publish placeholders or these notes.

Blueprint users may change headings, language, section order, tables, and
level of detail. Keep the PR identity and full base/head SHAs, assessment
coverage, evidence quality, source/pricing provenance, assumptions, exclusions,
unknowns, stage attribution, disagreements, and human decision boundary available.
Do not hide uncertainty or introduce facts or conclusions absent from the
stage reports. If a customized layout omits required information, include it
inside the collapsed Evidence and calculations section.
The workflow and role contracts take precedence over presentation guidance.

## Brevity rules

- Use one visible heading, one cost table, a decision, one basis/caveat line,
  and a compact **Cheaper options** table. No policy, advisory, or stage-report
  sections.
- Outside tables and collapsed details, use at most 60 words, including the
  disclaimer. Table cells should be short phrases, at most 12 words where
  practical. Put selection details, formulas, and explanations in details.
- Include every materially changed resource; do not meet brevity by omitting
  changes, missing costs, critical unknowns, or conflicting findings.
- Rows must be Azure resources materially affected by `.bicep`/`.bicepparam`
  changes only. Never list `.gitignore`, workflows, docs, or other excluded
  files as resources, even at zero cost. Parameter-file changes map to affected
  resources, not standalone file rows.
- Put a short reason beside every Unquantified amount (for example meter
  unavailable, explicit capacity unresolved, or usage missing); reference its
  detailed error/unknown in the collapsed section. Partial may still contain
  numeric estimates based on prominently disclosed modeling assumptions.
- Show at most three evidence-backed cheaper options outside details. State
  compatibility/performance conditions beside each saving. Do not suggest
  obsolete/unavailable tiers or known-incompatible configurations. Rejected
  candidates and unverified applicability belong in details, not the usable
  options table. If none qualifies, write "No verified cheaper option."
- Put source excerpts, full SHAs, meter provenance, formulas, and the complete
  unknown/resolution trail in one collapsed section, without repeating reports.
- Keep synthetic-input warnings, Partial status, unquantified costs, and any
  blocking disagreement visible, even when supporting details are collapsed.

## Comment layout

For automatic PR reviews, use the cost table below.

## Azure Cost Estimate

**[Complete or Partial]** | [currency] | [repository-configured region(s) or Unknown]

| Region | Resource | Change | Monthly delta ([currency]) | Annualized delta ([currency]) |
|---|---|---|---:|---:|
| [Region or Unknown] | [Resource] | [Before -> after, including quantity] | [Signed amount or Unquantified] | [Signed amount or Unquantified] |

For multiple resources, add one **Quantified subtotal** row with monthly/yearly
signed deltas; label partial coverage. For one resource, do not repeat its
amounts as a separate subtotal. Never imply unknown costs are zero.

**Decision:** [Cost approved - within configured limits / Human approval required -
cost limit exceeded / Human approval required - cost could not be established /
Human approval required - cost policy unavailable/invalid]

Append a short reason on that same decision line, for example "exceeds
$5/month or $100/year limits." Do not repeat amounts already in the table.
No mergeability, workload justification, or architecture as the decision reason.

**Basis:** [Linked price source and date; modeled quantity/hours; prominently
label synthetic/unverified input or missing costs. Keep to one short line.]

Only add a short visible warning for a critical risk or blocking disagreement;
move ordinary advisories and business questions into details.

**Cheaper options**

| Option | Monthly saving ([currency]) | Trade-off / condition |
|---|---:|---|
| [Compatible lower-cost configuration] | [Verified saving vs proposed, with coverage qualifier] | [Short workload/performance condition] |

Show only options for Bicep-affected resources supported by pricing and
compatibility evidence from the completed stages. Unproven workload fitness
may remain an explicit condition; known incompatibility is not a condition
that makes an option usable. If applicability is unverified, keep the candidate
in details. Missing utilization/load-test evidence alone is a workload condition,
not unverified structural applicability: show a compatible, priced prior-SKU
option with that condition rather than suppressing it. If pricing is incomplete, show Unquantified rather than inventing
savings; label component-only savings (for example fixed meter only).
Do not sum mutually exclusive options or deduct potential savings from the
proposed cost/policy verdict. Do not duplicate this table in details.
If none qualifies after documented research, omit the table and use the short
sentence above. If research was skipped/blocked, say "Cheaper-option research
incomplete" instead; do not misrepresent missing research as no cheaper option.

<details>
<summary>Evidence and calculations</summary>

[PR identity and full triggering base/head SHAs.]

[Compact, source-linked evidence attributed to Investigator; pricing/meter
provenance and before/after formulas attributed to FinOps; trade-offs and
disagreements attributed to Architect. Include exact-ref citations/excerpts,
retrieved UTC times, meter IDs, effective dates, rates/units, mapping evidence,
quantities, assumptions, exclusions, alternative-savings formulas, and all
unknown IDs/resolutions. Use concise lists/tables, not the complete stage reports.]

[Include configured cost thresholds, exact comparison against each limit, and
the region's parameter-file/override selection evidence. Include price sources,
formulas, and compatibility evidence for the visible cheaper options. Keep
rejected or unverified candidates separate, with the reason they were excluded;
do not label a priced but incompatible candidate a verified alternative.
Savings require verified comparable prices against the proposed baseline.
Never describe a sampled-region range as a guaranteed cost floor or ceiling.]

</details>

Cost assessment only; no GitHub PR approval was submitted.
