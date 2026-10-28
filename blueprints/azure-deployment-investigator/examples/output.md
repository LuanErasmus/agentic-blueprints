# Illustrative deployment investigation

Not a live result.

**Observed:** The deployment failed, and the selected resource metadata lookup returned ResourceNotFound.

**Hypothesis:** Creation might not have completed. The lookup alone cannot establish the underlying cause.

**Limitation:** At most 20 deployment operations and one follow-up diagnostic were inspected.

**Next step:** The operator verifies the operation error and resource scope before considering remediation. No Azure resource was modified.
