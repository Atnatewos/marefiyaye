/**
 * @file apps/api/src/routes/host.routes.js
 *
 * Host-only endpoints — listings, bookings, viewings, stats.
 */

import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import { roleGuard } from '../middleware/roleGuard.js';
import {
  listHostListings,
  listHostBookings,
  listHostViewings,
  getStats,
  changeViewingStatus,
} from '../services/host.service.js';

const router = Router();
router.use(authGuard);
router.use(roleGuard('HOST', 'ADMIN'));

router.get('/stats', async (req, res, next) => {
  try {
    const stats = await getStats(req.user.sub);
    res.json({ stats });
  } catch (error) {
    next(error);
  }
});

router.get('/listings', async (req, res, next) => {
  try {
    const listings = await listHostListings(req.user.sub);
    res.json({ listings });
  } catch (error) {
    next(error);
  }
});

router.get('/bookings', async (req, res, next) => {
  try {
    const bookings = await listHostBookings(req.user.sub, req.query.status);
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
});

router.get('/viewings', async (req, res, next) => {
  try {
    const viewings = await listHostViewings(req.user.sub, req.query.status);
    res.json({ viewings });
  } catch (error) {
    next(error);
  }
});

router.patch('/viewings/:id', async (req, res, next) => {
  try {
    const viewing = await changeViewingStatus(req.params.id, req.user.sub, req.body.status);
    res.json({ viewing });
  } catch (error) {
    next(error);
  }
});

export default router;