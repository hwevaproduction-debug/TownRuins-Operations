# Environment Variables

## Last Verified

Last Verified: 2026-07-15

Branch context: awsfullmig

## Related Documents

- [docs/deployment/DEPLOYMENT.md](DEPLOYMENT.md)
- [docs/operations/OPERATIONS_RUNBOOK.md](../operations/OPERATIONS_RUNBOOK.md)

## Prerequisites

- Review [real-app-backend-main/.env.example](../../real-app-backend-main/.env.example)
- Review [amplify.yml](../../amplify.yml)
- Review [real-app-backend-main/render.yaml](../../real-app-backend-main/render.yaml)

## Derived Documents

- [docs/operations/OPERATIONS_RUNBOOK.md](../operations/OPERATIONS_RUNBOOK.md)

## Variable Groups

### Frontend / Amplify

- REACT_APP_API_URL — Required for frontend API access; see [real-app-frontend-main/AMPLIFY_ENV.md](../../real-app-frontend-main/AMPLIFY_ENV.md) for current naming context.
- REACT_APP_BACKEND_URL — Required for frontend-backend connectivity.
- REACT_APP_FIREBASE_API_KEY — Optional / environment-specific.
- REACT_APP_TOKEN_PAYER_ROLE — Optional / feature-flag related.
- REACT_APP_LISTING_FEE_AMOUNT — Optional / environment-specific.
- REACT_APP_TENANT_PREMIUM_AMOUNT — Optional / environment-specific.

### Backend / Render

- DATABASE_URL — Required.
- JWT_SECRET — Required.
- JWT_EXPIRES_IN — Required.
- FRONTEND_URL — Required for callback and CORS coordination.
- PAYNOW_RETURN_URL — Required for payment callbacks.
- PAYMENT_PROVIDER — Required.
- TOKEN_PAYER_ROLE — Required.
- LISTING_FEE_AMOUNT — Optional.
- TENANT_PREMIUM_AMOUNT — Optional.
- S3_BUCKET / S3_REGION / S3_PUBLIC_BASE_URL — Required for upload flows.
- EMAIL_FROM / GMAIL_USER / GMAIL_APP_PASSWORD — Optional / mail delivery.
- SMS settings — Optional / only enabled when configured.

## Notes

- This document consolidates the values currently referenced in the repository configuration files and examples.
- Any environment variable not currently referenced in the repository is marked as **Planned**.

