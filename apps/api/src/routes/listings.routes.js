/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Listing Routes
 * Path: apps/api/src/routes/listing.routes.js
 *
 * Purpose:
 *   Three routers exported:
 *     - publicRouter   → GET /listings, GET /listings/:id
 *     - hostRouter     → GET/POST/PATCH /host/listings
 *     - adminRouter    → GET /admin/listings, PATCH /admin/listings/:id/moderate
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { listingCreateSchema, listingUpdateSchema } from '@marefiyaye/shared/validators';
import controller from '../controllers/listings.controller.js';

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

publicRouter.get('/', asyncHandler(controller.browseHandler));
publicRouter.get('/:id', asyncHandler(controller.getPublicHandler));

/* ── Host ────────────────────────────────────────────────────────────────── */

export const hostRouter = Router();

hostRouter.get('/', requireAuth, asyncHandler(controller.listOwnHandler));
hostRouter.post(
  '/',
  requireAuth,
  validateBody(listingCreateSchema),
  asyncHandler(controller.createHandler)
);
hostRouter.patch(
  '/:id',
  requireAuth,
  validateBody(listingUpdateSchema),
  asyncHandler(controller.updateOwnHandler)
);

/* ── Admin ───────────────────────────────────────────────────────────────── */

export const adminRouter = Router();

adminRouter.get('/', requireAuth, requireAdmin, asyncHandler(controller.listAdminHandler));
adminRouter.patch(
  '/:id/moderate',
  requireAuth,
  requireAdmin,
  asyncHandler(controller.moderateHandler)
);

export default Object.freeze({ publicRouter, hostRouter, adminRouter });