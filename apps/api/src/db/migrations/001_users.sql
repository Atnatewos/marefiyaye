-- ─────────────────────────────────────────────────────────────────────────────
-- MAREFIYAYE — Migration 001: Users, Refresh Tokens, Impersonation Logs
-- Path: apps/api/src/db/migrations/001_users.sql
--
-- Creates the identity layer:
--   - users               : all actors (guest, host, admin, super_admin)
--   - refresh_tokens      : rotating JWT refresh tokens (hashed)
--   - impersonation_logs  : tracks when admins impersonate other users
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── users ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL,
  phone           TEXT,
  password_hash   TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'guest'
                    CHECK (role IN ('guest', 'host', 'admin', 'super_admin')),
  preferred_lang  TEXT NOT NULL DEFAULT 'en'
                    CHECK (preferred_lang IN ('en', 'am')),
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'suspended', 'deleted')),
  email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  phone_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Emails must be lowercase on insert (application enforces; constraint as safety net)
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique  ON users (LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique  ON users (phone) WHERE phone IS NOT NULL;
CREATE INDEX        IF NOT EXISTS users_role_idx      ON users (role);
CREATE INDEX        IF NOT EXISTS users_status_idx    ON users (status);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── refresh_tokens ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash      TEXT NOT NULL,
  user_agent      TEXT,
  ip_address      TEXT,
  expires_at      TIMESTAMPTZ NOT NULL,
  revoked         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS refresh_tokens_user_idx       ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS refresh_tokens_hash_idx       ON refresh_tokens (token_hash);
CREATE INDEX IF NOT EXISTS refresh_tokens_expires_idx    ON refresh_tokens (expires_at);

-- ── impersonation_logs ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS impersonation_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason          TEXT,
  ip_address      TEXT,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS impersonation_logs_admin_idx   ON impersonation_logs (admin_id);
CREATE INDEX IF NOT EXISTS impersonation_logs_target_idx  ON impersonation_logs (target_user_id);
CREATE INDEX IF NOT EXISTS impersonation_logs_started_idx ON impersonation_logs (started_at DESC);