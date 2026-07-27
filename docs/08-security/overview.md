---
title: Security Architecture
sidebar_position: 1
---

# Security Architecture

## Core controls
- OAuth 2.0/OIDC authentication
- MFA for privileged users
- Role- and permission-based authorisation
- Tenant enforcement in application and database layers
- TLS in transit and encryption at rest
- Central secret management
- Signed webhook validation
- Rate limiting, WAF and bot protection
- Immutable audit logging
- Secure software supply chain

## Payment boundary
The platform must not store raw card data. Payment details are tokenised and processed by compliant payment providers.

## Threat model priorities
- Cross-tenant data access
- Account takeover
- Fraudulent refunds and discounts
- Webhook replay and tampering
- Device impersonation
- Order loss or duplication
- Sensitive-data leakage through AI prompts
