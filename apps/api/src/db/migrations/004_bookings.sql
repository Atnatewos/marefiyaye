-- ─────────────────────────────────────────────────────────────────────────────
-- MAREFIYAYE — Migration 004: Bookings + Booking Events
-- Path: apps/api/src/db/migrations/004_bookings.sql
--
-- Creates:
--   - bookings        : guest reservations with frozen pricing snapshot
--   - booking_events  : append-only state transition log
--
-- Commission rate is FROZEN on the booking row (commission_rate + commission_amount)
-- so historical accuracy survives later rate changes.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bookings (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                     TEXT NOT NULL UNIQUE,
  listing_id               UUID NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  guest_id                 UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  rent_mode                TEXT NOT NULL CHECK (rent_mode IN ('short', 'long')),
  check_in                 DATE NOT NULL,
  check_out                DATE,
  months                   INTEGER CHECK (months IS NULL OR months >= 1),
  guests                   JSONB NOT NULL DEFAULT '{"adults":1,"children":0,"infants":0}'::jsonb,

  nightly_or_monthly_rate  NUMERIC(14, 2) NOT NULL CHECK (nightly_or_monthly_rate >= 0),
  subtotal                 NUMERIC(14, 2) NOT NULL CHECK (subtotal >= 0),
  cleaning_fee             NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (cleaning_fee >= 0),
  service_fee              NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (service_fee >= 0),
  total                    NUMERIC(14, 2) NOT NULL CHECK (total >= 0),
  currency                 TEXT NOT NULL DEFAULT 'ETB' CHECK (currency IN ('ETB')),

  commission_rate          NUMERIC(5, 2) NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 50),
  commission_amount        NUMERIC(14, 2) NOT NULL CHECK (commission_amount >= 0),

  status                   TEXT NOT NULL DEFAULT 'pending_payment'
                             CHECK (status IN ('pending_payment', 'payment_review', 'confirmed', 'cancelled', 'completed', 'refunded')),
  cancellation_reason      TEXT,

  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bookings_listing_idx    ON bookings (listing_id);
CREATE INDEX IF NOT EXISTS bookings_guest_idx      ON bookings (guest_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx     ON bookings (status);
CREATE INDEX IF NOT EXISTS bookings_code_idx       ON bookings (code);
CREATE INDEX IF NOT EXISTS bookings_checkin_idx    ON bookings (check_in);
CREATE INDEX IF NOT EXISTS bookings_created_idx    ON bookings (created_at DESC);

DROP TRIGGER IF EXISTS trg_bookings_updated_at ON bookings;
CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── booking_events ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS booking_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id   UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  actor_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type   TEXT NOT NULL,
  payload      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS booking_events_booking_idx ON booking_events (booking_id);
CREATE INDEX IF NOT EXISTS booking_events_type_idx    ON booking_events (event_type);
CREATE INDEX IF NOT EXISTS booking_events_created_idx ON booking_events (created_at DESC);