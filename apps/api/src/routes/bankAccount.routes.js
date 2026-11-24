/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Bank Account Routes
 * Path: apps/api/src/routes/bankAccount.routes.js
 *
 * Purpose:
 *   Two routers exported:
 *     - publicRouter   → GET /bank-accounts  (active only, no auth)
 *     - adminRouter    → CRUD /admin/bank-accounts  (admin only)
 *
 *   Both are mounted by `routes/index.js`.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { bankAccountUpsertSchema } from '@marefiyaye/shared/validators';
import controller from '../controllers/bankAccount.controller.js';

/* ── Validation helper ───────────────────────────────────────────────────── */

/**
 * Parses `req.body` with the given Zod schema. On success replaces
 * `req.body` with the parsed value; on failure passes a ZodError to the
 * centralized handler.
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

/* ── Public router ───────────────────────────────────────────────────────── */

export const publicRouter = Router();

publicRouter.get('/', asyncHandler(controller.listPublicHandler));

/* ── Admin router ────────────────────────────────────────────────────────── */

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
  validateBody(bankAccountUpsertSchema),
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