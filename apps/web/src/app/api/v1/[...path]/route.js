// /**
//  * ─────────────────────────────────────────────────────────────────────────────
//  * MAREFIYAYE WEB — API Proxy Bridge (Pattern A)
//  * Path: apps/web/src/app/api/v1/[...path]/route.js
//  *
//  * Purpose:
//  *   Next.js App Router catch-all that forwards every `/api/v1/*` request
//  *   to the Express handler (via serverless-http). In local development,
//  *   requests go directly to `http://localhost:5000` — this file is bypassed.
//  *
//  *   On Vercel, both web and api run in the same project; the web app is the
//  *   single public entry, and this route serves the Express API under the
//  *   same origin. No CORS, no separate deployment, no config drift.
//  * ─────────────────────────────────────────────────────────────────────────────
//  */

// export const runtime = 'nodejs';
// export const dynamic = 'force-dynamic';

// /* ── Lazy-load serverless-http + Express app ─────────────────────────────── */

// let cachedHandler = null;

// async function getApiHandler() {
//   if (cachedHandler) return cachedHandler;

//   const [{ default: serverless }, { default: app }] = await Promise.all([
//     import('serverless-http'),
//     import('@marefiyaye/api/src/app.js'),
//   ]);

//   cachedHandler = serverless(app);
//   return cachedHandler;
// }

// /* ── Next.js API route handlers ──────────────────────────────────────────── */

// async function forward(request, context) {
//   const handler = await getApiHandler();
//   return handler(request, context);
// }

// export async function GET(request, context) {
//   return forward(request, context);
// }

// export async function POST(request, context) {
//   return forward(request, context);
// }

// export async function PUT(request, context) {
//   return forward(request, context);
// }

// export async function PATCH(request, context) {
//   return forward(request, context);
// }

// export async function DELETE(request, context) {
//   return forward(request, context);
// }

// export async function OPTIONS(request, context) {
//   return forward(request, context);
// }













/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — API Proxy Bridge (Pattern A)
 * Path: apps/web/src/app/api/v1/[...path]/route.js
 *
 * Purpose:
 *   Next.js App Router catch-all that forwards every `/api/v1/*` request
 *   to the Express handler via `serverless-http`. In local development,
 *   requests go directly to `http://localhost:5000` and this file is
 *   bypassed by the client wrapper.
 *
 *   On Vercel, the web app is the single public entry point. This route
 *   serves the Express API under the same origin — no CORS, no separate
 *   deployment, no environment variable duplication.
 *
 * Runtime guarantees:
 *   - Express app is imported once per cold start (module-level cache).
 *   - i18n dictionaries are preloaded before the first request is served.
 *   - A lightweight DB health check runs lazily on first request only.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* ── Module-level singleton ──────────────────────────────────────────────── */

/**
 * Cached serverless handler. Initialized once per Node process (per cold
 * start). Subsequent invocations reuse the same Express app + pool.
 *
 * @type {((req: Request, ctx: unknown) => Promise<Response>) | null}
 */
let cachedHandler = null;

/**
 * Cached bootstrap promise so concurrent cold-start requests share the same
 * initialization instead of racing.
 *
 * @type {Promise<...> | null}
 */
let bootstrapPromise = null;

/**
 * One-time initialization of the Express app and its runtime dependencies:
 *   1. Import the Express app (triggers DB pool creation).
 *   2. Preload i18n dictionaries (required for synchronous getTranslator()).
 *   3. Warm the DB pool so the first real request avoids cold-start latency.
 *   4. Wrap the app with serverless-http.
 *
 * @returns {Promise<(req: Request, ctx: unknown) => Promise<Response>>}
 */
async function bootstrap() {
  if (cachedHandler) return cachedHandler;
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const [{ default: serverless }, { default: app }, { preloadDictionaries }, { warmup }] =
      await Promise.all([
        import('serverless-http'),
        import('@marefiyaye/api/src/app.js'),
        import('@marefiyaye/shared/i18n'),
        import('@marefiyaye/api/src/db/pool.js'),
      ]);

    /* Preload i18n before any request can call getTranslator() */
    try {
      await preloadDictionaries();
    } catch (err) {
      console.error('[api-bridge] i18n preload failed', err);
    }

    /* Warm the pool — non-blocking failure is acceptable; queries retry */
    try {
      await warmup();
    } catch (err) {
      console.warn('[api-bridge] pool warmup failed', err);
    }

    cachedHandler = serverless(app);
    return cachedHandler;
  })();

  try {
    return await bootstrapPromise;
  } catch (err) {
    /* Reset so the next request can retry bootstrap */
    bootstrapPromise = null;
    throw err;
  }
}

/* ── Forwarding helper ───────────────────────────────────────────────────── */

/**
 * Forwards an incoming Next.js request to the Express handler.
 *
 * @param {Request} request
 * @param {unknown} context
 * @returns {Promise<Response>}
 */
async function forward(request, context) {
  const handler = await bootstrap();
  return handler(request, context);
}

/* ── Next.js route handlers ──────────────────────────────────────────────── */

export const GET = (request, context) => forward(request, context);
export const POST = (request, context) => forward(request, context);
export const PUT = (request, context) => forward(request, context);
export const PATCH = (request, context) => forward(request, context);
export const DELETE = (request, context) => forward(request, context);
export const OPTIONS = (request, context) => forward(request, context);
export const HEAD = (request, context) => forward(request, context);