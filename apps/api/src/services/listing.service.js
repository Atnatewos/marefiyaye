/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Listing Service
 * Path: apps/api/src/services/listing.service.js
 *
 * Purpose:
 *   Business logic for public browse, host CRUD, admin moderation.
 *
 *   Approval flow:
 *     host submits → status = pending_approval → admin approves → approved
 *                       → OR admin rejects → rejected (with reason)
 *     admin can also suspend → suspended (with reason)
 *
 *   Every state change writes to listing_approval_history AND to audit_logs.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import listingModel from '../models/listing.model.js';
import hostModel from '../models/host.model.js';
import auditService from './audit.service.js';
import configService from './config.service.js';
import { AUDIT_ACTIONS, AUDIT_RESOURCES } from '../config/constants.js';
import { LISTING_STATUS, HOST_STATUS } from '@marefiyaye/shared/constants';
import { AppError } from '../middleware/error.middleware.js';
import { logger } from '../utils/logger.js';

/* ── Public ──────────────────────────────────────────────────────────────── */

/**
 * @param {object} filters
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<{ rows: object[], total: number }>}
 */
export async function browse(filters, limit, offset) {
  return listingModel.browse(filters, limit, offset);
}

/**
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getPublicById(id) {
  const listing = await listingModel.findPublicById(id);
  if (!listing) {
    throw new AppError({
      status: 404,
      code: 'listing.not_found',
      message: 'errors.listing.notFound',
    });
  }
  return listing;
}

/* ── Host ────────────────────────────────────────────────────────────────── */

/**
 * Lists the authenticated host's own listings.
 *
 * @param {string} userId
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<{ rows: object[], total: number }>}
 */
export async function listOwn(userId, limit, offset) {
  const host = await hostModel.findByUserId(userId);
  if (!host) {
    throw new AppError({
      status: 403,
      code: 'host.not_registered',
      message: 'errors.forbidden',
    });
  }
  return listingModel.listByHost(host.id, limit, offset);
}

/**
 * Creates a new listing under the caller's host profile.
 * Status set based on config: if approval is required → pending_approval.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {object} params.data
 * @returns {Promise<object>}
 */
export async function createListing({ userId, data }) {
  const host = await hostModel.findByUserId(userId);
  if (!host) {
    throw new AppError({
      status: 403,
      code: 'host.not_registered',
      message: 'errors.forbidden',
    });
  }
  if (host.verification_status !== HOST_STATUS.VERIFIED) {
    throw new AppError({
      status: 403,
      code: 'host.not_verified',
      message: 'errors.forbidden',
      details: { verification_status: host.verification_status },
    });
  }
  if (host.status !== 'active') {
    throw new AppError({
      status: 403,
      code: 'host.suspended',
      message: 'errors.forbidden',
    });
  }

  const requiresApproval = await configService.getValue(
    'features.new_listings_require_approval'
  );

  const status = requiresApproval
    ? LISTING_STATUS.PENDING_APPROVAL
    : LISTING_STATUS.APPROVED;

  const created = await listingModel.create({
    ...data,
    host_id: host.id,
    status,
  });

  logger.info('[listing] created', {
    listingId: created.id,
    hostId: host.id,
    status,
  });

  return created;
}

/**
 * Updates a listing owned by the caller's host profile.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.listingId
 * @param {object} params.patch
 * @returns {Promise<object>}
 */
export async function updateOwnListing({ userId, listingId, patch }) {
  const host = await hostModel.findByUserId(userId);
  if (!host) {
    throw new AppError({
      status: 403,
      code: 'host.not_registered',
      message: 'errors.forbidden',
    });
  }

  const existing = await listingModel.findById(listingId);
  if (!existing) {
    throw new AppError({
      status: 404,
      code: 'listing.not_found',
      message: 'errors.listing.notFound',
    });
  }

  if (existing.host_id !== host.id) {
    throw new AppError({
      status: 403,
      code: 'listing.not_owned',
      message: 'errors.forbidden',
    });
  }

  if (existing.status === LISTING_STATUS.SUSPENDED) {
    throw new AppError({
      status: 403,
      code: 'listing.suspended',
      message: 'errors.listing.suspended',
    });
  }

  const updated = await listingModel.update(listingId, patch);

  logger.info('[listing] updated', { listingId, hostId: host.id });
  return updated;
}

/* ── Admin ───────────────────────────────────────────────────────────────── */

/**
 * @param {object} params
 * @param {object} params.filters
 * @param {number} params.limit
 * @param {number} params.offset
 * @returns {Promise<{ rows: object[], total: number }>}
 */
export async function listAdmin({ filters, limit, offset }) {
  return listingModel.listAdmin(filters, limit, offset);
}

/**
 * Approves, rejects, or suspends a listing. Records approval history + audit.
 *
 * @param {object} params
 * @param {string} params.listingId
 * @param {'approve'|'reject'|'suspend'} params.action
 * @param {string|null} [params.reason]
 * @param {string} params.actorId
 * @param {string|null} [params.ip]
 * @param {string|null} [params.userAgent]
 * @returns {Promise<object>}
 */
export async function moderateListing({
  listingId,
  action,
  reason = null,
  actorId,
  ip = null,
  userAgent = null,
}) {
  const existing = await listingModel.findById(listingId);
  if (!existing) {
    throw new AppError({
      status: 404,
      code: 'listing.not_found',
      message: 'errors.listing.notFound',
    });
  }

  const statusMap = {
    approve: LISTING_STATUS.APPROVED,
    reject: LISTING_STATUS.REJECTED,
    suspend: LISTING_STATUS.SUSPENDED,
  };

  const targetStatus = statusMap[action];
  if (!targetStatus) {
    throw new AppError({
      status: 400,
      code: 'listing.invalid_action',
      message: 'errors.validation',
    });
  }

  if ((action === 'reject' || action === 'suspend') && (!reason || reason.trim().length < 3)) {
    throw new AppError({
      status: 400,
      code: 'listing.reason_required',
      message: 'validation.admin.reasonRequired',
    });
  }

  const updated = await listingModel.setStatus({
    id: listingId,
    status: targetStatus,
    reason: action === 'approve' ? null : reason,
  });

  await listingModel.recordApproval({
    listing_id: listingId,
    admin_id: actorId,
    action,
    reason: action === 'approve' ? null : reason,
  });

  await auditService.record({
    actorId,
    action:
      action === 'approve'
        ? AUDIT_ACTIONS.LISTING_APPROVE
        : action === 'reject'
          ? AUDIT_ACTIONS.LISTING_REJECT
          : AUDIT_ACTIONS.LISTING_SUSPEND,
    resourceType: AUDIT_RESOURCES.LISTING,
    resourceId: listingId,
    before: { status: existing.status },
    after: { status: targetStatus, reason },
    ip,
    userAgent,
  });

  logger.info('[listing] moderated', { listingId, action, actorId });
  return updated;
}

export default Object.freeze({
  browse,
  getPublicById,
  listOwn,
  createListing,
  updateOwnListing,
  listAdmin,
  moderateListing,
});