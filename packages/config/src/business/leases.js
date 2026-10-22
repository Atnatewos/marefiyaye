/**
 * @file packages/config/src/business/leases.js
 *
 * Long-term lease configuration.
 *
 * Why this file exists:
 *   - Lease durations offered in the wizard must match what the server accepts.
 *   - The lease document structure is data, not code — templating belongs to config.
 *   - Status enums match the PostgreSQL `lease_status` enum for airtight DB sync.
 *
 * Contract: lease application and document generation read from here.
 */

/**
 * Lease lifecycle states. Mirrors the PostgreSQL `lease_status` enum.
 *
 * APPLIED     – tenant submitted application, awaiting payment & approval
 * APPROVED    – host approved; awaiting payment verification
 * ACTIVE      – payment verified; lease is legally in force
 * TERMINATED  – lease ended (by agreement, expiry, or breach)
 * REJECTED    – host rejected the application
 */
export const LEASE_STATUS = Object.freeze({
  APPLIED: 'APPLIED',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  TERMINATED: 'TERMINATED',
  REJECTED: 'REJECTED',
});

/**
 * Lease duration options offered in the wizard.
 * Each option states the number of months and its bilingual label.
 */
export const LEASE_DURATIONS = Object.freeze([
  { months: 1, labelEn: '1 Month', labelAm: '1 ወር' },
  { months: 3, labelEn: '3 Months', labelAm: '3 ወሮች' },
  { months: 6, labelEn: '6 Months', labelAm: '6 ወሮች' },
  { months: 12, labelEn: '1 Year', labelAm: '1 ዓመት' },
  { months: 24, labelEn: '2 Years', labelAm: '2 ዓመት' },
]);

/**
 * Sections that make up the printed lease agreement.
 * Order is preserved in the generated document.
 *
 * Each section has a stable `key` (used by templating) and bilingual headings.
 */
export const LEASE_SECTIONS = Object.freeze([
  { key: 'parties', headingEn: 'Parties', headingAm: 'ተዋዋዮች' },
  { key: 'premises', headingEn: 'Premises', headingAm: 'ንብረቱ' },
  { key: 'term', headingEn: 'Lease Term & Rent', headingAm: 'የኪራይ ጊዜና ክፍያ' },
  { key: 'utilities', headingEn: 'Utilities & Bills', headingAm: 'መገልገያዎች' },
  { key: 'deposit', headingEn: 'Security Deposit', headingAm: 'የዋስትና ተቀማጭ' },
  { key: 'rules', headingEn: 'House Rules', headingAm: 'የቤት ደንቦች' },
  { key: 'governingLaw', headingEn: 'Governing Law', headingAm: 'የሚመራበት ሕግ' },
  { key: 'signatures', headingEn: 'Signatures', headingAm: 'ፊርማዎች' },
]);

/**
 * Governing law statement shown in every generated lease.
 * Included in both languages for legal clarity.
 */
export const GOVERNING_LAW = Object.freeze({
  en: 'This lease agreement is governed by the Civil Code and urban housing proclamations of the Federal Democratic Republic of Ethiopia.',
  am: 'ይህ የኪራይ ውል በኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ ሲቪል ሕግና በከተማ ቤቶች ኪራይ አዋጆች ይመራል።',
});

/**
 * Returns `true` when the given months count is a valid lease duration.
 */
export function isValidLeaseDuration(months) {
  return LEASE_DURATIONS.some((d) => d.months === months);
}