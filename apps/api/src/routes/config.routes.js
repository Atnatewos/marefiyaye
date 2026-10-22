/**
 * @file apps/api/src/routes/config.routes.js
 *
 * Public configuration endpoint.
 *
 * Why this file exists:
 *   - The frontend needs runtime config: bank list, categories, amenities,
 *     exchange rate. This endpoint returns everything the checkout and
 *     filter UIs need without bundling it into the client JS.
 *   - Read-only — no auth required.
 *   - All values come from `@marefiyaye/config` — single source of truth.
 */

import { Router } from 'express';
import { PAYMENT_METHOD_SEEDS } from '@marefiyaye/config/business';
import { CATEGORIES, AMENITIES, UTILITIES, CITIES } from '@marefiyaye/config/business';
import { STAY_TYPES, STAY_TYPE_LABELS, BOOKING_STATUS, VIEWING_STATUS, VIEWING_TIME_SLOTS } from '@marefiyaye/config/business';
import { LEASE_DURATIONS, LEASE_STATUS } from '@marefiyaye/config/business';
import { CURRENCY, getDefaultEtbPerUsd } from '@marefiyaye/config/integrations';
import { apiEnv } from '../config/env.js';

const router = Router();

/**
 * GET /api/config
 * Returns all public configuration in one payload.
 */
router.get('/', (req, res) => {
  res.json({
    paymentMethods: PAYMENT_METHOD_SEEDS,
    categories: CATEGORIES,
    amenities: AMENITIES,
    utilities: UTILITIES,
    cities: CITIES,
    stayTypes: Object.values(STAY_TYPES),
    stayTypeLabels: STAY_TYPE_LABELS,
    bookingStatus: BOOKING_STATUS,
    viewingStatus: VIEWING_STATUS,
    viewingTimeSlots: VIEWING_TIME_SLOTS,
    leaseDurations: LEASE_DURATIONS,
    leaseStatus: LEASE_STATUS,
    currency: {
      base: CURRENCY.base,
      displayOptions: CURRENCY.displayOptions,
      symbols: CURRENCY.symbols,
      etbPerUsd: getDefaultEtbPerUsd(),
    },
    environment: apiEnv.NODE_ENV,
  });
});

export default router;