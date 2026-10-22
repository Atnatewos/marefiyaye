-- ============================================================================
-- 007_lease_applications.sql
--
-- Why this file exists:
--   - A lease APPLICATION is distinct from a lease DOCUMENT. Application is
--     what the tenant submits; the lease document (008_leases.sql) is generated
--     only after the host approves and payment is verified.
--   - Rate and deposit snapshots freeze pricing at apply time so host price
--     changes never affect submitted applications.
--   - `months` and dates determine the total contract value shown to the tenant.
--
-- Depends on: 002_enums.sql (lease_status), 003_users.sql, 004_properties.sql.
-- ============================================================================

CREATE TABLE IF NOT EXISTS lease_applications (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id             UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  lease_start             DATE NOT NULL,
  lease_end               DATE NOT NULL,
  months                  SMALLINT NOT NULL CHECK (months BETWEEN 1 AND 36),

  monthly_rate_snapshot   NUMERIC(12, 2) NOT NULL CHECK (monthly_rate_snapshot >= 0),
  deposit_snapshot        NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (deposit_snapshot >= 0),
  total_contract_etb      NUMERIC(12, 2) NOT NULL CHECK (total_contract_etb >= 0),

  status                  lease_status NOT NULL DEFAULT 'APPLIED',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT lease_applications_end_after_start CHECK (lease_end > lease_start)
);