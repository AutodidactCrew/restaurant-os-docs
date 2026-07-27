---
title: Requirements Overview
sidebar_position: 1
---

# Product Requirements Overview

Requirements are organised by module and classified as **MVP**, **Growth**, **Advanced**, or **Enterprise**.

```mermaid
flowchart TD
    Customer --> Ordering
    Ordering --> Payment
    Ordering --> Kitchen
    Kitchen --> Fulfilment
    Fulfilment --> Pickup
    Fulfilment --> Delivery
    Admin --> Menu
    Admin --> Inventory
    Admin --> Staff
    Admin --> Analytics
    AI --> Customer
    AI --> Admin
```

## Functional domains

1. Customer identity and profile
2. Restaurant and branch administration
3. Menu, modifiers, bundles and pricing
4. Dine-in, pickup, delivery and scheduled orders
5. Kitchen orchestration and production routing
6. Payments, refunds and reconciliation
7. Inventory, recipes, suppliers and purchasing
8. Loyalty, CRM, campaigns and feedback
9. Delivery operations
10. Analytics and AI
11. Devices and third-party integrations
12. Platform administration
