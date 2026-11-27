-- ─────────────────────────────────────────────────────────────────────────────
-- MAREFIYAYE — Migration 016: Enforce check_out NOT NULL
-- Path: apps/api/src/db/migrations/016_booking_checkout_not_null.sql
--
-- Purpose:
--   The exclusion constraint from migration 015 requires a non-NULL check_out.
--   Long-term bookings were previously allowed NULL check_out. We backfill
--   any existing NULLs (treating them as check_in + months*30 days) and then
--   enforce NOT NULL going forward.
-- ─────────────────────────────────────────────────────────────────────────────

-- Backfill NULL check_out for existing long-term bookings
UPDATE bookings
   SET check_out = check_in + (COALESCE(months, 1) * INTERVAL '30 days')::DATE
 WHERE check_out IS NULL;

ALTER TABLE bookings
  ALTER COLUMN check_out SET NOT NULL;