/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Bank Account Model
 * Path: apps/api/src/models/bankAccount.model.js
 *
 * Purpose:
 *   All SQL touching `bank_accounts`. Admin-managed content shown to guests
 *   during manual payment. Soft delete via `is_active = false` so existing
 *   payment records remain valid.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { query } from '../db/pool.js';

/* ── Reads ───────────────────────────────────────────────────────────────── */

/**
 * Returns active accounts ordered by display_order.
 * Public — safe to send unauthenticated.
 *
 * @returns {Promise<Array<object>>}
 */
export async function findAllActive() {
  const result = await query(
    `SELECT id, name, provider, account_name, account_number, instructions, logo_url, display_order
     FROM bank_accounts
     WHERE is_active = TRUE
     ORDER BY display_order ASC, created_at ASC`
  );
  return result.rows;
}

/**
 * Returns every account, active or not. Admin only.
 *
 * @returns {Promise<Array<object>>}
 */
export async function findAll() {
  const result = await query(
    `SELECT id, name, provider, account_name, account_number, instructions, logo_url,
            is_active, display_order, created_at, updated_at
     FROM bank_accounts
     ORDER BY display_order ASC, created_at ASC`
  );
  return result.rows;
}

/**
 * Finds a single account by id.
 *
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function findById(id) {
  const result = await query(
    `SELECT id, name, provider, account_name, account_number, instructions, logo_url,
            is_active, display_order, created_at, updated_at
     FROM bank_accounts
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
}

/* ── Writes ──────────────────────────────────────────────────────────────── */

/**
 * Inserts a new bank account.
 *
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function create(data) {
  const result = await query(
    `INSERT INTO bank_accounts
       (name, provider, account_name, account_number, instructions, logo_url, is_active, display_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, name, provider, account_name, account_number, instructions, logo_url,
               is_active, display_order, created_at, updated_at`,
    [
      data.name,
      data.provider,
      data.account_name,
      data.account_number,
      data.instructions || null,
      data.logo_url || null,
      data.is_active === undefined ? true : data.is_active,
      data.display_order === undefined ? 0 : data.display_order,
    ]
  );
  return result.rows[0];
}

/**
 * Updates any subset of mutable fields. Only the provided keys are written.
 *
 * @param {string} id
 * @param {object} patch
 * @returns {Promise<object|null>}
 */
export async function update(id, patch) {
  const fields = [];
  const params = [];

  const columns = [
    'name',
    'provider',
    'account_name',
    'account_number',
    'instructions',
    'logo_url',
    'is_active',
    'display_order',
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
    `UPDATE bank_accounts
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${params.length}
     RETURNING id, name, provider, account_name, account_number, instructions, logo_url,
               is_active, display_order, created_at, updated_at`,
    params
  );
  return result.rows[0] || null;
}

/**
 * Soft-deletes an account by flipping `is_active = false`.
 *
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function deactivate(id) {
  const result = await query(
    `UPDATE bank_accounts
     SET is_active = FALSE, updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, is_active, updated_at`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Hard-deletes an account. Reserved for records that were never referenced
 * by a payment — the service layer guards against deleting referenced rows.
 *
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function hardDelete(id) {
  const result = await query('DELETE FROM bank_accounts WHERE id = $1 RETURNING id', [id]);
  return result.rowCount > 0;
}

/**
 * Checks whether any payment references this bank account.
 * Used before a hard delete to preserve FK integrity.
 *
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function isReferencedByPayments(id) {
  const result = await query(
    'SELECT 1 FROM payments WHERE bank_account_id = $1 LIMIT 1',
    [id]
  );
  return result.rowCount > 0;
}

export default Object.freeze({
  findAllActive,
  findAll,
  findById,
  create,
  update,
  deactivate,
  hardDelete,
  isReferencedByPayments,
});