# Manual request example

For an authorised manual run on the default branch, both fields are required:

```text
resource_group: example-test-rg
deployment_name: example-deployment
```

Use your own existing resource group/deployment; these are illustrative names, not provisioned resources or synthetic dispatch inputs. There is no sample flag. The subscription and federated identity come from repository variables `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID`, with OIDC Reader access scoped to that resource group.
