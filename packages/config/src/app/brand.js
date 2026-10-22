/**
 * @file packages/config/src/app/brand.js
 *
 * Brand identity configuration.
 *
 * Why this file exists:
 *   - Brand strings (names, taglines, links) appear in many components.
 *   - Defining them once means renaming the product is a one-file change.
 *   - Amharic strings sit side-by-side with English so i18n never drifts.
 *
 * Every value is static — no env access. Editing this file is intentional and
 * reviewable; runtime overrides are not permitted for brand identity.
 */

/**
 * Primary brand identity, frozen to prevent runtime mutation.
 *
 * nameEn       – English product name, shown in Latin-script contexts
 * nameAm       – Amharic product name, shown in Amharic contexts
 * taglineEn    – English marketing tagline
 * taglineAm    – Amharic marketing tagline
 * shortCode    – 1–3 character mark for the logo tile
 * logoPath     – absolute path to the SVG logo used in metadata and emails
 * faviconPath  – absolute path to the favicon
 * domain       – canonical domain (used to build absolute URLs)
 * supportEmail – public support email address
 * supportPhone – public support phone number (E.164 format)
 */
export const BRAND = Object.freeze({
  nameEn: 'Marefiyaye',
  nameAm: 'ማረፊያዬ',
  taglineEn: 'Hybrid Stays & Real Estate',
  taglineAm: 'ሁለት ዓይነት መኖሪያ በአንድ ቦታ',
  shortCode: 'ማ',
  logoPath: '/images/brand/logo.svg',
  faviconPath: '/favicon.ico',
  domain: 'marefiyaye.com',
  supportEmail: 'support@marefiyaye.com',
  supportPhone: '+251920944941',
});

/**
 * Social media profile URLs.
 * Optional values are empty strings — consumers should check before rendering.
 */
export const SOCIAL_LINKS = Object.freeze({
  facebook: '',
  instagram: '',
  telegram: '',
  twitter: '',
  linkedin: '',
});

/**
 * Metadata copy used on marketing surfaces (home hero, about page, meta tags).
 * Kept separate from BRAND so headline copy can evolve without touching identity.
 */
export const BRAND_COPY = Object.freeze({
  heroTitleEn: 'Find Your Resting Stay - Nightly or Long Lease.',
  heroTitleAm: 'የማረፊያ ቦታዎን ያግኙ - በአጭርም ሆነ በረጅም ጊዜ ኪራይ።',
  heroSubtitleEn:
    "Ethiopia's first hybrid housing engine, bridging short diaspora stays and long-term residences.",
  heroSubtitleAm:
    'የኢትዮጵያ የመጀመሪያው ሁለት ዓይነት የቤት ኪራይ መድረክ - ለአጭርና ለረጅም ጊዜ ቆይታ።',
  footerAttributionEn: 'Addis Ababa, Ethiopia.',
  footerAttributionAm: 'በአዲስ አበባ፣ ኢትዮጵያ።',
});