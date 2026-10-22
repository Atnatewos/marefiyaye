-- ============================================================================
-- 015_indexes.sql
--
-- Why this file exists:
--   - Consolidating all indexes keeps the schema reviewable in one place.
--   - Partial indexes (WHERE clause) are dramatically smaller and faster than
--     full-table indexes for the specific queries they serve.
--   - Trigram indexes make `ILIKE '%term%'` city/title search usable at scale.
--
-- Depends on: all tables (001-014).
-- ============================================================================

-- Property search
CREATE INDEX IF NOT EXISTS idx_properties_city_trgm
  ON properties USING gin (city gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_properties_title_trgm
  ON properties USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_properties_active_stay
  ON properties (stay_type, is_active)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_properties_host
  ON properties (host_id);

-- Booking overlap check: only active bookings matter for conflicts
CREATE INDEX IF NOT EXISTS idx_bookings_active_overlap
  ON bookings (property_id, check_in, check_out)
  WHERE status IN ('CONFIRMED', 'AWAITING_VERIFICATION');

CREATE INDEX IF NOT EXISTS idx_bookings_guest
  ON bookings (guest_id, created_at DESC);

-- Payment verification queue: admin queries this constantly
CREATE INDEX IF NOT EXISTS idx_payments_pending
  ON payments (status, created_at DESC)
  WHERE status = 'AWAITING_VERIFICATION';

CREATE INDEX IF NOT EXISTS idx_payments_booking
  ON payments (booking_id)
  WHERE booking_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_lease
  ON payments (lease_application_id)
  WHERE lease_application_id IS NOT NULL;

-- Viewing requests
CREATE INDEX IF NOT EXISTS idx_viewings_property_status
  ON viewing_requests (property_id, status, preferred_date);

CREATE INDEX IF NOT EXISTS idx_viewings_requester
  ON viewing_requests (requester_id, created_at DESC);

-- Lease applications
CREATE INDEX IF NOT EXISTS idx_lease_apps_tenant
  ON lease_applications (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lease_apps_property_status
  ON lease_applications (property_id, status);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_property
  ON messages (property_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_receiver_unread
  ON messages (receiver_id, is_read)
  WHERE is_read = FALSE;

-- Payment methods (checkout selector)
CREATE INDEX IF NOT EXISTS idx_payment_methods_enabled_order
  ON payment_methods (display_order)
  WHERE is_enabled = TRUE;

-- Audit log
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created
  ON audit_logs (actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
  ON audit_logs (entity_type, entity_id, created_at DESC);