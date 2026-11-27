-- ─────────────────────────────────────────────────────────────────────────────
-- MAREFIYAYE — Migration 015: Booking Date Exclusion
-- Path: apps/api/src/db/migrations/015_booking_exclusion.sql
--
-- Purpose:
--   Prevents double-booking at the database level via a PostgreSQL exclusion
--   constraint. Two bookings for the same listing with overlapping dates
--   cannot coexist when both are in a "live" state.
--
--   Live states: pending_payment, payment_review, confirmed.
--   Cancelled/refunded/completed bookings are excluded from the check —
--   their dates are released back into the pool.
--
--   The constraint uses daterange with the `[]` (inclusive) bounds so
--   check-out day of one booking is free for the check-in of the next.
--
-- Requires:
--   btree_gist extension — allows combining scalar equality (listing_id)
--   with range overlap (daterange) in a single exclusion constraint.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (
    listing_id WITH =,
    daterange(check_in, check_out, '[]') WITH &&
  )
  WHERE (status IN ('pending_payment', 'payment_review', 'confirmed'));

-- ── Supporting index for the constraint's WHERE clause ───────────────────────

CREATE INDEX IF NOT EXISTS bookings_live_overlap_idx
  ON bookings USING gist (
    listing_id,
    daterange(check_in, check_out, '[]')
  )
  WHERE (status IN ('pending_payment', 'payment_review', 'confirmed'));