/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Favorite Model
 * Path: apps/api/src/models/favorite.model.js
 *
 * Purpose:
 *   SQL for the `favorites` join table (user ↔ listing saved stays).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { query } from '../db/pool.js';

/**
 * Lists all favorites for a user, joined with listing summary data.
 *
 * @param {string} userId
 * @returns {Promise<Array<object>>}
 */
export async function listByUser(userId) {
  const result = await query(
    `SELECT f.created_at AS saved_at,
            l.id, l.title_en, l.title_am, l.city, l.property_type,
            l.short_rate, l.long_rate, l.currency, l.images, l.is_verified
     FROM favorites f
     JOIN listings l ON l.id = f.listing_id
     WHERE f.user_id = $1
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return result.rows;
}

/**
 * @param {string} userId
 * @param {string} listingId
 * @returns {Promise<boolean>}
 */
export async function exists(userId, listingId) {
  const result = await query(
    'SELECT 1 FROM favorites WHERE user_id = $1 AND listing_id = $2 LIMIT 1',
    [userId, listingId]
  );
  return result.rowCount > 0;
}

/**
 * @param {string} userId
 * @param {string} listingId
 */
export async function add(userId, listingId) {
  await query(
    `INSERT INTO favorites (user_id, listing_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, listing_id) DO NOTHING`,
    [userId, listingId]
  );
}

/**
 * @param {string} userId
 * @param {string} listingId
 * @returns {Promise<boolean>}
 */
export async function remove(userId, listingId) {
  const result = await query(
    'DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2 RETURNING user_id',
    [userId, listingId]
  );
  return result.rowCount > 0;
}

export default Object.freeze({ listByUser, exists, add, remove });