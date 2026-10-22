/**
 * @file apps/api/src/db/seeds/seed.js
 *
 * Idempotent database seed.
 *
 * Why this file exists:
 *   - Fresh environments need demo data to exercise the app end to end.
 *   - The seed must be safe to run repeatedly (idempotent) so it can be part
 *     of any bootstrap or reset workflow without wiping real data.
 *   - Property listings and payment methods are seeded from `@marefiyaye/config`
 *     so the shape and vocabulary stay aligned with the rest of the app.
 *
 * Usage:
 *   npm run db:seed                     (from repo root)
 *   npm run seed -w @marefiyaye/api     (from anywhere in the workspace)
 *
 * Guarantees:
 *   - Existing users are preserved (upsert via email lookup).
 *   - Existing properties are preserved (slug uniqueness checked).
 *   - Payment methods are inserted only if the table is empty.
 */

import '../../utils/loadEnv.js';

import bcrypt from 'bcryptjs';
import slugify from 'slugify';

import { transaction, rawPool, shutdown } from '../../config/db.js';
import { logger } from '../../utils/logger.js';
import { PAYMENT_METHOD_SEEDS } from '@marefiyaye/config/business';
import { ENUM_VALUES } from '@marefiyaye/config/database';

const BCRYPT_ROUNDS = 10;

const DEMO_USERS = [
  {
    email: 'admin@marefiyaye.com',
    password: 'AdminDemo123!',
    fullName: 'Platform Admin',
    role: ENUM_VALUES.USER_ROLE.ADMIN,
    isVerified: true,
    verificationLevel: 3,
  },
  {
    email: 'host@marefiyaye.com',
    password: 'HostDemo123!',
    fullName: 'Bethlehem Tesfaye',
    role: ENUM_VALUES.USER_ROLE.HOST,
    isVerified: true,
    verificationLevel: 2,
  },
  {
    email: 'guest@marefiyaye.com',
    password: 'GuestDemo123!',
    fullName: 'Selamawit Bekele',
    role: ENUM_VALUES.USER_ROLE.GUEST,
    isVerified: true,
    verificationLevel: 1,
  },
];

const DEMO_PROPERTIES = [
  {
    title: 'Luxury Penthouse in Bole Atlas with Panoramic City View',
    titleAm: 'በቦሌ አትላስ የሚገኝ ዘመናዊ ፔንትሃውስ',
    description:
      'Exquisite modern penthouse in the heart of Bole Atlas. Perfect for expatriates, returning diaspora, or tourists seeking prime nightlife, dining, and supreme security.',
    category: 'apartment',
    city: 'Addis Ababa',
    neighborhood: 'Bole Atlas',
    stayType: ENUM_VALUES.STAY_TYPE.HYBRID,
    nightlyRateEtb: 12500,
    monthlyRateEtb: 280000,
    minLeaseMonths: 3,
    securityDepositEtb: 140000,
    maxGuests: 6,
    beds: 3,
    baths: 3.5,
    amenities: ['wifi', 'generator', 'waterTank', 'parking', 'security', 'cctv', 'airConditioning', 'smartTv', 'balcony'],
    utilitiesIncluded: ['electricity', 'water', 'wifi', 'security', 'condoFee'],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    ],
    isVerified: true,
  },
  {
    title: 'Diplomatic Villa with Private Garden in Old Airport',
    titleAm: 'በኦልድ ኤርፖርት የሚገኝ ለዲፕሎማቶች የሚሆን ቪላ',
    description:
      'Spacious compound located in the secure diplomatic zone of Old Airport. Ideal for embassy personnel, international NGOs, and large families.',
    category: 'villa',
    city: 'Addis Ababa',
    neighborhood: 'Old Airport',
    stayType: ENUM_VALUES.STAY_TYPE.LONG_TERM,
    nightlyRateEtb: null,
    monthlyRateEtb: 450000,
    minLeaseMonths: 6,
    securityDepositEtb: 225000,
    maxGuests: 10,
    beds: 5,
    baths: 5,
    amenities: ['security', 'electricFence', 'garden', 'parking', 'generator', 'waterTank'],
    utilitiesIncluded: ['electricity', 'water', 'security'],
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
    ],
    isVerified: true,
  },
  {
    title: 'Modern Cozy Studio near ECA and Kazanchis',
    titleAm: 'ካዛንችስ የሚገኝ ምቹ ስቱዲዮ',
    description:
      'Cozy, modern studio walking distance from UNECA, Hilton Hotel, and major government offices. Excellent Wi-Fi and reliable power.',
    category: 'studio',
    city: 'Addis Ababa',
    neighborhood: 'Kazanchis',
    stayType: ENUM_VALUES.STAY_TYPE.SHORT_TERM,
    nightlyRateEtb: 5500,
    monthlyRateEtb: null,
    minLeaseMonths: 1,
    securityDepositEtb: 0,
    maxGuests: 2,
    beds: 1,
    baths: 1,
    amenities: ['wifi', 'generator', 'elevator', 'workspace', 'kitchen', 'washingMachine'],
    utilitiesIncluded: ['electricity', 'water', 'wifi', 'security', 'condoFee'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    ],
    isVerified: true,
  },
  {
    title: 'Lakeside Eco Lodge in Bishoftu',
    titleAm: 'በቢሾፍቱ የሚገኝ የሐይቅ ዳር ቪላ',
    description:
      'Serene lakeside getaway overlooking Lake Babogaya. Just 45 minutes from Addis via the expressway, perfect for weekend retreats and small events.',
    category: 'ecolodge',
    city: 'Bishoftu',
    neighborhood: 'Lake Babogaya',
    stayType: ENUM_VALUES.STAY_TYPE.HYBRID,
    nightlyRateEtb: 18000,
    monthlyRateEtb: 350000,
    minLeaseMonths: 1,
    securityDepositEtb: 175000,
    maxGuests: 8,
    beds: 4,
    baths: 4,
    amenities: ['wifi', 'garden', 'firepit', 'pool', 'parking', 'security'],
    utilitiesIncluded: ['electricity', 'water', 'wifi', 'security'],
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
    ],
    isVerified: true,
  },
  {
    title: 'Executive Condo in CMC with Backup Generator',
    titleAm: 'በሲኤምሲ የሚገኝ ዘመናዊ ኮንዶሚኒየም',
    description:
      'Bright two-bedroom condo in the fast-growing CMC area. Reliable backup power, elevator access, and secure parking.',
    category: 'condo',
    city: 'Addis Ababa',
    neighborhood: 'CMC',
    stayType: ENUM_VALUES.STAY_TYPE.HYBRID,
    nightlyRateEtb: 7200,
    monthlyRateEtb: 145000,
    minLeaseMonths: 3,
    securityDepositEtb: 72500,
    maxGuests: 4,
    beds: 2,
    baths: 2,
    amenities: ['wifi', 'generator', 'waterTank', 'elevator', 'parking', 'security', 'washingMachine'],
    utilitiesIncluded: ['electricity', 'water', 'security', 'condoFee'],
    images: [
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    ],
    isVerified: true,
  },
  {
    title: 'Sunny One-Bedroom Apartment in Megenagna',
    titleAm: 'በመገናኛ የሚገኝ ባለ አንድ መኝታ አፓርታማ',
    description:
      'Compact and cheerful one-bedroom apartment minutes from the Megenagna roundabout. Ideal for young professionals commuting to Bole or Kazanchis.',
    category: 'apartment',
    city: 'Addis Ababa',
    neighborhood: 'Megenagna',
    stayType: ENUM_VALUES.STAY_TYPE.SHORT_TERM,
    nightlyRateEtb: 4200,
    monthlyRateEtb: null,
    minLeaseMonths: 1,
    securityDepositEtb: 0,
    maxGuests: 3,
    beds: 1,
    baths: 1,
    amenities: ['wifi', 'generator', 'waterTank', 'security', 'kitchen'],
    utilitiesIncluded: ['electricity', 'water', 'wifi', 'security'],
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
    ],
    isVerified: true,
  },
  {
    title: 'Garden Guesthouse in Sarbet',
    titleAm: 'በሳርቤት የሚገኝ የእንግዳ ማረፊያ',
    description:
      'Charming guesthouse with a private garden in the quiet Sarbet neighborhood. Walking distance to schools, embassies, and the French Lycée.',
    category: 'guesthouse',
    city: 'Addis Ababa',
    neighborhood: 'Sarbet',
    stayType: ENUM_VALUES.STAY_TYPE.HYBRID,
    nightlyRateEtb: 8500,
    monthlyRateEtb: 185000,
    minLeaseMonths: 2,
    securityDepositEtb: 92500,
    maxGuests: 5,
    beds: 3,
    baths: 2,
    amenities: ['wifi', 'garden', 'parking', 'security', 'kitchen', 'washingMachine'],
    utilitiesIncluded: ['electricity', 'water', 'wifi', 'security'],
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
    ],
    isVerified: true,
  },
  {
    title: 'Tranquil Lakeside Villa in Bahir Dar',
    titleAm: 'በባህር ዳር የሚገኝ የሐይቅ ዳር ቪላ',
    description:
      'Peaceful lakeside villa on the shores of Lake Tana. Ideal for writers, remote workers, and families seeking a slower pace without giving up modern comforts.',
    category: 'villa',
    city: 'Bahir Dar',
    neighborhood: 'Tana Shore',
    stayType: ENUM_VALUES.STAY_TYPE.HYBRID,
    nightlyRateEtb: 9500,
    monthlyRateEtb: 195000,
    minLeaseMonths: 1,
    securityDepositEtb: 97500,
    maxGuests: 6,
    beds: 3,
    baths: 3,
    amenities: ['wifi', 'garden', 'firepit', 'parking', 'security', 'kitchen'],
    utilitiesIncluded: ['electricity', 'water', 'wifi'],
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    ],
    isVerified: true,
  },
  {
    title: 'Modern Family Home in Hawassa',
    titleAm: 'በሀዋሳ የሚገኝ ዘመናዊ የቤተሰብ ቤት',
    description:
      'Three-bedroom family home in a quiet gated community near Lake Hawassa. Backup power, water storage, and reliable internet make remote work easy.',
    category: 'villa',
    city: 'Hawassa',
    neighborhood: 'Lake Hawassa',
    stayType: ENUM_VALUES.STAY_TYPE.LONG_TERM,
    nightlyRateEtb: null,
    monthlyRateEtb: 165000,
    minLeaseMonths: 6,
    securityDepositEtb: 82500,
    maxGuests: 6,
    beds: 3,
    baths: 2,
    amenities: ['wifi', 'generator', 'waterTank', 'parking', 'security', 'kitchen'],
    utilitiesIncluded: ['electricity', 'water', 'security'],
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80',
    ],
    isVerified: true,
  },
  {
    title: 'Contemporary Studio in Adama Business District',
    titleAm: 'በአዳማ የቢዝነስ አካባቢ የሚገኝ ስቱዲዮ',
    description:
      'Compact studio for business travelers in Adama. Walking distance to the main commercial district and quick access to the expressway.',
    category: 'studio',
    city: 'Adama',
    neighborhood: 'Franko',
    stayType: ENUM_VALUES.STAY_TYPE.SHORT_TERM,
    nightlyRateEtb: 3200,
    monthlyRateEtb: null,
    minLeaseMonths: 1,
    securityDepositEtb: 0,
    maxGuests: 2,
    beds: 1,
    baths: 1,
    amenities: ['wifi', 'generator', 'security', 'kitchen'],
    utilitiesIncluded: ['electricity', 'water', 'wifi', 'security'],
    images: [
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
    ],
    isVerified: true,
  },
  {
    title: 'Rustic Eco Cabin near Lake Hora',
    titleAm: 'በሐይቅ ሆራ አጠገብ የሚገኝ ኢኮ ካቢን',
    description:
      'Warm wooden eco cabin surrounded by greenery near Lake Hora. Solar backup, filtered water, and a firepit make this a genuine escape.',
    category: 'ecolodge',
    city: 'Bishoftu',
    neighborhood: 'Lake Hora',
    stayType: ENUM_VALUES.STAY_TYPE.SHORT_TERM,
    nightlyRateEtb: 6800,
    monthlyRateEtb: null,
    minLeaseMonths: 1,
    securityDepositEtb: 0,
    maxGuests: 4,
    beds: 2,
    baths: 1,
    amenities: ['wifi', 'firepit', 'garden', 'parking'],
    utilitiesIncluded: ['electricity', 'water', 'wifi'],
    images: [
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80',
    ],
    isVerified: true,
  },
  {
    title: 'Corner Apartment with Bole Medhanialem Views',
    titleAm: 'በቦሌ መድሃኒያለም የሚገኝ አፓርታማ',
    description:
      'Corner unit with floor-to-ceiling windows overlooking Bole Medhanialem. Walk to restaurants, cafes, and the airport in twenty minutes.',
    category: 'apartment',
    city: 'Addis Ababa',
    neighborhood: 'Bole Atlas',
    stayType: ENUM_VALUES.STAY_TYPE.HYBRID,
    nightlyRateEtb: 9600,
    monthlyRateEtb: 210000,
    minLeaseMonths: 3,
    securityDepositEtb: 105000,
    maxGuests: 4,
    beds: 2,
    baths: 2,
    amenities: ['wifi', 'generator', 'elevator', 'parking', 'security', 'smartTv', 'balcony'],
    utilitiesIncluded: ['electricity', 'water', 'wifi', 'security', 'condoFee'],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    ],
    isVerified: true,
  },
  {
    title: 'Family Guesthouse in Dire Dawa',
    titleAm: 'በድሬዳዋ የሚገኝ የቤተሰብ የእንግዳ ማረፊያ',
    description:
      'Spacious guesthouse in historic Dire Dawa with a shaded courtyard. Ideal for extended family visits and business travelers.',
    category: 'guesthouse',
    city: 'Dire Dawa',
    neighborhood: 'Kefira',
    stayType: ENUM_VALUES.STAY_TYPE.HYBRID,
    nightlyRateEtb: 4500,
    monthlyRateEtb: 95000,
    minLeaseMonths: 2,
    securityDepositEtb: 47500,
    maxGuests: 6,
    beds: 3,
    baths: 2,
    amenities: ['wifi', 'garden', 'parking', 'security', 'kitchen'],
    utilitiesIncluded: ['electricity', 'water', 'wifi'],
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
    ],
    isVerified: true,
  },
  {
    title: 'Penthouse Suite in Kazanchis Business Hub',
    titleAm: 'በካዛንችስ የቢዝነስ ማዕከል የሚገኝ ፔንትሃውስ',
    description:
      'Modern penthouse suite on the top floor of a Kazanchis business tower. Uninterrupted city views and access to a shared gym and rooftop terrace.',
    category: 'condo',
    city: 'Addis Ababa',
    neighborhood: 'Kazanchis',
    stayType: ENUM_VALUES.STAY_TYPE.HYBRID,
    nightlyRateEtb: 14200,
    monthlyRateEtb: 305000,
    minLeaseMonths: 3,
    securityDepositEtb: 152500,
    maxGuests: 4,
    beds: 2,
    baths: 2,
    amenities: ['wifi', 'generator', 'elevator', 'parking', 'security', 'airConditioning', 'smartTv'],
    utilitiesIncluded: ['electricity', 'water', 'wifi', 'security', 'condoFee'],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    ],
    isVerified: true,
  },
  {
    title: 'Quiet Studio Near Old Airport',
    titleAm: 'በኦልድ ኤርፖርት አጠገብ የሚገኝ ጸጥተኛ ስቱዲዮ',
    description:
      'Compact and quiet studio tucked off the main road in Old Airport. Perfect for solo travelers who want a calm base close to the diplomatic quarter.',
    category: 'studio',
    city: 'Addis Ababa',
    neighborhood: 'Old Airport',
    stayType: ENUM_VALUES.STAY_TYPE.SHORT_TERM,
    nightlyRateEtb: 4800,
    monthlyRateEtb: null,
    minLeaseMonths: 1,
    securityDepositEtb: 0,
    maxGuests: 2,
    beds: 1,
    baths: 1,
    amenities: ['wifi', 'generator', 'waterTank', 'security', 'kitchen'],
    utilitiesIncluded: ['electricity', 'water', 'wifi', 'security'],
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
    ],
    isVerified: true,
  },
];

async function findUserByEmail(email) {
  const { rows } = await rawPool.query('SELECT id, email, role FROM users WHERE email = $1', [email]);
  return rows[0] ?? null;
}

async function upsertUser(spec) {
  const existing = await findUserByEmail(spec.email);
  if (existing) {
    logger.info({ email: spec.email }, 'User already exists — skipping');
    return existing.id;
  }

  const passwordHash = await bcrypt.hash(spec.password, BCRYPT_ROUNDS);

  const { rows } = await rawPool.query(
    `INSERT INTO users (email, full_name, password_hash, role, is_verified, verification_level)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [spec.email, spec.fullName, passwordHash, spec.role, spec.isVerified, spec.verificationLevel]
  );

  logger.info({ email: spec.email, role: spec.role }, 'User created');
  return rows[0].id;
}

async function seedPaymentMethodsIfEmpty() {
  const { rows } = await rawPool.query('SELECT COUNT(*)::int AS count FROM payment_methods');
  if (rows[0].count > 0) {
    logger.info({ count: rows[0].count }, 'Payment methods already seeded — skipping');
    return;
  }

  await transaction(async (client) => {
    for (const method of PAYMENT_METHOD_SEEDS) {
      await client.query(
        `INSERT INTO payment_methods
           (key, label_en, label_am, type, account_number, owner_name, icon_name, display_order, is_enabled)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          method.key,
          method.labelEn,
          method.labelAm,
          method.type,
          method.accountNumber,
          method.ownerName,
          method.iconName,
          method.displayOrder,
          method.isEnabled,
        ]
      );
    }
  });

  logger.info({ count: PAYMENT_METHOD_SEEDS.length }, 'Payment methods seeded');
}

async function findPropertyBySlug(slug) {
  const { rows } = await rawPool.query('SELECT id FROM properties WHERE slug = $1', [slug]);
  return rows[0] ?? null;
}

async function upsertProperty(spec, hostId) {
  const slug = slugify(spec.title, { lower: true, strict: true, trim: true });
  const existing = await findPropertyBySlug(slug);
  if (existing) {
    logger.info({ slug }, 'Property already exists — skipping');
    return;
  }

  await rawPool.query(
    `INSERT INTO properties (
       host_id, slug, title, title_am, description, category,
       city, neighborhood, stay_type,
       nightly_rate_etb, monthly_rate_etb, min_lease_months, security_deposit_etb,
       max_guests, beds, baths,
       amenities, utilities_included, images,
       is_verified, is_active
     ) VALUES (
       $1, $2, $3, $4, $5, $6,
       $7, $8, $9,
       $10, $11, $12, $13,
       $14, $15, $16,
       $17, $18, $19,
       $20, TRUE
     )`,
    [
      hostId,
      slug,
      spec.title,
      spec.titleAm,
      spec.description,
      spec.category,
      spec.city,
      spec.neighborhood,
      spec.stayType,
      spec.nightlyRateEtb,
      spec.monthlyRateEtb,
      spec.minLeaseMonths,
      spec.securityDepositEtb,
      spec.maxGuests,
      spec.beds,
      spec.baths,
      JSON.stringify(spec.amenities),
      JSON.stringify(spec.utilitiesIncluded),
      JSON.stringify(spec.images.map((url, index) => ({ url, order: index }))),
      spec.isVerified,
    ]
  );

  logger.info({ slug }, 'Property created');
}

async function main() {
  try {
    const userIds = {};
    for (const user of DEMO_USERS) {
      userIds[user.role] = await upsertUser(user);
    }

    await seedPaymentMethodsIfEmpty();

    const hostId = userIds[ENUM_VALUES.USER_ROLE.HOST];
    if (!hostId) {
      throw new Error('Host user missing after seeding — cannot seed properties');
    }

    for (const property of DEMO_PROPERTIES) {
      await upsertProperty(property, hostId);
    }

    logger.info('Seed completed successfully');
  } catch (error) {
    logger.error({ err: error }, 'Seed failed');
    process.exitCode = 1;
  } finally {
    await shutdown();
  }
}

await main();