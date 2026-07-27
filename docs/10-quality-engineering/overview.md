---
title: Quality Engineering
sidebar_position: 1
---

# Quality Engineering

## Test layers
- Unit tests for domain rules
- Component tests for modules
- Contract tests for POS, payments and webhooks
- Integration tests with PostgreSQL/Redis/queue dependencies
- End-to-end tests for critical customer and restaurant journeys
- Load tests for ordering peaks and KDS fan-out
- Security tests and dependency scanning
- Device certification matrix

## Release gates
- No critical security findings
- No broken tenant-isolation tests
- Payment and order idempotency tests pass
- Rollback verified
- Monitoring and runbooks prepared
