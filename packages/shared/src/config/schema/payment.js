/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE — Payment Settings Schema
 * Path: packages/shared/src/config/schema/payment.js
 *
 * Purpose:
 *   Controls the manual bank-transfer workflow. Bank account details
 *   themselves live in the `bank_accounts` table (fully manageable from the
 *   admin panel) — this schema only controls workflow behavior.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default [
  {
    key: 'payment.receipt_required',
    type: 'bool',
    default: true,
    category: 'payment',
    label_en: 'Require receipt upload',
    label_am: 'የደረሰኝ ስቀላ ያስፈልጋል',
    is_public: true,
  },
  {
    key: 'payment.max_receipt_size_mb',
    type: 'number',
    default: 5,
    category: 'payment',
    label_en: 'Max receipt file size (MB)',
    label_am: 'ከፍተኛ የደረሰኝ ፋይል መጠን (MB)',
    is_public: true,
    validator: (value) => typeof value === 'number' && value >= 1 && value <= 25,
  },
  {
    key: 'payment.accepted_receipt_formats',
    type: 'array',
    default: ['image/png', 'image/jpeg', 'image/webp'],
    category: 'payment',
    label_en: 'Accepted receipt formats',
    label_am: 'የሚቀበሏቸው የደረሰኝ ቅርጾች',
    is_public: true,
    validator: (value) => Array.isArray(value) && value.length > 0 &&
      value.every((mime) => ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'].includes(mime)),
  },
  {
    key: 'payment.auto_cancel_unpaid_after_hours',
    type: 'number',
    default: 24,
    category: 'payment',
    label_en: 'Auto-cancel unpaid bookings after (hours)',
    label_am: 'ያልተከፈሉ ቦታ ማስያዣዎችን ከጊዜ በኋላ ሰርዝ (ሰዓት)',
    description: 'Set to 0 to disable auto-cancellation.',
    is_public: false,
    validator: (value) => typeof value === 'number' && value >= 0,
  },
  {
    key: 'payment.verify_requires_reason_on_reject',
    type: 'bool',
    default: true,
    category: 'payment',
    label_en: 'Require reason when rejecting a payment',
    label_am: 'ክፍያ ሲውድቅ ምክንያት ያስፈልጋል',
    is_public: false,
  },
  {
    key: 'payment.allow_partial_payment',
    type: 'bool',
    default: false,
    category: 'payment',
    label_en: 'Allow partial payments',
    label_am: 'ከፊል ክፍያ ፍቀድ',
    is_public: false,
  },
];