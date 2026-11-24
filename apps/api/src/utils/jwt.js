/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — JWT Utilities
 * Path: apps/api/src/utils/jwt.js
 *
 * Purpose:
 *   Signs and verifies access + refresh tokens. Every session in the
 *   platform — guest, host, admin, super_admin, and impersonation
 *   sessions — flows through these functions.
 *
 * Token payload contract:
 *   access token:  { sub, role, impersonatedBy? }
 *   refresh token: { sub, jti }
 *
 * Guarantees:
 *   - Access and refresh secrets are separate — a leaked access token
 *     cannot be used to sign refresh tokens and vice versa.
 *   - Issuer claim (`iss`) enforced on verify to prevent cross-service
 *     confusion.
 *   - Impersonation sessions carry `impersonatedBy` so audit middleware
 *     and role guards can detect them.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import { logger } from './logger.js';

/* ── Token Payload Shapes ────────────────────────────────────────────────── */

/**
 * @typedef {object} AccessPayload
 * @property {string} sub               - user id
 * @property {string} role              - guest | host | admin | super_admin
 * @property {string} [impersonatedBy]  - admin id when impersonating
 */

/**
 * @typedef {object} RefreshPayload
 * @property {string} sub   - user id
 * @property {string} jti   - unique token id (for revocation)
 */

/* ── Sign ────────────────────────────────────────────────────────────────── */

/**
 * Signs an access token.
 *
 * @param {AccessPayload} payload
 * @returns {string} signed JWT
 */
export function signAccessToken(payload) {
  if (!payload?.sub || !payload?.role) {
    throw new Error('[jwt] Access token requires sub and role');
  }

  const signOptions = {
    expiresIn: config.jwt.accessExpires,
    issuer: config.jwt.issuer,
    algorithm: 'HS256',
  };

  return jwt.sign(payload, config.jwt.accessSecret, signOptions);
}

/**
 * Signs a refresh token. `jti` is auto-generated when absent so every
 * refresh token is uniquely revocable.
 *
 * @param {{ sub: string, jti?: string }} payload
 * @returns {string} signed JWT
 */
export function signRefreshToken(payload) {
  if (!payload?.sub) {
    throw new Error('[jwt] Refresh token requires sub');
  }

  const jti = payload.jti || crypto.randomUUID();

  const signOptions = {
    expiresIn: config.jwt.refreshExpires,
    issuer: config.jwt.issuer,
    algorithm: 'HS256',
    jwtid: jti,
  };

  return jwt.sign({ sub: payload.sub }, config.jwt.refreshSecret, signOptions);
}

/* ── Verify ──────────────────────────────────────────────────────────────── */

/**
 * Verifies an access token. Throws on invalid / expired token — callers
 * should let the error propagate to the centralized handler, which maps
 * JWT errors to proper 401 responses with i18n keys.
 *
 * @param {string} token
 * @returns {AccessPayload}
 */
export function verifyAccessToken(token) {
  if (typeof token !== 'string' || token.length === 0) {
    const err = new Error('Missing access token');
    err.name = 'JsonWebTokenError';
    throw err;
  }

  return jwt.verify(token, config.jwt.accessSecret, {
    issuer: config.jwt.issuer,
    algorithms: ['HS256'],
  });
}

/**
 * Verifies a refresh token. Returns the decoded payload including `jti`
 * so the caller can look up the token record for revocation checks.
 *
 * @param {string} token
 * @returns {RefreshPayload & { jti: string }}
 */
export function verifyRefreshToken(token) {
  if (typeof token !== 'string' || token.length === 0) {
    const err = new Error('Missing refresh token');
    err.name = 'JsonWebTokenError';
    throw err;
  }

  return jwt.verify(token, config.jwt.refreshSecret, {
    issuer: config.jwt.issuer,
    algorithms: ['HS256'],
  });
}

/* ── Decode (no verification — for logging) ──────────────────────────────── */

/**
 * Decodes a JWT without verifying signature. NEVER use for authentication.
 * Only for logging and diagnostics.
 *
 * @param {string} token
 * @returns {object|null}
 */
export function decodeTokenUnsafe(token) {
  try {
    return jwt.decode(token);
  } catch (err) {
    logger.warn('[jwt] decode failed', { error: err });
    return null;
  }
}

/* ── Hash for refresh token storage ──────────────────────────────────────── */

/**
 * Returns a deterministic SHA-256 hash of a refresh token.
 * The DB stores the hash, never the token itself. Prevents DB dumps from
 * yielding usable session tokens.
 *
 * @param {string} token
 * @returns {string} hex digest
 */
export function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

/* ── Default export ──────────────────────────────────────────────────────── */

export default Object.freeze({
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeTokenUnsafe,
  hashRefreshToken,
});