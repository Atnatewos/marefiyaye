-- ─────────────────────────────────────────────────────────────────────────────
-- MAREFIYAYE — Migration 011: Notifications
-- Path: apps/api/src/db/migrations/011_notifications.sql
--
-- In-app notification records per user. Titles and bodies are stored as
-- i18n keys + interpolation params so the same row can be rendered in the
-- user's preferred language. Rendered text is computed on read.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  title_key    TEXT NOT NULL,
  body_key     TEXT NOT NULL,
  body_params  JSONB NOT NULL DEFAULT '{}'::jsonb,
  link         TEXT,
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_idx     ON notifications (user_id);
CREATE INDEX IF NOT EXISTS notifications_unread_idx   ON notifications (user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS notifications_created_idx  ON notifications (created_at DESC);