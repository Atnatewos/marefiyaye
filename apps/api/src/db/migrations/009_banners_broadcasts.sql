-- ─────────────────────────────────────────────────────────────────────────────
-- MAREFIYAYE — Migration 009: Banners & Broadcast Messages
-- Path: apps/api/src/db/migrations/009_banners_broadcasts.sql
--
-- Creates:
--   - banners             : promotional bars (top_bar, home_hero, listing_top)
--   - broadcast_messages  : sticky announcement notes (info/success/warning/danger)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS banners (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placement       TEXT NOT NULL CHECK (placement IN ('top_bar', 'home_hero', 'listing_top')),
  message_en      TEXT NOT NULL,
  message_am      TEXT NOT NULL,
  link_url        TEXT,
  link_label_en   TEXT,
  link_label_am   TEXT,
  bg_color        TEXT NOT NULL DEFAULT '#111111',
  fg_color        TEXT NOT NULL DEFAULT '#ffffff',
  starts_at       TIMESTAMPTZ,
  ends_at         TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  dismissible     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS banners_placement_idx ON banners (placement);
CREATE INDEX IF NOT EXISTS banners_active_idx    ON banners (is_active, starts_at, ends_at);

DROP TRIGGER IF EXISTS trg_banners_updated_at ON banners;
CREATE TRIGGER trg_banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── broadcast_messages ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS broadcast_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en     TEXT NOT NULL,
  title_am     TEXT NOT NULL,
  body_en      TEXT NOT NULL,
  body_am      TEXT NOT NULL,
  audience     TEXT NOT NULL DEFAULT 'all'
                 CHECK (audience IN ('all', 'guests', 'hosts', 'admins')),
  severity     TEXT NOT NULL DEFAULT 'info'
                 CHECK (severity IN ('info', 'success', 'warning', 'danger')),
  starts_at    TIMESTAMPTZ,
  ends_at      TIMESTAMPTZ,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS broadcasts_active_idx ON broadcast_messages (is_active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS broadcasts_audience_idx ON broadcast_messages (audience);

DROP TRIGGER IF EXISTS trg_broadcasts_updated_at ON broadcast_messages;
CREATE TRIGGER trg_broadcasts_updated_at
  BEFORE UPDATE ON broadcast_messages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();