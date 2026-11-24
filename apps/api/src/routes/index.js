/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Route Aggregator
 * Path: apps/api/src/routes/index.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Router } from 'express';
import { ok } from '../utils/response.js';

import authRoutes from './auth.routes.js';
import configRoutes from './config.routes.js';

import bankAccountRoutes from './bankAccount.routes.js';
import bannerRoutes from './banner.routes.js';
import broadcastRoutes from './broadcast.routes.js';

import listingRoutes from './listings.routes.js';
import hostRoutes from './host.routes.js';

import bookingRoutes from './bookings.routes.js';
import paymentRoutes from './payments.routes.js';

import favoritesRoutes from './favorites.routes.js';
import notificationsRoutes from './notifications.routes.js';
import adminRoutes from './admin.routes.js';
import uploadRoutes from './uploads.routes.js';

const router = Router();

/* ── Smoke test ──────────────────────────────────────────────────────────── */

router.get('/ping', (_req, res) => {
  return ok(res, {
    pong: true,
    timestamp: new Date().toISOString(),
  });
});

/* ── Auth & config ───────────────────────────────────────────────────────── */

router.use('/auth', authRoutes);
router.use('/config', configRoutes);

/* ── Uploads ─────────────────────────────────────────────────────────────── */

router.use('/uploads', uploadRoutes.uploadsRouter);

/* ── Public content ──────────────────────────────────────────────────────── */

router.use('/bank-accounts', bankAccountRoutes.publicRouter);
router.use('/banners', bannerRoutes.publicRouter);
router.use('/broadcasts', broadcastRoutes.publicRouter);
router.use('/listings', listingRoutes.publicRouter);

/* ── Host ────────────────────────────────────────────────────────────────── */

router.use('/host', hostRoutes.hostRouter);
router.use('/host/listings', listingRoutes.hostRouter);

/* ── Guest: bookings + payments ──────────────────────────────────────────── */

router.use('/bookings', bookingRoutes.guestRouter);
router.use('/payments', paymentRoutes.guestRouter);

/* ── Me (auth required, mixed) ───────────────────────────────────────────── */

router.use('/me', bookingRoutes.meRouter);
router.use('/me', favoritesRoutes.meRouter);
router.use('/me', notificationsRoutes.meRouter);

/* ── Admin: content ──────────────────────────────────────────────────────── */

router.use('/admin/bank-accounts', bankAccountRoutes.adminRouter);
router.use('/admin/banners', bannerRoutes.adminRouter);
router.use('/admin/broadcasts', broadcastRoutes.adminRouter);
router.use('/admin/listings', listingRoutes.adminRouter);
router.use('/admin/hosts', hostRoutes.adminRouter);

/* ── Admin: operations ───────────────────────────────────────────────────── */

router.use('/admin/bookings', bookingRoutes.adminRouter);
router.use('/admin/payments', paymentRoutes.adminRouter);

/* ── Admin: overview + audit ─────────────────────────────────────────────── */

router.use('/admin', adminRoutes.adminRouter);

export default router;