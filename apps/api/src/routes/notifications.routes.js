/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Notifications Routes
 * Path: apps/api/src/routes/notifications.routes.js
 *
 * Purpose:
 *   Mounted under /me/notifications — all require auth.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import controller from '../controllers/notifications.controller.js';

export const meRouter = Router();

meRouter.get('/notifications', requireAuth, asyncHandler(controller.listHandler));
meRouter.post(
  '/notifications/read-all',
  requireAuth,
  asyncHandler(controller.markAllReadHandler)
);
meRouter.patch(
  '/notifications/:id/read',
  requireAuth,
  asyncHandler(controller.markReadHandler)
);
meRouter.delete(
  '/notifications/:id',
  requireAuth,
  asyncHandler(controller.removeHandler)
);

export default Object.freeze({ meRouter });