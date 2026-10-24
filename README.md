# SSM Sarees

A premium saree storefront and store-management application by SR Tech.

## Current architecture

- **Storefront:** Angular standalone components, responsive burgundy/ivory/gold design.
- **Admin studio:** Angular route at `/admin`, JWT login, product creation/editing/archive.
- **API:** Node.js, Express, Mongoose, MongoDB.
- **Checkout API:** Razorpay order creation and server-side signature verification (test credentials only).
- **CI:** GitHub Actions builds the Angular storefront on pushes and pull requests.

## Implemented in this repository

- Product catalogue API with category/search/pagination support.
- Repeatable MongoDB sample-product seeder.
- Admin account bootstrap script, password hashing, JWT auth and role checks.
- Protected admin product CRUD and order-list/cancel endpoints.
- Server-calculated order totals, inventory checks, Razorpay order creation and payment signature verification.
- Security headers and rate limits on authentication and checkout APIs.
- Production environment file replacement for the storefront API origin.

## Important status

The source code is committed, but it must pass the automated build and end-to-end checks before deployment. The production API URL is still a placeholder. The payment API needs MongoDB and Razorpay test credentials configured through the hosting provider's secret settings. The browser checkout interaction, full order operations, customer account features, and final live test remain to be completed/verified before treating this as a production-ready store.

## Repository layout

```
src/                    Angular storefront and admin studio
server/src/             Express API, models, middleware and routes
server/scripts/         Sample product seeder and admin bootstrap
docs/                   Project plan and deployment notes
.github/workflows/      CI build
```

## Security notes

- Never commit `.env`, database credentials, JWT secrets, or payment secrets.
- Use Razorpay test mode until the entire payment flow is verified.
- Do not accept browser-provided prices as authoritative; the API recalculates order totals from MongoDB.
- A demo build is not a substitute for production security review, privacy/legal review, refund handling, delivery operations, monitoring, or backups.
