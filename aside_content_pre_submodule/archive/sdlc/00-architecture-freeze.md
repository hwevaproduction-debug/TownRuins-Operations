# Architecture Freeze

Freeze date: 2026-05-10

This document records the current architecture only. Do not redesign the app from this point without creating a new architecture decision record. Use this as the handoff map when switching tools, agents, or implementation focus.

## Current Product Shape

Creapy is currently a rental marketplace SPA with a Node/Express API. The implemented product areas are:

- Tenants can browse listings, search, save searches, manage profile, buy tenant premium, and book short stays.
- Landlords can sign up, verify phone, create one active listing, manage their listing, and pay listing fees.
- Providers can register a short-stay business, manage rooms, availability, profile, and booking actions.
- Admins can review inactive listings, revive listings, manage providers, review bookings, and settle bookings.

## Current Stack

### Frontend

- React 18 with Create React App and TypeScript.
- React Router v6 for route-level navigation.
- Redux Toolkit and RTK Query for API state.
- Material UI v5 plus Emotion for UI components.
- Formik and Yup for forms and validation.
- Firebase Auth SDK for Google sign-in and password-reset email.
- React Icons, MUI Icons, Swiper, Day.js, Moment, libphonenumber-js.
- Build/deploy configs exist for AWS Amplify and Netlify, with Amplify documented as canonical.

### Backend

- Node.js with Express 4.
- Prisma Client 5 with PostgreSQL datasource.
- JWT authentication with `jsonwebtoken`; password hashing with `bcryptjs`.
- Express Validator validation middleware.
- Express rate limiting.
- Nodemailer email delivery, currently configured for Gmail SMTP via environment variables.
- Africa's Talking SMS integration with mock mode.
- Paynow payment integration through a provider abstraction, plus mock provider.
- AWS SDK S3 signed upload URLs.
- Node built-in test runner for backend tests.

### Deployment And Runtime

- Canonical deployment is AWS Amplify frontend plus AWS Amplify backend compute.
- Root `amplify.yml` describes the monorepo setup for separate frontend/backend Amplify apps.
- Backend build runs Prisma generate and attempts Prisma migrations.
- Legacy Render and Netlify configs remain, but are not canonical.

## Completed Modules

- Authentication: email/password signup, login, Google login, JWT protect middleware, optional auth middleware, role guards, email verification, landlord phone OTP verification.
- Public listing marketplace: listing search, listing detail, home highlighted feed, grouped-by-location home feed.
- Landlord listing flow: create/update/delete listing, single active listing rule, payment deadline lifecycle, transition to pending payment.
- Tenant saved searches: create/list/delete saved searches and email notifications when new listings match.
- Payments: listing fee initiation, tenant premium initiation, booking payment initiation, Paynow/mock provider abstraction, Paynow webhook handling.
- Uploads: signed S3 upload URL endpoint and frontend upload API slice.
- Short stays: provider signup/profile, rooms, room availability, room blocks, stay search API, booking creation, guest bookings, provider bookings, booking confirm/decline/cancel, admin booking settlement.
- Dashboards: tenant, landlord, provider, admin, and listing payment views exist.
- Admin APIs: inactive listing review/bulk revive, provider verification/commission, booking review/settlement.
- Deployment docs/config: Amplify backend/frontend setup and environment variable documentation.
- Backend tests: auth, app routes, admin, listings, location compatibility, monetization, home feeds, and e2e flows.

## Pending Modules

- Extension logic: no browser extension package, manifest, content script, background worker, or extension-specific API contract exists in this repo.
- Realtime sync: no websocket, Socket.IO, SSE, push-notification, or realtime database layer exists.
- Analytics: only CRA web-vitals scaffolding exists; no product analytics schema, event tracking, dashboard, or provider integration is implemented.
- Onboarding: signup and provider signup exist, but role-specific onboarding checklists and guided next steps are not implemented as a dedicated module.
- Billing hardening: one-off payments and 30-day premium exist; recurring billing, invoices, refunds, disputes, and payment reconciliation dashboard are not complete.
- Dashboard/API contract cleanup: several frontend calls currently expect endpoints or HTTP methods the backend does not expose.
- Security/secrets hygiene: environment templates should not contain real credentials; production secrets should live only in provider-managed secret stores.
- Frontend automated coverage: backend tests exist, but frontend route/component/API integration coverage is thin.

## APIs Already Integrated

### Internal API

Base path is `/api/v1`; `/api/listings` is kept as a legacy alias for listings.

- `GET /api/v1` health check.
- `/api/v1/users`: signup, login, Google login, email verification, phone verification, resend OTP, current user, listing-owner lookup, update, delete.
- `/api/v1/listings`: public listing search/detail/home feeds plus landlord listing CRUD and lifecycle transition.
- `/api/v1/saved-searches`: tenant saved-search CRUD.
- `/api/v1/payments`: listing fee, tenant premium, current user's payments.
- `/api/v1/uploads`: signed upload URL.
- `/api/v1/rooms`: provider room CRUD, room availability, blocked dates.
- `/api/v1/providers`: provider registration/profile, admin provider list/verification/commission.
- `/api/v1/bookings`: guest/provider/admin booking flows, payment initiation, cancel, confirm, decline, settle.
- `/api/v1/stays`: public stay search and provider stay detail.
- `/api/v1/admin`: inactive listing review and bulk revive.
- `/webhooks/payment`: Paynow webhook.

### External Services

- Firebase Auth: Google sign-in and password reset.
- Paynow: listing fees, tenant premium, booking payments, payment webhook verification.
- Mock payment provider: local/test payment flow.
- Gmail SMTP via Nodemailer: verification and notification emails.
- Africa's Talking: SMS OTP delivery, with mock mode.
- AWS S3: signed upload URLs and public asset URLs.
- AWS Amplify: canonical frontend/backend deployment.
- PostgreSQL: application database through Prisma.

## Database Schema

The canonical schema is `real-app-backend-main/prisma/schema.prisma`.

### User

Purpose: accounts for tenants, landlords, providers, and admins.

Key fields:

- `id`, `username`, `email`, `password`, `avatar`, `role`
- `phoneNumber`, `nationalId`
- `isEmailVerified`, `isPhoneVerified`
- `phoneOtp`, `phoneOtpExpires`
- `emailVerificationToken`, `emailVerificationExpires`
- `premiumExpiry`
- `providerProfile` JSON
- timestamps: `createdAt`, `updatedAt`

Relations:

- Listings, payments, rooms, guest bookings, provider bookings, saved searches, blocked dates.

### Listing

Purpose: long-term rental listing owned by a landlord.

Key fields:

- `id`, `name`, `description`, `address`, `phoneNumber`
- `monthlyRent`, `bathrooms`, `bedrooms`, `totalRooms`, `furnished`
- `province`, `city`, `addressLine`, `lat`, `lng`
- `amenities` JSON, `imageUrls` JSON
- `status`, `earlyAccessUntil`, `publishedAt`, `paymentDeadline`
- `type`, `offer`, `studentAccommodation`
- `userId`
- timestamps: `createdAt`, `updatedAt`

Indexes:

- `[userId, status]`

### Room

Purpose: provider-owned short-stay room.

Key fields:

- `id`, `providerId`, `name`, `description`, `roomType`, `capacity`
- `basePricePerNight`, `pricingRules` JSON
- `amenities` JSON, `imageUrls` JSON
- `status`, `bookingMode`, `maxAdvanceBookingDays`
- `cancellationPolicy`, `cancellationPolicyCustomText`
- timestamps: `createdAt`, `updatedAt`

Indexes:

- `[providerId, status]`

### Booking

Purpose: guest booking for a short-stay room.

Key fields:

- `id`, `roomId`, `providerId`, `guestId`
- `checkIn`, `checkOut`, `nights`, `guestCount`
- `pricePerNight`, `subtotal`, `commissionRate`, `commissionAmount`, `totalAmount`, `totalPrice`, `netPayout`
- `status`, `bookingMode`, `paymentStatus`, `paymentRef`
- `settlementStatus`, `settledAt`, `settlementReference`
- `specialRequests`, `cancelledBy`, `cancellationReason`, `cancellationPolicy`, `refundAmount`, `cancelledAt`
- timestamps: `createdAt`, `updatedAt`

Indexes:

- `[roomId, checkIn, checkOut, status]`
- `[guestId, createdAt]`

### Payment

Purpose: payment records for listing fees, premium subscriptions, and booking payments.

Key fields:

- `id`, `userId`, `amount`, `method`, `status`, `type`
- `listingId`, `bookingId`
- `transactionRef` unique
- `webhookVerified`
- timestamps: `createdAt`, `updatedAt`

Relations:

- User, optional listing, optional booking.

### SavedSearch

Purpose: tenant saved-search criteria and notification preference.

Key fields:

- `id`, `userId`, `name`, `criteria` JSON
- `notifyBy`, `isActive`, `lastNotifiedAt`
- timestamps: `createdAt`, `updatedAt`

Indexes:

- `[userId]`
- `[isActive]`

### BlockedDate

Purpose: provider-blocked room availability.

Key fields:

- `id`, `roomId`, `providerId`
- `startDate`, `endDate`, `reason`
- timestamps: `createdAt`, `updatedAt`

Indexes:

- `[roomId, startDate, endDate]`

## Auth Flow

### Email/Password Signup

- Frontend public routes expose `/signup`, `/login`, `/forgot-password`, `/provider-signup`, `/verify-email`, and `/verify-phone`.
- Tenant/landlord signup posts to `POST /api/v1/users/signup`.
- Provider signup posts to `POST /api/v1/providers/register`.
- Backend hashes passwords with bcrypt.
- Backend creates an email verification token unless `SKIP_EMAIL_VERIFICATION=true`.
- Landlords require `phoneNumber` and `nationalId`.
- Landlords must pass phone OTP verification unless `SKIP_PHONE_VERIFICATION=true`.
- Verified users receive a JWT and normalized user payload.

### Login And Session Storage

- Login posts to `POST /api/v1/users/login`.
- Backend rejects unverified email users and unverified landlord phone users.
- Frontend stores the backend response in Redux and `localStorage` under `user`.
- RTK Query attaches `Authorization: Bearer <token>` from Redux state.
- Protected frontend routes check current auth state and optional allowed roles.

### Google Login

- Frontend uses Firebase popup sign-in.
- The Firebase user payload is sent to `POST /api/v1/users/google`.
- Backend creates or updates a local user and marks email/phone verified.
- User is redirected by role after login.

### Password Reset

- `/forgot-password` uses Firebase `sendPasswordResetEmail`.
- No backend password-reset endpoint currently exists.

## UI Components Already Done

### Shared Components

- `Header`
- `Heading` / `SubHeading`
- `SearchBar`
- `SelectInput`
- `PhoneInput`
- `PrimaryInput`
- `DatePicker`
- `MUITable`
- `OAuth`
- `CustomChip`
- `Spinner`, `DotLoader`, `OverlayLoader`
- `ToastAlert`
- `AppButton`
- `AppCard`
- `AppContainer`
- `AppInput`
- `AppSelect`

### Views

- `Home`
- `About`
- `Search`
- `Login`
- `SignUp`
- `ForgotPassword`
- `VerifyEmail`
- `VerifyPhone`
- `ProviderSignUp`
- `Profile`
- `SavedSearches`
- `Listing` create/edit
- `ViewListing`
- `AllListings`
- `Dashboard/Landlord`
- `Dashboard/Tenant`
- `Dashboard/Provider`
- `Dashboard/Admin`
- `Dashboard/Payment`
- `Stays`
- `Stays/RoomDetail`
- `Stays/MyBookings`
- `NotFound`

### Route Guards

- `PublicRoutes`
- `ProtectedRoutes` with optional `allowedRoles`

## Known Contract Gaps To Fix Before Marking Slices Complete

- Frontend provider profile update uses `PATCH /providers/me`; backend exposes `PUT /providers/me`.
- Frontend room update uses `PATCH /rooms/:id`; backend exposes `PUT /rooms/:id`.
- Frontend provider settlement summary calls `GET /providers/me/settlements`; backend has booking settlement actions but no provider settlement summary route.
- Frontend stay search tries `GET /rooms/search` and `GET /rooms`; backend public stay search is `GET /stays`.
- Frontend stay detail tries `GET /rooms/public/:id`, `GET /rooms/:id`, `GET /stays/rooms/:id`, and `GET /stays/:id`; backend currently has `GET /stays/:providerId`, not room detail by room id.
- Frontend block-date logic first tries `POST /rooms/:id/blocks`; backend exposes `POST /rooms/:id/block`, with frontend fallback already present.
- Several provider-dashboard form fields use generic names like `price`, `image`, `location`, and `bio`; backend room/profile fields are more specific.
- `GET /users/:id` currently returns the owner of a listing id, not a user by user id.

## Vertical Slice Roadmap

Finish one slice at a time. Each slice should end with UI, backend, schema, tests, and deployment/env notes aligned.

### 1. Authentication

Definition of done:

- Email/password signup/login works for tenant, landlord, provider, and admin test accounts.
- Email verification and landlord phone OTP are either fully wired or intentionally disabled per environment.
- Google login creates/updates a local account and redirects by role.
- `localStorage` and Redux auth state stay in sync.
- Protected route behavior is covered.

### 2. Dashboard

Definition of done:

- Tenant dashboard premium and saved-search flows work.
- Landlord dashboard listing management and listing fee payment work.
- Provider dashboard rooms, bookings, availability, profile, and settlements either work or unavailable tabs are removed until implemented.
- Admin dashboard inactive listings, provider verification, commission, bookings, and settlements work.
- Resolve all frontend/backend contract gaps listed above.

### 3. Extension Logic

Definition of done:

- Decide whether "extension" means browser extension, listing extension, or premium extension.
- If browser extension: create a separate package with manifest, auth bridge, API client, and clear permissions.
- If billing/listing extension: document the domain model and implement it through existing API/payment patterns.
- No extension code should be mixed into unrelated dashboard or auth work.

### 4. Backend API

Definition of done:

- Route map matches frontend RTK Query slices.
- Response shapes are normalized for `_id`/`id`, `data`, `results`, and nested entities.
- Validation exists for create/update/payment routes.
- Backend tests cover happy paths and role failures for each implemented route.

### 5. Realtime Sync

Definition of done:

- Choose polling, SSE, websocket, or provider-specific push based on actual use case.
- Payment status, booking status, and notifications update without manual refresh.
- Reconnect and stale-state behavior is documented and tested.

### 6. Onboarding

Definition of done:

- Tenant, landlord, and provider have role-specific next-step flows after signup.
- Landlord onboarding covers verification, listing creation, upload, and payment.
- Provider onboarding covers business profile, admin approval, first room, availability, and payout details.
- Incomplete onboarding state is persisted.

### 7. Billing

Definition of done:

- Listing fee, tenant premium, and booking payment states are consistent from initiation through webhook.
- Webhook idempotency is covered.
- Payment history is visible to relevant roles.
- Premium expiry and listing lifecycle behavior are tested.
- Refunds, invoices, recurring billing, and reconciliation are either implemented or explicitly out of scope.

### 8. Analytics

Definition of done:

- Define event taxonomy for signup, login, listing search, listing view, saved search, payment initiation, payment success, booking request, booking confirmation, and admin actions.
- Add a provider or internal endpoint.
- Include privacy/PII rules.
- Add dashboard or export path for funnel reporting.

### 9. Deployment

Definition of done:

- Amplify frontend and backend apps build from clean checkout.
- Environment variables are documented without real credentials.
- Prisma migrations run reliably against production database.
- CORS, Paynow result URL, Firebase API key, S3 bucket, SMTP, and SMS values are verified.
- CI runs backend tests and any frontend tests added during slices.
