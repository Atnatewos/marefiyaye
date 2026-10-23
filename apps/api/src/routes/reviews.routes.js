/**
 * @file apps/api/src/routes/reviews.routes.js
 *
 * Review endpoints.
 *
 * Endpoints:
 *   POST /api/reviews               - submit review (auth, guest)
 *   GET  /api/reviews/property/:id  - public reviews for a property
 */

import { Router } from 'express';
import { submitReviewSchema } from '@marefiyaye/config/validation';
import { authGuard } from '../middleware/authGuard.js';
import { validate } from '../middleware/validate.js';
import {
  submitReview,
  listPropertyReviews,
} from '../services/review.service.js';

const router = Router();

/**
 * POST /api/reviews
 * Auth required.
 */
router.post('/', authGuard, validate(submitReviewSchema), async (req, res, next) => {
  try {
    const review = await submitReview(req.body, req.user.sub);
    res.status(201).json({ review });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reviews/property/:id
 * Public.
 */
router.get('/property/:id', async (req, res, next) => {
  try {
    const reviews = await listPropertyReviews(
      req.params.id,
      req.query.limit ? Number(req.query.limit) : 20,
      req.query.offset ? Number(req.query.offset) : 0
    );
    res.json({ reviews });
  } catch (error) {
    next(error);
  }
});

export default router;