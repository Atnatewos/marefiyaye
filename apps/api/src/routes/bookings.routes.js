/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Bookings Routes
 * Path: apps/api/src/routes/bookings.routes.js
 *
 * Purpose:
 *   Three routers:
 *     - guestRouter  → /bookings/quote, /bookings, /bookings/:id, /me/bookings
 *     - adminRouter  → /admin/bookings + status change
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import {
  bookingQuoteSchema,
  bookingCreateSchema,
} from '@marefiyaye/shared/validators';
import controller from '../controllers/bookings.controller.js';

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

/* ── Guest ───────────────────────────────────────────────────────────────── */

export const guestRouter = Router();

guestRouter.post(
  '/quote',
  validateBody(bookingQuoteSchema),
  asyncHandler(controller.quoteHandler)
);

guestRouter.post(
  '/',
  requireAuth,
  validateBody(bookingCreateSchema),
  asyncHandler(controller.createHandler)
);

guestRouter.get('/:id', requireAuth, asyncHandler(controller.getGuestHandler));

/* ── Me (guest's bookings) ───────────────────────────────────────────────── */

export const meRouter = Router();

meRouter.get('/bookings', requireAuth, asyncHandler(controller.listGuestHandler));

/* ── Admin ───────────────────────────────────────────────────────────────── */

export const adminRouter = Router();

adminRouter.get(
  '/',
  requireAuth,
  requireAdmin,
  asyncHandler(controller.listAdminHandler)
);

adminRouter.patch(
  '/:id/status',
  requireAuth,
  requireAdmin,
  asyncHandler(controller.setStatusAdminHandler)
);

export default Object.freeze({ guestRouter, meRouter, adminRouter });