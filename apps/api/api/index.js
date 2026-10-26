/**
 * @file apps/api/api/index.js
 *
 * Vercel serverless handler.
 *
 * Why this file exists:
 *   - Vercel does NOT run `app.listen(port)`. It imports an async function
 *     that receives `(req, res)` and must send a response.
 *   - This file wraps the existing Express app (createApp()) into that
 *     handler shape, so the same routes/services run identically on
 *     serverless and local.
 *   - `loadEnv.js` runs first to read `.env.local` locally OR the
 *     env vars Vercel injects in production.
 *
 * Contract: Vercel calls `handler(req, res)` for every request that
 * matches `apps/api/vercel.json` routes. The handler never throws —
 * it lets Express handle errors through the existing error middleware.
 */

import '../../src/utils/loadEnv.js';
import { createApp } from '../../src/app.js';

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
  // Vercel's routing can sometimes strip the /api prefix depending on 
  // how the rewrites are configured or if zero-config is used. 
  // Express expects /api to be present because of `app.use('/api', routes)` in app.js.
  // This ensures the URL is always correctly formatted for Express routing.
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url}`;
  }
  
  return app(req, res);
}