/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Host Routes
 * Path: apps/api/src/routes/host.routes.js
 *
 * Purpose:
 *   Two routers exported:
 *     - hostRouter   → GET/POST/PATCH /host
 *     - adminRouter  → GET /admin/hosts, PATCH /admin/hosts/:id/verify
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import controller from '../controllers/host.controller.js';

/* ── Inline schemas (host-specific) ──────────────────────────────────────── */

const hostRegisterSchema = z.object({
  display_name: z.string().trim().min(2).max(120),
  bio: z.string().trim().max(2000).optional(),
  avatar_url: z.string().url().optional(),
});

const hostUpdateSchema = z.object({
  display_name: z.string().trim().min(2).max(120).optional(),
  bio: z.string().trim().max(2000).optional(),
  avatar_url: z.string().url().optional(),
});

const hostVerifySchema = z.object({
  status: z.enum(['verified', 'rejected', 'suspended']),
  reason: z.string().trim().max(500).optional(),
});

/**
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

/* ── Host self routes ────────────────────────────────────────────────────── */

export const hostRouter = Router();

hostRouter.get('/me', requireAuth, asyncHandler(controller.getOwnHandler));
hostRouter.post(
  '/register',
  requireAuth,
  validateBody(hostRegisterSchema),
  asyncHandler(controller.registerHandler)
);
hostRouter.patch(
  '/me',
  requireAuth,
  validateBody(hostUpdateSchema),
  asyncHandler(controller.updateOwnHandler)
);

/* ── Admin routes ────────────────────────────────────────────────────────── */

export const adminRouter = Router();

adminRouter.get(
  '/',
  requireAuth,
  requireAdmin,
  asyncHandler(controller.listAdminHandler)
);

adminRouter.patch(
  '/:id/verify',
  requireAuth,
  requireAdmin,
  validateBody(hostVerifySchema),
  asyncHandler(controller.verifyHandler)
);

export default Object.freeze({ hostRouter, adminRouter });