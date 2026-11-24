/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Server Constants
 * Path: apps/api/src/config/constants.js
 *
 * Purpose:
 *   Server-only constants that do NOT belong in `@marefiyaye/shared`
 *   (because the frontend never needs them). Business-domain enums like
 *   roles, statuses, and property types live in `@marefiyaye/shared` and
 *   are re-exported here for a single import surface inside the API.
 *
 *   Every value in this file must be an immutable identifier — no
 *   environment-dependent values (those live in `config/env.js`).
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* ── Re-exports from shared (single source of truth) ─────────────────────── */

export {
  AUDIT_ACTIONS,
  ROLES,
  USER_STATUS,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  LISTING_STATUS,
  HOST_STATUS,
} from '@marefiyaye/shared/constants';

/* ── Cookie Names (auth session transport) ───────────────────────────────── */

export const COOKIE_NAMES = Object.freeze({
  ACCESS_TOKEN: 'mrf_access',
  REFRESH_TOKEN: 'mrf_refresh',
  LANG: 'mrf_lang',
  THEME: 'mrf_theme',
});

/* ── Auth Timing ─────────────────────────────────────────────────────────── */

export const AUTH = Object.freeze({
  ACCESS_TOKEN_COOKIE_PATH: '/',
  REFRESH_TOKEN_COOKIE_PATH: '/api/v1/auth',
  REFRESH_ROTATION_GRACE_MS: 30_000,
  BCRYPT_ROUNDS: 12,
});

/* ── Pagination Bounds (server-side enforcement) ─────────────────────────── */

export const PAGINATION_LIMITS = Object.freeze({
  MIN_PAGE: 1,
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
  DEFAULT_LIMIT: 20,
});

/* ── Booking Code Generator ──────────────────────────────────────────────── */

export const BOOKING_CODE = Object.freeze({
  PREFIX: 'MRF',
  SEPARATOR: '-',
  LENGTH: 6,
  ALPHABET: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
});

/* ── Upload Rules ────────────────────────────────────────────────────────── */

export const UPLOAD_RULES = Object.freeze({
  RECEIPT_FIELD: 'receipt',
  LISTING_IMAGE_FIELD: 'images',
  MAX_LISTING_IMAGES: 15,
  RECEIPT_MIME_TYPES: Object.freeze(['image/png', 'image/jpeg', 'image/webp']),
  LISTING_IMAGE_MIME_TYPES: Object.freeze(['image/png', 'image/jpeg', 'image/webp']),
});

/* ── Audit Log Resource Types ────────────────────────────────────────────── */

export const AUDIT_RESOURCES = Object.freeze({
  USER: 'user',
  HOST: 'host',
  LISTING: 'listing',
  BOOKING: 'booking',
  PAYMENT: 'payment',
  SETTING: 'setting',
  BANK_ACCOUNT: 'bank_account',
  BANNER: 'banner',
  BROADCAST: 'broadcast',
  SESSION: 'session',
});

/* ── Notification Internal Event Names ───────────────────────────────────── */

export const NOTIFICATION_EVENTS = Object.freeze({
  BOOKING_CREATED: 'booking_created',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  PAYMENT_SUBMITTED: 'payment_submitted',
  PAYMENT_VERIFIED: 'payment_verified',
  PAYMENT_REJECTED: 'payment_rejected',
  LISTING_APPROVED: 'listing_approved',
  LISTING_REJECTED: 'listing_rejected',
  HOST_VERIFIED: 'host_verified',
  HOST_REJECTED: 'host_rejected',
});

/* ── Reserved Route Prefixes (for collision checks) ──────────────────────── */

export const RESERVED_SLUGS = Object.freeze([
  'admin',
  'api',
  'auth',
  'login',
  'register',
  'dashboard',
  'host',
  'guest',
  'listings',
  'bookings',
  'payments',
  'settings',
]);