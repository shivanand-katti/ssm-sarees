# Deployment plan (free-tier-first)

## Target setup

- Storefront Angular app: Cloudflare Pages
- Admin Angular app: Cloudflare Pages (separate project)
- Express API: Render free web service if the plan is available for the account/region
- MongoDB: MongoDB Atlas free cluster, if available and suitable
- Product images: decide after checking current free storage and bandwidth limits; avoid keeping uploaded files on ephemeral API disks.

## Before deploying

1. Build and test frontend and backend locally.
2. Configure a stable API base URL for each frontend build.
3. Set production environment variables in provider dashboards; do not commit secrets.
4. Restrict CORS to the exact deployed storefront/admin origins.
5. Create a least-privilege database user and restrict network access appropriately.
6. Use HTTPS, secure cookies/tokens, request validation, rate limiting and admin role checks.
7. Keep payment provider in test mode until end-to-end verification is complete.
8. Check current provider plans, quotas, sleep behavior, bandwidth/storage limits and terms before relying on any free tier.

## Important limitations

A free hosting plan is suitable for a demo and low-traffic proof of concept, not a guarantee of production availability. API cold starts and database/service quotas can affect user experience. A custom domain, payment processing, email/SMS, and scale may introduce costs.
