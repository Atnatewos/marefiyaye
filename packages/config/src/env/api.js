/**
 * @file packages/config/src/env/api.js
 *
 * Runtime environment accessor for `apps/api`.
 *
 * Why this file exists:
 *   - Backend modules must never read `process.env.X` directly — they import `apiEnv`.
 *   - Validation happens exactly once at boot; misconfiguration fails fast.
 *   - Secrets are centralized so audits only need to inspect this file.
 *   - Dynamically resolves frontend URLs for CORS to support zero-config deployments.
 *
 * Contract: any module that needs a config value imports it from here.
 * Never read process.env in application code.
 */

import { apiEnvSchema, validateEnv } from '../validation/schemas.js';

/**
 * Dynamically resolves the Public Web URL for CORS.
 * 
 * Resolution order:
 * 1. Explicit `PUBLIC_WEB_URL` environment variable.
 * 2. Vercel System Environment Variables (auto-detect deployment URL).
 * 3. Localhost fallback for local development.
 * 
 * @returns {string} The fully qualified frontend URL.
 */
function resolvePublicWebUrl() {
  if (process.env.PUBLIC_WEB_URL) return process.env.PUBLIC_WEB_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

/**
 * Dynamically resolves the Admin Web URL for CORS.
 * Defaults to the Public Web URL if not explicitly set.
 * 
 * @returns {string} The fully qualified admin frontend URL.
 */
function resolveAdminWebUrl() {
  if (process.env.ADMIN_WEB_URL) return process.env.ADMIN_WEB_URL;
  return resolvePublicWebUrl();
}

/**
 * Validated, frozen backend configuration.
 *
 * Reading this object is safe everywhere in the API. Because it is frozen,
 * downstream code cannot accidentally overwrite a value at runtime.
 */
const rawApiEnv = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,

  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_DIRECT_URL: process.env.DATABASE_DIRECT_URL,

  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  ADMIN_JWT_EXPIRES_IN: process.env.ADMIN_JWT_EXPIRES_IN,

  PUBLIC_WEB_URL: resolvePublicWebUrl(),
  ADMIN_WEB_URL: resolveAdminWebUrl(),

  EXCHANGE_RATE_ETB_PER_USD: process.env.EXCHANGE_RATE_ETB_PER_USD,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  LOG_LEVEL: process.env.LOG_LEVEL,

  ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL,
};

/**
 * Parsed and validated env object.
 * Throws at import time if any required variable is missing or malformed.
 */
export const apiEnv = Object.freeze(validateEnv(apiEnvSchema, rawApiEnv, 'apps/api'));

/**
 * Returns `true` when running in production.
 * Centralized so that string comparisons on `apiEnv.NODE_ENV` are not repeated
 * throughout the codebase.
 */
export function isProduction() {
  return apiEnv.NODE_ENV === 'production';
}

/**
 * Returns `true` when running in development.
 */
export function isDevelopment() {
  return apiEnv.NODE_ENV === 'development';
}