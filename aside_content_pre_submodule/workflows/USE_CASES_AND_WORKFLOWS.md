---
title: Use Cases & Workflows
description: Master use-case and workflow documentation for the Town Ruins platform, covering all user roles, view operations, and API workflows.
tags:
  - workflows
  - use-cases
  - user-journeys
  - api-workflows
aliases:
  - Workflows
  - Master Workflows
---

# Town Ruins — Master Use-Case & Workflow Documentation

> **Location:** `workflows/` at the repository root (not gitignored)
> **Purpose:** Single source of truth for all user roles, use cases, view operations, and API workflows. Downstream docs (API reference, onboarding guides, QA test plans, admin runbooks) are derived from this document.

---

## 1. System Overview

**Town Ruins** (`townruins.com`) is a dual-sided rental marketplace for Zimbabwe:

| Side | Roles | Core Value |
|---|---|---|
| **Listing marketplace** | `tenant`, `landlord` | Tenants find long-term rentals; landlords list properties |
| **Short-stay platform** | `tenant` (guest), `provider` | Guests book hotel/lodge/BnB rooms; providers manage accommodation |
| **Administration** | `admin`, `super_admin` | Moderation, settlement, legal docs, audit |

**Tech stack:**
- Frontend: React 18 + TypeScript, Redux Toolkit (RTK Query), MUI v5, React Router v6
- Backend: Node.js + Express, Prisma ORM, PostgreSQL
- Storage: AWS S3 / Cloudflare R2 (signed URLs)
- Payments: Paynow (EcoCash) + Stripe
- Notifications: Email (Nodemailer), SMS (Africa's Talking), Push (Web Push), In-App
- Auth: JWT + Google OAuth + Email/Phone OTP

---

## 2. User Roles & Role Routing

| Role | Dashboard Route | Key Capabilities |
|---|---|---|
| `tenant` | `/dashboard/tenant` | Search listings, save searches, engage landlords, book stays, premium membership |
| `landlord` | `/dashboard/landlord` | Create/manage listings, respond to engagements, pay listing fees |
| `provider` | `/dashboard/provider` | Manage accommodation, rooms, bookings, pricing, payouts |
| `admin` / `super_admin` | `/dashboard/admin` | Moderation queue, provider verification, settlement, legal docs, audit logs |

**Role routing logic (ProtectedRoutes):**
- Unauthenticated → redirect to `/login` with `from` state
- Wrong role → redirect to own dashboard
- Correct role → render children

---

## 3. Route Map

### 3.1 Public Routes (no auth required)

| Path | View | Description |
|---|---|---|
| `/` | `Home` | Hero slideshow, highlighted listings, grouped-by-location feed |
| `/search` | `Search` | Listing search with sidebar filters |
| `/listing/:id` | `ViewListing` | Single listing detail page |
| `/stays` | `Stays` | Stay/room search with filters |
| `/stays/rooms/:roomId` | `StayRoomDetail` | Room detail + booking calendar |
| `/about` | `About` | About page |
| `/terms` | `TermsOfUse` | Legal |
| `/privacy` | `PrivacyPolicy` | Legal |
| `/landlord-terms` | `LandlordTerms` | Legal |
| `/refund-policy` | `RefundPolicy` | Legal |
| `/community-guidelines` | `CommunityGuidelines` | Legal |
| `/trust-safety` | `TrustSafety` | Legal |
| `/docs` | `DocsHub` | Documentation hub |
| `/docs/release-notes` | `ReleaseNotes` | Release notes |
| `/docs/tr-tokens` | `TRTokens` | TR Token explainer |
| `/docs/tenant-guide` | `TenantGuide` | Tenant guide |
| `/docs/landlord-guide` | `LandlordGuide` | Landlord guide |
| `/docs/roadmap` | `Roadmap` | Product roadmap |

### 3.2 Auth Routes (redirect to dashboard if logged in)

| Path | View | Description |
|---|---|---|
| `/signup` | `SignUp` | Email/password registration |
| `/login` | `Login` | Email/password + Google OAuth |
| `/forgot-password` | `ForgotPassword` | Request password reset email |
| `/reset-password` | `ResetPassword` | Consume reset token + set new password |

### 3.3 Semi-Protected Routes

| Path | View | Description |
|---|---|---|
| `/verify-email` | `VerifyEmail` | Consume email verification token from URL |
| `/verify-phone` | `VerifyPhone` | Enter SMS OTP |
| `/onboarding` | `Onboarding` | Post-signup onboarding flow |
| `/provider-signup` | `ProviderSignUp` | Provider registration form |

### 3.4 Protected Routes (auth required)

| Path | Allowed Roles | View |
|---|---|---|
| `/profile` | any | `Profile` |
| `/notifications` | any | `Notifications` |
| `/saved-searches` | any | `SavedSearches` |
| `/stays/bookings` | any | `MyStayBookings` |
| `/stays/bookings/:id` | any | `BookingConfirmation` |
| `/dashboard/tenant` | `tenant` | `TenantDashboard` |
| `/dashboard/landlord` | `landlord` | `LandlordDashboard` |
| `/dashboard/provider` | `provider` | `ProviderDashboardShell` |
| `/dashboard/admin` | `admin`, `super_admin` | `AdminDashboard` |
| `/create-listing` | `landlord` | `CreateListing` (wizard) |
| `/listings/:id` | `landlord` | `CreateListing` (edit mode) |
| `/listings/:id/pay` | `landlord` | `ListingPayment` |

---

## 4. Authentication Workflows

### 4.1 Email/Password Sign-Up

1. User fills signup form (username, email, password)
2. `POST /api/v1/users/signup` → creates User (role=tenant), sends verification email
3. Response: `{ token, user }` → stored in Redux + localStorage
4. Redirect to `/verify-email`
5. User clicks email link → `GET /api/v1/users/verify-email?token=...`
6. Backend sets `isEmailVerified=true`

### 4.2 Google OAuth

1. User clicks "Continue with Google"
2. Firebase `signInWithPopup(GoogleAuthProvider)` → `idToken`
3. `POST /api/v1/users/google { idToken }` → backend verifies, upserts user
4. Response: `{ token, user }` → stored in Redux + localStorage
5. Redirect to dashboard by role

### 4.3 Phone Verification

1. User navigates to `/verify-phone`
2. `POST /api/v1/users/resend-phone-otp { email }` → SMS OTP sent via Africa's Talking
3. User enters OTP
4. `POST /api/v1/users/verify-phone { otp, email }` → sets `isPhoneVerified=true`

### 4.4 Password Reset

1. `POST /api/v1/users/forgot-password { email }` → sends reset link
2. User clicks link → `/reset-password?token=...`
3. `POST /api/v1/users/reset-password { token, password }` → updates password

### 4.5 Check Availability

- `GET /api/v1/users/check-availability?email=` or `?username=`
- Used during signup for real-time duplicate detection

---

## 5. Tenant Workflows

### 5.1 Listing Search & Discovery

**View:** `real-app-frontend-main/src/views/Search/index.tsx`

**Filter parameters:**
- `searchTerm`, `province` (location), `city`, `neighborhood`
- `minRent`, `maxRent` (slider, 0–5000)
- `minTotalRooms` (stepper)
- `type`: all / rent / student
- Amenities: solar, borehole, security, internet
- Features: parking, furnished, offer
- `sort`: createdAt_desc / createdAt_asc / monthlyRent_desc / monthlyRent_asc

**Behaviour:**
- Desktop: sticky sidebar, debounced auto-search (600ms text, 400ms other)
- Mobile: bottom-drawer filter panel, explicit "Apply Filters" button
- Pagination: "Show More" appends next page
- Recently viewed stored in `localStorage.tr_recently_viewed`

**API:** `GET /api/v1/listings/get?{queryString}` (direct fetch)

### 5.2 Listing Engagement (Tenant → Landlord)

1. Tenant views listing detail (`/listing/:id`)
2. Clicks "Contact Landlord" → `ContactModal` opens
3. Submits message → `POST /api/v1/engagements { listingId, message }`
4. Landlord receives notification
5. Landlord approves/declines from dashboard
6. If approved: tenant sees landlord phone + address in dashboard

**API endpoints:**
- `POST /api/v1/engagements`
- `GET /api/v1/engagements/mine`
- `PATCH /api/v1/engagements/:id { action: approve|decline }`

### 5.3 Saved Searches

- Save current search criteria with name + notification preference
- `POST /api/v1/saved-searches { name, criteria, notifyBy }`
- `GET /api/v1/saved-searches/mine`
- `DELETE /api/v1/saved-searches/:id`

### 5.4 Premium Membership

- View status and expiry on `/dashboard/tenant`
- Upgrade/renew: enter EcoCash number → `POST /api/v1/payments/tenant-premium { phone }`
- Frontend polls `GET /api/v1/users/me` every 5s until `premiumExpiry` updates
- Premium grants early access to new listings (`status=early_access`)

### 5.5 Tenant Dashboard KPIs

| Metric | Source |
|---|---|
| Landlords Contacted | `engagements.length` |
| Approved | `engagements.filter(APPROVED).length` |
| Pending | `engagements.filter(PENDING).length` |
| Properties Viewed | `localStorage.tr_recently_viewed.length` |

---

## 6. Landlord Workflows

### 6.1 Listing Creation (Draft-Based Wizard)

1. Navigate to `/create-listing`
2. `GET /api/v1/listing-drafts/mine` → hydrate form from existing draft
3. Fill fields; auto-save every 1500ms → `PUT /api/v1/listing-drafts/:id` (or `POST` if new)
4. Submit → `POST /api/v1/listings`
5. Backend creates listing with `status=pending_payment`
6. Redirect to `/listings/:id/pay`

**Listing fields:** name, description, address, province, city, addressLine, lat/lng, phoneNumber, monthlyRent, bathrooms, bedrooms, totalRooms, furnished, type, offer, studentAccommodation, amenities (JSON), imageUrls

### 6.2 Listing Payment (Activation)

1. Navigate to `/listings/:id/pay`
2. Enter EcoCash number → `POST /api/v1/payments/listing-fee { listingId, phone }`
3. Paynow sends USSD prompt to phone
4. User approves → Paynow calls `POST /webhooks/payment`
5. Backend updates listing status to `active` or `early_access`

### 6.3 Listing Lifecycle

| Status | Meaning | Action |
|---|---|---|
| `pending_payment` | Created, awaiting fee | Pay Now |
| `early_access` | Paid, visible to premium tenants only | — |
| `active` | Fully public | Edit, Delete |
| `expired` | Past `expiresAt` | Restore (costs tokens) |
| `inactive` | Admin-deactivated | Revive (pay to restore) |

### 6.4 Listing Restore

- `POST /api/v1/listings/:id/restore { days }`
- Costs TR Tokens (deducted from wallet)
- `ListingRestoreModal` shows token cost before confirming

### 6.5 Engagement Management

- View incoming requests on `/dashboard/landlord`
- Approve → tenant sees contact details; landlord wallet credited (token reward)
- Decline → engagement marked DECLINED
- `PATCH /api/v1/engagements/:id { action: approve|decline }`

### 6.6 Landlord Dashboard KPIs

| Metric | Source |
|---|---|
| Active Listings | `listings.filter(status=active).length` |
| Expiring Soon | listings expiring within 24h |
| Token Balance | Redux wallet state |
| Pending Requests | `incomingEngagements.filter(PENDING).length` |

---

## 7. Provider Workflows

### 7.1 Provider Registration

1. Navigate to `/provider-signup`
2. Fill form: businessName, accommodationType, province, city, addressLine, contactPhone, registrationNumber
3. `POST /api/v1/providers/register`
4. Creates user (role=provider) + Accommodation (verificationStatus=PENDING)
5. Admin must approve before accommodation is bookable

### 7.2 Provider Dashboard Shell

**View:** `real-app-frontend-main/src/views/Dashboard/provider/ProviderDashboardShell.tsx`

7 tabs (lazy-loaded via React.lazy + Suspense):

| Tab | Component | Purpose |
|---|---|---|
| 0 — Rooms | `RoomsTab` | CRUD rooms, images, booking mode |
| 1 — Bookings | `BookingsTab` | Manage guest bookings |
| 2 — Calendar | `CalendarTab` | Availability blocks, pricing by date |
| 3 — Pricing | `PricingTab` | Seasonal rates, room fees, tax |
| 4 — Analytics | `AnalyticsTab` | Revenue, occupancy charts |
| 5 — Policies | `PolicyTab` | Cancellation, check-in/out rules |
| 6 — Payouts | `PayoutsTab` | Settlement summary and history |

**Shell KPIs:**

| Stat | Calculation |
|---|---|
| Total Rooms | `rooms.length` |
| Active Bookings | bookings with status PENDING_CONFIRMATION / CONFIRMED / CHECKED_IN |
| Pending Payout | sum of `netPayout` for PENDING settlement + payable status bookings |
| Occupancy Rate | from analytics endpoint |

### 7.3 Listing Wizard (New Accommodation)

6 steps with draft persistence (auto-save 1500ms debounce):

| Step | Component | Fields |
|---|---|---|
| 1 — Info | `AccommodationStep` | type, name, description, province, city, addressLine, contactPhone, registrationNumber |
| 2 — Rooms | `RoomsStep` | name, roomType, capacity, basePricePerNight, bookingMode, minNights, maxNights |
| 3 — Images | `ImagesStep` | accommodation images + room images via R2 signed URLs |
| 4 — Pricing | `PricingStep` | seasonal rates, room fees, tax rule |
| 5 — Policies | `PoliciesStep` | cancellation policy, check-in/out rules |
| 6 — Review | `ReviewStep` | Summary + final submit |

On submit: `POST /api/v1/accommodations` → `POST /api/v1/rooms` (per room) → `POST /api/v1/accommodations/:id/images` → `DELETE /api/v1/listing-drafts/:id`

### 7.4 Room Management

| Operation | API |
|---|---|
| Create room | `POST /api/v1/rooms` |
| Update room | `PATCH /api/v1/rooms/:id` |
| Delete room | `DELETE /api/v1/rooms/:id` |
| Add room image | `POST /api/v1/rooms/:id/images` |
| Update room image | `PATCH /api/v1/rooms/:id/images/:imageId` |
| Delete room image | `DELETE /api/v1/rooms/:id/images/:imageId` |

**Room fields:** name, description, roomType (SINGLE/DOUBLE/TWIN/SUITE/DORMITORY/STUDIO/ENTIRE_UNIT), capacity, basePricePerNight, status (AVAILABLE/UNAVAILABLE/MAINTENANCE), bookingMode (INSTANT/REQUEST), maxAdvanceBookingDays, minNights, maxNights

### 7.5 Booking Lifecycle

```
PENDING_CONFIRMATION
→ CONFIRMED (provider confirms, REQUEST mode)
→ DECLINED (provider declines)
→ PENDING_PAYMENT (INSTANT mode auto-confirm)
PENDING_PAYMENT
→ CONFIRMED (payment received)
CONFIRMED
→ CHECKED_IN (provider checks in guest)
→ CANCELLED (guest or provider cancels)
CHECKED_IN
→ COMPLETED (auto on checkout date)
```

| Action | API | Condition |
|---|---|---|
| Confirm | `POST /api/v1/bookings/:id/confirm` | PENDING_CONFIRMATION, REQUEST mode |
| Decline | `POST /api/v1/bookings/:id/decline` | PENDING_CONFIRMATION |
| Cancel | `POST /api/v1/bookings/:id/cancel` | PENDING_CONFIRMATION or CONFIRMED |
| Check In | `POST /api/v1/bookings/:id/check-in` | CONFIRMED |

### 7.6 Calendar & Availability

- Room selector → month navigation
- Colour coding: booked=`#e8eaf6`, blocked=`#fde7e7`, selected=`#bbdefb`, available=default
- Block dates: `POST /api/v1/rooms/:id/blocks { startDate, endDate, blockType, reason }`
- Delete block: `DELETE /api/v1/rooms/:id/blocks/:blockId`
- Pricing by date: `GET /api/v1/rooms/:id/calendar?year=&month=`

### 7.7 Pricing Configuration

| Feature | API |
|---|---|
| Seasonal rates (CRUD) | `/api/v1/rooms/:id/seasonal-rates` |
| Room fees (CRUD) | `/api/v1/rooms/:id/fees` |
| Tax rule (upsert) | `PUT /api/v1/accommodations/:id/tax` |
| Occupancy pricing (upsert) | `PUT /api/v1/rooms/:id/occupancy-pricing` |

**Seasonal rate fields:** label, rateType (SEASONAL/WEEKEND/WEEKDAY/HOLIDAY/LONG_STAY), pricePerNight, startDate, endDate, daysOfWeek[], minNightsToApply, priority

### 7.8 Promotions & Coupons

| Operation | API |
|---|---|
| Create promotion | `POST /api/v1/promotions` |
| Update promotion | `PUT /api/v1/promotions/:id` |
| Deactivate promotion | `DELETE /api/v1/promotions/:id` |
| List coupons | `GET /api/v1/promotions/:id/coupons` |
| Generate coupons | `POST /api/v1/promotions/:id/coupons` |

**Promotion fields:** name, discountType (PERCENTAGE/FIXED), discountValue, minNights, minSubtotal, startDate, endDate, isActive, stackable, maxUses

### 7.9 Reviews Management

- View all reviews: `GET /api/v1/reviews/provider`
- Respond to review: `POST /api/v1/reviews/:id/response { response }`

### 7.10 Payouts

- Summary cards: Pending payout total, Settled total, "Not scheduled" (next payout)
- Filter chips: ALL / PENDING / SETTLED
- Table columns: Booking ID (first 8 chars), Guest, Room, Check-in, Net Payout, Status
- Settlement triggered by admin: `PUT /api/v1/bookings/:id/settle`

### 7.11 Analytics

- Date range filter (from/to) + room filter
- 5 KPI cards + inline SVG bar charts (revenue by month, occupancy by room)
- `GET /api/v1/providers/me/analytics?from=&to=&roomId=`

---

## 8. Guest (Stay Booking) Workflows

### 8.1 Stay Search

**View:** `real-app-frontend-main/src/views/Stays/index.tsx`

**Search parameters:**
- `location`, `checkIn`, `checkOut`, `guests`
- `minPrice`, `maxPrice`, `searchTerm`
- `businessType` (HOTEL/LODGE/BNB/APARTMENT/GUEST_HOUSE/HOSTEL)
- `bookingMode` (INSTANT/REQUEST)
- `amenities[]`, `sort`, `roomType`
- `minRating`, `lat/lng/radius` (geo search)
- `selfCheckIn`, `page/limit`

**API:** `GET /api/v1/stays?{params}` — paginated, infinite scroll merge

### 8.2 Room Detail & Booking

**View:** `real-app-frontend-main/src/views/Stays/RoomDetail.tsx`

1. `GET /api/v1/rooms/public/:roomId` — room data
2. `GET /api/v1/rooms/:roomId/calendar?year=&month=` — unavailable dates + pricing by date
3. Guest selects check-in/check-out dates
4. `POST /api/v1/pricing/quote { roomId, checkIn, checkOut, guests }` — price breakdown
5. Guest enters coupon code (optional) → `POST /api/v1/pricing/validate-coupon`
6. Guest clicks "Book Now" → `POST /api/v1/bookings { room, checkIn, checkOut, guests, couponCode }`
7. Redirect to `/stays/bookings/:id`

### 8.3 Booking Payment

**View:** `real-app-frontend-main/src/views/Stays/BookingConfirmation.tsx`

1. Submit guest info: `POST /api/v1/bookings/:id/guest-info { fullName, phone, nationalId, estimatedArrivalTime, additionalNotes }`
2. Initiate payment: `POST /api/v1/bookings/initiate-payment { bookingId, phone, amount }`
3. Paynow webhook confirms → booking status → CONFIRMED
4. Partial payment: `POST /api/v1/bookings/:id/partial-payment`

### 8.4 Booking Cancellation

1. Preview refund: `GET /api/v1/bookings/:id/cancellation-preview`
2. Cancel: `PUT /api/v1/bookings/:id/cancel { reason }`
3. Refund calculated per cancellation policy snapshot

### 8.5 My Bookings

**View:** `real-app-frontend-main/src/views/Stays/MyBookings.tsx`

- `GET /api/v1/bookings/mine` — all guest bookings
- Filter by status, view details, cancel, raise dispute

### 8.6 Reviews

- After COMPLETED booking: `POST /api/v1/reviews { bookingId, overallRating, cleanlinessRating, locationRating, valueRating, serviceRating, comment }`
- View own reviews: `GET /api/v1/reviews/mine`

### 8.7 Disputes

- `POST /api/v1/disputes { bookingId, reason, description }`

---

## 9. Admin Workflows

### 9.1 Admin Dashboard Tabs

**View:** `real-app-frontend-main/src/views/Dashboard/Admin.tsx`

| Tab | Purpose |
|---|---|
| Expired Listings | Filter, select, bulk-revive inactive landlord listings |
| Providers | Verify/reject providers, update commission rates, suspend/reinstate |
| Bookings | View all bookings, settle payouts |
| Legal Docs | CRUD legal documents |

### 9.2 Moderation Queue

- `GET /api/v1/admin/queue` → `{ pendingAccommodations, openReports, openDisputes, pendingReviews }`

### 9.3 Accommodation Moderation

| Action | API |
|---|---|
| List | `GET /api/v1/admin/accommodations?moderationStatus=&type=&province=&city=&search=` |
| Approve | `PUT /api/v1/admin/accommodations/:id/approve` |
| Reject | `PUT /api/v1/admin/accommodations/:id/reject { reason }` |
| Suspend | `PUT /api/v1/admin/accommodations/:id/suspend { reason }` |
| Reinstate | `PUT /api/v1/admin/accommodations/:id/reinstate` |

### 9.4 Provider Management

| Action | API |
|---|---|
| List | `GET /api/v1/providers?verificationStatus=&search=` |
| Verify | `PUT /api/v1/providers/:id/verify { verificationStatus, verificationNotes }` |
| Update commission | `PUT /api/v1/providers/:id/commission { commissionRate }` |
| Suspend | `PUT /api/v1/admin/providers/:id/suspend { reason }` |
| Reinstate | `PUT /api/v1/admin/providers/:id/reinstate` |

### 9.5 Dispute Resolution

| Status | Action | API |
|---|---|---|
| OPEN | Mark Under Review | `POST /api/v1/admin/disputes/:id/review` |
| UNDER_REVIEW | Resolve | `POST /api/v1/admin/disputes/:id/resolve { resolution }` |
| UNDER_REVIEW | Close | `POST /api/v1/admin/disputes/:id/close { resolution }` |

### 9.6 Report Management

| Action | API |
|---|---|
| List | `GET /api/v1/admin/reports?status=&targetType=&reason=` |
| Mark under review | `PUT /api/v1/admin/reports/:id/review` |
| Resolve | `PUT /api/v1/admin/reports/:id/resolve { resolution }` |
| Dismiss | `PUT /api/v1/admin/reports/:id/dismiss { resolution }` |

### 9.7 Review Moderation

| Action | API |
|---|---|
| List | `GET /api/v1/admin/reviews?isPublished=&accommodationId=&from=&to=` |
| Moderate | `PUT /api/v1/admin/reviews/:id/moderate { action: publish|unpublish|delete|restore }` |

### 9.8 Booking Settlement

- `PUT /api/v1/bookings/:id/settle { settlementReference }` → settlementStatus=SETTLED

### 9.9 Legal Documents

| Action | API |
|---|---|
| List | `GET /api/v1/admin/legal-docs` |
| History | `GET /api/v1/admin/legal-docs/:slug/history` |
| Create | `POST /api/v1/admin/legal-docs { slug, title, content }` |
| Update | `PUT /api/v1/admin/legal-docs/:id { title, content }` |
| Archive | `DELETE /api/v1/admin/legal-docs/:id` |

Public access: `GET /api/v1/legal-docs/:slug`

### 9.10 Audit Logs

- `GET /api/v1/admin/audit-logs?adminSearch=&action=&targetType=&targetId=&from=&to=`
- Every admin action writes an `AuditLog` record

---

## 10. Profile & Account Workflows

**View:** `real-app-frontend-main/src/views/Profile/index.tsx`

| Operation | API |
|---|---|
| Update profile | `PUT /api/v1/users/update/:id { username, email, password, avatar }` |
| Upload avatar | R2 signed URL → `GET /api/v1/uploads/r2-sign?contentType=&folder=avatars` → PUT to R2 |
| Delete account | `DELETE /api/v1/users/delete/:id` |
| Submit identity verification (landlord) | Upload ID + selfie to R2 → `POST /api/v1/users/submit-verification { idImageUrl, selfieUrl }` |
| Resend email verification | `POST /api/v1/users/resend-verification { email }` |

**Verification status flow (landlord):**
`UNVERIFIED` → `PENDING_REVIEW` → `VERIFIED` or `REJECTED`

---

## 11. Notification Workflows

**View:** `real-app-frontend-main/src/views/Notifications/index.tsx`

| Operation | API |
|---|---|
| Get notifications (paginated) | `GET /api/v1/notifications?page=&limit=` |
| Get unread count (polled every 60s) | `GET /api/v1/notifications/unread-count` |
| Mark single as read | `PUT /api/v1/notifications/:id/read` |
| Mark all as read | `PUT /api/v1/notifications/read-all` |
| Save push subscription | `POST /api/v1/notifications/push-subscription` |
| Delete push subscription | `DELETE /api/v1/notifications/push-subscription` |
| Get preferences | `GET /api/v1/notifications/preferences` |
| Update preferences | `PUT /api/v1/notifications/preferences { emailEnabled, pushEnabled, inAppEnabled }` |

**Notification channels:** Email, SMS, Push (Web Push), In-App
**Floating bubble:** `FloatingNotificationBubble` polls unread count and shows badge on header bell

---

## 12. Wallet & TR Token Workflows

**Components:** `real-app-frontend-main/src/components/wallet/`

| Operation | API |
|---|---|
| Get balance | `GET /api/v1/users/wallet/balance` |
| Get transactions | `GET /api/v1/users/wallet/transactions?limit=` |

**Token events:**
- Landlord approves engagement → tokens credited to landlord
- Landlord restores expired listing → tokens debited
- Tokens purchased via `TokenPurchaseModal`

**Redux sync:** On app load and after wallet-affecting actions, `syncWalletFromServer` dispatched to keep Redux state in sync with server balance.

---

## 13. Payment Workflows

### 13.1 Paynow (EcoCash) Flow

1. User enters EcoCash number
2. Frontend calls payment endpoint (listing-fee / tenant-premium / booking payment)
3. Backend calls Paynow API → initiates payment
4. Paynow sends USSD prompt to user's phone
5. User approves on phone
6. Paynow calls `POST /webhooks/payment` (result URL)
7. Backend verifies, updates Payment + Booking/Listing status
8. Frontend polls for status update

### 13.2 Stripe Flow

1. Frontend calls payment endpoint
2. Backend creates Stripe PaymentIntent → returns `client_secret`
3. Frontend confirms payment via Stripe.js
4. Stripe calls `POST /webhooks/stripe`
5. Backend verifies signature, updates records

### 13.3 Payment Types

| Type | Route | Role |
|---|---|---|
| Listing fee | `POST /api/v1/payments/listing-fee` | landlord |
| Tenant premium | `POST /api/v1/payments/tenant-premium` | tenant |
| Booking payment | `POST /api/v1/bookings/initiate-payment` | any |
| Partial payment | `POST /api/v1/bookings/:id/partial-payment` | any |
| Refund | `POST /api/v1/bookings/:id/refund` | any |
| Retry payment | `POST /api/v1/payments/:id/retry` | any |

---

## 14. Upload Workflow

All file uploads use pre-signed R2/S3 URLs:

1. `GET /api/v1/uploads/r2-sign?contentType=image/jpeg&folder=avatars`
2. Backend generates pre-signed PUT URL → returns `{ uploadUrl, publicUrl }`
3. Frontend PUTs file directly to `uploadUrl`
4. Frontend saves `publicUrl` in profile/room/accommodation

**Folders used:** `avatars`, `verification`, `rooms`, `accommodations`

---

## 15. Background Jobs & Cron

| Job | File | Purpose |
|---|---|---|
| Notification worker | `real-app-backend-main/utils/notificationWorker.js` | Process NotificationJob queue (email/SMS/push/in-app) |
| Reminder scanner | `real-app-backend-main/utils/reminderScanner.js` | Send check-in/check-out reminders |
| Listing expiry scanner | `real-app-backend-main/utils/listingExpiryScanner.js` | Expire listings past `expiresAt` |
| Reconciliation job | `real-app-backend-main/utils/reconciliationJob.js` | Reconcile payment statuses |
| Search analytics | `real-app-backend-main/utils/searchAnalytics.js` | Log search events to SearchAnalyticsEvent |

---

## 16. Data Model Summary

### Core Entities

| Model | Key Fields | Relations |
|---|---|---|
| `User` | id, username, email, role, tokenBalance, verificationStatus | listings, accommodations, bookings, notifications, wallet |
| `Listing` | id, name, status, monthlyRent, province, city, expiresAt | user, payments, engagements |
| `Accommodation` | id, type, name, slug, verificationStatus, isPublished | owner, rooms, amenities, images, cancellationPolicy, taxRule, promotions |
| `Room` | id, name, roomType, basePricePerNight, status, bookingMode | accommodation, bookings, seasonalRates, availabilityBlocks, fees, images |
| `Booking` | id, status, paymentStatus, settlementStatus, checkIn, checkOut, totalPrice, netPayout | room, guest, provider, payments, review, disputes |
| `Payment` | id, amount, method, status, type | user, listing, booking, refunds |
| `Promotion` | id, name, discountType, discountValue, startDate, endDate | accommodation, room, coupons |
| `Notification` | id, event, title, body, isRead | user |
| `Engagement` | id, message, status | listing, tenant, landlord |
| `Dispute` | id, reason, description, status, resolution | booking, raisedBy, resolvedBy |
| `Report` | id, targetType, targetId, reason, status | reporter, resolvedBy |
| `AuditLog` | id, action, targetType, targetId, metadata | admin |
| `LegalDocument` | id, slug, title, version, content, isActive | — |
| `WalletTransaction` | id, type, amount, label, reason, balanceAfter | user |

### Enums

| Enum | Values |
|---|---|
| `BookingStatus` | PENDING_CONFIRMATION, PENDING_PAYMENT, CONFIRMED, DECLINED, CANCELLED, CHECKED_IN, COMPLETED, EXPIRED, REFUNDED |
| `PaymentStatus` | UNPAID, PENDING, PAID, REFUNDED, PARTIALLY_REFUNDED, FAILED, PARTIALLY_PAID |
| `SettlementStatus` | PENDING, SETTLED, DISPUTED |
| `AccommodationType` | HOTEL, LODGE, BNB, APARTMENT, GUEST_HOUSE, HOSTEL |
| `RoomType` | SINGLE, DOUBLE, TWIN, SUITE, DORMITORY, STUDIO, ENTIRE_UNIT |
| `RoomStatus` | AVAILABLE, UNAVAILABLE, MAINTENANCE |
| `BookingMode` | INSTANT, REQUEST |
| `RateType` | SEASONAL, WEEKEND, WEEKDAY, HOLIDAY, LONG_STAY |
| `CancellationPolicyType` | FLEXIBLE, MODERATE, STRICT, NON_REFUNDABLE, CUSTOM |
| `DiscountType` | PERCENTAGE, FIXED |
| `VerificationStatus` | PENDING, APPROVED, REJECTED |
| `ModerationStatus` | PENDING_REVIEW, APPROVED, REJECTED, SUSPENDED |
| `EngagementStatus` | PENDING, APPROVED, DECLINED |
| `DisputeStatus` | OPEN, UNDER_REVIEW, RESOLVED, CLOSED |
| `ReportStatus` | OPEN, UNDER_REVIEW, RESOLVED, DISMISSED |

---

## 17. Complete API Endpoint Index

### Auth & Users (`/api/v1/users`)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/signup` | — | — | Register new user |
| POST | `/login` | — | — | Login |
| POST | `/google` | — | — | Google OAuth login |
| GET | `/verify-email` | — | — | Verify email token |
| POST | `/verify-phone` | — | — | Verify phone OTP |
| POST | `/resend-phone-otp` | — | — | Resend phone OTP |
| POST | `/forgot-password` | — | — | Request password reset |
| POST | `/reset-password` | — | — | Reset password |
| POST | `/resend-verification` | — | — | Resend email verification |
| GET | `/check-availability` | — | — | Check email/username availability |
| GET | `/me` | ✓ | any | Get current user |
| GET | `/wallet/balance` | ✓ | any | Get token balance |
| GET | `/wallet/transactions` | ✓ | any | Get wallet transactions |
| POST | `/submit-verification` | ✓ | landlord | Submit ID verification |
| PUT | `/update/:id` | ✓ | any | Update profile |
| DELETE | `/delete/:id` | ✓ | any | Delete account |
| GET | `/:id` | optional | — | Get user by ID |

### Listings (`/api/v1/listings`)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/stats` | — | — | Public listing stats |
| GET | `/` or `/get` | optional | — | Search/list listings |
| GET | `/home/highlighted` | optional | — | Home page highlights |
| GET | `/home/grouped-by-location` | optional | — | Home page location groups |
| GET | `/listing/:id` or `/:id` | optional | — | Get single listing |
| POST | `/` | ✓ | landlord | Create listing |
| GET | `/user/:id` | ✓ | landlord | Get user's listings |
| POST | `/:id/transition-to-pending-payment` | ✓ | landlord | Transition status |
| DELETE | `/:id` | ✓ | landlord | Delete listing |
| PUT | `/:id` | ✓ | landlord | Update listing |
| POST | `/:id/restore` | ✓ | landlord | Restore expired listing |

### Listing Drafts (`/api/v1/listing-drafts`)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/` | ✓ | landlord | Create draft |
| GET | `/mine` | ✓ | landlord | Get my drafts |
| GET | `/:id` | ✓ | landlord | Get single draft |
| PUT | `/:id` | ✓ | landlord | Update draft |
| DELETE | `/:id` | ✓ | landlord | Delete draft |

### Accommodations (`/api/v1/accommodations`)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/:id/reviews` | — | — | Public reviews |
| GET | `/mine` | ✓ | provider | Get my accommodation |
| PATCH | `/:id` | ✓ | provider | Update accommodation |
| POST | `/:id/images` | ✓ | provider | Add image |
| DELETE | `/:id/images/:imageId` | ✓ | provider | Delete image |
| PUT | `/:id/cancellation-policy` | ✓ | provider | Upsert cancellation policy |
| PUT | `/:id/checkin-rules` | ✓ | provider | Upsert check-in rules |
| GET | `/:id/tax` | ✓ | provider | Get tax rule |
| PUT | `/:id/tax` | ✓ | provider | Upsert tax rule |

### Rooms (`/api/v1/rooms`)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/public/:id` | — | — | Public room detail |
| GET | `/:id/calendar` | — | — | Room calendar |
| GET | `/:id/availability` | — | — | Room availability check |
| POST | `/` | ✓ | provider | Create room |
| GET | `/mine` | ✓ | provider | Get my rooms |
| PUT/PATCH | `/:id` | ✓ | provider | Update room |
| DELETE | `/:id` | ✓ | provider | Delete room |
| GET | `/:id/blocks` | ✓ | provider | List blocks |
| POST | `/:id/blocks` | ✓ | provider | Create block |
| DELETE | `/:id/blocks/:blockId` | ✓ | provider | Delete block |
| POST | `/:id/images` | ✓ | provider | Add image |
| PATCH | `/:id/images/:imageId` | ✓ | provider | Update image |
| DELETE | `/:id/images/:imageId` | ✓ | provider | Delete image |
| GET | `/:id/seasonal-rates` | ✓ | provider | List rates |
| POST | `/:id/seasonal-rates` | ✓ | provider | Create rate |
| PUT | `/:id/seasonal-rates/:rateId` | ✓ | provider | Update rate |
| DELETE | `/:id/seasonal-rates/:rateId` | ✓ | provider | Delete rate |
| GET | `/:id/fees` | ✓ | provider | List fees |
| POST | `/:id/fees` | ✓ | provider | Create fee |
| PUT | `/:id/fees/:feeId` | ✓ | provider | Update fee |
| DELETE | `/:id/fees/:feeId` | ✓ | provider | Delete fee |
| GET | `/:id/occupancy-pricing` | ✓ | provider | Get occupancy rule |
| PUT | `/:id/occupancy-pricing` | ✓ | provider | Upsert occupancy rule |
| DELETE | `/:id/occupancy-pricing` | ✓ | provider | Delete occupancy rule |

### Bookings (`/api/v1/bookings`)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/` | ✓ | any | Create booking |
| GET | `/mine` | ✓ | any | Guest's bookings |
| GET | `/provider` | ✓ | provider | Provider's bookings |
| GET | `/` or `/admin` | ✓ | admin | All bookings |
| GET | `/:id` | ✓ | any | Get booking by ID |
| POST | `/initiate-payment` | ✓ | any | Initiate booking payment |
| POST/PUT | `/:id/cancel` | ✓ | any | Cancel booking |
| GET | `/:id/cancellation-preview` | ✓ | any | Preview refund |
| POST | `/:id/partial-payment` | ✓ | any | Partial payment |
| POST | `/:id/refund` | ✓ | any | Initiate refund |
| PUT | `/:id/modify` | ✓ | any | Modify booking |
| POST | `/:id/guest-info` | ✓ | any | Submit guest info |
| POST | `/:id/confirm` | ✓ | provider | Confirm booking |
| POST | `/:id/decline` | ✓ | provider | Decline booking |
| POST | `/:id/check-in` | ✓ | provider | Check in guest |
| PUT/POST | `/:id/settle` | ✓ | admin | Settle payout |

### Stays (`/api/v1/stays`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | Search stays/rooms |
| GET | `/:providerId` | — | Get provider's stays |

### Pricing (`/api/v1/pricing`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/quote` | — | Get pricing quote |
| POST | `/validate-coupon` | — | Validate coupon code |

### Promotions (`/api/v1/promotions`)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/` | ✓ | admin | List all promotions |
| POST | `/` | ✓ | provider | Create promotion |
| PUT | `/:id` | ✓ | provider | Update promotion |
| DELETE | `/:id` | ✓ | provider | Deactivate promotion |
| GET | `/:id/coupons` | ✓ | provider | List coupons |
| POST | `/:id/coupons` | ✓ | provider | Generate coupons |

### Providers (`/api/v1/providers`)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/register` | — | — | Register as provider |
| GET | `/me` | ✓ | provider | Get my profile |
| PUT/PATCH | `/me` | ✓ | provider | Update my profile |
| GET | `/me/analytics` | ✓ | provider | Get analytics |
| GET | `/` | ✓ | admin | List all providers |
| PUT | `/:id/verify` | ✓ | admin | Verify provider |
| PUT | `/:id/commission` | ✓ | admin | Update commission |

### Notifications (`/api/v1/notifications`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ✓ | Get notifications |
| GET | `/unread-count` | ✓ | Get unread count |
| POST | `/push-subscription` | ✓ | Save push subscription |
| DELETE | `/push-subscription` | ✓ | Delete push subscription |
| GET | `/preferences` | ✓ | Get preferences |
| PUT | `/preferences` | ✓ | Update preferences |
| PUT | `/read-all` | ✓ | Mark all as read |
| PUT | `/:id/read` | ✓ | Mark one as read |

### Reviews (`/api/v1/reviews`)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/` | ✓ | any | Create review |
| GET | `/mine` | ✓ | any | My reviews |
| GET | `/provider` | ✓ | provider | Provider's reviews |
| POST/PATCH/PUT | `/:id/response` | ✓ | provider | Respond to review |
| PATCH/PUT | `/:id/moderate` | ✓ | admin | Moderate review |
| GET | `/:id` | ✓ | any | Get review |
| PATCH/PUT | `/:id` | ✓ | any | Update review |
| DELETE | `/:id` | ✓ | any | Delete review |

### Engagements (`/api/v1/engagements`)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/` | ✓ | tenant | Create engagement |
| GET | `/mine` | ✓ | tenant | My sent engagements |
| GET | `/incoming` | ✓ | landlord | Incoming engagements |
| PATCH | `/:id` | ✓ | landlord | Respond (approve/decline) |

### Admin (`/api/v1/admin`)

| Method | Path | Description |
|---|---|---|
| GET | `/queue` | Moderation queue counts |
| GET | `/listings/inactive` | Inactive listings |
| POST | `/listings/bulk-revive` | Bulk revive listings |
| GET | `/accommodations` | List accommodations |
| PUT | `/accommodations/:id/approve` | Approve |
| PUT | `/accommodations/:id/reject` | Reject |
| PUT | `/accommodations/:id/suspend` | Suspend |
| PUT | `/accommodations/:id/reinstate` | Reinstate |
| GET | `/reviews` | All reviews |
| GET | `/reviews/analytics` | Review analytics |
| PUT | `/reviews/:id/moderate` | Moderate review |
| PUT | `/providers/:id/suspend` | Suspend provider |
| PUT | `/providers/:id/reinstate` | Reinstate provider |
| GET | `/disputes` | List disputes |
| GET | `/disputes/:id` | Get dispute |
| POST | `/disputes/:id/review` | Mark under review |
| POST | `/disputes/:id/resolve` | Resolve |
| POST | `/disputes/:id/close` | Close |
| GET | `/reports` | List reports |
| GET | `/reports/:id` | Get report |
| PUT | `/reports/:id/review` | Mark under review |
| PUT | `/reports/:id/resolve` | Resolve |
| PUT | `/reports/:id/dismiss` | Dismiss |
| GET | `/audit-logs` | Audit logs |
| GET | `/audit-logs/:id` | Single audit log |
| GET | `/legal-docs` | List legal docs |
| GET | `/legal-docs/:slug/history` | Doc history |
| POST | `/legal-docs` | Create doc |
| PUT | `/legal-docs/:id` | Update doc |
| DELETE | `/legal-docs/:id` | Archive doc |

### Miscellaneous

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/reports` | ✓ | Submit a report |
| POST | `/api/v1/disputes` | ✓ | Raise a dispute |
| GET | `/api/v1/saved-searches/mine` | ✓ | My saved searches |
| POST | `/api/v1/saved-searches` | ✓ | Create saved search |
| DELETE | `/api/v1/saved-searches/:id` | ✓ | Delete saved search |
| GET | `/api/v1/uploads/r2-sign` | ✓ | Get R2 signed upload URL |
| POST | `/api/v1/leads/property-interest` | — | Submit property interest lead |
| GET | `/api/v1/legal-docs/:slug` | — | Public legal doc |
| POST | `/webhooks/stripe` | — | Stripe webhook |
| POST | `/webhooks/payment` | — | Paynow webhook |

---

## 18. Derived Documentation Index

This master document is the source from which the following downstream docs can be extracted:

| Document | Sections to Extract |
|---|---|
| **API Reference** | §17 (full endpoint index) |
| **Tenant Onboarding Guide** | §5 (tenant workflows) + §8 (stay booking) |
| **Landlord Onboarding Guide** | §6 (landlord workflows) |
| **Provider Onboarding Guide** | §7 (provider workflows) |
| **Admin Runbook** | §9 (admin workflows) |
| **QA Test Plan** | All workflow sequences + booking state machine (§7.5) |
| **Payment Integration Guide** | §13 (payment workflows) |
| **Notification Integration Guide** | §11 (notification workflows) |
| **Data Dictionary** | §16 (data model + enums) |
| **Security & Auth Guide** | §4 (auth workflows) + role table (§2) |
