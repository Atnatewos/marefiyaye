/**
 * @file packages/config/src/business/payments.js
 *
 * Payment lifecycle constants and initial seed defaults.
 *
 * Why this file exists:
 *   - Status enums must match the PostgreSQL `payment_status` enum exactly.
 *   - The FT reference regex and receipt constraints are validation rules, not data.
 *   - `PAYMENT_METHOD_SEEDS` is the INITIAL seed used by migration 016 to populate
 *     the `payment_methods` table. After seeding, admins manage payment methods
 *     through the admin panel — this file is never read at runtime by the frontend.
 *
 * Architecture:
 *   - Static enums + validation rules → this file (code, deployed with app).
 *   - Payment method definitions (banks, accounts, enable state) → `payment_methods`
 *     database table (data, managed by admins).
 *   - Runtime consumers (checkout UI, payment service) read from the DB via
 *     `GET /api/config/payment-methods`, never from this file.
 *
 * Rule enforced: no real account number, owner name, or bank list is hardcoded
 * anywhere. All seed rows contain PLACEHOLDER values that admins replace in
 * production through the admin panel.
 */

/**
 * Payment lifecycle states. Mirrors the PostgreSQL `payment_status` enum.
 *
 * PENDING               – payment record created, no reference submitted yet
 * AWAITING_VERIFICATION – reference submitted, awaiting admin review
 * VERIFIED              – admin confirmed the transfer; booking/lease transitions
 * REJECTED              – admin rejected the submission; guest must resubmit
 */
export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'PENDING',
  AWAITING_VERIFICATION: 'AWAITING_VERIFICATION',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
});

/**
 * All statuses the admin may transition a payment INTO from AWAITING_VERIFICATION.
 */
export const VERIFIABLE_PAYMENT_STATUSES = Object.freeze([
  PAYMENT_STATUS.VERIFIED,
  PAYMENT_STATUS.REJECTED,
]);

/**
 * Canonical payment method type values.
 * Persisted in `payment_methods.type`.
 */
export const PAYMENT_METHOD_TYPES = Object.freeze({
  BANK: 'bank',
  MOBILE: 'mobile',
});

/**
 * Neutral placeholder used for every seed row.
 * Why a single constant: `0000000000` is obviously fake — it forces a conscious
 * admin action to set the real account before accepting real guests.
 */
const PLACEHOLDER_ACCOUNT = '0000000000';

/**
 * Initial payment method seed data.
 *
 * Why this lives in config rather than in the migration:
 *   - The migration remains data-agnostic (schema only).
 *   - Seeding is idempotent and reviewable as code.
 *   - Adding a new default bank later is a small edit here plus a re-run of seed.
 *
 * These values are INSERTED into `payment_methods` only if the table is empty.
 * Admins then freely edit, disable, or add more methods via the admin panel.
 *
 * Field notes:
 *   key              – stable identifier, matches `payments.method` when used
 *   labelEn/labelAm  – bilingual display names
 *   type             – 'bank' or 'mobile'
 *   accountNumber    – NEUTRAL PLACEHOLDER; admins set the real value in production
 *   ownerName        – NEUTRAL PLACEHOLDER; admins set the real value in production
 *   iconName         – frontend icon identifier
 *   displayOrder     – order in the checkout selector (lower first)
 *   isEnabled        – whether the method is offered at checkout
 */
export const PAYMENT_METHOD_SEEDS = Object.freeze([
  Object.freeze({
    key: 'TELEBIRR',
    labelEn: 'Telebirr',
    labelAm: 'ቴሌብር',
    type: PAYMENT_METHOD_TYPES.MOBILE,
    accountNumber: PLACEHOLDER_ACCOUNT,
    ownerName: 'Marefiyaye Stays',
    iconName: 'telebirr',
    displayOrder: 10,
    isEnabled: true,
  }),
  Object.freeze({
    key: 'CBE',
    labelEn: 'Commercial Bank of Ethiopia',
    labelAm: 'ኢትዮጵያ ንግድ ባንክ',
    type: PAYMENT_METHOD_TYPES.BANK,
    accountNumber: PLACEHOLDER_ACCOUNT,
    ownerName: 'Marefiyaye Real Estate PLC',
    iconName: 'cbe',
    displayOrder: 20,
    isEnabled: true,
  }),
  Object.freeze({
    key: 'BOA',
    labelEn: 'Bank of Abyssinia',
    labelAm: 'የአቢሲኒያ ባንክ',
    type: PAYMENT_METHOD_TYPES.BANK,
    accountNumber: PLACEHOLDER_ACCOUNT,
    ownerName: 'Marefiyaye Real Estate PLC',
    iconName: 'boa',
    displayOrder: 30,
    isEnabled: true,
  }),
  Object.freeze({
    key: 'AWASH',
    labelEn: 'Awash Bank',
    labelAm: 'አዋሽ ባንክ',
    type: PAYMENT_METHOD_TYPES.BANK,
    accountNumber: PLACEHOLDER_ACCOUNT,
    ownerName: 'Marefiyaye Real Estate PLC',
    iconName: 'awash',
    displayOrder: 40,
    isEnabled: true,
  }),
]);

/**
 * Regular expression for Ethiopian FT (Funds Transfer) reference codes.
 * Format: FT followed by 8+ alphanumeric characters.
 * Used to soft-validate user input before manual admin review.
 */
export const FT_REF_REGEX = /^FT[A-Z0-9]{8,}$/i;

/**
 * Minimum accepted transfer amount in ETB.
 */
export const MIN_TRANSFER_ETB = 100;

/**
 * Maximum receipt image size in bytes (5 MB).
 * Enforced identically on client and server.
 */
export const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

/**
 * Accepted MIME types for receipts.
 */
export const ACCEPTED_RECEIPT_MIME_TYPES = Object.freeze([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);