# Restaurant OS — Solution Architecture

**Document ID:** ROS-ARCH-001  
**Status:** Canonical baseline  
**Primary owner:** Technical Lead / Architecture

---

## 1. Architecture objectives

The MVP architecture must:

- preserve order and payment correctness;
- support multi-tenant isolation;
- support real-time kitchen workflows without making WebSocket delivery the system of record;
- support unreliable restaurant networks/devices;
- allow rapid product iteration;
- avoid premature operational complexity;
- preserve module boundaries so high-throughput components can be extracted later.

## 2. Architectural style

### Decision

Deploy Restaurant OS initially as a **modular monolith** with:

- Spring Boot (Java/Kotlin) application boundary;
- PostgreSQL as transactional source of truth;
- Redis for selected caches/ephemeral coordination;
- SQS/EventBridge-style asynchronous messaging;
- object storage for files/artifacts;
- WebSocket/SSE transport for real-time clients;
- local Device Agent for restaurant LAN peripherals;
- provider adapters for payment/SMS/POS/maps integrations.

The exact cloud deployment implementation can evolve through ADRs.

## 3. System context

<!-- code block removed for build stability -->

## 4. Edge and runtime topology

<!-- code block removed for build stability -->

## 5. Domain module boundaries

| Module | Responsibilities | Must not own |
|---|---|---|
| Foundation | Tenant, branch, table, QR, configuration | Payment processing |
| Identity | Customer verification, staff auth, sessions, roles | Menu/order financial logic |
| Menu | Categories, items, modifiers, combos, overrides, availability | Order lifecycle |
| Ordering | Cart validation, order creation, snapshots, order state | Provider-specific payment internals |
| Payments | Provider adapter, intent/reference creation, refunds, reconciliation | Menu resolution |
| Kitchen | Kitchen queue projection, item status, SLA/routing | Payment settlement |
| Devices | Device Agent protocol, command delivery, heartbeat | Order source-of-truth state |
| Admin | Administrative use cases spanning authorized module interfaces | Direct table bypasses |
| Reporting | Operational/read projections and exports | Transaction ownership |
| Delivery | Post-MVP driver/delivery domain | MVP critical path |
| Inventory | Post-MVP ingredients/recipes/stock | MVP manual 86 behavior |

## 6. Internal dependency rule

Modules communicate through:

1. application service interfaces for synchronous in-process calls;
2. domain/application events for asynchronous side effects;
3. read models for cross-cutting reporting.

A module must not become coupled to another module by directly modifying its owned tables.

## 7. Primary order flow

<!-- code block removed for build stability -->

**Invariant:** downstream kitchen/device effects must not be created before durable order state exists.

## 8. Online payment flow

The source files describe both order creation and PaymentIntent flow. The canonical implementation should keep payment state distinct from order preparation state.

<!-- code block removed for build stability -->

## 9. KDS real-time architecture

### Design

- KDS authenticates with branch-scoped staff credentials.
- KDS subscribes to branch events over WebSocket/SSE.
- Real-time transport is an optimization, not source of truth.
- KDS keeps a last-known local snapshot.
- After disconnect, KDS calls the queue/state endpoint to resynchronize.
- Poll fallback may run during prolonged socket failure.

<!-- code block removed for build stability -->

## 10. Device Agent architecture

### Why a local agent

Restaurant printers and peripherals may be reachable only on the LAN, may use vendor/ESC-POS protocols, and may operate during transient cloud connectivity loss. A local agent isolates those concerns.

### Agent responsibilities

- authenticate/register;
- advertise capabilities;
- receive/pull commands;
- persist pending command locally;
- execute against configured device;
- deduplicate command by token;
- acknowledge result;
- send heartbeat;
- retain a bounded processed-token history.

### Cloud responsibilities

- persist business state before command generation;
- route command to correct tenant/branch/agent;
- retry according to policy;
- expose operational status;
- never treat transport retry as permission to duplicate a physical side effect.

## 11. Caching strategy

### Public menu

Use layered cache:

- CDN/edge cache for public effective-menu reads;
- optional Redis cache for effective branch menu;
- client cache with short staleness rules.

Menu mutations emit invalidation for affected branch(es).

### Do not cache as authoritative

- payment settlement state;
- mutable checkout validation;
- live authorization decisions;
- refund balance;
- tenant-security context.

## 12. Multi-tenancy architecture

Primary MVP model:

- shared application;
- shared PostgreSQL cluster/database;
- tenant_id on every tenant-scoped record;
- request tenant context;
- PostgreSQL RLS on tenant-scoped tables;
- server authorization still required in addition to RLS.

RLS is defense in depth, not a substitute for correct authorization.

## 13. Resilience patterns

### Required

- idempotency keys for retried creates;
- webhook dedupe;
- consumer dedupe;
- bounded retries with backoff;
- dead-letter handling for async failure;
- timeouts on external calls;
- circuit-breaking/bulkhead strategy where integration instability warrants it;
- reconcilers for payment and critical async work;
- health/readiness probes.

### Recommended implementation pattern

For transaction + event consistency, use a **transactional outbox** or equivalent commit-safe event publication mechanism before pilot scale if simple direct publication cannot guarantee no lost event after database commit.

This is an industry-standard addition to strengthen the source requirement that events follow durable state.

## 14. Deployment evolution

### MVP

- one deployable API/application;
- one or more worker processes using same domain modules;
- shared DB;
- horizontal scaling behind load balancer.

### Extract only when evidence exists

Candidate future extraction points:

- real-time gateway;
- device command service;
- reporting pipeline;
- payment reconciliation worker;
- high-volume public menu read service.

Extraction requires an ADR with measured reason, data ownership plan, migration path and operational cost.

## 15. Architecture decision records required

- ADR-001 Backend language/framework
- ADR-002 Real-time transport strategy
- ADR-003 Event publication/outbox strategy
- ADR-004 Device Agent transport/protocol
- ADR-005 Payment provider abstraction
- ADR-006 Tenant-context + PostgreSQL RLS implementation
- ADR-007 Platform billing currency
- ADR-008 AI vendor/data/cost policy before AI enablement
