---
title: Repository Guide
description: Repository layout and workflow guide for the Town Ruins platform, including backend, frontend, documentation, and legal source locations.
tags:
  - repository
  - guide
  - workflow
  - layout
aliases:
  - Repo Guide
  - Repository
---

# Repository Guide

## Repository layout

- [README.md](../../README.md) — repository-level overview and deployment notes.
- [real-app-backend-main](../../real-app-backend-main/) — Express API, Prisma schema, middleware, controllers, and tests.
- [real-app-frontend-main](../../real-app-frontend-main/) — React SPA, Redux slices, UI views, and routing.
- [docs](../) — canonical documentation hierarchy for architecture, operations, guides, legal references, and the client handover pack.
- [workflow](../../workflow/) and [workflows](../../workflows/) — operational and workflow documentation.
- [terms&all](../../terms&all/) — canonical legal source documents in DOCX format plus verification notes.

## Verified implementation notes

- The backend uses Node.js/Express with Prisma and PostgreSQL; the current schema is defined in [real-app-backend-main/prisma/schema.prisma](../../real-app-backend-main/prisma/schema.prisma).
- The frontend uses React, Redux Toolkit, MUI, and React Router; the app shell is in [real-app-frontend-main/src/App.tsx](../../real-app-frontend-main/src/App.tsx).
- Role-based routing is enforced by [real-app-frontend-main/src/routes/ProtectedRoutes.tsx](../../real-app-frontend-main/src/routes/ProtectedRoutes.tsx).
- The canonical token economy invariant is documented in [docs/business/TOKEN_ECONOMY.md](../business/TOKEN_ECONOMY.md).
- Legal views are implemented in [real-app-frontend-main/src/views/Legal](../../real-app-frontend-main/src/views/Legal/).

## Working conventions

- Keep documentation changes grounded in the current repository state.
- Prefer updating the canonical docs under [docs](../) over duplicating content in other folders.
- When a fact is not verifiable from the codebase, mark it as Planned or Unverified rather than inventing it.
