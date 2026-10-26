/**
 * @file apps/api/src/routes/wishlist.routes.js
 *
 * Wishlist endpoints.
 *
 * Why this file exists:
 *   - Guests save listings to revisit later.
 *   - All routes require auth — wishlists are per-user.
 *
 * Endpoints:
 *   GET    /api/wishlist                - list own wishlist
 *   POST   /api/wishlist/:propertyId    - add a property
 *   DELETE /api/wishlist/:propertyId    - remove a property
 */

import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import {
  findWishlistByUser,
  addToWishlist,
  removeFromWishlist,
} from '../queries/wishlist.queries.js';

const router = Router();
router.use(authGuard);

/**
 * GET /api/wishlist
 */
router.get('/', async (req, res, next) => {
  try {
    const rows = await findWishlistByUser(req.user.id);
    const items = rows.map((row) => ({
      savedAt: row.saved_at,
      property: {
        id: row.id,
        slug: row.slug,
        title: row.title,
        titleAm: row.title_am,
        category: row.category,
        city: row.city,
        neighborhood: row.neighborhood,
        stayType: row.stay_type,
        nightlyRateEtb: row.nightly_rate_etb ? Number(row.nightly_rate_etb) : null,
        monthlyRateEtb: row.monthly_rate_etb ? Number(row.monthly_rate_etb) : null,
        images: row.images || [],
        ratingAvg: row.rating_avg ? Number(row.rating_avg) : 0,
        reviewCount: row.review_count,
        isVerified: row.is_verified,
      },
    }));
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/wishlist/:propertyId
 */
router.post('/:propertyId', async (req, res, next) => {
  try {
    await addToWishlist(req.user.id, req.params.propertyId);
    res.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/wishlist/:propertyId
 */
router.delete('/:propertyId', async (req, res, next) => {
  try {
    await removeFromWishlist(req.user.id, req.params.propertyId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;