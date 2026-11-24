/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Booking Model
 * Path: apps/api/src/models/booking.model.js
 *
 * Purpose:
 *   All SQL touching `bookings` and `booking_events`. Bookings capture a
 *   frozen pricing snapshot at creation time — commission rate is written
 *   onto the booking row so future rate changes never retroactively affect
 *   historical bookings.
 *
 *   Booking codes are human-friendly (MRF-XXXXXX) and uniquely indexed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { query, withTransaction } from '../db/pool.js';

/* ── Code generator ──────────────────────────────────────────────────────── */

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;
const CODE_PREFIX = 'MRF';

/**
 * Generates a human-readable booking code. Collisions are astronomically
 * unlikely (32^6 = 1 billion) but the DB unique constraint catches them.
 *
 * @returns {string}
 */
export function generateBookingCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return `${CODE_PREFIX}-${code}`;
}

/* ── Reads ───────────────────────────────────────────────────────────────── */

/**
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function findById(id) {
  const result = await query(
    `SELECT b.*,
            l.title_en AS listing_title_en,
            l.title_am AS listing_title_am,
            l.city AS listing_city,
            l.images AS listing_images,
            h.id AS host_id,
            h.user_id AS host_user_id,
            h.display_name AS host_name
     FROM bookings b
     JOIN listings l ON l.id = b.listing_id
     JOIN hosts h ON h.id = l.host_id
     WHERE b.id = $1
     LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * @param {string} code
 * @returns {Promise<object|null>}
 */
export async function findByCode(code) {
  const result = await query(
    `SELECT b.*, l.title_en AS listing_title_en, l.images AS listing_images
     FROM bookings b
     JOIN listings l ON l.id = b.listing_id
     WHERE b.code = $1
     LIMIT 1`,
    [code]
  );
  return result.rows[0] || null;
}

/**
 * Lists a guest's own bookings.
 *
 * @param {object} params
 * @param {string} params.guest_id
 * @param {string} [params.status]
 * @param {number} params.limit
 * @param {number} params.offset
 * @returns {Promise<{ rows: object[], total: number }>}
 */
export async function listByGuest({ guest_id, status, limit, offset }) {
  const conditions = ['b.guest_id = $1'];
  const params = [guest_id];

  if (status) {
    params.push(status);
    conditions.push(`b.status = $${params.length}`);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM bookings b ${whereClause}`,
    params
  );

  params.push(limit, offset);
  const rowsResult = await query(
    `SELECT b.*,
            l.title_en AS listing_title_en,
            l.images AS listing_images,
            h.display_name AS host_name
     FROM bookings b
     JOIN listings l ON l.id = b.listing_id
     JOIN hosts h ON h.id = l.host_id
     ${whereClause}
     ORDER BY b.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return { rows: rowsResult.rows, total: countResult.rows[0].total };
}

/**
 * Admin list — all bookings with optional filters.
 *
 * @param {object} filters  — { status?, listing_id?, guest_id? }
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<{ rows: object[], total: number }>}
 */
export async function listAdmin(filters, limit, offset) {
  const conditions = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`b.status = $${params.length}`);
  }
  if (filters.listing_id) {
    params.push(filters.listing_id);
    conditions.push(`b.listing_id = $${params.length}`);
  }
  if (filters.guest_id) {
    params.push(filters.guest_id);
    conditions.push(`b.guest_id = $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM bookings b ${whereClause}`,
    params
  );

  params.push(limit, offset);
  const rowsResult = await query(
    `SELECT b.*,
            l.title_en AS listing_title_en,
            l.images AS listing_images,
            u.email AS guest_email,
            u.full_name AS guest_name
     FROM bookings b
     JOIN listings l ON l.id = b.listing_id
     JOIN users u ON u.id = b.guest_id
     ${whereClause}
     ORDER BY b.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return { rows: rowsResult.rows, total: countResult.rows[0].total };
}

/* ── Writes ──────────────────────────────────────────────────────────────── */

/**
 * Creates a booking. Retries once on a booking-code collision.
 *
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function create(data) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const code = generateBookingCode();
    try {
      const result = await query(
        `INSERT INTO bookings (
           code, listing_id, guest_id,
           rent_mode, check_in, check_out, months, guests,
           nightly_or_monthly_rate, subtotal, cleaning_fee, service_fee, total, currency,
           commission_rate, commission_amount, status
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8::jsonb,
           $9, $10, $11, $12, $13, $14, $15, $16, $17
         )
         RETURNING *`,
        [
          code,
          data.listing_id,
          data.guest_id,
          data.rent_mode,
          data.check_in,
          data.check_out || null,
          data.months || null,
          JSON.stringify(data.guests),
          data.nightly_or_monthly_rate,
          data.subtotal,
          data.cleaning_fee,
          data.service_fee,
          data.total,
          data.currency || 'ETB',
          data.commission_rate,
          data.commission_amount,
          data.status || 'pending_payment',
        ]
      );
      return result.rows[0];
    } catch (err) {
      /* Postgres unique violation on booking.code → retry */
      if (err.code === '23505' && attempt === 0) continue;
      throw err;
    }
  }
  throw new Error('[booking] failed to generate unique booking code');
}

/**
 * Updates the booking status. Called after payment verification or
 * cancellation. Records a booking_event entry.
 *
 * @param {object} params
 * @param {string} params.id
 * @param {string} params.status
 * @param {string|null} [params.reason]
 * @param {string|null} [params.actorId]
 * @param {string|null} [params.eventType]
 * @param {object|null} [params.payload]
 * @returns {Promise<object|null>}
 */
export async function setStatus({ id, status, reason = null, actorId = null, eventType = null, payload = null }) {
  return withTransaction(async (tx) => {
    const result = await tx.query(
      `UPDATE bookings
       SET status = $1,
           cancellation_reason = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, reason, id]
    );
    const row = result.rows[0] || null;
    if (!row) return null;

    if (eventType) {
      await tx.query(
        `INSERT INTO booking_events (booking_id, actor_id, event_type, payload)
         VALUES ($1, $2, $3, $4::jsonb)`,
        [id, actorId, eventType, JSON.stringify(payload || {})]
      );
    }

    return row;
  });
}

/**
 * Appends an event to the booking history.
 *
 * @param {object} params
 * @param {string} params.booking_id
 * @param {string|null} params.actor_id
 * @param {string} params.event_type
 * @param {object} [params.payload]
 */
export async function recordEvent({ booking_id, actor_id = null, event_type, payload = {} }) {
  await query(
    `INSERT INTO booking_events (booking_id, actor_id, event_type, payload)
     VALUES ($1, $2, $3, $4::jsonb)`,
    [booking_id, actor_id, event_type, JSON.stringify(payload)]
  );
}

export default Object.freeze({
  generateBookingCode,
  findById,
  findByCode,
  listByGuest,
  listAdmin,
  create,
  setStatus,
  recordEvent,
});