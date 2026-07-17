
---
title: Database
description: Quick-reference database documentation for the Town Ruins platform, including engine, schema, and data model summaries.
tags:
  - database
  - reference
  - postgresql
  - prisma
aliases:
  - DB
  - Reference Database
---

# Database

## Engine

Aurora PostgreSQL (Serverless v2) via **Prisma ORM v5**.

Schema file: `real-app-backend-main/prisma/schema.prisma`

## Prisma Client Generation

The `server.js` entry point auto-generates the Prisma Client for the Linux runtime on first boot if the native engine binary is missing. This handles the case where the build machine and runtime machine differ (e.g. macOS build → Linux Amplify compute).

Set `SKIP_PRISMA_GENERATE_ON_START=true` to disable this behaviour if the binary is pre-built.

## Migrations

All migrations live in `real-app-backend-main/prisma/migrations/`.

Migration

Description

`20231231000000_init`

Initial schema — User, Listing, Payment, SavedSearch

`20240101000000_add_phone_otp`

Phone OTP fields on User

`20260510135100_add_listing_drafts`

ListingDraft model

`20260514000000_accommodation_platform_upgrade`

Accommodation, Room models

`20260514193000_search_engine_upgrade`

Search indexes and full-text fields

`20260515000000_add_accommodation_timezone`

Timezone field on Accommodation

`20260515120000_booking_refunded_and_guest_info`

Booking refund + guest info fields

`20260515200000_pricing_engine`

PricingRule model

`20260518_notification_system`

Notification model

`20260518000000_payment_checkout_upgrade`

Booking payment fields

`20260519000000_moderation_system`

Dispute, Report models

`20260522000000_engagement_and_verification`

Engagement model, verification fields

`20260522210000_repair_user_auth_columns`

Auth column repairs

`20260523000000_add_consent_and_legal_docs`

Consent tracking, LegalDoc model

`20260523100000_push_notifications`

PushToken model

`20260523200000_legal_documents`

LegalDocument content fields

Run all migrations in production:

```bash
npx prisma migrate deploy
```

## Models

### User

Accounts for tenants, landlords, providers, and admins.

Field

Type

Notes

`id`

String (UUID)

PK

`username`

String

`email`

String

Unique

`password`

String

bcrypt hash (cost 12)

`avatar`

String?

S3 URL

`role`

Enum

`tenant`, `landlord`, `provider`, `admin`, `super_admin`

`phoneNumber`

String?

Required for landlords

`nationalId`

String?

Required for landlords

`isEmailVerified`

Boolean

Default false

`isPhoneVerified`

Boolean

Default false

`phoneOtp`

String?

SHA-256 hashed 6-digit OTP

`phoneOtpExpires`

DateTime?

10-minute expiry

`emailVerificationToken`

String?

SHA-256 hashed random token

`emailVerificationExpires`

DateTime?

24-hour expiry

`passwordResetToken`

String?

SHA-256 hashed random token

`passwordResetExpires`

DateTime?

1-hour expiry

`premiumExpiry`

DateTime?

Tenant premium end date

`tokenBalance`

Int

TR Token balance, default 100

`verificationStatus`

Enum

`UNVERIFIED`, `PENDING_REVIEW`, `VERIFIED`, `REJECTED`

`verificationIdUrl`

String?

S3 URL of submitted ID image

`verificationSelfieUrl`

String?

S3 URL of submitted selfie

`verificationSubmittedAt`

DateTime?

`consentAcceptedAt`

DateTime?

Legal consent timestamp

`createdAt`

DateTime

`updatedAt`

DateTime

Relations: Listing[], ListingDraft?, Payment[], Booking[] (as guest), Booking[] (as provider), SavedSearch[], Notification[], Engagement[] (as tenant), Engagement[] (as landlord), Dispute[], Report[], UserPushSubscription?, UserNotificationPreferences?, AuditLog[]

### Listing

Long-term rental listing owned by a landlord.

Field

Type

Notes

`id`

String (UUID)

PK

`userId`

String

FK → User

`name`

String

`description`

String

`address`

String

`province`

String

`city`

String

`addressLine`

String?

`lat`

Float?

`lng`

Float?

`monthlyRent`

Float

`bathrooms`

Int

`bedrooms`

Int

`totalRooms`

Int

`furnished`

Boolean

`amenities`

Json

`{ solar, borehole, wifi, ... }`

`imageUrls`

Json

String[]

`status`

Enum

`draft`, `pending_payment`, `early_access`, `active`, `inactive`

`earlyAccessUntil`

DateTime?

`publishedAt`

DateTime?

`paymentDeadline`

DateTime?

`type`

String?

`offer`

String?

`studentAccommodation`

Boolean

Index: `[userId, status]`

### ListingDraft

Autosaved incomplete listing for a landlord.

Field

Type

Notes

`id`

String (UUID)

PK

`userId`

String

FK → User, Unique (one draft per landlord)

`data`

Json

Partial listing fields

`createdAt`

DateTime

`updatedAt`

DateTime

### Accommodation

Short-stay property owned by a provider.

Field

Type

Notes

`id`

String (UUID)

PK

`providerId`

String

FK → User

`name`

String

`description`

String

`address`

String

`city`

String

`province`

String

`timezone`

String

e.g. `Africa/Harare`

`amenities`

Json

`imageUrls`

Json

`status`

Enum

`pending`, `active`, `suspended`

### Room

Individual bookable room within an Accommodation.

Field

Type

Notes

`id`

String (UUID)

PK

`providerId`

String

FK → User

`accommodationId`

String

FK → Accommodation

`name`

String

`roomType`

Enum

`single`, `double`, `suite`, `dorm`, ...

`capacity`

Int

Max guests

`basePricePerNight`

Float

`pricingRules`

Json

Seasonal/weekend overrides

`amenities`

Json

`imageUrls`

Json

`status`

Enum

`active`, `inactive`

`bookingMode`

Enum

`instant`, `request`

`cancellationPolicy`

Enum

`flexible`, `moderate`, `strict`

`maxAdvanceBookingDays`

Int

Index: `[providerId, status]`

### Booking

Guest booking for a Room.

Field

Type

Notes

`id`

String (UUID)

PK

`roomId`

String

FK → Room

`providerId`

String

FK → User

`guestId`

String

FK → User

`checkIn`

DateTime

`checkOut`

DateTime

`nights`

Int

`guestCount`

Int

`pricePerNight`

Float

`subtotal`

Float

`commissionRate`

Float

`commissionAmount`

Float

`totalAmount`

Float

`netPayout`

Float

Provider receives

`status`

Enum

`pending`, `confirmed`, `declined`, `cancelled`, `completed`

`paymentStatus`

Enum

`unpaid`, `paid`, `refunded`

`settlementStatus`

Enum

`pending`, `settled`

`cancelledBy`

String?

`refundAmount`

Float?

Indexes: `[roomId, checkIn, checkOut, status]`, `[guestId, createdAt]`

### Payment

Payment records for listing fees, premium subscriptions, and booking payments.

Field

Type

Notes

`id`

String (UUID)

PK

`userId`

String

FK → User

`amount`

Float

`amountPaid`

Float?

Actual amount received

`amountDue`

Float?

Remaining balance

`method`

String

`paynow`, `stripe`, `mock`

`status`

Enum

`pending`, `paid`, `failed`

`type`

Enum

`listing_fee`, `premium_subscription`, `booking`

`listingId`

String?

FK → Listing

`bookingId`

String?

FK → Booking

`transactionRef`

String

Unique

`providerIntentId`

String?

Provider-specific payment intent ID

`providerMeta`

Json?

Raw provider response

`webhookVerified`

Boolean

Set to true when Paynow webhook hash verified

`retryCount`

Int

Default 0

`lastRetryAt`

DateTime?

Relations: User, Listing?, Booking?, Refund[]

### Notification

Field

Type

Notes

`id`

String (UUID)

PK

`userId`

String

FK → User

`type`

String

e.g. `booking_confirmed`

`title`

String

`body`

String

`data`

Json?

Extra payload

`read`

Boolean

Default false

`channel`

String

`in_app`, `email`, `sms`, `push`

### Engagement

Tenant → Landlord contact request.

Field

Type

Notes

`id`

String (UUID)

PK

`tenantId`

String

FK → User

`landlordId`

String

FK → User

`listingId`

String

FK → Listing

`status`

Enum

`PENDING`, `APPROVED`, `DECLINED`

`message`

String?

### SavedSearch

Field

Type

Notes

`id`

String (UUID)

PK

`userId`

String

FK → User

`name`

String

`criteria`

Json

Search filter object

`notifyBy`

String

`email`, `push`

`isActive`

Boolean

`lastNotifiedAt`

DateTime?

Indexes: `[userId]`, `[isActive]`

### Dispute

Dispute raised by any user against a booking.

Field

Type

Notes

`id`

String (UUID)

PK

`bookingId`

String

FK → Booking

`raisedBy`

String

FK → User

`reason`

String

`description`

String

`status`

Enum

`open`, `under_review`, `resolved`, `closed`

`resolution`

String?

`resolvedBy`

String?

FK → User (admin)

`resolvedAt`

DateTime?

### Report

Content/user report submitted by any user.

Field

Type

Notes

`id`

String (UUID)

PK

`reporterId`

String

FK → User

`targetId`

String

ID of reported entity

`targetType`

String

`listing`, `user`, `booking`, `accommodation`

`reason`

String

`description`

String?

`status`

Enum

`pending`, `reviewed`, `actioned`, `dismissed`

`resolvedBy`

String?

FK → User (admin)

### Supporting Models

Model

Purpose

`UserPushSubscription`

Web Push endpoint + keys per user

`UserNotificationPreferences`

Per-user channel toggles (`emailEnabled`, `pushEnabled`, `inAppEnabled`)

`NotificationJob`

Queued notification for async dispatch by `notificationWorker`

`AuditLog`

Admin action log

`Review`

Guest review of an accommodation/booking

`Refund`

Refund record linked to Payment and/or Booking

`BookingGuestInfo`

Guest details submitted for a booking

`BookingFeeSnapshot`

Immutable pricing snapshot at booking creation time

`SeasonalRate`

Room-level date-range or day-of-week pricing override

`RoomFee`

Required or optional fee attached to a room (e.g. cleaning fee)

`OccupancyRule`

Max guest/adult/child/infant counts per room

`OccupancyPricingRule`

Extra guest surcharge per night above base guest count

`Promotion`

Automatic or coupon-code discount for a room

`CancellationPolicy`

Accommodation-level cancellation policy rules

`CheckInOutRules`

Check-in/checkout time rules per accommodation

`TaxRule`

Tax percentage and applicability per accommodation

`LegalDocument`

Platform legal document content (Terms, Privacy, etc.)

`AvailabilityBlock`

Provider-created date block on a room

See `real-app-backend-main/prisma/schema.prisma` for full field definitions.

## Connection

Set `DATABASE_URL` in the Amplify Console (backend app):

```
postgresql://user:password@host:5432/creapy?schema=public
```

For connection pooling under load, append `?connection_limit=10` or use RDS Proxy.

## Seeding

```bash
# Via HTTP API (idempotent)
npm run seed

# Direct Prisma insert (requires DATABASE_URL in .env)
npm run seed:db
```
