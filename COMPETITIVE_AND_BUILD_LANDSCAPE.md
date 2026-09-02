# What the Restaurant Ordering Market Actually Looks Like Right Now

**Status:** Working reference (not a canonical doc)
**Prepared:** 25 Aug 2026
**Scope:** Dine-in QR ordering + AI ordering + backend/frontend stack
**Method:** Three parallel web-research passes
**For:** Restaurant OS spec review

---

## A note on reliability before you read this

Two research corrections surfaced mid-pass: **Bbot was acquired by DoorDash**, not Olo — they are competing ordering stacks, not the same company. And a candidate competitor initially flagged as "DAKI" turned out to be an unrelated Brazilian grocery-delivery app, not a table-ordering product — it's been dropped.

Beyond that: a good portion of vendor "feature" claims below come from the vendors' own marketing pages, not independent audits, and one specific claim (Toast's multi-tenant "noisy neighbor" issue, Section C) is anecdotal and could not be traced to a primary source — it's marked inline. Treat pricing figures as directional; they move.

---

## Reading it in thirty seconds

**Commoditized — Table-stakes ordering is a solved, crowded problem.**
Scan → order → pay, shared tabs, split billing, KDS routing, Tap-to-Pay, basic loyalty — Toast, GoTab, Square, me&u, SpotOn and Zuppler all ship every one of these today. None of this differentiates a new entrant; all of it is required to not lose on day one.

**Open wound — Pricing trust, not features, is where incumbents keep losing.**
Toast, Popmenu, GoTab and Otter all draw active complaints about keyed processing rates, undisclosed add-on fees, and surprise billing. A flat, published price is a real trust differentiator here — arguably a bigger lever than any feature.

**Where AI money is going — Voice and staff-copilot AI, not table-side AI.**
Presto, ConverseNow and SoundHound are racing on phone/drive-thru voice; Toast IQ and Square's assistant are racing on staff-side insight. Almost nobody is building AI *inside* the browsing/ordering flow at the table itself.

**Real, not novel — Live-data grounding for AI is directionally where leaders are heading, quietly.**
SoundHound+Deliverect and ConverseNow+Deliverect already route orders through live menu systems rather than model memory. It's not an invention — but almost no table-side competitor documents doing it, which leaves room to say so loudly.

---

## Section A — The dine-in QR ordering field

Ten incumbents and near-incumbents, what they actually sell, and where their customers say it hurts.

| Vendor | What it is | Signature feature | Reported friction |
|---|---|---|---|
| **Toast** | POS-bundled QR order & pay, no separate fee | Pre-auth open tabs, group ordering across devices, split-pay ([restaurant dive](https://restaurantdive.com/news/toast-adds-enhanced-tools-to-contactless-order-and-pay-platform/598440)) | Forced Toast processing, hardware lock-in, fee complaints ([g2](https://www.g2.com/products/toast/reviews)) |
| **me&u** (ex–mr yum) | Merged Nov 2023 after mr yum's growth struggles; ~6,000 venues ([startupdaily](https://www.startupdaily.net/topic/business/meal-ordering-apps-mr-yum-and-meu-confirm-theyre-merging)) | Tabs, Tap to Pay on iPhone, CRM/loyalty, staff app "Crew" | Quote-based pricing only, no public rate card ([margincompare](https://www.margincompare.com.au/meandu)) |
| **GoTab** | QR + handheld POS + kiosk in one "commerce platform" | Dynamic pricing rules engine; offline-capable Sync tier at $229/mo ([gotab](https://gotab.com/latest/gotab-launches-advanced-pricing-rules-engine)) | Account-migration failures, thin onboarding docs ([capterra](https://www.capterra.com/p/215393/GoTab-POS/reviews)) |
| **Presto** | Pivoting hard to voice AI (Presto IQ); tablet line (Flex) still active | ElevenLabs partnership, $10M raise Jan 2026 ([rtn](https://restauranttechnologynews.com/2026/01/presto-raises-10-million-to-scale-voice-ai-deployments-as-restaurant-drive-thru-automation-enters-its-prove-it-era/)) | Investment visibly rotating away from dine-in QR |
| **Popmenu** | Marketing-first platform; ordering is a paid add-on, not bundled | $179–$499/mo tiers ([restolabs](https://www.restolabs.com/blog/popmenu-pricing)) | Billing/cancellation disputes, 3.2/5 Trustpilot ([g2/trustpilot](https://www.getsauce.com/post/popmenu-reviews)) |
| **Otter** | Delivery-aggregation-centric "restaurant OS," adjacent not identical | Order aggregation, monitoring, analytics ([sourceforge](https://sourceforge.net/software/product/Otter)) | 6-month implementations, a reported cross-tenant data-exposure bug ([g2](https://www.g2.com/products/otter-restaurant-operating-system-ros/reviews)) |
| **Bbot** (→ DoorDash) | Acquired by DoorDash for $88M, Mar 2022 — *not* Olo | Folded into DoorDash's merchant QR order & pay line ([prnewswire](https://www.prnewswire.com/news-releases/doordash-enters-definitive-agreement-to-acquire-bbot)) | — |
| **Olo** | Enterprise/multi-location ordering; acquired by Thoma Bravo, $2B, 2025 | OrderReady AI wait-time prediction, AI cross-sell, Engage marketing ([olo](https://www.olo.com/blog/11-ways-olo-uses-ai-to-fuel-restaurant-growth)) | ~$400–600/mo per location + ~$1,000 entry — priced for chains ([pricingnow](https://pricingnow.com/question/olo-pricing)) |
| **Square** | QR mapped per table; unifies in-house/online/delivery/QR in one view | Spring 2025: QR-pay-at-check, Square Handheld tableside ([square](https://squareup.com/us/en/releases/food-and-beverage/spring-2025)) | — |
| **SpotOn Serve / Zuppler / Ovvi** | Mid-market bundles: QR order/pay + KDS (SpotOn), white-label ordering (Zuppler), all-in-one POS (Ovvi) | SpotOn from $99–135/mo ([loman](https://loman.ai/blog/spot-on-pos-pricing)); Zuppler from $129/mo ([zuppler](https://zuppler.com/white-label-solution)) | Mixed support responsiveness, Ovvi ([trustpilot](https://www.trustpilot.com/review/ovvihq.com)) |

### Table-stakes — cannot skip

- QR menu → order → pay from a personal device
- Shared/open tabs with mid-meal reordering
- Split-bill, split-by-item
- Direct KDS routing
- Apple/Google Tap-to-Pay
- Multi-location menu & reporting management

### Open — genuinely underserved

- Flat, published pricing (nearly everyone above draws fee-trust complaints)
- AI *inside* the table-ordering flow itself, not phone/drive-thru
- Migration/onboarding that doesn't fail (GoTab, Otter both cited)
- A clean multi-branch product priced for independents, not enterprise chains

---

## Section B — The AI ordering layer

Where the AI investment in this category is actually going, and what happens when grounding fails.

| Vendor | Channel | What it does | Grounding signal |
|---|---|---|---|
| **Slang.ai** | Phone | Answers calls, books tables, FAQs | Avoids the problem — texts a link instead of completing orders live ([slang.ai](https://www.slang.ai/post/ai-phone-answering-system-restaurants)) |
| **ConverseNow** | Phone / drive-thru | Voice ordering with live upsell | Routes through Deliverect's unified menu system ([prnewswire](https://www.prnewswire.com/news-releases/conversenow-and-deliverect-announce-partnership-to-bring-voice-ai-ordering-into-unified-restaurant-order--menu-management-302743431.html)) |
| **SoundHound** | Phone / SMS / app / kiosk / drive-thru | 100M+ interactions processed for chains like Chipotle, White Castle | Polaris ASR + live menu/location data via Deliverect — closest to real tool-calling ([soundhound](https://www.soundhound.com/newsroom/press-releases/soundhound-phone-ordering-crosses-milestone-as-ai-system-processes-100-million-customer-interactions-for-restaurants-across-the-u-s/)) |
| **Toast IQ / "Sous Chef"** | Staff-side POS | Forecasting, menu insight, natural-language edits to shifts/menu | Internal operator data, not customer-facing grounding risk ([toast](https://pos.toasttab.com/news/toast-expands-toast-iq-smart-ai-assistant)) |
| **Square AI assistant** | Staff-side + voice | Dashboard assistant, AI inventory, ChatGPT/Claude order discovery | — ([restaurant dive](https://www.restaurantdive.com/news/square-product-update-voice-ordering-ai-assistant/802331/)) |
| **Qrav / Chocochip / QRCodeKit** | QR / web menu | Allergen & recommendation chat directly on the digital menu | Marketing claims "real-time menu sync" — architecture undocumented ([qrav](https://qrav.in/)) |
| **OpenTable Concierge / Yelp Assistant** | Discovery | Generative dish & dietary suggestions across 60,000+ profiles | Reviews/business-page data, not live POS menus ([opentable](https://www.opentable.com/blog/press/page/ai-concierge/)) |

### What happens when grounding fails

- **Jul 2024 — McDonald's × IBM drive-thru AI.** Viral order errors — 260 nugget orders, bacon on ice cream. 3-year, 100-restaurant pilot killed. ([al jazeera](https://www.aljazeera.com/economy/2024/6/19/mcdonalds-scrap-ai-pilot-at-drive-through-outlets-after-order-mix-ups))
- **2025–26 — Stefanina's Pizzeria.** Google AI Overviews fabricated pizza deals never offered; the restaurant had to publicly disclaim them. ([vice](https://www.vice.com/en/article/pizza-joint-overwhelmed-with-angry-customers-asking-for-fake-deals-made-up-by-google-ai/))
- **2024 — Air Canada / dealership chatbot precedent.** Both non-restaurant, but establish that companies are liable for what their AI states, and that prompt-injection can extract bad commitments. ([truyo](https://truyo.com/ai-incidents-hallucinating-chatbot/))

**Honest read:** "grounded via live function-calling, never a stale index" is not an invention — SoundHound and ConverseNow already route real orders through live systems. But no QR/table-side competitor documents doing this rigorously, and Slang.ai — arguably the most mature web-adjacent voice player — sidesteps live grounding entirely for ordering. Making this a stated, auditable architectural commitment (not just an internal rule) is a legitimate marketing and trust claim in this specific channel, not a redundant one.

---

## Section C — Building it now

Checked against current 2025–26 practice: modular monolith, Postgres RLS, Stripe idempotency, live-data AI tool-calling, plus four layers filled in on market fit alone — ORM, async queue, the printer-facing Device Agent, and frontend.

| Decision | 2026 default | Why / caveat | Confidence |
|---|---|---|---|
| Backend framework | Node/NestJS for DI-driven modular monolith + TS ecosystem | Elixir/Phoenix wins specifically on realtime-at-scale (BEAM concurrency) but has thinner RLS/Ecto tooling ([telerik](https://www.telerik.com/blogs/how-to-build-multi-tenant-saas-api-nestjs-postgres-row-level-security)) | Team-dependent |
| Multi-tenancy | Shared tables + Postgres RLS on `tenant_id` | Proven to 10,000+ tenants; `tenant_id` must lead composite indexes or RLS predicates run ~100x slower ([crunchydata](https://www.crunchydata.com/blog/row-level-security-for-tenants-in-postgres)) | Consensus |
| Idempotency keys | Client-generated key → store first response, replay on repeat, reject param mismatch | Mirrors Stripe's own documented pattern exactly ([stripe docs](https://docs.stripe.com/idempotency)) | Consensus |
| Webhook dedup | `INSERT ... ON CONFLICT(event_id) DO NOTHING` before processing | Dedup reduces load; handlers must still be idempotent for races ([hookdeck](https://hookdeck.com/docs/guides/deduplication-guide)) | Consensus |
| Realtime (KDS) | Managed (Ably) over self-hosted Socket.io for delivery guarantees | A dropped reconnect silently losing an order-status update is a real dinner-rush liability; reliability claims here are vendor-sourced ([ably](https://ably.com/compare/pusher-vs-socketio)) | Genuinely contested |
| AI tool-calling | Vercel AI SDK or a thin direct wrapper over Anthropic/OpenAI tool-use — not LangChain | LangChain earns its keep only for complex multi-agent orchestration, which this system doesn't need ([strapi](https://strapi.io/blog/langchain-vs-vercel-ai-sdk-vs-openai-sdk-comparison-guide)) | Consensus-leaning |
| AI eval gate | Golden-set regression run on every prompt/tool-schema change before deploy | Matches the spec's Part 9.8 requirement almost exactly ([futureagi](https://futureagi.com/blog/llm-eval-golden-set-design-2026/)) | Consensus |
| ORM / query layer | Drizzle ORM over Prisma | Stays close to raw SQL, which matters when every request needs to `SET LOCAL app.tenant_id` — Prisma's RLS story is workaround-heavy by comparison | Judgment call |
| Async / job queue | BullMQ (Redis-backed) over SQS/EventBridge | More idiomatic once the stack is Node-native; still pair with a transactional outbox so no event is lost after commit | Judgment call |
| Device Agent (printers/LAN) | **Go** — not Node, deliberately breaking from "one language everywhere" | Has to run unattended as a dependency-free single binary on whatever PC a restaurant already owns; Node needs a runtime installed on hardware you don't control | Judgment call |
| Frontend (customer + KDS + staff/admin) | Next.js (React), mobile web only — no native app | Clear 2026 default for this exact use case; one team, one framework, across all three surfaces | Consensus-leaning |

**On sourcing:** the first seven rows above are checked against external research (linked citations). The last four — ORM, queue, Device Agent language, and frontend — are market-fit judgment calls, independent of any citation or the project's own docs; treat the "Judgment call" tag as exactly that, not a sourced consensus.

**Flagged as unverified:** a claim that Toast's shared multi-tenant infrastructure has caused "noisy neighbor" problems for smaller restaurants during large-chain traffic spikes surfaced in general SaaS-architecture commentary but could not be traced to Toast's own engineering sources. Worth designing against as a precaution, not repeating as a confirmed fact.

**Decision update (28 Aug 2026):** the backend framework was subsequently decided as **FastAPI (Python)**, not Node/NestJS as recommended above — see `SolutionArchitecture.md` §2 (ADR-001, resolved). This table is left as-written since it reflects the research and reasoning at the time, not the final call; the Node-specific dependents of that original recommendation carry forward differently under Python:

- **ORM:** SQLAlchemy (async), not Drizzle — same underlying reasoning (stay close to raw SQL for the `SET LOCAL app.tenant_id` RLS pattern), Python's equivalent tool.
- **Async/job queue:** Celery (Redis-backed), not BullMQ — same Redis-backed approach, Python-native equivalent.
- **AI tool-calling:** direct Anthropic/OpenAI Python SDK, not the Vercel AI SDK — the Vercel AI SDK's streaming-UI hooks were a Next.js/Node-specific convenience; a Python backend still pairs fine with the same Next.js frontend, it just isn't the same single-language, shared-types setup described above.
- **Device Agent (Go)** and **Frontend (Next.js/React)** are unaffected by this change — both reasons for picking them held independent of backend language.

---

## Section D — What this means for Restaurant OS

The spec's existing bets checked out well. Four things worth acting on.

**1. The architecture is not the risk.** *(Validated)*
RLS-per-tenant, idempotency-key storage, webhook dedup, and modular monolith are all still the 2026 default for this scale — none of this is a gamble worth re-litigating. Spend review time on product decisions instead, not on re-second-guessing the schema.

**2. Table-side AI is the open lane — but say so explicitly.** *(Differentiator)*
Every serious AI dollar in this category is chasing phone/drive-thru voice or staff-side copilots. Nobody credible is doing rigorous, auditable live-data-grounded AI inside the browsing/ordering flow itself. Competitors who look similar (Qrav, Chocochip) don't document their grounding method, so stating "every price/allergen answer is a live tool call, logged, evaluated on a golden set" as a headline claim is a real trust lever, not internal hygiene.

**3. Pricing transparency is underrated as a wedge.** *(Differentiator)*
Toast, Popmenu, GoTab and Otter all carry live fee/billing trust complaints. A flat, published price beats another ordering feature almost every incumbent already has.

**4. QR token rotation and suspicious-order flagging remain a real, rare edge.** *(Keep it)*
None of the ten dine-in competitors reviewed publicly document anything like a rotatable `qr_token` or a staff-side "flag suspicious order" control. This is either a genuinely overlooked risk industry-wide, or nobody advertises it — either way, it costs little to keep and nobody else appears to be doing it.

---

*Compiled from three independent web-research passes (dine-in ordering incumbents · AI-in-restaurant vendors · backend architecture), cross-checked against the Restaurant OS master requirements doc and canonical docs repo. Vendor feature and pricing claims are drawn mostly from vendor marketing and third-party review aggregators (G2, Capterra, Trustpilot) as of Aug 2026, not independently audited — corroborate before citing externally.*
