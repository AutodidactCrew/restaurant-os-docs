---
title: Security, Reliability and Compliance
sidebar_position: 7
---

# Security, Reliability and Compliance

- Authentication: OAuth2/OIDC for staff, OTP-based short sessions for customers
- Authorization: fixed RBAC roles for MVP; server-side enforcement
- Tenant isolation: Postgres RLS keyed on tenant_id
- PCI: Do not store PANs; use tokenized provider (Stripe)
- Encryption: PII encrypted at rest; secrets via central secret manager
- Observability: OpenTelemetry traces, structured logs, alerts for critical failures
- Runbooks for payment incidents, KDS outage, device offline, webhook replay
