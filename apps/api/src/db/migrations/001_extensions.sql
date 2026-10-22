-- ============================================================================
-- 001_extensions.sql
--
-- Why this file exists:
--   - pgcrypto provides `gen_random_uuid()` used as the primary key default
--     for every table.
--   - pg_trgm enables trigram indexes so `ILIKE '%term%'` searches on city and
--     title are fast even as the property table grows.
--
-- Idempotent: CREATE EXTENSION IF NOT EXISTS makes re-runs safe.
-- Depends on: nothing (runs first).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;