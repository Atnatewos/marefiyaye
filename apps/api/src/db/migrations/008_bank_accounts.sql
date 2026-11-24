-- ─────────────────────────────────────────────────────────────────────────────
-- MAREFIYAYE — Migration 008: Bank Accounts
-- Path: apps/api/src/db/migrations/008_bank_accounts.sql
--
-- The bank accounts shown to guests during manual payment.
-- Fully managed from the admin panel (create, edit, reorder, deactivate).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bank_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  provider        TEXT NOT NULL,
  account_name    TEXT NOT NULL,
  account_number  TEXT NOT NULL,
  instructions    TEXT,
  logo_url        TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  display_order   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bank_accounts_active_idx  ON bank_accounts (is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS bank_accounts_order_idx   ON bank_accounts (display_order);

DROP TRIGGER IF EXISTS trg_bank_accounts_updated_at ON bank_accounts;
CREATE TRIGGER trg_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();