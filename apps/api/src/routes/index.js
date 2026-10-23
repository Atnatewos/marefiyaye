/**
 * @file apps/api/src/routes/index.js
 */

import { Router } from 'express';
import configRoutes from './config.routes.js';
import authRoutes from './auth.routes.js';
import propertiesRoutes from './properties.routes.js';
import bookingsRoutes from './bookings.routes.js';
import leasesRoutes from './leases.routes.js';
import hostRoutes from './host.routes.js';
import adminRoutes from './admin.routes.js';
import adminListingsRoutes from './admin-listings.routes.js';
import uploadsRoutes from './uploads.routes.js';
import reviewsRoutes from './reviews.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'marefiyaye-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.use('/config', configRoutes);
router.use('/auth', authRoutes);
router.use('/properties', propertiesRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/leases', leasesRoutes);
router.use('/host', hostRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/listings', adminListingsRoutes);
router.use('/uploads', uploadsRoutes);
router.use('/reviews', reviewsRoutes);


export default router;