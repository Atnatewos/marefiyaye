/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — API Proxy Bridge (Pattern A)
 * Path: apps/web/src/app/api/v1/[...path]/route.js
 *
 * Purpose:
 *   Next.js App Router catch-all that forwards every `/api/v1/*` request
 *   to the Express handler (via serverless-http). In local development,
 *   requests go directly to `http://localhost:5000` — this file is bypassed.
 *
 *   On Vercel, both web and api run in the same project; the web app is the
 *   single public entry, and this route serves the Express API under the
 *   same origin. No CORS, no separate deployment, no config drift.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* ── Lazy-load serverless-http + Express app ─────────────────────────────── */

let cachedHandler = null;

async function getApiHandler() {
  if (cachedHandler) return cachedHandler;

  const [{ default: serverless }, { default: app }] = await Promise.all([
    import('serverless-http'),
    import('@marefiyaye/api/src/app.js'),
  ]);

  cachedHandler = serverless(app);
  return cachedHandler;
}

/* ── Next.js API route handlers ──────────────────────────────────────────── */

async function forward(request, context) {
  const handler = await getApiHandler();
  return handler(request, context);
}

export async function GET(request, context) {
  return forward(request, context);
}

export async function POST(request, context) {
  return forward(request, context);
}

export async function PUT(request, context) {
  return forward(request, context);
}

export async function PATCH(request, context) {
  return forward(request, context);
}

export async function DELETE(request, context) {
  return forward(request, context);
}

export async function OPTIONS(request, context) {
  return forward(request, context);
}