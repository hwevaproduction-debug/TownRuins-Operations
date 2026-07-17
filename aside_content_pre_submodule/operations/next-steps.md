
---
title: Next Steps — Post-Launch
description: Engineering team post-launch action plan for the Town Ruins platform, covering Phase 1 priorities and follow-up tasks.
tags:
  - next-steps
  - post-launch
  - action-plan
aliases:
  - Next Steps
  - Post-Launch
---

# Next Steps — Post-Launch

<user_quoted_section>This document is the engineering team's post-launch action plan. Work through Phase 1 before anything else.</user_quoted_section>

## Phase 1 — Immediate (Week 1–2)

These items must be done before the platform is considered fully live.

### 🔴 Critical

- [ ] **Switch payment provider to live**
Set `PAYMENT_PROVIDER=paynow` in Amplify Console (backend). Test with real Paynow credentials end-to-end.
- [ ] **Disable email/phone verification skip**
Remove `SKIP_EMAIL_VERIFICATION` and `SKIP_PHONE_VERIFICATION` from production environment variables (or set to `false`).
- [ ] **Verify JWT_SECRET is production-strength**
Must be ≥ 64 random characters. Never reuse a dev/test value.
- [ ] **Confirm all Prisma migrations applied**
Check Amplify build logs — last migration should be `20260523200000_legal_documents`.

### 🟠 High

- [ ] **Monitor error logs daily**
CloudWatch → Amplify backend compute logs. Watch for 5xx spikes in the first week.
- [ ] **Seed pilot landlord listings**
Work with 2–3 real landlords to create the first live listings. The platform needs content to be useful.
- [ ] **Verify all transactional emails arrive**
Test: signup verification, booking confirmation, password reset, stay reminder.
- [ ] **Set **`E2E_API_BASE_URL`** GitHub secret**
Enables the deployed E2E job in `.github/workflows/e2e.yml` to run against production.

### 🟡 Medium

- [ ] **Set up uptime monitoring**
UptimeRobot or Better Uptime on `GET /api/v1`. Alert on downtime > 2 minutes.
- [ ] **Configure S3 CORS**
Run `npm run s3:cors` from `real-app-backend-main/` against the production bucket.

## Phase 2 — Short-Term (Month 1)

### 🟠 High

- [ ] **Africa's Talking SMS live**
Set `SMS_PROVIDER=africastalking` with live credentials. Test OTP delivery to real phone numbers.
- [ ] **Admin moderation training**
Train admin users on: dispute resolution, report handling, listing approval/rejection, provider verification.
- [ ] **Fix frontend/backend contract gaps**
See [docs/strategy/feature-roadmap.md](../strategy/feature-roadmap.md) → Known Technical Debt. Priority: provider profile PATCH vs PUT, room update PATCH vs PUT.

### 🟡 Medium

- [ ] **Advanced search filters**
Price range slider, amenity multi-select, distance radius. Extend `SearchBar` and `listingController.js`.
- [ ] **In-app messaging**
Direct landlord ↔ tenant chat. New `Message` model, new route group, new frontend view.
- [ ] **Mobile PWA improvements**
Offline support via service worker (`public/service-worker.js`), install prompt, push notification opt-in.

### 🟢 Low

- [ ] **Featured listings (token-gated)**
20 TR for featured placement. Already referenced in `TRTokens.tsx` as \"coming soon\".
- [ ] **Visibility boost (token-gated)**
10 TR for search ranking boost.

## Phase 3 — v1.2 Milestone

Item

Owner

Notes

In-app messaging

Backend + Frontend

New `Message` model + chat UI

Landlord analytics dashboard

Frontend

Extend `AnalyticsTab.tsx` with real data

Multi-currency support

Full stack

Currency selector, exchange rate API

Saved search push alerts

Backend

Extend `reminderScanner.js`

Provider payout automation

Backend

Extend `reconciliationJob.js`

Review system improvements

Full stack

Verified-stay reviews, landlord reply

## Phase 4 — Future (v2.0+)

Item

Description

Native mobile app

React Native sharing Redux API slices

AI property matching

ML recommendations from saved searches + engagement history

Background check integration

Third-party tenant ID/credit verification

Lease document generation

Auto-generate PDF lease from listing terms + tenant details

Multi-city expansion

Extend `zimbabweProvinces.ts` and `zimbabweNeighborhoods.ts`

Landlord co-management

Multiple managers per property with role-based access

## Reference

- Production checklist: see Epic spec `Production Checklist — Town Ruins v1.1`
- Architecture: [docs/reference/architecture.md](../reference/architecture.md)
- API reference: [docs/reference/api.md](../reference/api.md)
- Database schema: [docs/reference/database.md](../reference/database.md)
- Feature roadmap: [docs/strategy/feature-roadmap.md](../strategy/feature-roadmap.md)
- Deployment guide: [docs/operations/DEPLOYMENT.md](DEPLOYMENT.md)
- Frontend env vars: [real-app-frontend-main/AMPLIFY_ENV.md](../../real-app-frontend-main/AMPLIFY_ENV.md)
