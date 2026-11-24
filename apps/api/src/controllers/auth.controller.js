/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Auth Controller
 * Path: apps/api/src/controllers/auth.controller.js
 *
 * Purpose:
 *   HTTP glue for the auth service. Handles request parsing, cookie
 *   management, and response shaping. Business logic lives in the service.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import config from '../config/env.js';
import { ok, created, noContent, fail } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { COOKIE_NAMES, AUTH } from '../config/constants.js';
import authService from '../services/auth.service.js';
import userModel from '../models/user.model.js';

/* ── UUID guard ──────────────────────────────────────────────────────────── */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * @param {string} value
 * @returns {boolean}
 */
function isUuid(value) {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

/* ── Cookie helpers ──────────────────────────────────────────────────────── */

/**
 * @param {import('express').Response} res
 * @param {string} name
 * @param {string} value
 * @param {object} opts
 */
function setCookie(res, name, value, opts) {
  res.cookie(name, value, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    domain: config.cookie.domain,
    ...opts,
  });
}

/**
 * @param {import('express').Response} res
 * @param {string} name
 * @param {object} opts
 */
function clearCookie(res, name, opts) {
  res.clearCookie(name, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    domain: config.cookie.domain,
    ...opts,
  });
}

/**
 * @param {import('express').Response} res
 * @param {{ accessToken: string, refreshToken: string }} tokens
 */
function setAuthCookies(res, tokens) {
  setCookie(res, COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, {
    path: AUTH.ACCESS_TOKEN_COOKIE_PATH,
  });
  setCookie(res, COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, {
    path: AUTH.REFRESH_TOKEN_COOKIE_PATH,
  });
}

/**
 * @param {import('express').Request} req
 * @param {string} name
 * @returns {string|null}
 */
function readCookie(req, name) {
  return req.cookies?.[name] || null;
}

/**
 * @param {import('express').Request} req
 */
function clientMeta(req) {
  return {
    userAgent: req.get('user-agent') || null,
    ipAddress: req.ip || null,
  };
}

/* ── Handlers ────────────────────────────────────────────────────────────── */

/**
 * POST /api/v1/auth/register
 */
export async function registerHandler(req, res) {
  // The shared `registerSchema` runs upstream (via validateBody in auth.routes.js)
  // and validates both password and confirm_password. Now we discard the
  // fields the DB doesn't store before calling the service.
  const { confirm_password, ...payload } = req.body;

  const { accessToken, refreshToken, user } = await authService.register(
    payload,
    clientMeta(req)
  );
  setAuthCookies(res, { accessToken, refreshToken });
  return created(res, { user });
}

/**
 * POST /api/v1/auth/login
 */
export async function loginHandler(req, res) {
  const { accessToken, refreshToken, user } = await authService.login(
    req.body,
    clientMeta(req)
  );
  setAuthCookies(res, { accessToken, refreshToken });
  return ok(res, { user });
}

/**
 * POST /api/v1/auth/refresh
 */
export async function refreshHandler(req, res) {
  const raw = readCookie(req, COOKIE_NAMES.REFRESH_TOKEN);
  if (!raw) {
    return fail(res, {
      status: 401,
      code: 'auth.no_refresh',
      message: 'errors.auth.refreshExpired',
    });
  }

  const { accessToken, refreshToken, user } = await authService.refresh(
    raw,
    clientMeta(req)
  );
  setAuthCookies(res, { accessToken, refreshToken });
  return ok(res, { user });
}

/**
 * POST /api/v1/auth/logout
 */
export async function logoutHandler(req, res) {
  const raw = readCookie(req, COOKIE_NAMES.REFRESH_TOKEN);
  await authService.logout(raw);

  clearCookie(res, COOKIE_NAMES.ACCESS_TOKEN, {
    path: AUTH.ACCESS_TOKEN_COOKIE_PATH,
  });
  clearCookie(res, COOKIE_NAMES.REFRESH_TOKEN, {
    path: AUTH.REFRESH_TOKEN_COOKIE_PATH,
  });

  return noContent(res);
}

/**
 * GET /api/v1/auth/me
 */
export async function meHandler(req, res) {
  const user = await userModel.findById(req.user.id);
  return ok(res, {
    user,
    impersonatedBy: req.user.impersonatedBy || null,
  });
}

/**
 * PATCH /api/v1/auth/me
 */
export async function updateMeHandler(req, res) {
  const { preferred_lang } = req.body;
  if (preferred_lang) {
    await userModel.updatePreferredLanguage(req.user.id, preferred_lang);
  }
  const user = await userModel.findById(req.user.id);
  return ok(res, { user });
}

/**
 * POST /api/v1/auth/change-password
 */
export async function changePasswordHandler(req, res) {
  await authService.changePassword({
    userId: req.user.id,
    currentPassword: req.body.current_password,
    newPassword: req.body.new_password,
  });

  clearCookie(res, COOKIE_NAMES.ACCESS_TOKEN, {
    path: AUTH.ACCESS_TOKEN_COOKIE_PATH,
  });
  clearCookie(res, COOKIE_NAMES.REFRESH_TOKEN, {
    path: AUTH.REFRESH_TOKEN_COOKIE_PATH,
  });

  return ok(res, { message: 'auth.password.changed' });
}

/**
 * POST /api/v1/auth/impersonate/:userId
 * Admin-only. Validates the userId is a UUID before hitting the service.
 */
export async function impersonateHandler(req, res) {
  const targetUserId = req.params.userId;

  if (!isUuid(targetUserId)) {
    return fail(res, {
      status: 400,
      code: 'validation.failed',
      message: 'validation.required',
      field: 'userId',
    });
  }

  const { accessToken, refreshToken, user } = await authService.impersonate({
    adminId: req.user.id,
    targetUserId,
    meta: clientMeta(req),
  });
  setAuthCookies(res, { accessToken, refreshToken });
  return ok(res, { user, impersonatedBy: req.user.id });
}

/**
 * POST /api/v1/auth/impersonate/stop
 * Reverts the impersonation session back to the admin by issuing a fresh
 * admin session. Does NOT call authService.impersonate — that path would
 * hit the "cannot impersonate self" guard.
 */
export async function stopImpersonationHandler(req, res) {
  const adminId = req.user.impersonatedBy;
  if (!adminId) {
    return fail(res, {
      status: 400,
      code: 'auth.not_impersonating',
      message: 'errors.validation',
    });
  }

  const admin = await userModel.findById(adminId);
  if (!admin) {
    return fail(res, {
      status: 404,
      code: 'admin.not_found',
      message: 'errors.notFound',
    });
  }

  const { accessToken, refreshToken, user } = await authService.issueSession(
    admin,
    clientMeta(req)
  );
  setAuthCookies(res, { accessToken, refreshToken });

  logger.info('[auth] impersonation stopped', { adminId });

  return ok(res, { user, impersonatedBy: null });
}

export default Object.freeze({
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  meHandler,
  updateMeHandler,
  changePasswordHandler,
  impersonateHandler,
  stopImpersonationHandler,
});