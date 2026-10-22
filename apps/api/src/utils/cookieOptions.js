/**
 * @file apps/api/src/utils/cookieOptions.js
 *
 * Cookie helpers for auth tokens.
 *
 * Why this file exists:
 *   - Guest token and admin token use different cookie names.
 *   - All cookie attributes come from `COOKIE_OPTIONS` (httpOnly, secure,
 *     sameSite, path) so signer and verifier cannot drift.
 *   - Production vs development `secure` flag differs — this file handles it.
 *
 * Contract: auth controllers import setGuestCookie / setAdminCookie /
 * clearGuestCookie / clearAdminCookie — never set cookies directly.
 */

import { JWT_CONFIG } from '@marefiyaye/config/security';
import { apiEnv, isProduction } from '../config/env.js';

/**
 * Computes the effective cookie options.
 * In development (http://localhost) `secure: true` breaks the cookie — flip
 * to false so the browser accepts it.
 */
function buildCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
  };
}

/**
 * Sets the guest/host auth cookie.
 *
 * @param {import('express').Response} res
 * @param {string} token
 * @param {string} expiresIn - e.g. '7d'
 */
export function setGuestCookie(res, token, expiresIn) {
  const opts = buildCookieOptions();
  // Express cookie maxAge expects milliseconds
  if (expiresIn) {
    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    if (match) {
      const value = Number(match[1]);
      const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2]];
      opts.maxAge = value * unitMs;
    }
  }
  res.cookie(JWT_CONFIG.guestCookieName, token, opts);
}

/**
 * Sets the admin auth cookie.
 *
 * @param {import('express').Response} res
 * @param {string} token
 * @param {string} expiresIn
 */
export function setAdminCookie(res, token, expiresIn) {
  const opts = buildCookieOptions();
  if (expiresIn) {
    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    if (match) {
      const value = Number(match[1]);
      const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2]];
      opts.maxAge = value * unitMs;
    }
  }
  res.cookie(JWT_CONFIG.adminCookieName, token, opts);
}

/**
 * Clears the guest cookie.
 */
export function clearGuestCookie(res) {
  res.clearCookie(JWT_CONFIG.guestCookieName, buildCookieOptions());
}

/**
 * Clears the admin cookie.
 */
export function clearAdminCookie(res) {
  res.clearCookie(JWT_CONFIG.adminCookieName, buildCookieOptions());
}