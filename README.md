# SSM Sarees

Premium saree e-commerce application built by SR Tech.

## Architecture

- `frontend/storefront`: Angular customer storefront
- `frontend/admin`: Angular administration dashboard
- `backend`: Node.js, Express and MongoDB REST API
- Free-tier-first deployment: Cloudflare Pages for Angular apps, Render for API, MongoDB Atlas free cluster where available

## Planned capabilities

- Product catalogue, categories, search and filters
- Product details, cart and checkout
- Customer accounts and order history
- Admin product, inventory and order management
- Server-side validation, authentication and role-based access
- Payment integration initially in sandbox/test mode
- Automated tests and production deployment checklist

## Development status

Repository bootstrap is in progress. Features and deployment will be added and verified incrementally. No production services are configured yet.

## Free deployment notes

The goal is to run a portfolio/demo deployment on free tiers. Free plans may have sleep/usage, storage, bandwidth, or feature restrictions and can change over time. Never commit credentials. Configure environment variables through each hosting provider's dashboard. Do not process real customer payments until security, legal, privacy, order operations, and provider fees have been reviewed.

## Proposed layout

```
frontend/
  storefront/
  admin/
backend/
  src/
    config/
    middleware/
    modules/
    routes/
  tests/
docs/
```

## Getting started

Node.js LTS and Angular CLI will be used for frontend development. The backend will use Node.js, Express, Mongoose and environment-based configuration. Setup instructions will be updated with each implementation milestone.