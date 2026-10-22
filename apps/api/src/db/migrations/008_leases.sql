-- ============================================================================
-- 008_leases.sql
--
-- Why this file exists:
--   - The printed lease document must be immutable once generated.
--   - All fields the document shows are snapshotted so future edits to users or
--     properties do not alter a signed document.
--   - `pdf_url` points to the generated PDF (or null until generated).
--   - UNIQUE on lease_application_id enforces one document per application.
--
-- Depends on: 007_lease_applications.sql.
-- ============================================================================

CREATE TABLE IF NOT EXISTS leases (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_application_id   UUID NOT NULL UNIQUE
                           REFERENCES lease_applications(id) ON DELETE CASCADE,

  landlord_name          TEXT NOT NULL,
  tenant_name            TEXT NOT NULL,
  property_address       TEXT NOT NULL,

  start_date             DATE NOT NULL,
  end_date               DATE NOT NULL,
  monthly_rent           NUMERIC(12, 2) NOT NULL CHECK (monthly_rent >= 0),
  deposit                NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (deposit >= 0),

  terms_json             JSONB NOT NULL DEFAULT '{}'::jsonb,
  pdf_url                TEXT,

  generated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);