# Restaurant OS — Product Strategy & Requirements

**Document ID:** ROS-PRD-001  
**Status:** Canonical  
**Release baseline:** MVP  
**Architecture baseline:** Multi-tenant SaaS, modular monolith  
**Primary owners:** Product Manager, Technical Lead

---

## 1. Executive summary

Restaurant OS is a multi-tenant Restaurant Operating System for dine-in and counter-oriented restaurant workflows. The MVP connects the complete operational path:

**guest discovers menu → builds cart → confirms order → pays according to branch policy → kitchen receives work → staff progresses preparation → devices print reliably → operators administer the restaurant**

The platform must favor correctness and operational resilience over feature breadth. A confirmed order must not be lost, a retry must not create a duplicate charge or duplicate kitchen order, and tenant data must never leak across customers.

## 2. Product vision

Create a restaurant platform that can become the operational system of record for independent restaurants and restaurant groups while remaining simple enough to deploy in a pilot location without requiring an enterprise integration program.

The product should support progressive adoption:

1. QR ordering and menu management
2. Payments and KDS
3. Device/printer integration
4. Staff and cashier operations
5. Inventory, loyalty and reporting
6. Delivery and advanced integrations
7. Enterprise controls and multi-brand/franchise capabilities

## 3. Product principles

| Principle | Requirement |
|---|---|
| Order correctness first | Persist order state before downstream kitchen/device effects |
| Retry-safe by design | Idempotency is mandatory for chargeable and kitchen-facing create operations |
| Guest-first UX | Browsing and cart building do not require a traditional account |
| Branch-aware operation | Price, availability, tax and payment policy resolve at branch level |
| Tenant isolation | Cross-tenant access is prevented at application and database layers |
| Graceful degradation | KDS/device workflows recover from transient network loss |
| Operational visibility | Staff can identify failed payments, disconnected devices and stale KDS clients |
| Build for extraction, not premature distribution | MVP uses modular monolith boundaries that can later be extracted |

## 4. Personas and responsibilities

### 4.1 Customer / Guest

Goals:

- scan a table QR;
- know which restaurant/branch/table is active;
- browse the current menu quickly;
- select variants/modifiers;
- review allergens/dietary indicators;
- provide special instructions;
- verify mobile identity when required;
- choose/complete an allowed payment method;
- know whether the order was accepted;
- see order progress.

### 4.2 Owner

Goals:

- configure restaurant and branch settings;
- manage staff access;
- manage menu/catalog;
- review operational/financial data;
- approve policy-sensitive actions.

### 4.3 Manager

Goals:

- manage menu availability and prices;
- invite/manage staff;
- issue permitted refunds;
- monitor KDS/device health;
- investigate orders and exceptions.

### 4.4 Cashier

Goals:

- create staff-assisted orders;
- accept/record payments;
- find existing orders;
- support customers during checkout;
- reprint only through controlled/idempotent workflows.

### 4.5 Kitchen Staff

Goals:

- see new kitchen work immediately;
- understand item modifications and instructions;
- progress item status;
- identify SLA risk;
- recover after KDS reconnect.

### 4.6 Server

Goals:

- support table sessions;
- assist diners;
- understand table/order state.

Complex table merge/split/transfer is not required for MVP unless explicitly prioritized.

### 4.7 Platform Operator / Support

Goals:

- onboard tenant/branch;
- diagnose tenant issues;
- view service/device health;
- execute approved operational runbooks;
- suspend/reactivate tenants when permitted.

### 4.8 Driver — post-MVP

Driver remains a future domain role for delivery jobs, navigation, status progression and proof of delivery. It is not part of MVP release acceptance.

## 5. MVP product scope

### 5.1 Included

- Tenant/brand/branch setup
- Restaurant table and QR token setup
- Guest mobile web ordering
- Dine-in and counter/pickup order types
- Customer OTP verification at checkout where required
- Menu categories/items/modifiers/combos
- Dietary and allergen metadata
- Tenant catalogue with branch overrides
- Manual item availability / 86 controls
- Cart validation
- Server-side order persistence
- Immutable financial snapshots after settlement
- Online payment using tokenized provider flow
- Pay-at-counter mode
- Refund capability restricted by role
- KDS PWA and item-level status
- Real-time KDS updates
- KDS reconnect/resync fallback
- Device Agent and print command queue
- Idempotent physical print handling
- Staff OTP authentication
- Refresh/session management
- Fixed-role RBAC
- Audit logging for sensitive actions
- Platform onboarding support
- CI/CD, observability and release gates

### 5.2 Explicitly deferred

- Automated ingredient inventory deduction
- Procurement and supplier management
- Loyalty points
- Coupon/promotion rules engine
- Split tender
- Native first-party delivery dispatch
- Route optimization
- Driver live tracking
- Advanced BI/report designer
- SSO/SAML
- Custom permission designer
- Schema/database-per-tenant deployment
- Full AI assistant features

## 6. Functional requirements

### FR-001 — QR context resolution

The platform shall resolve a valid QR token to the tenant, branch and restaurant table context without exposing guessable sequential identifiers.

Acceptance:

- invalid/expired/disabled token is rejected safely;
- active table context is unambiguous;
- branch context is used for menu, tax and payment policy.

### FR-002 — Effective menu retrieval

The platform shall return the effective menu for a branch, combining tenant-level catalogue data with branch overrides.

Acceptance:

- branch price override wins over tenant default;
- branch unavailable state wins over default availability;
- disabled items are not orderable;
- returned menu includes modifiers, dietary/allergen metadata and current availability.

### FR-003 — Cart management

The platform shall support a cart containing items, quantities, modifiers and special instructions.

Acceptance:

- required modifier rules are validated;
- invalid/inactive item is rejected before checkout;
- the server recalculates authoritative amounts at checkout;
- the client cannot override authoritative price/tax totals.

### FR-004 — Customer verification

The platform shall support OTP-based mobile verification for customer checkout when the selected flow requires identity verification.

Acceptance:

- OTP is stored hashed;
- OTP expires;
- failed attempts are limited;
- resend is throttled;
- verification cannot be reused beyond policy.

### FR-005 — Order checkout

Checkout shall create a durable order using server-authoritative pricing and an idempotency key.

Acceptance:

- same tenant + same idempotency key + same request returns original result;
- conflicting request body for an existing key is rejected;
- order is persisted before kitchen/device side effects are issued;
- all financial amounts are snapshotted.

### FR-006 — Payment policy

Each branch shall configure `pay_online`, `pay_at_counter`, or `both`.

Acceptance:

- checkout only offers permitted modes;
- online payment uses provider tokenization;
- raw PAN is never accepted by Restaurant OS backend;
- payment state is reconciled using provider webhook state.

### FR-007 — Payment idempotency and reconciliation

Payment creation and webhook processing shall be retry-safe.

Acceptance:

- payment-creation request supports idempotency;
- external webhook signature is verified;
- webhook event identifier is deduplicated;
- refund total never exceeds captured/settled payment amount;
- operator can inspect unreconciled payment state.

### FR-008 — Kitchen delivery

A confirmed kitchen-facing order shall be delivered to the correct branch KDS.

Acceptance:

- target p95 order-to-KDS visibility under 3 seconds under agreed pilot load;
- event is tenant/branch scoped;
- KDS can resync after connection loss;
- a temporary WS failure does not destroy persisted order state.

### FR-009 — Item-level kitchen status

Kitchen staff shall update individual items through at least:

`pending → preparing → ready`

Rejected/cancelled states shall follow defined authorization and compensation rules.

### FR-010 — Device printing

The platform shall send print commands only after the related order is persisted.

Acceptance:

- every print command contains a unique print token;
- Device Agent persists pending commands;
- repeated delivery of the same token does not repeat the physical print;
- device heartbeat and last-seen state are visible operationally.

### FR-011 — Menu administration

Authorized staff shall create/update categories, items, modifiers, combos, metadata, prices and availability within scope.

Acceptance:

- authorization is enforced server-side;
- menu cache invalidates on effective changes;
- sensitive changes are auditable.

### FR-012 — Staff identity

Staff shall authenticate with OTP and receive role-scoped access/refresh sessions.

Acceptance:

- refresh tokens are persisted as hashes;
- sessions can be revoked;
- permissions are derived server-side;
- branch-limited staff cannot act outside authorized branch scope.

### FR-013 — Tenant onboarding

Platform operators shall create a tenant, initial branch and first owner/manager invitation.

Acceptance:

- onboarding captures timezone and currency;
- initial branch/payment configuration is valid before activation;
- onboarding actions are auditable.

### FR-014 — Refunds

Authorized management staff shall create full or partial refunds against eligible payments.

Acceptance:

- authorization enforced;
- amount constrained by remaining refundable amount;
- provider reference and local refund record are linked;
- action is audited.

### FR-015 — Auditability

Sensitive administrative actions shall create structured audit records containing actor, tenant, action, entity, timestamp and relevant before/after data.

## 7. Non-functional requirements

### NFR-001 — Availability

MVP internal availability target: **99.5%** excluding pre-announced maintenance.

### NFR-002 — KDS latency

Order-created event to KDS visibility: **p95 < 3 seconds** under defined pilot capacity.

### NFR-003 — Menu performance

Public menu should load within **2 seconds on representative 3G conditions**, with CDN/client caching used where safe.

### NFR-004 — Checkout reliability

Target successful platform-side checkout processing: **>99.5% under pilot load**, excluding legitimate bank/provider declines.

### NFR-005 — Tenant isolation

No tenant-scoped query or mutation may return or alter another tenant's data.

### NFR-006 — Idempotency

All kitchen-facing or chargeable create operations that can be retried shall define and test idempotency behavior.

### NFR-007 — Observability

Every server request shall have a request/correlation identifier. Where permitted, logs/traces shall include tenant and branch identifiers.

### NFR-008 — Recovery

KDS and Device Agent shall tolerate temporary network disruption and recover without losing persisted platform state or duplicating side effects.

### NFR-009 — Security

The platform shall use TLS in transit, managed secrets, least privilege, secure session/token handling, dependency scanning and auditable administrative actions.

### NFR-010 — Maintainability

Domain modules shall not bypass module boundaries through direct internal table knowledge when a defined application/domain interface exists.

## 8. Product-level order state model

<!-- code block removed for build stability -->

Payment status and order preparation status are separate state machines. A payment webhook must not directly invent kitchen state.

## 9. Product success metrics

MVP pilot should capture:

- menu view → cart conversion;
- cart → checkout conversion;
- checkout success/failure by reason;
- order-to-KDS latency;
- KDS reconnect frequency;
- preparation-time distribution;
- device heartbeat uptime;
- duplicate-prevention incidents;
- payment reconciliation exceptions;
- failed/abandoned OTP attempts.

## 10. Release sign-off

MVP may enter controlled pilot only when:

- all P1 user stories are accepted;
- automated tenant-isolation tests pass;
- idempotency and duplicate webhook tests pass;
- payment reconciliation is validated in sandbox;
- KDS reconnect/resync path is tested;
- Device Agent offline/restart path is tested;
- critical E2E flow passes;
- severity-1/security-critical release blockers are zero.
