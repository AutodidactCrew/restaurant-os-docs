---
title: Domain Data, API and Events
sidebar_position: 6
---

# Domain Model, API Conventions and Events

Core domain hierarchy: TENANT -> BRAND -> RESTAURANT -> BRANCH -> TABLE_SESSION -> ORDER -> ORDER_ITEM

Key tables: tenants, branches, restaurant_tables (qr_token), table_sessions, customers, staff, menu_items (tenant-level + overrides), orders, order_items, payments, refunds, idempotency_keys, webhook_events

API conventions:
- REST transactional APIs under /api/v1
- Idempotency-Key required for chargeable/kitchen-facing POSTs and persisted
- WebSocket/SSE for live KDS updates
- Webhook event dedup using webhook_events table

Event model:
- OrderCreated, OrderUpdated, PaymentSucceeded, PaymentFailed, DeviceCommand
- Events published to SQS/EventBridge and consumed by KDS/Device workers
