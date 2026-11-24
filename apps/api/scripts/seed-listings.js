/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Seed Test Listings
 * Path: apps/api/scripts/seed-listings.js
 *
 * Purpose:
 *   Idempotent seed script that populates 3 realistic test listings under
 *   an existing verified host. Safe to run multiple times — uses
 *   `ON CONFLICT DO NOTHING` on a unique title_en per host.
 *
 *   Run: `node apps/api/scripts/seed-listings.js`
 *
 *   This is a DEV utility. It is not part of the production seed flow.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* ── Env loading (matches the API's own .env.local) ──────────────────────── */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/* ── Listing data ────────────────────────────────────────────────────────── */

const LISTINGS = [
  {
    title_en: 'Bole Atlas Luxury Apartment',
    title_am: 'የቅንጦት ቦሌ አትላስ አፓርታማ',
    description_en:
      'Modern 2-bedroom luxury residence in the vibrant heart of Bole Atlas. ' +
      'Features high-speed fiber internet, generator backup, 24/7 security, ' +
      'and breathtaking skyline views. Walk to restaurants, cafes, and shops.',
    description_am:
      'ዘመናዊ ሁለት መኝታ ቤት ያለው የቅንጦት መኖሪያ በቦሌ አትላስ። ፈጣን የፋይበር ኢንተርኔት፣ ' +
      'የጀነሬተር ድጋፍ፣ 24/7 የጥበቃ አገልግሎት ያካትታል።',
    city: 'Bole',
    subcity: 'Bole',
    address: 'Bole Atlas, near Edna Mall',
    property_type: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    max_guests: 4,
    amenities: ['wifi', 'generator', 'parking', 'security', 'tv', 'kitchen', 'elevator'],
    is_furnished: true,
    short_rate: 4500,
    long_rate: 85000,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed/bole-lounge',
        alt: 'Bole Atlas living room',
        order: 0,
      },
      {
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed/bole-bedroom',
        alt: 'Master bedroom',
        order: 1,
      },
      {
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed/bole-kitchen',
        alt: 'Kitchen',
        order: 2,
      },
      {
        url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed/bole-exterior',
        alt: 'Building exterior',
        order: 3,
      },
      {
        url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed/bole-bathroom',
        alt: 'Bathroom',
        order: 4,
      },
    ],
  },
  {
    title_en: 'Modern Studio Loft Kazanchis',
    title_am: 'ዘመናዊ ስቱዲዮ ካዛንችስ',
    description_en:
      'Cozy and contemporary studio loft near UN-ECA and major business centers. ' +
      'Perfect for business travelers or long-term urban dwellers. ' +
      'Fully furnished with modern appliances and a dedicated workspace.',
    description_am:
      'በUN-ECA እና በዋና የንግድ ማዕከላት አቅራቢያ የሚገኝ ምቹ ስቱዲዮ ሎፍት። ' +
      'ለንግድ ተጓዦች ወይም ለረጅም ጊዜ ነዋሪዎች ተስማሚ።',
    city: 'Kazanchis',
    subcity: 'Kirkos',
    address: 'Kazanchis, near ECA',
    property_type: 'Studio',
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    amenities: ['wifi', 'generator', 'kitchen', 'tv', 'elevator'],
    is_furnished: true,
    short_rate: 2800,
    long_rate: 48000,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed/kazanchis-loft',
        alt: 'Studio loft',
        order: 0,
      },
      {
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed/kazanchis-interior',
        alt: 'Interior',
        order: 1,
      },
      {
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed/kazanchis-bed',
        alt: 'Bedroom area',
        order: 2,
      },
    ],
  },
  {
    title_en: 'Lakeside Resort Villa Hawassa',
    title_am: 'የሐዋሳ ሐይቅ ዳር ቪላ',
    description_en:
      'Serene lakeside villa in Hawassa with expansive gardens, private terrace, ' +
      'and quiet atmosphere. Ideal for family holidays or executive retreats. ' +
      'Direct lake access, boat rentals available on request.',
    description_am:
      'በሐዋሳ ሐይቅ ዳር የሚገኝ ሰላማዊ ቪላ ከሰፊ የአትክልት ስፍራ፣ ከግል በረንዳ ' +
      'እና ከጸጥተኛ ድባብ ጋር። ለቤተሰብ ዕረፍት ወይም ለአስፈጻሚ ጉዞዎች ተስማሚ።',
    city: 'Hawassa',
    subcity: null,
    address: 'Hawassa Lake Shore',
    property_type: 'Villa',
    bedrooms: 4,
    bathrooms: 3,
    max_guests: 8,
    amenities: ['wifi', 'generator', 'parking', 'security', 'tv', 'kitchen', 'balcony', 'pool'],
    is_furnished: true,
    short_rate: 8000,
    long_rate: 150000,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed/hawassa-villa',
        alt: 'Lakeside villa',
        order: 0,
      },
      {
        url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed/hawassa-terrace',
        alt: 'Private terrace',
        order: 1,
      },
      {
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed/hawassa-lounge',
        alt: 'Lounge',
        order: 2,
      },
      {
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed/hawassa-bedroom',
        alt: 'Bedroom',
        order: 3,
      },
      {
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed/hawassa-exterior',
        alt: 'Exterior',
        order: 4,
      },
    ],
  },
];

/* ── Main ────────────────────────────────────────────────────────────────── */

async function run() {
  console.log('[seed-listings] starting');

  /* 1. Find an existing verified host. If none, create a host for guest1. */
  const existingHost = await pool.query(
    `SELECT h.id, h.display_name FROM hosts h
     WHERE h.verification_status = 'verified' AND h.status = 'active'
     ORDER BY h.created_at ASC LIMIT 1`
  );

  let hostId;
  if (existingHost.rows.length > 0) {
    hostId = existingHost.rows[0].id;
    console.log(`[seed-listings] using existing host ${existingHost.rows[0].display_name}`);
  } else {
    /* Fallback: create a host under the guest1 user */
    const guest = await pool.query(
      `SELECT id FROM users WHERE LOWER(email) = 'guest1@marefiyaye.com' LIMIT 1`
    );
    if (guest.rows.length === 0) {
      console.error(
        '[seed-listings] no verified host and no guest1 user found. ' +
          'Run `npm run seed` first to bootstrap admin + guest1.'
      );
      process.exit(1);
    }

    const userId = guest.rows[0].id;
    const insert = await pool.query(
      `INSERT INTO hosts (user_id, display_name, verification_status, verified_at, status)
       VALUES ($1, 'Demo Host', 'verified', NOW(), 'active')
       ON CONFLICT (user_id) DO UPDATE SET verification_status = 'verified', verified_at = NOW()
       RETURNING id, display_name`,
      [userId]
    );
    hostId = insert.rows[0].id;
    console.log(`[seed-listings] created verified host for guest1 (${hostId})`);
  }

  /* 2. Insert listings — idempotent via ON CONFLICT DO NOTHING on (host_id, title_en) */
  let inserted = 0;
  let skipped = 0;

  for (const l of LISTINGS) {
    try {
      const result = await pool.query(
        `INSERT INTO listings (
           host_id,
           title_en, title_am, description_en, description_am,
           city, subcity, address, property_type,
           bedrooms, bathrooms, max_guests, amenities, is_furnished,
           short_rate, long_rate, currency, status, is_verified, images
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9,
           $10, $11, $12, $13::jsonb, $14,
           $15, $16, 'ETB', 'approved', TRUE, $17::jsonb
         )
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [
          hostId,
          l.title_en,
          l.title_am,
          l.description_en,
          l.description_am,
          l.city,
          l.subcity,
          l.address,
          l.property_type,
          l.bedrooms,
          l.bathrooms,
          l.max_guests,
          JSON.stringify(l.amenities),
          l.is_furnished,
          l.short_rate,
          l.long_rate,
          JSON.stringify(l.images),
        ]
      );
      if (result.rowCount > 0) {
        inserted += 1;
        console.log(`[seed-listings] ✓ inserted "${l.title_en}" (${result.rows[0].id})`);
      } else {
        skipped += 1;
        console.log(`[seed-listings] ⏭  "${l.title_en}" already exists`);
      }
    } catch (err) {
      console.error(`[seed-listings] failed "${l.title_en}":`, err.message);
    }
  }

  console.log(`[seed-listings] complete — inserted: ${inserted}, skipped: ${skipped}`);
}

run()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('[seed-listings] aborted:', err);
    await pool.end();
    process.exit(1);
  });