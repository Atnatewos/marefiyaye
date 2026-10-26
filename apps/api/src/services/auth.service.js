/**
 * @file apps/api/src/services/auth.service.js
 *
 * Authentication business logic.
 *
 * Why this file exists:
 *   - Routes stay thin — controllers call `authenticate()`, `getUserById()`.
 *   - Password comparison, JWT signing, and role checks live in one place.
 *   - No Express imports — service is unit-testable and reusable from scripts.
 *
 * Critical detail — ADMIN tokens MUST be signed with the admin secret:
 *   - `generateAdminToken` signs with `ADMIN_JWT_SECRET`.
 *   - `adminAuthGuard` verifies with `ADMIN_JWT_SECRET`.
 *   - Using `generateToken` (guest secret) here would cause the guard to
 *     reject every admin request as "Invalid or expired admin token".
 */

import { query } from '../config/db.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateToken, generateAdminToken } from '../utils/jwt.js';
import { ConflictError, UnauthorizedError } from '../utils/errors.js';

/**
 * Creates a new user.
 *
 * @param {object} data - { fullName, email, phone, password, role }
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function register(data) {
  const { fullName, email, phone, password, role } = data;

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new ConflictError('Email is already registered');
  }

  const passwordHash = await hashPassword(password);

  const result = await query(
    `INSERT INTO users (full_name, email, phone, password_hash, role, is_verified)
     VALUES ($1, $2, $3, $4, $5, FALSE)
     RETURNING id, full_name, email, role, is_verified`,
    [fullName, email, phone, passwordHash, role]
  );

  const user = result.rows[0];
  const token = generateToken({ id: user.id, role: user.role });

  return { user, token };
}

/**
 * Authenticates a guest/host user.
 */
export async function login(email, password) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (user.role === 'ADMIN') {
    throw new UnauthorizedError('Use the admin login portal');
  }

  const token = generateToken({ id: user.id, role: user.role });
  return { user: formatUser(user), token };
}

/**
 * Authenticates an admin.
 *
 * Signs the JWT with the admin secret — the corresponding `adminAuthGuard`
 * verifies with the same secret. Guests and admins have DISTINCT secrets so
 * a guest token can never unlock admin endpoints, and vice versa.
 */
export async function adminLogin(email, password) {
  const result = await query(
    'SELECT * FROM users WHERE email = $1 AND role = $2',
    [email, 'ADMIN']
  );
  const user = result.rows[0];

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new UnauthorizedError('Invalid admin credentials');
  }

  const token = generateAdminToken({ id: user.id, role: user.role });
  return { user: formatUser(user), token };
}

export async function getUserById(id) {
  const result = await query(
    'SELECT id, email, full_name, role, is_verified, avatar_url, phone FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

/**
 * Updates a user's profile fields (name, phone, avatar).
 * Only provided fields are updated.
 *
 * @param {string} userId
 * @param {{ fullName?: string, phone?: string, avatarUrl?: string }} patch
 * @returns {Promise<object>} Updated public user.
 */
export async function updateProfile(userId, patch) {
  const fields = [];
  const params = [userId];

  if (patch.fullName !== undefined) {
    params.push(patch.fullName);
    fields.push(`full_name = $${params.length}`);
  }
  if (patch.phone !== undefined) {
    params.push(patch.phone);
    fields.push(`phone = $${params.length}`);
  }
  if (patch.avatarUrl !== undefined) {
    params.push(patch.avatarUrl);
    fields.push(`avatar_url = $${params.length}`);
  }

  if (fields.length === 0) {
    return getUserById(userId);
  }

  const { rows } = await query(
    `UPDATE users SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $1
     RETURNING id, email, full_name, role, is_verified, avatar_url, phone`,
    params
  );
  return rows[0];
}

function formatUser(dbUser) {
  return {
    id: dbUser.id,
    fullName: dbUser.full_name,
    email: dbUser.email,
    role: dbUser.role,
    isVerified: dbUser.is_verified,
    avatarUrl: dbUser.avatar_url,
  };
}