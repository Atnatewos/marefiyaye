/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — 404 Handler
 * Path: apps/api/src/middleware/notFound.middleware.js
 *
 * Purpose:
 *   Catches any request that did not match a route and returns a consistent
 *   JSON envelope. Must be mounted AFTER all routes, BEFORE error middleware.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { fail } from '../utils/response.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function notFound(req, res) {
  return fail(res, {
    status: 404,
    code: 'not_found',
    message: 'errors.notFound',
    details: { path: req.originalUrl, method: req.method },
  });
}

export default notFound;