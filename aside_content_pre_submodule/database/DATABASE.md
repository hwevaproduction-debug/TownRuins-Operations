---
title: Database Reference
description: Database reference for the Town Ruins platform, including Prisma schema, models, relationships, and migration history.
tags:
  - database
  - prisma
  - schema
  - postgresql
aliases:
  - DB
  - Data Model
---

<div class="tr-folder-hero">

# Database Reference

<p>Prisma schema, models, relationships, and migration history for the Town Ruins platform.</p>

</div>

<div class="tr-folder-nav">

<a class="tr-folder-nav-item" href="./DATABASE">
<span class="tr-folder-icon">&#128451;</span>
Database Documentation
</a>

</div>

<div class="tr-dashboard-section" style="margin-top: 1.5rem;">
<h3>Purpose</h3>
<p>This folder contains the database reference documentation for the Town Ruins platform. It describes the Prisma schema, data models, relationships, and migration procedures that define the persistence layer.</p>
</div>

<div class="tr-dashboard-section">
<h3>Overview</h3>
<p>The database layer is managed through Prisma, providing type-safe access to PostgreSQL. The documentation covers schema definitions, model relationships, migration workflows, and data integrity rules.</p>
</div>

<div class="tr-dashboard-section">
<h3>Related Areas</h3>
<ul>
<li><a href="../architecture/">Architecture</a></li>
<li><a href="../api/">API Reference</a></li>
<li><a href="../deployment/">Deployment</a></li>
<li><a href="../reference/">Reference</a></li>
</ul>
</div>

<div class="tr-dashboard-section">
<h3>Frequently Accessed Pages</h3>
<ul>
<li><a href="./DATABASE">Database Documentation</a></li>
</ul>
</div>

# Database Reference

## Last Verified

Last Verified: 2026-07-15

Branch context: awsfullmig

## Related Documents

- [docs/architecture/ARCHITECTURE.md](../architecture/ARCHITECTURE.md)
- [docs/api/API.md](../api/API.md)
- [docs/business/TOKEN_ECONOMY.md](../business/TOKEN_ECONOMY.md)

## Prerequisites

- Review [real-app-backend-main/prisma/schema.prisma](../../real-app-backend-main/prisma/schema.prisma)
- Review the migration folders under [real-app-backend-main/prisma/migrations](../../real-app-backend-main/prisma/migrations)

## Derived Documents

- [docs/reference/REPOSITORY_GUIDE.md](../reference/REPOSITORY_GUIDE.md)

## Scope

The current schema is PostgreSQL-backed and managed through Prisma migrations. The current repository history includes the listing timestamp restoration migration noted in the changelog.

## Core Models

- User
- Listing
- ListingDraft
- Accommodation
- Room
- Booking
- Payment
- WalletTransaction
- NotificationJob
- Notification
- LegalDocument
- Report
- Dispute
- Engagement
- UserPushSubscription

## Notes

- Wallet, TR Token balance, legal documents, and notifications are represented in the schema and are documented in [docs/business/TOKEN_ECONOMY.md](../business/TOKEN_ECONOMY.md).
- The schema continues to evolve through migrations in [real-app-backend-main/prisma/migrations](../../real-app-backend-main/prisma/migrations); any feature not reflected in the current schema is marked as **Planned**.

