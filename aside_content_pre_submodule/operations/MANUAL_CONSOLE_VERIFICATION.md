---
title: Manual Console Verification
description: Manual console verification items for the Town Ruins platform, requiring live confirmation in AWS, Cloudflare, Firebase, or other consoles.
tags:
  - verification
  - console
  - aws
  - cloudflare
aliases:
  - Console Verification
  - Manual Verification
---

# Manual Console Verification

Items in this file still need live confirmation in AWS, Cloudflare, Firebase, or another console.

## Infrastructure

- [x] EB environment is healthy and running the intended Node.js version
- [x] Cloudflare DNS zone for `townruins.com` is active
- [x] `api.townruins.com` CNAME points to the EB load balancer DNS name
- [x] `townruins.com` and `app.townruins.com` point to the frontend domain
- [x] Cloudflare SSL/TLS mode is `Full (Strict)`
- [x] EB EC2 instance profile has S3 permissions
- [x] VPC and PostgreSQL networking are confirmed
- [x] EB load balancer has an ACM certificate for `api.townruins.com`

## Database

- [x] Prisma migration status is clean in production
- [x] Migration hook ran successfully during the last deployment
- [x] Database pool limits are appropriate
- [x] Migration lock provider matches PostgreSQL
- [x] Backups are enabled and tested

## Backend Environment

- [x] `SKIP_EMAIL_VERIFICATION` is `false` in production
- [ ] `SKIP_PHONE_VERIFICATION` is `false` or omitted
- [x] `SEED_API_KEY` is a strong random value
- [x] `APP_BASE_URL` points to `https://api.townruins.com`
- [x] `FRONTEND_URL` points to the Cloudflare frontend URL
- [x] `CORS_ALLOWED_ORIGINS` is correct for production

## Payments

- [x] Paynow credentials are set and webhook URL is registered
- [ ] Webhook endpoint is publicly reachable
- [ ] Test payment flow has been exercised end-to-end

## Frontend / Firebase

- [x] Amplify app is connected to the correct repo and branch
- [x] Frontend environment variables are set in Amplify
- [x] Firebase project is active
- [x] Firebase Google OAuth is enabled
- [x] Firebase authorized domains include production domains

## Storage / Email / Notifications

- [x] S3 public asset URL is publicly reachable
- [x] Gmail app password is valid and a test email has been sent
- [ ] VAPID keys and subject are set and tested
- [ ] Cron expressions are validated in production

## Security / Monitoring / Docs

- [ ] Cloudflare Always Use HTTPS is enabled
- [ ] Cloudflare HSTS is enabled
- [ ] Monitoring and alerting are configured
- [ ] Security headers have been reviewed
- [x] Production docs are up to date
