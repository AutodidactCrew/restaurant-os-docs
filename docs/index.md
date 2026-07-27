---
slug: /
title: Restaurant OS Documentation Hub
sidebar_position: 1
---

# Restaurant OS Documentation Hub

This repository is the structured source of truth for product strategy, requirements, architecture, integrations, security, delivery, and engineering governance.

## Documentation map

```mermaid
flowchart LR
    Vision[Product Vision] --> Strategy[Product Strategy]
    Strategy --> PRD[Product Requirements]
    PRD --> Architecture[Solution Architecture]
    Architecture --> Data[Data & API]
    Architecture --> AI[AI & Automation]
    Architecture --> Devices[Device Integrations]
    Architecture --> Security[Security]
    Data --> Delivery[Delivery Roadmap]
    AI --> Delivery
    Devices --> Delivery
    Security --> Delivery
    Delivery --> Quality[Quality Engineering]
    Quality --> Governance[Governance & ADRs]
```

## Document ownership

| Area | Primary audience | Main outcome |
|---|---|---|
| Product Vision | Founders, product leadership | Shared direction and boundaries |
| Product Requirements | Product, design, engineering | Prioritised functional scope |
| Solution Architecture | Architects, senior engineers | Technology and system decisions |
| Security | Security and engineering | Controls and compliance posture |
| Device Integrations | Integration and mobile teams | Reliable POS, printer, KDS and terminal connectivity |
| Delivery Roadmap | Leadership and delivery teams | Phases, milestones and dependencies |
