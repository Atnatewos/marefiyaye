-- ─────────────────────────────────────────────────────────────────────────────
-- MAREFIYAYE — Migration 012: Audit Logs
-- Path: apps/api/src/db/migrations/012_audit_logs.sql
--
-- Immutable append-only log of every sensitive admin action. Never updated,
-- never deleted. Captures before/after snapshots so admin actions can be
-- audited and, if needed, reversed.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  action         TEXT NOT NULL,
  resource_type  TEXT,
  resource_id    UUID,
  before_state   JSONB,
  after_state    JSONB,
  ip_address     TEXT,
  user_agent     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_logs_actor_idx     ON audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx    ON audit_logs (action);
CREATE INDEX IF NOT EXISTS audit_logs_resource_idx  ON audit_logs (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_idx   ON audit_logs (created_at DESC);