/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Broadcast Service
 * Path: apps/api/src/services/broadcast.service.js
 *
 * Purpose:
 *   Business logic for broadcast CRUD + public retrieval by audience.
 *   Every mutation writes an audit entry.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import broadcastModel from '../models/broadcast.model.js';
import auditService from './audit.service.js';
import { AUDIT_ACTIONS, AUDIT_RESOURCES } from '../config/constants.js';
import { AppError } from '../middleware/error.middleware.js';
import { logger } from '../utils/logger.js';
import { BROADCAST_AUDIENCE_VALUES } from '@marefiyaye/shared/constants';

/* ── Reads ───────────────────────────────────────────────────────────────── */

/**
 * @param {string} audience — 'guests' | 'hosts' | 'admins'
 * @returns {Promise<Array<object>>}
 */
export async function listPublicForAudience(audience) {
  if (!BROADCAST_AUDIENCE_VALUES.includes(audience) || audience === 'all') {
    throw new AppError({
      status: 400,
      code: 'broadcast.invalid_audience',
      message: 'validation.select.required',
      details: { audience, allowed: ['guests', 'hosts', 'admins'] },
    });
  }
  return broadcastModel.findActiveForAudience(audience);
}

/**
 * @returns {Promise<Array<object>>}
 */
export async function listAdmin() {
  return broadcastModel.findAll();
}

/* ── Writes ──────────────────────────────────────────────────────────────── */

/**
 * @param {object} params
 * @returns {Promise<object>}
 */
export async function createBroadcast({ data, actorId, ip = null, userAgent = null }) {
  const created = await broadcastModel.create(data);

  await auditService.record({
    actorId,
    action: AUDIT_ACTIONS.BROADCAST_CREATE,
    resourceType: AUDIT_RESOURCES.BROADCAST,
    resourceId: created.id,
    after: created,
    ip,
    userAgent,
  });

  logger.info('[broadcast] created', { id: created.id, actorId });
  return created;
}

/**
 * @param {object} params
 * @returns {Promise<object>}
 */
export async function updateBroadcast({ id, patch, actorId, ip = null, userAgent = null }) {
  const existing = await broadcastModel.findById(id);
  if (!existing) {
    throw new AppError({
      status: 404,
      code: 'broadcast.not_found',
      message: 'errors.notFound',
    });
  }

  const updated = await broadcastModel.update(id, patch);

  await auditService.record({
    actorId,
    action: AUDIT_ACTIONS.BROADCAST_UPDATE,
    resourceType: AUDIT_RESOURCES.BROADCAST,
    resourceId: id,
    before: existing,
    after: updated,
    ip,
    userAgent,
  });

  logger.info('[broadcast] updated', { id, actorId });
  return updated;
}

/**
 * @param {object} params
 * @returns {Promise<{ deleted: boolean }>}
 */
export async function deleteBroadcast({ id, actorId, ip = null, userAgent = null }) {
  const existing = await broadcastModel.findById(id);
  if (!existing) {
    throw new AppError({
      status: 404,
      code: 'broadcast.not_found',
      message: 'errors.notFound',
    });
  }

  await broadcastModel.remove(id);

  await auditService.record({
    actorId,
    action: AUDIT_ACTIONS.BROADCAST_DELETE,
    resourceType: AUDIT_RESOURCES.BROADCAST,
    resourceId: id,
    before: existing,
    after: null,
    ip,
    userAgent,
  });

  logger.info('[broadcast] deleted', { id, actorId });
  return { deleted: true };
}

export default Object.freeze({
  listPublicForAudience,
  listAdmin,
  createBroadcast,
  updateBroadcast,
  deleteBroadcast,
});