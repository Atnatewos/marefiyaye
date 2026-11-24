/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE — Commission Settings Schema
 * Path: packages/shared/src/config/schema/commission.js
 *
 * Purpose:
 *   Controls platform revenue logic. The default rate applies to every booking
 *   unless a listing carries a `commission_override`. The resolved rate is
 *   frozen onto the booking at confirmation time for historical accuracy.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default [
  {
    key: 'commission.default_rate',
    type: 'number',
    default: 3,
    category: 'commission',
    label_en: 'Default commission rate (%)',
    label_am: 'ነባሪ የኮሚሽን መጠን (%)',
    description: 'Applied to every booking unless a listing overrides it.',
    is_public: false,
    validator: (value) => typeof value === 'number' && value >= 0 && value <= 50,
  },
  {
    key: 'commission.allow_listing_override',
    type: 'bool',
    default: true,
    category: 'commission',
    label_en: 'Allow per-listing override',
    label_am: 'በየመኖሪያው መተካት ፍቀድ',
    description: 'When off, all bookings use the default rate regardless of listing.',
    is_public: false,
  },
  {
    key: 'commission.minimum_fee',
    type: 'number',
    default: 0,
    category: 'commission',
    label_en: 'Minimum commission per booking (ETB)',
    label_am: 'ዝቅተኛ የኮሚሽን ክፍያ በአንድ ቦታ ማስያዣ (ብር)',
    is_public: false,
    validator: (value) => typeof value === 'number' && value >= 0,
  },
  {
    key: 'commission.maximum_fee',
    type: 'number',
    default: 0,
    category: 'commission',
    label_en: 'Maximum commission per booking (ETB, 0 = no cap)',
    label_am: 'ከፍተኛ የኮሚሽን ክፍያ በአንድ ቦታ ማስያዣ (ብር, 0 = ጣሪያ የለም)',
    is_public: false,
    validator: (value) => typeof value === 'number' && value >= 0,
  },
  {
    key: 'commission.rounding_strategy',
    type: 'string',
    default: 'round',
    category: 'commission',
    label_en: 'Rounding strategy',
    label_am: 'የማጠጋጋት ስልት',
    description: 'How the final commission amount is rounded.',
    is_public: false,
    validator: (value) => ['round', 'floor', 'ceil'].includes(value),
  },
];