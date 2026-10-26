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
/**
 * @file apps/api/src/routes/auth.routes.js
 *
 * Authentication routes.
 */

import express from 'express';
import { validate } from '../middleware/validate.js';
import { authGuard, adminAuthGuard } from '../middleware/authGuard.js';
import * as authService from '../services/auth.service.js';
import { loginSchema, registerSchema } from '@marefiyaye/config/validation';
import { setAuthCookie, clearAuthCookie, setAdminCookie, clearAdminCookie } from '../utils/cookieOptions.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Creates a new user account.
 */
router.post('/register', validate(registerSchema), async (req, res) => {
  const { user, token } = await authService.register(req.body);
  setAuthCookie(res, token);
  res.status(201).json({ user });
});

/**
 * POST /api/auth/login
 * Authenticates a user.
 */
router.post('/login', validate(loginSchema), async (req, res) => {
  const { user, token } = await authService.login(req.body.email, req.body.password);
  setAuthCookie(res, token);
  res.json({ user });
});

/**
 * POST /api/auth/logout
 * Clears the auth cookie.
 */
router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.status(204).end();
});

/**
 * GET /api/auth/me
 * Returns the current user.
 */
router.get('/me', authGuard, async (req, res) => {
  const user = await authService.getUserById(req.user.id);
  res.json({ user });
});

/**
 * POST /api/auth/admin/login
 * Authenticates an admin.
 */
router.post('/admin/login', validate(loginSchema), async (req, res) => {
  const { user, token } = await authService.adminLogin(req.body.email, req.body.password);
  setAdminCookie(res, token);
  res.json({ user });
});

/**
 * POST /api/auth/admin/logout
 * Clears the admin cookie.
 */
router.post('/admin/logout', (req, res) => {
  clearAdminCookie(res);
  res.status(204).end();
});

/**
 * PATCH /api/auth/me
 * Update own profile (name, phone, avatar URL).
 */
router.patch('/me', authGuard, async (req, res, next) => {
  try {
    const { fullName, phone, avatarUrl } = req.body;
    const updated = await authService.updateProfile(req.user.id, {
      fullName: fullName,
      phone: phone,
      avatarUrl: avatarUrl,
    });
    res.json({ user: updated });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/admin/me
 * Returns the current admin.
 */
router.get('/admin/me', adminAuthGuard, async (req, res) => {
  const user = await authService.getUserById(req.user.id);
  res.json({ user });
});

export default router;