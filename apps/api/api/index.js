/**
 * @file apps/api/api/index.js
 *
 * Vercel serverless handler for the exact `/api` path.
 *
 * Why this file exists:
 *   - Vercel does NOT run `app.listen(port)`. It imports a handler that
 *     receives `(req, res)` and must send a response.
 *   - This file wraps the existing Express app (createApp()) into that
 *     handler shape, so the same routes/services run identically on
 *     serverless and local.
 *   - `loadEnv.js` runs first to read `.env.local` locally OR the
 *     env vars Vercel injects in production.
 *
 * Contract: Vercel calls `handler(req, res)` for requests that match the
 * `/api` path exactly. All nested paths (e.g. `/api/health`) are served
 * by the sibling catch-all handler `[...path].js`.
 */

import '../src/utils/loadEnv.js';
import { createApp } from '../src/app.js';

// Create the Express app once per cold start. Vercel reuses the same
// module instance across warm invocations, so we avoid re-creating it
// on every request.
const app = createApp();

/**
 * Vercel serverless handler.
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
export default function handler(req, res) {
  // Safety net: guarantee the /api prefix Express expects is present,
  // regardless of how the edge network normalized the incoming path.
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url}`;
  }

  return app(req, res);
}