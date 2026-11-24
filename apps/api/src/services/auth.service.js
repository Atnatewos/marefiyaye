/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Auth Service
 * Path: apps/api/src/services/auth.service.js
 *
 * Purpose:
 *   Business logic for every auth flow:
 *     - register / login / logout
 *     - refresh (rotate refresh token)
 *     - impersonate / stop impersonation
 *     - change password
 *
 *   Service layer is database-aware but HTTP-agnostic. Cookie setting and
 *   response formatting happen in the controller.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import dayjs from 'dayjs';
import config from '../config/env.js';
import { AppError } from '../middleware/error.middleware.js';
import { logger } from '../utils/logger.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashRefreshToken,
} from '../utils/jwt.js';
import userModel from '../models/user.model.js';
import refreshTokenModel from '../models/refreshToken.model.js';
import { ROLES, USER_STATUS } from '@marefiyaye/shared/constants';

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/**
 * Parses a `signRefreshToken` TTL string like `"7d"` into a Date.
 * Falls back to 7 days on parse failure.
 *
 * @param {string} expiresIn
 * @returns {Date}
 */
function computeRefreshExpiry(expiresIn) {
  const parts = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!parts) return dayjs().add(7, 'day').toDate();
  const value = Number(parts[1]);
  const unit = { s: 'second', m: 'minute', h: 'hour', d: 'day' }[parts[2]];
  return dayjs().add(value, unit).toDate();
}

/**
 * Issues both tokens and persists the refresh token hash.
 * Primitive used by every auth flow.
 *
 * @param {object} user  - safe user row
 * @param {object} meta  - { userAgent, ipAddress }
 * @param {string|null} [impersonatedBy] - admin id when impersonating
 * @returns {Promise<{ accessToken: string, refreshToken: string, user: object }>}
 */
async function issueTokens(user, meta, impersonatedBy = null) {
  const accessPayload = {
    sub: user.id,
    role: user.role,
    ...(impersonatedBy ? { impersonatedBy } : {}),
  };

  const accessToken = signAccessToken(accessPayload);
  const refreshToken = signRefreshToken({ sub: user.id });
  const refreshHash = hashRefreshToken(refreshToken);
  const refreshExpiry = computeRefreshExpiry(config.jwt.refreshExpires);

  await refreshTokenModel.create({
    user_id: user.id,
    token_hash: refreshHash,
    user_agent: meta.userAgent,
    ip_address: meta.ipAddress,
    expires_at: refreshExpiry,
  });

  return { accessToken, refreshToken, user };
}

/* ── Session Primitive ───────────────────────────────────────────────────── */

/**
 * Issues a fresh session for a user — no impersonation claim.
 * Used by login/register/refresh and by stop-impersonation.
 *
 * @param {object} user
 * @param {object} meta
 * @returns {Promise<{ accessToken, refreshToken, user }>}
 */
export async function issueSession(user, meta) {
  return issueTokens(user, meta, null);
}

/* ── Register ────────────────────────────────────────────────────────────── */

/**
 * @param {object} data
 * @param {object} meta
 * @returns {Promise<{ accessToken, refreshToken, user }>}
 */
export async function register(data, meta) {
  const existingEmail = await userModel.findByEmail(data.email);
  if (existingEmail) {
    throw new AppError({
      status: 409,
      code: 'auth.email_taken',
      message: 'errors.auth.emailTaken',
    });
  }

  if (data.phone) {
    const existingPhone = await userModel.findByPhone(data.phone);
    if (existingPhone) {
      throw new AppError({
        status: 409,
        code: 'auth.phone_taken',
        message: 'errors.auth.phoneTaken',
      });
    }
  }

  const password_hash = await hashPassword(data.password);

  const user = await userModel.create({
    email: data.email,
    phone: data.phone || null,
    password_hash,
    full_name: data.full_name,
    role: ROLES.GUEST,
    preferred_lang: data.preferred_lang || 'en',
  });

  logger.info('[auth] user registered', { userId: user.id, role: user.role });

  return issueTokens(user, meta);
}

/* ── Login ───────────────────────────────────────────────────────────────── */

/**
 * @param {object} data
 * @param {object} meta
 * @returns {Promise<{ accessToken, refreshToken, user }>}
 */
export async function login(data, meta) {
  const user = await userModel.findByEmailWithPassword(data.email);

  const dummyHash = '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalid';
  const passwordOk = user
    ? await verifyPassword(data.password, user.password_hash)
    : await verifyPassword(data.password, dummyHash);

  if (!user || !passwordOk) {
    throw new AppError({
      status: 401,
      code: 'auth.invalid_credentials',
      message: 'errors.auth.invalidCredentials',
    });
  }

  if (user.status === USER_STATUS.SUSPENDED) {
    throw new AppError({
      status: 403,
      code: 'auth.account_suspended',
      message: 'errors.auth.accountSuspended',
    });
  }

  await userModel.touchLastLogin(user.id);

  const { password_hash, ...safeUser } = user;

  logger.info('[auth] user logged in', { userId: user.id, role: user.role });

  return issueTokens(safeUser, meta);
}

/* ── Refresh ─────────────────────────────────────────────────────────────── */

/**
 * @param {string} rawRefreshToken
 * @param {object} meta
 * @returns {Promise<{ accessToken, refreshToken, user }>}
 */
export async function refresh(rawRefreshToken, meta) {
  let decoded;
  try {
    decoded = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AppError({
      status: 401,
      code: 'auth.invalid_refresh',
      message: 'errors.auth.refreshExpired',
    });
  }

  const tokenHash = hashRefreshToken(rawRefreshToken);
  const stored = await refreshTokenModel.findActiveByHash(tokenHash);

  if (!stored) {
    throw new AppError({
      status: 401,
      code: 'auth.refresh_not_found',
      message: 'errors.auth.refreshExpired',
    });
  }

  if (stored.user_id !== decoded.sub) {
    await refreshTokenModel.revokeById(stored.id);
    throw new AppError({
      status: 401,
      code: 'auth.refresh_mismatch',
      message: 'errors.auth.tokenInvalid',
    });
  }

  const user = await userModel.findById(stored.user_id);
  if (!user || user.status !== USER_STATUS.ACTIVE) {
    await refreshTokenModel.revokeById(stored.id);
    throw new AppError({
      status: 403,
      code: 'auth.account_unavailable',
      message: 'errors.auth.accountSuspended',
    });
  }

  await refreshTokenModel.revokeById(stored.id);

  return issueTokens(user, meta);
}

/* ── Logout ──────────────────────────────────────────────────────────────── */

/**
 * @param {string|null} rawRefreshToken
 */
export async function logout(rawRefreshToken) {
  if (!rawRefreshToken) return;
  const tokenHash = hashRefreshToken(rawRefreshToken);
  await refreshTokenModel.revokeByHash(tokenHash);
}

/* ── Impersonate ─────────────────────────────────────────────────────────── */

/**
 * Admin impersonates a target user. Returns a session bound to the target
 * user with an `impersonatedBy` claim.
 *
 * @param {object} params
 * @param {string} params.adminId
 * @param {string} params.targetUserId
 * @param {object} params.meta
 * @returns {Promise<{ accessToken, refreshToken, user }>}
 */
export async function impersonate({ adminId, targetUserId, meta }) {
  if (adminId === targetUserId) {
    throw new AppError({
      status: 400,
      code: 'admin.cannot_impersonate_self',
      message: 'errors.admin.cannotImpersonateSelf',
    });
  }

  const target = await userModel.findById(targetUserId);
  if (!target) {
    throw new AppError({
      status: 404,
      code: 'user.not_found',
      message: 'errors.notFound',
    });
  }

  if (target.status !== USER_STATUS.ACTIVE) {
    throw new AppError({
      status: 403,
      code: 'admin.target_unavailable',
      message: 'errors.admin.targetNotImpersonable',
    });
  }

  logger.info('[auth] impersonation started', { adminId, targetUserId });

  return issueTokens(target, meta, adminId);
}

/* ── Change Password ─────────────────────────────────────────────────────── */

/**
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.currentPassword
 * @param {string} params.newPassword
 */
export async function changePassword({ userId, currentPassword, newPassword }) {
  const currentUser = await userModel.findById(userId);
  if (!currentUser) {
    throw new AppError({
      status: 404,
      code: 'user.not_found',
      message: 'errors.notFound',
    });
  }

  const userWithHash = await userModel.findByEmailWithPassword(currentUser.email);
  if (!userWithHash) {
    throw new AppError({
      status: 404,
      code: 'user.not_found',
      message: 'errors.notFound',
    });
  }

  const ok = await verifyPassword(currentPassword, userWithHash.password_hash);
  if (!ok) {
    throw new AppError({
      status: 401,
      code: 'auth.invalid_credentials',
      message: 'errors.auth.invalidCredentials',
    });
  }

  const newHash = await hashPassword(newPassword);
  await userModel.updatePasswordHash(userId, newHash);
  await refreshTokenModel.revokeAllForUser(userId);

  logger.info('[auth] password changed', { userId });
}

export default Object.freeze({
  issueSession,
  register,
  login,
  refresh,
  logout,
  impersonate,
  changePassword,
});