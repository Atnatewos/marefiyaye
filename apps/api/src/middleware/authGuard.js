/**
 * @file apps/api/src/middleware/authGuard.js
 *
 * JWT authentication middleware.
 *
 * Why this file exists:
 *   - Every protected endpoint must verify the JWT before running its handler.
 *   - Two variants:
 *       authGuard      — requires any valid guest/host token
 *       adminAuthGuard — requires a valid ADMIN token (separate secret)
 *   - Attaches `req.user` (payload) so downstream handlers know WHO is calling.
 *
 * Usage:
 *   router.get('/bookings/mine', authGuard, getMyBookingsHandler);
 *   router.post('/admin/payments/:id/verify', adminAuthGuard, verifyHandler);
 */

/**
 * @file apps/api/src/middleware/authGuard.js
 *
 * Authentication middleware.
 *
 * Why this file exists:
 *   - Protects routes by verifying the JWT cookie.
 *   - Distinguishes between guest/host (authGuard) and admin (adminAuthGuard).
 *   - Attaches `req.user` to the request for downstream controllers.
 */

import { verifyToken, verifyAdminToken, JWT_CONFIG, ADMIN_JWT_CONFIG } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';

/**
 * Middleware for guest/host routes.
 * Expects the `token` cookie.
 */
export function authGuard(req, res, next) {
  const token = req.cookies?.[JWT_CONFIG.cookieName];
  if (!token) {
    return next(new UnauthorizedError('Authentication required'));
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * Middleware for admin routes.
 * Expects the `admin_token` cookie.
 */
export function adminAuthGuard(req, res, next) {
  const token = req.cookies?.[ADMIN_JWT_CONFIG.cookieName];
  if (!token) {
    return next(new UnauthorizedError('Admin authentication required'));
  }

  try {
    const payload = verifyAdminToken(token);
    req.user = payload;
    return next();
  } catch (error) {
    return next(error);
  }
}