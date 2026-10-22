/**
 * @file packages/shared/src/validators.js
 *
 * Semantic validators shared by web (instant feedback) and api (authoritative).
 *
 * Why this file exists:
 *   - Form validation must run in both places: instant UX on the client,
 *     authoritative check on the server.
 *   - A single implementation guarantees "valid on client" and "valid on
 *     server" mean the same thing.
 *   - The regexes and limits live in `@marefiyaye/config/business` so
 *     a policy change is one edit; this file only composes them.
 *
 * Contract: every function returns a plain boolean. No exceptions. Callers
 * decide how to surface failure (form error, HTTP 400, log, etc).
 */

import {
  FT_REF_REGEX,
  MIN_TRANSFER_ETB,
  LEASE_DURATIONS,
} from '@marefiyaye/config/business';

/**
 * Ethiopian mobile phone regex.
 * Accepts:
 *   +251911234567   (+251 followed by 9 and 8 more digits)
 *   0911234567      (0 followed by 9 and 8 more digits)
 *   911234567       (9 followed by 8 more digits, no country/trunk prefix)
 * Mobile prefixes: 9 (Ethio Telecom) and 7 (Safaricom Ethiopia).
 */
const ET_PHONE_REGEX = /^(?:\+251|0)?[79]\d{8}$/;

/**
 * Simple RFC-5322-compatible email regex.
 * Intentionally not perfect — no client-side regex is. Server-side
 * verification via email send is the only fully reliable check.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Returns true when `value` is a plausible Ethiopian FT reference.
 * Format: "FT" followed by at least 8 alphanumeric characters (case-insensitive).
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidFtReference(value) {
  if (typeof value !== 'string') return false;
  return FT_REF_REGEX.test(value.trim());
}

/**
 * Returns true when `value` looks like an Ethiopian mobile number.
 * Accepts both E.164 (+251…) and local (0…) forms.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidEthiopianPhone(value) {
  if (typeof value !== 'string') return false;
  return ET_PHONE_REGEX.test(value.replace(/[\s-]/g, ''));
}

/**
 * Returns true when `value` has the shape of an email address.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidEmail(value) {
  if (typeof value !== 'string') return false;
  return EMAIL_REGEX.test(value.trim());
}

/**
 * Returns true when `value` is a positive integer number of ETB.
 * Used for both nightly and monthly rates, and for deposit amounts.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidPrice(value) {
  if (typeof value !== 'number') return false;
  if (!Number.isFinite(value)) return false;
  if (value < 0) return false;
  return Number.isInteger(value);
}

/**
 * Returns true when a transfer amount meets the platform's minimum.
 *
 * @param {number} amount
 * @returns {boolean}
 */
export function isValidTransferAmount(amount) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return false;
  return amount >= MIN_TRANSFER_ETB;
}

/**
 * Returns true when `guests` is between 1 and `maxGuests` inclusive.
 *
 * @param {unknown} guests
 * @param {number} maxGuests
 * @returns {boolean}
 */
export function isValidGuests(guests, maxGuests) {
  if (typeof guests !== 'number' || !Number.isInteger(guests)) return false;
  if (typeof maxGuests !== 'number' || maxGuests < 1) return false;
  return guests >= 1 && guests <= maxGuests;
}

/**
 * Returns true when `months` is one of the configured lease durations.
 *
 * @param {unknown} months
 * @returns {boolean}
 */
export function isValidLeaseMonths(months) {
  if (typeof months !== 'number' || !Number.isInteger(months)) return false;
  return LEASE_DURATIONS.some((entry) => entry.months === months);
}

/**
 * Returns true when both dates form a valid stay of at least 1 night.
 * Does not check availability — only the shape of the input.
 *
 * @param {string | Date} checkIn
 * @param {string | Date} checkOut
 * @returns {boolean}
 */
export function isValidDateRange(checkIn, checkOut) {
  const start = new Date(checkIn instanceof Date ? checkIn : `${checkIn}T00:00:00Z`);
  const end = new Date(checkOut instanceof Date ? checkOut : `${checkOut}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
  return end > start;
}

/**
 * Returns true when `value` is a non-empty string after trimming.
 * Used for names, addresses, and free-text fields.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Returns true when `value` is a UUID v4 string. Basic shape check —
 * no cryptographic verification.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isUuid(value) {
  if (typeof value !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}