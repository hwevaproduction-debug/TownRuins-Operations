---
title: Temporary Stay
description: Temporary stay booking policies, payment flows, and business rules for the Town Ruins platform.
tags:
  - temporary-stay
  - bookings
  - payments
  - business-rules
aliases:
  - Temp Stay
  - Bookings
---

# Temporary Stay

## Last Verified

Last Verified: 2026-07-15

Branch context: awsfullmig

## Related Documents

- [docs/business/TOKEN_ECONOMY.md](TOKEN_ECONOMY.md)
- [docs/architecture/ARCHITECTURE.md](../architecture/ARCHITECTURE.md)

## Prerequisites

- Review [real-app-backend-main/controllers/stayController.js](../../real-app-backend-main/controllers/stayController.js)
- Review [real-app-backend-main/controllers/bookingController.js](../../real-app-backend-main/controllers/bookingController.js)
- Review [real-app-frontend-main/src/views/Stays](../../real-app-frontend-main/src/views/Stays)

## Derived Documents

- [docs/guides/END_USER_GUIDE.md](../guides/END_USER_GUIDE.md)

## Scope

This document covers the Temporary Stay booking exception described in the token economy invariant. The current repository evidence shows that temporary stay bookings are treated as real-payment reservations rather than token-only premium features.

## Current Behavior

- Temporary stay booking and stay flows are handled in the backend controllers and stay routes.
- Booking payments and provider payout flows are part of the payment side effects and payment provider layers.
- The frontend includes booking confirmation and stay detail views that present the booking experience to tenants.

## Planned / Unverified

- Any additional booking lifecycle automation not visible in the current controllers and routes is **Planned**.
