/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Validation Middleware
 * Path: apps/api/src/middleware/validate.middleware.js
 *
 * Purpose:
 *   Zod-based request validation middleware for the entire API surface.
 *   Replaces ad-hoc `validateBody` helpers scattered across individual
 *   route files (e.g. banner.routes.js, broadcast.routes.js) with a
 *   single canonical implementation.
 *
 *   Every route handler that touches user input MUST run through one of:
 *     - validateBody(schema)    → validates req.body
 *     - validateQuery(schema)   → validates req.query (Zod-coerced to typed values)
 *     - validateParams(schema)  → validates req.params
 *
 * Design:
 *   - Parsed data is written back to the request property so handlers work
 *     with the transformed value (e.g. strings coerced to numbers), never
 *     with the raw HTTP string form.
 *   - Parse failures throw `ZodError`, which the centralized error handler
 *     (`error.middleware.js`) already knows how to format as 400 with
 *     `validation.failed` code and per-field diagnostics.
 *   - No response writing happens here. Errors bubble up. This keeps the
 *     middleware testable and consistent with the rest of the codebase.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

/* ── Body validation ─────────────────────────────────────────────────────── */

/**
 * Validates and coerces `req.body` against a Zod schema.
 * On success, `req.body` is replaced with the parsed value.
 * On failure, a `ZodError` is forwarded to the centralized error handler.
 *
 * @param {import('zod').ZodTypeAny} schema
 * @returns {import('express').RequestHandler}
 */
export function validateBody(schema) {
  if (!schema || typeof schema.parse !== 'function') {
    throw new Error('[validate.middleware] validateBody requires a Zod schema');
  }

  return function bodyValidator(req, _res, next) {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        logger.warn('[validate] body validation failed', {
          path: req.originalUrl,
          method: req.method,
          issues: err.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }
      next(err);
    }
  };
}

/* ── Query validation ────────────────────────────────────────────────────── */

/**
 * Validates and coerces `req.query` against a Zod schema.
 * On success, `req.query` is replaced with the parsed value (Zod's
 * `z.coerce.number()` will turn `"20"` into `20`).
 *
 * NOTE: Express 5 makes `req.query` a read-only getter. This project uses
 * Express 4 (confirmed in `app.js`), so assignment works. If the project
 * ever migrates to Express 5, replace `req.query = ...` with
 * `Object.assign(req.query, parsed)`.
 *
 * @param {import('zod').ZodTypeAny} schema
 * @returns {import('express').RequestHandler}
 */
export function validateQuery(schema) {
  if (!schema || typeof schema.parse !== 'function') {
    throw new Error('[validate.middleware] validateQuery requires a Zod schema');
  }

  return function queryValidator(req, _res, next) {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        logger.warn('[validate] query validation failed', {
          path: req.originalUrl,
          method: req.method,
          issues: err.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }
      next(err);
    }
  };
}

/* ── Params validation ───────────────────────────────────────────────────── */

/**
 * Validates and coerces `req.params` against a Zod schema.
 * On success, `req.params` is replaced with the parsed value.
 *
 * @param {import('zod').ZodTypeAny} schema
 * @returns {import('express').RequestHandler}
 */
export function validateParams(schema) {
  if (!schema || typeof schema.parse !== 'function') {
    throw new Error('[validate.middleware] validateParams requires a Zod schema');
  }

  return function paramsValidator(req, _res, next) {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        logger.warn('[validate] params validation failed', {
          path: req.originalUrl,
          method: req.method,
          issues: err.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }
      next(err);
    }
  };
}

/* ── Default export ──────────────────────────────────────────────────────── */

export default Object.freeze({
  validateBody,
  validateQuery,
  validateParams,
});