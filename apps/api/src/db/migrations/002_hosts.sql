-- ─────────────────────────────────────────────────────────────────────────────
-- MAREFIYAYE — Migration 002: Hosts
-- Path: apps/api/src/db/migrations/002_hosts.sql
--
-- Creates `hosts` — a user becomes a host by creating a host profile row.
-- Profile is independent of the users row so verification status, bio, and
-- payout config are owned by the host domain.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hosts (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name            TEXT NOT NULL,
  bio                     TEXT,
  avatar_url              TEXT,
  payout_method           JSONB NOT NULL DEFAULT '{}'::jsonb,
  verification_status     TEXT NOT NULL DEFAULT 'pending'
                            CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
  verification_reason     TEXT,
  verified_at             TIMESTAMPTZ,
  verified_by             UUID REFERENCES users(id) ON DELETE SET NULL,
  status                  TEXT NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'suspended')),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS hosts_user_idx     ON hosts (user_id);
CREATE INDEX IF NOT EXISTS hosts_status_idx   ON hosts (status);
CREATE INDEX IF NOT EXISTS hosts_verify_idx   ON hosts (verification_status);

DROP TRIGGER IF EXISTS trg_hosts_updated_at ON hosts;
CREATE TRIGGER trg_hosts_updated_at
  BEFORE UPDATE ON hosts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();