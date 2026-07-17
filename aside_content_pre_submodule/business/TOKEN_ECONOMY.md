---
title: TR Token Economy
description: Canonical token economy documentation for the Town Ruins platform, including TR Token model, payer roles, premium services, and revenue flow.
tags:
  - token-economy
  - tr-tokens
  - monetization
  - billing
aliases:
  - Token Economy
  - Tokens
---

# TR Token Economy

## Last Verified

Last Verified: 2026-07-15

Branch context: awsfullmig

## Related Documents

- [docs/architecture/ARCHITECTURE.md](../architecture/ARCHITECTURE.md)
- [docs/business/TEMPORARY_STAY.md](TEMPORARY_STAY.md)
- [docs/guides/LANDLORD_GUIDE.md](../guides/LANDLORD_GUIDE.md)
- [docs/guides/END_USER_GUIDE.md](../guides/END_USER_GUIDE.md)

## Prerequisites

- Review [real-app-backend-main/utils/walletService.js](../../real-app-backend-main/utils/walletService.js)
- Review [real-app-backend-main/utils/monetization.js](../../real-app-backend-main/utils/monetization.js)

## Derived Documents

- [docs/guides/LANDLORD_GUIDE.md](../guides/LANDLORD_GUIDE.md)
- [docs/guides/END_USER_GUIDE.md](../guides/END_USER_GUIDE.md)
- [docs/admin/ADMIN_GUIDE.md](../admin/ADMIN_GUIDE.md)

## Repository Invariant

Money is only used to purchase TR Tokens. TR Tokens are the platform currency. Every premium platform feature consumes TR Tokens. The only exception is Temporary Stay bookings, which use real payments for booking charges and related payment flows.

## Temporary Stay Exception

Temporary Stay bookings are the only exception to the token-only rule. Real accommodation reservations use real payment processing for booking charges, partial payments, refunds, cancellations, settlements, and provider payout flows. This exception applies only to the booking / stay / accommodation / room domain and does not extend fiat payment to any non-booking premium platform feature.

## Current Implementation Notes

- The wallet service exposes token balance and transaction logic through [real-app-backend-main/utils/walletService.js](../../real-app-backend-main/utils/walletService.js).
- Monetization rules are wired through [real-app-backend-main/utils/monetization.js](../../real-app-backend-main/utils/monetization.js).
- The frontend wallet UI is present in [real-app-frontend-main/src/components/wallet](../../real-app-frontend-main/src/components/wallet).

## Planned / Unverified

- Any future premium capability not present in the current repository is **Planned** and must not be described as delivered.
