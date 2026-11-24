/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Refresh Token Model
 * Path: apps/api/src/models/refreshToken.model.js
 *
 * Purpose:
 *   Stores hashed refresh tokens. The raw token is NEVER persisted —
 *   only its SHA-256 hash. A database leak therefore does not yield usable
 *   session tokens.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { query } from '../db/pool.js';

/**
 * Inserts a new refresh token row.
 *
 * @param {object} data
 * @param {string} data.user_id
 * @param {string} data.token_hash
 * @param {string|null} data.user_agent
 * @param {string|null} data.ip_address
 * @param {Date} data.expires_at
 * @returns {Promise<object>}
 */
export async function create(data) {
  const result = await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, user_agent, ip_address, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, expires_at, created_at`,
    [
      data.user_id,
      data.token_hash,
      data.user_agent || null,
      data.ip_address || null,
      data.expires_at,
    ]
  );
  return result.rows[0];
}

/**
 * Finds a refresh token by its hash. Only returns non-revoked, non-expired
 * tokens.
 *
 * @param {string} tokenHash
 * @returns {Promise<object|null>}
 */
export async function findActiveByHash(tokenHash) {
  const result = await query(
    `SELECT id, user_id, expires_at, created_at
     FROM refresh_tokens
     WHERE token_hash = $1
       AND revoked = FALSE
       AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );
  return result.rows[0] || null;
}

/**
 * Revokes a single refresh token by id.
 *
 * @param {string} id
 */
export async function revokeById(id) {
  await query(
    'UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1',
    [id]
  );
}

/**
 * Revokes a refresh token by its hash.
 *
 * @param {string} tokenHash
 */
export async function revokeByHash(tokenHash) {
  await query(
    'UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1',
    [tokenHash]
  );
}

/**
 * Revokes every active refresh token for a user.
 * Used on password change, account suspension, and impersonation stop.
 *
 * @param {string} userId
 */
export async function revokeAllForUser(userId) {
  await query(
    'UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1 AND revoked = FALSE',
    [userId]
  );
}

/**
 * Removes expired or revoked tokens older than N days.
 * Intended for a future cleanup job.
 *
 * @param {number} olderThanDays
 */
export async function cleanupStale(olderThanDays = 30) {
  await query(
    `DELETE FROM refresh_tokens
     WHERE (revoked = TRUE OR expires_at < NOW())
       AND created_at < NOW() - ($1 || ' days')::interval`,
    [olderThanDays]
  );
}

export default Object.freeze({
  create,
  findActiveByHash,
  revokeById,
  revokeByHash,
  revokeAllForUser,
  cleanupStale,
});