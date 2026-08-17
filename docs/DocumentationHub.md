---
slug: /
title: Restaurant OS Engineering Documentation
sidebar_position: 1
---

# Restaurant OS Engineering Documentation

**Status:** Canonical documentation set  
**Audience:** Product, Design, Engineering, QA, Security, Platform, Operations  
**Product:** Restaurant OS — Multi-tenant Restaurant Operating Platform

## 1. Purpose

This documentation set is the implementation source of truth for Restaurant OS. It consolidates the original planning, feature, user-story, and architecture material into a smaller set of authoritative documents with explicit ownership and traceability.

The documentation is intentionally organized from **business intent → product scope → feature requirements → user stories → architecture → data/API → security/reliability → delivery/operations**.

## 2. Canonical document set

<!-- code block removed for build stability -->

| Order | File | Authority |
|-------|---|---|
| 1     | `00-documentation-hub.md` | Navigation, ownership, governance |
| 2     | `01-product-strategy-and-requirements.md` | Product vision, personas, scope, functional and non-functional requirements |
| 3     | `02-feature-catalogue.md` | Canonical feature definitions, release priority, boundaries and dependencies |
| 4     | `03-user-stories-and-acceptance-criteria.md` | Testable product backlog, acceptance criteria and traceability |
| 5     | `04-solution-architecture.md` | Logical/runtime architecture, module boundaries, major flows and technology decisions |
| 6     | `05-domain-data-api-and-events.md` | Domain model, data invariants, API conventions, events and integration contracts |
| 7     | `06-security-reliability-and-compliance.md` | Tenancy, identity, authorization, PCI posture, resilience, observability and incident controls |
| 8     | `07-delivery-quality-and-operations.md` | 12-week MVP roadmap, test strategy, release gates, environments, CI/CD and runbooks |

## 3. Source normalization decisions

The original source material contained a few inconsistencies. This canonical set resolves them as follows.

### ND-01 — MVP delivery baseline

**Decision:** The committed MVP baseline is **12 weeks**, followed by a controlled pilot.

**Reason:** The original detailed plan defines a 12-week MVP ending in hardening/pilot, while the larger master document later extends the sequence with driver, reporting and other post-MVP capabilities.

**Canonical treatment:** Driver management, inventory automation, loyalty/coupons, advanced analytics and enterprise tenancy are post-MVP unless separately reprioritized.

### ND-02 — Architecture baseline

**Decision:** Start with a **modular monolith** using explicit domain modules and asynchronous integration where useful.

**Canonical treatment:** No microservice extraction is required for MVP. Service extraction is a scale-driven decision documented by ADR.

### ND-03 — Payment provider

**Decision:** Stripe is the MVP reference provider because it is explicitly used throughout the original requirements.

**Canonical treatment:** Business logic uses a payment-provider adapter boundary so an additional provider can be introduced later.

### ND-04 — Customer identity

**Decision:** Customer ordering remains **guest-first**. OTP verification is applied at checkout where required by policy; customers do not need a traditional account before browsing or building a cart.

### ND-05 — Driver capability

**Decision:** Driver is retained as a valid future persona/domain but is **not part of the MVP sign-off scope**.

### ND-06 — AI capability

**Decision:** AI is an enabling layer only after a dedicated ADR defines vendor, model access, data policy, safety boundaries and tenant cost caps. It is not a release-blocking MVP feature.

## 4. Requirement hierarchy

When two documents appear to conflict, use the following precedence:

1. Approved Architecture Decision Record (ADR)
2. Security/compliance control
3. Domain/data invariant
4. API contract
5. Product acceptance criterion
6. Feature implementation note
7. Team implementation preference

No implementation decision may silently override a higher-level requirement.

## 5. Definition of authoritative

A document is authoritative when:

- its status is `Canonical` or `Approved`;
- its requirements are uniquely identified;
- its owner is defined;
- significant changes are reviewed;
- implementation and QA can trace changes back to the requirement;
- conflicting legacy documents are no longer treated as active specifications.

## 6. Required supporting artifacts

The following are supporting artifacts rather than additional master documents:

- ADRs under `docs/adr/`
- OpenAPI specification under `docs/contracts/openapi/`
- AsyncAPI/event catalogue under `docs/contracts/events/`
- Database migrations under the application repository
- Operational runbooks under `docs/runbooks/`
- Threat model under `docs/security/`
- Test plans and automated suites in source control

## 7. Documentation quality rules

- Use Mermaid diagrams with simple node labels and quoted text where punctuation exists.
- Diagrams must not be the only representation of an important requirement; key flows must also be described in prose.
- Every production-impacting API must have an explicit authorization rule.
- Every write that may be retried must define idempotency behavior.
- Every external webhook must define authentication, deduplication and replay handling.
- Every tenant-scoped table must have a tenant-isolation strategy.
- Every MVP feature must map to at least one user story and one automated acceptance path.
