/**
 * @file packages/config/src/business/properties.js
 *
 * Property taxonomy: categories, amenities, utilities, cities, and status enums.
 *
 * Why this file exists:
 *   - Search filters, listing wizard, and detail pages must all agree on categories.
 *   - Adding a category or a city should not require touching six components.
 *   - Bilingual labels stay in sync because EN + AM live side-by-side here.
 *
 * Contract: components import CATEGORIES / AMENITIES / UTILITIES / CITIES, never literals.
 */

/**
 * Property categories available for listing.
 * Each entry has stable `key` (persisted), EN/AM labels, and an icon identifier.
 */
export const CATEGORIES = Object.freeze([
  { key: 'apartment', labelEn: 'Apartments', labelAm: 'አፓርታማ', icon: 'building' },
  { key: 'villa', labelEn: 'Luxury Villas', labelAm: 'ቪላ', icon: 'home' },
  { key: 'condo', labelEn: 'Condos', labelAm: 'ኮንዶሚኒየም', icon: 'layers' },
  { key: 'guesthouse', labelEn: 'Guesthouses', labelAm: 'የእንግዳ ማረፊያ', icon: 'door' },
  { key: 'studio', labelEn: 'Studios', labelAm: 'ስቱዲዮ', icon: 'couch' },
  { key: 'ecolodge', labelEn: 'Eco Lodges', labelAm: 'የተፈጥሮ ማረፊያ', icon: 'tree' },
]);

/**
 * Amenity registry.
 * `key` is persisted on the property; labels appear in the details grid.
 * `category` groups amenities on the UI ("Safety", "Comfort", etc.).
 */
export const AMENITIES = Object.freeze([
  { key: 'wifi', labelEn: 'High-Speed Wi-Fi', labelAm: 'ፈጣን ዋይፋይ', category: 'connectivity' },
  { key: 'generator', labelEn: '24/7 Backup Generator', labelAm: 'የኃይል ማመንጫ', category: 'utilities' },
  { key: 'waterTank', labelEn: 'Water Tank & Pump', labelAm: 'የውሃ ታንክ', category: 'utilities' },
  { key: 'parking', labelEn: 'Parking', labelAm: 'መኪና ማቆሚያ', category: 'convenience' },
  { key: 'elevator', labelEn: 'Elevator', labelAm: 'ሊፍት', category: 'convenience' },
  { key: 'security', labelEn: '24/7 Security', labelAm: '24/7 ጥበቃ', category: 'safety' },
  { key: 'electricFence', labelEn: 'Electric Fence', labelAm: 'ኤሌክትሪክ አጥር', category: 'safety' },
  { key: 'cctv', labelEn: 'CCTV Surveillance', labelAm: 'የካሜራ ክትትል', category: 'safety' },
  { key: 'airConditioning', labelEn: 'Air Conditioning', labelAm: 'ኤር ኮንዲሽነር', category: 'comfort' },
  { key: 'heating', labelEn: 'Heating', labelAm: 'ማሞቂያ', category: 'comfort' },
  { key: 'washingMachine', labelEn: 'Washing Machine', labelAm: 'የልብስ ማጠቢያ', category: 'comfort' },
  { key: 'kitchen', labelEn: 'Full Kitchen', labelAm: 'ሙሉ ኩሽና', category: 'comfort' },
  { key: 'smartTv', labelEn: 'Smart TV', labelAm: 'ስማርት ቲቪ', category: 'comfort' },
  { key: 'balcony', labelEn: 'Balcony', labelAm: 'በረንዳ', category: 'comfort' },
  { key: 'garden', labelEn: 'Private Garden', labelAm: 'የግል ጓሮ', category: 'outdoor' },
  { key: 'pool', labelEn: 'Swimming Pool', labelAm: 'የዋና ገንዳ', category: 'outdoor' },
  { key: 'firepit', labelEn: 'Firepit', labelAm: 'የእሳት ቦታ', category: 'outdoor' },
  { key: 'workspace', labelEn: 'Dedicated Workspace', labelAm: 'የሥራ ቦታ', category: 'connectivity' },
]);

/**
 * Utility registry.
 * `key` is persisted in `properties.utilities_included` JSONB array.
 * The utilities matrix on the detail page renders all entries, checking which are included.
 */
export const UTILITIES = Object.freeze([
  { key: 'electricity', labelEn: 'EEU Electricity', labelAm: 'ኤሌክትሪክ', icon: 'bolt' },
  { key: 'water', labelEn: 'Water Utility', labelAm: 'ውሃ', icon: 'water' },
  { key: 'wifi', labelEn: 'High-Speed Wi-Fi', labelAm: 'ዋይፋይ', icon: 'wifi' },
  { key: 'security', labelEn: 'Security Guard', labelAm: 'ጥበቃ', icon: 'shield' },
  { key: 'condoFee', labelEn: 'Condo / HOA Fees', labelAm: 'የኮንዶ ክፍያ', icon: 'building' },
]);

/**
 * Cities and neighborhoods in the initial launch geography.
 * `city` is the persisted value; `neighborhoods` powers autocomplete suggestions.
 */
export const CITIES = Object.freeze([
  { city: 'Addis Ababa', labelAm: 'አዲስ አበባ', neighborhoods: ['Bole Atlas', 'Old Airport', 'Kazanchis', 'Sarbet', 'CMC', 'Megenagna'] },
  { city: 'Bahir Dar', labelAm: 'ባህር ዳር', neighborhoods: ['Tana Shore', 'Kebele 14'] },
  { city: 'Bishoftu', labelAm: 'ቢሾፍቱ', neighborhoods: ['Lake Babogaya', 'Lake Hora'] },
  { city: 'Hawassa', labelAm: 'ሀዋሳ', neighborhoods: ['Lake Hawassa', 'Tabor'] },
  { city: 'Adama', labelAm: 'አዳማ', neighborhoods: ['Franko', 'Boku'] },
  { city: 'Dire Dawa', labelAm: 'ድሬዳዋ', neighborhoods: ['Kefira', 'Sabean'] },
]);

/**
 * Property publication status.
 * A property transitions: DRAFT → PENDING_REVIEW → ACTIVE (or REJECTED).
 */
export const PROPERTY_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED',
  ARCHIVED: 'ARCHIVED',
});

/**
 * Type guard for category keys — useful when parsing untrusted query strings.
 */
export function isValidCategory(categoryKey) {
  return CATEGORIES.some((c) => c.key === categoryKey);
}