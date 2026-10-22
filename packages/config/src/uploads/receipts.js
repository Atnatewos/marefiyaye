/**
 * @file packages/config/src/uploads/receipts.js
 *
 * Receipt upload rules specific to the manual bank transfer flow.
 *
 * Why this file exists:
 *   - Receipts have different constraints than property images (smaller, PDF allowed).
 *   - The admin review UI needs an explicit schema of what must be present.
 *   - Re-uses the FT reference regex from `business/payments.js` so there is one source.
 *
 * Contract: checkout UI and payment upload endpoint both read from here.
 */

import {
  ACCEPTED_RECEIPT_MIME_TYPES,
  MAX_RECEIPT_BYTES,
  FT_REF_REGEX,
} from '../business/payments.js';

/**
 * Receipt upload constraints (same values as `business/payments.js` for consistency).
 * Re-exported here under a receipt-specific name for clarity in consumer code.
 */
export const RECEIPT_CONSTRAINTS = Object.freeze({
  maxBytes: MAX_RECEIPT_BYTES,
  acceptedMimeTypes: ACCEPTED_RECEIPT_MIME_TYPES,
  referenceRegex: FT_REF_REGEX,
});

/**
 * Fields the guest must supply for a payment to enter AWAITING_VERIFICATION.
 * Order matches the checkout form layout.
 */
export const REQUIRED_RECEIPT_FIELDS = Object.freeze([
  { key: 'method', labelEn: 'Payment Method', labelAm: 'የክፍያ ዘዴ' },
  { key: 'reference', labelEn: 'Transaction Reference', labelAm: 'የግብይት ማጣቀሻ' },
  { key: 'receipt', labelEn: 'Receipt Image', labelAm: 'የክፍያ ደረሰኝ' },
]);

/**
 * Optional fields the guest may supply to speed admin review.
 */
export const OPTIONAL_RECEIPT_FIELDS = Object.freeze([
  { key: 'paidAt', labelEn: 'Payment Date', labelAm: 'የክፍያ ቀን' },
  { key: 'note', labelEn: 'Note to Admin', labelAm: 'ለአስተዳዳሪ ማስታወሻ' },
]);