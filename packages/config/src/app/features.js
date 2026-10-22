/**
 * @file packages/config/src/app/features.js
 *
 * Feature flag configuration.
 *
 * Why this file exists:
 *   - Features must be toggleable without code changes or deployments.
 *   - Conditional logic scattered across the app is impossible to audit.
 *   - A single registry makes it obvious what is on and what is dark.
 *
 * Usage: `isFeatureEnabled(FEATURES.SHORT_TERM_BOOKING)`.
 * Never write `if (someBoolean)` for a product feature — always import from here.
 */

/**
 * Canonical feature keys.
 * Consumers import these constants (not bare strings) to avoid typos.
 */
export const FEATURE_KEYS = Object.freeze({
  SHORT_TERM_BOOKING: 'shortTermBooking',
  LONG_TERM_LEASING: 'longTermLeasing',
  HYBRID_LISTINGS: 'hybridListings',
  VIEWING_SCHEDULER: 'viewingScheduler',
  DIGITAL_LEASE: 'digitalLease',
  MESSAGING: 'messaging',
  WISHLIST: 'wishlist',
  REVIEWS: 'reviews',
  MANUAL_BANK_TRANSFER: 'manualBankTransfer',
  ADMIN_PAYMENT_VERIFICATION: 'adminPaymentVerification',
  AMHARIC_LOCALE: 'amharicLocale',
  USD_CURRENCY: 'usdCurrency',
});

/**
 * Feature flag state.
 * Every flag is a boolean. Adding a new feature requires:
 *   1. Add the key to FEATURE_KEYS.
 *   2. Add the value here.
 */
export const FEATURES = Object.freeze({
  [FEATURE_KEYS.SHORT_TERM_BOOKING]: true,
  [FEATURE_KEYS.LONG_TERM_LEASING]: true,
  [FEATURE_KEYS.HYBRID_LISTINGS]: true,
  [FEATURE_KEYS.VIEWING_SCHEDULER]: true,
  [FEATURE_KEYS.DIGITAL_LEASE]: true,
  [FEATURE_KEYS.MESSAGING]: true,
  [FEATURE_KEYS.WISHLIST]: true,
  [FEATURE_KEYS.REVIEWS]: true,
  [FEATURE_KEYS.MANUAL_BANK_TRANSFER]: true,
  [FEATURE_KEYS.ADMIN_PAYMENT_VERIFICATION]: true,
  [FEATURE_KEYS.AMHARIC_LOCALE]: true,
  [FEATURE_KEYS.USD_CURRENCY]: true,
});

/**
 * Returns `true` if the given feature is enabled.
 * Unknown keys return `false` (fail-closed) — a missing flag must never accidentally
 * enable a feature in production.
 */
export function isFeatureEnabled(featureKey) {
  return FEATURES[featureKey] === true;
}

/**
 * Throws if the feature is disabled.
 * Use in server-side handlers where a disabled feature must hard-stop the request.
 */
export function assertFeatureEnabled(featureKey) {
  if (!isFeatureEnabled(featureKey)) {
    throw new Error(`Feature "${featureKey}" is currently disabled.`);
  }
}