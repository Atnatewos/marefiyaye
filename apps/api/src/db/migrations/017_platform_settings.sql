-- ============================================================================
-- 017_platform_settings.sql
--
-- Creates the platform_settings table — a single-row key-value store for
-- runtime configuration managed by admins through /admin/settings.
--
-- Why a table, not env vars:
--   - Env vars require a deploy to change. Admins should be able to change
--     the exchange rate, support email, etc. live.
--   - Values are still validated by Zod before being written (see
--     adminSettingsSchemas.js). This table only enforces shape via JSONB.
--
-- Shape:
--   - key   : lowercase dot-path (e.g. 'exchangeRate')
--   - value : JSONB — supports strings, numbers, booleans, arrays, objects
--   - updated_by : admin user ID who last touched the row
-- ============================================================================

CREATE TABLE IF NOT EXISTS platform_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the initial settings so the admin UI has something to render.
-- ON CONFLICT ensures re-running the migration on an existing DB is safe.
INSERT INTO platform_settings (key, value) VALUES
  ('exchangeRate',  '125'::jsonb),
  ('supportEmail',  '"support@marefiyaye.com"'::jsonb),
  ('supportPhone',  '"+251920944941"'::jsonb)
ON CONFLICT (key) DO NOTHING;