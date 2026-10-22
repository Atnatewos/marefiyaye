-- ============================================================================
-- 005_bookings.sql
--
-- Why this file exists:
--   - Short-term stays create bookings; long-term stays create lease applications.
--   - Rate snapshots (`nightly_rate_snapshot`, `base_amount`, `service_fee`,
--     `total_etb`) freeze the price at booking time. A host changing rates later
--     must never alter historical totals.
--   - `status` follows `booking_status` enum; transitions are enforced in the
--     booking service (server-side only).
--
-- Depends on: 002_enums.sql (booking_status), 003_users.sql, 004_properties.sql.
-- ============================================================================

CREATE TABLE IF NOT EXISTS bookings (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id              UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  guest_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  check_in                 DATE NOT NULL,
  check_out                DATE NOT NULL,
  guests                   SMALLINT NOT NULL CHECK (guests BETWEEN 1 AND 20),
  nights                   INTEGER NOT NULL CHECK (nights >= 1),

  nightly_rate_snapshot    NUMERIC(12, 2) NOT NULL CHECK (nightly_rate_snapshot >= 0),
  base_amount              NUMERIC(12, 2) NOT NULL CHECK (base_amount >= 0),
  service_fee              NUMERIC(12, 2) NOT NULL CHECK (service_fee >= 0),
  total_etb                NUMERIC(12, 2) NOT NULL CHECK (total_etb >= 0),

  status                   booking_status NOT NULL DEFAULT 'PENDING',

  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT bookings_checkout_after_checkin CHECK (check_out > check_in)
);