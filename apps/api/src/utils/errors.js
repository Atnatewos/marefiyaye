/**
 * @file apps/api/src/utils/errors.js
 *
 * Typed error hierarchy for the API.
 *
 * Why this file exists:
 *   - Throwing plain Error gives no HTTP status and no structured payload.
 *   - Typed errors (ApiError, ValidationError, etc.) let middleware map
 *     every error to a correct HTTP status code automatically.
 *   - Frontend consumers get a consistent shape: { error: { message, code, details } }.
 *
 * Usage:
 *   throw new NotFoundError('Property');
 *   throw new ValidationError('Invalid FT reference', { field: 'reference' });
 *   throw new UnauthorizedError('Session expired');
 */

/**
 * Base API error — every custom error extends this.
 * The Express error handler recognizes it by `instanceof ApiError`.
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (400, 401, 403, 404, 409, 429, 500, ...)
   * @param {string} message - Human-readable message safe to show to the client.
   * @param {object} [details=null] - Optional structured context (field name, etc.).
   */
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 — Client sent malformed or semantically invalid data.
 */
export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', details = null) {
    super(400, message, details);
    this.name = 'ValidationError';
  }
}

/**
 * 401 — Client is not authenticated (no valid token).
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * 403 — Client is authenticated but lacks permission for this resource.
 */
export class ForbiddenError extends ApiError {
  constructor(message = 'You do not have permission to perform this action') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

/**
 * 404 — Requested resource does not exist.
 * Constructed with the resource name: `new NotFoundError('Property')`.
 */
export class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(404, `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

/**
 * 409 — Request conflicts with current state (e.g. double-booking, duplicate email).
 */
export class ConflictError extends ApiError {
  constructor(message = 'Resource already exists or conflicts with current state', details = null) {
    super(409, message, details);
    this.name = 'ConflictError';
  }
}

/**
 * 429 — Client exceeded rate limit.
 */
export class TooManyRequestsError extends ApiError {
  constructor(message = 'Too many requests, please try again later') {
    super(429, message);
    this.name = 'TooManyRequestsError';
  }
}

/**
 * 500 — Unexpected server error. Never leak internals to the client.
 * The error handler logs full details but returns a generic message.
 */
export class InternalError extends ApiError {
  constructor(message = 'Internal server error', details = null) {
    super(500, message, details);
    this.name = 'InternalError';
    this.isOperational = false;
  }
}