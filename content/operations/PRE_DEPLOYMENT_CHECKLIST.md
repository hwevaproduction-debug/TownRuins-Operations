# PRE_DEPLOYMENT_CHECKLIST.md — Production Readiness Checklist

> **Version:** 1.1
> **Purpose:** Complete checklist to verify production readiness before every deployment
> **Owner:** DevOps / Infrastructure Owner
> **Cross-reference:** `DEPLOYMENT.md`, `ENVIRONMENT_VARIABLES.md`

## How to Use

Work through each section top-to-bottom. Every item must be checked before proceeding to deployment. Items marked **🔴 BLOCKING** must be resolved before go-live. Items marked **🟡 RECOMMENDED** are strongly advised but non-blocking for a staged rollout.

**Configured**

* The item has been configured but has not yet been tested.

**Verified**

* The configuration has been validated and confirmed working.

Launch-blocking items (🔴) require both **Configured** and **Verified** columns to be completed before release.

## 1. Infrastructure

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| PostgreSQL instance is running and reachable from the Elastic Beanstalk environment | 🔴 | x | x |
| `DATABASE_URL` connection string is valid and tested | 🔴 | x | x |
| AWS S3 bucket exists and has correct permissions for presigned PUT uploads | 🔴 | x | x |
| S3 CORS has been configured (`npm run s3:cors` executed successfully) | 🔴 | x | x |
| **Elastic Beanstalk** environment is created, healthy, and running Node.js 20 | 🔴 | x | x |
| Amplify **frontend** app exists and is connected to the correct GitHub branch | 🔴 | x | x |
| Cloudflare DNS zone for `townruins.com` is active | 🔴 | x | x |
| `api.townruins.com` CNAME points to the EB load balancer DNS name in Cloudflare | 🔴 | | |
| `townruins.com` / `app.townruins.com` CNAME points to the Amplify frontend domain in Cloudflare | 🔴 | | |
| Cloudflare SSL/TLS mode is set to **Full (Strict)** | 🔴 | | |
| EB EC2 instance profile (IAM role) has `s3:PutObject` / `s3:GetObject` permissions on the S3 bucket | 🟡 | | |
| **DECISION NEEDED — Infrastructure Owner:** Confirm VPC/networking configuration between EB and PostgreSQL. Required for database connectivity from EB instances. Verify subnet placement, security groups, and VPC peering if applicable. | 🟡 | | |
| **DECISION NEEDED — Infrastructure Owner:** Confirm EB load balancer has an ACM certificate for `api.townruins.com`. The load balancer must present a valid certificate for the Cloudflare-proxied domain. | 🟡 | | |

## 2. Database

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| All Prisma migrations have been applied (`npx prisma migrate status` shows no pending migrations) | 🔴 | x | x |
| The `.ebextensions/01_prisma_migrate.config` hook ran successfully during the last EB deployment (check EB deployment events) | 🔴 | | |
| Database connection pool limits are appropriate for expected load | 🔴 | | |
| `migration_lock.toml` provider matches the database (`postgresql`) | 🔴 | | |
| Database backups are enabled and tested | 🟡 | | |
| **DECISION NEEDED — Infrastructure Owner:** Confirm backup schedule and retention policy. Required for disaster recovery. Specify daily/weekly backup frequency, retention period (e.g., 7 days, 30 days), and verification process. | 🟡 | | |
| Seed data has been applied if required (`npm run seed:db`, `npm run seed:amenities`, `npm run seed:legal`) | 🟡 | | |
| Super admin account created (`npm run seed:super-admin`) | 🟡 | | |

## 3. Environment Variables — Backend (set in EB Console → Configuration → Software → Environment Properties)

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| `DATABASE_URL` — set and valid | 🔴 | x | x |
| `JWT_SECRET` — set to a strong random value (min 32 chars) | 🔴 | x | x |
| `JWT_EXPIRES_IN` — set (e.g. `30d`) | 🔴 | x | x |
| `NODE_ENV` — set to `production` | 🔴 | x | x |
| `PORT` — set (default `5000`) | 🔴 | x | x |
| `FRONTEND_URL` — set to the Cloudflare-proxied frontend URL (e.g., `https://townruins.com`) | 🔴 | | |
| `APP_BASE_URL` — set to the Cloudflare-proxied backend URL (e.g., `https://api.townruins.com`) | 🔴 | x | x |
| `CORS_ALLOWED_ORIGINS` — set if additional origins needed | 🔴 | x | x |
| `TOKEN_PAYER_ROLE` — set to `LANDLORD` or `TENANT` | 🔴 | | |
| `PAYMENT_PROVIDER` — set to `paynow`, `stripe`, or `mock` | 🔴 | paynow | x |
| `LISTING_FEE_AMOUNT` — set (default `5`) | 🔴 | | |
| `TENANT_PREMIUM_AMOUNT` — set (default `10`) | 🔴 | | |
| `S3_BUCKET` — set | 🔴 | x | x |
| `S3_REGION` — set | 🔴 | x | x |
| `S3_PUBLIC_BASE_URL` — set | 🔴 | x | x |
| `GMAIL_USER` — set | 🔴 | x | x |
| `GMAIL_APP_PASSWORD` — set | 🔴 | x | x |
| `EMAIL_FROM` — set | 🔴 | x | x |
| `SKIP_EMAIL_VERIFICATION` — must be `false` in production | 🟡 | | |
| `SKIP_PHONE_VERIFICATION` — must be `false` in production (or omitted) | 🟡 | | |
| `SKIP_PRISMA_GENERATE_ON_START` — omit or set `false` (EB runs `postinstall` → `prisma generate` automatically) | 🟡 | | |

## 4. Environment Variables — Payments (EB Console)

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| If `PAYMENT_PROVIDER=paynow`: `PAYNOW_INTEGRATION_ID`, `PAYNOW_INTEGRATION_KEY`, `PAYNOW_RESULT_URL`, `PAYNOW_RETURN_URL` all set | 🔴 | x | x |
| If `PAYMENT_PROVIDER=stripe`: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` both set | 🔴 | x | x |
| Payment webhook URL registered with the payment provider (must be `https://api.townruins.com/webhooks/<provider>`) | 🔴 | | |
| Webhook endpoint tested with a test event | 🔴 | | |

## 5. Environment Variables — Frontend (set in Amplify Console → Environment Variables)

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| `REACT_APP_API_URL` — set to `https://api.townruins.com/api/v1` | 🔴 | x | x |
| `REACT_APP_BACKEND_URL` — set to `https://api.townruins.com` | 🔴 | x | x |
| `REACT_APP_FIREBASE_API_KEY` — set | 🔴 | x | x |
| `REACT_APP_TOKEN_PAYER_ROLE` — matches backend `TOKEN_PAYER_ROLE` | 🔴 | x | x |

> **Note:** Firebase Authorized Domains and OAuth providers are configured in the Firebase Console. The current frontend implementation does not read `REACT_APP_FIREBASE_AUTH_DOMAIN`, `REACT_APP_FIREBASE_PROJECT_ID`, `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`, `REACT_APP_FIREBASE_APP_ID`, or `REACT_APP_FIREBASE_VAPID_KEY` from environment variables. These are hardcoded in `src/firebase/index.ts`.

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| `REACT_APP_LISTING_FEE_AMOUNT` — matches backend `LISTING_FEE_AMOUNT` | 🔴 | | |
| `REACT_APP_TENANT_PREMIUM_AMOUNT` — matches backend `TENANT_PREMIUM_AMOUNT` | 🔴 | | |

> **DECISION NEEDED — Infrastructure Owner:** Should `real-app-frontend-main/src/firebase/index.ts` be migrated to a fully environment-driven Firebase configuration?

## 6. Firebase

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| Firebase project `smtp-a6e98` is active | 🔴 | x | x |
| Google OAuth provider is enabled in Firebase Authentication | 🔴 | x | x |
| Production domains (`townruins.com`, `www.townruins.com`, `app.townruins.com`) added to Firebase Authorized Domains | 🔴 | x | x |
| Amplify preview branch domains added to Firebase Authorized Domains (if needed) | 🔴 | x | x |

> **Note:** `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT` are used by the backend push notification system (`utils/channels/pushChannel.js`). Web Push requires VAPID keys to be set in EB environment variables.

## 7. AWS — Elastic Beanstalk (Backend)

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| EB application and environment created in the correct AWS region | 🔴 | x | x |
| EB platform is **Node.js 20 on Amazon Linux 2023** | 🔴 | x | x |
| All backend environment variables set in EB Console → Configuration → Software → Environment Properties | 🔴 | | |
| EB EC2 instance profile has S3 permissions (or `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` set) | 🔴 | | |
| `.ebextensions/01_prisma_migrate.config` is included in the deployment zip | 🔴 | | |
| EB enhanced health reporting enabled | 🟡 | | |
| EB access logs enabled and forwarded to S3 or CloudWatch | 🟡 | | |
| **DECISION NEEDED — Infrastructure Owner:** Confirm EB instance type and auto-scaling group min/max. Required for sizing the backend to handle expected traffic load. Affects cost and performance. Located in EB Console → Configuration → Capacity. | 🟡 | | |
| **DECISION NEEDED — Infrastructure Owner:** Confirm EB load balancer type (ALB recommended) and ACM certificate. The EB load balancer must have an ACM certificate attached for `api.townruins.com` to serve HTTPS. Located in EB Console → Configuration → Load Balancer. | 🟡 | | |

## 7b. AWS — Amplify (Frontend)

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| Amplify frontend app: App root directory set to `real-app-frontend-main` | 🔴 | x | x |
| Amplify app connected to the correct GitHub repository and branch | 🔴 | x | x |
| All frontend environment variables set in Amplify Console | 🔴 | | |
| Custom domain added in Amplify Console → Domain Management | 🔴 | x | x |
| Amplify access logs enabled | 🟡 | | |

## 7c. Cloudflare DNS

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| `townruins.com` CNAME → Amplify frontend domain (proxied ✅) | 🔴 | | |
| `www.townruins.com` CNAME → Amplify frontend domain (proxied ✅) | 🔴 | | |
| `app.townruins.com` CNAME → Amplify frontend domain (proxied ✅) | 🔴 | | |
| `api.townruins.com` CNAME → EB load balancer DNS name (proxied ✅) | 🔴 | | |
| Cloudflare SSL/TLS mode set to **Full (Strict)** | 🔴 | | |
| Cloudflare **Always Use HTTPS** enabled | 🟡 | | |
| Cloudflare **HSTS** enabled | 🟡 | | |
| Cloudflare firewall rules reviewed (rate limiting, bot protection) | 🟡 | | |

> **CORS Configuration:** The backend `app.js` configures CORS to allow:
> - Default origins: `https://townruins.com`, `https://www.townruins.com`, `https://app.townruins.com`
> - Any `*.amplifyapp.com` subdomain (for preview branches)
> - Any `*.townruins.com` subdomain
> - `localhost` (any port) for development
> - `127.0.0.1` (any port) for development
> - Additional origins via `FRONTEND_URL` and `CORS_ALLOWED_ORIGINS` environment variables

## 8. Storage (S3)

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| S3 bucket exists in the correct region | 🔴 | x | x |
| Bucket policy allows presigned PUT from the EB EC2 instance profile role | 🔴 | x | x |
| `npm run s3:cors` executed successfully with production `FRONTEND_URL` | 🔴 | x | x |
| `S3_PUBLIC_BASE_URL` is publicly accessible (test by loading an uploaded image URL) | 🔴 | | |
| S3 versioning enabled | 🟡 | | |
| S3 lifecycle rules configured for old/orphaned uploads | 🟡 | | |

## 9. Email

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| Gmail account is active and App Password is valid | 🔴 | | |
| Test email sent successfully from the backend (`sendEmail` utility) | 🔴 | | |
| `EMAIL_FROM` is set to a recognisable sender address | 🔴 | | |
| Gmail sending limits reviewed (500/day for standard Gmail, higher for Workspace) | 🟡 | | |
| **DECISION NEEDED — Infrastructure Owner:** Consider migrating to a transactional email service (SendGrid, SES) for production scale. Evaluate: volume limits, deliverability, analytics, cost, and setup complexity. Required for high-volume email scenarios. | 🟡 | | |

## 10. Notifications

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` generated and set in EB env vars | 🔴 | | |
| `VAPID_SUBJECT` set to a valid `mailto:` or URL | 🔴 | | |
| Notification worker cron expression is valid (`NOTIFICATION_WORKER_CRON`, default `*/30 * * * * *`) | 🔴 | | |
| Reminder scanner cron expression is valid (`REMINDER_SCAN_CRON`, default `0 * * * *`) | 🔴 | | |
| Listing expiry scanner cron expression is valid (`EXPIRY_SCAN_CRON`, default `*/30 * * * *`) | 🔴 | | |
| If SMS enabled: `AT_API_KEY`, `AT_USERNAME`, `AT_SENDER_ID` set and tested | 🟡 | | |

## 11. Payments

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| `PAYMENT_PROVIDER` is not `mock` in production | 🔴 | | |
| Webhook endpoint `https://api.townruins.com/webhooks/<provider>` is publicly accessible (not behind auth) | 🔴 | | |
| `RECONCILIATION_INTERVAL_CRON` is valid (default `*/15 * * * *`) | 🔴 | | |
| `RECONCILIATION_STALE_MINUTES` is appropriate (default `15`) | 🔴 | | |
| `MAX_PAYMENT_RETRIES` is set (default `3`) | 🔴 | | |
| Test payment flow end-to-end in staging before production | 🟡 | | |

## 12. PWA

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| `manifest.json` has correct `name`, `short_name`, `theme_color` (`#B8975A`), `background_color` (`#F5F0EB`) | 🔴 | | |
| `logo192.png` and `logo512.png` exist in `public/` | 🔴 | | |
| `service-worker.js` is served from the root | 🔴 | | |
| HTTPS is enforced via Cloudflare (required for service worker registration) | 🔴 | | |
| PWA install prompt tested on Android Chrome and iOS Safari | 🟡 | | |

## 13. Security

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| `JWT_SECRET` is not a default or guessable value | 🔴 | | |
| `SKIP_EMAIL_VERIFICATION=false` in production | 🔴 | | |
| Rate limiting is active (global: 100 req/15min, payment: 10 req/15min) | 🔴 | | |
| `trust proxy` is set to `1` in Express (already in `app.js`) — required for correct IP detection behind Cloudflare | 🔴 | | |
| CORS is restricted to known origins only | 🔴 | | |
| `SEED_API_KEY` is set to a strong random value (prevents rate limit bypass in production) | 🔴 | | |
| Cloudflare **Always Use HTTPS** enabled (enforces HTTPS redirect at CDN level) | 🟡 | | |
| Cloudflare **HSTS** enabled | 🟡 | | |
| Security headers (CSP, X-Frame-Options) reviewed | 🟡 | | |
| **DECISION NEEDED — Infrastructure Owner:** Confirm Cloudflare WAF rules / firewall rules if applicable. Specify which rules are enabled (e.g., OWASP Managed Rules, custom rules), blocked countries, rate limits, and protection against OWASP Top 10 vulnerabilities. | 🟡 | | |

## 14. SEO

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| `public/robots.txt` reviewed and appropriate for production | 🟡 | | |
| `<meta>` tags and Open Graph tags present on key pages | 🟡 | | |
| Sitemap generated and submitted to Google Search Console | 🟡 | | |

## 15. Performance

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| React production build verified (no development warnings in console) | 🟡 | | |
| Image assets optimised | 🟡 | | |
| Amplify CDN caching headers reviewed for static assets | 🟡 | | |
| Cloudflare caching rules reviewed (ensure API responses are not cached by Cloudflare) | 🟡 | | |

## 16. Monitoring & Logging

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| **DECISION NEEDED — Infrastructure Owner:** Confirm monitoring service (CloudWatch, Datadog, etc.). Specify which monitoring platform is used, dashboard URLs, alert channels (Slack, email), and notification thresholds for critical metrics. | 🟡 | | |
| **DECISION NEEDED — Infrastructure Owner:** Confirm EB log streaming to CloudWatch is enabled. Required for centralized logging. Verify logs are being sent to the correct log group and retention policy is set. | 🟡 | | |
| **DECISION NEEDED — Infrastructure Owner:** Confirm log retention policy. Specify how long logs are retained (e.g., 30 days, 90 days) and whether there are archival policies for older logs. | 🟡 | | |
| **DECISION NEEDED — Infrastructure Owner:** Confirm alerting thresholds for error rates and latency. Define specific thresholds for 5xx error rate (e.g., 1%), p95 latency (e.g., 2s), and notification procedures when thresholds are breached. | 🟡 | | |
| Amplify access logs enabled (frontend) | 🟡 | | |
| EB access logs enabled (backend) | 🟡 | | |

## 17. Legal

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| Legal documents seeded to database (`npm run seed:legal`) | 🔴 | | |
| Terms of Use, Privacy Policy, Refund Policy, Community Guidelines accessible at `/legal/*` | 🔴 | | |
| Landlord Terms accessible | 🔴 | | |
| Consent acceptance flow tested (new user registration) | 🔴 | | |

## 18. Testing

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| All unit tests pass (`npm run test:unit`) | 🔴 | | |
| E2E tests pass against local environment (`npm run test:e2e`) | 🔴 | | |
| E2E tests pass against staging/deployed environment | 🟡 | | |
| GitHub Actions CI is green on the deployment branch | 🟡 | | |

## 19. Backups

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| **DECISION NEEDED — Infrastructure Owner:** Confirm database backup is enabled and last backup is recent. Specify backup type (automated snapshots, point-in-time recovery), frequency, and verification process. Document the exact procedure for restoring a backup, including RTO and RPO targets. | 🟡 | | |
| **DECISION NEEDED — Infrastructure Owner:** Confirm S3 versioning or backup policy. Specify whether S3 versioning is enabled, lifecycle rules for object expiration, and backup strategy for critical data in the bucket. | 🟡 | | |

## 20. Documentation

| Item | Blocking | Configured | Verified |
| ---- | -------- | ---------- | -------- |
| `DEPLOYMENT.md` is up to date | 🟡 | | |
| `ENVIRONMENT_VARIABLES.md` reflects all current variables | 🟡 | | |
| `ROLLBACK.md` has been reviewed by the team | 🟡 | | |