/**
 * @file packages/config/src/business/pricing.js
 *
 * Pricing rules shared by web (preview) and api (authoritative).
 *
 * Why this file exists:
 *   - A price preview that differs from the server-computed total is a support nightmare.
 *   - Fee percentages, discount tiers, and thresholds must have ONE source of truth.
 *   - Rule changes (e.g. raise service fee to 6%) should be a single-file edit.
 *
 * Rule enforced: no numeric pricing constant may appear in application code.
 */

/**
 * Core pricing configuration.
 *
 * serviceFeePct              – Platform commission on short-term stays (percent of base)
 * hybridWeeklyDiscountPct    – Discount applied to nightly rate for stays ≥ weeklyMinNights
 * hybridMonthlyDiscountPct   – Discount applied to nightly rate for stays ≥ monthlyMinNights
 * weeklyMinNights            – Night count at which the weekly discount kicks in
 * monthlyMinNights           – Night count at which the monthly discount kicks in
 * minBookingNights           – Shortest stay allowed (prevents 0-night bookings)
 * maxBookingNights           – Longest stay allowed before lease application is required
 * leaseMinMonths             – Shortest long-term lease duration
 * leaseMaxMonths             – Longest long-term lease duration
 */
export const PRICING = Object.freeze({
  serviceFeePct: 5,

  hybridWeeklyDiscountPct: 10,
  hybridMonthlyDiscountPct: 35,

  weeklyMinNights: 7,
  monthlyMinNights: 30,

  minBookingNights: 1,
  maxBookingNights: 365,

  leaseMinMonths: 1,
  leaseMaxMonths: 24,
});

/**
 * Deposit rules for long-term leases.
 *
 * defaultSecurityDepositPct – Security deposit as a fraction of one month's rent
 * utilityDepositPct         – Additional deposit when utilities are tenant-paid
 */
export const DEPOSIT_RULES = Object.freeze({
  defaultSecurityDepositPct: 0.5,
  utilityDepositPct: 0.25,
});

/**
 * Refund policy configuration.
 * Percentages are applied to the booking total (excluding service fee).
 *
 * fullRefundDaysBefore – Cancellations this many days before check-in receive 100%
 * halfRefundDaysBefore – Between fullRefundDaysBefore and this threshold receive 50%
 *                       (cancellations later than this receive 0%)
 */
export const REFUND_POLICY = Object.freeze({
  fullRefundDaysBefore: 7,
  halfRefundDaysBefore: 2,
});