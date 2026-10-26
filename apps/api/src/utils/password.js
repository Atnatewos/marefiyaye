/**
 * @file apps/api/src/utils/password.js
 *
 * Password hashing utilities.
 *
 * Why this file exists:
 *   - Passwords must NEVER be stored in plain text.
 *   - bcrypt automatically generates a random salt per hash.
 *   - Centralizing the hashing logic makes a future algorithm migration easy.
 */

import bcrypt from 'bcryptjs';

/**
 * The number of salt rounds for bcrypt.
 * 10 is the standard industry default — secure and performant.
 */
const BCRYPT_ROUNDS = 10;

/**
 * Hashes a plaintext password.
 *
 * @param {string} password - The plaintext password.
 * @returns {Promise<string>} The bcrypt hash.
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Compares a plaintext password against a hash.
 *
 * @param {string} password - The plaintext password from the login form.
 * @param {string} hash - The hash stored in the database.
 * @returns {Promise<boolean>} True if the password matches.
 */
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}