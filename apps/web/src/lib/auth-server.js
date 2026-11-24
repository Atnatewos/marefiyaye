/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Server-Side Fetch Helper
 * Path: apps/web/src/lib/auth-server.js
 *
 * Purpose:
 *   Server Components and Route Handlers do not use `lib/api.js` — cookies
 *   must be forwarded manually via `next/headers`. This module:
 *     - Reads the auth cookies from the incoming request
 *     - Forwards them to the API
 *     - Returns the parsed envelope
 *
 *   If the API returns 401, we do NOT attempt refresh — the server cannot
 *   safely rotate refresh tokens mid-render (would break the client's
 *   cookie state). Instead, Server Components return `{ user: null }` and
 *   the client-side AuthContext handles refresh.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { cookies } from 'next/headers';
import { env } from './env.js';

/* ── Cookie names (must match API `COOKIE_NAMES`) ────────────────────────── */

const ACCESS_COOKIE = 'mrf_access';
const REFRESH_COOKIE = 'mrf_refresh';

/**
 * Builds a Cookie header string from the incoming Next.js request.
 *
 * @returns {Promise<string>}
 */
export async function buildCookieHeader() {
  const cookieStore = await cookies();
  const pairs = [];

  const access = cookieStore.get(ACCESS_COOKIE)?.value;
  const refresh = cookieStore.get(REFRESH_COOKIE)?.value;

  if (access) pairs.push(`${ACCESS_COOKIE}=${access}`);
  if (refresh) pairs.push(`${REFRESH_COOKIE}=${refresh}`);

  return pairs.join('; ');
}

/**
 * Fetches the current user from the API using the incoming request's cookies.
 * Returns `null` if not authenticated. Safe to call in any Server Component.
 *
 * @returns {Promise<{ user: object|null, impersonatedBy: string|null }>}
 */
export async function getCurrentUser() {
  const cookieHeader = await buildCookieHeader();
  if (!cookieHeader) return { user: null, impersonatedBy: null };

  try {
    const res = await fetch(`${env.apiBaseUrl}/auth/me`, {
      headers: { Cookie: cookieHeader },
      cache: 'no-store',
    });

    if (!res.ok) return { user: null, impersonatedBy: null };

    const parsed = await res.json();
    if (!parsed?.success) return { user: null, impersonatedBy: null };

    return {
      user: parsed.data.user || null,
      impersonatedBy: parsed.data.impersonatedBy || null,
    };
  } catch {
    return { user: null, impersonatedBy: null };
  }
}

/**
 * Server-side fetch with cookies forwarded. Used by Server Components to
 * read private data (bookings, favorites, notifications).
 *
 * @param {string} path
 * @param {RequestInit} [options]
 * @returns {Promise<{ data?: any, error?: { code: string, message: string } }>}
 */
export async function serverFetch(path, options = {}) {
  const cookieHeader = await buildCookieHeader();

  try {
    const res = await fetch(`${env.apiBaseUrl}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        ...options.headers,
      },
      cache: options.cache || 'no-store',
    });

    const parsed = await res.json().catch(() => null);
    if (!res.ok || parsed?.success === false) {
      return {
        error: parsed?.error || { code: 'response.error', message: 'errors.generic' },
      };
    }
    return { data: parsed?.data, meta: parsed?.meta };
  } catch (err) {
    return {
      error: { code: 'network.error', message: 'errors.network', details: err?.message },
    };
  }
}