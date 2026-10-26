/**
 * @file apps/api/src/queries/wishlist.queries.js
 *
 * SQL for the wishlist feature.
 *
 * Why this file exists:
 *   - Guests can save properties to revisit later.
 *   - One row per (user, property) pair — composite primary key prevents dupes.
 *   - Joined with the properties table so the frontend gets full listing cards.
 */

import { query } from '../config/db.js';
import { TABLES } from '@marefiyaye/config/database';

/**
 * Lists all wishlist entries for a user with full property data.
 *
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
export async function findWishlistByUser(userId) {
  const { rows } = await query(
    `SELECT
       w.created_at AS saved_at,
       p.id, p.slug, p.title, p.title_am, p.category, p.city, p.neighborhood,
       p.stay_type, p.nightly_rate_etb, p.monthly_rate_etb,
       p.images, p.rating_avg, p.review_count,
       p.is_verified
     FROM ${TABLES.WISHLISTS} w
     JOIN ${TABLES.PROPERTIES} p ON p.id = w.property_id
     WHERE w.user_id = $1
     ORDER BY w.created_at DESC`,
    [userId]
  );
  return rows;
}

/**
 * Adds a property to the user's wishlist. Idempotent.
 */
export async function addToWishlist(userId, propertyId) {
  const { rows } = await query(
    `INSERT INTO ${TABLES.WISHLISTS} (user_id, property_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, property_id) DO NOTHING
     RETURNING *`,
    [userId, propertyId]
  );
  return rows[0] || null;
}

/**
 * Removes a property from the user's wishlist.
 */
export async function removeFromWishlist(userId, propertyId) {
  const { rowCount } = await query(
    `DELETE FROM ${TABLES.WISHLISTS} WHERE user_id = $1 AND property_id = $2`,
    [userId, propertyId]
  );
  return rowCount > 0;
}

/**
 * Checks whether a property is wishlisted by a specific user.
 */
export async function isWishlisted(userId, propertyId) {
  const { rows } = await query(
    `SELECT 1 FROM ${TABLES.WISHLISTS} WHERE user_id = $1 AND property_id = $2 LIMIT 1`,
    [userId, propertyId]
  );
  return rows.length > 0;
}