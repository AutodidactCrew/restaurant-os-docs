---
title: Delivery Roadmap
sidebar_position: 1
---

# Delivery Roadmap

## Phase 0 — Discovery and foundations
- Pilot restaurant interviews
- User journeys and service blueprint
- Architecture decisions and threat model
- Design system and domain model

## Phase 1 — MVP
- Multi-tenant onboarding
- Menu and branch administration
- QR/dine-in and pickup ordering
- Stripe or Square payment
- KDS
- Notifications
- Basic reporting

## Phase 2 — Operational depth
- Inventory and recipe engine
- Loyalty and CRM
- Reservations
- Printer integration
- First POS adapter
- Driver delivery app

## Phase 3 — Intelligence and enterprise
- Forecasting and operational copilot
- Voice ordering
- Franchise management
- Central kitchen
- Advanced analytics and dedicated tenancy

```mermaid
gantt
  title Restaurant OS Delivery Roadmap
  dateFormat  YYYY-MM-DD
  section Foundations
  Discovery and architecture :a1, 2026-08-01, 14d
  section MVP
  Core platform and apps      :a2, after a1, 70d
  Pilot and hardening         :a3, after a2, 21d
  section Growth
  Operational modules         :a4, after a3, 56d
  section Intelligence
  AI and enterprise           :a5, after a4, 56d
```
