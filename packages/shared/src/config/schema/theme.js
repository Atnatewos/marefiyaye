/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE — Theme Settings Schema
 * Path: packages/shared/src/config/schema/theme.js
 *
 * Purpose:
 *   Every color, radius, and font exposed to the admin panel. Values feed
 *   CSS custom properties on the frontend, so editing here re-themes the
 *   whole site on next page load.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default [
  {
    key: 'theme.primary_color',
    type: 'string',
    default: '#964B00',
    category: 'theme',
    label_en: 'Primary brand color',
    label_am: 'ዋና የብራንድ ቀለም',
    is_public: true,
    validator: (value) => typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value),
  },
  {
    key: 'theme.primary_hover_color',
    type: 'string',
    default: '#7a3d00',
    category: 'theme',
    label_en: 'Primary hover color',
    label_am: 'የመጠቆሚያ ቀለም',
    is_public: true,
    validator: (value) => typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value),
  },
  {
    key: 'theme.primary_contrast_color',
    type: 'string',
    default: '#ffffff',
    category: 'theme',
    label_en: 'Primary contrast color (text on primary)',
    label_am: 'የጽሑፍ ቀለም በዋና ቀለም ላይ',
    is_public: true,
    validator: (value) => typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value),
  },
  {
    key: 'theme.dark_bg_color',
    type: 'string',
    default: '#141414',
    category: 'theme',
    label_en: 'Dark mode background',
    label_am: 'የጨለማ ገጽታ ዳራ',
    is_public: true,
    validator: (value) => typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value),
  },
  {
    key: 'theme.font_sans',
    type: 'string',
    default: 'Plus Jakarta Sans',
    category: 'theme',
    label_en: 'Primary sans-serif font',
    label_am: 'ዋና የፊደል ቅርጽ',
    is_public: true,
    validator: (value) => typeof value === 'string' && value.length <= 100,
  },
  {
    key: 'theme.font_ethiopic',
    type: 'string',
    default: 'Noto Sans Ethiopic',
    category: 'theme',
    label_en: 'Ethiopic script font',
    label_am: 'የግዕዝ ፊደል ቅርጽ',
    is_public: true,
    validator: (value) => typeof value === 'string' && value.length <= 100,
  },
  {
    key: 'theme.radius_sm',
    type: 'string',
    default: '8px',
    category: 'theme',
    label_en: 'Small corner radius',
    label_am: 'ትንሽ የማዕዘን ራዲየስ',
    is_public: true,
    validator: (value) => typeof value === 'string' && /^\d+(px|rem|em)$/.test(value),
  },
  {
    key: 'theme.radius_md',
    type: 'string',
    default: '16px',
    category: 'theme',
    label_en: 'Medium corner radius',
    label_am: 'መካከለኛ የማዕዘን ራዲየስ',
    is_public: true,
    validator: (value) => typeof value === 'string' && /^\d+(px|rem|em)$/.test(value),
  },
  {
    key: 'theme.radius_lg',
    type: 'string',
    default: '24px',
    category: 'theme',
    label_en: 'Large corner radius',
    label_am: 'ትልቅ የማዕዘን ራዲየስ',
    is_public: true,
    validator: (value) => typeof value === 'string' && /^\d+(px|rem|em)$/.test(value),
  },
];