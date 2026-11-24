/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Centralized Error Handler
 * Path: apps/api/src/middleware/error.middleware.js
 *
 * Purpose:
 *   Catches every error thrown or passed to `next(err)` and responds with
 *   a consistent JSON envelope. Recognizes (in priority order):
 *     1. ZodError               → 400 validation
 *     2. AppError               → status + code from the error
 *     3. Plain Error with .status → status + code from the error
 *     4. Multer errors          → 400 / 413 based on code
 *     5. JWT errors             → 401
 *     6. Postgres errors        → 400/409 based on code
 *     7. Anything else          → 500 (message hidden in production)
 *
 *   Always logs the error through the structured logger.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ZodError } from 'zod';
import { fail } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import config from '../config/env.js';

/* ── Custom AppError ─────────────────────────────────────────────────────── */

/**
 * Application-level error with HTTP status and machine code.
 * Throw this from services / controllers for expected failures.
 */
export class AppError extends Error {
  /**
   * @param {object} params
   * @param {number} params.status
   * @param {string} params.code
   * @param {string} params.message
   * @param {*} [params.details]
   */
  constructor({ status, code, message, details }) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/* ── Handler ─────────────────────────────────────────────────────────────── */

/**
 * @param {Error & { status?: number, code?: string, details?: any }} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
export function errorHandler(err, req, res, _next) {
  const requestMeta = {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  };

  /* ── Zod validation errors ── */
  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    logger.warn('[error] validation failed', { ...requestMeta, field: firstIssue?.path });
    return fail(res, {
      status: 400,
      code: 'validation.failed',
      message: firstIssue?.message || 'errors.validation',
      field: firstIssue?.path?.join('.'),
      details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
  }

  /* ── AppError ── */
  if (err instanceof AppError) {
    logger.warn(`[error] app error: ${err.code}`, { ...requestMeta, status: err.status });
    return fail(res, {
      status: err.status,
      code: err.code,
      message: err.message,
      details: err.details,
    });
  }

  /* ── Plain Error with .status (middleware-thrown) ── */
  if (typeof err.status === 'number' && typeof err.code === 'string') {
    logger.warn(`[error] ${err.code}`, { ...requestMeta, status: err.status });
    return fail(res, {
      status: err.status,
      code: err.code,
      message: err.message || 'errors.generic',
      details: err.details,
    });
  }

  /* ── Multer file errors ── */
  if (err.code === 'LIMIT_FILE_SIZE') {
    logger.warn('[error] upload too large', requestMeta);
    return fail(res, {
      status: 413,
      code: 'upload.too_large',
      message: 'errors.upload.tooLarge',
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    logger.warn('[error] unexpected file field', requestMeta);
    return fail(res, {
      status: 400,
      code: 'upload.unexpected_file',
      message: 'errors.upload.invalidType',
    });
  }

  /* ── JWT errors ── */
  if (err.name === 'JsonWebTokenError') {
    logger.warn('[error] invalid JWT', requestMeta);
    return fail(res, {
      status: 401,
      code: 'auth.invalid_token',
      message: 'errors.auth.tokenInvalid',
    });
  }

  if (err.name === 'TokenExpiredError') {
    logger.warn('[error] expired JWT', requestMeta);
    return fail(res, {
      status: 401,
      code: 'auth.token_expired',
      message: 'errors.auth.refreshExpired',
    });
  }

  /* ── Postgres errors ── */
  if (err.code === '23505') {
    logger.warn('[error] db unique violation', requestMeta);
    return fail(res, {
      status: 409,
      code: 'db.unique_violation',
      message: 'errors.conflict',
    });
  }

  if (err.code === '23503') {
    logger.warn('[error] db foreign key violation', requestMeta);
    return fail(res, {
      status: 400,
      code: 'db.foreign_key',
      message: 'errors.validation',
    });
  }

  if (err.code === '22P02') {
    logger.warn('[error] db invalid input syntax', requestMeta);
    return fail(res, {
      status: 400,
      code: 'validation.failed',
      message: 'errors.validation',
    });
  }

  /* ── Unknown / unhandled ── */
  logger.error('[error] unhandled exception', { ...requestMeta, error: err });

  return fail(res, {
    status: 500,
    code: 'server_error',
    message: 'errors.generic',
    details: config.app.isProd ? undefined : { stack: err?.stack },
  });
}

export default errorHandler;