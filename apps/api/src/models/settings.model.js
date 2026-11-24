/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Settings Model
 * Path: apps/api/src/models/settings.model.js
 *
 * Purpose:
 *   Every SQL query touching the `settings` table. Parameterized only.
 *   No business logic — validation and merging live in the service layer.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { query } from '../db/pool.js';

/**
 * Retrieves every settings row. Used by the config service to build a full
 * runtime map in one query.
 *
 * @returns {Promise<Array<object>>}
 */
export async function findAll() {
  const result = await query(
    `SELECT key, value, type, category, label_en, label_am, description, is_public, updated_at
     FROM settings
     ORDER BY category, key`
  );
  return result.rows;
}

/**
 * Retrieves only settings marked is_public. Used by /config/public.
 *
 * @returns {Promise<Array<object>>}
 */
export async function findPublic() {
  const result = await query(
    `SELECT key, value
     FROM settings
     WHERE is_public = TRUE
     ORDER BY key`
  );
  return result.rows;
}

/**
 * Retrieves a single setting row by key.
 *
 * @param {string} key
 * @returns {Promise<object|null>}
 */
export async function findByKey(key) {
  const result = await query(
    `SELECT key, value, type, category, label_en, label_am, description, is_public, updated_at
     FROM settings
     WHERE key = $1
     LIMIT 1`,
    [key]
  );
  return result.rows[0] || null;
}

/**
 * Upserts a setting value. `updated_by` may be null for system writes.
 * All other fields (type, category, labels) are set by the seed and never
 * modified by this method — only `value` and `updated_by` change.
 *
 * @param {object} data
 * @param {string} data.key
 * @param {*} data.value
 * @param {string|null} data.updated_by
 * @returns {Promise<object|null>}
 */
export async function upsertValue({ key, value, updated_by }) {
  const result = await query(
    `UPDATE settings
     SET value = $1::jsonb,
         updated_by = $2,
         updated_at = NOW()
     WHERE key = $3
     RETURNING key, value, type, category, label_en, label_am, description, is_public, updated_at`,
    [JSON.stringify(value), updated_by, key]
  );
  return result.rows[0] || null;
}

export default Object.freeze({
  findAll,
  findPublic,
  findByKey,
  upsertValue,
});