# POST_DEPLOYMENT_CHECKLIST.md — Post-Deployment Verification

> **Version:** 1.1
> **Purpose:** Everything that must be verified after every deployment
> **Owner:** DevOps / QA
> **Target time:** 30–60 minutes
> **Cross-reference:** `SMOKE_TEST_PLAN.md`, `TROUBLESHOOTING.md`

## Verification Legend

- ✅ Pass — proceed
- ❌ Fail — stop and consult `TROUBLESHOOTING.md`
- ⏭️ Skip — not applicable to this deployment

## 1. Application Starts

- [ ] Elastic Beanstalk deployment completed without errors (check EB Console → Events)
- [ ] EB environment health is **Green**
- [ ] Amplify frontend build completed without errors (check Amplify Console build logs)
- [ ] `GET https://api.townruins.com/` returns `{"status":"ok","message":"Town Ruins API is running."}`
- [ ] `GET https://api.townruins.com/api/v1` returns `{"status":"ok","message":"Town Ruins API v1 is running."}`
- [ ] No `UNCAUGHT EXCEPTION` or `UNHANDLED REJECTION` in EB backend logs at startup
- [ ] Backend log shows `Connected to Aurora PostgreSQL` (or `Connected to PostgreSQL`)
- [ ] EB deployment events show `.ebextensions` hook ran successfully (`01_prisma_migrate`)
- [ ] Backend log shows all four cron jobs scheduled:
  - `[reconciliation] Scheduled payment reconciliation`
  - `[notification] Scheduled worker`
  - `[notification] Scheduled reminder scanner`
  - `[listing-expiry] Scheduled expiry scanner`

## 2. Authentication

- [ ] Registration flow completes (new user can sign up)
- [ ] Email verification email is received
- [ ] Login with email/password succeeds
- [ ] JWT token is returned and stored correctly
- [ ] Protected routes reject unauthenticated requests (401)
- [ ] Password reset email is received and link works
- [ ] Logout clears session

## 3. Google OAuth (Firebase)

- [ ] "Sign in with Google" button is visible on login page
- [ ] Google OAuth popup opens correctly
- [ ] Successful Google login creates/logs in user
- [ ] Firebase Authorized Domains in the Firebase Console include the production domains used by the app (for example, `townruins.com`, `www.townruins.com`, and `app.townruins.com`)
- [ ] No Firebase console errors in browser DevTools

## 4. Email Verification

- [ ] Verification email is sent on registration
- [ ] Verification link in email is correct (uses `APP_BASE_URL`, not `localhost`)
- [ ] Clicking verification link marks email as verified
- [ ] Resend verification works

## 5. Listings

- [ ] Home feed loads listings
- [ ] Search by location returns results
- [ ] Listing detail page loads with images
- [ ] Landlord can create a new listing (if token-based listing activation is required, the wallet must have sufficient TR Tokens)
- [ ] Listing images upload successfully to S3
- [ ] Listing draft save/restore works
- [ ] Listing expiry notifications are sent (check notification queue)

## 6. Temporary Stay (Accommodation / Rooms)

- [ ] Accommodation search returns results
- [ ] Room detail page loads with pricing
- [ ] Booking calendar shows availability correctly
- [ ] Instant booking flow completes
- [ ] Request booking flow completes (provider receives notification)
- [ ] Price breakdown is correct (base price + fees + tax + discount)
- [ ] Coupon/promotion code applies correctly

## 7. Dashboard

- [ ] Tenant dashboard loads
- [ ] Landlord dashboard loads
- [ ] Provider dashboard loads (bookings, rooms, pricing tabs)
- [ ] Admin dashboard loads
- [ ] Onboarding checklist displays correctly for new users

## 8. Wallet & TR Tokens

- [ ] Wallet balance displays correctly
- [ ] Token purchase flow initiates payment
- [ ] Token balance updates after successful payment
- [ ] Listing renewal using TR tokens works (1 TR = 1 day extension)
- [ ] Wallet transaction history displays

## 9. Notifications

- [ ] In-app notifications appear in the notification bell
- [ ] Notification bell badge count is correct
- [ ] Email notification is received for a booking event
- [ ] Push notification permission prompt appears (PWA)
- [ ] Push notification is received after subscribing
- [ ] Notification preferences can be updated

## 10. Profile

- [ ] Profile page loads with correct user data
- [ ] Avatar upload works (S3)
- [ ] Profile fields can be updated
- [ ] Phone number verification flow works (if enabled)
- [ ] ID verification upload works (S3)

## 11. Search & Filtering

- [ ] Search by province/city returns correct results
- [ ] Price range filter works
- [ ] Room type filter works
- [ ] Amenity filter works
- [ ] Date availability filter works
- [ ] Saved search can be created
- [ ] Saved search notification is sent when matching listings appear

## 12. Dark Mode

- [ ] Dark mode toggle works
- [ ] Theme persists across page refreshes
- [ ] All pages render correctly in dark mode (no invisible text)

## 13. Responsive Layout

- [ ] Home page renders correctly on mobile (375px)
- [ ] Listing detail renders correctly on mobile
- [ ] Dashboard renders correctly on mobile
- [ ] Navigation menu works on mobile

## 14. PWA

- [ ] Service worker is registered (check DevTools → Application → Service Workers)
- [ ] App is installable (install prompt appears on supported browsers)
- [ ] `manifest.json` is served correctly
- [ ] App icons load correctly (192px, 512px)
- [ ] Push notifications work after PWA install

## 15. API

- [ ] All API routes return correct status codes
- [ ] Rate limiting is active (verify 429 after exceeding limits)
- [ ] CORS headers are correct for the production frontend origin (`https://townruins.com`)
- [ ] Cloudflare is not caching API responses (check `CF-Cache-Status: BYPASS` or `DYNAMIC` header)
- [ ] Webhook endpoint `https://api.townruins.com/webhooks/<provider>` is reachable from the payment provider

## 16. Database

- [ ] `npx prisma migrate status` shows no pending migrations
- [ ] No database connection errors in backend logs
- [ ] Seed data is present (amenities, legal documents, admin user)

## 17. Logs

- [ ] No `ERROR` level logs at startup (check EB logs: EB Console → Logs → Request Logs)
- [ ] No uncaught exceptions in the first 5 minutes of operation
- [ ] Cron job logs are appearing at expected intervals
- [ ] **DECISION NEEDED — Infrastructure Owner:** Confirm log aggregation (CloudWatch / log streaming) is working. Required for centralized log management and troubleshooting. Document the log group names, retention policies, and access credentials in `OPERATIONS_RUNBOOK.md` Section 16 (Monitoring).

## 18. Health Endpoints

| Endpoint | Expected | Actual | Status |
|---|---|---|---|
| `GET /` | `{"status":"ok"}` | | |
| `GET /api/v1` | `{"status":"ok"}` | | |

## 19. SEO

- [ ] `robots.txt` is accessible at `/robots.txt`
- [ ] Page titles are correct on key pages
- [ ] Open Graph tags present on listing pages

## 20. Performance

- [ ] Home page loads in < 3 seconds on a standard connection
- [ ] Listing search returns results in < 2 seconds
- [ ] No console errors in browser DevTools on any key page

## 21. Browser Compatibility

| Browser | Version | Login | Listings | Booking | PWA | Status |
|---|---|---|---|---|---|---|
| Chrome | Latest | | | | | |
| Firefox | Latest | | | | | |
| Safari | Latest | | | | | |
| Edge | Latest | | | | | |
| Chrome Android | Latest | | | | | |
| Safari iOS | Latest | | | | | |

## Sign-Off

| Role | Name | Date | Signature |
|---|---|---|---|
| DevOps | | | |
| QA | | | |
| Product Owner | | | |
