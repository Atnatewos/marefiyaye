-- ─────────────────────────────────────────────────────────────────────────────
-- MAREFIYAYE — Migration 007: Settings (God Panel Storage)
-- Path: apps/api/src/db/migrations/007_settings.sql
--
-- The single table that stores every admin-configurable value.
-- Rows are seeded from `packages/shared/src/config` via `seed.js`.
-- Schema of the value column is defined by the shared SETTINGS_SCHEMA —
-- this table is intentionally permissive so new settings can be added
-- without migrations (they are added by editing the shared schema + reseeding).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS settings (
  key          TEXT PRIMARY KEY,
  value        JSONB NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('string', 'number', 'bool', 'json', 'array')),
  category     TEXT NOT NULL
                 CHECK (category IN ('general', 'commission', 'payment', 'features', 'theme', 'booking', 'seo')),
  label_en     TEXT NOT NULL,
  label_am     TEXT NOT NULL,
  description  TEXT,
  is_public    BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS settings_category_idx  ON settings (category);
CREATE INDEX IF NOT EXISTS settings_public_idx    ON settings (is_public) WHERE is_public = TRUE;

DROP TRIGGER IF EXISTS trg_settings_updated_at ON settings;
CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();