-- ============================================================================
-- 006_viewings.sql
--
-- Why this file exists:
--   - Long-term rentals need a physical viewing before lease application.
--   - Tenants propose a date and time slot; hosts confirm or cancel.
--   - `time_slot` is text (validated against VIEWING_TIME_SLOTS from config).
--   - `note` lets the tenant add context (e.g. "bringing a spouse").
--
-- Depends on: 002_enums.sql (viewing_status), 003_users.sql, 004_properties.sql.
-- ============================================================================

CREATE TABLE IF NOT EXISTS viewing_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id       UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  requester_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preferred_date    DATE NOT NULL,
  time_slot         TEXT NOT NULL,
  note              TEXT,
  status            viewing_status NOT NULL DEFAULT 'PENDING',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);