/**
 * @file apps/api/src/middleware/errorHandler.js
 *
 * Global Express error handler.
 *
 * Why this file exists:
 *   - Express needs a 4-argument middleware to catch errors from routes.
 *   - Typed errors (ApiError subclasses) map to specific HTTP status codes.
 *   - Unexpected errors log the full stack but return a generic message
 *     to the client (no internal details leaked).
 *
 * Usage (in app.js, AFTER all routes):
 *   app.use(errorHandler);
 *   app.use(notFoundHandler);
 */

import { ApiError, InternalError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { isProduction } from '../config/env.js';

/**
 * Express error handler.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Known, typed error — return its structured payload
  if (err instanceof ApiError) {
    logger.warn(
      { statusCode: err.statusCode, path: req.path, message: err.message },
      'Operational error'
    );
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.name,
        details: err.details || undefined,
      },
    });
    return;
  }

  // Unknown error — log full details, hide internals from client
  logger.error(
    { err, path: req.path, method: req.method },
    'Unhandled error'
  );

  const fallback = new InternalError(
    isProduction() ? 'Internal server error' : err.message
  );

  res.status(fallback.statusCode).json({
    error: {
      message: fallback.message,
      code: fallback.name,
    },
  });
}

/**
 * 404 handler for unmatched routes.
 * Must be registered AFTER all real routes, BEFORE errorHandler.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      message: `Route not found: ${req.method} ${req.path}`,
      code: 'NotFoundError',
    },
  });
}