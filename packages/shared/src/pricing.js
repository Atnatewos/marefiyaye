/**
 * @file packages/shared/src/pricing.js
 *
 * Pricing engine shared by web (live preview) and api (authoritative total).
 *
 * Why this file exists:
 *   - A price preview that differs from the server-computed total is the
 *     single most damaging UX bug in a booking platform. This file removes
 *     that possibility by making preview and charge use identical code.
 *   - Fee percentages, discount tiers, and thresholds come from
 *     `@marefiyaye/config/business` so a policy change is a one-file edit.
 *   - All calculations are pure functions — no I/O, no side effects — so
 *     they are trivially testable and safe to call from anywhere.
 *
 * Contract: prices are integers in ETB. Rounding is applied consistently via
 * `Math.round` and documented per function.
 */

import {
  PRICING,
  DEPOSIT_RULES,
  REFUND_POLICY,
} from '@marefiyaye/config/business';

import { calculateNights, daysFromToday } from './dateUtils.js';

/**
 * Applies a whole-birr rounding policy so totals never display fractional ETB.
 * @param {number} value
 * @returns {number}
 */
function roundEtb(value) {
  return Math.round(value);
}

/**
 * Computes the total for a short-term stay.
 *
 * Formula:
 *   base        = nightlyRate × nights
 *   serviceFee  = round(base × serviceFeePct / 100)
 *   total       = base + serviceFee
 *
 * @param {number} nightlyRate - nightly rate in ETB
 * @param {number} nights      - integer number of nights (>= 1)
 * @returns {{ nights: number, nightlyRate: number, base: number, serviceFee: number, total: number }}
 */
export function calculateShortTermTotal(nightlyRate, nights) {
  if (!Number.isFinite(nightlyRate) || nightlyRate < 0) {
    throw new RangeError('nightlyRate must be a non-negative number');
  }
  if (!Number.isInteger(nights) || nights < PRICING.minBookingNights) {
    throw new RangeError(
      `nights must be an integer >= ${PRICING.minBookingNights}`
    );
  }

  const base = roundEtb(nightlyRate * nights);
  const serviceFee = roundEtb((base * PRICING.serviceFeePct) / 100);
  const total = base + serviceFee;

  return { nights, nightlyRate, base, serviceFee, total };
}

/**
 * Returns the effective nightly rate for a hybrid listing given the stay length.
 *
 * Tiered discount logic (from config):
 *   nights >= monthlyMinNights → apply monthlyDiscountPct
 *   nights >= weeklyMinNights  → apply weeklyDiscountPct
 *   otherwise                  → full nightlyRate
 *
 * @param {number} nightlyRate
 * @param {number} nights
 * @returns {number} Effective nightly rate after discount (rounded)
 */
export function calculateHybridNightlyRate(nightlyRate, nights) {
  if (!Number.isFinite(nightlyRate) || nightlyRate < 0) {
    throw new RangeError('nightlyRate must be a non-negative number');
  }
  if (!Number.isInteger(nights) || nights < 1) {
    throw new RangeError('nights must be a positive integer');
  }

  if (nights >= PRICING.monthlyMinNights) {
    const discounted =
      nightlyRate * (1 - PRICING.hybridMonthlyDiscountPct / 100);
    return roundEtb(discounted);
  }

  if (nights >= PRICING.weeklyMinNights) {
    const discounted =
      nightlyRate * (1 - PRICING.hybridWeeklyDiscountPct / 100);
    return roundEtb(discounted);
  }

  return roundEtb(nightlyRate);
}

/**
 * Computes the full breakdown for a hybrid stay (both nightly and discounted).
 *
 * @param {number} nightlyRate
 * @param {number} nights
 * @returns {{
 *   nights: number,
 *   baseRate: number,
 *   effectiveRate: number,
 *   appliedDiscountPct: number,
 *   base: number,
 *   serviceFee: number,
 *   total: number,
 * }}
 */
export function calculateHybridTotal(nightlyRate, nights) {
  if (!Number.isInteger(nights) || nights < PRICING.minBookingNights) {
    throw new RangeError(
      `nights must be an integer >= ${PRICING.minBookingNights}`
    );
  }

  const effectiveRate = calculateHybridNightlyRate(nightlyRate, nights);

  let appliedDiscountPct = 0;
  if (nights >= PRICING.monthlyMinNights) {
    appliedDiscountPct = PRICING.hybridMonthlyDiscountPct;
  } else if (nights >= PRICING.weeklyMinNights) {
    appliedDiscountPct = PRICING.hybridWeeklyDiscountPct;
  }

  const base = roundEtb(effectiveRate * nights);
  const serviceFee = roundEtb((base * PRICING.serviceFeePct) / 100);
  const total = base + serviceFee;

  return {
    nights,
    baseRate: roundEtb(nightlyRate),
    effectiveRate,
    appliedDiscountPct,
    base,
    serviceFee,
    total,
  };
}

/**
 * Computes the total for a long-term lease.
 *
 * Formula:
 *   rent  = monthlyRate × months
 *   total = rent + deposit
 *
 * Deposit is passed explicitly (already computed by the caller based on
 * DEPOSIT_RULES and the property's own `security_deposit_etb`).
 *
 * @param {number} monthlyRate
 * @param {number} months       - integer, within [leaseMinMonths, leaseMaxMonths]
 * @param {number} deposit      - security deposit in ETB
 * @returns {{ months: number, monthlyRate: number, rent: number, deposit: number, total: number }}
 */
export function calculateLongTermTotal(monthlyRate, months, deposit = 0) {
  if (!Number.isFinite(monthlyRate) || monthlyRate < 0) {
    throw new RangeError('monthlyRate must be a non-negative number');
  }
  if (
    !Number.isInteger(months) ||
    months < PRICING.leaseMinMonths ||
    months > PRICING.leaseMaxMonths
  ) {
    throw new RangeError(
      `months must be an integer between ${PRICING.leaseMinMonths} and ${PRICING.leaseMaxMonths}`
    );
  }
  if (!Number.isFinite(deposit) || deposit < 0) {
    throw new RangeError('deposit must be a non-negative number');
  }

  const rent = roundEtb(monthlyRate * months);
  const total = rent + roundEtb(deposit);

  return {
    months,
    monthlyRate: roundEtb(monthlyRate),
    rent,
    deposit: roundEtb(deposit),
    total,
  };
}

/**
 * Computes the default security deposit for a long-term lease.
 *
 * The property's own `security_deposit_etb` overrides this when set to a
 * positive value. Otherwise the default is:
 *   deposit = round(monthlyRate × defaultSecurityDepositPct)
 *
 * If utilities are tenant-paid, `utilityDepositPct` is added on top.
 *
 * @param {number} monthlyRate
 * @param {boolean} [utilitiesTenantPaid=false]
 * @returns {number}
 */
export function calculateDefaultDeposit(monthlyRate, utilitiesTenantPaid = false) {
  if (!Number.isFinite(monthlyRate) || monthlyRate < 0) {
    throw new RangeError('monthlyRate must be a non-negative number');
  }

  const base = monthlyRate * DEPOSIT_RULES.defaultSecurityDepositPct;
  const utilities = utilitiesTenantPaid
    ? monthlyRate * DEPOSIT_RULES.utilityDepositPct
    : 0;

  return roundEtb(base + utilities);
}

/**
 * Computes the refund for a short-term booking cancellation.
 *
 * Policy (from config):
 *   daysUntilCheckIn >= fullRefundDaysBefore → 100% refund of base
 *   daysUntilCheckIn >= halfRefundDaysBefore → 50% refund of base
 *   otherwise                                → 0% refund
 *
 * The service fee is never refunded — it covers platform cost regardless of
 * cancellation.
 *
 * @param {number} baseAmount         - the base amount (excluding service fee) in ETB
 * @param {string | Date} checkIn     - the booking's check-in date
 * @returns {{ refundAmount: number, refundPct: number, daysUntilCheckIn: number }}
 */
export function calculateRefund(baseAmount, checkIn) {
  if (!Number.isFinite(baseAmount) || baseAmount < 0) {
    throw new RangeError('baseAmount must be a non-negative number');
  }

  const daysUntilCheckIn = daysFromToday(checkIn);

  let refundPct = 0;
  if (daysUntilCheckIn >= REFUND_POLICY.fullRefundDaysBefore) {
    refundPct = 100;
  } else if (daysUntilCheckIn >= REFUND_POLICY.halfRefundDaysBefore) {
    refundPct = 50;
  }

  return {
    refundAmount: roundEtb((baseAmount * refundPct) / 100),
    refundPct,
    daysUntilCheckIn,
  };
}

/**
 * Re-exports `calculateNights` so consumers of the pricing module do not
 * need a second import. Common use: computing nights from check-in/out
 * before calling a `calculate*Total` function.
 */
export { calculateNights };