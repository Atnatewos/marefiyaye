/**
 * @file apps/api/src/routes/admin-listings.routes.js
 *
 * Admin listing verification endpoints.
 *
 * Endpoints:
 *   GET  /api/admin/listings              - list by filter
 *   GET  /api/admin/listings/:id          - detail
 *   POST /api/admin/listings/:id/verify   - approve
 *   POST /api/admin/listings/:id/reject   - reject with reason
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { RATE_LIMITS } from '@marefiyaye/config/security';
import { verifyListingSchema, rejectListingSchema } from '@marefiyaye/config/validation';
import { adminAuthGuard } from '../middleware/authGuard.js';
import { validate } from '../middleware/validate.js';
import {
  listForAdmin,
  getForAdmin,
  verifyListing,
  rejectListing,
} from '../services/admin-listings.service.js';

const router = Router();
router.use(adminAuthGuard);

const adminLimiter = rateLimit({
  windowMs: RATE_LIMITS.admin.windowMs,
  max: RATE_LIMITS.admin.max,
  message: { error: { message: RATE_LIMITS.admin.message, code: 'TooManyRequestsError' } },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/', async (req, res, next) => {
  try {
    const filter = req.query.filter || 'PENDING';
    const listings = await listForAdmin(
      filter,
      req.query.limit ? Number(req.query.limit) : 50,
      req.query.offset ? Number(req.query.offset) : 0
    );
    res.json({ listings });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const listing = await getForAdmin(req.params.id);
    res.json({ listing });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/verify', adminLimiter, validate(verifyListingSchema), async (req, res, next) => {
  try {
    const listing = await verifyListing(req.params.id, req.user.sub, req.body.note);
    res.json({ listing });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/reject', adminLimiter, validate(rejectListingSchema), async (req, res, next) => {
  try {
    const listing = await rejectListing(req.params.id, req.user.sub, req.body.reason);
    res.json({ listing });
  } catch (error) {
    next(error);
  }
});

export default router;