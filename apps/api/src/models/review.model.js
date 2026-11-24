/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Review Model
 * Path: apps/api/src/models/review.model.js
 *
 * Purpose:
 *   SQL for the `reviews` table. One review per booking (enforced by unique
 *   constraint on booking_id). Rating 1-5, optional comment.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { query } from '../db/pool.js';

/**
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function findById(id) {
  const result = await query(
    `SELECT r.*, u.full_name AS guest_name
     FROM reviews r
     JOIN users u ON u.id = r.guest_id
     WHERE r.id = $1
     LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * @param {string} bookingId
 * @returns {Promise<object|null>}
 */
export async function findByBooking(bookingId) {
  const result = await query(
    `SELECT * FROM reviews WHERE booking_id = $1 LIMIT 1`,
    [bookingId]
  );
  return result.rows[0] || null;
}

/**
 * Lists visible reviews for a listing.
 *
 * @param {string} listingId
 * @returns {Promise<Array<object>>}
 */
export async function listForListing(listingId) {
  const result = await query(
    `SELECT r.id, r.rating, r.comment, r.created_at,
            u.full_name AS guest_name
     FROM reviews r
     JOIN users u ON u.id = r.guest_id
     WHERE r.listing_id = $1 AND r.is_visible = TRUE
     ORDER BY r.created_at DESC`,
    [listingId]
  );
  return result.rows;
}

/**
 * Computes the average rating + count for a listing (visible only).
 *
 * @param {string} listingId
 * @returns {Promise<{ average: number, count: number }>}
 */
export async function statsForListing(listingId) {
  const result = await query(
    `SELECT COALESCE(AVG(rating), 0)::numeric(10,2) AS average,
            COUNT(*)::int AS count
     FROM reviews
     WHERE listing_id = $1 AND is_visible = TRUE`,
    [listingId]
  );
  const row = result.rows[0];
  return { average: Number(row.average), count: row.count };
}

/**
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function create(data) {
  const result = await query(
    `INSERT INTO reviews (booking_id, listing_id, guest_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      data.booking_id,
      data.listing_id,
      data.guest_id,
      data.rating,
      data.comment || null,
    ]
  );
  return result.rows[0];
}

/**
 * Admin visibility toggle.
 *
 * @param {string} id
 * @param {boolean} isVisible
 * @returns {Promise<object|null>}
 */
export async function setVisibility(id, isVisible) {
  const result = await query(
    `UPDATE reviews SET is_visible = $1 WHERE id = $2 RETURNING *`,
    [isVisible, id]
  );
  return result.rows[0] || null;
}

export default Object.freeze({
  findById,
  findByBooking,
  listForListing,
  statsForListing,
  create,
  setVisibility,
});