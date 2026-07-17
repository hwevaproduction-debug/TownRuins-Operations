---
title: API Reference
description: HTTP API reference for the Town Ruins backend, including authentication, listings, bookings, payments, and moderation endpoints.
tags:
  - api
  - rest
  - backend
  - endpoints
aliases:
  - API
  - REST API
---

<div class="tr-folder-hero">

# API Reference

<p>HTTP API surfaces, request/response shapes, and authentication details for the Town Ruins backend.</p>

</div>

<div class="tr-folder-nav">

<a class="tr-folder-nav-item" href="./API">
<span class="tr-folder-icon">&#128279;</span>
API Documentation
</a>

</div>

<div class="tr-dashboard-section" style="margin-top: 1.5rem;">
<h3>Purpose</h3>
<p>This folder contains the API reference for the Town Ruins backend. It documents endpoints, request/response shapes, authentication requirements, and integration patterns for consumers of the platform API.</p>
</div>

<div class="tr-dashboard-section">
<h3>Overview</h3>
<p>The API is organized around core platform domains: authentication, listings, bookings, payments, and moderation. Each section provides endpoint details, example payloads, and error codes.</p>
</div>

<div class="tr-dashboard-section">
<h3>Related Areas</h3>
<ul>
<li><a href="../architecture/">Architecture</a></li>
<li><a href="../database/">Database Reference</a></li>
<li><a href="../deployment/">Deployment</a></li>
<li><a href="../reference/">Reference</a></li>
</ul>
</div>

<div class="tr-dashboard-section">
<h3>Frequently Accessed Pages</h3>
<ul>
<li><a href="./API">API Documentation</a></li>
</ul>
</div>

# API Reference

## Last Verified

Last Verified: 2026-07-15

Branch context: awsfullmig

## Related Documents

- [docs/architecture/ARCHITECTURE.md](../architecture/ARCHITECTURE.md)
- [docs/database/DATABASE.md](../database/DATABASE.md)
- [docs/deployment/DEPLOYMENT.md](../deployment/DEPLOYMENT.md)

## Prerequisites

- Review the backend route files under [real-app-backend-main/routes](../../real-app-backend-main/routes)
- Review the controller files under [real-app-backend-main/controllers](../../real-app-backend-main/controllers)

## Derived Documents

- [docs/reference/REPOSITORY_GUIDE.md](../reference/REPOSITORY_GUIDE.md)

## Scope

This document consolidates the current HTTP API surfaces for the backend. It is based on the route files currently shipped in the repository and does not claim undocumented endpoints.

## API Groups

### Authentication and user management

- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/verify-email
- POST /api/v1/auth/verify-phone
- POST /api/v1/auth/resend-phone-otp
- POST /api/v1/auth/forgot-password
- POST /api/v1/auth/reset-password
- GET /api/v1/auth/me

### Listings and listing drafts

- GET /api/v1/listings
- GET /api/v1/listings/home/highlighted
- GET /api/v1/listings/home/grouped-by-location
- GET /api/v1/listings/:id
- POST /api/v1/listings
- PATCH /api/v1/listings/:id
- DELETE /api/v1/listings/:id
- GET /api/v1/listing-drafts
- POST /api/v1/listing-drafts
- PATCH /api/v1/listing-drafts/:id

### Bookings and stays

- GET /api/v1/bookings
- POST /api/v1/bookings
- GET /api/v1/stays
- POST /api/v1/stays

### Payments and wallet

- GET /api/v1/payments
- POST /api/v1/payments
- GET /api/v1/users/me/wallet
- GET /api/v1/users/me/wallet/transactions

### Admin and moderation

- GET /api/v1/admin/users
- GET /api/v1/admin/providers
- POST /api/v1/admin/verify-provider
- POST /api/v1/admin/suspend-user
- POST /api/v1/admin/delete-listing

### Uploads and legal documents

- GET /api/v1/uploads/r2-sign
- GET /api/v1/legal-docs
- POST /api/v1/legal-docs/accept

## Notes

- The backend route set includes additional modules for disputes, reports, reviews, notifications, promotions, pricing, saved searches, providers, rooms, webhooks, and engagement. Those are present in the repository but are not duplicated here in full because the current task is to maintain a concise canonical reference.
- Any endpoint whose implementation is not present in the current repository is marked as **Planned**.

