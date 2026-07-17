---
title: End User Guide
description: End user guide for all platform users including tenants, landlords, and guests on the Town Ruins platform.
tags:
  - end-user-guide
  - tenants
  - landlords
  - guests
aliases:
  - User Guide
  - End User
---

# End User Guide

## Last Verified

Last Verified: 2026-07-15

Branch context: awsfullmig

## Related Documents

- [docs/business/TOKEN_ECONOMY.md](../business/TOKEN_ECONOMY.md)
- [docs/business/TEMPORARY_STAY.md](../business/TEMPORARY_STAY.md)
- [docs/guides/LANDLORD_GUIDE.md](LANDLORD_GUIDE.md)

## Prerequisites

- Review [real-app-frontend-main/src/views/Dashboard/Tenant.tsx](../../real-app-frontend-main/src/views/Dashboard/Tenant.tsx)
- Review [real-app-frontend-main/src/views/Stays](../../real-app-frontend-main/src/views/Stays)

## Derived Documents

- [docs/admin/ADMIN_GUIDE.md](../admin/ADMIN_GUIDE.md)

## Current Flow

1. Register and verify your account.
2. Browse listings or temporary stays.
3. Use the platform to contact landlords or complete booking steps.
4. Review notifications and wallet activity.

## Token Economy Note

The token-economy invariant remains the same as in [docs/business/TOKEN_ECONOMY.md](../business/TOKEN_ECONOMY.md): money purchases TR Tokens, while temporary stay bookings are the real-payment exception.

## Planned / Unverified

- Any tenant workflow not visible in the current tenant dashboard or stay views is **Planned**.

**How tokens are spent:**

- **5 TR** when a landlord approves your contact request
- **1 TR per day** when a landlord restores an expired listing (landlord pays this, not you)

**Token purchase tiers** *(demo mode — real payment coming soon)*:

| Price | Tokens |
| --- | --- |
| $5 | 50 TR |
| $10 | 100 TR |
| $25 | 300 TR |

<user_quoted_section>⚠️ Note: Token purchases are currently in demo mode. No real payment is processed. This will be updated in a future release.</user_quoted_section>

**Low balance warning:** When your balance drops below 20 TR, you'll see a warning notification.

## Your Wallet

Your wallet is visible in the sidebar of your dashboard.

**What you can see:**

- Your current **TR Token balance** (large gold number)
- A **Buy Tokens** button
- A **Transactions** list showing your token history

**Transaction history shows:**

- What the transaction was for (e.g. "Welcome Bonus", "Engagement Fee")
- Whether it was a credit (+) or debit (−)
- The date and time
- Your balance after the transaction

**To buy tokens:**

1. Click **Buy Tokens** in your wallet card
2. Select a package ($5, $10, or $25)
3. Click **Pay (Demo)** — tokens are added instantly in demo mode

<user_quoted_section>Tip: Click the ? icon next to "TR TOKEN BALANCE" for a guided explainer on how tokens work.</user_quoted_section>

## Notifications

Town Ruins keeps you informed through multiple channels:

| Channel | When it's used |
| --- | --- |
| **In-app** | Always — shown in the notification bell and notification page |
| **Email** | For important events (booking confirmations, engagement updates, listing expiry) |
| **Push (PWA)** | If you've installed the app and enabled push notifications |

**Notification bell:** The bell icon in the header shows a badge with your unread count. Click it to see recent notifications.

**Full notification history:** Go to `/notifications` to see all your notifications. You can mark individual ones as read, or mark all as read at once.

**What triggers notifications:**

- A landlord approves or declines your contact request
- Your listing is expiring (24h and 6h warnings)
- Your listing has expired
- A booking is confirmed, cancelled, or updated
- A dispute is resolved

## Updating Your Profile

Go to `/profile` to update your account details.

**You can change:**

- Username
- Email address
- Profile avatar (image URL)
- Password (leave blank to keep your current password)

Click **Save** to apply changes.

<user_quoted_section>Note: Changing your email address does not require re-verification in the current version.</user_quoted_section>

## Dark Mode & Display Settings

Town Ruins supports both **light mode** and **dark mode**.

To toggle: Click the **sun/moon icon** in the top-right corner of the header.

Your preference is saved automatically and will be remembered next time you visit.

## Password Reset

If you've forgotten your password:

1. Go to `/forgot-password` or click **Forgot password?** on the login page
2. Enter your email address and click **Send Reset Link**
3. Check your email for a message from Town Ruins
4. Click the **Reset Password** link in the email (valid for **1 hour**)
5. Enter your new password and confirm it
6. You'll be redirected to log in with your new password

<user_quoted_section>Security note: For your protection, the platform always shows a success message on the forgot password page — even if the email address isn't registered. This prevents others from finding out whether an email is registered.</user_quoted_section>

## Security Tips

- **Use a strong, unique password** — at least 8 characters, mixing letters, numbers, and symbols
- **Never share your password** with anyone, including Town Ruins staff
- **Verify your email** — unverified accounts cannot log in
- **Log out on shared devices** — use the Logout option in the avatar menu
- **Be cautious of phishing** — Town Ruins will never ask for your password by email
- **Report suspicious listings** — use the Report button on any listing if something seems wrong
- **Check your token balance** — if tokens disappear unexpectedly, check your transaction history

## Frequently Asked Questions

**Q: I signed up but can't log in. What's wrong?**
A: You need to verify your email first. Check your inbox (and spam folder) for a verification email from Town Ruins. If you can't find it, use the "Resend verification email" option.

**Q: I didn't receive a verification email.**
A: Check your spam/junk folder. If it's not there, wait a few minutes and try again. You can request a new verification email from the login page.

**Q: Why can't I see the landlord's address and phone number?**
A: For privacy and safety, contact details are only revealed after the landlord approves your request. Send a contact request from the listing page.

**Q: How many TR Tokens do I need to contact a landlord?**
A: Contacting a landlord is free. You only spend **5 TR Tokens** when the landlord *approves* your request. If they decline, no tokens are deducted.

**Q: What happens if I run out of TR Tokens?**
A: You can still browse listings and send contact requests. Tokens are only deducted when a landlord approves your request. If you don't have enough tokens at that point, the approval will fail and you'll need to top up first.

**Q: Can I change my account type from Tenant to Landlord?**
A: Not currently. Account types are set at signup. Contact support if you need assistance.

**Q: Is my payment information stored on Town Ruins?**
A: Town Ruins uses third-party payment providers (Paynow/EcoCash or Stripe). Your payment details are handled by those providers, not stored on Town Ruins servers.

**Q: How do I cancel a temporary stay booking?**
A: Go to **My Bookings** (`/stays/bookings`), open the booking, and click **Cancel**. The refund amount depends on the accommodation's cancellation policy.

**Q: What is Premium Membership?**
A: Premium Membership ($10/month) gives tenants early access to new listings before they're visible to everyone. You can upgrade from your dashboard.

**Q: Can I save a search and get alerts?**
A: Yes! After searching, you can save your search criteria. When a new listing matches your saved search, you'll receive an email alert.

## Troubleshooting

| Problem | Solution |
| --- | --- |
| Can't log in | Check email is verified; check password; try password reset |
| Verification email not received | Check spam folder; request resend from login page |
| Listing not showing in search | Listing may be expired or inactive; contact the landlord |
| Contact request not working | Ensure you're logged in as a Tenant; check you haven't already sent a request |
| Tokens not appearing after purchase | Token purchase is currently demo mode — tokens are added locally; refresh the page |
| Booking not confirmed | Check payment status in My Bookings; contact support if payment was taken |
| Notifications not arriving | Check your notification preferences in your profile; check spam folder for emails |
| Page not loading | Check your internet connection; try refreshing; clear browser cache |
| Dark mode not saving | Ensure cookies/localStorage are not blocked in your browser |

## Glossary

| Term | Definition |
| --- | --- |
| **TR Token** | Town Ruins' in-app currency used to unlock landlord contact details |
| **Engagement** | A contact request sent by a tenant to a landlord about a specific listing |
| **Listing** | A long-term rental property posted by a landlord |
| **Temporary Stay** | A short-term room booking at a hotel, lodge, BnB, or similar accommodation |
| **Provider** | A business or individual who manages an accommodation for short-term stays |
| **Landlord** | A property owner who lists long-term rentals on Town Ruins |
| **Tenant** | A user who searches for and contacts landlords about rental properties |
| **Premium Membership** | A paid 30-day subscription that gives tenants early access to new listings |
| **Early Access** | A listing status visible only to premium tenants before general release |
| **Wallet** | Your TR Token balance and transaction history |
| **Booking Mode** | Either Instant (auto-confirmed) or Request (provider must approve) |
| **Cancellation Policy** | The rules governing refunds when a booking is cancelled |
| **Saved Search** | A set of search criteria saved so you receive email alerts for matching new listings |
| **Verification** | Confirming your email address (required) or identity documents (landlords) |

*Town Ruins v1.1 · Zimbabwe's Premier Property Platform · townruins.com*