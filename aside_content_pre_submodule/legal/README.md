---
title: Legal Documentation Index
description: Legal documentation index for the Town Ruins platform, including terms of use, privacy policy, refund policy, and landlord agreements.
tags:
  - legal
  - terms
  - privacy
  - agreements
aliases:
  - Legal Docs
  - Terms
---

# Legal Documentation Index

This folder is the documentation index for legal materials that are referenced by the frontend legal views and the repository-level docs.

## Canonical legal sources

- [terms&all/Host & Landlord Agreement.docx](../../terms&all/Host%20&%20Landlord%20Agreement.docx) — canonical source for the landlord/host agreement.
- [terms&all/Privacy Policy.docx](../../terms&all/Privacy%20Policy.docx) — canonical source for the privacy policy.
- [terms&all/Refund and Cancellation +more.docx](../../terms&all/Refund%20and%20Cancellation%20+more.docx) — canonical source for refund and cancellation policy content.
- [terms&all/Tenant & Guest Agreement.docx](../../terms&all/Tenant%20&%20Guest%20Agreement.docx) — canonical source for the terms of use and guest agreement.
- [terms&all/verify.md](../../terms&all/verify.md) — verification notes and constraints for the legal package.

## Frontend legal views

The current frontend legal pages are implemented in [real-app-frontend-main/src/views/Legal](../../real-app-frontend-main/src/views/Legal/):

- [real-app-frontend-main/src/views/Legal/TermsOfUse.tsx](../../real-app-frontend-main/src/views/Legal/TermsOfUse.tsx)
- [real-app-frontend-main/src/views/Legal/PrivacyPolicy.tsx](../../real-app-frontend-main/src/views/Legal/PrivacyPolicy.tsx)
- [real-app-frontend-main/src/views/Legal/RefundPolicy.tsx](../../real-app-frontend-main/src/views/Legal/RefundPolicy.tsx)
- [real-app-frontend-main/src/views/Legal/LandlordTerms.tsx](../../real-app-frontend-main/src/views/Legal/LandlordTerms.tsx)
- [real-app-frontend-main/src/views/Legal/TrustSafety.tsx](../../real-app-frontend-main/src/views/Legal/TrustSafety.tsx)
- [real-app-frontend-main/src/views/Legal/CommunityGuidelines.tsx](../../real-app-frontend-main/src/views/Legal/CommunityGuidelines.tsx)

## Verification note

The legal copy in the frontend views is derived from the repository’s legal-doc API and fallback text. The DOCX artifacts in [terms&all](../../terms&all/) remain the canonical source artifacts and are not converted to markdown in this initiative. Any content that cannot be verified from the repository is marked as Planned or Unverified in the handover pack.
