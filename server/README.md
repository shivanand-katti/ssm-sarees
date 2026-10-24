# SSM Sarees API

Node.js, Express and MongoDB API for the SSM Sarees storefront and admin studio.

## Environment

Create `.env` in this directory from `.env.example`.

- `PORT`: hosting platform port (defaults to `4000`).
- `MONGODB_URI`: MongoDB connection string.
- `CLIENT_ORIGIN`: comma-separated allowed storefront origins.
- `JWT_SECRET`: random secret with at least 32 characters.
- `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`: bootstrap administrator values.
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`: Razorpay **test-mode** credentials for checkout.

Never commit `.env` or use real payment keys in a demo deployment.

## Scripts

- `npm start` — start the API.
- `npm run dev` — restart the API on source changes (Node.js 20+).
- `npm run seed` — upsert sample catalogue products.
- `npm run create-admin` — create/update the administrator from environment variables.

## Bootstrap data

Set `MONGODB_URI` in `server/.env`, then run `npm install`, `npm run seed`, and `npm run create-admin` from this directory. Use a unique strong admin password. The seeder upserts stable slugs and does not delete other products.

## Public endpoints

- `GET /api/health` — service and database status.
- `GET /api/products` — active catalogue. Supports `category`, `search`, `page`, and `limit`.
- `GET /api/products/:slug` — one active product by slug.
- `POST /api/auth/login` — issue an eight-hour JWT for an active account.
- `GET /api/auth/me` — validate current bearer token.
- `POST /api/orders/create-payment` — calculate the order total from MongoDB product prices and create a Razorpay order.
- `POST /api/orders/verify-payment` — verify Razorpay signature and mark the order paid.

## Administrator endpoints

All `/api/admin/*` routes require a valid bearer token with the `admin` role.

- `GET /api/admin/products`
- `POST /api/admin/products`
- `PATCH /api/admin/products/:id`
- `DELETE /api/admin/products/:id` (archives the product)
- `GET /api/admin/orders?page=1&limit=25&status=paid`
- `PATCH /api/admin/orders/:id/status` (pending orders may be cancelled)

The Angular admin studio is available at `/admin`.

## Payment safety

The browser never supplies authoritative prices. The API loads product prices and inventory from MongoDB, validates the cart, and verifies the Razorpay signature server-side. Payment callbacks must be tested in Razorpay test mode before any live payment configuration. Paid orders with stock conflicts are logged for reconciliation; production readiness still requires end-to-end payment tests, monitoring, privacy/legal review, and operational handling of refunds and failed deliveries.
