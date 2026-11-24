/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Authentication Middleware
 * Path: apps/api/src/middleware/auth.middleware.js
 *
 * Purpose:
 *   Verifies the access token on protected routes. Reads the token from:
 *     1. `Authorization: Bearer <token>` header (mobile / bot clients)
 *     2. `mrf_access` httpOnly cookie (web clients)
 *
 * On success, attaches a normalized principal to `req.user`:
 *     { id, role, impersonatedBy }
 *
 * On failure, throws a JsonWebTokenError which is mapped to 401 by the
 * centralized error handler — no direct response writing here.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { verifyAccessToken } from '../utils/jwt.js';
import { COOKIE_NAMES } from '../config/constants.js';

/**
 * Extracts the access token from the request.
 * @param {import('express').Request} req
 * @returns {string|null}
 */
function extractToken(req) {
  const authHeader = req.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim();
  }

  if (req.cookies && req.cookies[COOKIE_NAMES.ACCESS_TOKEN]) {
    return req.cookies[COOKIE_NAMES.ACCESS_TOKEN];
  }

  return null;
}

/**
 * Requires a valid access token. Populates `req.user`.
 * Throws if the token is missing or invalid.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} _res
 * @param {import('express').NextFunction} next
 */
export function requireAuth(req, _res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      const err = new Error('Missing access token');
      err.name = 'JsonWebTokenError';
      throw err;
    }

    const decoded = verifyAccessToken(token);

    req.user = {
      id: decoded.sub,
      role: decoded.role,
      impersonatedBy: decoded.impersonatedBy || null,
    };

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Attaches `req.user` IF a valid token is present, but never throws.
 * Used on public routes that personalize their output for logged-in users
 * (e.g. listing detail shows "Saved" state).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} _res
 * @param {import('express').NextFunction} next
 */
export function optionalAuth(req, _res, next) {
  try {
    const token = extractToken(req);
    if (!token) return next();
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      impersonatedBy: decoded.impersonatedBy || null,
    };
  } catch {
    /* Silent — public route continues unauthenticated */
  }
  next();
}

export default Object.freeze({ requireAuth, optionalAuth });