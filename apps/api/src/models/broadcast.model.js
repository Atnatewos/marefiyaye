/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Broadcast Message Model
 * Path: apps/api/src/models/broadcast.model.js
 *
 * Purpose:
 *   All SQL touching `broadcast_messages`. Broadcasts are sticky notices
 *   shown to a specific audience (all/guests/hosts/admins) within an
 *   optional schedule window.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { query } from '../db/pool.js';

/**
 * Returns currently-active broadcasts for a given audience.
 * An entry matches if:
 *   is_active = TRUE
 *   AND (starts_at IS NULL OR starts_at <= NOW())
 *   AND (ends_at   IS NULL OR ends_at   >= NOW())
 *   AND audience IN ('all', <audience>)
 *
 * @param {string} audience  - 'guests' | 'hosts' | 'admins'
 * @returns {Promise<Array<object>>}
 */
export async function findActiveForAudience(audience) {
  const result = await query(
    `SELECT id, title_en, title_am, body_en, body_am, audience, severity, starts_at, ends_at, created_at
     FROM broadcast_messages
     WHERE is_active = TRUE
       AND (starts_at IS NULL OR starts_at <= NOW())
       AND (ends_at   IS NULL OR ends_at   >= NOW())
       AND audience IN ('all', $1)
     ORDER BY created_at DESC`,
    [audience]
  );
  return result.rows;
}

/**
 * @returns {Promise<Array<object>>}
 */
export async function findAll() {
  const result = await query(
    `SELECT id, title_en, title_am, body_en, body_am, audience, severity,
            starts_at, ends_at, is_active, created_at, updated_at
     FROM broadcast_messages
     ORDER BY created_at DESC`
  );
  return result.rows;
}

/**
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function findById(id) {
  const result = await query(
    `SELECT id, title_en, title_am, body_en, body_am, audience, severity,
            starts_at, ends_at, is_active, created_at, updated_at
     FROM broadcast_messages
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function create(data) {
  const result = await query(
    `INSERT INTO broadcast_messages
       (title_en, title_am, body_en, body_am, audience, severity, starts_at, ends_at, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      data.title_en,
      data.title_am,
      data.body_en,
      data.body_am,
      data.audience,
      data.severity,
      data.starts_at || null,
      data.ends_at || null,
      data.is_active === undefined ? true : data.is_active,
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

  const columns = [
    'title_en',
    'title_am',
    'body_en',
    'body_am',
    'audience',
    'severity',
    'starts_at',
    'ends_at',
    'is_active',
  ];

  for (const col of columns) {
    if (Object.prototype.hasOwnProperty.call(patch, col)) {
      params.push(patch[col]);
      fields.push(`${col} = $${params.length}`);
    }
  }

  if (fields.length === 0) return findById(id);

  params.push(id);
  const result = await query(
    `UPDATE broadcast_messages
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${params.length}
     RETURNING *`,
    params
  );
  return result.rows[0] || null;
}

/**
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function remove(id) {
  const result = await query(
    'DELETE FROM broadcast_messages WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rowCount > 0;
}

export default Object.freeze({
  findActiveForAudience,
  findAll,
  findById,
  create,
  update,
  remove,
});