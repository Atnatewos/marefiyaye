/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Banner Service
 * Path: apps/api/src/services/banner.service.js
 *
 * Purpose:
 *   Business logic for banner CRUD + public retrieval by placement.
 *   Every mutation writes an audit entry.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import bannerModel from '../models/banner.model.js';
import auditService from './audit.service.js';
import { AUDIT_ACTIONS, AUDIT_RESOURCES } from '../config/constants.js';
import { AppError } from '../middleware/error.middleware.js';
import { logger } from '../utils/logger.js';
import { BANNER_PLACEMENT_VALUES } from '@marefiyaye/shared/constants';

/* ── Reads ───────────────────────────────────────────────────────────────── */

/**
 * @param {string} placement
 * @returns {Promise<Array<object>>}
 */
export async function listPublicByPlacement(placement) {
  if (!BANNER_PLACEMENT_VALUES.includes(placement)) {
    throw new AppError({
      status: 400,
      code: 'banner.invalid_placement',
      message: 'validation.select.required',
      details: { placement, allowed: BANNER_PLACEMENT_VALUES },
    });
  }
  return bannerModel.findActiveByPlacement(placement);
}

/**
 * @returns {Promise<Array<object>>}
 */
export async function listAdmin() {
  return bannerModel.findAll();
}

/* ── Writes ──────────────────────────────────────────────────────────────── */

/**
 * @param {object} params
 * @param {object} params.data
 * @param {string} params.actorId
 * @param {string|null} [params.ip]
 * @param {string|null} [params.userAgent]
 * @returns {Promise<object>}
 */
export async function createBanner({ data, actorId, ip = null, userAgent = null }) {
  const created = await bannerModel.create(data);

  await auditService.record({
    actorId,
    action: AUDIT_ACTIONS.BANNER_CREATE,
    resourceType: AUDIT_RESOURCES.BANNER,
    resourceId: created.id,
    after: created,
    ip,
    userAgent,
  });

  logger.info('[banner] created', { id: created.id, actorId });
  return created;
}

/**
 * @param {object} params
 * @param {string} params.id
 * @param {object} params.patch
 * @param {string} params.actorId
 * @param {string|null} [params.ip]
 * @param {string|null} [params.userAgent]
 * @returns {Promise<object>}
 */
export async function updateBanner({ id, patch, actorId, ip = null, userAgent = null }) {
  const existing = await bannerModel.findById(id);
  if (!existing) {
    throw new AppError({
      status: 404,
      code: 'banner.not_found',
      message: 'errors.notFound',
    });
  }

  const updated = await bannerModel.update(id, patch);

  await auditService.record({
    actorId,
    action: AUDIT_ACTIONS.BANNER_UPDATE,
    resourceType: AUDIT_RESOURCES.BANNER,
    resourceId: id,
    before: existing,
    after: updated,
    ip,
    userAgent,
  });

  logger.info('[banner] updated', { id, actorId });
  return updated;
}

/**
 * @param {object} params
 * @param {string} params.id
 * @param {string} params.actorId
 * @param {string|null} [params.ip]
 * @param {string|null} [params.userAgent]
 * @returns {Promise<{ deleted: boolean }>}
 */
export async function deleteBanner({ id, actorId, ip = null, userAgent = null }) {
  const existing = await bannerModel.findById(id);
  if (!existing) {
    throw new AppError({
      status: 404,
      code: 'banner.not_found',
      message: 'errors.notFound',
    });
  }

  await bannerModel.remove(id);

  await auditService.record({
    actorId,
    action: AUDIT_ACTIONS.BANNER_DELETE,
    resourceType: AUDIT_RESOURCES.BANNER,
    resourceId: id,
    before: existing,
    after: null,
    ip,
    userAgent,
  });

  logger.info('[banner] deleted', { id, actorId });
  return { deleted: true };
}

export default Object.freeze({
  listPublicByPlacement,
  listAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
});