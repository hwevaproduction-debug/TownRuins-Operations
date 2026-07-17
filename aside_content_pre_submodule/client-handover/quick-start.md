---
title: Quick Start
description: Quick-start guide for getting up and running with the Town Ruins platform.
tags:
  - quick-start
  - onboarding
  - client
aliases:
  - Getting Started
  - Start Here
---

# Quick Start

## What exists today

Town Ruins is a property marketplace with two related experiences:

- Long-term rental listings for tenants and landlords.
- Short-stay accommodation bookings for guests and providers.

## Current user journeys

1. Sign up as a tenant or landlord.
2. Verify your email to access the platform.
3. Browse listings or temporary stays.
4. Contact a landlord or complete a stay booking.
5. Use the wallet to manage TR Tokens for platform actions.

## Important implementation notes

- The current codebase supports tenant, landlord, provider, admin, and super_admin roles.
- The frontend routes to role-specific dashboards through the protected routing layer.
- TR Tokens are used for non-booking platform actions such as engagement approval charges and listing restoration flows.

## Planned items

- Live payment provider activation is planned and is not yet confirmed as available in the current repository state.
- Some advanced moderation, messaging, and analytics capabilities remain Planned.

## Illustrative mockup

```wireframe
+-------------------------+
| Town Ruins             |
| [Search] [Stays] [Docs] |
+-------------------------+
| Hero / Browse listings |
| [Find a place]         |
+-------------------------+
| Featured listings      |
| Card 1  Card 2  Card 3|
+-------------------------+
```

Illustrative mockup — not an actual screenshot.
