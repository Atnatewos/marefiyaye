/**
 * @file apps/api/src/utils/cookieOptions.js
 *
 * Cookie management for authentication.
 *
 * Why this file exists:
 *   - Centralizing cookie options ensures HttpOnly, Secure, and SameSite
 *     are applied consistently.
 *   - Auth (guest/host) and Admin use separate cookies with different secrets.
 */

import { isProduction } from '../config/env.js';
import { JWT_CONFIG, ADMIN_JWT_CONFIG } from './jwt.js';

const isProd = isProduction();

/**
 * Base cookie options shared by both auth types.
 */
const baseOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/',
};

/**
 * Sets the auth cookie for a guest/host session.
 */
export function setAuthCookie(res, token) {
  res.cookie(JWT_CONFIG.cookieName, token, {
    ...baseOptions,
    maxAge: JWT_CONFIG.maxAgeMs,
  });
}

/**
 * Clears the auth cookie.
 */
export function clearAuthCookie(res) {
  res.clearCookie(JWT_CONFIG.cookieName, baseOptions);
}

/**
 * Sets the admin cookie for an admin session.
 */
export function setAdminCookie(res, token) {
  res.cookie(ADMIN_JWT_CONFIG.cookieName, token, {
    ...baseOptions,
    maxAge: ADMIN_JWT_CONFIG.maxAgeMs,
  });
}

/**
 * Clears the admin cookie.
 */
export function clearAdminCookie(res) {
  res.clearCookie(ADMIN_JWT_CONFIG.cookieName, baseOptions);
}