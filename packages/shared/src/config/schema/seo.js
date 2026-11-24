/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE — SEO Settings Schema
 * Path: packages/shared/src/config/schema/seo.js
 *
 * Purpose:
 *   Controls metadata that powers search engines, social sharing cards,
 *   and structured data. Read by Next.js `generateMetadata`.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default [
  {
    key: 'seo.meta_title',
    type: 'string',
    default: 'MAREFIYAYE — Hybrid Home Rental Marketplace in Ethiopia',
    category: 'seo',
    label_en: 'Default meta title',
    label_am: 'ነባሪ የሜታ ርዕስ',
    is_public: true,
    validator: (value) => typeof value === 'string' && value.length <= 120,
  },
  {
    key: 'seo.meta_description',
    type: 'string',
    default: 'Find short-term daily rentals or long-term monthly leases across Ethiopia with verified hosts and manual bank payment.',
    category: 'seo',
    label_en: 'Default meta description',
    label_am: 'ነባሪ የሜታ መግለጫ',
    is_public: true,
    validator: (value) => typeof value === 'string' && value.length <= 300,
  },
  {
    key: 'seo.og_image_url',
    type: 'string',
    default: '',
    category: 'seo',
    label_en: 'Open Graph image URL',
    label_am: 'የኦፕን ግራፍ ምስል አድራሻ',
    is_public: true,
    validator: (value) => typeof value === 'string',
  },
  {
    key: 'seo.canonical_base_url',
    type: 'string',
    default: '',
    category: 'seo',
    label_en: 'Canonical base URL',
    label_am: 'መሠረታዊ አድራሻ',
    description: 'Full origin used for canonical links (e.g. https://marefiyaye.com).',
    is_public: true,
    validator: (value) => typeof value === 'string' && (value === '' || /^https?:\/\//.test(value)),
  },
  {
    key: 'seo.robots_indexing_enabled',
    type: 'bool',
    default: true,
    category: 'seo',
    label_en: 'Allow search engine indexing',
    label_am: 'የፍለጋ ሞተር መረጃ ጠቋሚ ፍቀድ',
    is_public: true,
  },
  {
    key: 'seo.structured_data_enabled',
    type: 'bool',
    default: true,
    category: 'seo',
    label_en: 'Enable structured data (JSON-LD)',
    label_am: 'የተዋቀረ ውሂብ (JSON-LD) ይንቃ',
    is_public: true,
  },
];