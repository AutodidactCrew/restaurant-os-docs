# Features and Definitions — Canonical (Prioritised + Implementation Notes)

This file is the authoritative feature list. Each feature contains: definition, MVP boundary (what must ship), data and API touchpoints, owner, acceptance criteria, and non-functional requirements.

Priority legend: 1 = MVP, 2 = Growth, 3 = Enterprise

Feature F1 — Ordering (Priority 1)
- Definition: QR/web ordering for dine-in, counter-assisted, pickup; guest-first flow with OTP on checkout; cart, variants, modifiers, dietary/allergen flags, and live order status.
- MVP boundary: QR landing page, GET /public/menu/:branchId, client-side cart, POST /carts, POST /carts/:id/checkout (with OTP verification), order persistence and publish to KDS.
- Data/API: table_sessions, carts, cart_items, orders, order_items, GET /public/menu/:branchId, POST /carts/:id/checkout
- Owner: Product → Customer flows; Backend → Orders
- Acceptance: Menu loads <2s on 3G; cart edits persisted locally; order appears in KDS within 3s of confirmation.

Feature F2 — Checkout & Payments (Priority 1)
- Definition: Secure money collection using tokenized payment providers, support for pay_online / pay_at_counter modes per branch, refunds.
- MVP boundary: Stripe PaymentIntent integration, idempotent checkout, webhook dedupe, refunds by manager role.
- Data/API: payments, refunds, idempotency_keys, POST /orders/:id/payments/intent, POST /webhooks/stripe
- Owner: Backend payments lead
- Acceptance: No duplicated charges in simulated retries; webhooks deduped; refunds recorded and constrained to payment amount.

Feature F3 — Menu Management (Priority 1)
- Definition: Admin UI for categories, items, modifiers, combo items, tenant catalog with branch overrides, time-based availability flags (baseline), allergen/dietary metadata.
- MVP boundary: menu_items template + overrides, modifier groups, single image per item, 86 toggle endpoint.
- Data/API: menu_items, menu_item_overrides, modifier_groups/options, GET/PATCH endpoints, cache invalidation hooks.
- Owner: Backend + Frontend Admin
- Acceptance: Admin can create tenant-level item and add an override for a branch; public menu resolves correctly per branch.

Feature F4 — Kitchen Operations / KDS (Priority 1)
- Definition: Browser PWA showing order queue, station routing, prep timers, item-level status, expediter/ready board.
- MVP boundary: WS events for new orders and status changes, item-level status updates, visual SLA warnings.
- Data/API: order_items.status, order_status_history, WS /ws/branches/:id/kds, GET /branches/:id/kds/queue
- Owner: Devices / KDS engineer
- Acceptance: KDS receives order events <3s; kitchen can mark item ready and customer is notified.

Feature F5 — Device Integration & Printing (Priority 1)
- Definition: Local device agent for printers and peripherals, reliable queued command delivery, idempotent printing, heartbeat monitoring.
- MVP boundary: Cloud → DeviceAgent command queue, idempotent print tokens, device heartbeat + admin view.
- Data/API: device_tokens, device agent API, Device queue worker
- Owner: Device integrations lead
- Acceptance: Orders persisted before print command; agent persists queue and dedupes tokens on reconnect.

Feature F6 — Tenant & Admin (Priority 1)
- Definition: Tenant/brand/restaurant/branch models, role-based access (5 fixed roles), onboarding UI for operators, audit logs.
- MVP boundary: Platform tenant create, branch create, staff invite (SMS link), RBAC enforcement server-side.
- Data/API: tenants, branches, staff, staff_refresh_tokens, audit_logs, POST /platform/tenants
- Owner: Platform + Product
- Acceptance: Support can onboard a tenant within 30 minutes following the runbook.

Feature F7 — API & Events (Priority 1)
- Definition: REST transactional APIs, WS/SSE for KDS, event bus for async, idempotency keys and webhook dedup.
- MVP boundary: Idempotency-key table and middleware, webhook_events dedupe table, event publishing to SQS/EventBridge.
- Owner: Backend architecture
- Acceptance: Contract tests for idempotency and webhook dedupe pass in CI.

Feature F8 — Inventory (Priority 2)
- Definition: Recipe/ingredient model, stock counts, automatic deduction on order placement, low-stock alerts.
- MVP boundary: Manual 86 toggle; automated stock deduction is Phase 2.

Feature F9 — Delivery & Driver Management (Priority 2)
- Definition: Driver onboarding, dispatch, route optimization, live tracking; integrates with third-party delivery APIs.

Feature F10 — Loyalty, Coupons & Split Tender (Priority 2)
- Definition: Coupon engine, loyalty balance, redemption rules; split payment across card + cash.

Feature F11 — Reporting & Analytics (Priority 2)
- Definition: Sales, item performance, staff metrics, exportable CSV, funnel (menu view → cart → order) tracking.

Feature F12 — Multi-tenant Scaling & Enterprise (Priority 3)
- Definition: Option for schema/db-per-tenant, SSO, franchise ownership models, advanced permissioning, data exports.

Cross-feature implementation constraints
- All features must respect tenant_id and RLS.
- All payment and kitchen-facing POSTs must accept and persist Idempotency-Key.
- Public menu must be CDN-cached and invalidated on menu changes.

(End of Features)
