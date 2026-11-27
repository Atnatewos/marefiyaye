-- ─────────────────────────────────────────────────────────────────────────────
-- MAREFIYAYE — Migration 016: Enforce check_out NOT NULL
-- Path: apps/api/src/db/migrations/016_booking_checkout_not_null.sql
--
-- Purpose:
--   The exclusion constraint from migration 015 requires a non-NULL
--   check_out. Long-term bookings were previously allowed NULL check_out.
--   We backfill any existing NULLs (treating them as check_in + months*30
--   days) and then enforce NOT NULL going forward.
--
-- Notes:
--   The backfill must be guarded by a NULL check — on a fresh database
--   there are no rows to update, and the UPDATE is a no-op. On a database
--   with existing long-term bookings, the backfill converts them to a
--   concrete check_out so the exclusion constraint remains valid.
-- ─────────────────────────────────────────────────────────────────────────────

-- Backfill NULL check_out for existing long-term bookings.
-- Cast is applied to the whole expression (date + interval), not the
-- interval alone — `check_in + interval` returns timestamp, cast to date.
UPDATE bookings
   SET check_out = (
     check_in + (COALESCE(months, 1) * INTERVAL '30 days')
   )::DATE
 WHERE check_out IS NULL;

-- Enforce the invariant at the schema level
ALTER TABLE bookings
  ALTER COLUMN check_out SET NOT NULL;