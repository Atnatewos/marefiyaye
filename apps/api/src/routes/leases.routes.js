/**
 * @file apps/api/src/routes/leases.routes.js
 *
 * Lease application and viewing endpoints.
 *
 * Why this file exists:
 *   - Long-term rentals flow through lease applications.
 *   - Physical viewings are scheduled separately.
 *   - Document generation returns printable HTML.
 */

import { Router } from 'express';
import { applyForLeaseSchema, scheduleViewingSchema } from '@marefiyaye/config/validation';
import { authGuard } from '../middleware/authGuard.js';
import { validate } from '../middleware/validate.js';
import {
  applyForLease,
  listMyLeases,
  getLeaseDocument,
  scheduleViewing,
  listMyViewings,
} from '../services/lease.service.js';

const router = Router();
router.use(authGuard);

router.post('/apply', validate(applyForLeaseSchema), async (req, res, next) => {
  try {
    const lease = await applyForLease({ ...req.body, tenantId: req.user.sub });
    res.status(201).json({ lease });
  } catch (error) {
    next(error);
  }
});

router.get('/mine', async (req, res, next) => {
  try {
    const leases = await listMyLeases(req.user.sub);
    res.json({ leases });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leases/:id/document
 * Returns printable HTML (Content-Type: text/html).
 */
router.get('/:id/document', async (req, res, next) => {
  try {
    const html = await getLeaseDocument(req.params.id, req.user.sub);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    next(error);
  }
});

router.post('/viewings', validate(scheduleViewingSchema), async (req, res, next) => {
  try {
    const viewing = await scheduleViewing({ ...req.body, requesterId: req.user.sub });
    res.status(201).json({ viewing });
  } catch (error) {
    next(error);
  }
});

router.get('/viewings/mine', async (req, res, next) => {
  try {
    const viewings = await listMyViewings(req.user.sub);
    res.json({ viewings });
  } catch (error) {
    next(error);
  }
});

export default router;