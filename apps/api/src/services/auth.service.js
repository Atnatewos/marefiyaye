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
 * Contract: services return plain objects or throw typed errors. Controllers
 * translate to HTTP responses.
 */

import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { signGuestToken, signAdminToken } from '../utils/jwt.js';
import { UnauthorizedError, NotFoundError } from '../utils/errors.js';

/**
 * Finds a user by email — returns the row or null.
 * Explicit column list (never SELECT *) so password hashes are the only
 * extra column the auth service sees.
 *
 * @param {string} email
 * @returns {Promise<{id: string, email: string, full_name: string, password_hash: string, role: string, is_verified: boolean, avatar_url: string|null} | null>}
 */
async function findUserByEmail(email) {
  const { rows } = await query(
    `SELECT id, email, full_name, password_hash, role, is_verified, avatar_url
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email]
  );
  return rows[0] ?? null;
}

/**
 * Finds a user by ID — returns the row or null.
 *
 * @param {string} id
 */
async function findUserById(id) {
  const { rows } = await query(
    `SELECT id, email, full_name, role, is_verified, avatar_url, phone, verification_level
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

/**
 * Returns a user-safe shape — strips password_hash and maps snake_case to camelCase.
 */
function toPublicUser(row) {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    isVerified: row.is_verified,
    avatarUrl: row.avatar_url,
    phone: row.phone || null,
    verificationLevel: row.verification_level ?? 0,
  };
}

/**
 * Authenticates a user with email/password.
 * Signs a GUEST token (guest or host); ADMIN users must use `authenticateAdmin`.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ token: string, user: object }>}
 * @throws {UnauthorizedError} When email or password is wrong.
 */
export async function authenticateGuest(credentials) {
  const row = await findUserByEmail(credentials.email);
  if (!row) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const passwordMatch = await bcrypt.compare(credentials.password, row.password_hash);
  if (!passwordMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Admin accounts cannot use the guest login endpoint
  if (row.role === 'ADMIN') {
    throw new UnauthorizedError('Admin accounts must sign in via the admin panel');
  }

  const token = signGuestToken({ sub: row.id, role: row.role });
  return { token, user: toPublicUser(row) };
}

/**
 * Authenticates an admin user.
 * Signs an ADMIN token with the separate admin secret.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ token: string, user: object }>}
 * @throws {UnauthorizedError} When email/password is wrong or user isn't ADMIN.
 */
export async function authenticateAdmin(credentials) {
  const row = await findUserByEmail(credentials.email);
  if (!row) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const passwordMatch = await bcrypt.compare(credentials.password, row.password_hash);
  if (!passwordMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (row.role !== 'ADMIN') {
    throw new UnauthorizedError('This account does not have admin access');
  }

  const token = signAdminToken({ sub: row.id, role: 'ADMIN' });
  return { token, user: toPublicUser(row) };
}

/**
 * Fetches a user by ID for the /me endpoint.
 *
 * @param {string} userId
 * @returns {Promise<object>}
 * @throws {NotFoundError} When the user does not exist (e.g. deleted account).
 */
export async function getUserById(userId) {
  const row = await findUserById(userId);
  if (!row) throw new NotFoundError('User');
  return toPublicUser(row);
}