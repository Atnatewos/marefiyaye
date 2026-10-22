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

import { JWT_CONFIG } from '@marefiyaye/config/security';
import { verifyGuestToken, verifyAdminToken } from '../utils/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

/**
 * Requires a valid guest/host token.
 * Sets `req.user = { sub, role, ... }` on success.
 */
export function authGuard(req, res, next) {
  try {
    const token = req.cookies?.[JWT_CONFIG.guestCookieName];
    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }
    req.user = verifyGuestToken(token);
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Requires a valid ADMIN token.
 * Uses a separate secret so guest tokens cannot unlock admin endpoints.
 * Sets `req.user = { sub, role: 'ADMIN', ... }` on success.
 */
export function adminAuthGuard(req, res, next) {
  try {
    const token = req.cookies?.[JWT_CONFIG.adminCookieName];
    if (!token) {
      throw new UnauthorizedError('Admin authentication required');
    }
    const payload = verifyAdminToken(token);
    if (payload.role !== 'ADMIN') {
      throw new ForbiddenError('Admin access required');
    }
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}