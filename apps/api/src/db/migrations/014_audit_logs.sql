-- ============================================================================
-- 014_audit_logs.sql
--
-- Why this file exists:
--   - Every privileged action (payment verify/reject, user role change, property
--     verification, settings edit) must be traceable.
--   - `before` and `after` JSONB snapshots make the log self-contained — you can
--     reconstruct the state without joining back to source tables.
--   - Append-only by design: no UPDATE or DELETE is ever issued on this table.
--
-- Depends on: 003_users.sql (actor FK).
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id             BIGSERIAL PRIMARY KEY,
  actor_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  action         TEXT NOT NULL,
  entity_type    TEXT NOT NULL,
  entity_id      UUID,
  before         JSONB,
  after          JSONB,
  ip_address     INET,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);