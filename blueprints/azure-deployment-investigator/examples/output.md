# Illustrative deployment investigation

Not a live result.

**Observed:** The deployment failed, and the selected resource metadata lookup returned ResourceNotFound.

**Hypothesis:** Creation might not have completed. The lookup alone cannot establish the underlying cause.

**Limitation:** Trusted inline collection inspected at most 20 deployment operations, optionally one in-scope failed resource, and at most 20 activity events from the last 24 hours before Azure logout and inference. Tool failures or inaccessible evidence must be reported explicitly, not assumed to be ResourceNotFound.

**Next step:** The operator verifies the operation error and resource scope before considering remediation. No Azure resource was modified.
