---
title: Landlord Guide
description: Property owner guide for listing and managing rentals on the Town Ruins platform.
tags:
  - landlord-guide
  - landlords
  - property-owners
  - listings
aliases:
  - Landlord Guide
  - Property Owner Guide
---

# Landlord Guide

## Last Verified

Last Verified: 2026-07-15

Branch context: awsfullmig

## Related Documents

- [docs/business/TOKEN_ECONOMY.md](../business/TOKEN_ECONOMY.md)
- [docs/admin/ADMIN_GUIDE.md](../admin/ADMIN_GUIDE.md)
- [docs/moderation/MODERATOR_GUIDE.md](../moderation/MODERATOR_GUIDE.md)

## Prerequisites

- Review [real-app-frontend-main/src/views/Dashboard/Landlord.tsx](../../real-app-frontend-main/src/views/Dashboard/Landlord.tsx)
- Review [real-app-frontend-main/src/views/Dashboard/provider](../../real-app-frontend-main/src/views/Dashboard/provider)

## Derived Documents

- [docs/business/TEMPORARY_STAY.md](../business/TEMPORARY_STAY.md)

## Current Flow

1. Sign up as a landlord and complete the onboarding prompts.
2. Use the dashboard to create or manage listings.
3. Complete verification when prompted by the platform.
4. Publish listings and respond to tenant engagement requests.

## Token Economy Note

The token-economy invariant remains the same as in [docs/business/TOKEN_ECONOMY.md](../business/TOKEN_ECONOMY.md): money purchases TR Tokens, and temporary stay bookings are the one real-payment exception.

## Planned / Unverified

- Any workflow not currently visible in the dashboard components is **Planned**.

**Notification bell:** The bell icon in the header shows your unread count. Click it to see recent notifications.

**Full history:** Go to `/notifications` to see all notifications and mark them as read.

## Wallet Management

Your wallet is in the sidebar of your dashboard.

**What you can see:**

- Your current **TR Token balance**
- A **Buy Tokens** button
- A **Transactions** list

**Transaction types you'll see:**

| Reason | Direction | When |
| --- | --- | --- |
| Welcome Bonus | +100 TR | When you first verify your email |
| Listing Renewal | −N TR | When you restore an expired listing |
| Token Purchase | +50/100/300 TR | When you buy tokens |

<user_quoted_section>Token purchase is currently in demo mode. No real payment is processed. Real payment integration is coming in a future release.</user_quoted_section>

## Payment History

The **Payment History** table on your dashboard shows any payments you've made on the platform (e.g. listing fees if applicable). Each row shows:

- Date
- Listing name
- Amount (USD)
- Status (Pending / Success / Failed)

## Best Practices

**Write a compelling description:**

- Be specific about what's included (furniture, appliances, utilities)
- Mention nearby landmarks, schools, or transport links
- State any rules (no pets, no smoking, etc.)

**Use high-quality photos:**

- Upload at least 3–5 photos
- Include the exterior, living areas, bedrooms, and kitchen
- Good lighting makes a big difference

**Keep your listing accurate:**

- Update the rent if it changes
- Remove amenities that are no longer available
- Respond to tenant requests promptly

**Renew before expiry:**

- Watch for the 24h and 6h expiry warnings
- Restore your listing before it expires to maintain visibility
- Keep enough TR Tokens in your wallet

**Respond quickly:**

- Tenants are more likely to choose landlords who respond within 24 hours
- Even a decline is better than leaving a request unanswered

## Common Mistakes

| Mistake | How to avoid |
| --- | --- |
| Listing expires without renewal | Watch for expiry notifications; keep TR Tokens in your wallet |
| Inaccurate contact details | Double-check your phone number before approving requests |
| Missing photos | Always upload at least one photo — listings with images get more views |
| Vague description | Be specific about what's included and any restrictions |
| Ignoring tenant requests | Check your dashboard daily; unanswered requests reflect poorly |
| Creating a second listing | You can only have one active listing. Delete or let the first expire before creating another |

## Tips for Increasing Visibility

1. **Add your province and city** — listings without location data don't appear in location-based searches
2. **Mark student accommodation** — this appears in the dedicated student filter
3. **List all amenities** — tenants filter by solar, borehole, parking, internet, etc.
4. **Upload photos** — listings with images appear more trustworthy
5. **Keep your listing active** — expired listings are invisible to tenants; renew promptly
6. **Write a detailed description** — keyword-rich descriptions appear in text searches

<user_quoted_section>Coming soon: Featured listing placement and premium visibility boosts will allow landlords to appear at the top of search results. These features are planned for a future release.</user_quoted_section>

## Future Landlord Features

<user_quoted_section>The following features are planned but not yet available in v1.1.</user_quoted_section>

| Feature | Status | Description |
| --- | --- | --- |
| **ID Verification UI** | Coming soon | The backend is ready; the UI will be surfaced in a future update |
| **Featured Listings** | Planned | Pay to appear at the top of search results |
| **Premium Visibility Boosts** | Planned | Time-limited promotion of your listing |
| **Multiple Listings** | Planned | Currently limited to one active listing per landlord |
| **Landlord Analytics** | Planned | Revenue and engagement statistics for your listings |
| **In-Platform Messaging** | Planned | Direct chat with tenants without revealing contact details upfront |
| **Map-Based Search** | Planned | Tenants will be able to find listings on a map |

## Frequently Asked Questions

**Q: Can I have more than one listing?**
A: Not currently. You can have one active listing at a time. Delete your current listing or let it expire before creating a new one.

**Q: What happens when my listing expires?**
A: It becomes invisible to tenants. You can restore it at any time using TR Tokens (1 TR per day, up to 30 days).

**Q: Do I pay tokens when I approve a tenant?**
A: No. The 5 TR fee is deducted from the **tenant's** wallet, not yours.

**Q: Can I edit my listing after publishing?**
A: Yes, while your listing is active. Go to your dashboard and click the edit (pencil) icon.

**Q: What if a tenant's request is spam?**
A: Simply decline the request. You can also report the user using the Report function.

**Q: How do I delete my listing?**
A: Click the trash icon next to your listing in the dashboard table. This is permanent.

**Q: What is the listing fee?**
A: The listing fee (if applicable) is shown when you initiate a payment from the listing payment page. Contact support for current pricing.

**Q: How long does admin verification take?**
A: Identity verification is reviewed within 24–48 hours of submission.

## Troubleshooting

| Problem | Solution |
| --- | --- |
| Can't create a second listing | You already have an active listing. Delete or let it expire first |
| Listing not appearing in search | Check the listing status — it may be expired or inactive |
| Tenant request not showing | Refresh your dashboard; check the Incoming Engagement Requests section |
| Restore button not working | Ensure you have enough TR Tokens; check your wallet balance |
| Verification email not received | Check spam folder; request resend from the login page |
| Draft not saving | Ensure you have a stable internet connection; the draft saves automatically |
| Payment failed | Check your payment details; try the retry option from Payment History |

## Glossary

| Term | Definition |
| --- | --- |
| **TR Token** | Town Ruins' in-app currency; used to restore listings |
| **Engagement** | A contact request from a tenant about your listing |
| **Listing** | Your rental property posted on Town Ruins |
| **Active** | Listing is live and visible to tenants |
| **Expired** | Listing is no longer visible; can be restored with TR Tokens |
| **Pending Payment** | Listing is awaiting payment confirmation to activate |
| **Early Access** | Listing visible only to premium tenants |
| **Inactive** | Listing deactivated by admin |
| **Restore** | Reactivating an expired listing using TR Tokens |
| **Wallet** | Your TR Token balance and transaction history |
| **Verification** | Confirming your identity with ID documents |
| **Draft** | An auto-saved, incomplete listing that hasn't been published yet |

*Town Ruins v1.1 · Landlord Guide · townruins.com*