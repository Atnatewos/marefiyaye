/**
 * @file apps/api/src/utils/jwt.js
 *
 * JWT signing and verification utilities.
 *
 * Why this file exists:
 *   - Every auth flow needs sign + verify in one place.
 *   - Guest tokens and admin tokens use DIFFERENT secrets — an admin token
 *     cannot be forged from a guest session and vice versa.
 *   - All config (algorithm, issuer, cookie names, expirations) comes from
 *     `@marefiyaye/config/security` and env vars — no hardcoding.
 *
 * Usage:
 *   const guestToken = signGuestToken({ sub: userId, role: 'GUEST' });
 *   const adminToken = signAdminToken({ sub: adminId, role: 'ADMIN' });
 *   const payload = verifyGuestToken(cookieValue); // throws if invalid
 */

import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '@marefiyaye/config/security';
import { apiEnv } from '../config/env.js';
import { UnauthorizedError } from './errors.js';

/**
 * Signs a guest/host token.
 *
 * @param {object} payload - Must include `sub` (user UUID) and `role`.
 * @returns {string} Signed JWT string.
 */
export function signGuestToken(payload) {
  return jwt.sign(payload, apiEnv.JWT_SECRET, {
    algorithm: JWT_CONFIG.algorithm,
    issuer: JWT_CONFIG.issuer,
    expiresIn: apiEnv.JWT_EXPIRES_IN,
  });
}

/**
 * Signs an admin token.
 * Uses a SEPARATE secret so an admin token cannot be forged via guest credentials.
 *
 * @param {object} payload - Must include `sub` (admin UUID) and `role: 'ADMIN'`.
 * @returns {string} Signed JWT string.
 */
export function signAdminToken(payload) {
  return jwt.sign(payload, apiEnv.ADMIN_JWT_SECRET, {
    algorithm: JWT_CONFIG.algorithm,
    issuer: JWT_CONFIG.issuer,
    expiresIn: apiEnv.ADMIN_JWT_EXPIRES_IN,
  });
}

/**
 * Verifies a guest/host token.
 *
 * @param {string} token
 * @returns {object} Decoded payload.
 * @throws {UnauthorizedError} When the token is invalid or expired.
 */
export function verifyGuestToken(token) {
  try {
    return jwt.verify(token, apiEnv.JWT_SECRET, {
      algorithms: [JWT_CONFIG.algorithm],
      issuer: JWT_CONFIG.issuer,
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Session expired');
    }
    throw new UnauthorizedError('Invalid authentication token');
  }
}

/**
 * Verifies an admin token.
 * Uses the admin secret — a guest token will fail here.
 *
 * @param {string} token
 * @returns {object} Decoded payload.
 * @throws {UnauthorizedError}
 */
export function verifyAdminToken(token) {
  try {
    const payload = jwt.verify(token, apiEnv.ADMIN_JWT_SECRET, {
      algorithms: [JWT_CONFIG.algorithm],
      issuer: JWT_CONFIG.issuer,
    });
    if (payload.role !== 'ADMIN') {
      throw new UnauthorizedError('Admin access required');
    }
    return payload;
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Admin session expired');
    }
    throw new UnauthorizedError('Invalid admin token');
  }
}