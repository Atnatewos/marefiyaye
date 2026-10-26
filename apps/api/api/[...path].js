/**
 * @file apps/api/api/[...path].js
 *
 * Vercel serverless catch-all handler for every nested API path.
 *
 * Why this file exists:
 *   - Vercel filesystem functions receive the REAL request URL
 *     (e.g. `/api/properties`), unlike internal rewrites which replace
 *     the path with the rewrite destination.
 *   - This catch-all ensures every route defined in Express
 *     (`/api/health`, `/api/bookings`, `/api/admin/...`) is reachable
 *     in production without any rewrite configuration.
 *   - Keeps the same handler contract as `index.js`: wrap createApp()
 *     and forward (req, res) to Express.
 *
 * Contract: Vercel calls `handler(req, res)` for any path deeper than
 * `/api` (e.g. `/api/health`, `/api/admin/payments/5/verify`).
 */

import '../src/utils/loadEnv.js';
import { createApp } from '../src/app.js';

// Create the Express app once per cold start, shared across warm
// invocations of this function instance.
const app = createApp();

/**
 * Vercel serverless catch-all handler.
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