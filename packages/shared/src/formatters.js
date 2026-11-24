/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE — Shared Formatters
 * Path: packages/shared/src/formatters.js
 *
 * Purpose:
 *   Pure display helpers shared by api (notifications, exports) and web
 *   (cards, booking widget, admin tables). No React, no DOM — safe to run
 *   anywhere.
 *
 * Exports:
 *   - formatETB, formatCurrency
 *   - formatDate, formatDateRange, formatRelativeTime
 *   - formatNights, formatMonths
 *   - formatGuestSummary
 *   - formatBedBathFurnished
 *   - formatRating
 *   - formatPercent
 *   - truncate, slugify, maskAccountNumber, maskPhone, maskEmail
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { CURRENCIES, LANGUAGES } from './constants.js';

/* ── Money ───────────────────────────────────────────────────────────────── */

/**
 * Formats an amount in Ethiopian Birr using thousands separators and no
 * decimals (ETB transactions are whole birr in this product).
 *
 * @param {number} amount
 * @param {object} [options]
 * @param {string} [options.currency='ETB']
 * @param {boolean} [options.showCurrency=true]
 * @returns {string}
 */
export function formatETB(amount, { currency = CURRENCIES.ETB, showCurrency = true } = {}) {
  const safe = Number.isFinite(amount) ? amount : 0;
  const rounded = Math.round(safe);
  const withSeparators = rounded.toLocaleString('en-US');
  return showCurrency ? `${withSeparators} ${currency}` : withSeparators;
}

/**
 * Generic currency formatter — wraps formatETB today, extends when more
 * currencies land.
 *
 * @param {number} amount
 * @param {string} [currency='ETB']
 * @returns {string}
 */
export function formatCurrency(amount, currency = CURRENCIES.ETB) {
  return formatETB(amount, { currency });
}

/**
 * Formats a fraction (0–1 or 0–100) as a percentage string.
 *
 * @param {number} value — 3 means 3%, 0.03 means 3% (auto-detected below 1)
 * @param {number} [decimals=1]
 * @returns {string}
 */
export function formatPercent(value, decimals = 1) {
  const safe = Number.isFinite(value) ? value : 0;
  const normalized = safe >= 0 && safe <= 1 ? safe * 100 : safe;
  return `${normalized.toFixed(decimals)}%`;
}

/* ── Dates ───────────────────────────────────────────────────────────────── */

/**
 * Formats a date using the given locale. Defaults to `en-GB` for a
 * compact, non-ambiguous style (e.g. "12 Nov 2026").
 *
 * @param {Date|string|number} input
 * @param {object} [options]
 * @param {string} [options.lang='en']
 * @param {string} [options.style='medium'] — 'short' | 'medium' | 'long'
 * @returns {string}
 */
export function formatDate(input, { lang = 'en', style = 'medium' } = {}) {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';

  const locale = lang === 'am' ? 'am-ET' : 'en-GB';
  const dateStyle = style === 'long' ? 'long' : style === 'short' ? 'short' : 'medium';

  try {
    return new Intl.DateTimeFormat(locale, { dateStyle }).format(date);
  } catch {
    return date.toISOString().split('T')[0];
  }
}

/**
 * Formats a start–end date range using the given locale.
 *
 * @param {Date|string|number} start
 * @param {Date|string|number} end
 * @param {object} [options]
 * @param {string} [options.lang='en']
 * @returns {string}
 */
export function formatDateRange(start, end, { lang = 'en' } = {}) {
  const startStr = formatDate(start, { lang, style: 'short' });
  const endStr = formatDate(end, { lang, style: 'short' });
  return startStr && endStr ? `${startStr} – ${endStr}` : startStr || endStr;
}

/**
 * Formats how long ago a timestamp was — "10m ago", "2h ago", "3d ago".
 *
 * @param {Date|string|number} input
 * @returns {string}
 */
export function formatRelativeTime(input) {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const seconds = Math.round(diffMs / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(months / 12)}y ago`;
}

/* ── Durations ───────────────────────────────────────────────────────────── */

/**
 * Formats a night count — "1 night" or "3 nights".
 *
 * @param {number} count
 * @returns {string}
 */
export function formatNights(count) {
  const safe = Math.max(0, Math.floor(count));
  return `${safe} ${safe === 1 ? 'night' : 'nights'}`;
}

/**
 * Formats a month count — "1 month" or "6 months".
 *
 * @param {number} count
 * @returns {string}
 */
export function formatMonths(count) {
  const safe = Math.max(0, Math.floor(count));
  return `${safe} ${safe === 1 ? 'month' : 'months'}`;
}

/* ── Booking Summaries ───────────────────────────────────────────────────── */

/**
 * Formats a guest summary — "2 guests, 1 child, 1 infant".
 *
 * @param {{adults?: number, children?: number, infants?: number}} guests
 * @returns {string}
 */
export function formatGuestSummary(guests = {}) {
  const adults = Math.max(0, guests.adults || 0);
  const children = Math.max(0, guests.children || 0);
  const infants = Math.max(0, guests.infants || 0);

  const parts = [];
  if (adults > 0) parts.push(`${adults} ${adults === 1 ? 'adult' : 'adults'}`);
  if (children > 0) parts.push(`${children} ${children === 1 ? 'child' : 'children'}`);
  if (infants > 0) parts.push(`${infants} ${infants === 1 ? 'infant' : 'infants'}`);

  return parts.length ? parts.join(', ') : '0 guests';
}

/**
 * Formats bed/bath/furnished summary for the listing detail header.
 *
 * @param {object} params
 * @param {number} params.bedrooms
 * @param {number} params.bathrooms
 * @param {boolean} params.isFurnished
 * @returns {string}
 */
export function formatBedBathFurnished({ bedrooms, bathrooms, isFurnished }) {
  const bd = `${bedrooms} ${bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}`;
  const ba = `${bathrooms} ${bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}`;
  const fu = isFurnished ? 'Furnished' : 'Unfurnished';
  return `${bd} • ${ba} • ${fu}`;
}

/**
 * Formats a rating with one decimal place — "4.9" or "5.0".
 *
 * @param {number} value
 * @returns {string}
 */
export function formatRating(value) {
  const safe = Number.isFinite(value) ? value : 0;
  return safe.toFixed(1);
}

/* ── Text ────────────────────────────────────────────────────────────────── */

/**
 * Truncates a string and appends an ellipsis if needed.
 *
 * @param {string} input
 * @param {number} [max=80]
 * @returns {string}
 */
export function truncate(input, max = 80) {
  if (typeof input !== 'string') return '';
  return input.length <= max ? input : `${input.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Slugifies a string — lowercase, dash-separated, ASCII-safe.
 *
 * @param {string} input
 * @returns {string}
 */
export function slugify(input) {
  if (typeof input !== 'string') return '';
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* ── Privacy Masks ───────────────────────────────────────────────────────── */

/**
 * Masks an account number — "**** 3841 2" style.
 *
 * @param {string} value
 * @returns {string}
 */
export function maskAccountNumber(value) {
  if (typeof value !== 'string' || value.length < 4) return value || '';
  const visible = value.slice(-4);
  return `${'*'.repeat(Math.max(0, value.length - 4))}${visible}`;
}

/**
 * Masks a phone number — "+251 91* *** 567" style.
 *
 * @param {string} value
 * @returns {string}
 */
export function maskPhone(value) {
  if (typeof value !== 'string' || value.length < 6) return value || '';
  return `${value.slice(0, 6)}***${value.slice(-3)}`;
}

/**
 * Masks an email — "at***@example.com" style.
 *
 * @param {string} value
 * @returns {string}
 */
export function maskEmail(value) {
  if (typeof value !== 'string' || !value.includes('@')) return value || '';
  const [local, domain] = value.split('@');
  const head = local.slice(0, 2);
  return `${head}${'*'.repeat(Math.max(2, local.length - 2))}@${domain}`;
}

/* ── Language Metadata Helper ────────────────────────────────────────────── */

/**
 * Returns true if the given language code is supported. Convenience export
 * so consumers do not need to import LANGUAGES directly.
 *
 * @param {string} code
 * @returns {boolean}
 */
export function isSupportedLanguageCode(code) {
  return Object.values(LANGUAGES).includes(code);
}