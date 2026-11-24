/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Admin Routes (Overview + Audit Log)
 * Path: apps/api/src/routes/admin.routes.js
 *
 * Purpose:
 *   Mounted at /admin/overview and /admin/audit-log.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import controller from '../controllers/admin.controller.js';

export const adminRouter = Router();

adminRouter.get(
  '/overview',
  requireAuth,
  requireAdmin,
  asyncHandler(controller.overviewHandler)
);

adminRouter.get(
  '/audit-log',
  requireAuth,
  requireAdmin,
  asyncHandler(controller.auditLogHandler)
);

export default Object.freeze({ adminRouter });