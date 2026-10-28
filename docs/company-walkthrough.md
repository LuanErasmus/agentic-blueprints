# A fictional company's delivery walkthrough

This walkthrough uses a fictional order-cancellation feature. Each blueprint runs independently; the sequence is a learning example, not a required company process or orchestration platform.

1. A business owner opens a cancellation request. **Requirements Gap Investigator** checks ambiguous refund and dispatch rules. The owner resolves the questions and approves the actual requirements.
2. A delivery lead lists related work and explicit dependencies in a tracking issue. **Delivery Risk Investigator** investigates a payment-provider blocker. The lead decides whether to change scope or dates.
3. A tester uses **Test Scenario Planner** on the approved criteria to prepare positive, negative, and boundary scenarios. On a later PR, the same blueprint compares inspected test evidence with changed behaviour.
4. **GitHub PR Review** prepares a company-guidance brief, complementing native review. **PR Confidence Calculator** explains what evidence strengthens or limits confidence; neither approves the PR.
5. A release owner creates a tracking issue with an exact candidate SHA and their checklist. **Release Readiness Helper** reports satisfied, unsatisfied, and unknown items. The owner uses existing company/GitHub approval processes for the release decision.
6. **Stakeholder Release Notes Generator** compares a defined release range and drafts an accessible update. A person verifies availability, confidential details, and wording before sending it.
7. If an Azure deployment fails, **Azure Deployment Investigator** reviews deployment evidence and fixed read-only diagnostics collected before agent inference. An operator evaluates recommendations before any remediation.
8. A later bug report enters **GitHub Issue Triage**, which recommends a category and next step rather than changing the issue automatically.

An agent's report is not an approved requirement, passing test, human sign-off, or proof of deployment. Always hand off original source evidence and the human decision separately from the recommendation.

Read each blueprint's filled-in `examples/input.md` and illustrative `examples/output.md`, then adapt the input into your own issue, PR, or deployment request. They are templates, not executable synthetic dispatches; there is no sample flag. Copy one workflow file, customise it, compile it, and run it with the required real inputs. The collection's credential-free source tests are contributor tooling, not adopter dependencies or live integration verification. See [workflow usage](running-workflows.md).
