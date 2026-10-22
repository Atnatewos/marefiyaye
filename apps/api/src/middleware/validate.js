/**
 * @file apps/api/src/middleware/validate.js
 *
 * Request body validation middleware.
 *
 * Why this file exists:
 *   - Every POST/PATCH endpoint must validate its body BEFORE the handler runs.
 *   - Centralizing the middleware keeps handlers focused on business logic.
 *   - Zod's `.parse()` returns TRANSFORMED data — so `email` is trimmed and
 *     lowercased by the time handlers see it, without repeating that logic.
 *
 * Usage:
 *   router.post('/login', validate(loginSchema), loginHandler);
 */

import { ValidationError } from '../utils/errors.js';

/**
 * Factory returning an Express middleware that validates `req.body`.
 *
 * @param {import('zod').ZodSchema} schema
 * @returns {import('express').RequestHandler}
 */
export function validate(schema) {
  return function validateMiddleware(req, res, next) {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fieldErrors = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      const message = fieldErrors[0]?.message || 'Invalid request body';
      next(new ValidationError(message, { fields: fieldErrors }));
      return;
    }
    // Replace body with parsed and transformed data
    req.body = result.data;
    next();
  };
}