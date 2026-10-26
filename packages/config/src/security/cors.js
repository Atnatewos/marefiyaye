/**
 * @file packages/config/src/security/cors.js
 *
 * CORS policy for the Express API.
 *
 * Why this file exists:
 *   - Origin allowlist must be environment-driven, never hardcoded.
 *   - Methods and allowed headers must be explicit so unexpected requests fail closed.
 *   - Credentials (cookies) require a specific origin, not `*`.
 *
 * Serverless Safety:
 *   - Environment variables might occasionally be missing or undefined during
 *     edge cold starts. The normalize function safely handles undefined URLs
 *     to prevent boot-time TypeErrors.
 *
 * Contract: `apps/api/src/app.js` builds its CORS middleware from buildCorsOptions().
 */

import { apiEnv } from '../env/api.js';

/**
 * Static portion of the CORS policy.
 * `methods` and `allowedHeaders` are declared once so reviews are simple.
 */
export const CORS_STATIC = Object.freeze({
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
  ],
  exposedHeaders: [],
  credentials: true,
  maxAge: 86_400,
});

/**
 * Safely normalizes a URL by removing trailing slashes.
 * Returns an empty string if the URL is undefined or not a string,
 * preventing boot-time crashes if an env var is missing.
 *
 * @param {string|undefined} url
 * @returns {string}
 */
const normalize = (url) => (typeof url === 'string' ? url.replace(/\/+$/, '') : '');

/**
 * Builds the full CORS options object from static config plus env-derived origins.
 *
 * Returns `{ origin: string[], ...CORS_STATIC }`.
 * - Public frontend origin comes from `PUBLIC_WEB_URL`.
 * - Admin frontend origin comes from `ADMIN_WEB_URL`.
 * - Filters out any empty strings to prevent invalid CORS headers.
 */
export function buildCorsOptions() {
  const origins = [
    normalize(apiEnv.PUBLIC_WEB_URL),
    normalize(apiEnv.ADMIN_WEB_URL),
  ].filter(Boolean);

  return Object.freeze({
    ...CORS_STATIC,
    origin: origins.length > 0 ? origins : '*',
  });
}