---
title: DevOps and Deployment
sidebar_position: 1
---

# DevOps and Deployment

```mermaid
flowchart LR
  Dev[Developer] --> PR[Pull Request]
  PR --> CI[Lint + Test + Security Scan]
  CI --> Build[Container Build]
  Build --> Stage[Staging]
  Stage --> E2E[Integration and E2E Tests]
  E2E --> Approve[Approval]
  Approve --> Prod[Production]
  Prod --> Observe[Metrics, Logs, Traces]
```

## Environment options
- Local: Docker Compose
- CI: GitHub Actions
- Runtime: ECS Fargate initially
- Infrastructure as code: Terraform or AWS CDK
- Observability: CloudWatch plus OpenTelemetry; optional Sentry for client errors
- Deployment: blue/green or rolling with automatic rollback

Production configuration, secrets and tenant data must never be stored in the Git repository.
