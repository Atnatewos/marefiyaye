/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Config Routes
 * Path: apps/api/src/routes/config.routes.js
 *
 * Purpose:
 *   Mounts the God Panel API under `/api/v1/config/*`:
 *     - GET  /public           → no auth, only is_public settings
 *     - GET  /admin            → admin only, full schema-aware map
 *     - PATCH /admin/:key      → admin only, validated update
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import configController from '../controllers/config.controller.js';

const router = Router();

/* ── Public ──────────────────────────────────────────────────────────────── */

router.get('/public', asyncHandler(configController.getPublicHandler));

/* ── Admin ───────────────────────────────────────────────────────────────── */

router.get(
  '/admin',
  requireAuth,
  requireAdmin,
  asyncHandler(configController.getAdminHandler)
);

router.patch(
  '/admin/:key',
  requireAuth,
  requireAdmin,
  asyncHandler(configController.updateSettingHandler)
);

export default router;