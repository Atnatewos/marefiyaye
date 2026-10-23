/**
 * @file apps/api/src/queries/reviews.queries.js
 *
 * SQL for reviews.
 *
 * Why this file exists:
 *   - Review submission inserts the review + updates the property's aggregate
 *     rating in one transaction.
 *   - Listing reviews for a property joins with author (guest) info.
 *   - All parameterized.
 */

import { query } from '../config/db.js';
import { TABLES } from '@marefiyaye/config/database';

/**
 * Insert a review. Must be inside a transaction.
 */
export async function insertReview(client, data) {
  const { rows } = await client.query(
    `INSERT INTO ${TABLES.REVIEWS}
       (booking_id, property_id, author_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.bookingId, data.propertyId, data.authorId, data.rating, data.comment || null]
  );
  return rows[0];
}

/**
 * Recalculates rating_avg + review_count for a property.
 * Must be called inside a transaction AFTER insertReview.
 */
export async function refreshPropertyAggregates(client, propertyId) {
  await client.query(
    `UPDATE ${TABLES.PROPERTIES} p
     SET rating_avg = COALESCE((
           SELECT ROUND(AVG(r.rating)::numeric, 2)
           FROM ${TABLES.REVIEWS} r
           WHERE r.property_id = p.id
         ), 0),
         review_count = (
           SELECT COUNT(*)::int
           FROM ${TABLES.REVIEWS} r
           WHERE r.property_id = p.id
         )
     WHERE p.id = $1`,
    [propertyId]
  );
}

/**
 * Lists all reviews for a property, with author info.
 */
export async function findReviewsByProperty(propertyId, limit = 20, offset = 0) {
  const { rows } = await query(
    `SELECT
       r.*,
       u.full_name AS author_name,
       u.avatar_url AS author_avatar
     FROM ${TABLES.REVIEWS} r
     JOIN ${TABLES.USERS} u ON u.id = r.author_id
     WHERE r.property_id = $1
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [propertyId, limit, offset]
  );
  return rows;
}

/**
 * Checks if a guest already reviewed a booking.
 * Used to prevent duplicate reviews.
 */
export async function findReviewByBooking(bookingId) {
  const { rows } = await query(
    `SELECT id FROM ${TABLES.REVIEWS} WHERE booking_id = $1 LIMIT 1`,
    [bookingId]
  );
  return rows[0] || null;
}

/**
 * Lists all reviews for admin moderation.
 */
export async function findReviewsForAdmin(limit = 50, offset = 0) {
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