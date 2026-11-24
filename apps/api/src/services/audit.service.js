/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Audit Service
 * Path: apps/api/src/services/audit.service.js
 *
 * Purpose:
 *   Thin wrapper around the audit log model. Exists so other services can
 *   call `auditService.record(...)` without importing the model directly.
 *   Fails silently (logs the failure) so audit logging never breaks the
 *   caller's main operation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import auditLogModel from '../models/auditLog.model.js';
import { logger } from '../utils/logger.js';

/**
 * Records an audit log entry. Swallows errors — audit failure must never
 * block the primary action.
 *
 * @param {object} entry
 * @param {string|null} entry.actorId
 * @param {string} entry.action
 * @param {string|null} [entry.resourceType]
 * @param {string|null} [entry.resourceId]
 * @param {object|null} [entry.before]
 * @param {object|null} [entry.after]
 * @param {string|null} [entry.ip]
 * @param {string|null} [entry.userAgent]
 */
export async function record({
  actorId,
  action,
  resourceType = null,
  resourceId = null,
  before = null,
  after = null,
  ip = null,
  userAgent = null,
}) {
  try {
    await auditLogModel.create({
      actor_id: actorId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      before_state: before,
      after_state: after,
      ip_address: ip,
      user_agent: userAgent,
    });
  } catch (err) {
    logger.warn('[audit] failed to record entry', { action, error: err });
  }
}

export default Object.freeze({ record });