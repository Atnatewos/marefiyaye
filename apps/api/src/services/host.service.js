/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Host Service
 * Path: apps/api/src/services/host.service.js
 *
 * Purpose:
 *   Business logic for host profile creation, admin verification, and
 *   admin host listing.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import hostModel from '../models/host.model.js';
import auditService from './audit.service.js';
import { AUDIT_RESOURCES } from '../config/constants.js';
import { AppError } from '../middleware/error.middleware.js';
import { logger } from '../utils/logger.js';

/* ── Reads ───────────────────────────────────────────────────────────────── */

/**
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
export async function getByUserId(userId) {
  return hostModel.findByUserId(userId);
}

/**
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getById(id) {
  const host = await hostModel.findById(id);
  if (!host) {
    throw new AppError({
      status: 404,
      code: 'host.not_found',
      message: 'errors.notFound',
    });
  }
  return host;
}

/**
 * @param {object} params
 * @returns {Promise<{ rows: object[], total: number }>}
 */
export async function listAdmin({ verification_status, status, limit, offset }) {
  return hostModel.list({ verification_status, status, limit, offset });
}

/* ── Writes ──────────────────────────────────────────────────────────────── */

/**
 * Registers a host profile for the current user. Idempotent — if the user
 * already has a host profile, the existing one is returned.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {object} params.data  — { display_name, bio?, avatar_url? }
 * @returns {Promise<object>}
 */
export async function registerHost({ userId, data }) {
  const existing = await hostModel.findByUserId(userId);
  if (existing) return existing;

  const created = await hostModel.create({
    user_id: userId,
    display_name: data.display_name,
    bio: data.bio,
    avatar_url: data.avatar_url,
  });

  logger.info('[host] registered', { hostId: created.id, userId });
  return created;
}

/**
 * @param {string} userId
 * @param {object} patch
 * @returns {Promise<object>}
 */
export async function updateOwnProfile({ userId, patch }) {
  const host = await hostModel.findByUserId(userId);
  if (!host) {
    throw new AppError({
      status: 404,
      code: 'host.not_found',
      message: 'errors.notFound',
    });
  }
  return hostModel.update(host.id, patch);
}

/**
 * @param {object} params
 * @param {string} params.hostId
 * @param {'verified'|'rejected'|'suspended'} params.status
 * @param {string|null} [params.reason]
 * @param {string} params.actorId
 * @param {string|null} [params.ip]
 * @param {string|null} [params.userAgent]
 * @returns {Promise<object>}
 */
export async function setVerification({ hostId, status, reason, actorId, ip = null, userAgent = null }) {
  const existing = await hostModel.findById(hostId);
  if (!existing) {
    throw new AppError({
      status: 404,
      code: 'host.not_found',
      message: 'errors.notFound',
    });
  }

  const updated = await hostModel.setVerification({
    id: hostId,
    status,
    reason,
    actorId,
  });

  await auditService.record({
    actorId,
    action: `host.${status}`,
    resourceType: AUDIT_RESOURCES.HOST,
    resourceId: hostId,
    before: { verification_status: existing.verification_status },
    after: { verification_status: status, reason },
    ip,
    userAgent,
  });

  logger.info('[host] verification updated', { hostId, status, actorId });
  return updated;
}

export default Object.freeze({
  getByUserId,
  getById,
  listAdmin,
  registerHost,
  updateOwnProfile,
  setVerification,
});