-- ============================================================================
-- 003_users.sql
--
-- Why this file exists:
--   - Single table for all account types keeps auth logic simple.
--   - `role` discriminates GUEST / HOST / ADMIN.
--   - `verification_level` tracks KYC progression (0=none, 1=email, 2=ID, 3=full).
--   - `password_hash` is the only credential stored — passwords are never stored.
--
-- Depends on: 002_enums.sql (user_role).
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name           TEXT NOT NULL,
  email               TEXT NOT NULL UNIQUE,
  phone               TEXT,
  password_hash       TEXT NOT NULL,
  role                user_role NOT NULL DEFAULT 'GUEST',
  avatar_url          TEXT,
  is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
  verification_level  SMALLINT NOT NULL DEFAULT 0
                        CHECK (verification_level BETWEEN 0 AND 3),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_not_empty CHECK (length(trim(email)) > 0),
  CONSTRAINT users_full_name_not_empty CHECK (length(trim(full_name)) > 0)
);