/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Uploads Routes
 * Path: apps/api/src/routes/uploads.routes.js
 *
 * Purpose:
 *   Router for /uploads. Signing requires authentication (only signed-in
 *   users should be able to upload to our Cloudinary account).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import controller from '../controllers/uploads.controller.js';

const signSchema = z.object({
  category: z.enum(['receipt', 'listing']).default('receipt'),
  publicId: z.string().trim().max(200).optional(),
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

export const uploadsRouter = Router();

uploadsRouter.get(
  '/categories',
  asyncHandler(controller.categoriesHandler)
);

uploadsRouter.post(
  '/sign',
  requireAuth,
  validateBody(signSchema),
  asyncHandler(controller.signHandler)
);

export default Object.freeze({ uploadsRouter });