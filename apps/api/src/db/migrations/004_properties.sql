-- ============================================================================
-- 004_properties.sql
--
-- Why this file exists:
--   - Single table holds every listing with a `stay_type` discriminator.
--   - CHECK constraints enforce that rate fields match the stay type
--     (e.g. LONG_TERM must have a monthly rate; SHORT_TERM must have nightly).
--   - `amenities`, `utilities_included`, `images` are JSONB for fast iteration
--     without join tables.
--   - `blocked_dates` is a DATE[] for simple availability lookups.
--
-- Depends on: 002_enums.sql (stay_type), 003_users.sql (users).
-- ============================================================================

CREATE TABLE IF NOT EXISTS properties (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug                    TEXT NOT NULL UNIQUE,
  title                   TEXT NOT NULL,
  title_am                TEXT,
  description             TEXT,
  description_am          TEXT,
  category                TEXT NOT NULL,
  city                    TEXT NOT NULL,
  neighborhood            TEXT,
  address_line            TEXT,
  lat                     NUMERIC(9, 6),
  lng                     NUMERIC(9, 6),

  stay_type               stay_type NOT NULL,

  nightly_rate_etb        NUMERIC(12, 2),
  monthly_rate_etb        NUMERIC(12, 2),
  weekly_discount_pct     NUMERIC(5, 2) NOT NULL DEFAULT 10,
  monthly_discount_pct    NUMERIC(5, 2) NOT NULL DEFAULT 35,
  min_lease_months        SMALLINT NOT NULL DEFAULT 1
                            CHECK (min_lease_months BETWEEN 1 AND 36),
  security_deposit_etb    NUMERIC(12, 2) NOT NULL DEFAULT 0
                            CHECK (security_deposit_etb >= 0),

  max_guests              SMALLINT NOT NULL DEFAULT 2
                            CHECK (max_guests BETWEEN 1 AND 20),
  beds                    SMALLINT NOT NULL DEFAULT 1 CHECK (beds >= 0),
  baths                   NUMERIC(3, 1) NOT NULL DEFAULT 1 CHECK (baths >= 0),

  amenities               JSONB NOT NULL DEFAULT '[]'::jsonb,
  utilities_included      JSONB NOT NULL DEFAULT '[]'::jsonb,
  images                  JSONB NOT NULL DEFAULT '[]'::jsonb,
  blocked_dates           DATE[] NOT NULL DEFAULT '{}',

  house_rules             TEXT,
  house_rules_am          TEXT,

  is_verified             BOOLEAN NOT NULL DEFAULT FALSE,
  is_active               BOOLEAN NOT NULL DEFAULT TRUE,

  rating_avg              NUMERIC(3, 2) NOT NULL DEFAULT 0
                            CHECK (rating_avg BETWEEN 0 AND 5),
  review_count            INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT properties_short_has_nightly
    CHECK (stay_type = 'LONG_TERM' OR nightly_rate_etb IS NOT NULL),
  CONSTRAINT properties_long_has_monthly
    CHECK (stay_type = 'SHORT_TERM' OR monthly_rate_etb IS NOT NULL),
  CONSTRAINT properties_slug_not_empty
    CHECK (length(trim(slug)) > 0),
  CONSTRAINT properties_title_not_empty
    CHECK (length(trim(title)) > 0)
);