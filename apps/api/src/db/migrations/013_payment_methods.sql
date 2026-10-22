-- ============================================================================
-- 013_payment_methods.sql
--
-- Why this file exists:
--   - Payment options (banks, mobile money) are dynamic data managed by admins.
--   - A separate table lets admins add Dashen, Zemen, or any future provider
--     without touching code.
--   - `key` is a stable identifier used by historical payments. Immutable via API.
--   - `is_enabled` + `display_order` control the checkout selector without
--     deleting rows (which would break historical payment linkage).
--
-- Depends on: 001_extensions.sql (pgcrypto).
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_methods (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key              TEXT NOT NULL UNIQUE,
  label_en         TEXT NOT NULL,
  label_am         TEXT NOT NULL,
  type             TEXT NOT NULL CHECK (type IN ('bank', 'mobile')),
  account_number   TEXT NOT NULL,
  owner_name       TEXT NOT NULL,
  icon_name        TEXT NOT NULL,
  display_order    INTEGER NOT NULL DEFAULT 100,
  is_enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT payment_methods_label_en_not_empty CHECK (length(trim(label_en)) > 0),
  CONSTRAINT payment_methods_label_am_not_empty CHECK (length(trim(label_am)) > 0),
  CONSTRAINT payment_methods_account_not_empty CHECK (length(trim(account_number)) > 0),
  CONSTRAINT payment_methods_owner_not_empty CHECK (length(trim(owner_name)) > 0),
  CONSTRAINT payment_methods_icon_not_empty CHECK (length(trim(icon_name)) > 0)
);