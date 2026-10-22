/**
 * @file packages/shared/src/dateUtils.js
 *
 * Date arithmetic and formatting utilities.
 *
 * Why this file exists:
 *   - Night counts, overlap detection, and locale-aware formatting appear in
 *     both web and api. A single implementation prevents drift.
 *   - Native JavaScript Date arithmetic has subtle timezone pitfalls. All
 *     functions here normalize to UTC midnight to eliminate them.
 *   - No external date library (date-fns, dayjs, moment) is needed — the
 *     operations this platform requires are simple enough that a 15KB
 *     dependency would be bloat.
 *
 * Contract: all dates crossing a boundary (API request, DB storage) are
 * ISO 'YYYY-MM-DD' strings. All internal arithmetic uses UTC Date objects.
 */

import { LOCALES, DEFAULT_LOCALE } from '@marefiyaye/config/app';

/**
 * Milliseconds in one day. Used for date arithmetic.
 */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Converts an ISO 'YYYY-MM-DD' string (or Date) into a UTC-midnight Date.
 * Throws if the input is not a valid date.
 *
 * @param {string | Date} value
 * @returns {Date}
 */
function toUtcDate(value) {
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`Invalid date value: ${value}`);
  }

  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ));
}

/**
 * Formats a Date back to ISO 'YYYY-MM-DD' (date only, UTC).
 *
 * @param {Date | string} value
 * @returns {string}
 */
export function toIsoDate(value) {
  const date = toUtcDate(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the number of nights between two dates.
 * A stay from 2026-11-01 to 2026-11-05 is 4 nights.
 *
 * @param {string | Date} checkIn
 * @param {string | Date} checkOut
 * @returns {number} Integer number of nights (always >= 0)
 */
export function calculateNights(checkIn, checkOut) {
  const start = toUtcDate(checkIn);
  const end = toUtcDate(checkOut);

  if (end < start) {
    return 0;
  }

  return Math.round((end - start) / MS_PER_DAY);
}

/**
 * Returns true when two date ranges overlap.
 *
 * Ranges are half-open [checkIn, checkOut) — the checkout day of one booking
 * is available as the check-in day of the next, which matches hospitality
 * convention.
 *
 * @param {{ checkIn: string | Date, checkOut: string | Date }} rangeA
 * @param {{ checkIn: string | Date, checkOut: string | Date }} rangeB
 * @returns {boolean}
 */
export function datesOverlap(rangeA, rangeB) {
  const aStart = toUtcDate(rangeA.checkIn);
  const aEnd = toUtcDate(rangeA.checkOut);
  const bStart = toUtcDate(rangeB.checkIn);
  const bEnd = toUtcDate(rangeB.checkOut);

  return aStart < bEnd && bStart < aEnd;
}

/**
 * Returns true when the given date lies inside the given range (inclusive).
 *
 * @param {string | Date} date
 * @param {{ checkIn: string | Date, checkOut: string | Date }} range
 * @returns {boolean}
 */
export function isDateInRange(date, range) {
  const target = toUtcDate(date);
  const start = toUtcDate(range.checkIn);
  const end = toUtcDate(range.checkOut);
  return target >= start && target <= end;
}

/**
 * Expands a date range into the list of every night between checkIn and
 * checkOut (exclusive of checkOut). Useful for marking blocked calendar days.
 *
 * Example: getNightDates('2026-11-01', '2026-11-04')
 *   → ['2026-11-01', '2026-11-02', '2026-11-03']
 *
 * @param {string | Date} checkIn
 * @param {string | Date} checkOut
 * @returns {string[]}
 */
export function getNightDates(checkIn, checkOut) {
  const nights = calculateNights(checkIn, checkOut);
  if (nights === 0) return [];

  const start = toUtcDate(checkIn);
  const dates = [];

  for (let i = 0; i < nights; i += 1) {
    const cursor = new Date(start.getTime() + i * MS_PER_DAY);
    dates.push(toIsoDate(cursor));
  }

  return dates;
}

/**
 * Returns a new date shifted by a whole number of days. Negative values shift
 * backward in time.
 *
 * @param {string | Date} value
 * @param {number} days
 * @returns {Date}
 */
export function addDays(value, days) {
  const base = toUtcDate(value);
  return new Date(base.getTime() + days * MS_PER_DAY);
}

/**
 * Returns the number of whole days between today (UTC) and the given date.
 * Positive for future dates, zero for today, negative for past dates.
 *
 * @param {string | Date} value
 * @returns {number}
 */
export function daysFromToday(value) {
  const target = toUtcDate(value);
  const now = new Date();
  const today = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));

  return Math.round((target - today) / MS_PER_DAY);
}

/**
 * Formats a date for display using the locale's BCP-47 tag.
 * Falls back to the default locale when the requested code is not supported.
 *
 * @param {string | Date} value
 * @param {string} [localeCode]
 * @returns {string}
 */
export function formatDate(value, localeCode = DEFAULT_LOCALE) {
  const date = toUtcDate(value);
  const localeConfig = LOCALES[localeCode] ?? LOCALES[DEFAULT_LOCALE];

  return new Intl.DateTimeFormat(localeConfig.dateLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/**
 * Formats the month and year for calendar headers.
 *
 * @param {string | Date} value
 * @param {string} [localeCode]
 * @returns {string}
 */
export function formatMonthYear(value, localeCode = DEFAULT_LOCALE) {
  const date = toUtcDate(value);
  const localeConfig = LOCALES[localeCode] ?? LOCALES[DEFAULT_LOCALE];

  return new Intl.DateTimeFormat(localeConfig.dateLocale, {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(date);
}

/**
 * Returns today's date as a UTC-midnight Date. Centralized so tests can
 * mock time without touching Date.now() in many places.
 *
 * @returns {Date}
 */
export function todayUtc() {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));
}