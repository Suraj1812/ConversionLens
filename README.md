# Shoplytics

Shoplytics is a production-ready Shopify analytics project focused on real user behavior instead of store operations. It collects product views, add-to-cart actions, and purchases, stores them in MongoDB, and surfaces funnel and product insights in a clean React dashboard.

## Project structure

```text
backend/
dashboard/
shopify/
shopify-tracking-snippets.md
compose.yaml
```

## What is production-ready in this repo

- Hardened Express API with `helmet`, `compression`, rate limiting, request IDs, readiness checks, and structured error responses
- Idempotent event ingestion with optional `eventId` deduplication
- Analytics filtered by time window
- Dockerfiles for backend and dashboard
- `compose.yaml` for end-to-end local deployment with MongoDB
- GitHub Actions CI for backend tests and dashboard builds
- Shopify custom pixel integration for production-safe event delivery

## Local development

### Backend

1. Open [backend](/Users/surajsingh/Desktop/ConversionLens/backend).
2. Copy `.env.example` to `.env`.
3. Add your MongoDB connection string.
4. Install dependencies:

```bash
npm install
```

5. Start the API:

```bash
npm run dev
```

The backend runs on `http://localhost:4000`.

### Backend API

- `POST /track-event`
- `GET /analytics/overview`
- `GET /analytics/funnel`
- `GET /analytics/products`
- `GET /healthz`
- `GET /readyz`

### Example event payload

```json
{
  "eventId": "evt_123456789",
  "eventType": "view",
  "productId": "1234567890",
  "productTitle": "Classic Hoodie",
  "sessionId": "sl_abc123",
  "timestamp": "2026-03-29T09:00:00.000Z",
  "source": "shopify_pixel"
}
```

### Dashboard

1. Open [dashboard](/Users/surajsingh/Desktop/ConversionLens/dashboard).
2. Copy `.env.example` to `.env`.
3. Install dependencies:

```bash
npm install
```

4. Start the dashboard:

```bash
npm run dev
```

The dashboard runs on `http://localhost:5173`.

The Vite dev server proxies `/api` to the backend, so the frontend and production nginx config both use the same API path.

## Production deployment with Docker

1. Copy [backend/.env.production.example](/Users/surajsingh/Desktop/ConversionLens/backend/.env.production.example) to `backend/.env.production`.
2. Set a real production MongoDB URI and trusted frontend origin.
3. Start the stack:

```bash
docker compose up --build
```

The production dashboard will be available on `http://localhost:8080`.

## Shopify setup

Use [shopify-tracking-snippets.md](/Users/surajsingh/Desktop/ConversionLens/shopify-tracking-snippets.md) for the production Shopify integration flow.

You will need:

- A Shopify development store using the Dawn theme
- A public URL for the backend, because Shopify cannot post customer events to your local machine
- A custom pixel in Shopify Customer Events
- Your normal Meta Pixel and GA4 production setup through approved Shopify integrations

### Shopify files included in this repo

- [shopify/shoplytics.custom-pixel.js](/Users/surajsingh/Desktop/ConversionLens/shopify/shoplytics.custom-pixel.js): production custom pixel for Shoplytics ingestion
- [shopify-tracking-snippets.md](/Users/surajsingh/Desktop/ConversionLens/shopify-tracking-snippets.md): install steps and testing checklist

## What the dashboard shows

- Overview: total users, total tracked events, conversion rate
- Funnel: sequential view to cart to purchase progression
- Products: top viewed, top purchased, best converting, and most abandoned products

## Quality checks

- Backend tests:

```bash
cd backend && npm test
```

- Dashboard build:

```bash
cd dashboard && npm run build
```

## Notes

- The project intentionally stays focused on tracking and analytics instead of full Shopify app auth or store management.
- `eventId` is optional but strongly recommended in production so the backend can deduplicate retries and duplicate checkout loads.
- The dashboard uses a white, minimal layout on purpose so the emphasis stays on eCommerce behavior and business insight.
