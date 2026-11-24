/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Banner Model
 * Path: apps/api/src/models/banner.model.js
 *
 * Purpose:
 *   All SQL touching `banners`. Banners are scheduled promotions shown in
 *   fixed placements (top_bar, home_hero, listing_top).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { query } from '../db/pool.js';

/* ── Reads ───────────────────────────────────────────────────────────────── */

/**
 * Returns currently-eligible banners for a placement. Eligible means:
 *   is_active = TRUE
 *   AND (starts_at IS NULL OR starts_at <= NOW())
 *   AND (ends_at   IS NULL OR ends_at   >= NOW())
 *
 * @param {string} placement
 * @returns {Promise<Array<object>>}
 */
export async function findActiveByPlacement(placement) {
  const result = await query(
    `SELECT id, placement, message_en, message_am, link_url, link_label_en, link_label_am,
            bg_color, fg_color, dismissible
     FROM banners
     WHERE placement = $1
       AND is_active = TRUE
       AND (starts_at IS NULL OR starts_at <= NOW())
       AND (ends_at   IS NULL OR ends_at   >= NOW())
     ORDER BY created_at DESC`,
    [placement]
  );
  return result.rows;
}

/**
 * Returns every banner (active or not). Admin only.
 *
 * @returns {Promise<Array<object>>}
 */
export async function findAll() {
  const result = await query(
    `SELECT id, placement, message_en, message_am, link_url, link_label_en, link_label_am,
            bg_color, fg_color, starts_at, ends_at, is_active, dismissible, created_at, updated_at
     FROM banners
     ORDER BY created_at DESC`
  );
  return result.rows;
}

/**
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function findById(id) {
  const result = await query(
    `SELECT id, placement, message_en, message_am, link_url, link_label_en, link_label_am,
            bg_color, fg_color, starts_at, ends_at, is_active, dismissible, created_at, updated_at
     FROM banners
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
}

/* ── Writes ──────────────────────────────────────────────────────────────── */

/**
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function create(data) {
  const result = await query(
    `INSERT INTO banners
       (placement, message_en, message_am, link_url, link_label_en, link_label_am,
        bg_color, fg_color, starts_at, ends_at, is_active, dismissible)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      data.placement,
      data.message_en,
      data.message_am,
      data.link_url || null,
      data.link_label_en || null,
      data.link_label_am || null,
      data.bg_color,
      data.fg_color,
      data.starts_at || null,
      data.ends_at || null,
      data.is_active === undefined ? true : data.is_active,
      data.dismissible === undefined ? true : data.dismissible,
    ]
  );
  return result.rows[0];
}

/**
 * @param {string} id
 * @param {object} patch
 * @returns {Promise<object|null>}
 */
export async function update(id, patch) {
  const fields = [];
  const params = [];

  const columns = [
    'placement',
    'message_en',
    'message_am',
    'link_url',
    'link_label_en',
    'link_label_am',
    'bg_color',
    'fg_color',
    'starts_at',
    'ends_at',
    'is_active',
    'dismissible',
  ];

  for (const col of columns) {
    if (Object.prototype.hasOwnProperty.call(patch, col)) {
      params.push(patch[col]);
      fields.push(`${col} = $${params.length}`);
    }
  }

  if (fields.length === 0) return findById(id);

  params.push(id);
  const result = await query(
    `UPDATE banners
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${params.length}
     RETURNING *`,
    params
  );
  return result.rows[0] || null;
}

/**
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function remove(id) {
  const result = await query('DELETE FROM banners WHERE id = $1 RETURNING id', [id]);
  return result.rowCount > 0;
}

export default Object.freeze({
  findActiveByPlacement,
  findAll,
  findById,
  create,
  update,
  remove,
});