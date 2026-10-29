# Illustrative output — draft, not published

## Summary
The upcoming invoice export pilot will let account administrators download a CSV of invoices for their own account. Permission messages will explain when access is unavailable.

The pilot is planned for two accounts after release-owner approval; general availability has not been announced. Archived invoices and bulk account exports are not included. The pilot export-size cap still applies.

## Findings
- **Included in derived range:** account-scoped CSV export (linked PR #121) and clearer permission-denial messaging (linked PR #124). Source: fictional range from the commit before #121 landed to the #124 merge commit.
- **Availability unverified:** the issue describes a planned pilot, not a completed deployment. Source: issue #117 availability section.
- **Explicit exclusion:** archived invoices and bulk account export. Source: supplied release context.

## Limitations
No live release, deployment, or customer entitlement was checked. One unrelated commit merged between #121 and #124 is in range but not linked and is not described. This draft reflects only the derived comparison and context, not a complete independently verified release inventory.

## Next steps
The release owner confirms rollout status; the communication owner reviews wording and exclusions before sharing through approved channels.
