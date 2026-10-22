/**
 * @file apps/api/src/routes/auth.routes.js
 *
 * Authentication routes.
 *
 * Why this file exists:
 *   - Login / logout / me are the entry points for every authenticated flow.
 *   - Admin login uses a separate endpoint (and separate cookie) so a guest
 *     token can never unlock admin endpoints.
 *
 * Endpoints:
 *   POST /api/auth/login          → guest/host login
 *   POST /api/auth/logout         → clear guest cookie
 *   GET  /api/auth/me             → current guest/host user
 *   POST /api/auth/admin/login    → admin login
 *   POST /api/auth/admin/logout   → clear admin cookie
 *   GET  /api/auth/admin/me       → current admin user
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { loginSchema } from '@marefiyaye/config/validation';
import { RATE_LIMITS } from '@marefiyaye/config/security';
import { apiEnv } from '../config/env.js';

import { validate } from '../middleware/validate.js';
import { authGuard, adminAuthGuard } from '../middleware/authGuard.js';

import {
  authenticateGuest,
  authenticateAdmin,
  getUserById,
} from '../services/auth.service.js';

import {
  setGuestCookie,
  setAdminCookie,
  clearGuestCookie,
  clearAdminCookie,
} from '../utils/cookieOptions.js';

const router = Router();

/**
 * Auth rate limiter — 5 attempts per 15 minutes per IP.
 * Applied to login endpoints to prevent brute-force.
 */
const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.auth.windowMs,
  max: RATE_LIMITS.auth.max,
  message: { error: { message: RATE_LIMITS.auth.message, code: 'TooManyRequestsError' } },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Guest/host endpoints ──────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Sets `token` cookie on success.
 */
router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { token, user } = await authenticateGuest(req.body);
    setGuestCookie(res, token, apiEnv.JWT_EXPIRES_IN);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Clears the guest cookie.
 */
router.post('/logout', (req, res) => {
  clearGuestCookie(res);
  res.json({ success: true });
});

/**
 * GET /api/auth/me
 * Returns the current guest/host user (or 401 if not logged in).
 */
router.get('/me', authGuard, async (req, res, next) => {
  try {
    const user = await getUserById(req.user.sub);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// ── Admin endpoints ───────────────────────────────────────────────────────

/**
 * POST /api/auth/admin/login
 * Body: { email, password }
 * Sets `admin_token` cookie on success. Requires ADMIN role.
 */
router.post('/admin/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { token, user } = await authenticateAdmin(req.body);
    setAdminCookie(res, token, apiEnv.ADMIN_JWT_EXPIRES_IN);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/admin/logout
 */
router.post('/admin/logout', (req, res) => {
  clearAdminCookie(res);
  res.json({ success: true });
});

/**
 * GET /api/auth/admin/me
 */
router.get('/admin/me', adminAuthGuard, async (req, res, next) => {
  try {
    const user = await getUserById(req.user.sub);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;