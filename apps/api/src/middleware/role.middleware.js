/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Role-Based Access Control
 * Path: apps/api/src/middleware/role.middleware.js
 *
 * Purpose:
 *   Guards routes by role. Always used AFTER `requireAuth` so `req.user`
 *   is populated. `super_admin` implicitly passes any `admin` check.
 *
 * Error contract:
 *   Throws an Error with `status` and `code` populated so the centralized
 *   error handler emits a proper JSON envelope (403 forbidden, not 500).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ROLES } from '@marefiyaye/shared/constants';

/**
 * Returns true if `role` satisfies `requiredRoles`.
 * super_admin is a superset of admin.
 *
 * @param {string} role
 * @param {string[]} requiredRoles
 * @returns {boolean}
 */
function roleSatisfies(role, requiredRoles) {
  if (requiredRoles.includes(role)) return true;
  if (role === ROLES.SUPER_ADMIN && requiredRoles.includes(ROLES.ADMIN)) return true;
  return false;
}

/**
 * Middleware factory: requires the authenticated user to have one of the
 * given roles.
 *
 * @param {...string} requiredRoles
 * @returns {import('express').RequestHandler}
 */
export function requireRole(...requiredRoles) {
  return function roleGuard(req, _res, next) {
    if (!req.user) {
      const err = new Error('[requireRole] used without requireAuth');
      err.status = 500;
      err.code = 'server_error';
      return next(err);
    }

    if (!roleSatisfies(req.user.role, requiredRoles)) {
      const err = new Error('errors.forbidden');
      err.status = 403;
      err.code = 'forbidden';
      err.details = { requiredRoles, actualRole: req.user.role };
      return next(err);
    }

    next();
  };
}

/**
 * Shorthand guards.
 */
export const requireAdmin = requireRole(ROLES.ADMIN);
export const requireSuperAdmin = requireRole(ROLES.SUPER_ADMIN);
export const requireHost = requireRole(ROLES.HOST, ROLES.ADMIN);

export default Object.freeze({
  requireRole,
  requireAdmin,
  requireSuperAdmin,
  requireHost,
});