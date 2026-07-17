
---
title: UI Guidelines
description: UI guidelines and design standards for the Town Ruins platform frontend, including design system, component patterns, and accessibility rules.
tags:
  - ui-guidelines
  - design-system
  - frontend
  - accessibility
aliases:
  - Design System
  - UI Standards
---

# UI Guidelines

## Design System

Town Ruins uses **Material UI v5** with a custom theme defined in `real-app-frontend-main/src/theme.ts`.

## Redux & API State

All server state is managed via **RTK Query** slices in `real-app-frontend-main/src/redux/api/`.

Slice

Domain

`apiSlice.ts`

Base RTK Query setup with `Authorization` header injection

`authApiSlice.ts`

Signup, login, Google, verify, profile

`listingApiSlice.ts`

Listings + listing drafts

`paymentApiSlice.ts`

Payments

`providerApiSlice.ts`

Provider profile + rooms

`stayApiSlice.ts`

Stays + bookings

`uploadApiSlice.ts`

S3 presigned upload

`notificationApiSlice.ts`

Notifications

`engagementApiSlice.ts`

Engagements

`adminApiSlice.ts`

Admin operations

`userApiSlice.ts`

User profile updates

**Rules:**

- Never call `fetch` or `axios` directly in views — always use RTK Query hooks
- Auth token is injected automatically by `apiSlice.ts` from Redux auth state
- Invalidate tags on mutations to keep cache fresh

## Colour Palette

Token

Value

Usage

Primary gold

`#B8975A`

Accents, CTAs, icons, badges

Dark green

`#1F4D3A`

Hero gradients, brand backgrounds

Dark slate

`#1F2937`

Hero gradients, dark surfaces

Text primary

MUI default

Body text

Text secondary

MUI default

Captions, descriptions

### Hero Gradient

All page heroes use:

```css
background: linear-gradient(135deg, #1F2937 0%, #1F4D3A 100%);
```

### Typography

- Page titles: `fontWeight: 800`, `fontSize: { xs: \"2rem\", md: \"3rem\" }`
- Section labels: `fontSize: \"11px\"`, `fontWeight: 700`, `letterSpacing: \"0.15em\"`, `textTransform: \"uppercase\"`, `color: \"#B8975A\"`
- Card titles: `fontWeight: 800`, `fontSize: \"18px\"–\"20px\"`
- Body: `color: \"text.secondary\"`, `lineHeight: 1.7`–`1.9`

## Core UI Components

All shared components live in `real-app-frontend-main/src/components/ui/`.

### AppButton

Primary action button. Props: `variant`, `color`, `onClick`, `disabled`, `fullWidth`.

Use for all form submissions and primary CTAs. Do not use raw MUI `Button` in views.

### AppCard

Surface container. Props: `sx`, `interactive` (adds hover cursor + elevation).

Use for all card-style content blocks. Do not use raw MUI `Paper` or `Card`.

### AppContainer

Page-width wrapper with responsive horizontal padding.

Use as the outermost wrapper inside every page body section.

### AppInput

Styled text input. Use instead of raw MUI `TextField` for consistency.

### AppSelect

Styled select/dropdown. Use instead of raw MUI `Select`.

## Layout Patterns

### Page Layout

Every page follows this structure:

```
<Box>                          ← full-width wrapper
  <Box sx={{ hero gradient }}> ← hero section
    label / title / subtitle
  </Box>
  <AppContainer>               ← content body
    <Grid container>           ← card grid or content
      ...
    </Grid>
  </AppContainer>
</Box>
```

### Dashboard Layout

Dashboards use a two-column layout on desktop, single column on mobile:

```
<Grid container spacing={3}>
  <Grid item xs={12} md={8}>  ← main content
  <Grid item xs={12} md={4}>  ← sidebar (wallet, stats)
```

### Auth Pages

Auth pages (login, signup, forgot-password) use a cinematic full-height hero background with a centred form card. No `Header` or `Footer` is rendered on auth routes.

## Colour Mode

The app supports **light and dark mode** via `ColorModeContext` in `real-app-frontend-main/src/App.tsx`.

- Mode is persisted in `localStorage` under key `colorMode`
- Toggle is in the `Header` component
- Theme is created via `createAppTheme(mode)` in `real-app-frontend-main/src/theme.ts`

Do not hardcode `#fff` or `#000` for text/background — use MUI theme tokens (`background.paper`, `text.primary`, etc.) so both modes work correctly.

## Icons

Use **Lucide React** for all new icons:

```tsx
import { Rocket, FileText, Home } from \"lucide-react\";
<Rocket size={28} color=\"#B8975A\" />
```

MUI Icons (`@mui/icons-material`) are used in some older components — do not mix in new work.

## Forms

All forms use **Formik** + **Yup** validation.

- Validation schemas live in `components/validationSchema.ts` co-located with the view
- Error messages display inline below each field
- Submit buttons show a loading spinner while the mutation is in flight

## Notifications / Toasts

Use `ToastAlert` from `real-app-frontend-main/src/components/ToastAlert/ToastAlert.tsx` for all user-facing success/error messages. Do not use `alert()` or raw MUI `Snackbar`.

## Routing Conventions

Pattern

Guard

Notes

`/`, `/search`, `/listing/:id`, `/stays`, `/stays/rooms/:roomId`

None

Public

`/docs/*`, `/trust-safety`, `/terms`, `/privacy`, `/landlord-terms`, `/refund-policy`, `/community-guidelines`

None

Public

`/login`, `/signup`, `/forgot-password`, `/reset-password`, `/provider-signup`

`PublicRoutes`

Redirects logged-in users to their dashboard

`/verify-email`, `/verify-phone`, `/onboarding`

None

Semi-public (no role guard)

`/profile`, `/notifications`, `/saved-searches`, `/stays/bookings`

`ProtectedRoutes`

Requires auth, any role

`/dashboard/landlord`, `/create-listing`, `/listings/:id`, `/listings/:id/pay`

`allowedRoles={[\"landlord\"]}`

Landlord only

`/dashboard/tenant`

`allowedRoles={[\"tenant\"]}`

Tenant only

`/dashboard/provider`

`allowedRoles={[\"provider\"]}`

Provider only

`/dashboard/admin`

`allowedRoles={[\"admin\",\"super_admin\"]}`

Admin only

**Footer suppression:** The `AppFooter` component checks `location.pathname` and hides the footer on all auth routes (`/login`, `/signup`, `/forgot-password`, `/reset-password`, `/provider-signup`, `/verify-email`, `/verify-phone`, `/onboarding`).

## Docs Pages

All `/docs/*` pages follow the same template:

1. Dark gradient hero with gold label + white title
2. `AppContainer` body with `AppCard` grid
3. No sidebar — full-width content

When adding a new docs page:

- Add the route in `real-app-frontend-main/src/App.tsx`
- Add a card to `real-app-frontend-main/src/views/Docs/index.tsx`
- Import an appropriate Lucide icon for the card
