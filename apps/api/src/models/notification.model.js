/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Notification Model
 * Path: apps/api/src/models/notification.model.js
 *
 * Purpose:
 *   SQL for in-app notifications. Titles/bodies are stored as i18n keys +
 *   interpolation params so the same row renders in EN or AM.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { query } from '../db/pool.js';

/**
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function create(data) {
  const result = await query(
    `INSERT INTO notifications (user_id, type, title_key, body_key, body_params, link)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6)
     RETURNING *`,
    [
      data.user_id,
      data.type,
      data.title_key,
      data.body_key,
      JSON.stringify(data.body_params || {}),
      data.link || null,
    ]
  );
  return result.rows[0];
}

/**
 * Lists notifications for a user, newest first.
 *
 * @param {object} params
 * @param {string} params.user_id
 * @param {boolean} [params.unread_only]
 * @param {number} params.limit
 * @param {number} params.offset
 * @returns {Promise<{ rows: object[], total: number, unread: number }>}
 */
export async function listByUser({ user_id, unread_only = false, limit, offset }) {
  const conditions = ['user_id = $1'];
  const params = [user_id];

  if (unread_only) {
    conditions.push('is_read = FALSE');
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE is_read = FALSE)::int AS unread
     FROM notifications
     ${whereClause}`,
    params
  );

  params.push(limit, offset);
  const rowsResult = await query(
    `SELECT id, type, title_key, body_key, body_params, link, is_read, created_at
     FROM notifications
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return {
    rows: rowsResult.rows,
    total: countResult.rows[0].total,
    unread: countResult.rows[0].unread,
  };
}

/**
 * @param {string} id
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
export async function markRead(id, userId) {
  const result = await query(
    `UPDATE notifications
     SET is_read = TRUE
     WHERE id = $1 AND user_id = $2
     RETURNING id, is_read`,
    [id, userId]
  );
  return result.rows[0] || null;
}

/**
 * @param {string} userId
 * @returns {Promise<number>}
 */
export async function markAllRead(userId) {
  const result = await query(
    `UPDATE notifications SET is_read = TRUE
     WHERE user_id = $1 AND is_read = FALSE
     RETURNING id`,
    [userId]
  );
  return result.rowCount;
}

/**
 * @param {string} id
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export async function remove(id, userId) {
  const result = await query(
    'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  return result.rowCount > 0;
}

export default Object.freeze({
  create,
  listByUser,
  markRead,
  markAllRead,
  remove,
});