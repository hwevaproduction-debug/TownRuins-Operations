---
title: Admin Runbook
description: Administrative runbook for the Town Ruins platform, covering access roles, dashboard procedures, and platform management workflows.
tags:
  - admin-runbook
  - operations
  - platform-management
aliases:
  - Admin Runbook
  - Administration
---

# Town Ruins — Admin Runbook

## Access & Roles

The admin dashboard and all `/api/v1/admin/*` endpoints require the role `admin` or `super_admin`. The middleware used is `requireRole(["admin", "super_admin"])`, which accepts either role.

**Important exception:** Two provider-management endpoints use exact-match role checking (`requireRole("admin")`). These endpoints **deny** `super_admin` users:

- `PUT /api/v1/providers/:id/verify`
- `PUT /api/v1/providers/:id/commission`

Only users with the exact role `admin` can call these two endpoints.

---

## 1. Provider Approval / Rejection

**UI path:** `/dashboard/admin` → **Providers** tab

**API endpoint:** `PUT /api/v1/providers/:id/verify`

**Role required:** `admin` only (exact match — `super_admin` is denied)

**Request body:**
```json
{
  "verificationStatus": "approved"
}
```
or
```json
{
  "verificationStatus": "rejected",
  "verificationNotes": "Reason for rejection"
}
```

**Outcome:**
- On approval: `verifiedAt` is stamped on the provider profile, `provider.approved` notification is enqueued.
- On rejection: `provider.rejected` notification is enqueued. The provider can resubmit from their Profile page.
- The provider's `verificationStatus` is updated in the `User.providerProfile` JSON field.

---

## 2. Identity Verification (Landlords)

**UI path (landlord-side):** `/profile` → **"Start Verification"** button

**API endpoint:** `POST /api/v1/users/submit-verification`

**Role required:** `landlord`

**Request body:**
```json
{
  "idImageUrl": "https://...",
  "selfieUrl": "https://..."
}
```

**Outcome:**
- The submission writes directly to the `User` record: `verificationStatus` is set to `PENDING_REVIEW`, `verificationIdUrl` and `verificationSelfieUrl` store the document URLs, and `verificationSubmittedAt` records the timestamp.
- An email notification is sent to `ADMIN_EMAIL` (if configured) alerting the admin team of a new submission.

**Admin review of landlord verification:**
There is **no dedicated approve/reject API endpoint** for landlord identity verification in the current implementation. The landlord verification data is stored on the `User` model. Admin review of landlord verification is handled through the admin dashboard's user management view (if present in the UI), but no corresponding backend endpoint exists in the reviewed files. The admin cannot programmatically approve or reject landlord ID verification via a dedicated API call.

---

## 3. Payout Settlement

**UI path:** `/dashboard/admin` → **Bookings & Settlements** tab

**API endpoint:** `POST /api/v1/bookings/:id/settle` (alternate: `PUT /api/v1/bookings/:id/settle`)

**Role required:** `admin` or `super_admin`

**Outcome:**
- The booking's `settlementStatus` is changed to `SETTLED`.
- `settledAt` is recorded with the current timestamp.
- An optional `settlementReference` can be provided in the request body.
- A `booking.settlement_completed` notification is enqueued to the provider.
- A booking that is already settled, or in a terminal state (cancelled, canceled, rejected, expired), cannot be settled again (returns 400).

---

## 4. Dispute Handling

**UI path:** No dedicated admin tab in the current dashboard. Managed via API or future UI integration.

**API endpoints:**
- `GET /api/v1/admin/disputes` — List all disputes with optional filters (`status`, `raisedByRole`, `bookingId`)
- `GET /api/v1/admin/disputes/:id` — Get a single dispute with full booking, guest, provider, and raiser details
- `POST /api/v1/admin/disputes/:id/review` — Mark dispute as `UNDER_REVIEW`
- `POST /api/v1/admin/disputes/:id/resolve` — Resolve dispute (requires body: `{ "resolution": "..." }`)
- `POST /api/v1/admin/disputes/:id/close` — Close dispute (optional body: `{ "resolution": "..." }`)

**Role required:** `admin` or `super_admin`

**Outcome:**
- State flow: `OPEN → UNDER_REVIEW → RESOLVED` or `OPEN → UNDER_REVIEW → CLOSED`.
- On resolve/close: `resolvedBy`, `resolvedAt`, and `resolution` are recorded.
- `dispute.resolved` notification is enqueued to the guest and provider.
- Every state transition is logged in the audit log.

---

## 5. Report Moderation

**UI path:** No dedicated admin tab in the current dashboard. Managed via API or future UI integration.

**API endpoints:**
- `GET /api/v1/admin/reports` — List all reports with optional filters (`status`, `targetType`, `reason`)
- `GET /api/v1/admin/reports/:id` — Get a single report with reporter, resolver, and target details
- `PUT /api/v1/admin/reports/:id/review` — Mark report as `UNDER_REVIEW`
- `PUT /api/v1/admin/reports/:id/resolve` — Resolve report (requires body: `{ "resolution": "..." }`)
- `PUT /api/v1/admin/reports/:id/dismiss` — Dismiss report (requires body: `{ "resolution": "..." }`)

**Role required:** `admin` or `super_admin`

**Outcome:**
- State flow: `OPEN → UNDER_REVIEW → RESOLVED` or `OPEN → UNDER_REVIEW → DISMISSED`.
- On resolve/dismiss: `resolvedBy`, `resolvedAt`, and `resolution` are recorded.
- `report.resolved` notification is enqueued to the reporter.
- Every state transition is logged in the audit log.

---

## 6. Review Moderation

**UI path:** No dedicated admin tab in the current dashboard. Managed via API.

**API endpoints:**
- `GET /api/v1/admin/reviews` — Get all reviews (published and unpublished)
- `GET /api/v1/admin/reviews/analytics` — Get review analytics summary
- `PUT /api/v1/admin/reviews/:id/moderate` — Moderate a review (body: `{ "isPublished": true/false }`)

**Role required:** `admin` or `super_admin`

**Outcome:**
- Unpublished reviews (`isPublished: false`) are hidden from public accommodation pages.
- Published reviews are visible to all users.
- The moderation queue in the admin dashboard counts unpublished reviews.

---

## 7. Legal Documents

**UI path:** `/dashboard/admin` → **Legal Documents** tab

**API endpoints:**
- `GET /api/v1/admin/legal-docs` — List all legal documents
- `GET /api/v1/admin/legal-docs/:slug/history` — Get version history for a legal doc slug
- `POST /api/v1/admin/legal-docs` — Create a new legal document
- `PUT /api/v1/admin/legal-docs/:id` — Update a legal document
- `DELETE /api/v1/admin/legal-docs/:id` — Archive (soft-delete) a legal document

**Role required:** `admin` or `super_admin`

**Outcome:**
- Creating or updating a legal document versions the content: the previous active version is archived (`isActive: false`, `archivedAt` set), and a new active version is created.
- Only documents with `isActive: true` are served publicly via `GET /api/v1/legal-docs/:slug`.
- Archived versions are retained for audit purposes.

---

## 8. Audit Logs

**UI path:** No dedicated admin tab in the current dashboard. Accessed via API.

**API endpoints:**
- `GET /api/v1/admin/audit-logs` — Get audit log entries with optional filters (`action`, `targetType`, `targetId`, `adminSearch`/`adminId`, `from`/`to`, `page`, `limit`)
- `GET /api/v1/admin/audit-logs/:id` — Get a single audit log entry

**Role required:** `admin` or `super_admin`

**Outcome:**
- Every admin action that changes state (approve, reject, suspend, resolve, etc.) is automatically recorded.
- Each entry includes: `adminId`, `action`, `targetType`, `targetId`, `metadata`, and `ipAddress`.
- Failed log writes are silently caught and do not break the originating request.

---

## 9. Escalation Paths

**When to escalate:**
- Disputes involving high-value bookings or potential legal liability should be marked `UNDER_REVIEW` before final action.
- Reports targeting verified providers with unclear evidence should be reviewed by a second admin before resolution.
- Provider commission or suspension decisions with platform-wide implications should be coordinated before applying bulk changes.

**Roles:**
- Both `admin` and `super_admin` share the same endpoint permissions for `/api/v1/admin/*`.
- There is no separate escalation endpoint. Escalation is an operational process. Admins should document their reasoning in the `resolution` or `verificationNotes` fields when taking irreversible actions.

**Outcome:**
- All escalations are recorded in the audit log via `auditAdminAction`.
- The `resolution` field on disputes and reports should include the escalation rationale for accountability.

---

## 10. Commission & Platform Settings

**UI path:** `/dashboard/admin` → **Providers** tab → **Commission** column

**API endpoint:** `PUT /api/v1/providers/:id/commission`

**Role required:** `admin` only (exact match — `super_admin` is denied)

**Request body:**
```json
{
  "commissionRate": 10.5
}
```

**Outcome:**
- The new commission rate must be a non-negative number.
- It applies to all **future** bookings for that provider.
- Existing bookings are unaffected.
- The rate is stored in `providerProfile.commissionRate` and persists until changed again.
