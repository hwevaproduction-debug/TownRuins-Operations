---
title: Smoke Test Plan
description: Launch-day fast verification guide for the Town Ruins platform, covering critical workflow verification in 15-30 minutes.
tags:
  - smoke-tests
  - launch-day
  - verification
  - qa
aliases:
  - Smoke Tests
  - Launch Verification
---

# SMOKE_TEST_PLAN.md — Launch-Day Fast Verification Guide

> **Version:** 1.1
> **Purpose:** Fast verification of critical workflows before declaring deployment successful
> **Target time:** 15–30 minutes
> **Owner:** QA / DevOps
> **Cross-reference:** `POST_DEPLOYMENT_CHECKLIST.md`, `TROUBLESHOOTING.md`

## Overview

This plan covers the minimum set of critical paths that must pass before go-live is declared. It is intentionally fast — use `POST_DEPLOYMENT_CHECKLIST.md` for the comprehensive post-deployment review.

**Required tools:** Browser (Chrome recommended), API client (curl or Postman), backend logs access.

## Phase 1 — Infrastructure (5 minutes)

### ST-01: API Health Check

GET https://api.townruins.com/api/v1 Expected: 200 {"status":"ok","message":"Town Ruins API v1 is running."}



- [ ] ✅ Pass — proceed to ST-02
- [ ] ❌ Fail — check EB Console → Events and EB logs; consult `TROUBLESHOOTING.md` → Elastic Beanstalk Deployment Failures

### Execution Log

| Date | Executed By | Result | Notes |
| ---- | ----------- | ------ | ----- |
| | | | |

### ST-02: Frontend Loads

- [ ] Navigate to `https://townruins.com` (or the Amplify preview URL)
- [ ] Home page renders without blank screen or console errors
- [ ] No `Failed to fetch` errors in browser DevTools Network tab
- [ ] Cloudflare is serving the page (check `CF-Ray` header in DevTools → Network)

### Execution Log

| Date | Executed By | Result | Notes |
| ---- | ----------- | ------ | ----- |
| | | | |

### ST-03: Database Connected

- [ ] EB logs contain: `Connected to Aurora PostgreSQL` (or `Connected to PostgreSQL`)
- [ ] No `PrismaClientInitializationError` in EB logs
- [ ] EB deployment events show `.ebextensions` migration hook completed successfully

### Execution Log

| Date | Executed By | Result | Notes |
| ---- | ----------- | ------ | ----- |
| | | | |

## Phase 2 — Authentication (5 minutes)

### ST-04: New User Registration

1. Navigate to `/signup`
2. Register with a fresh test email address
3. Verify: account created, verification email received

- [ ] ✅ Registration succeeds
- [ ] ✅ Verification email received within 2 minutes

### Execution Log

| Date | Executed By | Result | Notes |
| ---- | ----------- | ------ | ----- |
| | | | |

### ST-05: Login

1. Navigate to `/login`
2. Log in with the test account
3. Verify: redirected to dashboard, user name visible in header

- [ ] ✅ Login succeeds
- [ ] ✅ JWT stored (check DevTools → Application → Local Storage)

### Execution Log

| Date | Executed By | Result | Notes |
| ---- | ----------- | ------ | ----- |
| | | | |

### ST-06: Google OAuth

1. Click "Sign in with Google"
2. Complete Google OAuth flow
3. Verify: user logged in, no Firebase errors

- [ ] ✅ OAuth completes without error

### Execution Log

| Date | Executed By | Result | Notes |
| ---- | ----------- | ------ | ----- |
| | | | |

## Phase 3 — Core Listing Flow (5 minutes)

### ST-07: Home Feed

1. Navigate to `/`
2. Verify: listing cards are visible with images, prices, and locations

- [ ] ✅ At least 1 listing visible
- [ ] ✅ Images load from S3 (not broken image icons)

### Execution Log

| Date | Executed By | Result | Notes |
| ---- | ----------- | ------ | ----- |
| | | | |

### ST-08: Search

1. Use the search bar to search for "Harare"
2. Verify: results appear, filtered by location

- [ ] ✅ Search returns results

### Execution Log

| Date | Executed By | Result | Notes |
| ---- | ----------- | ------ | ----- |
| | | | |

### ST-09: Listing Detail

1. Click on any listing
2. Verify: detail page loads with full description, images, and contact/booking options

- [ ] ✅ Detail page loads without errors

### Execution Log

| Date | Executed By | Result | Notes |
| ---- | ----------- | ------ | ----- |
| | | | |

## Phase 4 — Temporary Stay Booking (5 minutes)

### ST-10: Room Search

1. Navigate to the Stays section
2. Search for available rooms with a future date range
3. Verify: room cards appear with pricing

- [ ] ✅ Rooms visible with correct pricing

### Execution Log

| Date | Executed By | Result | Notes |
| ---- | ----------- | ------ | ----- |
| | | | |

### ST-11: Booking Initiation

1. Select a room and click "Book"
2. Select dates and guest count
3. Verify: price breakdown is shown (base price, fees, tax)
4. Proceed to payment step

- [ ] ✅ Price breakdown is correct
- [ ] ✅ Payment step is reached

> **Note:** Do not complete a real payment in smoke testing unless using a test payment account.

### Execution Log

| Date | Executed By | Result | Notes |
| ---- | ----------- | ------ | ----- |
| | | | |

## Phase 5 — Notifications & PWA (5 minutes)

### ST-12: In-App Notification

1. Trigger a notification event (e.g., complete a booking request)
2. Verify: notification bell badge increments
3. Click bell — notification appears in list

- [ ] ✅ Notification received in-app

### Execution Log

| Date | Executed By | Result | Notes |
| ---- | ----------- | ------ | ----- |
| | | | |

### ST-13: Push Notification Prompt

1. Open the app in Chrome
2. Verify: push notification permission prompt appears (or has been previously granted)
3. Grant permission
4. Verify: subscription is saved (check backend `UserPushSubscription` table)

- [ ] ✅ Push subscription saved

### Execution Log

| Date | Executed By | Result | Notes |
| ---- | ----------- | ------ | ----- |
| | | | |

### ST-14: PWA Installability

1. Open Chrome DevTools → Application → Manifest
2. Verify: manifest loads with correct `name`, `theme_color`, `icons`
3. Verify: "Add to Home Screen" prompt is available

- [ ] ✅ PWA manifest valid

### Execution Log

| Date | Executed By | Result | Notes |
| ---- | ----------- | ------ | ----- |
| | | | |

## Phase 6 — Admin & Payments (5 minutes)

### ST-15: Admin Login

1. Log in with admin credentials (`admin@demo.com` / `demo1234` in demo; production credentials differ)
2. Navigate to admin dashboard
3. Verify: user list, listing moderation, and dispute management are accessible

- [ ] ✅ Admin dashboard accessible

### Execution Log

| Date | Executed By | Result | Notes |
| ---- | ----------- | ------ | ----- |
| | | | |

### ST-16: Payment Webhook Reachability

```bash
POST https://api.townruins.com/webhooks/<provider>
```

Expected: 200 or 400 (not 404 or 502)

- [ ] ✅ Webhook endpoint is reachable via Cloudflare-proxied domain

### Execution Log

| Date | Executed By | Result | Notes |
| ---- | ----------- | ------ | ----- |
| | | | |

## Go / No-Go Decision

| Phase | Tests | Pass | Fail | Decision |
|---|---|---|---|---|
| Infrastructure | ST-01 to ST-03 | | | |
| Authentication | ST-04 to ST-06 | | | |
| Listings | ST-07 to ST-09 | | | |
| Bookings | ST-10 to ST-11 | | | |
| Notifications | ST-12 to ST-14 | | | |
| Admin & Payments | ST-15 to ST-16 | | | |

**GO criteria:** All Phase 1–3 tests pass. Phase 4–6 failures may be acceptable for a staged rollout with a mitigation plan.

**NO-GO criteria:** Any Phase 1 or Phase 2 test fails.
