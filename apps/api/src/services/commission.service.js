/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Commission Service
 * Path: apps/api/src/services/commission.service.js
 *
 * Purpose:
 *   Resolves the commission rate for a booking. Priority:
 *     1. Listing-level override (if feature enabled + set)
 *     2. Global default from settings
 *
 *   Applies min/max caps, rounding strategy, and returns both the rate
 *   and the computed amount. The caller freezes these onto the booking.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import configService from './config.service.js';

/**
 * Rounds a number according to the configured strategy.
 *
 * @param {number} value
 * @param {'round'|'floor'|'ceil'} strategy
 * @returns {number}
 */
function applyRounding(value, strategy) {
  if (strategy === 'floor') return Math.floor(value);
  if (strategy === 'ceil') return Math.ceil(value);
  return Math.round(value);
}

/**
 * Resolves and computes the commission for a booking.
 *
 * @param {object} params
 * @param {number} params.subtotal         - rate × quantity (nights/months)
 * @param {number|null} params.override    - listing commission_override (or null)
 * @returns {Promise<{ rate: number, amount: number }>}
 */
export async function resolveCommission({ subtotal, override = null }) {
  const allowOverride = await configService.getValue('commission.allow_listing_override');
  const defaultRate = await configService.getValue('commission.default_rate');
  const minimumFee = await configService.getValue('commission.minimum_fee');
  const maximumFee = await configService.getValue('commission.maximum_fee');
  const roundingStrategy = await configService.getValue('commission.rounding_strategy');

  const rate =
    allowOverride && override !== null && override !== undefined
      ? Number(override)
      : Number(defaultRate);

  let amount = applyRounding((subtotal * rate) / 100, roundingStrategy);

  if (minimumFee > 0 && amount < minimumFee) amount = minimumFee;
  if (maximumFee > 0 && amount > maximumFee) amount = maximumFee;

  return { rate, amount };
}

export default Object.freeze({ resolveCommission });