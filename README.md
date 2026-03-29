# Shoplytics

Shoplytics is a production-ready Shopify analytics project focused on real user behavior instead of store operations. It collects product views, add-to-cart actions, and purchases, stores them in PostgreSQL, protects dashboard access with secure session authentication, and surfaces funnel and product insights in a clean React dashboard.

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
- Secure fixed-admin login, logout, and session-based dashboard access using httpOnly cookies
- Idempotent event ingestion with optional `eventId` deduplication
- Analytics filtered by time window
- Dockerfiles for backend and dashboard
- `compose.yaml` for end-to-end local deployment with PostgreSQL
- GitHub Actions CI for backend tests and dashboard builds
- Shopify custom pixel integration for production-safe event delivery

## Local development

### Backend

1. Open [backend](/Users/surajsingh/Desktop/ConversionLens/backend).
2. Copy `.env.example` to `.env`.
3. Add your PostgreSQL connection string.
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
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
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

## Authentication

- The app uses one fixed admin account for dashboard access
- Login creates a secure server-side session
- The backend stores only a hashed session token and sends the real token as an `httpOnly` cookie
- Dashboard analytics endpoints are protected and require an authenticated session
- `POST /track-event`, `GET /healthz`, and `GET /readyz` remain public for Shopify ingestion and platform health checks

### Fixed admin credentials

```text
Email: admin@Shoplytics.com
Password: Suraj@123
```

### Login payload

```json
{
  "email": "admin@Shoplytics.com",
  "password": "Suraj@123"
}
```

## Production deployment with Docker

1. Copy [backend/.env.production.example](/Users/surajsingh/Desktop/ConversionLens/backend/.env.production.example) to `backend/.env.production`.
2. Set a real production PostgreSQL connection string and trusted frontend origin.
3. Start the stack:

```bash
docker compose up --build
```

The production dashboard will be available on `http://localhost:8080`.

## Railway backend deployment

The backend is ready for Railway in two ways:

- Root deploy from the repo root using [railway.json](/Users/surajsingh/Desktop/ConversionLens/railway.json) and [Dockerfile](/Users/surajsingh/Desktop/ConversionLens/Dockerfile)
- Root-directory deploy from `backend/` using [backend/railway.json](/Users/surajsingh/Desktop/ConversionLens/backend/railway.json)

Use this setup in Railway:

1. Create a new service from the GitHub repo.
2. Simplest option: leave the service at repo root. Railway will use the root [railway.json](/Users/surajsingh/Desktop/ConversionLens/railway.json) automatically.
3. Optional alternative: set the service root directory to `backend` and config path to `/backend/railway.json`.
4. Add a PostgreSQL database in the same Railway project.
5. In backend service variables, set `DATABASE_URL` from the Postgres reference variable.
6. Set `CORS_ORIGIN=https://conversionlens.vercel.app`.
7. Set `TRUST_PROXY=true`.
8. Keep the healthcheck path as `/readyz`.
9. Generate a public Railway domain for the backend service.

If your current Railway service already failed from the root like in your screenshot, you can now simply click redeploy after pulling the latest GitHub commit. No root-directory change is required for the root deploy path anymore.

Recommended Railway variables:

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATABASE_SSL=false
DATABASE_MAX_POOL_SIZE=20
CORS_ORIGIN=https://conversionlens.vercel.app
TRUST_PROXY=true
AUTH_COOKIE_NAME=shoplytics_session
AUTH_SESSION_DAYS=1
ADMIN_EMAIL=admin@Shoplytics.com
ADMIN_PASSWORD=Suraj@123
ADMIN_NAME=Shoplytics Admin
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=500
DEFAULT_WINDOW_DAYS=30
```

After Railway gives you the backend URL, point the frontend's same-origin `/api/*` proxy to that backend. This repo includes a Vercel function proxy in [dashboard/api/[...path].js](/Users/surajsingh/Desktop/ConversionLens/dashboard/api/[...path].js) and defaults it to `https://conversionlens-production.up.railway.app`.

If your Railway URL changes, set this Vercel environment variable:

```env
RAILWAY_BACKEND_URL=https://your-backend.up.railway.app
```

Important note for auth:

- Production auth should use same-origin `/api` calls through Vercel so session cookies stay first-party
- `CORS_ORIGIN` must still exactly match your deployed frontend origin for direct backend checks and non-proxied access
- The frontend keeps calling the API with `credentials: include`, which is already implemented in this repo

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

- Secure auth: fixed-admin login, logout, and protected dashboard access
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
