-- ─────────────────────────────────────────────────────────────────────────────
-- MAREFIYAYE — Migration 006: Favorites & Reviews
-- Path: apps/api/src/db/migrations/006_favorites_reviews.sql
--
-- Creates:
--   - favorites  : many-to-many user ↔ listing saved stays
--   - reviews    : one review per completed booking
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS favorites (
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id   UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS favorites_user_idx    ON favorites (user_id);
CREATE INDEX IF NOT EXISTS favorites_listing_idx ON favorites (listing_id);

-- ── reviews ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  listing_id    UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  guest_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  is_visible    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reviews_listing_idx ON reviews (listing_id);
CREATE INDEX IF NOT EXISTS reviews_guest_idx   ON reviews (guest_id);
CREATE INDEX IF NOT EXISTS reviews_visible_idx ON reviews (is_visible) WHERE is_visible = TRUE;