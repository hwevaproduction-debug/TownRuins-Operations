---
title: Environment Variables
description: Complete environment variable reference for the Town Ruins platform, derived from render.yaml, amplify.yml, app.js, server.js, and utility files.
tags:
  - environment-variables
  - config
  - devops
aliases:
  - Env Vars
  - Configuration
---

# ENVIRONMENT_VARIABLES.md — Complete Environment Variable Reference

> **Version:** 1.1
> **Purpose:** Authoritative reference for all environment variables used by the application
> **Source:** Derived from `render.yaml`, `amplify.yml`, `app.js`, `server.js`, and all utility files
> **Owner:** DevOps
> **Cross-reference:** `DEPLOYMENT.md`, `PRE_DEPLOYMENT_CHECKLIST.md`

> ⚠️ **Never commit real secret values to the repository.** Backend secrets must be set via the **Elastic Beanstalk Console** → Environment Properties. Frontend secrets must be set via the **Amplify Console** → Environment Variables.

## Backend Environment Variables

| Variable | Required | Default | Environment | Description | Where Used | Related Feature | Security Considerations | Sensitive |
|---|---|---|---|---|---|---|---|---|
| `DATABASE_URL` | 🔴 Yes | — | All | PostgreSQL connection string (`postgresql://user:pass@host:5432/db?schema=public`) | Prisma client | Database connectivity | Rotate periodically; never commit to source control; store in EB secrets; restrict production access | **Yes** |
| `JWT_SECRET` | 🔴 Yes | — | All | Secret key for signing JWT tokens | `utils/auth.js` | Authentication & session management | Rotate after any suspected exposure; use strong random value (min 32 chars); store in secrets manager | **Yes** |
| `JWT_EXPIRES_IN` | 🔴 Yes | — | All | JWT expiry duration (e.g., `30d`, `7d`) | `utils/auth.js` | Session duration | Keep reasonable to balance UX and security; shorter is more secure | No |
| `NODE_ENV` | 🔴 Yes | `development` | All | Runtime environment (`development`, `test`, `production`) | `app.js`, `server.js`, `email.js` | Environment detection | Ensure production value is never overridden accidentally | No |
| `PORT` | No | `5000` | All | HTTP port the server listens on | `server.js` | Server configuration | Use default unless port conflict; ensure firewall allows traffic | No |
| `FRONTEND_URL` | 🔴 Yes | — | Production | Production frontend URL (e.g., `https://townruins.com`) | CORS, email links, S3 CORS | Frontend communication | Verify matches actual frontend domain; used in CORS allowlist | No |
| `APP_BASE_URL` | 🔴 Yes | — | Production | Production backend URL (e.g., `https://api.townruins.com`) | Email verification links | Email functionality | Verify matches actual API domain; used in email templates | No |
| `CORS_ALLOWED_ORIGINS` | No | — | Production | Comma-separated additional CORS origins | `app.js` | Cross-origin requests | Only add trusted origins; validate format; review periodically | No |
| `TOKEN_PAYER_ROLE` | 🔴 Yes | `LANDLORD` | All | Token-payer role for non-booking premium flows (`LANDLORD` or `TENANT`) | `utils/monetization.js` | Revenue model | Ensure matches frontend; impacts non-booking token deductions | No |
| `LISTING_FEE_AMOUNT` | 🔴 Yes | `5` | All | Token cost for listing activation/restoration flows | Payment controllers | Listing creation | Keep consistent with frontend; impacts token-based listing actions | No |
| `TENANT_PREMIUM_AMOUNT` | 🔴 Yes | `10` | All | Token cost for tenant premium access | Payment controllers | Subscription model | Keep consistent with frontend; impacts token-based premium access | No |
| `PAYMENT_PROVIDER` | 🔴 Yes | `mock` | All | `paynow`, `stripe`, or `mock` | `utils/paymentProvider.js` | Payment processing | Use `mock` only in dev/test; verify provider credentials | No |
| `PAYNOW_INTEGRATION_ID` | Conditional | — | Production | Paynow integration ID (required if `PAYMENT_PROVIDER=paynow`) | `utils/providers/paynowProvider.js` | Payment processing (Paynow) | Rotate if compromised; verify with Paynow dashboard; mark as secret | **Yes** |
| `PAYNOW_INTEGRATION_KEY` | Conditional | — | Production | Paynow integration key | `utils/providers/paynowProvider.js` | Payment processing (Paynow) | Rotate after any suspected exposure; store securely; never log | **Yes** |
| `PAYNOW_RESULT_URL` | Conditional | — | Production | Paynow webhook result URL | `utils/providers/paynowProvider.js` | Payment callback | Verify URL is publicly accessible; matches Paynow configuration | No |
| `PAYNOW_RETURN_URL` | Conditional | — | Production | Paynow redirect URL after payment | `utils/providers/paynowProvider.js` | Payment flow | Ensure URL is valid; matches Paynow configuration | No |
| `STRIPE_SECRET_KEY` | Conditional | — | Production | Stripe secret key (required if `PAYMENT_PROVIDER=stripe`) | `utils/providers/stripeProvider.js` | Payment processing (Stripe) | Rotate immediately after exposure; use environment secrets; restrict access | **Yes** |
| `STRIPE_WEBHOOK_SECRET` | Conditional | — | Production | Stripe webhook signing secret | `controllers/webhookController.js` | Webhook verification | Rotate after webhook endpoint changes; never expose in logs | **Yes** |
| `GMAIL_USER` | 🔴 Yes | — | Production | Gmail address for sending emails | `utils/email.js` | Email functionality | Verify account is in good standing; monitor sending limits | No |
| `GMAIL_APP_PASSWORD` | 🔴 Yes | — | Production | Gmail App Password (not account password) | `utils/email.js` | Email delivery | Generate new app password if compromised; never use main password | **Yes** |
| `EMAIL_FROM` | No | `GMAIL_USER` | Production | Sender display address | `utils/email.js` | Email branding | Use recognizable address; matches Gmail user domain | No |
| `S3_BUCKET` | 🔴 Yes | — | Production | AWS S3 bucket name for image uploads | `controllers/uploadController.js`, `scripts/configure-s3-cors.js` | File storage | Verify bucket exists; check IAM permissions; enable versioning | No |
| `S3_REGION` | 🔴 Yes | — | Production | AWS S3 bucket region | `controllers/uploadController.js`, `scripts/configure-s3-cors.js` | File storage | Must match bucket region; affects latency and costs | No |
| `S3_PUBLIC_BASE_URL` | 🔴 Yes | — | Production | Public base URL for S3 objects (e.g., `https://bucket.s3.region.amazonaws.com`) | `controllers/uploadController.js` | File serving | Verify publicly accessible; test with sample image | No |
| `S3_ACCESS_KEY_ID` | No | IAM role | Production | AWS access key ID (omit if using IAM role) | `controllers/uploadController.js`, `scripts/configure-s3-cors.js` | S3 access | Prefer IAM role; if used, rotate periodically; restrict permissions | **Yes** |
| `S3_SECRET_ACCESS_KEY` | No | IAM role | Production | AWS secret access key (omit if using IAM role) | `controllers/uploadController.js`, `scripts/configure-s3-cors.js` | S3 access | Prefer IAM role; if used, rotate periodically; restrict permissions | **Yes** |
| `AWS_REGION` | No | `S3_REGION` | Production | Fallback AWS region | `scripts/configure-s3-cors.js` | AWS SDK | Should match S3_REGION; used for SDK defaults | No |
| `SKIP_EMAIL_VERIFICATION` | No | `false` | Dev/Test | Set `true` to skip email verification (never in production) | `controllers/authController.js` | Development workflow | Must be `false` in production; verify before launch | No |
| `SKIP_PHONE_VERIFICATION` | No | `false` | Dev/Test | Set `true` to skip phone OTP verification | `controllers/authController.js` | Development workflow | Must be `false` in production; verify before launch | No |
| `SKIP_PRISMA_GENERATE_ON_START` | No | `false` | Production | Set `true` to skip runtime Prisma generate (use if pre-built) | `server.js` | Build optimization | Use only if Prisma client is pre-generated; verify build includes client | No |
| `SMS_PROVIDER` | No | — | All | Set to `mock` to disable real SMS sending | `utils/sms.js` | SMS functionality | Use `mock` in dev/test; verify production value before launch | No |
| `AT_API_KEY` | Conditional | — | Production | Africa's Talking API key (required if SMS enabled) | `utils/sms.js` | SMS delivery | Rotate if compromised; restrict to SMS usage; mark as secret | **Yes** |
| `AT_USERNAME` | Conditional | — | Production | Africa's Talking username | `utils/sms.js` | SMS delivery | Verify account is active; matches Africa's Talking dashboard | No |
| `AT_SENDER_ID` | No | — | Production | Africa's Talking sender ID | `utils/sms.js` | SMS delivery | Verify with Africa's Talking for approval; matches registered sender | No |
| `VAPID_PUBLIC_KEY` | 🔴 Yes | — | Production | VAPID public key for Web Push | `utils/channels/pushChannel.js` | Push notifications | Generate via `web-push generate`; share with frontend; rotate annually | No |
| `VAPID_PRIVATE_KEY` | 🔴 Yes | — | Production | VAPID private key for Web Push | `utils/channels/pushChannel.js` | Push notifications | Generate via `web-push generate`; keep private; rotate annually | **Yes** |
| `VAPID_SUBJECT` | 🔴 Yes | — | Production | VAPID subject (`mailto:` or URL) | `utils/channels/pushChannel.js` | Push notifications | Use valid mailto: or URL; must match push subscription | No |
| `NOTIFICATION_WORKER_CRON` | No | `*/30 * * * * *` | All | Cron expression for notification worker (every 30 seconds) | `utils/notificationWorker.js` | Background jobs | Verify syntax; test in staging; monitor execution logs | No |
| `NOTIFICATION_BATCH_SIZE` | No | `20` | All | Number of notification jobs processed per batch | `utils/notificationWorker.js` | Background jobs | Adjust based on load; monitor queue depth | No |
| `MAX_NOTIFICATION_RETRIES` | No | `3` | All | Max retry attempts for failed notification jobs | `utils/notificationWorker.js` | Background jobs | Balance between reliability and queue growth | No |
| `RECONCILIATION_INTERVAL_CRON` | No | `*/15 * * * *` | All | Cron expression for payment reconciliation (every 15 minutes) | `utils/reconciliationJob.js` | Payment processing | Verify syntax; ensure payments settle within window | No |
| `RECONCILIATION_STALE_MINUTES` | No | `15` | All | Minutes before a pending payment is considered stale | `utils/reconciliationJob.js` | Payment processing | Adjust based on payment provider settlement times | No |
| `MAX_PAYMENT_RETRIES` | No | `3` | All | Max retry attempts for failed payments | `utils/reconciliationJob.js` | Payment processing | Balance between reliability and customer experience | No |
| `REMINDER_SCAN_CRON` | No | `0 * * * *` | All | Cron expression for booking reminder scanner (every hour) | `utils/reminderScanner.js` | Notifications | Verify syntax; matches business hours or 24/7 | No |
| `EXPIRY_SCAN_CRON` | No | `*/30 * * * *` | All | Cron expression for listing expiry scanner (every 30 minutes) | `utils/listingExpiryScanner.js` | Listing management | Verify syntax; frequency matches listing lifetime | No |
| `SEED_API_KEY` | No | — | Dev/Test/CI | API key to bypass rate limiting for seeding (set in production to prevent abuse) | `middleware/rateLimiter.js` | Data seeding | Use strong random value; restrict access; rotate annually; set in production to prevent abuse | **Yes** |

## Frontend Environment Variables

| Variable | Required | Default | Environment | Description | Where Used | Related Feature | Security Considerations | Sensitive |
|---|---|---|---|---|---|---|---|---|
| `REACT_APP_API_URL` | 🔴 Yes | Placeholder | Production | Backend API base URL (e.g., `https://api.townruins.com/api/v1`) | `redux/api/apiSlice.ts` | API communication | Verify matches actual API endpoint; used in all API calls | No |
| `REACT_APP_BACKEND_URL` | 🔴 Yes | Placeholder | Production | Backend root URL (e.g., `https://api.townruins.com`) | Various API slices | API communication | Verify matches actual backend URL | No |
| `REACT_APP_FIREBASE_API_KEY` | 🔴 Yes | Set in repo | All | Firebase web API key (the only Firebase value currently read from the frontend environment) | `src/firebase/index.ts` | Firebase authentication | Public key is safe to expose; verify matches Firebase project | No (public) |
| `REACT_APP_TOKEN_PAYER_ROLE` | 🔴 Yes | `LANDLORD` | All | Token-payer role displayed to the UI — must match backend | `src/config/monetization.ts` | Revenue model | Must match backend value; impacts token-based UI semantics | No |
| `REACT_APP_LISTING_FEE_AMOUNT` | 🔴 Yes | `5` | All | Listing activation/restoration token cost displayed to users — must match backend | UI components | Listing creation | Must match backend value; impacts displayed token costs | No |
| `REACT_APP_TENANT_PREMIUM_AMOUNT` | 🔴 Yes | `10` | All | Premium access token cost displayed — must match backend | UI components | Subscription model | Must match backend value; impacts displayed token costs | No |
| `DISABLE_ESLINT_PLUGIN` | No | `false` | All | Set `true` to disable ESLint during build | CRA build | Build process | Only use if build fails due to ESLint; re-enable before production | No |
| `TOKEN_PAYER_ROLE` | No | `LANDLORD` | All | Fallback if `REACT_APP_TOKEN_PAYER_ROLE` not set | `src/config/monetization.ts` | Revenue model | Not intended for direct use; keep in sync with REACT_APP_TOKEN_PAYER_ROLE | No |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | No | `smtp-a6e98.firebaseapp.com` | All | Firebase auth domain (hardcoded in `src/firebase/index.ts`) | Not consumed from env | Firebase auth | Value is hardcoded; env var not used by current implementation | No |
| `REACT_APP_FIREBASE_PROJECT_ID` | No | `smtp-a6e98` | All | Firebase project ID (hardcoded in `src/firebase/index.ts`) | Not consumed from env | Firebase auth | Value is hardcoded; env var not used by current implementation | No |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | No | `43579261181` | All | Firebase messaging sender ID (hardcoded in `src/firebase/index.ts`) | Not consumed from env | Firebase auth | Value is hardcoded; env var not used by current implementation | No |
| `REACT_APP_FIREBASE_APP_ID` | No | `1:43579261181:web:...` | All | Firebase app ID (hardcoded in `src/firebase/index.ts`) | Not consumed from env | Firebase auth | Value is hardcoded; env var not used by current implementation | No |
| `REACT_APP_FIREBASE_VAPID_KEY` | No | — | All | VAPID public key for Web Push (backend only) | Not consumed from frontend | Push notifications | Used only by backend; frontend does not read this value | No |

## CI / GitHub Actions Variables

| Variable | Type | Description |
|---|---|---|
| `E2E_API_BASE_URL` | GitHub Secret | Deployed backend URL for E2E tests against production |
| `E2E_DATABASE_URL` | GitHub Secret | Database URL for deployed E2E tests |
| `E2E_ADMIN_EMAIL` | GitHub Secret | Admin email for E2E test login |
| `E2E_ADMIN_PASSWORD` | GitHub Secret | Admin password for E2E test login |

## Notes

1. **Consistency requirement:** `TOKEN_PAYER_ROLE` / `REACT_APP_TOKEN_PAYER_ROLE`, `LISTING_FEE_AMOUNT` / `REACT_APP_LISTING_FEE_AMOUNT`, and `TENANT_PREMIUM_AMOUNT` / `REACT_APP_TENANT_PREMIUM_AMOUNT` must be identical between backend and frontend.
2. **Firebase config:** The current frontend implementation hardcodes `authDomain`, `projectId`, `messagingSenderId`, and `appId` in `src/firebase/index.ts`. Only `REACT_APP_FIREBASE_API_KEY` is injected via environment variable for the frontend build. Firebase Authorized Domains and OAuth providers are managed in the Firebase Console rather than via frontend env vars.
3. **S3 credentials:** If the EB EC2 instance profile (IAM role) has a policy granting S3 access, `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` can be omitted. The AWS SDK will use the instance role automatically. This is the recommended approach for EB deployments.
4. **Cloudflare proxy:** When Cloudflare proxies requests to the EB backend, the real client IP is forwarded in the `CF-Connecting-IP` header. Express is configured with `app.set('trust proxy', 1)` which trusts the first proxy — this works correctly with Cloudflare. Rate limiting will apply to the real client IP.
