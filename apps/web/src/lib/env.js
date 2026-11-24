/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Env Loader
 * Path: apps/web/src/lib/env.js
 *
 * Purpose:
 *   Single source of truth for client-safe environment variables. The only
 *   file in the web app that touches `process.env`.
 *
 *   Values are read at build time by Next.js (NEXT_PUBLIC_* is inlined).
 *   Do NOT read secrets here — anything exported here is visible in the
 *   browser bundle.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* ── Read + validate ─────────────────────────────────────────────────────── */

const rawApiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
const rawAppName = process.env.NEXT_PUBLIC_APP_NAME || 'MAREFIYAYE';
const rawAppNameAm = process.env.NEXT_PUBLIC_APP_NAME_AM || 'ማረፊያዬ';
const rawDefaultLang = process.env.NEXT_PUBLIC_DEFAULT_LANG || 'en';
const rawCloudinaryCloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

/* ── In development, Next.js runs on :3000 while the API runs on :5000.
      Fetch from the API directly. In production, both live behind one
      origin, so `/api/v1` works without CORS. */
const isDev = process.env.NODE_ENV === 'development';

function resolveApiBase() {
  if (isDev && rawApiBase.startsWith('/')) {
    /* Dev: forward to the standalone Express server */
    return 'http://localhost:5000/api/v1';
  }
  return rawApiBase;
}

/* ── Frozen export ───────────────────────────────────────────────────────── */

export const env = Object.freeze({
  apiBaseUrl: resolveApiBase(),
  isDev,
  appName: rawAppName,
  appNameAm: rawAppNameAm,
  defaultLanguage: rawDefaultLang,
  cloudinaryCloudName: rawCloudinaryCloud,
});

export default env;