/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Audit Log Model
 * Path: apps/api/src/models/auditLog.model.js
 *
 * Purpose:
 *   Append-only audit log. Never updated, never deleted by the application.
 *   Every admin action that touches privileged state must write one row.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { query } from '../db/pool.js';

/**
 * Inserts a new audit log row.
 *
 * @param {object} data
 * @param {string|null} data.actor_id
 * @param {string} data.action           - e.g. "settings.update"
 * @param {string|null} [data.resource_type]
 * @param {string|null} [data.resource_id]
 * @param {object|null} [data.before_state]
 * @param {object|null} [data.after_state]
 * @param {string|null} [data.ip_address]
 * @param {string|null} [data.user_agent]
 * @returns {Promise<object>}
 */
export async function create(data) {
  const result = await query(
    `INSERT INTO audit_logs
       (actor_id, action, resource_type, resource_id, before_state, after_state, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8)
     RETURNING id, action, created_at`,
    [
      data.actor_id || null,
      data.action,
      data.resource_type || null,
      data.resource_id || null,
      data.before_state ? JSON.stringify(data.before_state) : null,
      data.after_state ? JSON.stringify(data.after_state) : null,
      data.ip_address || null,
      data.user_agent || null,
    ]
  );
  return result.rows[0];
}

/**
 * Lists audit logs with pagination. Most recent first.
 *
 * @param {object} params
 * @param {number} params.limit
 * @param {number} params.offset
 * @param {string} [params.action]        - filter by exact action
 * @param {string} [params.resource_type] - filter by resource type
 * @param {string} [params.actor_id]      - filter by actor
 * @returns {Promise<{ rows: object[], total: number }>}
 */
export async function list({ limit, offset, action, resource_type, actor_id }) {
  const conditions = [];
  const params = [];

  if (action) {
    params.push(action);
    conditions.push(`action = $${params.length}`);
  }
  if (resource_type) {
    params.push(resource_type);
    conditions.push(`resource_type = $${params.length}`);
  }
  if (actor_id) {
    params.push(actor_id);
    conditions.push(`actor_id = $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM audit_logs ${whereClause}`,
    params
  );

  params.push(limit, offset);
  const rowsResult = await query(
    `SELECT id, actor_id, action, resource_type, resource_id, before_state, after_state, ip_address, created_at
     FROM audit_logs
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return { rows: rowsResult.rows, total: countResult.rows[0].total };
}

export default Object.freeze({
  create,
  list,
});