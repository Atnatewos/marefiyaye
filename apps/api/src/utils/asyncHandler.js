/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Async Route Wrapper
 * Path: apps/api/src/utils/asyncHandler.js
 *
 * Purpose:
 *   Wraps async Express handlers so rejected promises flow to the
 *   centralized error middleware instead of crashing the process.
 *   Express 4 does not do this automatically — Express 5 does, but we stay
 *   on 4 for ecosystem compatibility.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<*>} fn
 * @returns {import('express').RequestHandler}
 */
export function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default asyncHandler;