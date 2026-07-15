# Architecture

## Last Verified

Last Verified: 2026-07-15

Branch context: awsfullmig

## Related Documents

- [docs/api/API.md](../api/API.md)
- [docs/database/DATABASE.md](../database/DATABASE.md)
- [docs/deployment/DEPLOYMENT.md](../deployment/DEPLOYMENT.md)
- [docs/reference/REPOSITORY_GUIDE.md](../reference/REPOSITORY_GUIDE.md)

## Prerequisites

- Review the current backend routes under [real-app-backend-main/routes](../../real-app-backend-main/routes)
- Review the current frontend views under [real-app-frontend-main/src](../../real-app-frontend-main/src)
- Review the Prisma schema and migration history under [real-app-backend-main/prisma](../../real-app-backend-main/prisma)

## Derived Documents

- [docs/business/TOKEN_ECONOMY.md](../business/TOKEN_ECONOMY.md)
- [docs/operations/OPERATIONS_RUNBOOK.md](../operations/OPERATIONS_RUNBOOK.md)

## Scope

The platform is organized as a multi-app repository with an Express + Prisma backend and a Create React App + TypeScript frontend. The backend exposes REST endpoints for listings, bookings, payments, moderation, notifications, and legal documents. The frontend presents role-based dashboards for admins, landlords, tenants, and providers.

## Core Components

### Backend services

- API entry point: [real-app-backend-main/app.js](../../real-app-backend-main/app.js)
- Authentication, users, and profile flows: [real-app-backend-main/controllers/authController.js](../../real-app-backend-main/controllers/authController.js) and [real-app-backend-main/routes/userRoutes.js](../../real-app-backend-main/routes/userRoutes.js)
- Listing and listing draft management: [real-app-backend-main/controllers/listingController.js](../../real-app-backend-main/controllers/listingController.js) and [real-app-backend-main/controllers/listingDraftController.js](../../real-app-backend-main/controllers/listingDraftController.js)
- Booking and stay flows: [real-app-backend-main/controllers/bookingController.js](../../real-app-backend-main/controllers/bookingController.js) and [real-app-backend-main/controllers/stayController.js](../../real-app-backend-main/controllers/stayController.js)
- Wallet and token monetization: [real-app-backend-main/utils/walletService.js](../../real-app-backend-main/utils/walletService.js) and [real-app-backend-main/utils/monetization.js](../../real-app-backend-main/utils/monetization.js)
- Notifications: [real-app-backend-main/utils/notificationService.js](../../real-app-backend-main/utils/notificationService.js) and [real-app-backend-main/utils/notificationWorker.js](../../real-app-backend-main/utils/notificationWorker.js)
- Legal document processing: [real-app-backend-main/controllers/legalDocController.js](../../real-app-backend-main/controllers/legalDocController.js)
- Moderation and admin oversight: [real-app-backend-main/controllers/adminController.js](../../real-app-backend-main/controllers/adminController.js)

### Frontend experience

- Public and protected routing: [real-app-frontend-main/src/routes/PublicRoutes.tsx](../../real-app-frontend-main/src/routes/PublicRoutes.tsx) and [real-app-frontend-main/src/routes/ProtectedRoutes.tsx](../../real-app-frontend-main/src/routes/ProtectedRoutes.tsx)
- Dashboard surfaces: [real-app-frontend-main/src/views/Dashboard/Admin.tsx](../../real-app-frontend-main/src/views/Dashboard/Admin.tsx), [real-app-frontend-main/src/views/Dashboard/Landlord.tsx](../../real-app-frontend-main/src/views/Dashboard/Landlord.tsx), [real-app-frontend-main/src/views/Dashboard/Tenant.tsx](../../real-app-frontend-main/src/views/Dashboard/Tenant.tsx), and [real-app-frontend-main/src/views/Dashboard/Provider.tsx](../../real-app-frontend-main/src/views/Dashboard/Provider.tsx)
- Legal views: [real-app-frontend-main/src/views/Legal](../../real-app-frontend-main/src/views/Legal)
- Docs views: [real-app-frontend-main/src/views/Docs](../../real-app-frontend-main/src/views/Docs)

## Notable Subsystems

- Wallet and TR Token flows are implemented through the wallet service and monetization utilities. The canonical invariant is documented in [docs/business/TOKEN_ECONOMY.md](../business/TOKEN_ECONOMY.md).
- Temporary stay bookings are treated as a real-payment exception to the token-only rule, documented in the same business doc.
- Notifications are supported through several channel implementations under [real-app-backend-main/utils/channels](../../real-app-backend-main/utils/channels).
- Uploads and signed URLs are handled by [real-app-backend-main/controllers/uploadController.js](../../real-app-backend-main/controllers/uploadController.js).
- Search and pricing engines are present in the backend controller and utility layers, but the current repository documents them as implemented modules rather than separate services.

## Verification Notes

- The current schema evolution is reflected in migration history from [real-app-backend-main/prisma/migrations](../../real-app-backend-main/prisma/migrations) and culminates in the restore listing timestamps migration noted in the changelog.
- Any feature visible in the current UI or routes but not yet fully wired into the backend is marked as **Planned**.

