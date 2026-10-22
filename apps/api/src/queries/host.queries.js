/**
 * @file apps/api/src/queries/host.queries.js
 *
 * SQL for host-specific queries.
 *
 * Why this file exists:
 *   - Every host endpoint filters by the logged-in host's ID.
 *   - Joining across listings → bookings → guests keeps results focused.
 *   - Parameterized everywhere.
 */

import { query } from '../config/db.js';
import { TABLES } from '@marefiyaye/config/database';

/**
 * Returns all listings owned by a host, with booking count and revenue.
 *
 * @param {string} hostId
 */
export async function findListingsByHost(hostId) {
  const { rows } = await query(
    `SELECT
       p.id, p.slug, p.title, p.title_am, p.category, p.city, p.neighborhood,
       p.stay_type, p.nightly_rate_etb, p.monthly_rate_etb, p.images,
       p.is_verified, p.is_active, p.created_at,
       COUNT(b.id) FILTER (WHERE b.status = 'CONFIRMED') AS confirmed_bookings,
       COALESCE(SUM(b.total_etb) FILTER (WHERE b.status = 'CONFIRMED'), 0) AS total_revenue_etb,
       COUNT(b.id) FILTER (WHERE b.status = 'AWAITING_VERIFICATION') AS pending_bookings
     FROM ${TABLES.PROPERTIES} p
     LEFT JOIN ${TABLES.BOOKINGS} b ON b.property_id = p.id
     WHERE p.host_id = $1
     GROUP BY p.id
     ORDER BY p.created_at DESC`,
    [hostId]
  );
  return rows;
}

/**
 * Returns all bookings received on the host's properties.
 *
 * @param {string} hostId
 * @param {string} [status] - Filter by booking status
 */
export async function findBookingsForHost(hostId, status = null) {
  const params = [hostId];
  const where = ['p.host_id = $1'];
  if (status && status !== 'ALL') {
    params.push(status);
    where.push(`b.status = $${params.length}`);
  }

  const { rows } = await query(
    `SELECT
       b.*,
       p.slug AS property_slug,
       p.title AS property_title,
       p.title_am AS property_title_am,
       p.city AS property_city,
       u.full_name AS guest_name,
       u.email AS guest_email,
       u.phone AS guest_phone
     FROM ${TABLES.BOOKINGS} b
     JOIN ${TABLES.PROPERTIES} p ON p.id = b.property_id
     JOIN ${TABLES.USERS} u ON u.id = b.guest_id
     WHERE ${where.join(' AND ')}
     ORDER BY b.created_at DESC`,
    params
  );
  return rows;
}

/**
 * Returns all viewing requests on the host's properties.
 *
 * @param {string} hostId
 * @param {string} [status] - Filter by viewing status
 */
export async function findViewingsForHost(hostId, status = null) {
  const params = [hostId];
  const where = ['p.host_id = $1'];
  if (status && status !== 'ALL') {
    params.push(status);
    where.push(`v.status = $${params.length}`);
  }

  const { rows } = await query(
    `SELECT
       v.*,
       p.slug AS property_slug,
       p.title AS property_title,
       p.city AS property_city,
       u.full_name AS requester_name,
       u.email AS requester_email,
       u.phone AS requester_phone
     FROM ${TABLES.VIEWING_REQUESTS} v
     JOIN ${TABLES.PROPERTIES} p ON p.id = v.property_id
     JOIN ${TABLES.USERS} u ON u.id = v.requester_id
     WHERE ${where.join(' AND ')}
     ORDER BY v.preferred_date ASC, v.created_at DESC`,
    params
  );
  return rows;
}

/**
 * Updates a viewing request status (host confirm/cancel).
 */
export async function updateViewingStatus(client, viewingId, status) {
  const { rows } = await client.query(
    `UPDATE ${TABLES.VIEWING_REQUESTS} SET status = $2 WHERE id = $1 RETURNING *`,
    [viewingId, status]
  );
  return rows[0];
}

/**
 * Verifies a viewing belongs to the host.
 */
export async function findViewingOwnership(viewingId, hostId) {
  const { rows } = await query(
    `SELECT v.id FROM ${TABLES.VIEWING_REQUESTS} v
     JOIN ${TABLES.PROPERTIES} p ON p.id = v.property_id
     WHERE v.id = $1 AND p.host_id = $2 LIMIT 1`,
    [viewingId, hostId]
  );
  return rows.length > 0;
}

/**
 * KPI counts for the host overview.
 */
export async function getHostStats(hostId) {
  const [listings, bookings, viewings] = await Promise.all([
    query(`SELECT COUNT(*)::int AS c FROM ${TABLES.PROPERTIES} WHERE host_id = $1 AND is_active = TRUE`, [hostId]),
    query(`SELECT COUNT(*)::int AS c FROM ${TABLES.BOOKINGS} b JOIN ${TABLES.PROPERTIES} p ON p.id = b.property_id WHERE p.host_id = $1`, [hostId]),
    query(`SELECT COUNT(*)::int AS c FROM ${TABLES.VIEWING_REQUESTS} v JOIN ${TABLES.PROPERTIES} p ON p.id = v.property_id WHERE p.host_id = $1 AND v.status = 'PENDING'`, [hostId]),
  ]);

  return {
    totalListings: listings.rows[0].c,
    totalBookings: bookings.rows[0].c,
    pendingViewings: viewings.rows[0].c,
  };
}