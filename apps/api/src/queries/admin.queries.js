/**
 * @file apps/api/src/queries/admin.queries.js
 *
 * SQL query functions for admin endpoints.
 *
 * Why this file exists:
 *   - Admin queries join multiple tables across the platform.
 *   - Every list view needs its own query with status filters.
 *   - All parameterized — no interpolation.
 */

import { query } from '../config/db.js';
import { TABLES } from '@marefiyaye/config/database';

/**
 * Lists payments filtered by status with full context for the admin queue.
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

// ── New admin list queries (Wave 4D-2) ─────────────────────────────────

/**
 * All bookings across the platform, joined with guest and property.
 */
export async function findAllBookingsForAdmin(status, limit = 100, offset = 0) {
  const params = [];
  const where = [];
  if (status && status !== 'ALL') {
    params.push(status);
    where.push(`b.status = $${params.length}`);
  }
  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT
       b.*,
       u.full_name AS guest_name, u.email AS guest_email,
       p.title AS property_title, p.slug AS property_slug
     FROM ${TABLES.BOOKINGS} b
     JOIN ${TABLES.USERS} u ON u.id = b.guest_id
     JOIN ${TABLES.PROPERTIES} p ON p.id = b.property_id
     ${whereClause}
     ORDER BY b.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
}

/**
 * All lease applications across the platform.
 */
export async function findAllLeasesForAdmin(status, limit = 100, offset = 0) {
  const params = [];
  const where = [];
  if (status && status !== 'ALL') {
    params.push(status);
    where.push(`la.status = $${params.length}`);
  }
  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT
       la.*,
       u.full_name AS tenant_name, u.email AS tenant_email,
       p.title AS property_title, p.slug AS property_slug
     FROM ${TABLES.LEASE_APPLICATIONS} la
     JOIN ${TABLES.USERS} u ON u.id = la.tenant_id
     JOIN ${TABLES.PROPERTIES} p ON p.id = la.property_id
     ${whereClause}
     ORDER BY la.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
}

/**
 * All viewing requests across the platform.
 */
export async function findAllViewingsForAdmin(status, limit = 100, offset = 0) {
  const params = [];
  const where = [];
  if (status && status !== 'ALL') {
    params.push(status);
    where.push(`v.status = $${params.length}`);
  }
  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT
       v.*,
       u.full_name AS requester_name, u.email AS requester_email,
       p.title AS property_title, p.slug AS property_slug
     FROM ${TABLES.VIEWING_REQUESTS} v
     JOIN ${TABLES.USERS} u ON u.id = v.requester_id
     JOIN ${TABLES.PROPERTIES} p ON p.id = v.property_id
     ${whereClause}
     ORDER BY v.preferred_date DESC, v.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
}

/**
 * All reviews across the platform.
 */
export async function findAllReviewsForAdmin(limit = 100, offset = 0) {
  const { rows } = await query(
    `SELECT
       r.*,
       u.full_name AS author_name,
       p.title AS property_title, p.slug AS property_slug
     FROM ${TABLES.REVIEWS} r
     JOIN ${TABLES.USERS} u ON u.id = r.author_id
     JOIN ${TABLES.PROPERTIES} p ON p.id = r.property_id
     ORDER BY r.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows;
}

/**
 * All users across the platform.
 */
export async function findAllUsersForAdmin(limit = 100, offset = 0) {
  const { rows } = await query(
    `SELECT id, full_name, email, phone, role, is_verified, verification_level, avatar_url, created_at
     FROM ${TABLES.USERS}
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows;
}

/**
 * Audit log entries with actor info.
 */
export async function findAuditLogForAdmin(limit = 100, offset = 0) {
  const { rows } = await query(
    `SELECT
       a.*,
       u.full_name AS actor_name, u.email AS actor_email
     FROM ${TABLES.AUDIT_LOGS} a
     LEFT JOIN ${TABLES.USERS} u ON u.id = a.actor_id
     ORDER BY a.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows;
}

/**
 * Fetches all platform settings.
 */
export async function findAllPlatformSettings() {
  const { rows } = await query(
    `SELECT key, value, updated_at FROM platform_settings ORDER BY key`
  );
  return rows;
}

/**
 * Upserts a single platform setting.
 */
export async function upsertPlatformSetting(key, value, adminId) {
  const { rows } = await query(
    `INSERT INTO platform_settings (key, value, updated_by, updated_at)
     VALUES ($1, $2::jsonb, $3, NOW())
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value,
           updated_by = EXCLUDED.updated_by,
           updated_at = NOW()
     RETURNING key, value, updated_at`,
    [key, JSON.stringify(value), adminId]
  );
  return rows[0];
}