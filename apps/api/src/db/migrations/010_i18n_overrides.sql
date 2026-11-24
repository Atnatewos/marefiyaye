-- ─────────────────────────────────────────────────────────────────────────────
-- MAREFIYAYE — Migration 010: i18n Overrides
-- Path: apps/api/src/db/migrations/010_i18n_overrides.sql
--
-- Admin-editable translation overrides. At runtime, the API merges these
-- over the bundled defaults from `packages/shared/src/i18n`. Overrides
-- always win — bundled files are never modified by the platform.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS i18n_overrides (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lang         TEXT NOT NULL CHECK (lang IN ('en', 'am')),
  namespace    TEXT NOT NULL,
  key          TEXT NOT NULL,
  value        TEXT NOT NULL,
  updated_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (lang, namespace, key)
);

CREATE INDEX IF NOT EXISTS i18n_overrides_lang_idx ON i18n_overrides (lang);
CREATE INDEX IF NOT EXISTS i18n_overrides_ns_idx   ON i18n_overrides (namespace);

DROP TRIGGER IF EXISTS trg_i18n_overrides_updated_at ON i18n_overrides;
CREATE TRIGGER trg_i18n_overrides_updated_at
  BEFORE UPDATE ON i18n_overrides
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();