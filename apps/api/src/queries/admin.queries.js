/**
 * @file apps/api/src/queries/admin.queries.js
 *
 * SQL query functions for admin endpoints.
 *
 * Why this file exists:
 *   - Admin queries join multiple tables (payments → bookings → properties → users).
 *   - Filtering by status is the primary access pattern.
 *   - Stats aggregate counts across domains for the dashboard.
 */

import { query } from '../config/db.js';
import { TABLES } from '@marefiyaye/config/database';

/**
 * Lists payments filtered by status with full context for the admin queue.
 *
 * @param {string} [status] - 'AWAITING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | all
 * @param {number} [limit=50]
 * @param {number} [offset=0]
 */
export async function findPaymentsForAdmin(status, limit = 50, offset = 0) {
  const params = [];
  const where = [];

  if (status && status !== 'ALL') {
    params.push(status);
    where.push(`pay.status = $${params.length}`);
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT
       pay.*,
       b.id AS booking_id,
       b.check_in AS booking_check_in,
       b.check_out AS booking_check_out,
       b.guests AS booking_guests,
       b.nights AS booking_nights,
       b.total_etb AS booking_total,
       b.status AS booking_status,
       p.title AS property_title,
       p.title_am AS property_title_am,
       p.city AS property_city,
       p.neighborhood AS property_neighborhood,
       p.images AS property_images,
       u.full_name AS guest_name,
       u.email AS guest_email
     FROM ${TABLES.PAYMENTS} pay
     LEFT JOIN ${TABLES.BOOKINGS} b ON b.id = pay.booking_id
     LEFT JOIN ${TABLES.PROPERTIES} p ON p.id = b.property_id
     LEFT JOIN ${TABLES.USERS} u ON u.id = b.guest_id
     ${whereClause}
     ORDER BY
       CASE pay.status
         WHEN 'AWAITING_VERIFICATION' THEN 1
         WHEN 'PENDING' THEN 2
         WHEN 'VERIFIED' THEN 3
         WHEN 'REJECTED' THEN 4
       END,
       pay.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
}

/**
 * Fetches a single payment with full context.
 */
export async function findPaymentForAdmin(id) {
  const { rows } = await query(
    `SELECT
       pay.*,
       b.id AS booking_id,
       b.check_in AS booking_check_in,
       b.check_out AS booking_check_out,
       b.guests AS booking_guests,
       b.nights AS booking_nights,
       b.total_etb AS booking_total,
       b.status AS booking_status,
       b.created_at AS booking_created_at,
       p.title AS property_title,
       p.slug AS property_slug,
       p.city AS property_city,
       p.neighborhood AS property_neighborhood,
       p.images AS property_images,
       u.full_name AS guest_name,
       u.email AS guest_email,
       u.phone AS guest_phone
     FROM ${TABLES.PAYMENTS} pay
     LEFT JOIN ${TABLES.BOOKINGS} b ON b.id = pay.booking_id
     LEFT JOIN ${TABLES.PROPERTIES} p ON p.id = b.property_id
     LEFT JOIN ${TABLES.USERS} u ON u.id = b.guest_id
     WHERE pay.id = $1
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * KPI counts for the admin dashboard.
 */
export async function getAdminStats() {
  const [pendingPayments, verifiedPayments, rejectedPayments, activeBookings, totalProperties, totalUsers] =
    await Promise.all([
      query(`SELECT COUNT(*)::int AS c FROM ${TABLES.PAYMENTS} WHERE status = 'AWAITING_VERIFICATION'`),
      query(`SELECT COUNT(*)::int AS c FROM ${TABLES.PAYMENTS} WHERE status = 'VERIFIED'`),
      query(`SELECT COUNT(*)::int AS c FROM ${TABLES.PAYMENTS} WHERE status = 'REJECTED'`),
      query(`SELECT COUNT(*)::int AS c FROM ${TABLES.BOOKINGS} WHERE status = 'CONFIRMED'`),
      query(`SELECT COUNT(*)::int AS c FROM ${TABLES.PROPERTIES} WHERE is_active = TRUE`),
      query(`SELECT COUNT(*)::int AS c FROM ${TABLES.USERS}`),
    ]);

  return {
    pendingPayments: pendingPayments.rows[0].c,
    verifiedPayments: verifiedPayments.rows[0].c,
    rejectedPayments: rejectedPayments.rows[0].c,
    activeBookings: activeBookings.rows[0].c,
    totalProperties: totalProperties.rows[0].c,
    totalUsers: totalUsers.rows[0].c,
  };
}

/**
 * Insert audit log entry.
 * Called from admin verify/reject to preserve a trail of every action.
 */
export async function insertAuditLog(client, data) {
  await client.query(
    `INSERT INTO ${TABLES.AUDIT_LOGS}
       (actor_id, action, entity_type, entity_id, before, after)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      data.actorId,
      data.action,
      data.entityType,
      data.entityId,
      data.before ? JSON.stringify(data.before) : null,
      data.after ? JSON.stringify(data.after) : null,
    ]
  );
}