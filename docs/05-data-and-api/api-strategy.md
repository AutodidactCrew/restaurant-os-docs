---
title: API and Event Strategy
sidebar_position: 2
---

# API and Event Strategy

## Options
- REST for public and transactional APIs
- WebSocket or server-sent events for live order/KDS updates
- Webhooks for payment and partner callbacks
- Events for reliable internal workflows
- GraphQL only where client aggregation provides a measurable benefit

## Order lifecycle

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Submitted
  Submitted --> Accepted
  Accepted --> Preparing
  Preparing --> Ready
  Ready --> Completed
  Submitted --> Rejected
  Accepted --> Cancelled
  Preparing --> Cancelled: authorised exception
  Completed --> Refunded
```

All mutating APIs require idempotency keys where retries may occur.
