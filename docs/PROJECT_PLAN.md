# SSM Sarees implementation plan

## Milestone 1 — Repository foundation
- Establish workspace layout, environment example, ignore rules and deployment notes.
- Choose Angular storefront and admin; Express/Mongoose API.

## Milestone 2 — Storefront
- Responsive premium visual system: burgundy, ivory and muted gold.
- Home page, categories, product cards, catalogue filters and product detail.
- Start with clearly labelled demo product data.

## Milestone 3 — API and persistence
- Health endpoint and modular Express structure.
- MongoDB connection and product/category models.
- Validation, consistent errors, logging and tests.

## Milestone 4 — Cart and orders
- Cart and checkout flow.
- Customer identity and order history.
- Stock validation and order state transitions.

## Milestone 5 — Admin
- Protected admin routes and role checks.
- Product, category, inventory and order management.

## Milestone 6 — Payments and notifications
- Payment provider sandbox integration and server-side verification.
- Email/order notifications only after credentials and configuration are supplied.

## Milestone 7 — Quality and release
- Unit/API/end-to-end tests, accessibility and responsive checks.
- Security review, production configuration and free-tier deployments.
- Verify each live URL; do not call the project deployed until tested.
