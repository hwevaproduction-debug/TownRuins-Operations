---
title: Architecture
description: Quick-reference architecture documentation for the Town Ruins platform, covering system overview, application structure, and deployment topology.
tags:
  - architecture
  - reference
  - system-design
aliases:
  - Arch
  - Reference Architecture
---

# Architecture

## Overview

Town Ruins is a rental marketplace with two separately deployed applications sharing one PostgreSQL database.

- **Frontend** — React 18 SPA, hosted on AWS Amplify
- **Backend** — Node.js / Express 4 API, hosted on AWS Amplify (compute)
- **Database** — Aurora PostgreSQL via Prisma ORM
- **Storage** — Amazon S3 for listing and room images
- **Auth** — JWT (email/password) + Firebase (Google OAuth)
- **Payments** — Paynow (primary) + Stripe (secondary) + Mock (test/dev)
- **Email** — Gmail SMTP via Nodemailer
- **SMS** — Africa's Talking (OTP) with mock mode

## System Diagram

```

Browser (React SPA)
│
│ HTTPS
▼
AWS Amplify Frontend ──── static build/
│
│ REACT_APP_API_URL
▼
AWS Amplify Backend (nodejs20.x compute)
│
├── Express app (app.js)
│       ├── CORS (townruins.com + *.amplifyapp.com)
│       ├── Rate limiter (globalLimiter)
│       ├── JWT auth middleware
│       └── Route handlers
│
├── Prisma Client ──────────────── Aurora PostgreSQL
├── AWS S3 SDK ─────────────────── S3 Bucket (images)
├── Nodemailer ─────────────────── Gmail SMTP
├── Africa's Talking ───────────── SMS OTP
├── Paynow SDK ─────────────────── Paynow (payments)
└── Firebase Admin ─────────────── Google OAuth

```

## Monorepo Layout

```

Creapy/
├── real-app-backend-main/    # Express API
├── real-app-frontend-main/   # React SPA
├── amplify.yml               # Root monorepo descriptor
├── .github/workflows/e2e.yml # CI pipeline
└── docs/                     # This documentation

```

Each subdirectory is a separate Amplify app. The root `amplify.yml` satisfies Amplify monorepo detection only — each app's own `amplify.yml` governs its build.

## Backend Structure

```

real-app-backend-main/
├── server.js          # Entry point — starts Express, connects DB, starts cron jobs
├── app.js             # Express app — CORS, routes, error handler
├── controllers/       # Route handlers (one file per domain)
├── routes/            # Express routers (one file per domain)
├── middleware/        # Validators, rate limiter, auth
├── utils/             # Services, helpers, providers
│   ├── providers/     # Payment provider abstraction (paynow, stripe, mock)
│   ├── channels/      # Notification channels (email, sms, push, in-app)
│   └── notificationTemplates/  # Localised notification copy
├── prisma/            # Schema + migrations
├── tests/             # Unit tests + E2E suite
└── seed/              # Demo data seeders

```

## Frontend Structure

```

real-app-frontend-main/src/
├── App.tsx            # Router + theme provider
├── views/             # Page-level components (one folder per route)
├── components/        # Shared UI components
│   └── ui/            # AppButton, AppCard, AppContainer, AppInput, AppSelect
├── redux/
│   ├── api/           # RTK Query slices (one per domain)
│   └── auth/          # Auth state slice
├── config/            # Static config (provinces, monetization)
├── firebase/          # Firebase SDK init
├── hooks/             # Custom React hooks
└── utils/             # Formatting helpers

```

## Background Jobs

Three cron jobs start on server boot (skipped in `NODE_ENV=test`):

| Job | File | Purpose |
|-----|------|---------|
| Reconciliation | `utils/reconciliationJob.js` | Sync payment/booking states, expire stale payments |
| Notification worker | `utils/notificationWorker.js` | Dispatch queued `NotificationJob` records via email/SMS/push/in-app channels |
| Reminder scanner | `utils/reminderScanner.js` | Send check-in/checkout reminder emails to guests and providers |

## Rate Limiting

Two rate limiters are defined in `real-app-backend-main/middleware/rateLimiter.js`:

| Limiter | Window | Max Requests | Applied To |
|---------|--------|-------------|------------|
| `globalLimiter` | 15 min | 100 | All routes (via `app.use`) |
| `paymentLimiter` | 15 min | 10 | All `/api/v1/payments` routes + booking payment/refund endpoints |

Both limiters can be bypassed by requests carrying the `X-Seed-Api-Key` header matching `SEED_API_KEY` — used by the E2E seeder only.

## Security Model

| Layer | Mechanism |
|-------|-----------|
| Authentication | JWT (`jsonwebtoken`), verified on every protected request via `protect` middleware |
| Optional auth | `optionalAuth` middleware — attaches user if token present, continues without error if absent |
| Role enforcement | `requireRole(role)` middleware — returns 403 if user role doesn't match |
| Premium enforcement | `requirePremium` middleware — returns 402 if tenant's `premiumExpiry` is in the past |
| CORS | Allowlist: `townruins.com`, `*.amplifyapp.com`, `localhost`. Configured origins via `FRONTEND_URL` + `CORS_ALLOWED_ORIGINS` env vars |
| Rate limiting | Global (100/15min) + payment-specific (10/15min) |
| Password hashing | bcrypt with cost factor 12 |
| OTP hashing | SHA-256 (phone OTP, email verification token, password reset token) |

## Auth Flow

```

Signup → Email verification token sent
→ User clicks link → isEmailVerified = true
→ Landlords: phone OTP sent → isPhoneVerified = true
→ JWT issued on login
→ Frontend stores JWT in Redux + localStorage
→ RTK Query attaches Authorization: Bearer <token>

```

## Payment Flow

```

Initiate (POST /api/v1/payments/listing-fee)
→ Paynow SDK creates payment request
→ Returns pollUrl to frontend
→ Frontend polls status
→ Paynow calls PAYNOW_RESULT_URL (POST /webhooks/payment)
→ Webhook verifies hash, updates Payment + Listing/User status

```

## Deployment Flow

```

git push main
→ GitHub Actions: E2E tests (postgres service container)
→ Amplify Backend: npm ci → prisma generate → prisma migrate deploy → bundle
→ Amplify Frontend: npm ci → npm run build → static deploy

```
