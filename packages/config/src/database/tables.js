/**
 * @file packages/config/src/database/tables.js
 *
 * Canonical table, column, and enum identifiers.
 *
 * Why this file exists:
 *   - Raw SQL string typos are silent until runtime. Constants prevent them.
 *   - A table rename should update JS references without grepping the whole app.
 *   - Enum values must exactly match the migration files.
 *
 * Contract: query builders import TABLES / COLUMNS / ENUMS, never string literals.
 * Note: identifiers are the only place where SQL identifiers appear as data.
 */

/**
 * Physical table names.
 * Values must match `CREATE TABLE` names in the migration files exactly.
 */
export const TABLES = Object.freeze({
  USERS: 'users',
  PROPERTIES: 'properties',
  BOOKINGS: 'bookings',
  VIEWING_REQUESTS: 'viewing_requests',
  LEASE_APPLICATIONS: 'lease_applications',
  LEASES: 'leases',
  PAYMENTS: 'payments',
  MESSAGES: 'messages',
  WISHLISTS: 'wishlists',
  REVIEWS: 'reviews',
  AUDIT_LOGS: 'audit_logs',
  MIGRATIONS: '_migrations',
});

/**
 * Enum type names (PostgreSQL `CREATE TYPE` names).
 */
export const ENUMS = Object.freeze({
  USER_ROLE: 'user_role',
  STAY_TYPE: 'stay_type',
  BOOKING_STATUS: 'booking_status',
  PAYMENT_STATUS: 'payment_status',
  LEASE_STATUS: 'lease_status',
  VIEWING_STATUS: 'viewing_status',
});

/**
 * Column name registry per table.
 * Columns used in multiple places are listed once per table they belong to.
 */
export const COLUMNS = Object.freeze({
  USERS: Object.freeze({
    ID: 'id',
    EMAIL: 'email',
    PASSWORD_HASH: 'password_hash',
    ROLE: 'role',
    IS_VERIFIED: 'is_verified',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  }),

  PROPERTIES: Object.freeze({
    ID: 'id',
    HOST_ID: 'host_id',
    SLUG: 'slug',
    TITLE: 'title',
    STAY_TYPE: 'stay_type',
    NIGHTLY_RATE_ETB: 'nightly_rate_etb',
    MONTHLY_RATE_ETB: 'monthly_rate_etb',
    IS_VERIFIED: 'is_verified',
    IS_ACTIVE: 'is_active',
    CREATED_AT: 'created_at',
  }),

  BOOKINGS: Object.freeze({
    ID: 'id',
    PROPERTY_ID: 'property_id',
    GUEST_ID: 'guest_id',
    CHECK_IN: 'check_in',
    CHECK_OUT: 'check_out',
    STATUS: 'status',
    TOTAL_ETB: 'total_etb',
    CREATED_AT: 'created_at',
  }),

  PAYMENTS: Object.freeze({
    ID: 'id',
    BOOKING_ID: 'booking_id',
    LEASE_APPLICATION_ID: 'lease_application_id',
    METHOD: 'method',
    AMOUNT_ETB: 'amount_etb',
    REFERENCE_CODE: 'reference_code',
    RECEIPT_URL: 'receipt_url',
    STATUS: 'status',
    VERIFIED_BY: 'verified_by',
    VERIFIED_AT: 'verified_at',
    CREATED_AT: 'created_at',
  }),

  LEASES: Object.freeze({
    ID: 'id',
    LEASE_APPLICATION_ID: 'lease_application_id',
    PDF_URL: 'pdf_url',
    GENERATED_AT: 'generated_at',
  }),
});

/**
 * Canonical values for enum types.
 * These constants are what application code compares against.
 */
export const ENUM_VALUES = Object.freeze({
  USER_ROLE: Object.freeze({
    GUEST: 'GUEST',
    HOST: 'HOST',
    ADMIN: 'ADMIN',
  }),
  STAY_TYPE: Object.freeze({
    SHORT_TERM: 'SHORT_TERM',
    LONG_TERM: 'LONG_TERM',
    HYBRID: 'HYBRID',
  }),
  BOOKING_STATUS: Object.freeze({
    PENDING: 'PENDING',
    AWAITING_VERIFICATION: 'AWAITING_VERIFICATION',
    CONFIRMED: 'CONFIRMED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  }),
  PAYMENT_STATUS: Object.freeze({
    PENDING: 'PENDING',
    AWAITING_VERIFICATION: 'AWAITING_VERIFICATION',
    VERIFIED: 'VERIFIED',
    REJECTED: 'REJECTED',
  }),
  LEASE_STATUS: Object.freeze({
    APPLIED: 'APPLIED',
    APPROVED: 'APPROVED',
    ACTIVE: 'ACTIVE',
    TERMINATED: 'TERMINATED',
    REJECTED: 'REJECTED',
  }),
  VIEWING_STATUS: Object.freeze({
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  }),
});