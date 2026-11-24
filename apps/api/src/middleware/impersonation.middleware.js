/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Impersonation Guard
 * Path: apps/api/src/middleware/impersonation.middleware.js
 *
 * Purpose:
 *   Enforces policy around impersonation sessions:
 *     - `forbidImpersonation` blocks sensitive endpoints (change password,
 *       delete account) when the caller is impersonating.
 *     - `requireImpersonation` ensures the endpoint is only reachable from
 *       an impersonation session (e.g. "stop" endpoint).
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Rejects the request when the current session is impersonating.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} _res
 * @param {import('express').NextFunction} next
 */
export function forbidImpersonation(req, _res, next) {
  if (req.user?.impersonatedBy) {
    const err = new Error('Impersonation cannot perform this action');
    err.status = 403;
    err.code = 'forbidden';
    return next(err);
  }
  next();
}

/**
 * Rejects the request when the current session is NOT impersonating.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} _res
 * @param {import('express').NextFunction} next
 */
export function requireImpersonation(req, _res, next) {
  if (!req.user?.impersonatedBy) {
    const err = new Error('Not an impersonation session');
    err.status = 400;
    err.code = 'bad_request';
    return next(err);
  }
  next();
}

export default Object.freeze({ forbidImpersonation, requireImpersonation });