/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Auth Routes
 * Path: apps/api/src/routes/auth.routes.js
 *
 * Purpose:
 *   Mounts the auth endpoints under `/api/v1/auth/*`. Uses shared Zod
 *   schemas for request validation and enforces auth + impersonation
 *   guards where appropriate.
 *
 * Route ordering note:
 *   Static segments MUST be registered before parameterized segments.
 *   `/impersonate/stop` must come before `/impersonate/:userId` so that
 *   Express does not interpret "stop" as a user id.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import config from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from '@marefiyaye/shared/validators';

import authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { forbidImpersonation } from '../middleware/impersonation.middleware.js';

const router = Router();

/* ── Stricter rate limiting for auth endpoints ───────────────────────────── */

const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: Math.max(5, Math.floor(config.rateLimit.max / 5)),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'rate_limited', message: 'errors.rateLimited' },
  },
});

/* ── Validation helper ───────────────────────────────────────────────────── */

/**
 * Wraps a Zod schema into middleware that:
 *   - parses req.body
 *   - attaches the parsed value to req.body on success
 *   - passes ZodError to centralized handler on failure
 *
 * @param {import('zod').ZodTypeAny} schema
 */
function validateBody(schema) {
  return (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
}

/* ── Public endpoints ────────────────────────────────────────────────────── */

router.post(
  '/register',
  authLimiter,
  validateBody(registerSchema),
  asyncHandler(authController.registerHandler)
);

router.post(
  '/login',
  authLimiter,
  validateBody(loginSchema),
  asyncHandler(authController.loginHandler)
);

router.post('/refresh', authLimiter, asyncHandler(authController.refreshHandler));

router.post('/logout', asyncHandler(authController.logoutHandler));

/* ── Authenticated endpoints ─────────────────────────────────────────────── */

router.get('/me', requireAuth, asyncHandler(authController.meHandler));

router.patch('/me', requireAuth, asyncHandler(authController.updateMeHandler));

router.post(
  '/change-password',
  requireAuth,
  forbidImpersonation,
  validateBody(changePasswordSchema),
  asyncHandler(authController.changePasswordHandler)
);

/* ── Impersonation (STATIC route MUST be registered before parameterized) ── */

router.post(
  '/impersonate/stop',
  requireAuth,
  asyncHandler(authController.stopImpersonationHandler)
);

router.post(
  '/impersonate/:userId',
  requireAuth,
  requireAdmin,
  forbidImpersonation,
  asyncHandler(authController.impersonateHandler)
);

export default router;