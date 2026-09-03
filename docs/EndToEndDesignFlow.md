---
sidebar_label: "End-to-End Design Flow"
---

# Restaurant OS — End-to-End Design Flow

**Document ID:** ROS-FLOW-001
**Status:** Proposed (companion to ROS-STACK-001; pending ADR-001)
**Owners:** Technical Lead, Backend Lead, Frontend Lead
**Reads with:** `ROS-ARCH-001` (architecture), `ROS-DATA-001` (data and events), `ROS-STACK-001` (tech stack)

---

## 1. How to read this document

This is the single end-to-end picture of Restaurant OS: every entry point, every stage of the critical journey, every exit state, and the concrete technology carrying each step. It expands the flows that `ROS-ARCH-001` sections 7 to 10 describe in prose and binds them to the stack proposed in `ROS-STACK-001`.

The diagrams are layered:

- **Section 3** — actors, entry points and exit states.
- **Section 4** — the whole critical journey on one canvas.
- **Section 5** — the request lifecycle that wraps *every* call.
- **Sections 6 to 13** — one stage each, in depth, with the failure and recovery branches.
- **Section 14** — deployment topology and the pipeline that ships it.

Legend for the stack labels used throughout:

| Shape | Meaning |
|---|---|
| Rectangle | Service, app or process |
| Rounded / stadium | Managed edge or broker |
| Cylinder | Datastore |
| Diamond | Decision or guard |
| Dashed edge | Asynchronous or best-effort path |

---

## 2. Stack touchpoints at a glance

| Stage | Frontend | Backend / worker | Data / infra | External |
|---|---|---|---|---|
| Browse and cart | customer-web (React 19, Vite) | FastAPI `public` router | Valkey cache, PostgreSQL, Cloudflare CDN | — |
| Identity / OTP | customer-web, admin-web | FastAPI `identity`, `SmsProvider` port | Valkey counters, PostgreSQL `otp_verifications` | Twilio / AWS SNS |
| Checkout | customer-web | FastAPI `ordering` + idempotency middleware | PostgreSQL (order, order_items, outbox, idempotency_keys), Valkey lock | — |
| Payment | customer-web (Stripe Payment Element) | FastAPI `payments`, `PaymentProvider` port | PostgreSQL `payments`, `webhook_events` | Stripe |
| Event fan-out | — | Dramatiq worker, outbox drainer | PostgreSQL outbox, RabbitMQ, Valkey Pub/Sub | — |
| KDS real-time | kds-pwa (React, vite-plugin-pwa) | FastAPI SSE endpoint + `kitchen` router | Valkey Pub/Sub, PostgreSQL projection | — |
| Printing | admin-web (reprint control) | FastAPI `devices`, Dramatiq dispatch | PostgreSQL `device_commands`, `device_agents` | Device Agent (python-escpos, SQLite) → printer |
| Settlement / exit | customer-web status view, admin-web | FastAPI `ordering`, `payments`, APScheduler reconcilers | PostgreSQL immutable snapshots, R2 archive | Stripe (refunds) |
| Cross-cutting | all apps | FastAPI middleware chain | Traefik, Cloudflare WAF, OpenTelemetry to SigNoz | — |

---

## 3. Actors, entry points and exit states

```mermaid
flowchart TB
  subgraph ENTRY["Entry points"]
    G["Guest<br/>scans table QR"]
    S["Staff / Cashier<br/>OTP login"]
    K["Kitchen staff<br/>KDS sign-in"]
    P["Platform operator<br/>admin console"]
    DA["Device Agent<br/>boot and register"]
  end

  subgraph APPS["Client surfaces (React 19, Vite)"]
    CW["customer-web<br/>guest ordering SPA"]
    AW["admin-web<br/>owner / manager / platform / cashier"]
    KDS["kds-pwa<br/>installable, offline-tolerant"]
  end

  subgraph CORE["Restaurant OS modular monolith (FastAPI)"]
    API["/api/v1 application/"]
    WRK["Dramatiq workers<br/>+ APScheduler reconcilers"]
  end

  G --> CW --> API
  S --> AW --> API
  P --> AW
  K --> KDS --> API
  DA -->|"register, then long-poll"| API
  API <--> WRK

  subgraph EXIT["Exit states"]
    X1["Order served / picked up<br/>payment settled<br/>financial snapshot frozen"]
    X2["Order cancelled / rejected<br/>compensation applied"]
    X3["Payment refunded<br/>full or partial"]
    X4["Checkout abandoned<br/>cart expires"]
    X5["Customer data exported / erased<br/>F20"]
  end

  API --> X1
  API --> X2
  API --> X3
  CW -.-> X4
  API --> X5
```

Entry is always guest-first (`ROS-PRD-001` ND-04): browsing and cart building need no account. Exit is reached only when the order is in a terminal state *and* payment is reconciled from the provider, never from a client response alone.

---

## 4. The critical journey, end to end

This is the path in `ROS-DEL-001` section 14: `QR to menu to cart to OTP to checkout to payment to order persisted to KDS to preparing to ready`, plus print and settlement. Downstream kitchen and device effects are never created before durable order state exists (`ROS-ARCH-001` section 7 invariant).

```mermaid
flowchart TD
  A["Guest scans QR"] --> B{"QR token valid?<br/>FastAPI public router"}
  B -->|"no"| BX["Reject safely<br/>no sequential IDs leaked"]
  B -->|"yes"| C["Resolve tenant / branch / table<br/>GET /public/qr/token/context"]

  C --> D["Load effective menu<br/>GET /public/menu/branchId"]
  D --> D1{"Cloudflare edge hit?"}
  D1 -->|"yes"| E["Render menu<br/>customer-web"]
  D1 -->|"no"| D2{"Valkey cache hit?"}
  D2 -->|"yes"| E
  D2 -->|"no"| D3["Resolve tenant + branch overrides<br/>SQLAlchemy on PostgreSQL"] --> D4["Warm Valkey + edge"] --> E

  E --> F["Build cart<br/>Zustand persist, POST /carts, Pydantic validation"]
  F --> G{"Checkout flow needs identity?"}
  G -->|"yes"| H["Customer OTP<br/>request + verify, Twilio via SmsProvider"]
  G -->|"no"| I
  H --> I["Checkout<br/>POST /carts/id/checkout + Idempotency-Key"]

  I --> J["Idempotency middleware<br/>Valkey lock + PostgreSQL idempotency_keys"]
  J --> K{"Key seen before?"}
  K -->|"yes, same body"| KR["Return original result"] --> R
  K -->|"yes, different body"| KE["409 IDEMPOTENCY_KEY_REUSED"]
  K -->|"no"| L["One DB transaction:<br/>recalc totals, create order + order_items snapshots,<br/>write outbox row"]
  L --> M["Commit"]

  M --> N{"Branch payment mode"}
  N -->|"pay_at_counter"| P1["Order status: awaiting counter payment"]
  N -->|"pay_online / both"| O["Create PaymentIntent<br/>Stripe via PaymentProvider port"]
  O --> O1["Stripe Payment Element<br/>tokenized, hosted fields"]
  O1 --> O2["Stripe webhook<br/>POST /webhooks/stripe"]
  O2 --> O3["Verify signature, dedupe on webhook_events,<br/>reconcile payment state"]

  M --> Q["Outbox drainer (Dramatiq)<br/>publish order.created.v1"]
  P1 --> Q
  O3 --> Q
  Q --> Q1["RabbitMQ to Valkey Pub/Sub"]
  Q1 --> Q2["SSE push to kds-pwa<br/>p95 under 3s, NFR-002"]
  Q2 --> S["Kitchen progresses items<br/>PATCH /order-items/id/status<br/>pending to preparing to ready"]

  M --> T["Device command created<br/>unique print_token, PostgreSQL device_commands"]
  T --> T1["Dramatiq dispatch"] --> T2["Device Agent pulls<br/>python-escpos, dedupe by token"] --> T3["Physical ticket prints"]

  S --> R["Customer status view<br/>GET /orders/id/status"]
  T3 --> R
  R --> U["Order served / picked up"]
  U --> V["Settlement<br/>immutable financial snapshot, INV-005"]
  V --> W["EXIT: complete"]
  P1 -.->|"counter payment recorded"| O3
```

---

## 5. Cross-cutting request lifecycle

Every authenticated call passes this chain before it reaches domain code. It implements `ROS-SEC-001` sections 3 and 9 and `ROS-PRD-001` NFR-005 and NFR-007.

```mermaid
flowchart LR
  CL["Client app<br/>React + TanStack Query"] --> CF{"Cloudflare<br/>WAF, rate limit, TLS"}
  CF --> TR["Traefik<br/>routing, Let's Encrypt"]
  TR --> UV["Uvicorn worker<br/>under Gunicorn"]
  UV --> M1["asgi-correlation-id<br/>assign X-Request-Id"]
  M1 --> M2["Auth dependency<br/>JWT verify (joserfc)"]
  M2 --> M3["Tenant context dependency<br/>resolve one authorized tenant"]
  M3 --> M4["Open DB transaction<br/>SET LOCAL app.current_tenant"]
  M4 --> M5["Pydantic v2 validation<br/>extra = forbid, enum allow-list"]
  M5 --> M6{"Role + branch scope<br/>authorized?"}
  M6 -->|"no"| E403["403, safe error envelope"]
  M6 -->|"yes"| DOM["Domain module<br/>foundation / identity / menu / ordering /<br/>payments / kitchen / devices / admin / reporting"]
  DOM --> PG[("PostgreSQL 16<br/>RLS enforced")]
  DOM -.->|"spans + metrics"| OT["OpenTelemetry SDK"]
  M1 -.-> OT
  OT -.-> SIG[("SigNoz<br/>traces, metrics, logs")]
  DOM --> RESP["Response<br/>+ structured JSON log (structlog)"]
```

RLS is defense in depth: the `app.current_tenant` setting plus policies on every tenant-scoped table backs up the explicit authorization check, it does not replace it (`ROS-ARCH-001` section 12).

---

## 6. Stage A — Browse and cart

```mermaid
sequenceDiagram
  actor Guest
  participant CW as customer-web (React, Vite)
  participant CDN as Cloudflare CDN
  participant API as FastAPI public router
  participant RED as Valkey
  participant PG as PostgreSQL

  Guest->>CW: scan QR, open link
  CW->>API: GET /public/qr/{token}/context
  API->>PG: resolve tenant, branch, table
  API-->>CW: context (no sequential IDs)
  CW->>CDN: GET /public/menu/{branchId}
  alt edge cache hit
    CDN-->>CW: cached effective menu
  else miss
    CDN->>API: forward
    API->>RED: GET effective-menu:{branchId}
    alt cache hit
      RED-->>API: menu JSON
    else cache miss
      API->>PG: tenant catalogue + branch overrides
      PG-->>API: rows
      API->>RED: SET menu (short TTL)
    end
    API-->>CDN: menu + Cache-Control, stale-while-revalidate
    CDN-->>CW: menu
  end
  CW->>CW: build cart in Zustand (persist to localStorage)
  CW->>API: POST /carts, POST /carts/{id}/items
  API->>API: Pydantic validation, required-modifier rules (FR-003)
  API->>PG: persist cart, cart_items
  API-->>CW: cart summary (server-authoritative)
```

**Recovery:** a menu mutation emits `menu.changed.v1`, which purges the Cloudflare tag and the Valkey key for the affected branch. A stale client that tries to check out an unavailable item is rejected at checkout, not here (FR-002, `ROS-DEL-001` Sprint 3 exit criteria).

---

## 7. Stage B — Identity and OTP

```mermaid
flowchart TD
  A["POST /auth/customer/otp/request"] --> B{"Throttle check<br/>Valkey per-mobile + per-IP counters"}
  B -->|"over limit"| BX["429, resend cooldown active"]
  B -->|"ok"| C["Generate code<br/>Python secrets"]
  C --> D["Hash code<br/>argon2-cffi"]
  D --> E[("PostgreSQL otp_verifications<br/>otp_hash, expires_at, attempt_count")]
  E --> F["SmsProvider port"]
  F --> G{"Environment"}
  G -->|"prod"| H["Twilio / AWS SNS<br/>send SMS"]
  G -->|"dev / CI"| I["Console + fake provider<br/>never logs code in prod (SEC 6)"]

  H --> J["POST /auth/customer/otp/verify"]
  I --> J
  J --> K{"Match, not expired,<br/>attempts left, not consumed?"}
  K -->|"no"| KX["Reject, increment attempt_count"]
  K -->|"yes"| L["Mark consumed_at<br/>issue short-lived customer session (JWT)"]
  L --> M["Proceed to checkout"]
```

Staff identity is the same shape with an access plus refresh pair; the refresh token is stored only as an argon2 hash in `staff_refresh_tokens`, and is rotated and revocable (`ROS-SEC-001` section 4, FR-012).

---

## 8. Stage C — Checkout, idempotency and outbox

The correctness core. The event row is written in the *same* transaction as the order, so no event can exist without durable state and vice versa (`ROS-ARCH-001` section 13, ADR-003).

```mermaid
flowchart TD
  A["POST /carts/{id}/checkout<br/>Idempotency-Key header"] --> B["Normalize tenant + operation + key<br/>hash request body"]
  B --> C{"Acquire Valkey lock<br/>SET NX PX"}
  C -->|"lock held by concurrent request"| CW["Wait / retry-after"]
  C -->|"acquired"| D{"idempotency_keys row exists?"}
  D -->|"yes, same request_hash"| DR["Return stored response (replay)"]
  D -->|"yes, different request_hash"| DE["409 IDEMPOTENCY_KEY_REUSED"]
  D -->|"no"| E["BEGIN transaction<br/>SET LOCAL app.current_tenant"]

  E --> F["Re-validate cart<br/>items active, modifiers valid (FR-003)"]
  F --> G["Recalculate authoritative totals<br/>Decimal / integer minor units (DATA 5.7)"]
  G --> H["INSERT orders + order_items<br/>with name / price / modifier snapshots (INV-006)"]
  H --> I["INSERT order_status_history row"]
  I --> J["INSERT outbox row<br/>order.created.v1 envelope (DATA 10)"]
  J --> K["INSERT idempotency_keys<br/>status + response reference"]
  K --> L["COMMIT"]
  L --> M["Release Valkey lock"]
  M --> N["Return 201 with order resource"]

  L -.->|"after commit"| O["Outbox drainer picks up row<br/>SELECT ... FOR UPDATE SKIP LOCKED"]
```

**Guarantee tested (`ROS-DEL-001` Sprint 4 exit):** a timeout-and-retry storm on one `Idempotency-Key` produces exactly one order; a crash after `COMMIT` but before publish is recovered by the drainer, because the outbox row is already durable.

---

## 9. Stage D — Payment and webhook reconciliation

```mermaid
sequenceDiagram
  participant CW as customer-web
  participant API as FastAPI payments
  participant PP as PaymentProvider port
  participant ST as Stripe
  participant PG as PostgreSQL
  participant REC as APScheduler reconciler

  CW->>API: POST /orders/{id}/payments/intent (Idempotency-Key)
  API->>PP: create_intent(amount, currency, idem key)
  PP->>ST: PaymentIntent.create
  ST-->>PP: client_secret, provider_ref
  PP-->>API: intent
  API->>PG: INSERT payments (status = requires_payment)
  API-->>CW: client_secret
  CW->>ST: confirm via Stripe Payment Element (hosted fields)
  ST-->>CW: result (not trusted as settlement)
  ST->>API: POST /webhooks/stripe (async, signed)
  API->>API: construct_event (verify signature + timestamp)
  API->>PG: INSERT webhook_events (unique provider, event_id)
  alt duplicate event
    PG-->>API: conflict
    API-->>ST: 200 (no-op, dedupe INV-003)
  else new event
    API->>PG: UPDATE payments.status from provider truth
    API->>PG: INSERT outbox payment.updated.v1
    API-->>ST: 200
  end
  loop periodic
    REC->>PG: find payments with ambiguous local status
    REC->>ST: PaymentIntent.retrieve
    REC->>PG: reconcile, flag unresolved for operator (FR-007)
  end
```

Raw card data never reaches the backend (`ROS-SEC-001` section 7). Settlement state comes only from the provider webhook or the reconciler, never from the browser response.

---

## 10. Stage E — Event fan-out and KDS real-time

```mermaid
flowchart TD
  OB[("PostgreSQL outbox")] --> DR["Outbox drainer<br/>Dramatiq, SKIP LOCKED batch"]
  DR --> PUB["Publish to RabbitMQ<br/>topic per event type"]
  PUB --> C1["Consumer: KDS projector"]
  PUB --> C2["Consumer: device dispatcher"]
  PUB --> C3["Consumer: reporting projector"]
  PUB -.->|"exceeds retry policy"| DLQ[["Dead-letter queue<br/>surfaced in SigNoz + alert"]]

  C1 --> PROJ[("PostgreSQL KDS read model")]
  C1 --> BUS["Valkey Pub/Sub<br/>channel branch:{branchId}"]
  BUS --> SSE["FastAPI SSE endpoint<br/>one stream per KDS client"]
  SSE --> KDS["kds-pwa<br/>@microsoft/fetch-event-source"]

  KDS --> D{"Stream healthy?"}
  D -->|"yes"| RENDER["Render queue, prep timers, SLA warnings"]
  D -->|"dropped"| RESYNC["GET /branches/{id}/kds/queue<br/>TanStack Query authoritative refetch"]
  RESYNC --> RENDER
  D -->|"down > threshold"| POLL["Polling fallback<br/>refetchInterval"]
  POLL --> RENDER
  KDS -.->|"service worker"| IDB[("IndexedDB<br/>last-known queue snapshot")]
```

Real-time transport is an optimization, not the system of record (`ROS-ARCH-001` section 9). Duplicate event application is harmless by design; the read model is idempotent on event ID and aggregate version (DATA section 12).

---

## 11. Stage F — Kitchen item progression

```mermaid
stateDiagram-v2
  [*] --> pending: order.created.v1 projected
  pending --> preparing: PATCH status (Kitchen role)
  preparing --> ready: PATCH status (Kitchen role)
  ready --> [*]: item served / bundled into order-ready

  pending --> cancelled: authorized cancel
  preparing --> cancelled: authorized cancel + compensation
  cancelled --> [*]

  pending --> rejected: 86 / stock-out
  rejected --> [*]

  note right of preparing
    Each transition emits
    order-item.status-changed.v1
    -> SSE to KDS, reporting projector
  end note
```

Order preparation status and payment status are separate state machines; a payment webhook must not invent kitchen state (`ROS-PRD-001` section 8).

---

## 12. Stage G — Printing and the Device Agent

```mermaid
sequenceDiagram
  participant API as FastAPI devices
  participant PG as PostgreSQL
  participant MQ as RabbitMQ
  participant AG as Device Agent (Python)
  participant SQ as SQLite (WAL, on-site)
  participant PR as ESC/POS printer

  Note over API,PG: only after order is durably persisted (INV-007)
  API->>PG: INSERT device_commands (unique print_token)
  API->>MQ: device.command-created.v1
  MQ->>AG: deliver (agent long-polls / subscribes)
  AG->>SQ: persist pending command locally
  AG->>SQ: check processed-token history
  alt token already processed
    AG-->>API: ack (idempotent, no reprint)
  else new token
    AG->>PR: render + cut (python-escpos)
    PR-->>AG: ok
    AG->>SQ: record token in bounded history
    AG-->>API: ack result
  end
  loop every heartbeat interval
    AG->>API: heartbeat (last_seen, capabilities, version)
  end
  Note over AG,PR: on cloud outage, AG keeps serving its<br/>local queue and resumes sync on reconnect
```

Cloud retries of the same `print_token` never produce a second physical ticket; the agent dedupes locally (`ROS-ARCH-001` section 10, FR-010).

---

## 13. Stage H — Exit: settlement, refund, data lifecycle

```mermaid
flowchart TD
  A["Order reaches ready + delivered/picked up"] --> B["Order status -> completed"]
  B --> C["Freeze financial snapshot<br/>subtotal, tax, service, tip, total (INV-005)"]
  C --> D["Reporting projections updated<br/>funnel, prep time, payment state"]
  D --> E["EXIT: settled"]

  E --> F{"Refund requested?"}
  F -->|"yes, Manager/Owner"| G["POST /payments/{id}/refunds<br/>Idempotency-Key"]
  G --> H{"amount <= remaining refundable? (INV-004)"}
  H -->|"no"| HX["Reject"]
  H -->|"yes"| I["Stripe refund via PaymentProvider"]
  I --> J["Link provider_ref + local refund record"]
  J --> K["Audit log entry (actor, before/after)"]
  K --> L["EXIT: refunded"]

  E --> M{"Customer data request? (F20)"}
  M -->|"export"| N["Assemble customers/orders/otp records<br/>write to R2, deliver link"]
  M -->|"erasure"| O["Verified deletion across customers,<br/>orders PII, otp_verifications"]
  N --> P["Request + fulfillment audit trail"]
  O --> P
  P --> Q["EXIT: data request closed"]

  A -.->|"never delivered"| R["Cancel + compensation<br/>reverse kitchen work, refund if charged"]
  R --> S["EXIT: cancelled"]
```

---

## 14. Deployment topology and delivery pipeline

```mermaid
flowchart TB
  subgraph DEV["Developer + CI"]
    REPO["Monorepo<br/>Nx + pnpm, uv workspace"]
    GHA["GitHub Actions<br/>nx affected: lint, type, unit,<br/>integration (Testcontainers), contract,<br/>Semgrep + Gitleaks + Trivy + osv-scanner,<br/>alembic upgrade head"]
    REG["ghcr.io<br/>container images"]
    REPO --> GHA --> REG
  end

  subgraph EDGE["Edge"]
    CFA{"Cloudflare<br/>DNS, CDN, WAF, R2"}
  end

  subgraph HOST["VPS (Hetzner / Oracle always-free) — Kamal deploy"]
    TRK["Traefik"]
    APIC["FastAPI API containers<br/>Uvicorn/Gunicorn, N replicas"]
    WRKC["Worker containers<br/>Dramatiq + APScheduler"]
    subgraph DATA["Stateful"]
      PGC[("PostgreSQL 16 + RLS<br/>pgBackRest PITR")]
      REDC[("Valkey<br/>cache, locks, Pub/Sub")]
      MQC[["RabbitMQ"]]
    end
    OBS["SigNoz<br/>OTel collector, dashboards, alerts"]
    FLAGS["Unleash<br/>feature flags"]
  end

  subgraph SITE["Restaurant LAN"]
    AGENT["Device Agent<br/>PyInstaller build, SQLite queue"]
    PRINTER["ESC/POS printers"]
    KDSDEV["KDS tablet<br/>kds-pwa installed"]
  end

  REG -->|"kamal deploy"| APIC
  REG -->|"kamal deploy"| WRKC
  CFA --> TRK --> APIC
  APIC --> PGC
  APIC --> REDC
  APIC --> MQC
  WRKC --> PGC
  WRKC --> MQC
  WRKC --> REDC
  APIC -.-> OBS
  WRKC -.-> OBS
  APIC --> FLAGS
  AGENT <-->|"HTTPS long-poll, ack, heartbeat"| CFA
  AGENT --> PRINTER
  KDSDEV <-->|"SSE + REST"| CFA
  CFA --> R2[("Cloudflare R2<br/>images, exports, webhook archive")]
```

Static frontend bundles (`customer-web`, `admin-web`, `kds-pwa`) build in CI and deploy to Cloudflare Pages / R2 behind the same CDN; only the API and workers run on the host. Extraction of any component (real-time gateway, device service, reporting pipeline) stays a later, evidence-driven ADR (`ROS-ARCH-001` section 14).

---

## 15. Traceability

| Diagram | Canonical source |
|---|---|
| Section 4 critical journey | `ROS-DEL-001` section 14, `ROS-ARCH-001` sections 7 to 8 |
| Section 5 request lifecycle | `ROS-SEC-001` sections 3, 9; `ROS-PRD-001` NFR-005, NFR-007 |
| Section 8 checkout / outbox | `ROS-ARCH-001` section 13; `ROS-DATA-001` sections 9, 13; INV-002 |
| Section 9 payment | `ROS-PRD-001` FR-006, FR-007; `ROS-SEC-001` sections 7, 8 |
| Section 10 KDS real-time | `ROS-ARCH-001` section 9; `ROS-DATA-001` section 12; NFR-002 |
| Section 12 Device Agent | `ROS-ARCH-001` section 10; `ROS-PRD-001` FR-010; INV-007 |
| Section 13 exit states | `ROS-PRD-001` FR-014; INV-004, INV-005; F20 |
| Section 14 topology | `ROS-ARCH-001` section 14; `ROS-DEL-001` sections 13, 16; `ROS-STACK-001` sections 15 to 18 |
