/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE — Shared Constants
 * Path: packages/shared/src/constants.js
 *
 * Purpose:
 *   Central source of truth for every enum-like value used across the
 *   backend (apps/api) and the frontend (apps/web). No magic strings allowed
 *   in feature code — import these constants instead.
 *
 * Consumers:
 *   - apps/api : validates role/status transitions, guards routes, seeds DB
 *   - apps/web : renders badges, filters, dropdowns, admin forms
 *   - future mobile app / Telegram bot : same guarantees
 *
 * Rule: values here must match exactly the CHECK constraints in SQL migrations.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* ── User Roles ──────────────────────────────────────────────────────────── */
export const ROLES = Object.freeze({
  GUEST: 'guest',
  HOST: 'host',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
});

export const ROLE_VALUES = Object.freeze(Object.values(ROLES));

/* ── User Status ─────────────────────────────────────────────────────────── */
export const USER_STATUS = Object.freeze({
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
});

export const USER_STATUS_VALUES = Object.freeze(Object.values(USER_STATUS));

/* ── Rent Modes (core product duality) ───────────────────────────────────── */
export const RENT_MODES = Object.freeze({
  ALL: 'all',
  SHORT: 'short', // nightly pricing
  LONG: 'long',   // monthly pricing
});

export const RENT_MODE_VALUES = Object.freeze(Object.values(RENT_MODES));

/* ── Property Types ──────────────────────────────────────────────────────── */
export const PROPERTY_TYPES = Object.freeze({
  APARTMENT: 'Apartment',
  VILLA: 'Villa',
  GUEST_HOUSE: 'Guest House',
  CONDO: 'Condo',
  STUDIO: 'Studio',
  TOWNHOUSE: 'Townhouse',
});

export const PROPERTY_TYPE_VALUES = Object.freeze(Object.values(PROPERTY_TYPES));

/* ── Amenities (union set — admin can extend via config later) ───────────── */
export const AMENITIES = Object.freeze({
  WIFI: 'wifi',
  GENERATOR: 'generator',
  PARKING: 'parking',
  SECURITY: 'security',
  TV: 'tv',
  WATER_TANK: 'water_tank',
  KITCHEN: 'kitchen',
  AIR_CONDITIONING: 'air_conditioning',
  WASHER: 'washer',
  ELEVATOR: 'elevator',
  BALCONY: 'balcony',
  POOL: 'pool',
});

export const AMENITY_VALUES = Object.freeze(Object.values(AMENITIES));

/* ── Listing Lifecycle ───────────────────────────────────────────────────── */
export const LISTING_STATUS = Object.freeze({
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
});

export const LISTING_STATUS_VALUES = Object.freeze(Object.values(LISTING_STATUS));

/* ── Host Verification ───────────────────────────────────────────────────── */
export const HOST_STATUS = Object.freeze({
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
});

export const HOST_STATUS_VALUES = Object.freeze(Object.values(HOST_STATUS));

/* ── Booking Lifecycle ───────────────────────────────────────────────────── */
export const BOOKING_STATUS = Object.freeze({
  PENDING_PAYMENT: 'pending_payment',
  PAYMENT_REVIEW: 'payment_review',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  REFUNDED: 'refunded',
});

export const BOOKING_STATUS_VALUES = Object.freeze(Object.values(BOOKING_STATUS));

/* ── Payment Lifecycle (manual bank transfer workflow) ───────────────────── */
export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  REFUNDED: 'refunded',
});

export const PAYMENT_STATUS_VALUES = Object.freeze(Object.values(PAYMENT_STATUS));

/* ── Payment Methods (bank transfer targets) ─────────────────────────────── */
export const PAYMENT_METHODS = Object.freeze({
  BANK_TRANSFER: 'bank_transfer',
  TELEBIRR: 'telebirr',
  CBE_BIRR: 'cbe_birr',
  CASH: 'cash',
});

export const PAYMENT_METHOD_VALUES = Object.freeze(Object.values(PAYMENT_METHODS));

/* ── Notification Types ──────────────────────────────────────────────────── */
export const NOTIFICATION_TYPES = Object.freeze({
  BOOKING_CREATED: 'booking_created',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  PAYMENT_SUBMITTED: 'payment_submitted',
  PAYMENT_VERIFIED: 'payment_verified',
  PAYMENT_REJECTED: 'payment_rejected',
  LISTING_APPROVED: 'listing_approved',
  LISTING_REJECTED: 'listing_rejected',
  BROADCAST: 'broadcast',
  SYSTEM: 'system',
});

export const NOTIFICATION_TYPE_VALUES = Object.freeze(Object.values(NOTIFICATION_TYPES));

/* ── Notification Audiences ──────────────────────────────────────────────── */
export const BROADCAST_AUDIENCE = Object.freeze({
  ALL: 'all',
  GUESTS: 'guests',
  HOSTS: 'hosts',
  ADMINS: 'admins',
});

export const BROADCAST_AUDIENCE_VALUES = Object.freeze(Object.values(BROADCAST_AUDIENCE));

/* ── Broadcast Severity ──────────────────────────────────────────────────── */
export const BROADCAST_SEVERITY = Object.freeze({
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
});

export const BROADCAST_SEVERITY_VALUES = Object.freeze(Object.values(BROADCAST_SEVERITY));

/* ── Banner Placements ───────────────────────────────────────────────────── */
export const BANNER_PLACEMENT = Object.freeze({
  TOP_BAR: 'top_bar',
  HOME_HERO: 'home_hero',
  LISTING_TOP: 'listing_top',
});

export const BANNER_PLACEMENT_VALUES = Object.freeze(Object.values(BANNER_PLACEMENT));

/* ── Currencies (ETB live today; multi-currency prepared) ────────────────── */
export const CURRENCIES = Object.freeze({
  ETB: 'ETB',
});

export const CURRENCY_VALUES = Object.freeze(Object.values(CURRENCIES));

/* ── Languages (must mirror packages/shared/src/i18n/index.js) ───────────── */
export const LANGUAGES = Object.freeze({
  EN: 'en',
  AM: 'am',
});

export const LANGUAGE_VALUES = Object.freeze(Object.values(LANGUAGES));
export const DEFAULT_LANGUAGE = LANGUAGES.EN;

/* ── Pagination ──────────────────────────────────────────────────────────── */
export const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

/* ── Audit Actions (used by admin action log) ────────────────────────────── */
export const AUDIT_ACTIONS = Object.freeze({
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_REGISTER: 'user.register',
  USER_SUSPEND: 'user.suspend',
  USER_REACTIVATE: 'user.reactivate',
  USER_IMPERSONATE_START: 'user.impersonate.start',
  USER_IMPERSONATE_STOP: 'user.impersonate.stop',
  LISTING_CREATE: 'listing.create',
  LISTING_UPDATE: 'listing.update',
  LISTING_APPROVE: 'listing.approve',
  LISTING_REJECT: 'listing.reject',
  LISTING_SUSPEND: 'listing.suspend',
  BOOKING_CREATE: 'booking.create',
  BOOKING_CANCEL: 'booking.cancel',
  BOOKING_CONFIRM: 'booking.confirm',
  PAYMENT_SUBMIT: 'payment.submit',
  PAYMENT_VERIFY: 'payment.verify',
  PAYMENT_REJECT: 'payment.reject',
  SETTINGS_UPDATE: 'settings.update',
  BANNER_CREATE: 'banner.create',
  BANNER_UPDATE: 'banner.update',
  BANNER_DELETE: 'banner.delete',
  BROADCAST_CREATE: 'broadcast.create',
  BROADCAST_UPDATE: 'broadcast.update',
  BROADCAST_DELETE: 'broadcast.delete',
  I18N_OVERRIDE_UPSERT: 'i18n.override.upsert',
  I18N_OVERRIDE_DELETE: 'i18n.override.delete',
  BANK_ACCOUNT_CREATE: 'bank_account.create',
  BANK_ACCOUNT_UPDATE: 'bank_account.update',
  BANK_ACCOUNT_DELETE: 'bank_account.delete',
});

export const AUDIT_ACTION_VALUES = Object.freeze(Object.values(AUDIT_ACTIONS));

/* ── Settings Categories (admin panel grouping) ──────────────────────────── */
export const SETTINGS_CATEGORIES = Object.freeze({
  GENERAL: 'general',
  COMMISSION: 'commission',
  PAYMENT: 'payment',
  FEATURES: 'features',
  THEME: 'theme',
  BOOKING: 'booking',
  SEO: 'seo',
});

export const SETTINGS_CATEGORY_VALUES = Object.freeze(Object.values(SETTINGS_CATEGORIES));