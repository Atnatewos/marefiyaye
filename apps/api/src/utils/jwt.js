/**
 * @file apps/api/src/utils/jwt.js
 *
 * JWT generation and verification.
 *
 * Why this file exists:
 *   - Two distinct secrets: one for guests/hosts, one for admins.
 *   - Centralizing the signing/verify logic prevents secret drift.
 *   - Every token includes BOTH `id` and `sub` claims. Routes that use
 *     `req.user.sub` (standard JWT claim name) and routes that use
 *     `req.user.id` (internal convention) both work.
 */

import jwt from 'jsonwebtoken';
import { apiEnv } from '../config/env.js';
import { UnauthorizedError } from './errors.js';

export const JWT_CONFIG = {
  secret: apiEnv.JWT_SECRET,
  expiresIn: '7d',
  cookieName: 'token',
  maxAgeMs: 7 * 24 * 60 * 60 * 1000,
};

export const ADMIN_JWT_CONFIG = {
  secret: apiEnv.ADMIN_JWT_SECRET,
  expiresIn: '12h',
  cookieName: 'admin_token',
  maxAgeMs: 12 * 60 * 60 * 1000,
};

/**
 * Signs a guest/host JWT.
 *
 * @param {{ id: string, role: string }} payload
 * @returns {string}
 */
export function generateToken(payload) {
  return jwt.sign(
    { id: payload.id, sub: payload.id, role: payload.role },
    JWT_CONFIG.secret,
    { expiresIn: JWT_CONFIG.expiresIn }
  );
}

/**
 * Verifies a guest/host JWT.
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_CONFIG.secret);
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

/**
 * Signs an admin JWT.
 *
 * @param {{ id: string, role: string }} payload
 * @returns {string}
 */
export function generateAdminToken(payload) {
  return jwt.sign(
    { id: payload.id, sub: payload.id, role: payload.role },
    ADMIN_JWT_CONFIG.secret,
    { expiresIn: ADMIN_JWT_CONFIG.expiresIn }
  );
}

/**
 * Verifies an admin JWT.
 */
export function verifyAdminToken(token) {
  try {
    return jwt.verify(token, ADMIN_JWT_CONFIG.secret);
  } catch {
    throw new UnauthorizedError('Invalid or expired admin token');
  }
}