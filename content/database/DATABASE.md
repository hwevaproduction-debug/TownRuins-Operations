# Database Reference

## Last Verified

Last Verified: 2026-07-15

Branch context: awsfullmig

## Related Documents

- [docs/architecture/ARCHITECTURE.md](../architecture/ARCHITECTURE.md)
- [docs/api/API.md](../api/API.md)
- [docs/business/TOKEN_ECONOMY.md](../business/TOKEN_ECONOMY.md)

## Prerequisites

- Review [real-app-backend-main/prisma/schema.prisma](../../real-app-backend-main/prisma/schema.prisma)
- Review the migration folders under [real-app-backend-main/prisma/migrations](../../real-app-backend-main/prisma/migrations)

## Derived Documents

- [docs/reference/REPOSITORY_GUIDE.md](../reference/REPOSITORY_GUIDE.md)

## Scope

The current schema is PostgreSQL-backed and managed through Prisma migrations. The current repository history includes the listing timestamp restoration migration noted in the changelog.

## Core Models

- User
- Listing
- ListingDraft
- Accommodation
- Room
- Booking
- Payment
- WalletTransaction
- NotificationJob
- Notification
- LegalDocument
- Report
- Dispute
- Engagement
- UserPushSubscription

## Notes

- Wallet, TR Token balance, legal documents, and notifications are represented in the schema and are documented in [docs/business/TOKEN_ECONOMY.md](../business/TOKEN_ECONOMY.md).
- The schema continues to evolve through migrations in [real-app-backend-main/prisma/migrations](../../real-app-backend-main/prisma/migrations); any feature not reflected in the current schema is marked as **Planned**.

