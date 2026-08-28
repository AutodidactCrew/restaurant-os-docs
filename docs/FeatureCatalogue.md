# Restaurant OS — Feature Catalogue

**Document ID:** ROS-FEAT-001  
**Status:** Canonical  
**Priority legend:** P1 = MVP, P2 = Growth, P3 = Enterprise/Future

---

## 1. Feature portfolio

| ID | Feature | Priority | MVP status |
|---|---|---:|---|
| F1 | Customer Ordering | P1 | Required |
| F2 | Checkout, Payments & Refunds | P1 | Required |
| F3 | Menu & Catalogue Management | P1 | Required |
| F4 | Kitchen Operations / KDS | P1 | Required |
| F5 | Device Integration & Printing | P1 | Required |
| F6 | Tenant, Branch, Staff & Admin | P1 | Required |
| F7 | Platform API, Events & Reliability Controls | P1 | Required |
| F8 | Inventory & Recipe Management | P2 | Deferred |
| F9 | Delivery & Driver Management | P2 | Deferred |
| F10 | Loyalty, Promotions & Split Tender | P2 | Deferred |
| F11 | Reporting & Analytics | P2 | Deferred beyond baseline operational telemetry |
| F12 | Enterprise Multi-Tenant Capabilities | P3 | Deferred |
| F13 | AI Assistance & Automation | P3 / gated | Requires ADR before activation |
| F14 | Platform Admin Console | P1 | Required — not yet scheduled |
| F15 | Staff Invite & Onboarding Activation | P1 | Required — not yet scheduled |
| F16 | Device Agent Pairing & Setup | P1 | Required — not yet scheduled |
| F17 | Audit Log Viewer | P1 | Required — not yet scheduled |
| F18 | Payment Reconciliation Console | P1 | Required — not yet scheduled |
| F19 | Cashier Live-Tables & Suspicious-Order Flagging | P1 | Required — not yet scheduled |
| F20 | Reservations & Waitlist | P1 | Required — not yet scheduled |
| F21 | Workforce Scheduling & Time Clock | P1 | Required — not yet scheduled |
| F22 | Card-Present / EMV Terminal Integration | P1 | Required — not yet scheduled |
| F23 | Cash Drawer & Till Reconciliation | P1 | Required — not yet scheduled |
| F24 | Alcohol Age Verification | P1 | Required — not yet scheduled |
| F25 | Full-Outage Offline Mode | P1 | Required — not yet scheduled |
| F26 | Customer Data Export & Right-to-Erasure | P1 | Required — not yet scheduled |
| F27 | Delivery Marketplace Integration | P1 | Required — not yet scheduled |
| F28 | Menu Management Admin UI & Bulk Import | P1 | Required — not yet scheduled |
| F29 | Staff Device/Session Management ("My Devices") | P2 | Deferred |
| F30 | QR Sticker Generation & Printing Tool | P2 | Deferred |
| F31 | Operational Reporting Dashboard (UI) | P2 | Deferred |
| F32 | Role/Permission Visibility Console | P2 | Deferred |
| F33 | Refund Management Screen | P2 | Deferred |
| F34 | Device Health/Heartbeat Admin View | P2 | Deferred |
| F35 | Floor Plan & Table/Section Management | P2 | Deferred |
| F36 | Tip Pooling & Distribution | P2 | Deferred |
| F37 | Recipe Costing & Food-Cost Tracking | P2 | Deferred |
| F38 | Accounting/GL Integration | P2 | Deferred |
| F39 | Food Safety & HACCP Recordkeeping | P2 | Deferred |
| F40 | Accessibility (ADA/WCAG) Compliance | P2 | Deferred |
| F41 | Gift Cards & Store Credit | P2 | Deferred |
| F42 | Multi-Currency Per Branch | P2 | Deferred |
| F43 | Labor-Law Compliance Engine | P2 | Deferred |
| F44 | Catering & Advance/Scheduled Orders | P2 | Deferred |
| F45 | Disaster Recovery RTO/RPO Program | P2 | Deferred |

**Note on F14–F28 (P1):** these are marked P1 (required for a genuinely complete product) per the consolidated gap analysis, but none are yet placed into the sprint roadmap in `DeliveryQualityAndOperations.md` — "P1" here means "must exist before this is a full-service product," not "already scheduled." Reconcile against the roadmap before treating these as committed.

---

## 2. F1 — Customer Ordering

**Priority:** P1  
**Primary users:** Customer, Cashier  
**Dependencies:** F3, F6, F7

### Definition

Guest-first mobile-web ordering for dine-in and supported counter/pickup flows. The feature includes QR context resolution, effective menu browsing, cart management, modifiers, dietary/allergen display, special instructions, OTP verification when required, order submission and customer-visible order status.

### MVP capabilities

- QR deep link for tenant/branch/table
- Public effective menu
- Search/filter-ready menu structure
- Item detail
- Modifier selection
- Required/optional modifier validation
- Quantity changes
- Special instructions
- Cart summary
- Tax/service-charge/tip presentation where configured
- OTP verification at checkout
- Online/pay-at-counter choice according to branch policy
- Order confirmation
- Order-status view

### Exclusions

- Customer loyalty wallet
- Stored card vault controlled by Restaurant OS
- Cross-restaurant cart
- Complex scheduled ordering
- Group payment/split tender

### Acceptance outcomes

- menu loads within defined performance target;
- invalid modifier combinations cannot be checked out;
- server recalculates totals;
- retry cannot create duplicate confirmed orders;
- confirmed order reaches KDS target latency.

---

## 3. F2 — Checkout, Payments & Refunds

**Priority:** P1  
**Primary users:** Customer, Cashier, Manager  
**Dependencies:** F1, F6, F7

### Definition

Secure collection and reconciliation of payment without Restaurant OS handling raw PAN data.

### MVP capabilities

- Branch payment mode: `pay_online`, `pay_at_counter`, `both`
- Server-created PaymentIntent/reference
- Provider-hosted/tokenized card element
- Idempotent payment creation
- Signature-verified webhook
- Webhook deduplication
- Payment state reconciliation
- Manager-authorized full/partial refund
- Refund reason capture
- Audit entry

### Core rules

- raw PAN never enters Restaurant OS API;
- external payment success is not trusted solely from client response;
- webhook/provider reconciliation is authoritative for settlement state;
- refund amount cannot exceed remaining refundable amount;
- duplicate webhook processing must be harmless.

---

## 4. F3 — Menu & Catalogue Management

**Priority:** P1  
**Primary users:** Owner, Manager  
**Dependencies:** F6, F7

### Definition

Tenant-level catalogue with branch-level overrides and restaurant-ready item configuration.

### MVP capabilities

- Categories
- Items
- Prices
- Descriptions
- Single primary image
- Dietary flags
- Allergen metadata
- Modifier groups/options
- Required/optional modifier rules
- Combos/bundles
- Tenant default catalogue
- Branch price override
- Branch availability override
- Manual 86 toggle
- Basic availability windows if delivered within sprint capacity
- Cache invalidation on menu changes

### Resolution rule

<!-- code block removed for build stability -->

---

## 5. F4 — Kitchen Operations / KDS

**Priority:** P1  
**Primary users:** Kitchen Staff, Manager  
**Dependencies:** F1, F7

### Definition

Browser-based KDS PWA for receiving and progressing kitchen work in real time.

### MVP capabilities

- Branch-scoped KDS authentication
- New-order event
- Updated-order/item event
- Item-level status
- Visual prep timer
- SLA warning state
- Ready state
- Reconnect banner
- Last-known queue snapshot
- REST resync endpoint after reconnect
- Polling fallback while real-time transport is unavailable

### Reliability requirements

- persisted order is source of truth;
- WebSocket event loss is recoverable through queue resync;
- duplicate event application is harmless;
- branch/tenant scoping is enforced on both connection and message publication.

---

## 6. F5 — Device Integration & Printing

**Priority:** P1  
**Primary users:** Cashier, Kitchen Staff, Manager, Platform Support  
**Dependencies:** F7

### Definition

Reliable command delivery from cloud to local restaurant devices using a Device Agent.

### MVP capabilities

- Device Agent registration
- Agent authentication
- Capability declaration
- Printer mapping
- PrintCommand queue
- Unique `print_token`
- Local durable pending queue
- Deduplication cache/history
- Command acknowledgement
- Heartbeat
- Last-seen/device-health view
- Controlled re-send/reprint action

### Device command lifecycle

<!-- code block removed for build stability -->

---

## 7. F6 — Tenant, Branch, Staff & Admin

**Priority:** P1  
**Primary users:** Owner, Manager, Platform Operator, Support  
**Dependencies:** F7

### Definition

Administrative foundation for multi-tenant operation.

### MVP capabilities

- Tenant creation
- Branch creation/configuration
- Currency/timezone
- Restaurant tables
- QR token generation/activation
- Staff invite
- Staff OTP authentication
- Access/refresh session management
- Fixed-role RBAC
- Session revocation
- Audit logging
- Platform operator onboarding workflow

### MVP roles

- Owner
- Manager
- Cashier
- Kitchen
- Server

Driver is modeled post-MVP.

---

## 8. F7 — Platform API, Events & Reliability Controls

**Priority:** P1  
**Primary users:** Engineering, Integration consumers, all product modules

### Definition

Shared technical capabilities required to make all user-facing features reliable and secure.

### MVP capabilities

- `/api/v1` versioning
- Consistent error envelope
- Request/correlation IDs
- Tenant context propagation
- Idempotency middleware
- Webhook-event deduplication
- Asynchronous event publishing
- WebSocket/SSE real-time transport
- Rate limiting
- CDN rules for public menu
- Audit event hooks
- Contract tests
- Health/readiness endpoints

### Standard error envelope

<!-- code block removed for build stability -->

---

## 9. F8 — Inventory & Recipe Management

**Priority:** P2

### Growth scope

- ingredient/raw-material master
- units of measure
- stock counts
- recipes and yields
- consumption on finalized orders
- stock adjustments
- low-stock alerts
- stock transfers
- wastage

MVP uses manual availability/86 controls instead of automated inventory dependency.

---

## 10. F9 — Delivery & Driver Management

**Priority:** P2

### Growth scope

- driver profile/onboarding
- driver approval
- delivery job
- accept/decline
- pickup/in-transit/arrived/delivered states
- maps/navigation
- ETA
- customer tracking
- proof of delivery
- failed delivery workflow
- optional third-party delivery adapters

---

## 11. F10 — Loyalty, Promotions & Split Tender

**Priority:** P2

### Growth scope

- coupon definitions
- eligibility rules
- promotion evaluation
- loyalty earn/redeem
- customer balance
- split tender
- cash + card composition
- manager override audit

---

## 12. F11 — Reporting & Analytics

**Priority:** P2

### Growth scope

- sales summary
- payment/refund summary
- item/category performance
- staff metrics
- order funnel
- preparation-time metrics
- CSV export
- scheduled reports

Operational observability required to run the MVP is not deferred.

---

## 13. F12 — Enterprise Multi-Tenant Capabilities

**Priority:** P3

### Future scope

- SSO/SAML/OIDC enterprise federation
- franchise ownership hierarchy
- delegated administration
- advanced permissions
- data export/retention controls
- optional schema/database isolation models
- advanced audit search
- enterprise integration contracts

---

## 14. F13 — AI Assistance & Automation

**Priority:** Gated

### Preconditions

AI functionality must not be enabled until an ADR defines:

- vendor/model;
- allowed business use cases;
- tenant data handling;
- prompt/tool boundaries;
- human approval requirements;
- cost budgets;
- usage metering;
- abuse/safety controls;
- logging/retention.

Preferred architectural principle: AI may call constrained application tools/APIs; it must not directly bypass domain authorization or write arbitrary database state.

---

## 15. Full end-to-end scope additions (F14–F45)

**Provenance:** these entries were not in the original catalogue. They were surfaced by a consolidated gap analysis (see `GAP_ANALYSIS.md` at the repo root) built from two independent five-agent review passes over this document set plus the master planning doc — one pass hunting for missing domain features, one pass hunting for backend/API capabilities that have no human-usable screen or tool behind them. Each entry below cites its source row in that file. Definitions and capabilities here are first-draft scope, not yet reviewed/refined the way F1–F13 were — treat as a starting point for planning, not a finished spec.

### 15.1 Operational admin tooling

Every item in this group shares the same shape: the backend/API/schema already exists elsewhere in this catalogue, but no screen or tool was ever designed for a human to actually use it.

**F14 — Platform Admin Console**
Priority: P1 · Source: GAP_ANALYSIS.md #1
Definition: Internal console for the platform operator to manage tenants — list/search tenants, view a tenant detail page (plan, status, branches, usage), and suspend/reactivate.
Capabilities: tenant list + search; tenant detail view; suspend/reactivate action; audit entry on every action; written trial-expiry policy surfaced in the UI.

**F15 — Staff Invite & Onboarding Activation**
Priority: P1 · Source: GAP_ANALYSIS.md #2
Definition: The actual first-login experience for a newly invited staff member.
Capabilities: SMS/link-based invite delivery; one-tap activation on first login; invite expiry handling; resend-invite action for the inviting manager.

**F16 — Device Agent Pairing & Setup**
Priority: P1 · Source: GAP_ANALYSIS.md #3
Definition: The setup flow a restaurant employee follows to install the local Device Agent and pair it to a specific printer.
Capabilities: guided pairing wizard or install script; agent credential issuance; printer-to-agent mapping UI; pairing-success confirmation.

**F17 — Audit Log Viewer**
Priority: P1 · Source: GAP_ANALYSIS.md #4
Definition: Screen for authorized staff/support to browse and search `audit_logs`.
Capabilities: filter by actor, action, entity, date range; before/after state display; export for dispute investigation.

**F18 — Payment Reconciliation Console**
Priority: P1 · Source: GAP_ANALYSIS.md #5
Definition: Fulfills FR-007's "operator can inspect unreconciled payment state" requirement with an actual screen.
Capabilities: list of unreconciled/exception payments; drill-down to provider reference and order; manual resolution/annotation action.

**F19 — Cashier Live-Tables & Suspicious-Order Flagging**
Priority: P1 · Source: GAP_ANALYSIS.md #6
Definition: The QR-replay-fraud control described in the master doc (§3.9) — a live view of open table sessions a cashier can flag if an order appears against a visibly empty table. **Note:** review agents found `orders.flagged_suspicious` is not present anywhere in the current canonical docs — confirm whether this was dropped from scope or just from these documents before treating it as still planned.
Capabilities: live-tables view (session status per table); one-tap "flag suspicious" action; flagged-order review queue for managers; `qr_token` reset action.

**F28 — Menu Management Admin UI & Bulk Import**
Priority: P1 · Source: GAP_ANALYSIS.md #15, #33
Definition: An actual screen for managing the menu catalogue, plus a bulk-import path — today menu items can only be created one at a time via raw API calls.
Capabilities: category/item/modifier CRUD screens; branch-override editor; CSV/POS-export bulk import with validation and diff-preview before committing; import error reporting.

### 15.2 Front-of-house & guest experience

**F20 — Reservations & Waitlist**
Priority: P1 · Source: GAP_ANALYSIS.md #7
Definition: Booking and walk-in waitlist management for full-service and bar concepts, distinct from the QR dine-in flow.
Capabilities: table booking with party size/time; waitlist with quoted wait time; deposit/no-show handling; host-facing seating view.

**F35 — Floor Plan & Table/Section Management**
Priority: P2 · Source: GAP_ANALYSIS.md #22
Definition: A visual floor plan replacing the current flat table list, with server/section assignment.
Capabilities: drag-and-drop floor plan editor; table-status-at-a-glance (open/seated/needs-bussing); section-to-server assignment.

**F44 — Catering & Advance/Scheduled Orders**
Priority: P2 · Source: GAP_ANALYSIS.md #31
Definition: Orders placed ahead of time for a future pickup/service slot, explicitly excluded from F1 today with no deferred-scope placeholder.
Capabilities: scheduled pickup/delivery time selection; kitchen-side advance-order queue separate from live orders; large-order/catering minimums and lead-time rules.

### 15.3 Payments & financial operations

**F22 — Card-Present / EMV Terminal Integration**
Priority: P1 · Source: GAP_ANALYSIS.md #9
Definition: In-person card tap/chip/swipe at the counter — today "pay at counter" has no integrated terminal flow.
Capabilities: EMV terminal pairing per branch/register; tap/chip/swipe transaction flow; terminal receipt printing; reconciliation against `payments`.

**F23 — Cash Drawer & Till Reconciliation**
Priority: P1 · Source: GAP_ANALYSIS.md #10
Definition: End-of-shift cash handling, distinct from card settlement.
Capabilities: opening float entry; cash drop recording; blind-count/EOD close-out; over/short reporting.

**F33 — Refund Management Screen**
Priority: P2 · Source: GAP_ANALYSIS.md #20
Definition: The manager-facing screen behind the existing refund API — currently the spec's only reference to it is the word "UI" with no fields or flow defined.
Capabilities: refund reason-code selection; partial/full refund entry constrained by remaining refundable amount; confirmation and audit entry.

**F36 — Tip Pooling & Distribution**
Priority: P2 · Source: GAP_ANALYSIS.md #23
Definition: Allocation of captured `tip_amount` across staff, and reporting for tax purposes.
Capabilities: pooling rule configuration (even split, role-weighted, etc.); per-staff tip report; export for payroll.

**F37 — Recipe Costing & Food-Cost Tracking**
Priority: P2 · Source: GAP_ANALYSIS.md #24
Definition: Margin/food-cost analysis per menu item, distinct from the already-deferred automated inventory deduction (F8).
Capabilities: ingredient-cost input per recipe; food-cost % per item; margin reporting.

**F38 — Accounting/GL Integration**
Priority: P2 · Source: GAP_ANALYSIS.md #25
Definition: Export or sync to standard accounting software, beyond the generic reporting CSV.
Capabilities: QuickBooks/Xero export or sync adapter; chart-of-accounts mapping per tenant.

**F41 — Gift Cards & Store Credit**
Priority: P2 · Source: GAP_ANALYSIS.md #28
Definition: Purchasable/redeemable gift cards and store credit, absent from scope entirely today.
Capabilities: gift card purchase/issue; balance lookup and redemption at checkout; store-credit issuance on refund as an alternative to cash-back.

**F42 — Multi-Currency Per Branch**
Priority: P2 · Source: GAP_ANALYSIS.md #29
Definition: Currency support at the branch level, not just tenant level — needed the moment a franchise spans countries.
Capabilities: per-branch currency configuration; currency-aware price display and tax calculation; platform billing currency kept separate (per ADR-007).

### 15.4 Workforce management

**F21 — Workforce Scheduling & Time Clock**
Priority: P1 · Source: GAP_ANALYSIS.md #8
Definition: Shift scheduling and attendance tracking — today "staff" is only an identity record, not a scheduled/tracked worker.
Capabilities: shift rota creation; clock-in/out (kiosk or personal device); attendance/lateness report.

**F43 — Labor-Law Compliance Engine**
Priority: P2 · Source: GAP_ANALYSIS.md #30
Definition: Break and overtime threshold tracking/alerting, dependent on F21 existing first.
Capabilities: configurable break/overtime rules per jurisdiction; violation alerting; compliance report for audits.

### 15.5 Compliance & risk

**F24 — Alcohol Age Verification**
Priority: P1 · Source: GAP_ANALYSIS.md #11
Definition: An ID-check step for alcohol items, despite bars being an explicit target segment with no such control today.
Capabilities: age-gate prompt on alcohol items in cart; staff-facing ID-check confirmation step for counter/table service; audit trail of verification.

**F26 — Customer Data Export & Right-to-Erasure**
Priority: P1 · Source: GAP_ANALYSIS.md #13
Definition: GDPR/CCPA-style data subject rights — currently filed under P3 Enterprise, but a baseline legal obligation the moment any tenant has an EU/CA customer, not an upsell tier.
Capabilities: customer-initiated or staff-assisted data export request; verified deletion across `customers`/`orders`/`otp_verifications`; request/fulfillment audit trail.

**F39 — Food Safety & HACCP Recordkeeping**
Priority: P2 · Source: GAP_ANALYSIS.md #26
Definition: Temperature logs and health-inspection documentation, separate from menu-level allergen metadata.
Capabilities: temperature log entry (manual or IoT-fed); inspection checklist records; exportable compliance history.

**F40 — Accessibility (ADA/WCAG) Compliance**
Priority: P2 · Source: GAP_ANALYSIS.md #27
Definition: Accessibility requirements for the public guest-facing ordering page — not mentioned anywhere in the current spec, and real legal exposure, not just UX polish.
Capabilities: WCAG 2.1 AA conformance target for the ordering web app; accessibility testing gate in CI; documented conformance statement.

### 15.6 Reliability, resilience & delivery

**F25 — Full-Outage Offline Mode**
Priority: P1 · Source: GAP_ANALYSIS.md #12
Definition: Resilience for a total loss of internet/cloud connectivity at a branch — today's resilience design (Device Agent, KDS reconnect) only covers printing and the KDS socket, not order-taking or staff auth during a full outage.
Capabilities: locally-cached staff session validity during outage; local order queue with sync-on-reconnect; explicit staff-facing "offline mode" indicator.

**F27 — Delivery Marketplace Integration**
Priority: P1 · Source: GAP_ANALYSIS.md #14
Definition: Adapter-level integration with delivery marketplaces (DoorDash, UberEats, etc.), distinct from the native driver-dispatch model that's the only delivery approach currently planned (F9).
Capabilities: marketplace order ingestion into the same order pipeline; menu sync to marketplace catalogs; marketplace-specific commission/fee tracking.

**F45 — Disaster Recovery RTO/RPO Program**
Priority: P2 · Source: GAP_ANALYSIS.md #32
Definition: Stated, tested recovery-time and recovery-point objectives, rather than a one-time backup/restore pilot checkbox.
Capabilities: documented RTO/RPO targets per environment; recurring (not one-time) restore-drill cadence; drill results tracked over time.

### 15.7 Operational admin tooling (P2)

**F29 — Staff Device/Session Management ("My Devices")**
Priority: P2 · Source: GAP_ANALYSIS.md #16
Definition: Screen behind the existing `GET/DELETE /staff/me/sessions` API.
Capabilities: list of active sessions/devices; self-service or manager-assisted revocation (e.g. lost phone).

**F30 — QR Sticker Generation & Printing Tool**
Priority: P2 · Source: GAP_ANALYSIS.md #17
Definition: A way for staff to actually produce a printable QR sticker/label for a table, beyond the `GET /tables/:id/qr` API resolving one.
Capabilities: printable sticker/label rendering (PDF or direct print); regenerate-on-rotation flow tied to `qr_token`.

**F31 — Operational Reporting Dashboard (UI)**
Priority: P2 · Source: GAP_ANALYSIS.md #18
Definition: A dashboard layer over the existing `GET /branches/:id/reports/*` endpoints — every report today is API-only.
Capabilities: sales/item/staff-performance dashboard views; date-range and period-comparison controls; CSV export button.

**F32 — Role/Permission Visibility Console**
Priority: P2 · Source: GAP_ANALYSIS.md #19
Definition: A screen for owners to see and audit what each fixed role can actually do, and rename role display labels.
Capabilities: read-only permission matrix per role; role display-label editor (per master doc §3.13 — labels are customizable, permission sets are not).

**F34 — Device Health/Heartbeat Admin View**
Priority: P2 · Source: GAP_ANALYSIS.md #21
Definition: Screen behind the Device Agent's heartbeat/last-seen data.
Capabilities: per-device online/offline status; last-seen timestamp; alert configuration for prolonged offline devices.

---

## 16. Feature dependency map

<!-- code block removed for build stability -->
