/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE — Booking Settings Schema
 * Path: packages/shared/src/config/schema/booking.js
 *
 * Purpose:
 *   Controls how guests can book — advance windows, minimum/maximum stay
 *   durations, guest limits, and cleaning-fee defaults.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default [
  {
    key: 'booking.max_advance_days',
    type: 'number',
    default: 365,
    category: 'booking',
    label_en: 'Max days in advance a guest can book',
    label_am: 'እንግዳ ከመፈለጉ በፊት ማስያዝ የሚችል ከፍተኛ ቀናት',
    is_public: true,
    validator: (value) => typeof value === 'number' && value >= 1 && value <= 730,
  },
  {
    key: 'booking.min_nights',
    type: 'number',
    default: 1,
    category: 'booking',
    label_en: 'Minimum nights (short-term)',
    label_am: 'ዝቅተኛ እድሮች (አጭር ጊዜ)',
    is_public: true,
    validator: (value) => typeof value === 'number' && value >= 1,
  },
  {
    key: 'booking.max_nights',
    type: 'number',
    default: 90,
    category: 'booking',
    label_en: 'Maximum nights (short-term)',
    label_am: 'ከፍተኛ እድሮች (አጭር ጊዜ)',
    is_public: true,
    validator: (value) => typeof value === 'number' && value >= 1,
  },
  {
    key: 'booking.min_months',
    type: 'number',
    default: 1,
    category: 'booking',
    label_en: 'Minimum months (long-term)',
    label_am: 'ዝቅተኛ ወራት (ረጅም ጊዜ)',
    is_public: true,
    validator: (value) => typeof value === 'number' && value >= 1,
  },
  {
    key: 'booking.max_months',
    type: 'number',
    default: 24,
    category: 'booking',
    label_en: 'Maximum months (long-term)',
    label_am: 'ከፍተኛ ወራት (ረጅም ጊዜ)',
    is_public: true,
    validator: (value) => typeof value === 'number' && value >= 1 && value <= 60,
  },
  {
    key: 'booking.default_max_guests',
    type: 'number',
    default: 6,
    category: 'booking',
    label_en: 'Default max guests per booking',
    label_am: 'ነባሪ ከፍተኛ እንግዶች በአንድ ቦታ ማስያዣ',
    is_public: true,
    validator: (value) => typeof value === 'number' && value >= 1 && value <= 50,
  },
  {
    key: 'booking.default_cleaning_fee_short',
    type: 'number',
    default: 800,
    category: 'booking',
    label_en: 'Default cleaning fee (short-term, ETB)',
    label_am: 'ነባሪ የጽዳት ክፍያ (አጭር ጊዜ, ብር)',
    is_public: true,
    validator: (value) => typeof value === 'number' && value >= 0,
  },
  {
    key: 'booking.default_cleaning_fee_long',
    type: 'number',
    default: 2500,
    category: 'booking',
    label_en: 'Default cleaning fee (long-term, ETB)',
    label_am: 'ነባሪ የጽዳት ክፍያ (ረጅም ጊዜ, ብር)',
    is_public: true,
    validator: (value) => typeof value === 'number' && value >= 0,
  },
  {
    key: 'booking.allow_same_day_booking',
    type: 'bool',
    default: true,
    category: 'booking',
    label_en: 'Allow same-day booking',
    label_am: 'በዚያው ቀን ቦታ ማስያዝ ፍቀድ',
    is_public: true,
  },
  {
    key: 'booking.min_lead_time_hours',
    type: 'number',
    default: 0,
    category: 'booking',
    label_en: 'Minimum lead time before check-in (hours)',
    label_am: 'ከመግቢያ በፊት ዝቅተኛ የመጠባበቂያ ጊዜ (ሰዓት)',
    is_public: true,
    validator: (value) => typeof value === 'number' && value >= 0 && value <= 720,
  },
];