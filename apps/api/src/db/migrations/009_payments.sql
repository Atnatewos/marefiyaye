-- ============================================================================
-- 009_payments.sql
--
-- Why this file exists:
--   - Every manual transfer is a payment record. The guest uploads a receipt
--     and enters an FT reference; an admin verifies or rejects.
--   - Payments attach to EITHER a booking OR a lease application. The CHECK
--     constraint enforces exactly one parent — a payment can never float free
--     or belong to both.
--   - `verified_by` + `verified_at` + `rejection_reason` form the audit trail
--     for the admin verification action.
--
-- Depends on: 002_enums.sql (payment_status), 005_bookings.sql,
--             007_lease_applications.sql, 003_users.sql.
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  booking_id            UUID REFERENCES bookings(id) ON DELETE CASCADE,
  lease_application_id  UUID REFERENCES lease_applications(id) ON DELETE CASCADE,

  method                TEXT NOT NULL,
  amount_etb            NUMERIC(12, 2) NOT NULL CHECK (amount_etb > 0),
  reference_code        TEXT,
  receipt_url           TEXT,

  status                payment_status NOT NULL DEFAULT 'PENDING',

  verified_by           UUID REFERENCES users(id),
  verified_at           TIMESTAMPTZ,
  rejection_reason      TEXT,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT payments_exactly_one_parent
    CHECK ((booking_id IS NOT NULL) <> (lease_application_id IS NOT NULL)),
  CONSTRAINT payments_method_not_empty
    CHECK (length(trim(method)) > 0)
);