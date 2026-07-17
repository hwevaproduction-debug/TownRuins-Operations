---
title: API Reference
description: Quick-reference API documentation for the Town Ruins platform, including base URL, authentication, and endpoint summaries.
tags:
  - api
  - reference
  - rest
  - endpoints
aliases:
  - API
  - Reference API
---

# API Reference

## Base URL

```

Production: https://<backend-amplify-url>/api/v1
Local:      http://localhost:5000/api/v1

```

## Authentication

All protected endpoints require:

```

Authorization: Bearer <jwt_token>

```

JWT is returned on login and signup. Tokens expire per `JWT_EXPIRES_IN` (default `30d`).

## Health Check

```

GET /api/v1
→ { status: \"ok\", message: \"Town Ruins API v1 is running.\" }

```

---

## Users `/api/v1/users`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/signup` | No | — | Register tenant or landlord. Body: `{ username, email, password, role?, consentAcceptedAt? }`. Returns `pending_verification` status + user payload (no JWT) unless `SKIP_EMAIL_VERIFICATION=true`. |
| POST | `/login` | No | — | Login. Body: `{ email, password }`. Returns JWT + user payload. Rejects unverified email. |
| POST | `/google` | No | — | Google OAuth. Body: `{ name, email, photo, role? }`. Creates or updates user; marks email+phone verified. Returns JWT. |
| GET | `/me` | Yes | Any | Current user profile. Returns full `buildAuthUserPayload` shape including `verificationStatus`, `premiumExpiry`, `tokenBalance`. |
| PUT | `/update/:id` | Yes | Any | Update profile. Body wrapped in `{ payload: { username, email, password?, avatar } }`. Returns new JWT. |
| DELETE | `/delete/:id` | Yes | Any | Delete account (cascades all owned data in a transaction). Admin can delete any account. |
| GET | `/verify-email?token=` | No | — | Verify email token (SHA-256 hashed, 24h expiry). Returns JWT on success. |
| POST | `/resend-verification` | No | — | Resend email verification. Body: `{ email }`. Silent success if already verified. |
| POST | `/verify-phone` | No | — | Verify landlord phone OTP. Body: `{ otp, email }`. OTP is 6-digit, 10-min expiry. Returns JWT. |
| POST | `/resend-phone-otp` | No | — | Resend phone OTP. Rate-limited to 3 resends per hour per user. |
| POST | `/forgot-password` | No | — | Send password reset email. Body: `{ email }`. Silent success if email not found. Reset link expires in 1 hour. |
| POST | `/reset-password` | No | — | Reset password. Body: `{ token, password }`. |
| POST | `/submit-verification` | Yes | landlord | Submit identity verification docs. Body: `{ idImageUrl, selfieUrl }`. Sets `verificationStatus=PENDING_REVIEW`. |
| GET | `/:id` | No | — | Get listing owner by **listing ID** (not user ID). Returns public user payload; includes contact details if caller is authenticated. |

---

## Listings `/api/v1/listings`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/` | Optional | — | Search listings. Query params: `province`, `location`, `city`, `neighborhood`, `searchTerm`, `minRent`, `maxRent`, `minBedrooms`, `minTotalRooms`, `solar`, `borehole`, `security`, `parking`, `internet`, `furnished`, `offer`, `studentAccommodation`, `type`, `sort`, `page`, `limit`. Premium tenants also see `early_access` listings. |
| GET | `/stats` | No | — | Public platform stats: `{ activeListings, landlords, provinces, avgRating }` |
| GET | `/home/highlighted?limit=9` | Optional | — | Most recent active listings for home hero. Premium tenants see `early_access` too. |
| GET | `/home/grouped-by-location?locationsLimit=6&perLocation=6` | Optional | — | Listings grouped by province for home slider. |
| GET | `/:id` | Optional | — | Listing detail. `pending_payment` listings return 404 to non-owners. `early_access` listings return 404 to non-premium tenants. Contact details (`address`, `phoneNumber`) are stripped from public responses. |
| POST | `/` | Yes | landlord | Create listing. One active listing per landlord enforced. Sets `status=active`, `publishedAt=now`, `paymentDeadline=now+48h`. Triggers saved-search email alerts. |
| PATCH | `/:id` | Yes | landlord | Update listing content. Lifecycle fields (`status`, `paymentDeadline`, `publishedAt`, `earlyAccessUntil`) are blocked — use the transition endpoint. |
| DELETE | `/:id` | Yes | landlord | Delete listing (owner only). |
| POST | `/:id/transition` | Yes | landlord | Transition `active` listing to `pending_payment`. Only valid within the payment window. |

**Listing status state machine:**

```

active (new) → pending_payment (landlord triggers or payment deadline passes)
→ early_access (mock webhook with ?earlyAccess=true, 7 days)
→ active (standard webhook or early_access expires)
→ inactive (paymentDeadline passes without payment)

```

**Lifecycle rules (applied on every `GET /` call):**
- `early_access` listings whose `earlyAccessUntil` has passed → promoted to `active`
- `active` or `pending_payment` listings whose `paymentDeadline` has passed → demoted to `inactive`
- `active` listings published > 24h ago with a future `paymentDeadline` → demoted to `pending_payment`

---

## Listing Drafts `/api/v1/listing-drafts`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/` | Yes | landlord | Create a listing draft. Body: `{ data }`. |
| GET | `/mine` | Yes | landlord | List the current landlord's drafts. Returns `{ status, results, data: drafts }`. |
| GET | `/:id` | Yes | landlord | Get a single draft owned by the current landlord. |
| PUT | `/:id` | Yes | landlord | Update draft data. Body: `{ data }`. |
| DELETE | `/:id` | Yes | landlord | Delete a draft owned by the current landlord. |

---

## Payments `/api/v1/payments`

All payment routes are protected by `paymentLimiter` (10 requests per 15 minutes).

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/listing-fee` | Yes | landlord | Initiate listing activation fee. Body: `{ listingId, phone }`. Listing must be in `pending_payment`, `inactive`, or `active` status. Sets listing to `pending_payment`. Returns `{ transactionRef, instructions }`. |
| POST | `/tenant-premium` | Yes | tenant | Initiate 30-day premium subscription. Body: `{ phone }`. Returns `{ transactionRef, instructions }`. |
| GET | `/mine` | Yes | Any | Current user's payment history, ordered by `createdAt desc`. Includes linked listing name/status. |
| POST | `/:id/retry` | Yes | Any | Retry a `failed` or `pending` payment. Max 3 retries; 5-minute cooldown between retries. |
| GET | `/:id/status` | Yes | Any | Poll live payment status from provider. Returns `{ status, amountPaid, amountDue, retryCount }`. |

**Webhook (Paynow result URL):**

```

POST /webhooks/payment
POST /webhooks/payment?earlyAccess=true  ← mock-provider only

```

No auth — verified by Paynow hash. `earlyAccess=true` sets listing to `early_access` for 7 days instead of `active`. Idempotent — duplicate webhooks are safe.

---

## Accommodations `/api/v1/accommodations`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/:id/reviews` | No | — | Public accommodation reviews. |
| GET | `/:id/tax` | Yes | provider | Get accommodation tax details. |
| PUT | `/:id/tax` | Yes | provider | Create or update accommodation tax details. |
| GET | `/mine` | Yes | provider | Get the signed-in provider's accommodation. |
| PATCH | `/:id` | Yes | provider | Update accommodation details. |
| POST | `/:id/images` | Yes | provider | Add an accommodation image. |
| DELETE | `/:id/images/:imageId` | Yes | provider | Delete an accommodation image. |
| PUT | `/:id/cancellation-policy` | Yes | provider | Create or update the cancellation policy. |
| PUT | `/:id/checkin-rules` | Yes | provider | Create or update check-in rules. |

**Note:** This section documents the current backend router. Public accommodation search and detail live under `stays`, not `accommodations`.

---

## Rooms `/api/v1/rooms`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/` | No | — | List rooms (provider-scoped) |
| GET | `/:id` | No | — | Room detail |
| POST | `/` | Yes | provider | Create room |
| PUT | `/:id` | Yes | provider | Update room |
| DELETE | `/:id` | Yes | provider | Delete room |
| GET | `/:id/availability` | No | — | Room availability calendar |
| POST | `/:id/block` | Yes | provider | Block dates |
| DELETE | `/:id/blocks/:blockId` | Yes | provider | Remove date block |

---

## Stays `/api/v1/stays`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/` | No | — | Public stay search. |
| GET | `/:providerId` | No | — | Public stay listings for a provider. |

---

## Bookings `/api/v1/bookings`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/` | Yes | Any | Create booking request. Body: `{ roomId, checkIn, checkOut, adultCount, childCount?, infantCount?, specialRequests?, couponCode? }`. Validates availability, reservation rules, and computes a full pricing quote. Creates `BookingFeeSnapshot`. |
| GET | `/mine` | Yes | Any | Guest's bookings, ordered by `createdAt desc`. |
| POST | `/initiate-payment` | Yes | Any | Initiate full booking payment. Body: `{ bookingId, phone }`. Rate-limited. |
| POST | `/:id/cancel` | Yes | Any | Cancel booking. Applies cancellation policy refund rules. |
| PUT | `/:id/cancel` | Yes | Any | Alias for cancel (PUT). |
| GET | `/:id/cancellation-preview` | Yes | Any | Preview refund amount before cancelling. |
| POST | `/:id/partial-payment` | Yes | Any | Initiate partial payment. Rate-limited. |
| POST | `/:id/refund` | Yes | Any | Initiate refund. Rate-limited. |
| GET | `/provider` | Yes | provider | Provider's bookings. |
| PUT | `/:id/modify` | Yes | Any | Modify booking dates. Recalculates quote, checks availability, updates fee snapshot. |
| POST | `/:id/guest-info` | Yes | Any | Submit guest info for a booking. |
| GET | `/` | Yes | admin | All bookings (admin view). |
| GET | `/admin` | Yes | admin | Alias for admin bookings list. |
| POST | `/:id/confirm` | Yes | provider | Confirm a `request`-mode booking. |
| POST | `/:id/decline` | Yes | provider | Decline a booking. |
| PUT | `/:id/settle` | Yes | admin | Settle booking payout to provider. |
| POST | `/:id/settle` | Yes | admin | Alias for settle (POST). |
| GET | `/:id` | Yes | Any | Booking detail with full relations. |

**Reservation rules enforced on create/modify:**
- Check-in cannot be in the past
- Check-in cannot exceed `maxAdvanceBookingDays` (default 90)
- Minimum and maximum stay nights enforced
- Guest count validated against `occupancyRule` (maxGuests, maxAdults, maxChildren, maxInfants)
- Room must be `AVAILABLE` status
- No overlapping confirmed bookings

---

## Providers `/api/v1/providers`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/register` | No | — | Provider signup |
| GET | `/me` | Yes | provider | Provider profile |
| PUT | `/me` | Yes | provider | Update provider profile |
| GET | `/` | Yes | admin | List all providers |
| PATCH | `/:id/verify` | Yes | admin | Verify provider |
| PATCH | `/:id/commission` | Yes | admin | Set commission rate |

---

## Pricing `/api/v1/pricing`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/quote` | No | — | Get pricing quote for a room + dates |
| GET | `/rules/:roomId` | Yes | provider | Get room pricing rules |
| PUT | `/rules/:roomId` | Yes | provider | Update room pricing rules |

---

## Notifications `/api/v1/notifications`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/` | Yes | Any | List notifications. Query: `page`, `limit` (max 50). Returns `{ total, data }`. |
| GET | `/unread-count` | Yes | Any | Returns `{ count }` of unread notifications. |
| POST | `/push-subscription` | Yes | Any | Register Web Push subscription. Body: `{ endpoint, p256dh, auth }`. Upserts `UserPushSubscription`. |
| DELETE | `/push-subscription` | Yes | Any | Remove push subscription. |
| GET | `/preferences` | Yes | Any | Get notification preferences (`emailEnabled`, `pushEnabled`, `inAppEnabled`). |
| PUT | `/preferences` | Yes | Any | Update notification preferences. Body: `{ emailEnabled?, pushEnabled?, inAppEnabled? }`. |
| PUT | `/read-all` | Yes | Any | Mark all notifications as read. Returns `{ updated: count }`. |
| PUT | `/:id/read` | Yes | Any | Mark single notification as read. Returns updated notification. |

---

## Engagements `/api/v1/engagements`

Engagements are the contact mechanism between tenants and landlords. A tenant sends a message about a listing; the landlord approves or declines.

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/` | Yes | tenant | Create engagement. Body: `{ listingId, message }`. Prevents duplicate active engagements per listing. Creates in-app notification for landlord. |
| GET | `/mine` | Yes | tenant | Tenant's outgoing engagements. Includes listing details. Contact details (`address`, `phoneNumber`) are hidden until status is `APPROVED`. |
| GET | `/incoming` | Yes | landlord | Landlord's incoming engagements. Includes tenant profile (username, avatar, email). |
| PATCH | `/:id` | Yes | landlord | Respond to engagement. Body: `{ action: \"approve\" | \"decline\" }`. Creates in-app notification for tenant. On approval, tenant can see listing contact details. |

**Engagement status flow:** `PENDING` → `APPROVED` | `DECLINED`

**Note:** The TR Token deduction (5 TR per engagement) is referenced in the frontend docs but the deduction logic is enforced at the frontend wallet layer — the backend engagement controller does not currently deduct tokens directly.

---

## Saved Searches `/api/v1/saved-searches`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/` | Yes | tenant | Create saved search |
| GET | `/mine` | Yes | tenant | List saved searches |
| DELETE | `/:id` | Yes | tenant | Delete saved search |

---

## Disputes `/api/v1/disputes`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/` | Yes | Any | Open dispute |
| GET | `/` | Yes | admin | List all disputes |
| GET | `/mine` | Yes | Any | My disputes |
| PATCH | `/:id/resolve` | Yes | admin | Resolve dispute |

---

## Reports `/api/v1/reports`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/` | Yes | Any | Submit report |
| GET | `/` | Yes | admin | List all reports |
| PATCH | `/:id` | Yes | admin | Update report status |

---

## Admin `/api/v1/admin`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/listings/inactive` | Yes | admin | List inactive listings |
| POST | `/listings/revive` | Yes | admin | Bulk revive listings |
| GET | `/bookings` | Yes | admin | All bookings |

---

## Uploads `/api/v1/uploads`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/presign` | Yes | Any | Get S3 presigned upload URL |

---

## Legal Docs

```

GET /api/v1/legal-docs/:slug   → Public legal document by slug
GET /legal-docs/:slug          → Alias

```

---

## Error Response Shape

```json
{
  \"status\": \"fail\" | \"error\",
  \"message\": \"Human-readable error message\"
}
```

- `4xx` → `status: \"fail\"` (client error)
- `5xx` → `status: \"error\"` (server error)

## Success Response Shape

```json
{
  \"status\": \"success\",
  \"results\": 12,
  \"data\": { ... } | [ ... ]
}
```
