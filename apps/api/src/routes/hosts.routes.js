/**
 * @file apps/api/src/routes/hosts.routes.js
 *
 * Public host profile endpoints.
 *
 * Why this file exists:
 *   - Guests viewing a property may want to see who the host is and what
 *     else they host.
 *   - Public route — no auth required.
 *   - Reuses existing property queries — no duplicate SQL.
 *
 * Endpoints:
 *   GET /api/hosts/:id  - public host profile + listings
 */

import { Router } from 'express';
import { query } from '../config/db.js';
import { TABLES } from '@marefiyaye/config/database';
import { NotFoundError } from '../utils/errors.js';

const router = Router();

/**
 * GET /api/hosts/:id
 * Returns the host's public profile and their verified active listings.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Load host (public fields only — no password_hash, no phone by default)
    const userResult = await query(
      `SELECT id, full_name, avatar_url, is_verified, created_at
       FROM ${TABLES.USERS}
       WHERE id = $1 AND role IN ('HOST', 'ADMIN')
       LIMIT 1`,
      [id]
    );
    const host = userResult.rows[0];
    if (!host) throw new NotFoundError('Host');

    // Load their verified active listings
    const listingsResult = await query(
      `SELECT
         p.id, p.slug, p.title, p.title_am, p.category, p.city, p.neighborhood,
         p.stay_type, p.nightly_rate_etb, p.monthly_rate_etb,
         p.images, p.rating_avg, p.review_count, p.created_at
       FROM ${TABLES.PROPERTIES} p
       WHERE p.host_id = $1 AND p.is_active = TRUE AND p.is_verified = TRUE
       ORDER BY p.created_at DESC`,
      [id]
    );

    res.json({
      host: {
        id: host.id,
        fullName: host.full_name,
        avatarUrl: host.avatar_url,
        isVerified: host.is_verified,
        createdAt: host.created_at,
      },
      listings: listingsResult.rows.map((row) => ({
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
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;