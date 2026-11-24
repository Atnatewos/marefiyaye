/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Broadcast Routes
 * Path: apps/api/src/routes/broadcast.routes.js
 *
 * Purpose:
 *   Two routers exported:
 *     - publicRouter   → GET /broadcasts?audience=...
 *     - adminRouter    → CRUD /admin/broadcasts
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { broadcastUpsertSchema } from '@marefiyaye/shared/validators';
import controller from '../controllers/broadcast.controller.js';

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

/* ── Public ──────────────────────────────────────────────────────────────── */

export const publicRouter = Router();

publicRouter.get('/', asyncHandler(controller.listPublicHandler));

/* ── Admin ───────────────────────────────────────────────────────────────── */

export const adminRouter = Router();

adminRouter.get(
  '/',
  requireAuth,
  requireAdmin,
  asyncHandler(controller.listAdminHandler)
);

adminRouter.post(
  '/',
  requireAuth,
  requireAdmin,
  validateBody(broadcastUpsertSchema),
  asyncHandler(controller.createHandler)
);

adminRouter.patch(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(controller.updateHandler)
);

adminRouter.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(controller.deleteHandler)
);

export default Object.freeze({ publicRouter, adminRouter });