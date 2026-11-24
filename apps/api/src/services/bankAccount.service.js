/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Bank Account Service
 * Path: apps/api/src/services/bankAccount.service.js
 *
 * Purpose:
 *   Business logic for admin bank-account management. All mutations write
 *   an audit entry. Deletes are soft by default; hard delete only when the
 *   account was never referenced by a payment.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import bankAccountModel from '../models/bankAccount.model.js';
import auditService from './audit.service.js';
import { AUDIT_ACTIONS, AUDIT_RESOURCES } from '../config/constants.js';
import { AppError } from '../middleware/error.middleware.js';
import { logger } from '../utils/logger.js';

/* ── Reads ───────────────────────────────────────────────────────────────── */

/**
 * @returns {Promise<Array<object>>}
 */
export async function listPublic() {
  return bankAccountModel.findAllActive();
}

/**
 * @returns {Promise<Array<object>>}
 */
export async function listAdmin() {
  return bankAccountModel.findAll();
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
export async function createAccount({ data, actorId, ip = null, userAgent = null }) {
  const created = await bankAccountModel.create(data);

  await auditService.record({
    actorId,
    action: AUDIT_ACTIONS.BANK_ACCOUNT_CREATE,
    resourceType: AUDIT_RESOURCES.BANK_ACCOUNT,
    resourceId: created.id,
    after: created,
    ip,
    userAgent,
  });

  logger.info('[bank-account] created', { id: created.id, actorId });
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
export async function updateAccount({ id, patch, actorId, ip = null, userAgent = null }) {
  const existing = await bankAccountModel.findById(id);
  if (!existing) {
    throw new AppError({
      status: 404,
      code: 'bank_account.not_found',
      message: 'errors.notFound',
    });
  }

  const updated = await bankAccountModel.update(id, patch);

  await auditService.record({
    actorId,
    action: AUDIT_ACTIONS.BANK_ACCOUNT_UPDATE,
    resourceType: AUDIT_RESOURCES.BANK_ACCOUNT,
    resourceId: id,
    before: existing,
    after: updated,
    ip,
    userAgent,
  });

  logger.info('[bank-account] updated', { id, actorId });
  return updated;
}

/**
 * Deletes an account. Soft delete unless the account has zero payment
 * references, in which case a hard delete is safe.
 *
 * @param {object} params
 * @param {string} params.id
 * @param {string} params.actorId
 * @param {string|null} [params.ip]
 * @param {string|null} [params.userAgent]
 * @returns {Promise<{ deleted: boolean, soft: boolean }>}
 */
export async function deleteAccount({ id, actorId, ip = null, userAgent = null }) {
  const existing = await bankAccountModel.findById(id);
  if (!existing) {
    throw new AppError({
      status: 404,
      code: 'bank_account.not_found',
      message: 'errors.notFound',
    });
  }

  const referenced = await bankAccountModel.isReferencedByPayments(id);

  if (referenced) {
    const deactivated = await bankAccountModel.deactivate(id);
    await auditService.record({
      actorId,
      action: AUDIT_ACTIONS.BANK_ACCOUNT_DELETE,
      resourceType: AUDIT_RESOURCES.BANK_ACCOUNT,
      resourceId: id,
      before: existing,
      after: deactivated,
      ip,
      userAgent,
    });
    logger.info('[bank-account] deactivated (referenced)', { id, actorId });
    return { deleted: true, soft: true };
  }

  await bankAccountModel.hardDelete(id);
  await auditService.record({
    actorId,
    action: AUDIT_ACTIONS.BANK_ACCOUNT_DELETE,
    resourceType: AUDIT_RESOURCES.BANK_ACCOUNT,
    resourceId: id,
    before: existing,
    after: null,
    ip,
    userAgent,
  });
  logger.info('[bank-account] hard-deleted', { id, actorId });
  return { deleted: true, soft: false };
}

export default Object.freeze({
  listPublic,
  listAdmin,
  createAccount,
  updateAccount,
  deleteAccount,
});