/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — User Model
 * Path: apps/api/src/models/user.model.js
 *
 * Purpose:
 *   All SQL touching the `users` table lives here. Every query is
 *   parameterized. No business logic — that belongs in the service layer.
 *
 * Column whitelist:
 *   The `SAFE_USER_COLUMNS` constant defines which columns may leave the
 *   database toward the API. Password hashes NEVER appear in responses.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { query } from '../db/pool.js';

/* ── Safe Column Projection ──────────────────────────────────────────────── */

const SAFE_USER_COLUMNS = `
  id,
  email,
  phone,
  full_name,
  role,
  preferred_lang,
  status,
  email_verified,
  phone_verified,
  last_login_at,
  created_at,
  updated_at
`;

/* ── Reads ───────────────────────────────────────────────────────────────── */

/**
 * Finds a user by id. Returns safe fields only.
 *
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function findById(id) {
  const result = await query(
    `SELECT ${SAFE_USER_COLUMNS} FROM users WHERE id = $1 LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Finds a user by email — case-insensitive.
 * Returns safe fields only.
 *
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export async function findByEmail(email) {
  const result = await query(
    `SELECT ${SAFE_USER_COLUMNS} FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    [email]
  );
  return result.rows[0] || null;
}

/**
 * Finds a user by email INCLUDING password_hash — used only by the login
 * flow. Never expose this result directly.
 *
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export async function findByEmailWithPassword(email) {
  const result = await query(
    `SELECT ${SAFE_USER_COLUMNS}, password_hash FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    [email]
  );
  return result.rows[0] || null;
}

/**
 * Finds a user by phone — used to enforce uniqueness on register.
 *
 * @param {string} phone
 * @returns {Promise<object|null>}
 */
export async function findByPhone(phone) {
  const result = await query(
    `SELECT ${SAFE_USER_COLUMNS} FROM users WHERE phone = $1 LIMIT 1`,
    [phone]
  );
  return result.rows[0] || null;
}

/**
 * Lists users with optional role/status filters and pagination.
 *
 * @param {object} params
 * @param {string} [params.role]
 * @param {string} [params.status]
 * @param {number} params.limit
 * @param {number} params.offset
 * @returns {Promise<{ rows: object[], total: number }>}
 */
export async function list({ role, status, limit, offset }) {
  const conditions = [];
  const params = [];

  if (role) {
    params.push(role);
    conditions.push(`role = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM users ${whereClause}`,
    params
  );

  params.push(limit, offset);
  const rowsResult = await query(
    `SELECT ${SAFE_USER_COLUMNS}
     FROM users
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return { rows: rowsResult.rows, total: countResult.rows[0].total };
}

/* ── Writes ──────────────────────────────────────────────────────────────── */

/**
 * Creates a new user. Returns safe fields.
 *
 * @param {object} data
 * @param {string} data.email
 * @param {string|null} data.phone
 * @param {string} data.password_hash
 * @param {string} data.full_name
 * @param {string} data.role
 * @param {string} data.preferred_lang
 * @returns {Promise<object>}
 */
export async function create(data) {
  const result = await query(
    `INSERT INTO users (email, phone, password_hash, full_name, role, preferred_lang, status)
     VALUES (LOWER($1), $2, $3, $4, $5, $6, 'active')
     RETURNING ${SAFE_USER_COLUMNS}`,
    [
      data.email,
      data.phone || null,
      data.password_hash,
      data.full_name,
      data.role,
      data.preferred_lang,
    ]
  );
  return result.rows[0];
}

/**
 * Updates the last_login_at timestamp.
 *
 * @param {string} id
 */
export async function touchLastLogin(id) {
  await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [id]);
}

/**
 * Updates the password hash.
 *
 * @param {string} id
 * @param {string} passwordHash
 */
export async function updatePasswordHash(id, passwordHash) {
  await query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [passwordHash, id]
  );
}

/**
 * Updates the user's preferred language.
 *
 * @param {string} id
 * @param {string} preferredLang
 */
export async function updatePreferredLanguage(id, preferredLang) {
  await query(
    'UPDATE users SET preferred_lang = $1, updated_at = NOW() WHERE id = $2',
    [preferredLang, id]
  );
}

/**
 * Suspends a user account.
 *
 * @param {string} id
 */
export async function suspend(id) {
  await query(
    "UPDATE users SET status = 'suspended', updated_at = NOW() WHERE id = $1",
    [id]
  );
}

/**
 * Reactivates a suspended user account.
 *
 * @param {string} id
 */
export async function reactivate(id) {
  await query(
    "UPDATE users SET status = 'active', updated_at = NOW() WHERE id = $1",
    [id]
  );
}

export default Object.freeze({
  findById,
  findByEmail,
  findByEmailWithPassword,
  findByPhone,
  list,
  create,
  touchLastLogin,
  updatePasswordHash,
  updatePreferredLanguage,
  suspend,
  reactivate,
});