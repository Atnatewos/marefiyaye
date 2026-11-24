/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Payment Model
 * Path: apps/api/src/models/payment.model.js
 *
 * Purpose:
 *   All SQL touching `payments`. One booking can have multiple attempts
 *   (rejected → retry). The DB enforces "only one verified payment per
 *   booking" via a partial unique index — enforced at insert time.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { query } from '../db/pool.js';

/**
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function findById(id) {
  const result = await query(
    `SELECT p.*, b.code AS booking_code, b.total AS booking_total, b.status AS booking_status
     FROM payments p
     JOIN bookings b ON b.id = p.booking_id
     WHERE p.id = $1
     LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * @param {string} bookingId
 * @returns {Promise<Array<object>>}
 */
export async function listByBooking(bookingId) {
  const result = await query(
    `SELECT id, booking_id, user_id, amount, currency, method, bank_account_id,
            reference, receipt_url, status, reviewed_by, reviewed_at, rejection_reason,
            created_at, updated_at
     FROM payments
     WHERE booking_id = $1
     ORDER BY created_at DESC`,
    [bookingId]
  );
  return result.rows;
}

/**
 * Lists payments for admin review. Filter by status to see pending queue.
 *
 * @param {object} filters  — { status?, user_id? }
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<{ rows: object[], total: number }>}
 */
export async function listAdmin(filters, limit, offset) {
  const conditions = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`p.status = $${params.length}`);
  }
  if (filters.user_id) {
    params.push(filters.user_id);
    conditions.push(`p.user_id = $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM payments p ${whereClause}`,
    params
  );

  params.push(limit, offset);
  const rowsResult = await query(
    `SELECT p.*,
            b.code AS booking_code,
            b.total AS booking_total,
            b.status AS booking_status,
            u.email AS user_email,
            u.full_name AS user_name
     FROM payments p
     JOIN bookings b ON b.id = p.booking_id
     JOIN users u ON u.id = p.user_id
     ${whereClause}
     ORDER BY p.created_at DESC
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
    `INSERT INTO payments (
       booking_id, user_id, amount, currency,
       method, bank_account_id, reference, receipt_url, receipt_public_id, status
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      data.booking_id,
      data.user_id,
      data.amount,
      data.currency || 'ETB',
      data.method,
      data.bank_account_id || null,
      data.reference,
      data.receipt_url,
      data.receipt_public_id,
      data.status || 'pending',
    ]
  );
  return result.rows[0];
}

/**
 * @param {object} params
 * @param {string} params.id
 * @param {string} params.status
 * @param {string|null} params.actorId
 * @param {string|null} [params.reason]
 * @returns {Promise<object|null>}
 */
export async function setStatus({ id, status, actorId, reason = null }) {
  const result = await query(
    `UPDATE payments
     SET status = $1,
         reviewed_by = CASE WHEN $2::uuid IS NOT NULL THEN $2::uuid ELSE reviewed_by END,
         reviewed_at = CASE WHEN $2::uuid IS NOT NULL THEN NOW() ELSE reviewed_at END,
         rejection_reason = $3,
         updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [status, actorId, reason, id]
  );
  return result.rows[0] || null;
}

export default Object.freeze({
  findById,
  listByBooking,
  listAdmin,
  create,
  setStatus,
});