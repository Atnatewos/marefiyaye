/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Client API Wrapper
 * Path: apps/web/src/lib/api.js
 *
 * Purpose:
 *   Every client-side fetch to the API goes through here. Handles:
 *     - Cookie-based auth (credentials: 'include')
 *     - JSON parsing of the { success, data, error } envelope
 *     - 401 auto-refresh (single retry after POST /auth/refresh)
 *     - Structured ApiError with code / message / field / status
 *     - AbortController support for cancellable requests
 *
 *   Server Components DO NOT use this file — they call the API directly
 *   via `auth-server.js`. This file is for `'use client'` components only.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { env } from './env.js';

/* ── Error type ──────────────────────────────────────────────────────────── */

/**
 * Structured API error — always carries a machine code and an i18n key.
 */
export class ApiError extends Error {
  constructor({ status, code, message, field, details }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.field = field;
    this.details = details;
  }
}

/* ── Core fetch ──────────────────────────────────────────────────────────── */

let refreshing = null;

/**
 * Attempts to refresh the access token. Concurrent requests share the same
 * refresh call — no thundering herd.
 *
 * @returns {Promise<boolean>}
 */
async function attemptRefresh() {
  if (refreshing) return refreshing;

  refreshing = (async () => {
    try {
      const res = await fetch(`${env.apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      return res.ok;
    } catch {
      return false;
    }
  })();

  try {
    return await refreshing;
  } finally {
    refreshing = null;
  }
}

/**
 * Performs a single request. Handles JSON parsing, envelope unwrapping,
 * and structured errors.
 *
 * @param {string} path  — e.g. "/listings" or "/bookings/quote"
 * @param {RequestInit & { json?: object }} [options]
 * @param {boolean} [retryOn401=true] — internal
 * @returns {Promise<{ data: any, meta?: object }>}
 */
async function request(path, options = {}, retryOn401 = true) {
  const url = `${env.apiBaseUrl}${path}`;

  const fetchOptions = {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body || options.json ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    ...options,
    body: options.json ? JSON.stringify(options.json) : options.body,
  };

  /* Clean the shorthand key so it never reaches fetch() */
  delete fetchOptions.json;

  let res;
  try {
    res = await fetch(url, fetchOptions);
  } catch (err) {
    throw new ApiError({
      status: 0,
      code: 'network.error',
      message: 'errors.network',
      details: { cause: err?.message },
    });
  }

  /* ── 401 with refresh fallback ── */
  if (res.status === 401 && retryOn401) {
    const refreshed = await attemptRefresh();
    if (refreshed) {
      return request(path, options, false);
    }
  }

  /* ── Parse envelope ── */
  let parsed = null;
  try {
    parsed = await res.json();
  } catch {
    /* Non-JSON response — treat as raw status */
    throw new ApiError({
      status: res.status,
      code: 'response.invalid',
      message: 'errors.unknown',
    });
  }

  if (!res.ok || parsed?.success === false) {
    const err = parsed?.error || {};
    throw new ApiError({
      status: res.status,
      code: err.code || 'response.error',
      message: err.message || 'errors.generic',
      field: err.field,
      details: err.details,
    });
  }

  return {
    data: parsed.data,
    meta: parsed.meta,
  };
}

/* ── Public helpers ──────────────────────────────────────────────────────── */

export const api = Object.freeze({
  get: (path, opts = {}) => request(path, { ...opts, method: 'GET' }),
  post: (path, json, opts = {}) => request(path, { ...opts, method: 'POST', json }),
  patch: (path, json, opts = {}) => request(path, { ...opts, method: 'PATCH', json }),
  put: (path, json, opts = {}) => request(path, { ...opts, method: 'PUT', json }),
  delete: (path, opts = {}) => request(path, { ...opts, method: 'DELETE' }),
});

export default api;