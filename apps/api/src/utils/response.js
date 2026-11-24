/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Standard Response Envelope
 * Path: apps/api/src/utils/response.js
 *
 * Purpose:
 *   Every controller responds through these helpers so clients always
 *   receive the same JSON shape:
 *
 *     Success:  { success: true,  data: <payload>, meta?: {...} }
 *     Error:    { success: false, error: { code, message, field?, details? } }
 *
 *   `message` is always an i18n key or a plain string — the web client
 *   translates i18n keys via its I18nContext.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Sends a successful response.
 * @param {import('express').Response} res
 * @param {*} data
 * @param {object} [options]
 * @param {number} [options.status=200]
 * @param {object} [options.meta]
 */
export function ok(res, data, { status = 200, meta } = {}) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}

/**
 * Sends a 201 Created response.
 * @param {import('express').Response} res
 * @param {*} data
 */
export function created(res, data) {
  return ok(res, data, { status: 201 });
}

/**
 * Sends a 204 No Content response.
 * @param {import('express').Response} res
 */
export function noContent(res) {
  return res.status(204).end();
}

/**
 * Sends a structured error response.
 * @param {import('express').Response} res
 * @param {object} params
 * @param {number} params.status
 * @param {string} params.code      — e.g. 'validation.failed', 'auth.unauthorized'
 * @param {string} params.message   — i18n key or plain message
 * @param {string} [params.field]   — optional field name for form errors
 * @param {*} [params.details]      — optional extra diagnostics
 */
export function fail(res, { status, code, message, field, details }) {
  const error = { code, message };
  if (field) error.field = field;
  if (details !== undefined) error.details = details;
  return res.status(status).json({ success: false, error });
}

/**
 * Common error shorthands.
 */
export const errors = Object.freeze({
  badRequest: (res, message = 'errors.generic', field) =>
    fail(res, { status: 400, code: 'bad_request', message, field }),

  unauthorized: (res, message = 'errors.unauthorized') =>
    fail(res, { status: 401, code: 'unauthorized', message }),

  forbidden: (res, message = 'errors.forbidden') =>
    fail(res, { status: 403, code: 'forbidden', message }),

  notFound: (res, message = 'errors.notFound') =>
    fail(res, { status: 404, code: 'not_found', message }),

  conflict: (res, message = 'errors.conflict') =>
    fail(res, { status: 409, code: 'conflict', message }),

  rateLimited: (res, message = 'errors.rateLimited') =>
    fail(res, { status: 429, code: 'rate_limited', message }),

  serverError: (res, message = 'errors.generic') =>
    fail(res, { status: 500, code: 'server_error', message }),
});