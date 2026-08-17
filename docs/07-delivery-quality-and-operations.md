---
title: Delivery, Quality and Operations
sidebar_position: 8
---

# Delivery, Quality Engineering and Operations

Covers the 12-week MVP roadmap, test strategy, release gates, environments, CI/CD and runbooks.

- CI: GitHub Actions pipeline: lint → unit → contract → integration → build → staging → E2E → manual review → prod
- Environments: local (Docker Compose), staging, production (ECS Fargate)
- Quality gates: no critical security issues, idempotency & webhook dedupe tests pass, RLS tests pass, payment reconciliation validated
- Runbooks: documented for pilot onboarding and incident response

(See docs/final-plan.md for sprint-by-sprint breakdown.)
