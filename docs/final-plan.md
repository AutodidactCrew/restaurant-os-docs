# Restaurant OS — Detailed Plan & Design

This document is the canonical engineering and delivery plan for launching Restaurant OS MVP and sequencing growth and enterprise work. It synthesises all docs under /docs/, including restaurant-master.md, product requirements, architecture, data & API, device integrations, DevOps, security, QA and AI. This is the fixed plan — owners and engineers must implement to these specifications unless formally updating an ADR.

Table of contents
- Executive summary
- High-level architecture and flows (mermaid diagrams)
- Data model and critical tables (DDL-like summary)
- API surface & contracts (summary + critical invariants)
- Detailed module design and implementation notes
- Device & KDS flows
- Security, tenancy, and compliance controls
- CI/CD, infra, release, and runbook commitments
- Test strategy and acceptance criteria
- Roadmap, milestones, and sprint-level tasks
- Risks, mitigations, and open decisions (owner-assigned)

Executive summary
Restaurant OS is a multi-tenant SaaS platform delivering QR/web ordering, menu management, KDS, payments and admin. Launch as a modular monolith to reduce operational complexity and speed iteration. Deliver MVP (Ordering, Menu, Payments, KDS, Devices, Admin) in a 12-week program with pilot rollout immediately after.

High-level architecture (final)

```mermaid
flowchart LR
  subgraph Clients
    C1[Customer Mobile Web]
    KDS[KDS PWA]
    Admin[Admin UI]
    StaffApp[Staff Native]
  end
  CDN[CDN + WAF] --> Edge[Ingress + Auth Proxy]
  Edge --> API[Modular Monolith API (Spring Boot)]
  API -->|REST/GraphQL| DB[(Postgres w/ RLS)]
  API --> Cache[(Redis)]
  API --> Queue[(SQS/EventBridge)]
  API --> Files[(S3)]
  API --> Ext[Payments (Stripe), SMS, POS adapters]
  KDS --> WS[WebSocket / SSE (via API)]
  DeviceAgent[Local Device Agent] <--> API
  API --> DeviceAgent
  Clients --> CDN
```

Key flows
- Order submission: customer → POST /carts/:id/checkout (idempotency header) → create order row (snapshots) → publish event → KDS via WebSocket → device print commands queued.
- Payment flow: API asks Stripe for PaymentIntent (server creates intent), client collects card via Stripe Element, server verifies webhook event, marks payment. Idempotency and webhook dedupe required.

Data model summary (critical tables and invariants)
- Tenancy: tenants(id, slug, currency, timezone, subscription_plan)
- Branches: branches(id, tenant_id, address, tax_rate, payment_mode)
- Tables & sessions: restaurant_tables(id, branch_id, qr_token, capacity), table_sessions(id, branch_id, table_id, status)
- Identity: staff(id, tenant_id, branch_id, role), customers(id, tenant_id, mobile), staff_refresh_tokens(...), otp_verifications(...)
- Menu: menu_items(id, tenant_id, branch_id nullable), menu_item_overrides(menu_item_id, branch_id), modifier_groups/options, combo_items/components
- Orders: carts, cart_items, orders (snapshots: subtotal, tax_amount, service_charge, tip_amount, total_amount), order_items (status per item)
- Payments: payments(order_id, amount, provider, provider_ref), refunds(payment_id, amount)
- Platform: idempotency_keys(key unique per tenant), webhook_events(event_id unique per provider), audit_logs

Critical invariants (must be enforced by DB or at application layer):
- tenant_id on every tenant-scoped row
- idempotency_keys unique constraint (tenant, key)
- webhook_events.event_id unique
- refunds total <= payments.total for an order
- order financial snapshots immutable after settlement

API surface & contracts (summary)
- Public: GET /public/menu/:branchId (cache TTL and CDN), POST /carts, POST /carts/:id/checkout (requires Idempotency-Key), WS /ws/branches/:id/kds
- Staff: POST /auth/staff/otp/request, POST /auth/staff/otp/verify, GET /staff/me, GET /staff/me/sessions
- Platform: POST /platform/tenants, POST /tenants/:id/branches
- Payment webhooks: POST /webhooks/stripe (dedupe by event_id)

API contract rules (strict):
- Error shape: { error: { code, message, details } }
- Idempotency: Any POST that creates a kitchen-facing or chargeable resource must accept Idempotency-Key header. Server must persist key and original response and return same response for repeated key.
- Auth: Customer session token scoped to table_session_id; staff JWTs with roles and refresh tokens persisted.
- Rate limiting: per-tenant and per-IP; CDN-level protection for public menu endpoint.

Detailed module design and implementation notes
- Foundation/tenancy: implement tenant middleware that sets session variable in DB (e.g., SET app.tenant_id) at request start. Add Postgres RLS policies to enforce tenant isolation.
- Identity: two auth subsystems (customer short-lived session by table_session; staff JWT + refresh). OTPs stored hashed, with attempts and expiry. Staff refresh tokens mapped to device_info for session management.
- Menu: tenant-catalog-with-overrides. Implement branch resolution: if override exists, use it; else use tenant template. Cache GET /public/menu per branch and invalidate on menu changes.
- Orders: table_sessions as primary grouping. carts customer_id nullable. orders.table_session_id required for dine-in; allow null for takeaway/delivery. order_items.status independent of order.status.
- Payments: payment provider adapter layer. Store payments.provider_ref; reconcile via webhooks. Enforce refunds limit via DB constraint or transactional check.
- KDS: WS subscriptions scoped by branch; server publishes events to relevant subscribers. KDS PWA should maintain last-known snapshot and show reconnect banner; poll fallback every 5–10s while disconnected.
- Devices: local Device Agent handles printers. Device Agent must persist a small command queue, acknowledge commands with idempotent print tokens. Cloud sends commands only after order persisted.

Device & KDS flows (detailed)
- Print flow:
  1. Order created and persisted with idempotency key.
  2. API enqueues PrintCommand(order_id, device_id, print_token) to Queue.
  3. Worker dequeues and sends to DeviceAgent via persistent channel or via agent pull.
  4. DeviceAgent applies de-dup: if print_token seen, skip.
  5. DeviceAgent stores last N commands and heartbeat timestamp.
- KDS real-time flow:
  - KDS opens WS connection with branch-scoped JWT.
  - Server sends OrderCreated/OrderUpdated events (item-level statuses) to subscribed sockets.
  - Reconnect: KDS resyncs by calling GET /branches/:id/kds/queue to fetch missed events.

Security, tenancy, and compliance controls (details)
- Postgres RLS: create policy FOR SELECT/INSERT/UPDATE/DELETE ON tenant tables USING (tenant_id = current_setting('app.tenant_id')::uuid)
- Encrypt PII: mobile numbers and names encrypted at column level (e.g., pgcrypto) or via application-layer envelope encryption.
- PCI: Use Stripe Elements on client; server never handles raw PANs.
- Webhook security: validate provider signatures and dedupe via webhook_events.event_id unique index.
- Audit: audit_logs table with before/after states for sensitive actions.

CI/CD, infra, release, and runbook commitments
- Repo: trunk-based development, PR protection rules, GH Actions pipeline: lint → unit → test → contract test → build → push image → deploy to staging → integration/E2E → manual approve → deploy to prod.
- Infra: Terraform modules for ECS/Fargate, RDS Postgres with replicas, ElastiCache Redis, SQS, S3.
- Observability: OpenTelemetry traces, structured logs (JSON) routed to CloudWatch/ELK, Sentry for web clients.
- Runbooks: include runbook for Payment failure, Webhook replay, KDS outage, Printer offline, Postgres failover.

Test strategy and acceptance criteria (detailed)
- Unit tests: domain logic (order totals, tax calc, idempotency behavior)
- Contract tests: payments, POS adapter, webhook semantics
- Integration tests: Postgres, Redis, Queue (use testcontainers or equivalent) for full-stack flows
- E2E tests: critical journeys — QR order -> checkout -> KDS -> mark ready -> customer notified
- Load tests: simulate peak X orders/min and KDS fan-out (target to be defined with pilot)
- Release gates: no critical security findings, tenant-isolation tests pass, idempotency tests pass, payment reconciliation verified

Roadmap & 12-week sprint plan (expanded)
Sprint 0 (Week 0): Foundation
- Choose backend stack and frameworks (Spring Boot + Kotlin/Java final). Document in ADR.
- CI infra, dev environments, Sentry, Terraform skeleton, staging account.
- Seed tenant/branch/table migrations (include qr_token column).

Sprint 1 (Week 1–2): Tenancy & QR
- Implement tenants/branches/tables APIs, QR token resolution, table_sessions model.
- GET /public/menu/:branchId caching stubs and CDN rules.
- Migration: add idempotency_keys table skeleton.

Sprint 2 (Week 3–4): Staff identity & Admin shell
- Staff OTP auth, staff_refresh_tokens, sessions endpoints, staff UI skeleton (login, dashboard shell).
- Staff session management endpoints (GET/DELETE /staff/me/sessions).

Sprint 3 (Week 5–6): Menu core
- Menu CRUD, tenant catalog + overrides, modifier groups, combos.
- Admin UI for menu, availability toggle endpoint.
- Hook menu change invalidation for public menu cache.

Sprint 4 (Week 7–8): Customer ordering end-to-end
- Cart, cart_items, POST /carts/:id/checkout with idempotency_keys enforcement.
- Customer OTP verify flow at checkout.
- Order persistence, order snapshot, order_status_history.

Sprint 5 (Week 9): KDS & Real-time
- WS /ws/branches/:id/kds, GET /branches/:id/kds/queue and reconnect strategy.
- KDS PWA: basic queue, item ready/prepare toggles.

Sprint 6 (Week 10): Payments integration
- Stripe PaymentIntent flows, webhook handler with webhook_events dedupe.
- Payment reconciliation tests and refunds flow.

Sprint 7 (Week 11): Cashier ops & device printing
- Cashier manual orders, refund UI, integrate DeviceAgent command queue and print flows.
- Device heartbeat monitoring and admin sessions for device recovery.

Sprint 8 (Week 12): Hardening & Pilot
- Load tests, security scans, device certification, documentation, onboarding playbook, pilot rollout for 2 restaurants.

Post-pilot (Weeks 13+): iterate on pilot feedback; schedule Phase 2 features (inventory, delivery, loyalty)

Ownership and deliverables (assigned)
- Product: PM — acceptance criteria and pilot orchestration
- Architecture: Tech lead — ADRs, DB RLS policy definitions
- Backend: Engineer A,B — tenancy, auth, menu, orders
- Payments: Engineer C — Stripe integration, webhooks
- Devices/KDS: Engineer D — KDS and DeviceAgent
- DevOps: Platform — infra, CI, observability
- QA: build automated E2E and load tests

Risks, mitigations
- Duplicate charges: idempotency and webhook dedupe; pre-flight contract tests before pilot
- KDS outage: WS reconnect + poll fallback + last-known snapshot UI
- Device offline: local agent with persistent queue and idempotent tokens
- Cross-tenant leaks: Postgres RLS + contract tests + security code reviews

Open decisions requiring owner input (deliverable: ADRs)
- Confirm backend language/framework (Sprint 0 action) — recommended: Spring Boot (Java/Kotlin)
- Confirm AI vendor and cost caps before enabling AI features (tie tenant_ai_usage to plan)
- Billing currency for platform invoices vs tenant operating currency
- Platform Admin: full web app vs Retool for MVP (recommend build small internal app)

Appendices
- Appendix A: Full API endpoint list (see docs/05-data-and-api)
- Appendix B: Full schema canonical file (docs/backend/database-schema.md)
- Appendix C: Runbooks location (/ops/runbooks)

(End of Detailed Plan)
