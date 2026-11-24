/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Password Hashing Utilities
 * Path: apps/api/src/utils/password.js
 *
 * Purpose:
 *   Centralizes password hashing and verification. Every password in the
 *   system — user signup, admin bootstrap, password change — flows through
 *   these two functions. No raw bcrypt calls anywhere else.
 *
 * Design choices:
 *   - bcryptjs (pure JS) for portability across Vercel / Node / Windows
 *   - Cost factor from `AUTH.BCRYPT_ROUNDS` in config/constants.js (12)
 *   - Constant-time verification (bcrypt handles this internally)
 *   - No password length trimming — users may include trailing spaces
 * ─────────────────────────────────────────────────────────────────────────────
 */

import bcrypt from 'bcryptjs';
import { AUTH } from '../config/constants.js';
import { logger } from './logger.js';

/* ── Hash ────────────────────────────────────────────────────────────────── */

/**
 * Hashes a plaintext password.
 *
 * @param {string} plaintext
 * @returns {Promise<string>} bcrypt hash
 * @throws {Error} if input is not a string or hashing fails
 */
export async function hashPassword(plaintext) {
  if (typeof plaintext !== 'string' || plaintext.length === 0) {
    throw new Error('[password] Cannot hash empty or non-string value');
  }

  try {
    return await bcrypt.hash(plaintext, AUTH.BCRYPT_ROUNDS);
  } catch (err) {
    logger.error('[password] hashing failed', { error: err });
    throw new Error('[password] Hashing failed');
  }
}

/* ── Verify ──────────────────────────────────────────────────────────────── */

/**
 * Verifies a plaintext password against a stored bcrypt hash.
 * Returns `false` on any failure — never throws — so callers can safely
 * use this in login flows without try/catch around the compare.
 *
 * @param {string} plaintext
 * @param {string} storedHash
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(plaintext, storedHash) {
  if (typeof plaintext !== 'string' || typeof storedHash !== 'string') {
    return false;
  }

  try {
    return await bcrypt.compare(plaintext, storedHash);
  } catch (err) {
    logger.warn('[password] verification error (returning false)', { error: err });
    return false;
  }
}

/* ── Convenience: default export ─────────────────────────────────────────── */

export default Object.freeze({
  hashPassword,
  verifyPassword,
});