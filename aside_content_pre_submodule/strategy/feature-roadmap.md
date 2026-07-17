
---
title: Feature Roadmap
description: Strategic feature roadmap for the Town Ruins platform, including planned features, milestones, and release timeline.
tags:
  - roadmap
  - features
  - strategy
  - milestones
aliases:
  - Roadmap
  - Strategic Roadmap
---

# Feature Roadmap

## Status Key

Symbol

Meaning

✅

Complete

🔄

In progress

📋

Planned (next)

🔮

Future

## v1.0 — Foundation ✅

- Core listing marketplace (search, filter, detail)
- Landlord listing CRUD with payment lifecycle
- Tenant saved searches with email alerts
- Basic email/password authentication
- Paynow + mock payment provider abstraction
- S3 image upload (presigned URLs)
- Property card grid with amenity icons
- Provider (stays) system with room management
- Booking flow (request → confirm/decline → payment)
- Admin dashboard (inactive listings, provider verification, booking settlement)

## v1.1 — Premium Refinement ✅

- TR Token economy (100 welcome tokens, wallet card, purchase tiers)
- Engagement system (tenant contacts landlord for 5 TR; landlord approves for 5 TR)
- Listing drafts with autosave and resume editing
- Notification system (in-app, email, SMS, push channels)
- Pricing engine (seasonal rules, weekend rates, promotions)
- Dispute and report moderation system
- Legal documents (Terms, Privacy, Landlord Agreement, Refund Policy, Community Guidelines)
- Trust & Safety page
- Docs hub with Release Notes, TR Tokens, Tenant Guide, Landlord Guide, Roadmap
- Post-signup onboarding flow with wallet introduction
- Email verification flow with guided redirect
- Provider dashboard (rooms, availability, bookings, analytics, payouts tabs)
- Dark/light mode toggle
- Push notification support (FCM)
- Search cache and search analytics

## v1.2 — Live Payments & Messaging 📋

Feature

Priority

Notes

Live Paynow integration

🔴 Critical

Switch `PAYMENT_PROVIDER` from `mock` to `paynow`

Africa's Talking SMS live

🔴 Critical

Switch `SMS_PROVIDER` from `mock` to `africastalking`

In-app messaging

🟠 High

Direct landlord ↔ tenant chat

Advanced search filters

🟠 High

Price range slider, amenity multi-select, distance radius

Saved search push alerts

🟡 Medium

Notify tenant when matching listing appears

Featured listings (token-gated)

🟡 Medium

20 TR for featured placement

Visibility boost (token-gated)

🟡 Medium

10 TR for search ranking boost

Mobile PWA improvements

🟡 Medium

Offline support, install prompt

Provider payout automation

🟡 Medium

Scheduled payout after stay completion

Review system improvements

🟢 Low

Verified-stay reviews, landlord reply, moderation queue

## v2.0 — Scale & Intelligence 🔮

Feature

Description

Native mobile app

React Native sharing Redux API slices

AI property matching

ML recommendations from saved searches + engagement history

Landlord analytics dashboard

Occupancy rate, revenue, engagement funnel per listing

Multi-currency support

USD, ZWL, ZAR — currency selector in profile and listings

Background check integration

Third-party tenant ID/credit verification

Lease document generation

Auto-generate PDF lease from listing terms + tenant details

Multi-city expansion

Extend provinces/neighborhoods config beyond Zimbabwe

Landlord co-management

Multiple managers per property with role-based access

Recurring billing

Monthly subscription invoices with auto-renewal

Analytics dashboard

Event taxonomy, funnel reporting, admin export

## Known Technical Debt

Item

File

Priority

Frontend uses `PATCH /providers/me`; backend exposes `PUT /providers/me`

`providerApiSlice.ts`

🟠 High

Frontend uses `PATCH /rooms/:id`; backend exposes `PUT /rooms/:id`

`stayApiSlice.ts`

🟠 High

No provider settlement summary route (`GET /providers/me/settlements`)

`providerController.js`

🟠 High

`GET /users/:id` returns listing owner by listing ID, not user by user ID — misleading route name

`userRoutes.js`

🟡 Medium

`PUT /update/:id` and `DELETE /delete/:id` use non-RESTful paths with verbs in URL

`userRoutes.js`

🟡 Medium

Growing controller complexity — missing service layer abstraction

All controllers

🟡 Medium

`deleteUserAccount` transaction in `authController.js` is very large — should be extracted to a service

`authController.js`

🟡 Medium

Frontend automated test coverage is thin — only backend tests exist

`src/`

🟡 Medium

`docs/` markdown files were empty

`docs/`

✅ Fixed

`phoneOtpResendAttempts` is an in-memory Map — resets on server restart, not suitable for multi-instance deployments

`authController.js`

🟢 Low

`applyListingLifecycle()` runs on every `GET /listings` call — should be a cron job

`listingController.js`

🟢 Low
