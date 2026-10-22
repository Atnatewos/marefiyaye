-- ============================================================================
-- 002_enums.sql
--
-- Why this file exists:
--   - Enum types are referenced by multiple tables; they must exist before any
--     table that uses them.
--   - PostgreSQL enum types have no `CREATE TYPE IF NOT EXISTS` — the DO block
--     catches duplicate_object so re-runs are safe.
--   - Values must match `ENUM_VALUES` in `@marefiyaye/config/database` exactly.
--
-- Depends on: 001_extensions.sql (extensions in place).
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('GUEST', 'HOST', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE stay_type AS ENUM ('SHORT_TERM', 'LONG_TERM', 'HYBRID');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM (
    'PENDING', 'AWAITING_VERIFICATION', 'CONFIRMED', 'COMPLETED', 'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'PENDING', 'AWAITING_VERIFICATION', 'VERIFIED', 'REJECTED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE lease_status AS ENUM (
    'APPLIED', 'APPROVED', 'ACTIVE', 'TERMINATED', 'REJECTED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE viewing_status AS ENUM (
    'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;