/**
 * @file apps/api/src/queries/bookings.queries.js
 *
 * SQL query functions for bookings and payments.
 *
 * Why this file exists:
 *   - All booking-related SQL in one place.
 *   - Every query parameterized — no interpolation.
 *   - Overlap detection uses a `FOR UPDATE` lock to prevent race conditions
 *     between two simultaneous bookings on the same property.
 */

import { query } from '../config/db.js';
import { TABLES } from '@marefiyaye/config/database';

/**
 * Checks whether any CONFIRMED or AWAITING_VERIFICATION booking overlaps
 * with the requested range for the given property.
 * Uses `FOR UPDATE` — must be called INSIDE a transaction.
 *
 * @param {import('pg').PoolClient} client - Transaction client.
 * @param {string} propertyId
 * @param {string} checkIn
 * @param {string} checkOut
 * @returns {Promise<boolean>} True when a conflict exists.
 */
export async function findBookingConflicts(client, propertyId, checkIn, checkOut) {
  const { rows } = await client.query(
    `SELECT 1
     FROM ${TABLES.BOOKINGS}
     WHERE property_id = $1
       AND status IN ('CONFIRMED', 'AWAITING_VERIFICATION')
       AND check_in < $3
       AND check_out > $2
     FOR UPDATE`,
    [propertyId, checkIn, checkOut]
  );
  return rows.length > 0;
}

/**
 * Inserts a booking.
 * Must be called inside a transaction.
 *
 * @param {import('pg').PoolClient} client
 * @param {object} data
 * @returns {Promise<object>} Created booking row.
 */
export async function insertBooking(client, data) {
  const { rows } = await client.query(
    `INSERT INTO ${TABLES.BOOKINGS}
       (property_id, guest_id, check_in, check_out, guests, nights,
        nightly_rate_snapshot, base_amount, service_fee, total_etb, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PENDING')
     RETURNING *`,
    [
      data.propertyId,
      data.guestId,
      data.checkIn,
      data.checkOut,
      data.guests,
      data.nights,
      data.nightlyRateSnapshot,
      data.baseAmount,
      data.serviceFee,
      data.totalEtb,
    ]
  );
  return rows[0];
}

/**
 * Fetches all bookings for a guest with property info joined.
 *
 * @param {string} guestId
 * @returns {Promise<object[]>}
 */
export async function findBookingsByGuest(guestId) {
  const { rows } = await query(
    `SELECT b.*,
            p.slug AS property_slug,
            p.title AS property_title,
            p.title_am AS property_title_am,
            p.city AS property_city,
            p.neighborhood AS property_neighborhood,
            p.images AS property_images
     FROM ${TABLES.BOOKINGS} b
     JOIN ${TABLES.PROPERTIES} p ON p.id = b.property_id
     WHERE b.guest_id = $1
     ORDER BY b.created_at DESC`,
    [guestId]
  );
  return rows;
}

/**
 * Fetches a booking by ID.
 *
 * @param {string} id
 */
export async function findBookingById(id) {
  const { rows } = await query(
    `SELECT * FROM ${TABLES.BOOKINGS} WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Updates a booking's status.
 * Must be called inside a transaction when part of a larger flow.
 *
 * @param {object} data
 * @returns {Promise<object>} Updated row.
 */
export async function updateBookingStatus(client, id, status) {
  const { rows } = await client.query(
    `UPDATE ${TABLES.BOOKINGS} SET status = $2 WHERE id = $1 RETURNING *`,
    [id, status]
  );
  return rows[0];
}

/**
 * Inserts a payment record.
 * Must be called inside a transaction.
 */
export async function insertPayment(client, data) {
  const { rows } = await client.query(
    `INSERT INTO ${TABLES.PAYMENTS}
       (booking_id, lease_application_id, method, amount_etb,
        reference_code, receipt_url, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'AWAITING_VERIFICATION')
     RETURNING *`,
    [
      data.bookingId || null,
      data.leaseApplicationId || null,
      data.method,
      data.amountEtb,
      data.referenceCode,
      data.receiptUrl || null,
    ]
  );
  return rows[0];
}

/**
 * Fetches all payments for a guest's bookings.
 */
export async function findPaymentsByGuest(guestId) {
  const { rows } = await query(
    `SELECT pay.*,
            b.total_etb AS booking_total,
            b.check_in AS booking_check_in,
            b.check_out AS booking_check_out,
            p.title AS property_title
     FROM ${TABLES.PAYMENTS} pay
     LEFT JOIN ${TABLES.BOOKINGS} b ON b.id = pay.booking_id
     LEFT JOIN ${TABLES.PROPERTIES} p ON p.id = b.property_id
     WHERE b.guest_id = $1
     ORDER BY pay.created_at DESC`,
    [guestId]
  );
  return rows;
}