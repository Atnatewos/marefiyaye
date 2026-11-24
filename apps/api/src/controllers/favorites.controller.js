/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Favorites Controller
 * Path: apps/api/src/controllers/favorites.controller.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ok, noContent } from '../utils/response.js';
import favoriteModel from '../models/favorite.model.js';
import listingModel from '../models/listing.model.js';
import { AppError } from '../middleware/error.middleware.js';

/**
 * GET /api/v1/me/favorites
 */
export async function listHandler(req, res) {
  const favorites = await favoriteModel.listByUser(req.user.id);
  return ok(res, { favorites });
}

/**
 * POST /api/v1/me/favorites/:listingId
 */
export async function addHandler(req, res) {
  const listing = await listingModel.findPublicById(req.params.listingId);
  if (!listing) {
    throw new AppError({
      status: 404,
      code: 'listing.not_found',
      message: 'errors.listing.notFound',
    });
  }
  await favoriteModel.add(req.user.id, listing.id);
  return ok(res, { saved: true });
}

/**
 * DELETE /api/v1/me/favorites/:listingId
 */
export async function removeHandler(req, res) {
  await favoriteModel.remove(req.user.id, req.params.listingId);
  return noContent(res);
}

export default Object.freeze({ listHandler, addHandler, removeHandler });