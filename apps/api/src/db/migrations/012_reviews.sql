-- ============================================================================
-- 012_reviews.sql
--
-- Why this file exists:
--   - Only guests who actually stayed can review; the review is tied to the
--     booking that produced the stay.
--   - UNIQUE on booking_id enforces one review per stay.
--   - `rating` is 1–5; aggregation into `properties.rating_avg` is done by the
--     review service after insert so the property row reflects current scores.
--
-- Depends on: 003_users.sql, 004_properties.sql, 005_bookings.sql.
-- ============================================================================

CREATE TABLE IF NOT EXISTS reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  property_id     UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);