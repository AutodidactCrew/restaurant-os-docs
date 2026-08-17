# Restaurant OS — User Stories & Acceptance Criteria

**Document ID:** ROS-BACKLOG-001  
**Status:** Canonical MVP backlog  
**Priority:** P1 stories are required for MVP pilot sign-off

---

## 1. Story format

Every story contains:

- story ID;
- feature mapping;
- actor;
- user outcome;
- preconditions;
- primary flow;
- alternate/error flows;
- acceptance criteria;
- data/API touchpoints;
- automated test expectation.

---

# Epic A — Customer Ordering (F1)

## US-P1-001 — Resolve QR dining context

**As a** customer  
**I want** a table QR to open the correct restaurant, branch and table context  
**So that** I can order without manually selecting my location.

### Preconditions

- tenant and branch active;
- table active;
- QR token active.

### Primary flow

1. Customer scans QR.
2. Web app resolves token.
3. API validates tenant/branch/table.
4. Platform attaches to an active table session or creates one according to policy.
5. Customer receives effective menu context.

### Acceptance criteria

- Given a valid QR, when resolved, then correct tenant/branch/table context is returned.
- Given a disabled token, when resolved, then no tenant data is leaked and a safe invalid-link response is shown.
- The URL/token must not require exposing a predictable internal table database ID.
- Context resolution is tenant-safe.

### Test automation

- API integration tests for valid/disabled/malformed tokens.
- Cross-tenant token test.

---

## US-P1-002 — Browse effective branch menu

**As a** customer  
**I want** to see the menu currently sold at this branch  
**So that** I only order items that are valid here.

### Acceptance criteria

- branch price override is displayed when present;
- branch availability override is respected;
- unavailable item cannot be added to a new cart;
- dietary/allergen metadata is displayed when configured;
- public menu response meets target performance under representative cached conditions.

### API/data

- `GET /api/v1/public/menu/{branchId}`
- menu categories/items/modifiers/overrides

---

## US-P1-003 — Configure an item with modifiers

**As a** customer  
**I want** to select required and optional modifiers  
**So that** the restaurant receives my intended item configuration.

### Acceptance criteria

- required modifier group prevents add/checkout when incomplete;
- max/min selections are validated server-side;
- selected modifier names/prices are snapshotted into the order line;
- invalid or unavailable modifier is rejected at checkout.

---

## US-P1-004 — Build and edit cart

**As a** customer  
**I want** to add, edit, remove and change quantities  
**So that** I can review the complete order before submission.

### Acceptance criteria

- cart contains item quantity and selections;
- client may cache cart locally, but server remains authoritative at checkout;
- server recalculates effective prices/tax/fees;
- stale item state produces actionable validation response.

---

## US-P1-005 — Verify mobile at checkout

**As a** customer  
**I want** to verify my mobile using OTP when required  
**So that** the restaurant can associate the checkout with a verified contact.

### Acceptance criteria

- OTP has configured expiration;
- OTP hash, not plaintext, is persisted;
- failed attempts are limited;
- resend is rate-limited;
- successful verification creates a scoped customer/table-session proof.

---

## US-P1-006 — Submit a dine-in order idempotently

**As a** customer  
**I want** a retry-safe checkout  
**So that** network retries do not create duplicate orders.

### Acceptance criteria

- checkout requires `Idempotency-Key`;
- first valid request creates one order;
- identical replay returns the original semantic result;
- reused key with materially different request payload returns conflict;
- order financial values are snapshotted;
- OrderCreated is published only after persistence.

### Test automation

Simulate:
- client timeout after server commit;
- client retries same request;
- assert exactly one order exists.

---

## US-P1-007 — View order progress

**As a** customer  
**I want** to see whether my order is confirmed/preparing/ready  
**So that** I know what is happening after checkout.

### Acceptance criteria

- customer can only access order(s) within authorized session/customer context;
- kitchen progress updates are reflected;
- transient real-time failure does not cause incorrect status.

---

# Epic B — Payments & Refunds (F2)

## US-P1-008 — Pay online securely

**As a** customer  
**I want** to pay by card using a secure provider flow  
**So that** Restaurant OS does not store my raw card details.

### Primary flow

1. Server creates provider PaymentIntent/payment reference.
2. Client uses provider SDK/element.
3. Provider processes card data.
4. Provider sends signed webhook.
5. Restaurant OS deduplicates webhook and updates payment state.

### Acceptance criteria

- raw PAN does not enter Restaurant OS backend;
- payment create endpoint is idempotent;
- webhook signature is verified;
- payment status is not considered settled solely from client callback;
- duplicate provider event is processed at most once semantically.

---

## US-P1-009 — Place pay-at-counter order

**As a** customer  
**I want** to submit an order when branch policy allows pay-at-counter  
**So that** I can pay staff later.

### Acceptance criteria

- option appears only for eligible branch;
- order records selected payment mode;
- cashier can identify amount due;
- no online PaymentIntent is created unnecessarily.

---

## US-P1-010 — Issue manager refund

**As a** manager  
**I want** to refund an eligible payment  
**So that** customer payment corrections are controlled and auditable.

### Acceptance criteria

- cashier without permission is denied;
- refund cannot exceed remaining refundable amount;
- provider refund reference is persisted;
- audit log records actor, reason and amount;
- duplicate/retried refund request does not double-refund.

---

## US-P1-011 — Reconcile provider webhook

**As a** platform  
**I want** provider webhooks to be deduplicated and reconciled  
**So that** payment state remains correct despite delivery retries.

### Acceptance criteria

- unique provider/event identifier persisted;
- duplicate event is safe no-op/returns success after prior processing;
- signature failure is rejected and logged;
- processing failures are retryable without duplicate settlement effects.

---

# Epic C — Menu Administration (F3)

## US-P1-012 — Create tenant-level menu item

**As a** manager  
**I want** to create a reusable catalogue item  
**So that** multiple branches can inherit it.

### Acceptance criteria

- item belongs to exactly one tenant;
- item has category, name, base price and availability;
- optional dietary/allergen metadata supported;
- unauthorized branch/tenant actor is rejected.

---

## US-P1-013 — Configure modifiers

**As a** manager  
**I want** to define modifier groups and options  
**So that** customers can customize items consistently.

### Acceptance criteria

- min/max selection constraints supported;
- options can add price;
- inactive modifier cannot be newly selected;
- effective menu includes resolved modifier rules.

---

## US-P1-014 — Override branch price/availability

**As a** manager  
**I want** a branch to override tenant defaults  
**So that** local pricing and availability are supported.

### Acceptance criteria

- branch override applies only to that branch;
- other branches retain tenant default;
- cache invalidates after effective change;
- public menu reflects change.

---

## US-P1-015 — 86 an item immediately

**As a** manager  
**I want** to mark an item unavailable  
**So that** customers stop ordering it when sold out.

### Acceptance criteria

- operation is authorized;
- public menu changes quickly after invalidation;
- checkout still revalidates item availability to protect against stale client cache.

---

# Epic D — Kitchen / KDS (F4)

## US-P1-016 — Receive new order on KDS

**As a** kitchen staff member  
**I want** confirmed orders to appear automatically  
**So that** preparation can start without manual refresh.

### Acceptance criteria

- KDS connection is branch scoped;
- target p95 visibility <3 seconds under agreed pilot load;
- event contains enough information to render item names, modifiers and instructions;
- another branch cannot subscribe/read the order.

---

## US-P1-017 — Progress item status

**As a** kitchen staff member  
**I want** to mark individual items preparing and ready  
**So that** multi-item orders can progress independently.

### Acceptance criteria

- legal state transition enforced;
- actor/branch authorization enforced;
- order/item history recorded;
- update is propagated to relevant clients.

---

## US-P1-018 — Recover KDS after network loss

**As a** kitchen staff member  
**I want** the KDS to recover missed state after reconnect  
**So that** no kitchen work is lost.

### Acceptance criteria

- stale/reconnecting state is visible;
- last-known queue remains visible where safe;
- reconnect triggers `GET /branches/{id}/kds/queue` or equivalent resync;
- missed events are reconciled from source-of-truth state;
- optional polling fallback operates while socket unavailable.

---

# Epic E — Devices & Printing (F5)

## US-P1-019 — Register Device Agent

**As a** manager/platform operator  
**I want** to associate a local Device Agent with a branch  
**So that** the cloud can route device commands securely.

### Acceptance criteria

- agent identity is authenticated;
- agent is tenant/branch scoped;
- capabilities are persisted;
- last-seen state is visible.

---

## US-P1-020 — Print kitchen/receipt ticket exactly once per print token

**As a** cashier/kitchen operator  
**I want** retries to avoid duplicate physical prints  
**So that** staff do not prepare duplicate work.

### Acceptance criteria

- order persisted before PrintCommand creation;
- command includes `print_token`;
- Device Agent persists command before execution;
- processed tokens survive agent restart according to retention policy;
- redelivery of processed token does not reprint.

---

## US-P1-021 — Recover offline Device Agent

**As a** manager  
**I want** pending commands to resume after connectivity returns  
**So that** temporary internet loss is recoverable.

### Acceptance criteria

- cloud retains/retries pending command according to policy;
- agent resumes durable local pending work;
- acknowledged commands are not re-executed;
- operator sees offline/online transition.

---

# Epic F — Tenant, Staff & Admin (F6)

## US-P1-022 — Onboard tenant and initial branch

**As a** platform operator  
**I want** to create a tenant and initial branch  
**So that** a restaurant can begin configuration.

### Acceptance criteria

- tenant captures name, slug, currency, timezone;
- branch captures address/config/tax/payment mode;
- action audited;
- initial state prevents public ordering before required setup is complete.

---

## US-P1-023 — Invite first owner/manager

**As a** platform operator  
**I want** to invite the restaurant owner/manager  
**So that** the tenant can self-administer.

### Acceptance criteria

- invite is tenant scoped;
- invite expires;
- invite cannot be reused after activation;
- activation establishes staff identity/role.

---

## US-P1-024 — Authenticate staff via OTP

**As a** staff member  
**I want** to sign in using my verified mobile  
**So that** I can access authorized restaurant operations.

### Acceptance criteria

- OTP controls match customer OTP security requirements;
- access token is short-lived;
- refresh token is persisted hashed;
- revoked session cannot refresh.

---

## US-P1-025 — Enforce role and branch authorization

**As an** owner  
**I want** staff permissions enforced  
**So that** staff only perform authorized actions.

### Acceptance criteria

- authorization is server-side;
- UI hiding alone is never considered access control;
- kitchen role cannot issue refund;
- branch-limited staff cannot mutate another branch;
- tenant boundary always enforced.

---

## US-P1-026 — Revoke staff session

**As a** manager/owner  
**I want** to revoke a staff device session  
**So that** lost/shared devices can be removed.

### Acceptance criteria

- session list available to authorized actor;
- revocation invalidates refresh capability;
- audit entry recorded.

---

# Epic G — Platform Reliability & API (F7)

## US-P1-027 — Standardize API errors

**As an** API consumer  
**I want** consistent error responses  
**So that** clients can handle failure predictably.

### Acceptance criteria

- error contains stable machine code;
- safe human message;
- optional structured details;
- validation errors do not expose stack traces/secrets.

---

## US-P1-028 — Enforce tenant context

**As a** platform  
**I want** every tenant-scoped request bound to one tenant context  
**So that** accidental cross-tenant access is prevented.

### Acceptance criteria

- tenant context derived from authenticated/resolved request;
- database RLS or equivalent policy applied;
- negative integration tests attempt cross-tenant reads and writes;
- all tests pass before release.

---

## US-P1-029 — Publish domain events safely

**As a** platform module  
**I want** asynchronous events after committed state changes  
**So that** KDS/devices/integrations receive reliable signals.

### Acceptance criteria

- event contains event ID, type, occurredAt, tenant/branch scope and aggregate ID;
- consumer is idempotent;
- event publication does not occur before source state is committed;
- failed consumer does not corrupt source transaction.

---

## US-P1-030 — Rate-limit abuse-prone endpoints

**As a** platform operator  
**I want** public/OTP endpoints protected by rate limits  
**So that** abuse does not destabilize the service or create uncontrolled messaging cost.

### Acceptance criteria

- OTP request and verification have stricter controls;
- public menu/CDN uses appropriate edge protection;
- limits return stable API error code;
- operational metrics expose throttling volume.

---

# P2 backlog — Growth

# Epic H — Inventory & Recipe Management (F8)

## US-P2-001 — Maintain ingredient inventory

**As a** manager  
**I want** to maintain ingredients, units and on-hand quantities  
**So that** the system can represent restaurant stock.

### Acceptance criteria

- ingredient is tenant scoped;
- branch stock is distinguishable where inventory is branch managed;
- quantity uses defined unit of measure;
- adjustments require reason and actor;
- inventory mutation is auditable.

---

## US-P2-002 — Define recipes and yields

**As a** manager  
**I want** menu items to reference ingredient usage  
**So that** stock consumption can be calculated consistently.

### Acceptance criteria

- recipe component references ingredient and quantity;
- yield/conversion is explicit;
- editing a recipe does not rewrite historical order inventory movements;
- invalid unit conversion is rejected.

---

## US-P2-003 — Deduct inventory from finalized orders

**As a** manager  
**I want** eligible orders to deduct recipe inventory  
**So that** stock approximates operational consumption.

### Acceptance criteria

- deduction occurs exactly once for the defined order lifecycle event;
- duplicate order event does not double-decrement;
- cancelled/refunded order follows documented reversal policy;
- inventory movement references source order.

---

## US-P2-004 — Receive low-stock alert

**As a** manager  
**I want** to be notified when stock reaches configured threshold  
**So that** I can replenish before an item becomes unavailable.

### Acceptance criteria

- threshold configurable by branch/item;
- duplicate alert noise is controlled;
- alert links to current stock context;
- alert does not silently 86 an item unless an explicit automation policy exists.

---

# Epic I — Delivery & Driver Management (F9)

## US-P2-005 — Onboard and approve driver

**As a** manager  
**I want** to onboard a driver and approve required profile information  
**So that** only authorized drivers receive delivery jobs.

### Acceptance criteria

- driver profile tenant scoped;
- vehicle/license fields supported according to business policy;
- sensitive license value is encrypted;
- account cannot accept jobs before approval;
- approval action audited.

---

## US-P2-006 — Assign delivery job

**As a** dispatcher/platform  
**I want** an eligible delivery order assigned to an available driver  
**So that** delivery work has a clear owner.

### Acceptance criteria

- job references order and branch;
- only available/approved driver is eligible;
- assignment is concurrency-safe;
- reassignment preserves assignment history.

---

## US-P2-007 — Accept or decline delivery

**As a** driver  
**I want** to accept or decline an offered job  
**So that** dispatch knows whether I will complete it.

### Acceptance criteria

- offer expiration is defined;
- only offered driver can accept;
- acceptance is atomic;
- declined/expired job becomes eligible for reassignment.

---

## US-P2-008 — Progress delivery lifecycle

**As a** driver  
**I want** to mark pickup, in-transit, arrived and delivered  
**So that** restaurant and customer can follow progress.

### Acceptance criteria

- legal state transitions enforced;
- timestamps recorded;
- customer-visible state excludes internal sensitive details;
- offline update/retry is idempotent.

---

## US-P2-009 — Capture proof of delivery

**As a** driver  
**I want** to capture allowed proof of delivery  
**So that** completion can be evidenced.

### Acceptance criteria

- artifact linked to delivery;
- access is tenant/customer scoped;
- retention policy applies;
- failed upload can retry without creating multiple completion events.

---

## US-P2-010 — Handle failed delivery

**As a** dispatcher/manager  
**I want** a failed-delivery workflow  
**So that** the order can be reassigned, returned, retried or refunded according to policy.

### Acceptance criteria

- failure reason captured;
- attempt count/history retained;
- compensation path is explicit;
- refund is not automatic unless policy allows and payment rules are satisfied.

---

# Epic J — Loyalty, Promotions & Split Tender (F10)

## US-P2-011 — Create coupon/promotion rule

**As a** manager  
**I want** to configure a promotion  
**So that** eligible orders receive the intended discount.

### Acceptance criteria

- effective dates supported;
- eligibility scope supported;
- discount cap/limit supported;
- invalid conflicting rule configuration is rejected;
- evaluation result is snapshotted on order.

---

## US-P2-012 — Redeem coupon safely

**As a** customer  
**I want** to apply an eligible coupon  
**So that** my order receives the advertised discount.

### Acceptance criteria

- eligibility recalculated server-side;
- usage limit enforced atomically;
- retry does not consume coupon twice;
- order records applied rule/version and discount amount.

---

## US-P2-013 — Earn and redeem loyalty

**As a** customer  
**I want** to earn and redeem loyalty value  
**So that** repeat purchases are rewarded.

### Acceptance criteria

- loyalty ledger is append-oriented;
- earn/redemption is linked to business transaction;
- duplicate event cannot double-award;
- reversal policy defined for refund/cancellation;
- balance is derived/reconciled from ledger.

---

## US-P2-014 — Split payment

**As a** cashier/customer  
**I want** an order paid by more than one tender  
**So that** card/cash combinations are supported.

### Acceptance criteria

- sum of successful tenders cannot exceed payable amount without explicit tip/adjustment rule;
- outstanding amount is visible;
- each payment retains independent provider/method state;
- refund allocation policy is defined.

---

# Epic K — Reporting & Analytics (F11)

## US-P2-015 — View sales summary

**As an** owner/manager  
**I want** sales totals for a branch/date range  
**So that** I can understand business performance.

### Acceptance criteria

- timezone used correctly;
- refunds are represented consistently;
- totals reconcile to transaction source;
- role/tenant/branch scope enforced.

---

## US-P2-016 — View item performance

**As a** manager  
**I want** item/category sales and preparation metrics  
**So that** I can optimize menu and operations.

### Acceptance criteria

- item identity uses historical snapshot-aware reporting rules;
- cancelled/rejected items are distinguishable;
- date/branch filters supported;
- metric definitions documented.

---

## US-P2-017 — Export CSV

**As an** authorized operator  
**I want** to export supported report data  
**So that** I can perform external analysis.

### Acceptance criteria

- export respects active filters and authorization;
- large exports use asynchronous generation if needed;
- exported sensitive fields are minimized;
- audit/telemetry records export operation where required.

---

# P3 backlog — Enterprise & AI

# Epic L — Enterprise Multi-Tenant Capabilities (F12)

## US-P3-001 — Enterprise SSO

**As an** enterprise tenant administrator  
**I want** staff to authenticate using approved identity federation  
**So that** corporate identity policy is enforced.

### Acceptance criteria

- tenant-specific identity configuration;
- account linking policy defined;
- role mapping controlled;
- break-glass/admin recovery procedure exists;
- audit records authentication/config changes.

---

## US-P3-002 — Franchise hierarchy

**As a** franchise administrator  
**I want** organization/brand/region/branch hierarchy  
**So that** administration and reporting reflect ownership structure.

### Acceptance criteria

- hierarchy does not weaken tenant isolation;
- delegated scope is explicit;
- aggregate reporting respects hierarchy permissions;
- branch-level local configuration remains supported.

---

## US-P3-003 — Advanced permission model

**As an** enterprise administrator  
**I want** delegated permissions beyond fixed MVP roles  
**So that** access mirrors organizational responsibility.

### Acceptance criteria

- deny-by-default;
- permission changes audited;
- privilege escalation tests included;
- fixed-role migration path defined.

---

## US-P3-004 — Stronger tenant deployment isolation

**As a** platform architect  
**I want** selected tenants deployable with schema/database-level isolation  
**So that** contractual or scale requirements can be met.

### Acceptance criteria

- tenant routing is explicit;
- migration tooling supports topology;
- backup/restore boundaries documented;
- no feature behavior depends on deployment topology.

---

# Epic M — AI Assistance & Automation (F13)

## US-P3-005 — Operator AI assistant

**As a** manager  
**I want** an assistant that can answer operational questions using authorized restaurant data  
**So that** I can act faster without learning every screen.

### Preconditions

- AI ADR approved;
- model/vendor approved;
- tool permissions defined;
- tenant cost limits configured.

### Acceptance criteria

- assistant accesses data only through authorized tools/APIs;
- assistant cannot bypass role/tenant policy;
- consequential mutations require explicit user confirmation or bounded policy;
- model/tool usage is metered;
- sensitive data handling follows approved retention policy;
- unsupported questions are not fabricated as facts.

---

## US-P3-006 — AI-assisted menu insight

**As a** manager  
**I want** AI-generated menu observations based on authorized analytics  
**So that** I can identify possible optimization opportunities.

### Acceptance criteria

- insight clearly distinguishes observed metrics from generated recommendation;
- recommendation does not silently change menu/pricing;
- source metrics/time range shown;
- cost/usage recorded.

---

## 2. MVP traceability matrix

| Story | Feature | Principal API/domain |
|---|---|---|
| US-P1-001 | F1/F6 | QR token, table session |
| US-P1-002 | F1/F3 | Public menu |
| US-P1-003 | F1/F3 | Modifiers |
| US-P1-004 | F1 | Cart |
| US-P1-005 | F1/F6 | Customer OTP |
| US-P1-006 | F1/F7 | Checkout, idempotency, order |
| US-P1-007 | F1/F4 | Order status |
| US-P1-008–011 | F2/F7 | Payments, refunds, webhooks |
| US-P1-012–015 | F3 | Menu/catalogue |
| US-P1-016–018 | F4/F7 | KDS, real-time, resync |
| US-P1-019–021 | F5/F7 | Device Agent, print command |
| US-P1-022–026 | F6 | Tenant/staff/RBAC |
| US-P1-027–030 | F7 | API standards, tenancy, events, rate limits |

## 3. Cross-story Definition of Done

A P1 story is not Done until:

- functional acceptance criteria pass;
- authorization is tested;
- tenant-scope behavior is tested where applicable;
- API contract is documented;
- database migration is reviewed where applicable;
- observability exists for important failure modes;
- automated test is included at the appropriate layer;
- no critical security finding remains;
- relevant documentation is updated.
