# Restaurant OS — Domain, Data, API & Events

**Document ID:** ROS-DATA-001  
**Status:** Canonical contract baseline  
**Owners:** Backend Lead, Technical Lead

---

## 1. Data design principles

- PostgreSQL is the transactional system of record.
- All tenant-scoped rows contain `tenant_id`.
- Foreign-key relationships preserve tenant/branch ownership.
- Financial and item-name/price snapshots protect historical order integrity.
- Mutable catalogue state must not rewrite settled order history.
- Write APIs that may be retried define idempotency.
- Provider webhooks are authenticated and deduplicated.
- Audit records are append-oriented.

## 2. Core domain model

<!-- code block removed for build stability -->

## 3. Canonical entities

### 3.1 Tenancy and location

`tenants`

- id
- slug
- name
- currency
- timezone
- subscription_plan
- status
- created_at
- updated_at

`branches`

- id
- tenant_id
- name
- address
- timezone override if required
- tax configuration
- payment_mode
- status

`restaurant_tables`

- id
- tenant_id
- branch_id
- table_number
- qr_token
- capacity
- status

`table_sessions`

- id
- tenant_id
- branch_id
- table_id
- status
- opened_at
- closed_at

### 3.2 Identity

`customers`

- id
- tenant_id
- mobile
- name nullable
- verified_at

Recommended uniqueness: `(tenant_id, normalized_mobile)`.

`staff`

- id
- tenant_id
- branch_id nullable
- role
- mobile
- status
- last_login_at

`staff_refresh_tokens`

- id
- staff_id
- token_hash
- device_info
- issued_at
- expires_at
- revoked_at

`otp_verifications`

- id
- tenant_id
- normalized_mobile
- purpose
- otp_hash
- attempt_count
- expires_at
- consumed_at

### 3.3 Menu

`categories`

- id
- tenant_id
- branch_id nullable
- name
- sort_order
- status

`menu_items`

- id
- tenant_id
- branch_id nullable
- category_id
- name
- description
- base_price
- image_url
- allergen metadata
- dietary flags
- is_available
- updated_at

`menu_item_overrides`

- id
- tenant_id
- branch_id
- menu_item_id
- price nullable
- is_available nullable

`modifier_groups`

- id
- tenant_id
- menu_item_id
- name
- min_select
- max_select
- required

`modifier_options`

- id
- tenant_id
- modifier_group_id
- name
- price_delta
- is_available

`combo_items` / `combo_components`

Used for explicit bundles/combos. Order lines snapshot the resolved components/prices.

### 3.4 Ordering

`carts`

- id
- tenant_id
- branch_id
- table_session_id nullable
- customer_id nullable
- status
- expires_at

`cart_items`

- id
- cart_id
- menu_item_id/combo_id
- quantity
- selected_modifiers
- special_instructions

`orders`

- id
- tenant_id
- branch_id
- table_session_id nullable
- customer_id nullable
- order_type
- payment_mode
- order_status
- subtotal
- tax_amount
- service_charge
- tip_amount
- total_amount
- notes
- placed_at

`order_items`

- id
- tenant_id
- order_id
- menu_item_id nullable
- combo_item_id nullable
- item_name_snapshot
- unit_price_snapshot
- quantity
- selected_modifiers_snapshot
- special_instructions
- line_total
- kitchen_status

`order_status_history`

- id
- tenant_id
- order_id
- status
- changed_by_staff_id nullable
- changed_at
- metadata

### 3.5 Payments

`payments`

- id
- tenant_id
- order_id
- method
- provider
- provider_ref
- amount
- currency
- status
- paid_at

`refunds`

- id
- tenant_id
- payment_id
- amount
- reason
- provider_ref
- processed_by_staff_id
- status
- created_at

### 3.6 Reliability

`idempotency_keys`

- id
- tenant_id
- key
- operation
- request_hash
- response_status
- response_body
- resource_type
- resource_id
- created_at
- expires_at

Unique: `(tenant_id, operation, key)`.

`webhook_events`

- id
- provider
- event_id
- received_at
- processing_status
- processed_at
- payload_hash

Unique: `(provider, event_id)`.

### 3.7 Device integration

`device_agents`

- id
- tenant_id
- branch_id
- agent_key/id
- status
- capabilities
- last_seen
- version

`device_commands`

- id
- tenant_id
- branch_id
- device_agent_id
- command_type
- command_token
- payload
- status
- attempts
- created_at
- acknowledged_at

Unique command token per command semantic boundary.

### 3.8 Audit

`audit_logs`

- id
- tenant_id
- actor_type
- actor_id
- action
- entity_type
- entity_id
- before_state
- after_state
- request_id
- created_at

## 4. Critical data invariants

### INV-001 Tenant ownership

Every tenant-scoped entity has a valid tenant owner.

### INV-002 Idempotency key uniqueness

Idempotency key is unique within tenant + operation scope.

### INV-003 Webhook uniqueness

Provider webhook event is processed semantically once.

### INV-004 Refund constraint

Total successful/pending-effective refunds cannot exceed eligible captured/settled payment amount.

### INV-005 Financial snapshot immutability

Settled/completed order financial snapshots cannot be modified by later menu changes.

### INV-006 Order item provenance

Order line preserves item name, unit price and selected modifiers as ordered.

### INV-007 Device side effect

A print command must reference a persisted business record and have an idempotent command token.

## 5. API standards

### 5.1 Base path

`/api/v1`

### 5.2 Media type

JSON for transactional APIs unless an integration contract requires another type.

### 5.3 Request headers

Typical:

- `Authorization`
- `Content-Type`
- `X-Request-Id` optional client-provided/canonicalized
- `Idempotency-Key` where required

### 5.4 Error contract

<!-- code block removed for build stability -->

### 5.5 Pagination

For list endpoints, prefer cursor pagination when result order is dynamic/high-volume. Simple bounded administrative lists may use page/size if documented.

### 5.6 Dates

Use ISO-8601 timestamps in UTC over APIs. Use branch timezone only for business presentation/rule evaluation.

### 5.7 Money

Use integer minor units or exact decimal types server-side. Never use binary floating point for authoritative monetary calculations.

## 6. Public/customer API baseline

- `GET /api/v1/public/qr/{token}/context`
- `GET /api/v1/public/menu/{branchId}`
- `POST /api/v1/carts`
- `POST /api/v1/carts/{cartId}/items`
- `PATCH /api/v1/carts/{cartId}/items/{itemId}`
- `DELETE /api/v1/carts/{cartId}/items/{itemId}`
- `POST /api/v1/auth/customer/otp/request`
- `POST /api/v1/auth/customer/otp/verify`
- `POST /api/v1/carts/{cartId}/checkout`
- `GET /api/v1/orders/{orderId}/status`

## 7. Payment API baseline

- `POST /api/v1/orders/{orderId}/payments/intent`
- `GET /api/v1/orders/{orderId}/payments`
- `POST /api/v1/payments/{paymentId}/refunds`
- `POST /api/v1/webhooks/stripe`

Payment/refund create operations require idempotency.

## 8. Staff/admin API baseline

- `POST /api/v1/auth/staff/otp/request`
- `POST /api/v1/auth/staff/otp/verify`
- `GET /api/v1/staff/me`
- `GET /api/v1/staff/me/sessions`
- `DELETE /api/v1/staff/me/sessions/{sessionId}`
- `POST /api/v1/platform/tenants`
- `POST /api/v1/tenants/{tenantId}/branches`
- `POST /api/v1/branches/{branchId}/tables`
- `POST /api/v1/branches/{branchId}/categories`
- `POST /api/v1/categories/{categoryId}/items`
- `PATCH /api/v1/items/{itemId}`
- `PATCH /api/v1/items/{itemId}/availability`
- `GET /api/v1/branches/{branchId}/kds/queue`
- `PATCH /api/v1/order-items/{orderItemId}/status`

## 9. Idempotency contract

### Required on

- checkout/order creation;
- payment creation;
- refund creation;
- device command creation if caller may retry;
- any future kitchen-facing create operation with duplicate side-effect risk.

### Algorithm

1. Normalize tenant + operation + key.
2. Hash relevant request body.
3. If no key record exists, establish ownership of processing.
4. Process business transaction.
5. Persist original status/result reference.
6. Replay with same key + same request returns original result.
7. Same key + different request hash returns `409 IDEMPOTENCY_KEY_REUSED`.

Concurrent requests must not both execute the business action.

## 10. Event envelope

<!-- code block removed for build stability -->

## 11. MVP event catalogue

- `order.created.v1`
- `order.updated.v1`
- `order-item.status-changed.v1`
- `payment.updated.v1`
- `refund.updated.v1`
- `menu.changed.v1`
- `device.command-created.v1`
- `device.heartbeat-missed.v1` as operational event if implemented

## 12. Event delivery semantics

Design consumers for **at-least-once delivery**.

Therefore:

- every message has unique event/command ID;
- consumers record or otherwise dedupe when a duplicate would create an unsafe side effect;
- message ordering must not be assumed globally;
- aggregate version/updated timestamp may be used to reject stale projections;
- poison messages route to dead-letter handling.

## 13. Checkout transaction boundary

<!-- code block removed for build stability -->

## 14. Data retention and privacy

Exact retention periods require business/legal policy. The implementation must make retention configurable and distinguish:

- operational order/payment records;
- PII;
- OTP/security records;
- audit records;
- provider webhook payloads;
- device telemetry.

Do not retain raw sensitive provider data merely because it is available.
