-- ─────────────────────────────────────────────────────────────────────────────
-- MAREFIYAYE — Migration 003: Listings + Approval History
-- Path: apps/api/src/db/migrations/003_listings.sql
--
-- Creates:
--   - listings                  : the property inventory
--   - listing_approval_history  : immutable moderation trail
--
-- Listings carry both short_rate (per night) and long_rate (per month) —
-- this is the core "hybrid" product concept.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS listings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id               UUID NOT NULL REFERENCES hosts(id) ON DELETE CASCADE,

  title_en              TEXT NOT NULL,
  title_am              TEXT,
  description_en        TEXT NOT NULL,
  description_am        TEXT,

  city                  TEXT NOT NULL,
  subcity               TEXT,
  area                  TEXT,
  address               TEXT,
  latitude              NUMERIC(10, 7),
  longitude             NUMERIC(10, 7),

  property_type         TEXT NOT NULL
                          CHECK (property_type IN ('Apartment', 'Villa', 'Guest House', 'Condo', 'Studio', 'Townhouse')),
  bedrooms              INTEGER NOT NULL CHECK (bedrooms >= 1 AND bedrooms <= 50),
  bathrooms             INTEGER NOT NULL CHECK (bathrooms >= 1 AND bathrooms <= 50),
  max_guests            INTEGER NOT NULL CHECK (max_guests >= 1 AND max_guests <= 100),
  amenities             JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_furnished          BOOLEAN NOT NULL DEFAULT FALSE,

  short_rate            NUMERIC(14, 2) NOT NULL CHECK (short_rate >= 0),
  long_rate             NUMERIC(14, 2) NOT NULL CHECK (long_rate >= 0),
  currency              TEXT NOT NULL DEFAULT 'ETB'
                          CHECK (currency IN ('ETB')),

  commission_override   NUMERIC(5, 2)
                          CHECK (commission_override IS NULL OR (commission_override >= 0 AND commission_override <= 50)),

  status                TEXT NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'suspended')),
  rejection_reason      TEXT,
  is_verified           BOOLEAN NOT NULL DEFAULT FALSE,

  images                JSONB NOT NULL DEFAULT '[]'::jsonb,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS listings_host_idx       ON listings (host_id);
CREATE INDEX IF NOT EXISTS listings_status_idx     ON listings (status);
CREATE INDEX IF NOT EXISTS listings_city_idx       ON listings (LOWER(city));
CREATE INDEX IF NOT EXISTS listings_type_idx       ON listings (property_type);
CREATE INDEX IF NOT EXISTS listings_short_rate_idx ON listings (short_rate);
CREATE INDEX IF NOT EXISTS listings_long_rate_idx  ON listings (long_rate);
CREATE INDEX IF NOT EXISTS listings_verified_idx   ON listings (is_verified) WHERE is_verified = TRUE;
CREATE INDEX IF NOT EXISTS listings_amenities_gin  ON listings USING GIN (amenities);

DROP TRIGGER IF EXISTS trg_listings_updated_at ON listings;
CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── listing_approval_history ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS listing_approval_history (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  admin_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action       TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'suspend', 'reactivate')),
  reason       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS listing_history_listing_idx ON listing_approval_history (listing_id);
CREATE INDEX IF NOT EXISTS listing_history_admin_idx   ON listing_approval_history (admin_id);