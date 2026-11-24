/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Host Model
 * Path: apps/api/src/models/host.model.js
 *
 * Purpose:
 *   All SQL touching the `hosts` table. A user becomes a host by creating
 *   a host profile. Admin verification gates the ability to list properties.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { query } from '../db/pool.js';

/**
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function findById(id) {
  const result = await query(
    `SELECT id, user_id, display_name, bio, avatar_url, payout_method,
            verification_status, verification_reason, verified_at, verified_by,
            status, created_at, updated_at
     FROM hosts
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
export async function findByUserId(userId) {
  const result = await query(
    `SELECT id, user_id, display_name, bio, avatar_url, payout_method,
            verification_status, verification_reason, verified_at, verified_by,
            status, created_at, updated_at
     FROM hosts
     WHERE user_id = $1
     LIMIT 1`,
    [userId]
  );
  return result.rows[0] || null;
}

/**
 * @param {object} params
 * @param {string} [params.verification_status]
 * @param {string} [params.status]
 * @param {number} params.limit
 * @param {number} params.offset
 * @returns {Promise<{ rows: object[], total: number }>}
 */
export async function list({ verification_status, status, limit, offset }) {
  const conditions = [];
  const params = [];

  if (verification_status) {
    params.push(verification_status);
    conditions.push(`verification_status = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM hosts ${whereClause}`,
    params
  );

  params.push(limit, offset);
  const rowsResult = await query(
    `SELECT h.id, h.user_id, h.display_name, h.bio, h.avatar_url,
            h.verification_status, h.verification_reason, h.verified_at,
            h.status, h.created_at, h.updated_at,
            u.email AS user_email, u.full_name AS user_full_name, u.phone AS user_phone
     FROM hosts h
     JOIN users u ON u.id = h.user_id
     ${whereClause}
     ORDER BY h.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return { rows: rowsResult.rows, total: countResult.rows[0].total };
}

/**
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function create(data) {
  const result = await query(
    `INSERT INTO hosts (user_id, display_name, bio, avatar_url)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, display_name, bio, avatar_url, verification_status, status, created_at`,
    [
      data.user_id,
      data.display_name,
      data.bio || null,
      data.avatar_url || null,
    ]
  );
  return result.rows[0];
}

/**
 * @param {string} id
 * @param {object} patch
 * @returns {Promise<object|null>}
 */
export async function update(id, patch) {
  const fields = [];
  const params = [];

  for (const col of ['display_name', 'bio', 'avatar_url', 'payout_method']) {
    if (Object.prototype.hasOwnProperty.call(patch, col)) {
      params.push(patch[col]);
      fields.push(`${col} = $${params.length}`);
    }
  }

  if (fields.length === 0) return findById(id);

  params.push(id);
  const result = await query(
    `UPDATE hosts
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${params.length}
     RETURNING id, user_id, display_name, bio, avatar_url, payout_method,
               verification_status, status, updated_at`,
    params
  );
  return result.rows[0] || null;
}

/**
 * Updates verification status. Used only by admin moderation.
 *
 * @param {object} params
 * @param {string} params.id
 * @param {'verified'|'rejected'|'suspended'} params.status
 * @param {string|null} params.reason
 * @param {string} params.actorId
 * @returns {Promise<object|null>}
 */
export async function setVerification({ id, status, reason, actorId }) {
  const isVerified = status === 'verified';
  const result = await query(
    `UPDATE hosts
     SET verification_status = $1,
         verification_reason = $2,
         verified_at = CASE WHEN $3 THEN NOW() ELSE NULL END,
         verified_by = CASE WHEN $3 THEN $4::uuid ELSE NULL END,
         updated_at = NOW()
     WHERE id = $5
     RETURNING id, user_id, verification_status, verification_reason, verified_at, updated_at`,
    [status, reason || null, isVerified, actorId, id]
  );
  return result.rows[0] || null;
}

export default Object.freeze({
  findById,
  findByUserId,
  list,
  create,
  update,
  setVerification,
});