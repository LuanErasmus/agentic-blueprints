# Illustrative input — not a live issue

Issue #42: Export account invoices

## Goal
Account administrators need a CSV export for their current account.

## Acceptance criteria
- Include invoice ID, date, currency, and gross amount.
- Exclude archived invoices and payment card data.

## Open questions
What happens above 10,000 invoices? Which timezone defines the date?

## Supporting context
The supplied CONTRIBUTING.md excerpt asks for measurable acceptance criteria.
No export-size policy or timezone decision is supplied.

The number and references here are fictional. Machine-readable sample data is centralized in `scripts/blueprints/samples.mjs`; this file explains an illustrative scenario rather than live results.
