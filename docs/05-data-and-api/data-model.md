---
title: Data Model Strategy
sidebar_position: 1
---

# Data Model Strategy

## Core hierarchy

```mermaid
erDiagram
  TENANT ||--o{ BRAND : owns
  BRAND ||--o{ RESTAURANT : contains
  RESTAURANT ||--o{ BRANCH : operates
  BRANCH ||--o{ ORDER : receives
  ORDER ||--|{ ORDER_ITEM : contains
  MENU_ITEM ||--o{ ORDER_ITEM : selected_as
  BRANCH ||--o{ DEVICE : registers
  TENANT ||--o{ USER : employs
```

## Data principles
- Every tenant-scoped entity carries an immutable tenant identifier.
- Money uses decimal types and explicit currency codes.
- Order financial snapshots are immutable after settlement.
- Personally identifiable data is minimised and encrypted where necessary.
- Audit events are append-only.
