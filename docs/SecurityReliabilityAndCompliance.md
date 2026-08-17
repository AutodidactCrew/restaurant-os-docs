# Restaurant OS — Security, Reliability & Compliance

**Document ID:** ROS-SEC-001  
**Status:** Canonical baseline  
**Owners:** Security + Technical Lead + Platform

---

## 1. Security objectives

Restaurant OS must protect:

- tenant isolation;
- customer/staff identity;
- payment workflow integrity;
- order integrity;
- operational devices;
- administrative actions;
- secrets and provider credentials;
- audit evidence.

## 2. Trust boundaries

<!-- code block removed for build stability -->

Each boundary requires authentication/authorization, input validation, timeout/retry policy and observability appropriate to the risk.

## 3. Tenant isolation

### Required controls

1. `tenant_id` on all tenant-scoped rows.
2. Request resolves exactly one authorized tenant context.
3. Service authorization validates role + branch/resource scope.
4. PostgreSQL Row-Level Security protects tenant-scoped tables.
5. Automated negative tests attempt cross-tenant access.
6. Support/platform bypass capabilities, if any, are explicit, privileged and audited.

### RLS concept

The application sets transaction/request tenant context using a safe database session mechanism and RLS policies compare row `tenant_id` to that context.

Do not rely only on a user-supplied tenant header.

## 4. Authentication

### Customer

- guest-first;
- short-lived table/customer session;
- OTP only for flows requiring verification;
- no long-lived privileged customer token.

### Staff

- OTP verification;
- short-lived access token;
- refresh token stored as server-side hash;
- refresh rotation/revocation recommended;
- device/session information retained for session management.

### Device Agent

- unique agent credential or certificate;
- tenant + branch binding;
- rotation/revocation capability;
- least-privilege command channel.

## 5. Authorization

MVP roles:

- Owner
- Manager
- Cashier
- Kitchen
- Server
- Platform Operator/Support outside tenant role model

Authorization must be implemented server-side using explicit permission checks.

Example:

| Action | Owner | Manager | Cashier | Kitchen | Server |
|---|---:|---:|---:|---:|---:|
| Edit menu | Yes | Yes | No | No | No |
| Refund | Yes | Yes | No* | No | No |
| Create assisted order | Yes | Yes | Yes | No | Optional |
| Update kitchen item status | Yes | Yes | No | Yes | No |
| Manage staff | Yes | Yes | No | No | No |
| View device health | Yes | Yes | Limited | Limited | No |

`*` Any future cashier refund permission must be a deliberate policy change.

## 6. OTP controls

- cryptographically secure code generation;
- hash at rest;
- short expiration;
- attempt limit;
- resend cooldown;
- per-mobile + per-IP/edge throttling;
- no OTP value in logs;
- purpose binding;
- consumed/replayed OTP rejected.

## 7. Payment security / PCI posture

The source design requires provider tokenization so Restaurant OS backend never handles raw PAN.

Required:

- provider-hosted/SDK card collection;
- TLS;
- no PAN/CVV logging;
- signed webhook verification;
- minimum provider secret permissions;
- separate test/live credentials;
- secrets manager;
- payment reconciliation.

This design reduces PCI scope but does not by itself constitute a formal PCI compliance determination.

## 8. Webhook security

For each webhook:

1. read provider-required raw/request form safely;
2. validate signature/timestamp according to provider contract;
3. reject invalid signature;
4. persist provider event identifier;
5. dedupe;
6. process idempotently;
7. record result;
8. return provider-appropriate success/retry status;
9. support operational replay tooling without bypassing dedupe semantics.

## 9. API security

- TLS only
- WAF/edge filtering
- rate limits
- request size limits
- strict JSON/schema validation
- allow-list enum values
- safe error responses
- no stack traces in client payloads
- no mass-assignment from arbitrary JSON to persistence entities
- authorization before resource mutation
- SSRF-safe handling of external URLs
- file upload restrictions if/when introduced

## 10. Secret management

Secrets shall not be stored in:

- Git repository;
- frontend bundles;
- plain-text environment files committed to source;
- logs;
- tickets/documents.

Use managed secret storage and role-based workload access.

## 11. Encryption

- TLS in transit.
- Managed encryption at rest for database/object storage.
- Field-level or application envelope encryption for higher-risk PII where required.
- Driver license data, when F9 is implemented, requires stronger sensitivity handling.
- Key rotation and access policy must be documented.

## 12. Audit logging

Audit at minimum:

- tenant/branch creation/config change;
- staff invite/role change/session revocation;
- menu price/availability sensitive change;
- refund;
- manual reprint/re-send;
- support impersonation/bypass if ever supported;
- security policy changes.

Audit logs should be append-oriented and protected from ordinary tenant mutation.

## 13. Reliability objectives

| Area | Target / requirement |
|---|---|
| Platform availability | 99.5% internal MVP target |
| Order-to-KDS | p95 under 3 seconds under pilot capacity |
| Tenant isolation | zero known cross-tenant leaks |
| Payment retry | no duplicate charge caused by platform retry |
| Printing retry | no duplicate physical print for same print token |
| KDS reconnect | state resynchronizes from source of truth |

## 14. Reliability patterns

### Retry

Retry only transient failures. Use bounded exponential backoff + jitter.

### Timeout

Every external dependency call has an explicit timeout.

### Circuit breaking

Apply to unstable integrations when repeated failures would exhaust application capacity.

### Idempotency

Required wherever retry may duplicate a business side effect.

### Dead-letter queue

Failed asynchronous messages exceeding retry policy are routed to a DLQ and surfaced operationally.

### Reconciliation

Scheduled/operational reconciliation should detect:

- payment intent with ambiguous local status;
- webhook processing failure;
- stuck device command;
- stale KDS/device connection;
- order event projection mismatch where applicable.

## 15. Observability

### Logs

Structured JSON with:

- timestamp
- severity
- service/module
- request_id/correlation_id
- tenant_id when permitted
- branch_id when permitted
- operation/event type
- error code

Do not log secrets, OTPs, PAN/CVV, full tokens or unnecessary PII.

### Metrics

Minimum:

- HTTP request rate/error/latency
- checkout rate/success/failure
- payment provider errors
- webhook receive/failure/dedupe
- order-to-KDS latency
- active/disconnected KDS clients
- device heartbeat age
- command queue depth/retry/DLQ
- DB connection pool
- queue age
- cache hit ratio for public menu

### Tracing

Use OpenTelemetry or equivalent across API → DB/external integration → async publish/consume where practical.

## 16. Alerting

Pilot alerts should cover:

- elevated checkout failure;
- payment webhook failure spike;
- payment reconciliation backlog;
- KDS disconnect spike by branch;
- missing Device Agent heartbeat;
- device command DLQ growth;
- database resource saturation;
- cross-tenant security test regression in CI.

## 17. Incident severity baseline

### SEV-1

- confirmed cross-tenant data exposure;
- widespread inability to place confirmed orders;
- incorrect duplicate charging at scale;
- major security compromise.

### SEV-2

- branch/region KDS outage with workaround;
- payment integration materially degraded;
- multiple Device Agents unable to receive work.

### SEV-3

- localized non-critical feature impairment.

## 18. Required runbooks

- Payment provider incident
- Webhook replay/reconciliation
- KDS real-time outage
- Device Agent offline
- Printer command stuck/DLQ
- Database failover/recovery
- Redis degradation
- Queue backlog
- Tenant-isolation/security incident
- Rollback after bad deployment

## 19. Security release gates

Production release blocked when:

- critical/high exploitable security finding unresolved;
- tenant-isolation integration tests fail;
- authorization regression found in P1 path;
- payment webhook signature/dedupe tests fail;
- secrets scan detects active secret;
- dependency policy blocks a known critical issue without approved exception.

## 20. Compliance notes

The source documents establish a desired PCI-reduced architecture and PII protection controls. They do not establish formal legal/compliance certification.

Before commercial launch, business owners should separately establish applicable:

- PCI DSS responsibilities;
- privacy notice/consent requirements;
- retention/deletion policy;
- breach response obligations;
- accessibility requirements;
- state/country-specific tax and receipt requirements.
