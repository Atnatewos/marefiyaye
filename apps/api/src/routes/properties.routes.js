/**
 * @file apps/api/src/routes/properties.routes.js
 *
 * Property endpoints — public read, host-authenticated create.
 *
 * Why this file exists:
 *   - Public browsing (feed + detail) lives here.
 *   - Listing creation is host-only, protected by authGuard + roleGuard.
 *   - All endpoints return JSON; errors flow through the shared error handler.
 *
 * Endpoints:
 *   POST /api/properties              - create listing (HOST or ADMIN only)
 *   GET  /api/properties/cities       - list cities with counts
 *   GET  /api/properties              - list with filters + pagination
 *   GET  /api/properties/:slug        - single property detail
 *
 * Route order matters: `/` and `/cities` are declared BEFORE `/:slug`
 * so they aren't captured as a slug.
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { RATE_LIMITS } from '@marefiyaye/config/security';
import { createListingSchema } from '@marefiyaye/config/validation';

import {
  listProperties,
  getPropertyBySlug,
  createProperty,
} from '../services/property.service.js';
import { findAvailableCities } from '../queries/properties.queries.js';
import { authGuard } from '../middleware/authGuard.js';
import { roleGuard } from '../middleware/roleGuard.js';
import { validate } from '../middleware/validate.js';

const router = Router();

/**
 * Rate limit for listing creation — prevents spam.
 */
const createLimiter = rateLimit({
  windowMs: RATE_LIMITS.applications.windowMs,
  max: RATE_LIMITS.applications.max,
  message: {
    error: {
      message: RATE_LIMITS.applications.message,
      code: 'TooManyRequestsError',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/properties
 * Create a new listing. HOST or ADMIN only.
 */
router.post(
  '/',
  createLimiter,
  authGuard,
  roleGuard('HOST', 'ADMIN'),
  validate(createListingSchema),
  async (req, res, next) => {
    try {
      const property = await createProperty(req.body, req.user.sub);
      res.status(201).json({ property });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/properties/cities
 * Returns the list of cities with property counts.
 */
router.get('/cities', async (req, res, next) => {
  try {
    const cities = await findAvailableCities();
    res.json({ cities });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/properties
 * List with filters + pagination.
 */
router.get('/', async (req, res, next) => {
  try {
    const filters = {
      stayType: req.query.stayType,
      category: req.query.category,
      city: req.query.city,
      query: req.query.query,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      guests: req.query.guests ? Number(req.query.guests) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      offset: req.query.offset ? Number(req.query.offset) : 0,
    };
    const result = await listProperties(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/properties/:slug
 * Single property detail.
 */
router.get('/:slug', async (req, res, next) => {
  try {
    const property = await getPropertyBySlug(req.params.slug);
    res.json({ property });
  } catch (error) {
    next(error);
  }
});

export default router;