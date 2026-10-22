/**
 * @file apps/api/src/middleware/roleGuard.js
 *
 * Role-based access control middleware.
 *
 * Why this file exists:
 *   - Some endpoints are restricted to HOST or GUEST roles.
 *   - `roleGuard` runs AFTER `authGuard` and checks `req.user.role`.
 *   - Admin routes should use `adminAuthGuard` instead — they use a separate secret.
 *
 * Usage:
 *   router.post('/properties', authGuard, roleGuard('HOST', 'ADMIN'), createHandler);
 */

import { ForbiddenError } from '../utils/errors.js';

/**
 * Factory that returns middleware restricting access to the given roles.
 *
 * @param {...string} allowedRoles - Roles permitted (e.g. 'HOST', 'GUEST', 'ADMIN').
 * @returns {import('express').RequestHandler}
 */
export function roleGuard(...allowedRoles) {
  return function roleGuardMiddleware(req, res, next) {
    if (!req.user) {
      next(new ForbiddenError('Authentication required before role check'));
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError(`This action requires one of: ${allowedRoles.join(', ')}`));
      return;
    }
    next();
  };
}