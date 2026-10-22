-- ============================================================================
-- 011_wishlists.sql
--
-- Why this file exists:
--   - Guests save properties to consider later (heart icon on cards).
--   - Composite primary key (user_id, property_id) makes duplicate saves
--     impossible — no application-level dedup needed.
--
-- Depends on: 003_users.sql, 004_properties.sql.
-- ============================================================================

CREATE TABLE IF NOT EXISTS wishlists (
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id     UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, property_id)
);