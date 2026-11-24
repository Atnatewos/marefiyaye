/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE — Feature Flags & Configurable Lists
 * Path: packages/shared/src/config/schema/features.js
 *
 * Purpose:
 *   Boolean feature toggles AND the admin-editable data lists that drive
 *   UI options (amenities, property types). Both categories live here so
 *   the God Panel can group them under "Features" in a single screen.
 *
 *   Lists are stored as arrays of objects so each item carries its own
 *   English + Amharic labels and an optional icon key. Admins can extend
 *   the list without a code change.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* ── Default data lists (seeded on first run, overridable via admin) ─────── */

export const DEFAULT_AMENITIES = Object.freeze([
  { value: 'wifi', icon: 'wifi', label_en: 'Fiber High-Speed WiFi', label_am: 'ፈጣን ፋይበር ዋይፋይ' },
  { value: 'parking', icon: 'car', label_en: 'Free On-Premises Parking', label_am: 'ነፃ የመኪና ማቆሚያ' },
  { value: 'generator', icon: 'zap', label_en: 'Backup Generator', label_am: 'የጀነሬተር ድጋፍ' },
  { value: 'security', icon: 'shield', label_en: '24/7 Gated Security', label_am: '24/7 የጥበቃ አገልግሎት' },
  { value: 'tv', icon: 'tv', label_en: 'Smart TV', label_am: 'ስማርት ቲቪ' },
  { value: 'kitchen', icon: 'utensils', label_en: 'Fully Equipped Kitchen', label_am: 'ሙሉ የተገጠመ ኩሽና' },
  { value: 'balcony', icon: 'sparkles', label_en: 'Private Balcony', label_am: 'የግል በረንዳ' },
  { value: 'pool', icon: 'waves', label_en: 'Swimming Pool', label_am: 'የመዋኛ ገና' },
  { value: 'washer', icon: 'washing-machine', label_en: 'Washing Machine', label_am: 'የልብስ ማጠቢያ ማሽን' },
  { value: 'air_conditioning', icon: 'wind', label_en: 'Air Conditioning', label_am: 'ኤር ኮንዲሽነር' },
  { value: 'elevator', icon: 'move-up', label_en: 'Elevator Access', label_am: 'ኤሌቬተር' },
  { value: 'water_tank', icon: 'droplet', label_en: 'Water Reserve Tank', label_am: 'የውሃ ማጠራቀሚያ' },
]);

export const DEFAULT_PROPERTY_TYPES = Object.freeze([
  { value: 'Apartment', label_en: 'Apartment', label_am: 'አፓርታማ' },
  { value: 'Villa', label_en: 'Villa', label_am: 'ቪላ' },
  { value: 'Guest House', label_en: 'Guest House', label_am: 'እንግዳ ማረፊያ' },
  { value: 'Condo', label_en: 'Condo', label_am: 'ኮንዶሚኒየም' },
  { value: 'Studio', label_en: 'Studio', label_am: 'ስቱዲዮ' },
  { value: 'Townhouse', label_en: 'Townhouse', label_am: 'ታውንሃውስ' },
]);

/* ── Schema ──────────────────────────────────────────────────────────────── */

export default [
  /* ── Boolean feature flags ── */
  {
    key: 'features.short_term_enabled',
    type: 'bool',
    default: true,
    category: 'features',
    label_en: 'Enable short-term rentals',
    label_am: 'የአጭር ጊዜ ኪራይ ይንቃ',
    is_public: true,
  },
  {
    key: 'features.long_term_enabled',
    type: 'bool',
    default: true,
    category: 'features',
    label_en: 'Enable long-term rentals',
    label_am: 'የረጅም ጊዜ ኪራይ ይንቃ',
    is_public: true,
  },
  {
    key: 'features.favorites_enabled',
    type: 'bool',
    default: true,
    category: 'features',
    label_en: 'Enable favorites / saved stays',
    label_am: 'ምርጫዎች / የተቀመጡ ቆይታዎች ይንቁ',
    is_public: true,
  },
  {
    key: 'features.reviews_enabled',
    type: 'bool',
    default: true,
    category: 'features',
    label_en: 'Enable guest reviews',
    label_am: 'የእንግዳ ግምገማዎች ይንቁ',
    is_public: true,
  },
  {
    key: 'features.host_registration_enabled',
    type: 'bool',
    default: true,
    category: 'features',
    label_en: 'Allow new host applications',
    label_am: 'አዲስ የአስተናጋጅ ማመልከቻዎችን ፍቀድ',
    is_public: true,
  },
  {
    key: 'features.new_listings_require_approval',
    type: 'bool',
    default: true,
    category: 'features',
    label_en: 'New listings require admin approval',
    label_am: 'አዲስ መኖሪያዎች የአስተዳዳሪ ማረጋገጫ ያስፈልጋቸዋል',
    is_public: false,
  },
  {
    key: 'features.notifications_enabled',
    type: 'bool',
    default: true,
    category: 'features',
    label_en: 'Enable in-app notifications',
    label_am: 'የውስጠ-መተግበሪያ ማሳወቂያዎችን ይንቁ',
    is_public: true,
  },
  {
    key: 'features.broadcast_enabled',
    type: 'bool',
    default: true,
    category: 'features',
    label_en: 'Enable broadcast messages',
    label_am: 'የስርጭት መልዕክቶችን ይንቁ',
    is_public: true,
  },
  {
    key: 'features.language_switcher_enabled',
    type: 'bool',
    default: true,
    category: 'features',
    label_en: 'Show language switcher',
    label_am: 'የቋንቋ መቀየሪያ አሳይ',
    is_public: true,
  },
  {
    key: 'features.dark_mode_enabled',
    type: 'bool',
    default: true,
    category: 'features',
    label_en: 'Allow dark mode',
    label_am: 'ጨለማ ገጽታ ፍቀድ',
    is_public: true,
  },

  /* ── Editable data lists ── */

  /**
   * Amenities list. Every entry is `{ value, icon, label_en, label_am }`.
   * `icon` is the kebab-case name of a Lucide icon.
   * Admins can add/remove entries from the God Panel.
   */
  {
    key: 'features.amenities_list',
    type: 'array',
    default: DEFAULT_AMENITIES,
    category: 'features',
    label_en: 'Amenities',
    label_am: 'መገልገያዎች',
    description: 'Amenities selectable when creating a listing.',
    is_public: true,
    validator: (value) =>
      Array.isArray(value) &&
      value.every(
        (a) =>
          a &&
          typeof a.value === 'string' &&
          typeof a.label_en === 'string' &&
          typeof a.label_am === 'string'
      ),
  },

  /**
   * Property types list. Every entry is `{ value, label_en, label_am }`.
   * `value` is what gets stored on the listing row.
   */
  {
    key: 'features.property_types_list',
    type: 'array',
    default: DEFAULT_PROPERTY_TYPES,
    category: 'features',
    label_en: 'Property types',
    label_am: 'የንብረት ዓይነቶች',
    description: 'Property types selectable when creating a listing.',
    is_public: true,
    validator: (value) =>
      Array.isArray(value) &&
      value.every(
        (t) =>
          t &&
          typeof t.value === 'string' &&
          typeof t.label_en === 'string' &&
          typeof t.label_am === 'string'
      ),
  },
];