/**
 * @file apps/api/src/routes/admin.routes.js
 *
 * Admin-only endpoints.
 *
 * Why this file exists:
 *   - Every route here requires admin authentication (separate secret).
 *   - Booking state transitions and audit logs live in the service layer.
 *   - Rate-limited to prevent accidental bulk actions.
 *
 * Endpoints:
 *   GET  /api/admin/stats              - KPI counts
 *   GET  /api/admin/payments           - list payments by status
 *   GET  /api/admin/payments/:id       - payment detail
 *   POST /api/admin/payments/:id/verify - approve payment
 *   POST /api/admin/payments/:id/reject - reject with reason
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

import { RATE_LIMITS } from '@marefiyaye/config/security';
import { adminAuthGuard } from '../middleware/authGuard.js';
import { validate } from '../middleware/validate.js';

import {
  listAdminPayments,
  verifyPayment,
  rejectPayment,
  getPaymentDetail,
  getStats,
} from '../services/admin.service.js';

const router = Router();
router.use(adminAuthGuard);

const adminLimiter = rateLimit({
  windowMs: RATE_LIMITS.admin.windowMs,
  max: RATE_LIMITS.admin.max,
  message: { error: { message: RATE_LIMITS.admin.message, code: 'TooManyRequestsError' } },
  standardHeaders: true,
  legacyHeaders: false,
});

const rejectSchema = z.object({
  reason: z.string().min(3).max(500),
});

router.get('/stats', async (req, res, next) => {
  try {
    const stats = await getStats();
    res.json({ stats });
  } catch (error) {
    next(error);
  }
});

router.get('/payments', async (req, res, next) => {
  try {
    const payments = await listAdminPayments(
      req.query.status,
      req.query.limit ? Number(req.query.limit) : 50,
      req.query.offset ? Number(req.query.offset) : 0
    );
    res.json({ payments });
  } catch (error) {
    next(error);
  }
});

router.get('/payments/:id', async (req, res, next) => {
  try {
    const payment = await getPaymentDetail(req.params.id);
    res.json({ payment });
  } catch (error) {
    next(error);
  }
});

router.post('/payments/:id/verify', adminLimiter, async (req, res, next) => {
  try {
    const result = await verifyPayment(req.params.id, req.user.sub);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/payments/:id/reject', adminLimiter, validate(rejectSchema), async (req, res, next) => {
  try {
    const result = await rejectPayment(req.params.id, req.user.sub, req.body.reason);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;