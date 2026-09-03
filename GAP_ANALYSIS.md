# Restaurant OS — Consolidated Gap Analysis

**Status:** Working analysis (not a canonical doc)
**Compiled:** 27 Aug 2026
**Method:** Two independent 5-agent review passes over the 7 canonical docs (`docs/`) plus the master planning doc, consolidated by cross-reviewer consensus — plus gaps identified earlier in direct review (admin UI, bulk import, frontend framework, doc-internal contradictions).

- **Feature** = a capability/workflow missing from scope entirely.
- **UI/Tool** = the backend/API/schema exists, but no human-usable screen or tool was ever designed to operate it.
- **Open decision** = not a gap so much as an unresolved question already flagged in the source docs, resurfaced independently.

Consensus is out of 5 independent review agents per pass; "confirmed pre-round" means it was established in direct conversation review before the two 5-agent passes ran.

**Triage status (28 Aug 2026):** all 32 CRITICAL and IMPORTANT rows (#1–#33, minus one merge) have been added to `docs/FeatureCatalogue.md` and `docs/UserStories.md`. The 13 "UI/Tool" rows were folded into their existing parent feature (F2, F3, F5, F6, F11) rather than given new Feature IDs — see each feature's "Additions from gap analysis" subsection. The remaining 19 rows became new Features F14–F32 with their own Epics (N–AF) in `UserStories.md`. NICE-TO-HAVE rows (#34–#38) and the single-reviewer flags below were **not** triaged into either document — they remain here only. Open decisions (#39–#41) were not added as features; they're still open questions, cross-referenced from `SolutionArchitecture.md` where applicable.
| # | Type | Item | Gap (one line) | Priority | Consensus |
|---|---|---|---|---|---|
| 1 | UI/Tool | Platform Admin console | Tenant onboard/suspend API exists, no screen — today it's raw SQL/curl | CRITICAL | 5/5 |
| 2 | UI/Tool | Staff invite/onboarding activation | Staff row gets created; no defined first-login/activation UX | CRITICAL | 5/5 |
| 3 | UI/Tool | Device Agent pairing/setup | Printer-agent protocol exists; no wizard/config screen to install it | CRITICAL | 5/5 |
| 4 | UI/Tool | Audit log viewer | Audit records mandated; no screen/endpoint to browse or search them | CRITICAL | 5/5 |
| 5 | UI/Tool | Payment reconciliation screen | FR-007 requires operator inspection; no screen exists | CRITICAL | 5/5 |
| 6 | UI/Tool | Cashier live-tables / suspicious-order view | QR-fraud control from master doc; field may be dropped, not just unbuilt | CRITICAL | 5/5 |
| 7 | Feature | Reservations & waitlist | No booking/waitlist flow anywhere — walk-in/QR only | CRITICAL | 5/5 |
| 8 | Feature | Workforce scheduling & time clock | No rota, clock-in/out, or attendance record | CRITICAL | 5/5 |
| 9 | Feature | Card-present/EMV terminal integration | "Pay at counter" has no in-person card flow specified | CRITICAL | 5/5 |
| 10 | Feature | Cash drawer / till reconciliation | No EOD cash count, over/short, or Z-report workflow | CRITICAL | 5/5 |
| 11 | Feature | Alcohol age verification | No ID-check step despite bars being in scope | CRITICAL | 5/5 |
| 12 | Feature | Full-outage offline mode | Resilience covers printing only, not a total cloud/internet outage | CRITICAL | 5/5 |
| 13 | Feature | Data export / right-to-erasure | GDPR-style rights gated to P3 Enterprise, not baseline | CRITICAL | 5/5 |
| 14 | Feature | Delivery marketplace integration | Only native driver dispatch planned; no DoorDash/UberEats adapter | CRITICAL | 4/5 |
| 15 | UI/Tool | Menu management admin UI | No screen/bulk-import tool for adding menu items — API only | CRITICAL | confirmed pre-round |
| 16 | UI/Tool | Staff "My Devices" screen | Session-revoke API exists; no screen to see/kill a lost phone's session | IMPORTANT | 5/5 |
| 17 | UI/Tool | QR sticker generation/printing tool | No described way to print a physical QR sticker for a new table | IMPORTANT | 5/5 |
| 18 | UI/Tool | Reporting dashboard | Every report is an API endpoint; no chart/dashboard layout | IMPORTANT | 5/5 |
| 19 | UI/Tool | Role/permission visibility for owners | RBAC hardcoded; owners can't see/audit what a role can actually do | IMPORTANT | 5/5 |
| 20 | UI/Tool | Refund screen | "Refund API/UI" — the word "UI" is the entire spec | IMPORTANT | 5/5 |
| 21 | UI/Tool | Device health/heartbeat admin view | Device status is a named capability with no screen | IMPORTANT | 4/5 |
| 22 | Feature | Floor plan / visual table management | Tables are a flat list — no seating map or section assignment | IMPORTANT | 5/5 |
| 23 | Feature | Tip pooling & distribution | `tip_amount` captured, never allocated to staff | IMPORTANT | 5/5 |
| 24 | Feature | Recipe costing / food-cost % | No margin/food-cost analysis, distinct from deferred inventory | IMPORTANT | 5/5 |
| 25 | Feature | Accounting/GL integration | No QuickBooks/Xero export, CSV-only reporting | IMPORTANT | 5/5 |
| 26 | Feature | Food safety / HACCP records | No temperature-log or inspection recordkeeping | IMPORTANT | 5/5 |
| 27 | Feature | Accessibility (ADA/WCAG) | No accessibility requirement for guest ordering UI | IMPORTANT | 5/5 |
| 28 | Feature | Gift cards / store credit | Absent entirely, not even in deferred backlog | IMPORTANT | 5/5 |
| 29 | Feature | Multi-currency per branch | Currency is tenant-level only; breaks for cross-country franchises | IMPORTANT | 5/5 |
| 30 | Feature | Labor-law compliance | No break/overtime tracking or alerting | IMPORTANT | 4/5 |
| 31 | Feature | Catering / advance orders | Excluded from MVP, never resurfaces even as deferred | IMPORTANT | 4/5 |
| 32 | Feature | DR RTO/RPO targets | Backup/restore is a one-time checkbox, not an ongoing objective | IMPORTANT | 4/5 |
| 33 | UI/Tool | No bulk menu import/CSV tool | Items addable one at a time only | IMPORTANT | confirmed pre-round |
| 34 | UI/Tool | KDS screen layout/wireframe | Behavior well-specified; visual layout is not | NICE-TO-HAVE | 5/5 |
| 35 | Feature | Reviews/reputation management | No Google/Yelp integration or feedback capture | NICE-TO-HAVE | 5/5 |
| 36 | Feature | Staff-facing/KDS UI localization | Guest menu translation planned; staff screens are not | NICE-TO-HAVE | 5/5 |
| 37 | Feature | Nutrition/calorie disclosure | Relevant mainly for chain-scale tenants | NICE-TO-HAVE | 3/5 |
| 38 | Feature | Itemized bill splitting by guest/seat | Distinct from deferred "split tender" (payment method) | NICE-TO-HAVE | 2/5 |
| 39 | Open decision | Franchise financial independence | Separate P&L/Stripe per branch under one tenant — still unresolved | Flag, not gap | Master doc Part 10 |
| 40 | Open decision | Backend framework contradiction | **Resolved 28 Aug 2026** — backend is FastAPI (Python); `SolutionArchitecture.md` §2/§15 (ADR-001) updated accordingly | Resolved | Doc-internal |
| 41 | Open decision | No frontend framework chosen | **Resolved 03 Sep 2026** — frontend is React 19 + Vite (SPA), not Next.js; `SolutionArchitecture.md` §2/§15 (ADR-009) updated to match `TechStackBlueprint.md` §5-6 | Resolved | Confirmed pre-round |

## Single-reviewer flags (not promoted to consensus table)

Mentioned once across the ten review agents — worth a glance, not yet corroborated:

- Multi-station kitchen routing (grill/salad/bar/expo tickets)
- Void vs. comp vs. refund as distinct POS operations
- Fiscal/e-invoicing compliance (sequential invoicing — relevant outside the US: India GST, EU, LatAm)
- Sales-tax filing/remittance report (vs. just storing `tax_amount`)
- Cash-drawer hardware kick-open trigger
- Prep lists / par-level production planning
- Party-size auto-gratuity rules
- Cashier-assisted POS-style order-entry screen
- Coupon/inventory admin UI (for the already-deferred P2 features)
- Menu-translation approval screen (for AI-drafted translations)

## How to use this file

This is a working analysis, not a canonical doc — it isn't numbered into the `docs/` set or linked from `sidebars.js`. Treat rows 1–14 as things to get an explicit product decision on before calling this "full end-to-end"; rows 39–41 as decisions already flagged elsewhere that this analysis independently re-surfaced. Update or delete this file once each item has been triaged into the actual roadmap.
