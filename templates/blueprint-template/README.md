# [Blueprint Name]

**Difficulty:** [beginner / intermediate / advanced]

## Blueprint Metadata

Create a `blueprint.yml` alongside this README. Start from the metadata example in [`blueprint.yml`](blueprint.yml) and update every value to match your implementation.

## Problem

[Describe the real-world problem this blueprint addresses and who encounters it.]

## What the Agent Does

[Describe the agent's responsibilities, inputs, outputs, and actions it can take.]

## Architecture

```text
[Trigger or goal]
        ↓
[Observe and gather context]
        ↓
[Reason and choose a bounded step]
        ↓
[Act or recommend]
        ↓
[Evaluate result / human decision]
```

## Prerequisites

- [List accounts, permissions, tools, and services needed.]

## Setup

1. [Explain configuration and credentials using safe storage.]
2. [Explain any required permissions and how to scope them.]

## Run It

[Give exact steps to trigger the blueprint and inspect its result.]

## How It Works

[Explain the important implementation decisions, data flow, and limitations.]

## Guardrails

- **Access:** [What information and services can the agent access?]
- **Actions:** [What can it do?]
- **Cannot do:** [What is outside its permissions or scope?]
- **Approval:** [What requires human approval?]
- **Never automatic:** [What must it never do automatically?]
- **Credentials:** [What credentials or permissions are required, and how are they stored?]
- **Data handling:** [What information is sent to a model or stored in logs?]

## Customise It

[Explain how to adapt the example without weakening its safety boundaries.]

## Challenge

[Give the reader one small, safe extension to try.]
