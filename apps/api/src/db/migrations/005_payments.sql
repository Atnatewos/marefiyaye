-- ─────────────────────────────────────────────────────────────────────────────
-- MAREFIYAYE — Migration 005: Payments
-- Path: apps/api/src/db/migrations/005_payments.sql
--
-- Manual bank-transfer payment records. Each booking can have multiple
-- payment attempts (rejected → retry). Only ONE can be `verified` at a time
-- for a given booking — enforced via partial unique index.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id         UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  amount             NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
  currency           TEXT NOT NULL DEFAULT 'ETB' CHECK (currency IN ('ETB')),

  method             TEXT NOT NULL CHECK (method IN ('bank_transfer', 'telebirr', 'cbe_birr', 'cash')),
  bank_account_id    UUID,
  reference          TEXT NOT NULL,
  receipt_url        TEXT NOT NULL,
  receipt_public_id  TEXT NOT NULL,

  status             TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'under_review', 'verified', 'rejected', 'refunded')),

  reviewed_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at        TIMESTAMPTZ,
  rejection_reason   TEXT,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS payments_booking_idx  ON payments (booking_id);
CREATE INDEX IF NOT EXISTS payments_user_idx     ON payments (user_id);
CREATE INDEX IF NOT EXISTS payments_status_idx   ON payments (status);
CREATE INDEX IF NOT EXISTS payments_created_idx  ON payments (created_at DESC);

-- Only one verified payment per booking
CREATE UNIQUE INDEX IF NOT EXISTS payments_one_verified_per_booking
  ON payments (booking_id)
  WHERE status = 'verified';

DROP TRIGGER IF EXISTS trg_payments_updated_at ON payments;
CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();