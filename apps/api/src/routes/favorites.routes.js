/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Favorites Routes
 * Path: apps/api/src/routes/favorites.routes.js
 *
 * Purpose:
 *   Router for /me/favorites — mounted under /me in routes/index.js.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import controller from '../controllers/favorites.controller.js';

export const meRouter = Router();

meRouter.get('/favorites', requireAuth, asyncHandler(controller.listHandler));
meRouter.post(
  '/favorites/:listingId',
  requireAuth,
  asyncHandler(controller.addHandler)
);
meRouter.delete(
  '/favorites/:listingId',
  requireAuth,
  asyncHandler(controller.removeHandler)
);

export default Object.freeze({ meRouter });