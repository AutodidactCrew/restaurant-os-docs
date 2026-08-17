# User Stories — Canonical Backlog (Prioritised, Defined, and Mapped)

Purpose: deliver testable user stories for MVP (Features F1–F7). Each story includes: role, goal, definition of done, acceptance criteria, API/data artifacts required, and test notes.

Priority ordering: P1 (must for MVP), P2 (next), P3 (later)

---

Feature mapping reference:
- F1 Ordering, F2 Payments, F3 Menu, F4 KDS, F5 Devices, F6 Tenant/Admin, F7 APIs & Events

P1 Stories (MVP)

US-P1-01 (F1, P1): Guest QR dine-in ordering
- Role: Customer
- Goal: Scan QR, browse menu, build cart, verify mobile at checkout, place order
- DoD: Menu loads, cart modifies, OTP delivered, payment (if pay_online) or order placed (pay_at_counter), order persisted, event published to KDS
- Acceptance:
  - GET /public/menu/:branchId returns within 2s on 3G
  - Cart allows variants/modifiers and validates required modifiers
  - OTP sent and verified (5-min expiry, 3 attempts max)
  - POST /carts/:id/checkout requires Idempotency-Key and returns order id
  - Order visible in KDS and Admin live console within 3s
- Test notes: E2E test with simulated flaky network to validate idempotency

US-P1-02 (F2, P1): Secure checkout with tokenized payments
- Role: Customer
- Goal: Pay securely without platform storing card PAN
- DoD: PaymentIntent created server-side, client collects card, webhook marks order paid
- Acceptance:
  - POST /orders/:id/payments/intent returns PaymentIntent client_secret
  - Webhook /webhooks/stripe validated and deduped by event_id
  - Duplicate POSTs with same Idempotency-Key do not create duplicate payments/orders
- Test notes: Contract tests simulating retry + duplicate webhook

US-P1-03 (F3, P1): Tenant catalog + branch overrides
- Role: Manager
- Goal: Create an item at tenant level and optionally override price/availability per branch
- DoD: menu_item created with nullable branch_id; override row created for branch; public menu resolves correctly
- Acceptance:
  - POST /categories, POST /categories/:id/items succeed
  - GET /public/menu/:branchId shows override price when override exists
- Test notes: API test for effective menu computation

US-P1-04 (F4, P1): KDS receives orders and supports item-level status
- Role: Kitchen staff
- Goal: See new orders, mark items preparing/ready, have ready status reflected to customers
- DoD: WS subscription, status patch on order-items, order_status_history entries
- Acceptance:
  - WS events arrive <3s after order creation
  - PATCH /order-items/:id/status updates order_items.status and pushes event
- Test notes: Real-time integration test using a headless KDS client

US-P1-05 (F5, P1): Reliable printing via device agent
- Role: Cashier
- Goal: Ensure prints happen and are not duplicated during retries
- DoD: Cloud enqueues PrintCommand including print_token; DeviceAgent persists and dedupes token; admin can see device heartbeat
- Acceptance:
  - Order persisted before PrintCommand queued
  - Device agent persists queue across restarts and does not duplicate physical prints on retries
- Test notes: Device agent integration test, simulate network outage

US-P1-06 (F6, P1): Tenant onboarding and staff invite
- Role: Platform operator/Manager
- Goal: Onboard tenant, create branches, invite staff via SMS link
- DoD: POST /platform/tenants creates tenant + initial branch; owner invited gets SMS invite link; staff role assigned
- Acceptance:
  - Tenant created with currency and timezone
  - Owner receives invite with activation link; link exchanges to staff session on first use
- Test notes: End-to-end tenant creation test using mock SMS service

US-P1-07 (F7, P1): Idempotency and webhook dedupe
- Role: Integrator / Engineer
- Goal: Ensure repeat requests and repeated webhooks do not cause double-processing
- DoD: idempotency_keys table and webhook_events table implemented; middleware enforced
- Acceptance:
  - Re-sending POST /carts/:id/checkout with same Idempotency-Key returns same response
  - Replayed Stripe webhook (same event_id) is ignored safely
- Test notes: CI contract tests must validate idempotency behavior

P2 Stories (post-MVP, priority)
- US-P2-01 (F8): Inventory auto-decrement per order and low-stock alerting
- US-P2-02 (F10): Coupon engine and split tender
- US-P2-03 (F9): Driver app and dispatch basic

P3 Stories (enterprise)
- US-P3-01 (F12): Schema-per-tenant option and migration tooling
- US-P3-02 (F11): Advanced exports and scheduled reports

Cross-story acceptance checklist (must be verified before pilot)
- Idempotency tests and webhook dedupe pass in CI
- Postgres RLS policies in place and tested (integration tests simulate cross-tenant access attempts)
- DeviceAgent can persist queued commands locally and dedupe by token
- KDS reconnect and poll fallback implemented; last-known snapshot visible
- Payment reconciliation test: total payments vs refunds constraint enforced

Mapping matrix (story → API / table quick reference)
- US-P1-01 → GET /public/menu/:branchId, POST /carts, carts, cart_items, table_sessions
- US-P1-02 → POST /orders/:id/payments/intent, payments, refunds, webhooks
- US-P1-03 → menu_items, menu_item_overrides, GET /public/menu
- US-P1-04 → WS /ws/branches/:id/kds, order_items, order_status_history
- US-P1-05 → device agent endpoints, PrintCommand queue, device_tokens
- US-P1-06 → POST /platform/tenants, tenants, branches, staff
- US-P1-07 → idempotency_keys, webhook_events

(End of User Stories)
