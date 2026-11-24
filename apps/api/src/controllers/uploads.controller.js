/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Uploads Controller
 * Path: apps/api/src/controllers/uploads.controller.js
 *
 * Purpose:
 *   HTTP glue for upload signing. The browser uses the returned payload to
 *   POST the file directly to Cloudinary.
 *
 *   Flow:
 *     1. Client → POST /api/v1/uploads/sign { category }
 *     2. Server → checks clock sanity, signs params, returns signed payload
 *     3. Client → POST cloudinary uploadUrl with FormData(file, ...params)
 *     4. Cloudinary → { secure_url, public_id, ... }
 *     5. Client → POST /payments or /host/listings with { url, public_id }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ok } from '../utils/response.js';
import cloudinaryService, {
  UPLOAD_CATEGORY,
} from '../services/cloudinary.service.js';

/**
 * POST /api/v1/uploads/sign
 * Body: { category: 'receipt' | 'listing', publicId?: string }
 */
export async function signHandler(req, res) {
  const category = req.body?.category || UPLOAD_CATEGORY.RECEIPT;

  const signed = await cloudinaryService.buildSignedUpload({
    category,
    publicId: req.body?.publicId || null,
  });

  return ok(res, signed);
}

/**
 * GET /api/v1/uploads/categories
 * Returns the list of allowed categories.
 */
export async function categoriesHandler(_req, res) {
  return ok(res, {
    categories: Object.values(UPLOAD_CATEGORY),
  });
}

export default Object.freeze({ signHandler, categoriesHandler });