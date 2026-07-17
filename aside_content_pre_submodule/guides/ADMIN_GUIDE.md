---
title: Administrator Guide
description: Comprehensive administrator workflow and platform management procedures for the Town Ruins platform.
tags:
  - admin-guide
  - administrator
  - platform-management
  - workflows
aliases:
  - Admin Guide
  - Administration
---

# docs/ADMIN_GUIDE.md — Town Ruins Administrator Guide v1.1

# Town Ruins — Administrator Guide

**Version:** 1.1 · **Audience:** Platform administrators and super administrators
**Canonical reference:** spec:dcc449c8-7343-4bb8-bd36-cdc376b73274/311c3a12-bfb8-4fcd-94b1-a32f2915cb9c

<user_quoted_section>Confidential — Internal Use Only</user_quoted_section>

## Table of Contents

1. [Administrator Overview](#administrator-overview)
2. [Roles and Permissions](#roles-and-permissions)
3. [Accessing the Admin Dashboard](#accessing-the-admin-dashboard)
4. [Managing Users](#managing-users)
5. [Managing Landlords & Verification](#managing-landlords--verification)
6. [Listing Moderation](#listing-moderation)
7. [Provider Management](#provider-management)
8. [Accommodation Moderation](#accommodation-moderation)
9. [Booking Management & Settlement](#booking-management--settlement)
10. [Dispute Management](#dispute-management)
11. [Report Management](#report-management)
12. [Review Moderation](#review-moderation)
13. [Notification Management](#notification-management)
14. [Wallet & TR Token Administration](#wallet--tr-token-administration)
15. [Legal Document Management](#legal-document-management)
16. [Feature Flags](#feature-flags)
17. [System Configuration](#system-configuration)
18. [Audit Logs](#audit-logs)
19. [Support Workflows](#support-workflows)
20. [Incident Response](#incident-response)
21. [Launch Checklist](#launch-checklist)
22. [Maintenance Procedures](#maintenance-procedures)
23. [Deployment Considerations](#deployment-considerations)
24. [Recovery Procedures](#recovery-procedures)
25. [Known Operational Limitations](#known-operational-limitations)
26. [Glossary](#glossary)

## Administrator Overview

Administrators are responsible for the health, safety, and integrity of the Town Ruins platform. Admin accounts have elevated access to all platform data and operations.

**Admin responsibilities:**

- Verify and manage providers and accommodations
- Moderate listings, reports, and disputes
- Manage legal documents
- Monitor platform health
- Settle bookings and manage payments
- Maintain audit trails

**Two admin levels exist:**

| Role | DB Value | Access |
| --- | --- | --- |
| Administrator | `admin` | Full admin dashboard access |
| Super Administrator | `super_admin` | Same as admin (no additional UI distinction in v1.1) |

Admin accounts are **not created through the public signup flow**. They are seeded directly into the database using the `seed:super-admin` script.

## Roles and Permissions

All admin routes require the `admin` or `super_admin` role. Attempting to access admin endpoints with any other role returns HTTP 403.

**Admin-only capabilities:**

| Capability | Endpoint |
| --- | --- |
| View moderation queue | `GET /admin/queue` |
| View/bulk-revive inactive listings | `GET /admin/listings/inactive`, `POST /admin/listings/bulk-revive` |
| Manage accommodations | `GET/PUT /admin/accommodations/:id/{approve,reject,suspend,reinstate}` |
| Manage providers | `PUT /providers/:id/{verify,commission}`, `PUT /admin/providers/:id/{suspend,reinstate}` |
| View/settle all bookings | `GET /bookings/`, `PUT /bookings/:id/settle` |
| Manage disputes | `GET/POST /admin/disputes/:id/{review,resolve,close}` |
| Manage reports | `GET/PUT /admin/reports/:id/{review,resolve,dismiss}` |
| Moderate reviews | `GET /admin/reviews`, `PUT /admin/reviews/:id/moderate` |
| View audit logs | `GET /admin/audit-logs` |
| Manage legal documents | `GET/POST/PUT/DELETE /admin/legal-docs` |

## Accessing the Admin Dashboard

1. Log in with an admin account at `/login`
2. You are automatically redirected to `/dashboard/admin`
3. The dashboard is also accessible via the **Dashboard** link in the header (gold colour)

<user_quoted_section>Security: Admin credentials must never be shared. Each admin should have their own account for audit trail integrity.</user_quoted_section>

## Managing Users

User management is currently handled at the database level. The admin dashboard does not have a dedicated user list UI in v1.1.

**User-related admin actions available:**

| Action | How |
| --- | --- |
| Delete a user account | Via API: `DELETE /api/v1/users/delete/:id` (admin can delete any account) |
| View a user's listings | Via API: `GET /api/v1/listings/user/:id` |
| View all bookings | Via admin dashboard bookings section |

**User account deletion** is a cascading operation that removes:

- All listings, accommodations, rooms
- All bookings, payments, refunds
- All notifications, saved searches, drafts
- All engagements, reports, disputes, reviews
- The user record itself

<user_quoted_section>⚠️ Account deletion is irreversible. Always confirm with the user before proceeding.</user_quoted_section>

## Managing Landlords & Verification

Landlords submit identity verification documents (ID image + selfie) via the platform. When submitted:

1. An email is sent to `ADMIN_EMAIL` notifying of a new submission
2. The landlord's `verificationStatus` is set to `PENDING_REVIEW`

**To review a verification submission:**

1. Check the admin email notification
2. Review the submitted documents (stored as URLs in the database)
3. Update the landlord's verification status via the admin dashboard or API

**Verification statuses:**

| Status | Meaning | Action |
| --- | --- | --- |
| `UNVERIFIED` | No documents submitted | No action needed |
| `PENDING_REVIEW` | Documents submitted | Review and approve/reject |
| `APPROVED` | Identity confirmed | Verified badge shown |
| `REJECTED` | Documents not accepted | Notify landlord to resubmit |

<user_quoted_section>Note: The landlord verification UI is partially implemented. The backend endpoint POST /users/submit-verification is functional. Full admin review UI is in development.</user_quoted_section>

## Listing Moderation

### Viewing Inactive Listings

Go to the **Listings** section of the admin dashboard to view inactive listings.

Filters available:

- Status
- Pagination

### Bulk Reviving Listings

To restore multiple inactive listings at once:

1. Select the listings to revive
2. Click **Bulk Revive**
3. Set a new expiry date
4. Confirm — listings are set to `active`

**Listing statuses and admin actions:**

| Status | Admin Can | Notes |
| --- | --- | --- |
| `active` | Deactivate → `inactive` | Removes from tenant search |
| `expired` | Bulk revive → `active` | Restores visibility |
| `inactive` | Bulk revive → `active` | Restores visibility |
| `pending_payment` | No direct action | Awaiting payment confirmation |
| `early_access` | No direct action | Transitions automatically |

## Provider Management

Providers register via `/provider-signup`. Their accommodation starts as `PENDING` verification and `isPublished: false`.

### Verifying a Provider

1. Go to the **Providers** section of the admin dashboard
2. Find the provider (filter by verification status or search by name/email)
3. Click **Approve** or **Reject**

**What happens on approval:**

- `providerProfile.verificationStatus` → `approved`
- All provider accommodations: `verificationStatus` → `APPROVED`
- `provider.approved` notification sent to provider

**What happens on rejection:**

- `providerProfile.verificationStatus` → `rejected`
- All provider accommodations: `verificationStatus` → `REJECTED`
- `provider.rejected` notification sent to provider

### Updating Commission Rate

Each provider has a commission rate (default: 10%). To update:

1. Find the provider in the admin dashboard
2. Click **Update Commission**
3. Enter a value between 0 and 100
4. Save — the rate is applied to the provider profile and all their accommodations

### Suspending / Reinstating a Provider

| Action | Effect | Notification |
| --- | --- | --- |
| Suspend | Provider cannot accept new bookings | `provider.suspended` sent |
| Reinstate | Provider restored to normal operation | `provider.reinstated` sent |

## Accommodation Moderation

Accommodations must be approved before they are published and visible to guests.

### Moderation Actions

| Action | Sets | Notification |
| --- | --- | --- |
| **Approve** | `moderationStatus: APPROVED`, `isPublished: true` | `accommodation.approved` |
| **Reject** | `moderationStatus: REJECTED`, `isPublished: false` | `accommodation.rejected` |
| **Suspend** | `moderationStatus: SUSPENDED`, `isPublished: false` | `accommodation.suspended` |
| **Reinstate** | `moderationStatus: APPROVED`, `isPublished: true` | None |

### Moderation Queue

The **Moderation Queue** (`GET /admin/queue`) shows all items awaiting review, including accommodations pending approval.

## Booking Management & Settlement

### Viewing All Bookings

Admins can view all bookings across the platform via the admin dashboard bookings section or `GET /api/v1/bookings/` (admin role required).

### Settling a Booking

When a booking is completed and payment has been received, admins can mark it as settled:

1. Find the booking in the admin dashboard
2. Click **Settle**
3. Enter a settlement reference
4. Confirm — `settlementStatus` is set to `SETTLED`, `settledAt` is recorded

**Booking statuses:**

| Status | Meaning |
| --- | --- |
| `PENDING_CONFIRMATION` | Awaiting provider confirmation (REQUEST mode) |
| `PENDING_PAYMENT` | Awaiting payment |
| `CONFIRMED` | Booking confirmed |
| `DECLINED` | Provider declined |
| `CANCELLED` | Cancelled by guest, provider, or admin |
| `CHECKED_IN` | Guest has checked in |
| `COMPLETED` | Stay completed |
| `EXPIRED` | Booking expired without payment |
| `REFUNDED` | Booking refunded |

## Dispute Management

Disputes are raised by guests or providers on bookings. Admins manage the full dispute lifecycle.

```mermaid
stateDiagram
    [*] --> OPEN: Dispute raised
    OPEN --> UNDER_REVIEW: Admin marks under review
    UNDER_REVIEW --> RESOLVED: Admin resolves
    UNDER_REVIEW --> CLOSED: Admin closes
    RESOLVED --> [*]
    CLOSED --> [*]
```

### Dispute Workflow

1. **View disputes:** Go to the Disputes section of the admin dashboard
2. **Mark under review:** Click **Review** — status changes to `UNDER_REVIEW`
3. **Resolve:** Enter resolution text, click **Resolve** — both parties receive `dispute.resolved` notification
4. **Close:** For disputes that don't require resolution (e.g. withdrawn)

**Dispute fields:**

- `raisedBy` — user who raised the dispute
- `raisedByRole` — their role (guest or provider)
- `reason` — short reason
- `description` — full description
- `resolution` — admin's resolution text
- `resolvedBy` — admin who resolved it
- `resolvedAt` — timestamp

## Report Management

Users can report listings, accommodations, and reviews for: `spam`, `inappropriate`, `fraud`, `other`.

```mermaid
stateDiagram
    [*] --> OPEN: Report submitted
    OPEN --> UNDER_REVIEW: Admin marks under review
    UNDER_REVIEW --> RESOLVED: Admin resolves
    UNDER_REVIEW --> DISMISSED: Admin dismisses
    RESOLVED --> [*]
    DISMISSED --> [*]
```

### Report Workflow

1. **View reports:** Go to the Reports section of the admin dashboard
2. **Mark under review:** Click **Review**
3. **Resolve:** Enter resolution text — reporter receives `report.resolved` notification
4. **Dismiss:** For reports that are unfounded or duplicate

**Report target types:** `Listing`, `Accommodation`, `Review`

## Review Moderation

Admins can view all guest reviews and moderate them.

### Review Actions

| Action | Effect |
| --- | --- |
| **Publish** | Sets `isPublished: true` — review visible to public |
| **Unpublish** | Sets `isPublished: false` — review hidden from public |

### Review Analytics

The admin dashboard provides review analytics:

- Average overall rating
- Count by rating (1–5 stars)
- Breakdown by accommodation

## Notification Management

Notifications are delivered through four channels. Admins should be aware of the following operational details:

| Channel | Enabled By | Notes |
| --- | --- | --- |
| Email | Always (if SMTP configured) | Uses Nodemailer |
| In-App | Always | Direct DB insert |
| SMS | `SMS_ENABLED=true` env var | Africa's Talking |
| Push | VAPID keys configured | Web Push API |

**Notification worker:** The `notificationWorker.js` processes the `NotificationJob` queue. Jobs with status `pending` are picked up and delivered. Failed jobs are retried; after max retries, status becomes `dead`.

**Monitoring notifications:**

- Check `NotificationJob` table for `dead` status jobs
- Check email delivery logs for bounce rates
- Monitor push subscription expiry (expired subscriptions are auto-deleted on 410 response)

## Wallet & TR Token Administration

### Token Economy Overview

| Event | Amount | Direction |
| --- | --- | --- |
| Email verification (first time) | 100 TR | CREDIT to user |
| Google OAuth (new user) | 100 TR | CREDIT to user |
| Engagement approved | 5 TR | DEBIT from tenant |
| Listing restored | 1 TR × days | DEBIT from landlord |
| Premium service access | Configured token cost | DEBIT from the relevant token payer |
| Admin promo grant | variable | CREDIT to user |

### Admin Token Grants

Admins can grant tokens to users via the `walletService.grantTokens()` function. This creates a `WalletTransaction` record with `reason: "promo_grant"`.

<user_quoted_section>Note: There is no UI for admin token grants in v1.1. This must be done via direct API call or database operation.</user_quoted_section>

### Known Wallet Limitation

Token purchases are currently **demo-only** — no real payment is processed. Tokens are added to local Redux state only. This must be replaced with real payment integration before launch.

## Legal Document Management

Legal documents are managed through the admin dashboard at `/admin/legal-docs`.

**Available documents:**

| Slug | Title | Public URL |
| --- | --- | --- |
| `terms-of-use` | Terms of Use | `/terms` |
| `privacy-policy` | Privacy Policy | `/privacy` |
| `landlord-terms` | Landlord Agreement | `/landlord-terms` |
| `refund-policy` | Refund Policy | `/refund-policy` |
| `community-guidelines` | Community Guidelines | `/community-guidelines` |
| `trust-safety` | Trust & Safety | `/trust-safety` |

### Document Operations

| Operation | Effect |
| --- | --- |
| **Create** | Creates a new document version (version 1) |
| **Update** | Increments version number, archives previous version |
| **Archive** | Sets `isActive: false` — document no longer served publicly |

**Versioning:** Each update increments the `version` integer. Previous versions are archived with `archivedAt` timestamp.

**Public access:** `GET /api/v1/legal-docs/:slug` returns the active version of any document.

## Feature Flags

Feature flags control which features are visible to users. They are defined in file:real-app-frontend-main/src/config/featureFlags.ts.

| Flag | Current Value | Feature | To Enable |
| --- | --- | --- | --- |
| `FEATURED_LISTINGS` | `false` | Paid featured listing placement | Set to `true` in featureFlags.ts |
| `PREMIUM_VISIBILITY_BOOSTS` | `false` | Premium visibility boosts | Set to `true` in featureFlags.ts |
| `PHONE_VERIFICATION` | `false` | Phone verification UI for tenants | Set to `true` in featureFlags.ts |
| `ID_VERIFICATION` | `false` | ID verification UI for landlords | Set to `true` in featureFlags.ts |
| `PUBLIC_ROADMAP` | `false` | Public roadmap page | Set to `true` in featureFlags.ts |

**Backend environment flags:**

| Variable | Effect |
| --- | --- |
| `SKIP_EMAIL_VERIFICATION=true` | Bypasses email verification (dev/test only — never in production) |
| `SMS_ENABLED=true` | Enables SMS notification channel |
| `PAYMENT_PROVIDER` | `mock` (default), `paynow`, `stripe` |
| `ENGAGEMENT_FEE_TR` | TR token cost per engagement approval (default: 5) |
| `EXPIRY_SCAN_CRON` | Cron schedule for listing expiry scanner (default: `*/30 * * * *`) |
| `RECONCILIATION_INTERVAL_CRON` | Cron schedule for payment reconciliation (default: `*/15 * * * *`) |

## System Configuration

### Required Environment Variables (Backend)

| Variable | Purpose | Example |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | JWT signing secret (≥64 chars) | Random 64-char string |
| `JWT_EXPIRES_IN` | JWT expiry | `7d` |
| `APP_BASE_URL` | Frontend URL for email links | `https://townruins.com` |
| `FRONTEND_URL` | CORS allowed origin | `https://townruins.com` |
| `ADMIN_EMAIL` | Receives verification submissions | `admin@townruins.com` |
| `PAYMENT_PROVIDER` | Payment provider | `paynow` or `stripe` |
| `LISTING_FEE_AMOUNT` | Token cost for listing activation/restoration | `0` or configured amount |
| `TENANT_PREMIUM_AMOUNT` | Premium subscription price | `10` |
| `ENGAGEMENT_FEE_TR` | TR tokens per engagement | `5` |

### Required Environment Variables (Frontend)

| Variable | Purpose |
| --- | --- |
| `REACT_APP_API_URL` | Backend API base URL |
| `REACT_APP_TOKEN_PAYER_ROLE` | `LANDLORD` or `TENANT` |
| `REACT_APP_TENANT_PREMIUM_AMOUNT` | Premium price shown in UI |

### Background Job Schedules

| Job | Default Schedule | Configurable Via |
| --- | --- | --- |
| Listing Expiry Scanner | Every 30 minutes | `EXPIRY_SCAN_CRON` |
| Payment Reconciliation | Every 15 minutes | `RECONCILIATION_INTERVAL_CRON` |

## Audit Logs

Every admin action is automatically logged to the `AuditLog` table.

**Each log entry contains:**

- `adminId` — which admin performed the action
- `action` — what was done (e.g. `approve_accommodation`)
- `targetType` — what was acted on (e.g. `Accommodation`)
- `targetId` — the ID of the affected record
- `metadata` — additional context (JSON)
- `ipAddress` — admin's IP address
- `createdAt` — timestamp

**Viewing audit logs:** Go to the **Audit Logs** section of the admin dashboard, or query `GET /api/v1/admin/audit-logs`.

<user_quoted_section>Retention policy: Define and document your audit log retention policy before launch. Logs are not automatically purged.</user_quoted_section>

## Support Workflows

### User Cannot Log In

1. Confirm the user's email is verified (check `isEmailVerified` in DB)
2. If not verified, ask them to check spam or use "Resend verification email"
3. If verified but still can't log in, check for typos in email/password
4. If password forgotten, direct to `/forgot-password`

### User Reports Missing Tokens

1. Check the user's `WalletTransaction` records for the expected transaction
2. If the welcome bonus is missing, check `walletInitialized` flag — if `false`, the bonus was never granted
3. If tokens were deducted incorrectly, review engagement records
4. Admin can grant tokens manually via `walletService.grantTokens()` if needed

### Listing Not Appearing in Search

1. Check the listing's `status` — must be `active` or `early_access` (for premium tenants)
2. Check `expiresAt` — if in the past, the scanner should have set it to `expired`
3. If the scanner hasn't run, trigger `runExpiryScanner()` manually
4. If the listing is `inactive`, use bulk revive to restore it

### Payment Not Confirmed

1. Check the `Payment` record status
2. If `pending` and older than 15 minutes, the reconciliation job should pick it up
3. Manually trigger `runReconciliation()` if needed
4. Check payment provider dashboard for transaction status
5. If payment was taken but not confirmed, manually update payment status and apply side effects

## Incident Response

### Platform Outage

1. Check backend health: `GET /api/v1` — should return `{ status: "ok" }`
2. Check database connectivity (Prisma connection errors in logs)
3. Check background jobs are running (expiry scanner, reconciliation)
4. Check payment provider status pages
5. Notify users via email if outage exceeds 30 minutes

### Data Breach

1. Immediately rotate `JWT_SECRET` — this invalidates all active sessions
2. Rotate database credentials
3. Review audit logs for suspicious activity
4. Notify affected users per your privacy policy obligations
5. Document the incident

### Payment Provider Failure

1. Switch `PAYMENT_PROVIDER` to `mock` temporarily (development only)
2. Notify users that payments are temporarily unavailable
3. Monitor reconciliation job — it will retry pending payments when provider recovers
4. Review `Payment` records with `status: failed` after recovery

## Launch Checklist

### Authentication & Security

JWT_SECRET set to a strong random value (≥ 64 chars)JWT_EXPIRES_IN configured (e.g. 7d)SKIP_EMAIL_VERIFICATION is false or unsetCORS origins set to production domains onlyRate limiting active (global: 100/15min, payment: 10/15min)SEED_API_KEY not set or set to a strong secretHTTPS enforced on all endpointstrust proxy set correctly for load balancer

### Database

DATABASE_URL points to production PostgreSQLMigrations applied (prisma migrate deploy)Amenities seeded (npm run seed:amenities)Legal documents seeded (npm run seed:legal)Super admin seeded (npm run seed:super-admin)Database backups configuredConnection pooling configured

### Payments

PAYMENT_PROVIDER set to paynow or stripePayment provider credentials configuredWebhook endpoint secured and verifiedLISTING_FEE_AMOUNT and TENANT_PREMIUM_AMOUNT setReconciliation job running

### Notifications

SMTP credentials configuredAPP_BASE_URL set to production URLADMIN_EMAIL setEmail delivery tested end-to-endVAPID keys configured for push notificationsSMS enabled if required

### Frontend

REACT_APP_API_URL set to production backendFirebase config set for Google OAuthpublic/app-logo.png presentpublic/manifest.json configuredDark mode testedMobile layout tested

### Legal & Compliance

All legal documents published in CMSPrivacy policy accessible at /privacyTerms accessible at /terms

### Monitoring

Error tracking integrated (e.g. Sentry)Health check endpoint monitoredAudit log retention policy defined

### Testing

Unit tests passing (npm run test:unit)E2E tests passing (npm run test:e2e)Manual QA completed

## Maintenance Procedures

### Database Migrations

When deploying schema changes:

```
prisma migrate deploy
```

Always run migrations before deploying new backend code.

### Seeding

| Script | Purpose | When to run |
| --- | --- | --- |
| `npm run seed:amenities` | Seed amenity catalogue | Once on fresh DB |
| `npm run seed:legal` | Seed legal documents | Once on fresh DB |
| `npm run seed:super-admin` | Create super admin account | Once on fresh DB |

### Background Job Health

Monitor that background jobs are running:

- Listing expiry scanner: Check for `[listing-expiry]` log entries every 30 minutes
- Payment reconciliation: Check for `[reconciliation]` log entries every 15 minutes
- Notification worker: Check for notification delivery logs

### S3 CORS Configuration

If image uploads fail, reconfigure S3 CORS:

```
npm run s3:cors
```

## Deployment Considerations

**Backend deployment options:** Render (`render.yaml`), AWS Elastic Beanstalk (`.ebextensions/`), or any Node.js host.

**Frontend deployment options:** Netlify (`netlify.toml`), AWS Amplify (`amplify.yml`), or any static host.

**Key deployment files:**

- file:real-app-backend-main/render.yaml — Render deployment config
- file:real-app-backend-main/.ebextensions/01_prisma_migrate.config — EB migration hook
- file:real-app-frontend-main/amplify.yml — Amplify build config
- file:real-app-frontend-main/netlify.toml — Netlify config

**Post-deployment checklist:**

1. Verify health check: `GET /api/v1`
2. Verify database connectivity
3. Verify email delivery
4. Verify payment provider webhook
5. Verify background jobs are running

## Recovery Procedures

### Restore from Database Backup

1. Stop the backend service
2. Restore the PostgreSQL backup to the target database
3. Run `prisma migrate deploy` to ensure schema is current
4. Restart the backend service
5. Verify health check

### Reset Admin Password

Admin passwords are bcrypt-hashed. To reset:

1. Generate a new bcrypt hash (12 rounds)
2. Update the `password` field in the `User` table directly
3. Notify the admin of their new temporary password
4. Ask them to change it immediately via `/profile`

### Recover from Failed Migration

1. Check migration status: `prisma migrate status`
2. If a migration is in a failed state, resolve the conflict manually
3. Mark the migration as applied if the changes were applied manually: `prisma migrate resolve --applied {migration_name}`

## Known Operational Limitations

| Limitation | Impact | Workaround |
| --- | --- | --- |
| Token purchase is demo-only | No real revenue from token sales | Replace with real payment integration before launch |
| Wallet balance can diverge | User may see incorrect balance on new device | Server balance is authoritative; synced on app mount |
| Reconciliation job has no batch limit | Could be slow at scale with many pending payments | Add `take` limit to reconciliation query |
| Home page shows "MongoDB" error message | Incorrect error text (platform uses PostgreSQL) | Fix the error message in `Home/index.tsx` |
| Admin token grants require direct API/DB access | No UI for admin token grants | Build admin token grant UI |
| No user list UI in admin dashboard | Cannot browse all users from dashboard | Use database queries or build user management UI |
| SMS disabled by default | SMS notifications not delivered | Set `SMS_ENABLED=true` and configure Africa's Talking |
| Push notifications require VAPID setup | Push not delivered without VAPID keys | Configure VAPID keys before launch |

## Glossary

| Term | Definition |
| --- | --- |
| **TR Token** | Town Ruins' in-app currency |
| **Engagement** | A tenant's contact request to a landlord |
| **Accommodation** | A provider's property (hotel, lodge, BnB, etc.) |
| **Moderation Status** | Admin-controlled status of an accommodation (`PENDING_REVIEW`, `APPROVED`, `REJECTED`, `SUSPENDED`) |
| **Verification Status** | Identity verification status of a landlord or provider |
| **Commission Rate** | Percentage of booking revenue taken by the platform (default: 10%) |
| **Settlement** | Admin marking a booking's payout as completed |
| **Audit Log** | Immutable record of every admin action |
| **Feature Flag** | A toggle that enables/disables a feature without code deployment |
| **Reconciliation Job** | Background job that polls payment providers for pending payment status |
| **Expiry Scanner** | Background job that marks expired listings and sends notifications |
| **Notification Worker** | Background job that processes the notification delivery queue |
| **VAPID** | Voluntary Application Server Identification — required for web push notifications |
| **Idempotency Key** | A unique key that prevents duplicate payment processing |

*Town Ruins v1.1 · Administrator Guide · Internal Use Only · townruins.com*