/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Payments Routes
 * Path: apps/api/src/routes/payments.routes.js
 *
 * Purpose:
 *   Two routers:
 *     - guestRouter  → POST /payments (submit receipt)
 *     - adminRouter  → GET /admin/payments, verify, reject
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { paymentSubmitSchema } from '@marefiyaye/shared/validators';
import controller from '../controllers/payments.controller.js';

const rejectSchema = z.object({
  reason: z.string().trim().min(3).max(500),
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

/* ── Guest ───────────────────────────────────────────────────────────────── */

export const guestRouter = Router();

guestRouter.post(
  '/',
  requireAuth,
  validateBody(paymentSubmitSchema),
  asyncHandler(controller.submitHandler)
);

/* ── Admin ───────────────────────────────────────────────────────────────── */

export const adminRouter = Router();

adminRouter.get(
  '/',
  requireAuth,
  requireAdmin,
  asyncHandler(controller.listAdminHandler)
);

adminRouter.post(
  '/:id/verify',
  requireAuth,
  requireAdmin,
  asyncHandler(controller.verifyHandler)
);

adminRouter.post(
  '/:id/reject',
  requireAuth,
  requireAdmin,
  validateBody(rejectSchema),
  asyncHandler(controller.rejectHandler)
);

export default Object.freeze({ guestRouter, adminRouter });