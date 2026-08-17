---
title: Solution Architecture
sidebar_position: 5
---

# Solution Architecture

Logical and runtime architecture, module boundaries, major flows and technology decisions.

- Modular monolith (Spring Boot recommended) as initial runtime
- PostgreSQL with Row-Level Security for tenant isolation
- Redis for caching, SQS/EventBridge for events, S3 for files
- Clients: Customer web (Next.js), Staff native apps (Flutter), KDS (React PWA)

Key flows: ordering -> order creation -> event publish -> KDS/Device commands

See docs/restaurant-master.md and docs/final-plan.md for diagrams and detailed module responsibilities.
