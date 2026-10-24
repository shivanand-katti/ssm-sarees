# SSM Sarees API

Node.js, Express and MongoDB API for the SSM Sarees storefront.

## Environment

Create `.env` in this directory using `.env.example` as a guide.

- `PORT`: hosting platform port (defaults to `4000`).
- `MONGODB_URI`: MongoDB connection string.
- `CLIENT_ORIGIN`: comma-separated allowed storefront origins. Use the deployed storefront origin in production.

## Scripts

- `npm start` — start the API.
- `npm run dev` — restart the API on source changes (Node.js 20+).
- `npm run seed` — insert or update the sample catalogue products in MongoDB.

## Seed the catalogue

Set `MONGODB_URI` in `server/.env`, then run from this directory:

```bash
npm install
npm run seed
```

The seeder uses stable product slugs and upserts records, so rerunning it updates the same sample products instead of creating duplicates. It does not delete other products.

## Endpoints

- `GET /api/health` — service and database status.
- `GET /api/products` — active catalogue. Supports `category`, `search`, `page`, and `limit`.
- `GET /api/products/:slug` — one active product by slug.

The catalogue is currently read-only through the public API. Admin writes, customer accounts, orders, and payment endpoints are not enabled yet. Before exposing those capabilities, implement authentication, role-based authorization, input validation, inventory checks, and server-side payment verification.
