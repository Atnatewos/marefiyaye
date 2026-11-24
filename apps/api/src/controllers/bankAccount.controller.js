/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Bank Account Controller
 * Path: apps/api/src/controllers/bankAccount.controller.js
 *
 * Purpose:
 *   HTTP glue for bank-account endpoints.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ok, created } from '../utils/response.js';
import bankAccountService from '../services/bankAccount.service.js';

/* ── Public ──────────────────────────────────────────────────────────────── */

/**
 * GET /api/v1/bank-accounts
 */
export async function listPublicHandler(_req, res) {
  const accounts = await bankAccountService.listPublic();
  return ok(res, { accounts });
}

/* ── Admin ───────────────────────────────────────────────────────────────── */

/**
 * GET /api/v1/admin/bank-accounts
 */
export async function listAdminHandler(_req, res) {
  const accounts = await bankAccountService.listAdmin();
  return ok(res, { accounts });
}

/**
 * POST /api/v1/admin/bank-accounts
 */
export async function createHandler(req, res) {
  const account = await bankAccountService.createAccount({
    data: req.body,
    actorId: req.user.id,
    ip: req.ip,
    userAgent: req.get('user-agent') || null,
  });
  return created(res, { account });
}

/**
 * PATCH /api/v1/admin/bank-accounts/:id
 */
export async function updateHandler(req, res) {
  const account = await bankAccountService.updateAccount({
    id: req.params.id,
    patch: req.body,
    actorId: req.user.id,
    ip: req.ip,
    userAgent: req.get('user-agent') || null,
  });
  return ok(res, { account });
}

/**
 * DELETE /api/v1/admin/bank-accounts/:id
 */
export async function deleteHandler(req, res) {
  const result = await bankAccountService.deleteAccount({
    id: req.params.id,
    actorId: req.user.id,
    ip: req.ip,
    userAgent: req.get('user-agent') || null,
  });
  return ok(res, result);
}

export default Object.freeze({
  listPublicHandler,
  listAdminHandler,
  createHandler,
  updateHandler,
  deleteHandler,
});