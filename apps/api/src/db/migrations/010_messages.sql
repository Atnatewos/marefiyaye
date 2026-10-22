-- ============================================================================
-- 010_messages.sql
--
-- Why this file exists:
--   - Guests and hosts need a direct channel for pre-booking questions.
--   - Messages are flat rows keyed by property + two participants. Threads are
--     derived by grouping (property_id, sender_id, receiver_id).
--   - `is_read` supports unread badges in the dashboard.
--
-- Depends on: 003_users.sql, 004_properties.sql.
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body            TEXT NOT NULL CHECK (length(trim(body)) > 0),
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT messages_distinct_parties CHECK (sender_id <> receiver_id)
);