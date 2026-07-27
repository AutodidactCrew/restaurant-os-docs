---
title: Multi-Tenancy and Scaling
sidebar_position: 2
---

# Multi-Tenancy and Scaling

## Tenancy options

| Model | Advantages | Constraints | Suggested use |
|---|---|---|---|
| Shared tables with tenant ID | Efficient and simple | Requires strict query enforcement | MVP and SMB tenants |
| Schema per tenant | Better logical separation | Migration complexity | Mid-market tenants |
| Database per tenant | Strong isolation | Higher cost and operations | Enterprise chains |

## Scaling path

```mermaid
flowchart LR
  A[1-10 locations] -->|Modular monolith| B[10-100 locations]
  B -->|Queues, replicas, caching| C[100-1,000 locations]
  C -->|Extract high-load services| D[1,000+ locations]
  D -->|Multi-region and tenant tiers| E[Global platform]
```

Critical boundaries likely to be extracted first: notifications, integration adapters, reporting, AI processing and delivery tracking.
