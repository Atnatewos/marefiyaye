/**
 * @file packages/config/src/env/web.js
 *
 * Runtime environment accessor for `apps/web`.
 *
 * Why this file exists:
 *   - Frontend code must never read `process.env.X` directly.
 *   - `NEXT_PUBLIC_*` values are inlined into the client bundle — validated here once.
 *   - Server-only values (`ADMIN_JWT_SECRET`) must never reach a browser context;
 *     this file enforces that by throwing if the server accessor is called client-side.
 *
 * Contract: import `webEnv` for public config, `getServerEnv()` for server-only config.
 */

import { webPublicEnvSchema, webServerEnvSchema, validateEnv } from '../validation/schemas.js';

/**
 * Detects whether the current execution environment is the browser.
 * The check must be defensive because Next.js bundles this module for both runtimes.
 */
function isBrowser() {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

/**
 * Reads raw `NEXT_PUBLIC_*` values from the injected environment.
 *
 * Next.js substitutes `process.env.NEXT_PUBLIC_X` at build time, so these must be
 * referenced literally (not via bracket notation) to survive the substitution pass.
 */
const rawWebEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_NAME_AM: process.env.NEXT_PUBLIC_APP_NAME_AM,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
  NEXT_PUBLIC_DEFAULT_CURRENCY: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY,
};

/**
 * Validated, frozen public configuration.
 * Safe to import in both server and client components.
 */
export const webEnv = Object.freeze(
  validateEnv(webPublicEnvSchema, rawWebEnv, 'apps/web (public)')
);

/**
 * Server-only environment accessor.
 *
 * MUST only be called from:
 *   - `middleware.js`
 *   - Server Components / Server Actions
 *   - Route Handlers
 *
 * If called from the browser, this function throws to prevent silent secret leakage.
 * The returned object is frozen so downstream code cannot mutate secrets.
 */
let serverEnvCache = null;

export function getServerEnv() {
  if (isBrowser()) {
    throw new Error(
      'getServerEnv() must never be called from the browser. ' +
        'Server-only secrets are not available client-side by design.'
    );
  }

  if (serverEnvCache) {
    return serverEnvCache;
  }

  serverEnvCache = Object.freeze(
    validateEnv(
      webServerEnvSchema,
      { ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET },
      'apps/web (server-only)'
    )
  );

  return serverEnvCache;
}