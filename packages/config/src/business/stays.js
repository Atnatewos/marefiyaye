/**
 * @file packages/config/src/business/stays.js
 *
 * Stay-type registry, booking states, and viewing states.
 *
 * Why this file exists:
 *   - The stay-type enum must match the PostgreSQL `stay_type` enum exactly.
 *   - Booking transitions (PENDING → AWAITING_VERIFICATION → CONFIRMED → COMPLETED)
 *     are business logic; they must be enforced by constants, not string comparisons.
 *   - Viewing time slots are the same everywhere they appear in the UI.
 *
 * Contract: business logic uses these enums, never bare strings.
 */

/**
 * The three supported stay types.
 * `key` matches `properties.stay_type` and is the value persisted on every property.
 *
 * SHORT_TERM – nightly rate + date-range booking
 * LONG_TERM  – monthly rate + lease application + viewing
 * HYBRID     – both nightly and monthly rates; discount tiers apply to long short-term stays
 */
export const STAY_TYPES = Object.freeze({
  SHORT_TERM: 'SHORT_TERM',
  LONG_TERM: 'LONG_TERM',
  HYBRID: 'HYBRID',
});

/**
 * Ordered list of stay type keys — drives the header toggle and filter order.
 */
export const STAY_TYPE_KEYS = Object.freeze([
  STAY_TYPES.SHORT_TERM,
  STAY_TYPES.LONG_TERM,
  STAY_TYPES.HYBRID,
]);

/**
 * Human-readable labels for the stay type toggle.
 */
export const STAY_TYPE_LABELS = Object.freeze({
  [STAY_TYPES.SHORT_TERM]: { labelEn: 'Short-Term', labelAm: 'አጭር ጊዜ', icon: 'hotel' },
  [STAY_TYPES.LONG_TERM]: { labelEn: 'Long-Term', labelAm: 'ረጅም ጊዜ', icon: 'key' },
  [STAY_TYPES.HYBRID]: { labelEn: 'Hybrid', labelAm: 'ሁለቱም', icon: 'layer-group' },
});

/**
 * Booking lifecycle states. Mirrors the PostgreSQL `booking_status` enum.
 *
 * PENDING               – created but no payment submitted
 * AWAITING_VERIFICATION – payment submitted, awaiting admin review
 * CONFIRMED             – admin verified payment; stay is locked in
 * COMPLETED             – stay dates have passed; review becomes available
 * CANCELLED             – cancelled by guest or host; refund rules apply
 */
export const BOOKING_STATUS = Object.freeze({
  PENDING: 'PENDING',
  AWAITING_VERIFICATION: 'AWAITING_VERIFICATION',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
});

/**
 * Legal booking state transitions.
 * Prevents illegal jumps (e.g. PENDING → CONFIRMED without payment verification).
 */
export const BOOKING_TRANSITIONS = Object.freeze({
  [BOOKING_STATUS.PENDING]: [BOOKING_STATUS.AWAITING_VERIFICATION, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.AWAITING_VERIFICATION]: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.CONFIRMED]: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.COMPLETED]: [],
  [BOOKING_STATUS.CANCELLED]: [],
});

/**
 * Viewing lifecycle states. Mirrors the PostgreSQL `viewing_status` enum.
 */
export const VIEWING_STATUS = Object.freeze({
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
});

/**
 * Standard viewing time slots shown in the scheduler.
 * Values are persisted as text in `viewing_requests.time_slot`.
 */
export const VIEWING_TIME_SLOTS = Object.freeze([
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
]);

/**
 * Returns `true` if the transition from `fromStatus` to `toStatus` is allowed.
 */
export function canTransitionBooking(fromStatus, toStatus) {
  const allowed = BOOKING_TRANSITIONS[fromStatus];
  return Array.isArray(allowed) && allowed.includes(toStatus);
}