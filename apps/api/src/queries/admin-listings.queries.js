/**
 * @file apps/api/src/queries/admin-listings.queries.js
 *
 * SQL for admin listing verification.
 *
 * Why this file exists:
 *   - Admin needs pending queue, verify, and reject queries.
 *   - All queries parameterized — no interpolation.
 *   - Audit log written in the same transaction as the status change.
 */

import { query } from '../config/db.js';
import { TABLES } from '@marefiyaye/config/database';

/**
 * Lists listings for admin review, filtered by verification status.
 *
 * @param {string} [filter='PENDING'] - 'PENDING' | 'VERIFIED' | 'ALL' | 'REJECTED'
 * @param {number} [limit=50]
 * @param {number} [offset=0]
 */
export async function findListingsForAdmin(filter = 'PENDING', limit = 50, offset = 0) {
  const params = [];
  const where = [];

  if (filter === 'PENDING') {
    where.push(`p.is_verified = FALSE AND p.is_active = TRUE`);
  } else if (filter === 'VERIFIED') {
    where.push(`p.is_verified = TRUE AND p.is_active = TRUE`);
  }
  // 'ALL' → no filter

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT
       p.id, p.slug, p.title, p.title_am, p.category, p.city, p.neighborhood,
       p.stay_type, p.nightly_rate_etb, p.monthly_rate_etb, p.images,
       p.is_verified, p.is_active, p.created_at,
       u.full_name AS host_name, u.email AS host_email, u.id AS host_id
     FROM ${TABLES.PROPERTIES} p
     JOIN ${TABLES.USERS} u ON u.id = p.host_id
     ${whereClause}
     ORDER BY
       CASE WHEN p.is_verified = FALSE THEN 0 ELSE 1 END,
       p.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
}

/**
 * Fetches one listing with full detail for admin review.
 */
export async function findListingForAdmin(id) {
  const { rows } = await query(
    `SELECT
       p.*,
       u.full_name AS host_name, u.email AS host_email, u.id AS host_id,
       u.is_verified AS host_verified
     FROM ${TABLES.PROPERTIES} p
     JOIN ${TABLES.USERS} u ON u.id = p.host_id
     WHERE p.id = $1
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Marks a listing as verified (or rejected) with an optional note.
 * Must be called inside a transaction.
 */
export async function updateListingVerification(client, id, isVerified) {
  const { rows } = await client.query(
    `UPDATE ${TABLES.PROPERTIES}
     SET is_verified = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, isVerified]
  );
  return rows[0];
}

/**
 * Writes an audit log entry for a listing action.
 * Must be called inside a transaction.
 */
export async function insertListingAudit(client, data) {
  await client.query(
    `INSERT INTO ${TABLES.AUDIT_LOGS}
       (actor_id, action, entity_type, entity_id, before, after)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      data.actorId,
      data.action,
      'property',
      data.entityId,
      data.before ? JSON.stringify(data.before) : null,
      data.after ? JSON.stringify(data.after) : null,
    ]
  );
}