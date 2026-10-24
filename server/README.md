# SSM Sarees API

Node.js, Express and MongoDB API starter.

## Run locally

From the repository root:

```powershell
cd server
npm install
Copy-Item .env.example .env
# Start MongoDB locally, or set MONGODB_URI in .env to your MongoDB Atlas connection string.
npm run dev
```

The API listens on port 4000 by default.

## Endpoints

- `GET /api/health` — service and database status.
- `GET /api/products` — active product catalogue. Supports `category`, `search`, `page`, and `limit`.
- `GET /api/products/:slug` — one active product by slug.

No admin writes, customer accounts, orders, or payment endpoints are enabled yet. Those require authentication, authorization, validation, and payment verification before they should be exposed.
