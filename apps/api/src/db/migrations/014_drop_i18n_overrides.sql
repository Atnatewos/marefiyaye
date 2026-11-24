-- ─────────────────────────────────────────────────────────────────────────────
-- MAREFIYAYE — Migration 014: Remove i18n_overrides
-- Path: apps/api/src/db/migrations/014_drop_i18n_overrides.sql
--
-- Rationale:
--   Translation strings live exclusively in code at
--   packages/shared/src/i18n/locales/*/*.js — edited by developers, shipped
--   via PR. The "God Panel" governs business rules, content, and runtime data
--   — not translation text. This migration retires the unused override table.
-- ─────────────────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS i18n_overrides;