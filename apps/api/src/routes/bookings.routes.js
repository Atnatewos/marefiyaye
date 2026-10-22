/**
 * @file apps/api/src/routes/bookings.routes.js
 *
 * Booking and payment endpoints.
 *
 * Why this file exists:
 *   - Guests create bookings and submit payments.
 *   - All endpoints require authentication (authGuard).
 *   - Payment rate limit applied on top of auth rate limit.
 *
 * Endpoints:
 *   POST   /api/bookings                 - create booking
 *   GET    /api/bookings/mine            - list own bookings
 *   PATCH  /api/bookings/:id/cancel      - cancel booking
 *   POST   /api/bookings/payments        - submit payment
 *   GET    /api/bookings/payments/mine   - list own payments
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import {
  createBookingSchema,
  cancelBookingSchema,
  submitPaymentSchema,
} from '@marefiyaye/config/validation';
import { RATE_LIMITS } from '@marefiyaye/config/security';

import { authGuard } from '../middleware/authGuard.js';
import { validate } from '../middleware/validate.js';

import {
  createBooking,
  listMyBookings,
  cancelBooking,
  submitPayment,
  listMyPayments,
} from '../services/booking.service.js';

const router = Router();

const paymentLimiter = rateLimit({
  windowMs: RATE_LIMITS.payments.windowMs,
  max: RATE_LIMITS.payments.max,
  message: { error: { message: RATE_LIMITS.payments.message, code: 'TooManyRequestsError' } },
  standardHeaders: true,
  legacyHeaders: false,
});

// All booking routes require auth
router.use(authGuard);

/**
 * POST /api/bookings
 */
router.post('/', validate(createBookingSchema), async (req, res, next) => {
  try {
    const booking = await createBooking({
      ...req.body,
      guestId: req.user.sub,
    });
    res.status(201).json({ booking });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/bookings/mine
 */
router.get('/mine', async (req, res, next) => {
  try {
    const bookings = await listMyBookings(req.user.sub);
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/bookings/:id/cancel
 */
router.patch('/:id/cancel', validate(cancelBookingSchema), async (req, res, next) => {
  try {
    const result = await cancelBooking(req.params.id, req.user.sub, req.body.reason);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/bookings/payments
 */
router.post('/payments', paymentLimiter, validate(submitPaymentSchema), async (req, res, next) => {
  try {
    const payment = await submitPayment(req.body, req.user.sub);
    res.status(201).json({ payment });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/bookings/payments/mine
 */
router.get('/payments/mine', async (req, res, next) => {
  try {
    const payments = await listMyPayments(req.user.sub);
    res.json({ payments });
  } catch (error) {
    next(error);
  }
});

export default router;