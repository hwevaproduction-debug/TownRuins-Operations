---
title: Administrator Guide
description: Client-facing administrator guide for the Town Ruins platform, covering platform management and administrative workflows.
tags:
  - admin-guide
  - administrator
  - client-handover
aliases:
  - Admin Guide
  - Administration
---

# Administrator Guide

## Current administrator scope

The frontend routes admin users to the admin dashboard via [real-app-frontend-main/src/App.tsx](../../real-app-frontend-main/src/App.tsx), and the protected routing layer permits the roles `admin` and `super_admin` for that route.

## Verified capabilities

- Review and moderate listings, disputes, reports, and reviews.
- Manage provider verification and accommodation moderation.
- View booking and settlement-related data.
- Manage legal documents through the admin workflow.

## Planned capabilities

- Some operational workflows, such as a fully surfaced audit-log UI and advanced support automation, are still Planned rather than fully implemented in the current codebase.

## Illustrative mockup

```wireframe
+------------------------------+
| Admin Dashboard             |
| Overview | Moderation | Users |
+------------------------------+
| Queue: 3 pending reviews    |
| Providers: 2 awaiting review|
| Bookings: 5 pending settle   |
+------------------------------+
```

Illustrative mockup — not an actual screenshot.
