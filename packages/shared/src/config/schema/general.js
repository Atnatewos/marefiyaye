/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE — General Settings Schema
 * Path: packages/shared/src/config/schema/general.js
 *
 * Purpose:
 *   Declares platform-wide identity, contact, and operational settings.
 *   Every entry here becomes an editable field in the admin panel and a row
 *   in the `settings` table on seed.
 *
 * Schema entry contract:
 *   {
 *     key:         string   — unique dotted key
 *     type:        string   — 'string' | 'number' | 'bool' | 'json' | 'array'
 *     default:     any      — default value applied on seed
 *     category:    string   — matches SETTINGS_CATEGORIES
 *     label_en:    string   — English admin label
 *     label_am:    string   — Amharic admin label
 *     description: string   — optional hint shown under the input
 *     is_public:   boolean  — true = exposed to unauthenticated frontend
 *     validator:   function — optional (value) => boolean
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default [
  {
    key: 'general.platform_name',
    type: 'string',
    default: 'MAREFIYAYE',
    category: 'general',
    label_en: 'Platform name',
    label_am: 'የመድረኩ ስም',
    description: 'Displayed in the header, footer, and browser tab title.',
    is_public: true,
    validator: (value) => typeof value === 'string' && value.trim().length > 0 && value.length <= 100,
  },
  {
    key: 'general.platform_name_am',
    type: 'string',
    default: 'ማረፊያዬ',
    category: 'general',
    label_en: 'Platform name (Amharic)',
    label_am: 'የመድረኩ ስም (አማርኛ)',
    is_public: true,
    validator: (value) => typeof value === 'string' && value.length <= 100,
  },
  {
    key: 'general.tagline_en',
    type: 'string',
    default: "Ethiopia's hybrid home rental marketplace",
    category: 'general',
    label_en: 'Tagline (English)',
    label_am: 'መሪ መስመር (እንግሊዝኛ)',
    is_public: true,
    validator: (value) => typeof value === 'string' && value.length <= 200,
  },
  {
    key: 'general.tagline_am',
    type: 'string',
    default: 'የኢትዮጵያ የተቀናጀ የቤት ኪራይ መድረክ',
    category: 'general',
    label_en: 'Tagline (Amharic)',
    label_am: 'መሪ መስመር (አማርኛ)',
    is_public: true,
    validator: (value) => typeof value === 'string' && value.length <= 200,
  },
  {
    key: 'general.support_email',
    type: 'string',
    default: 'support@marefiyaye.com',
    category: 'general',
    label_en: 'Support email',
    label_am: 'የድጋፍ ኢሜይል',
    is_public: true,
    validator: (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  },
  {
    key: 'general.support_phone',
    type: 'string',
    default: '+251 900 000 000',
    category: 'general',
    label_en: 'Support phone',
    label_am: 'የድጋፍ ስልክ',
    is_public: true,
    validator: (value) => typeof value === 'string' && value.length <= 30,
  },
  {
    key: 'general.default_currency',
    type: 'string',
    default: 'ETB',
    category: 'general',
    label_en: 'Default currency',
    label_am: 'ነባሪ ገንዘብ',
    description: 'ISO 4217 code. ETB is the only supported value today.',
    is_public: true,
    validator: (value) => value === 'ETB',
  },
  {
    key: 'general.default_language',
    type: 'string',
    default: 'en',
    category: 'general',
    label_en: 'Default language',
    label_am: 'ነባሪ ቋንቋ',
    description: 'Fallback language when detection cannot resolve a preference.',
    is_public: true,
    validator: (value) => ['en', 'am'].includes(value),
  },
  {
    key: 'general.timezone',
    type: 'string',
    default: 'Africa/Addis_Ababa',
    category: 'general',
    label_en: 'Platform timezone',
    label_am: 'የመድረኩ የሰዓት ክልል',
    is_public: false,
    validator: (value) => typeof value === 'string' && value.length <= 64,
  },
  {
    key: 'general.maintenance_mode',
    type: 'bool',
    default: false,
    category: 'general',
    label_en: 'Maintenance mode',
    label_am: 'የጥገና ሁኔታ',
    description: 'When enabled, the public site shows a maintenance page.',
    is_public: true,
  },
];