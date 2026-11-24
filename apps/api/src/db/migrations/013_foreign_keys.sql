-- ─────────────────────────────────────────────────────────────────────────────
-- MAREFIYAYE — Migration 013: Deferred Foreign Keys
-- Path: apps/api/src/db/migrations/013_foreign_keys.sql
--
-- Some tables reference bank_accounts which is created later in the
-- sequence. Their FK columns were added as plain UUIDs in earlier
-- migrations; this file wires up the actual foreign key constraints now
-- that the target tables exist.
-- ─────────────────────────────────────────────────────────────────────────────

-- payments.bank_account_id → bank_accounts.id
ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_bank_account_fk;
ALTER TABLE payments
  ADD CONSTRAINT payments_bank_account_fk
  FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL;