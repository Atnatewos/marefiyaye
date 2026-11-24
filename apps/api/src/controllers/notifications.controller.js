/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Notifications Controller
 * Path: apps/api/src/controllers/notifications.controller.js
 *
 * Purpose:
 *   Serves notification lists with i18n rendering. Title/body are resolved
 *   through the shared i18n package using the user's preferred language.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ok, noContent } from '../utils/response.js';
import notificationService from '../services/notification.service.js';
import userModel from '../models/user.model.js';
import { getTranslator } from '@marefiyaye/shared/i18n';
import { PAGINATION_LIMITS } from '../config/constants.js';

/**
 * @param {import('express').Request} req
 * @returns {{ limit: number, offset: number, page: number }}
 */
function readPagination(req) {
  const page = Math.max(
    PAGINATION_LIMITS.MIN_PAGE,
    Number.parseInt(req.query.page, 10) || 1
  );
  const limit = Math.min(
    PAGINATION_LIMITS.MAX_LIMIT,
    Math.max(
      PAGINATION_LIMITS.MIN_LIMIT,
      Number.parseInt(req.query.limit, 10) || PAGINATION_LIMITS.DEFAULT_LIMIT
    )
  );
  return { limit, offset: (page - 1) * limit, page };
}

/**
 * GET /api/v1/me/notifications
 */
export async function listHandler(req, res) {
  const { limit, offset, page } = readPagination(req);
  const unreadOnly = req.query.unread === 'true';

  const user = await userModel.findById(req.user.id);
  const t = getTranslator(user?.preferred_lang || 'en');

  const { rows, total, unread } = await notificationService.listForUser({
    userId: req.user.id,
    unreadOnly,
    limit,
    offset,
  });

  const rendered = rows.map((n) => ({
    id: n.id,
    type: n.type,
    title: t(n.title_key),
    body: t(n.body_key, n.body_params || {}),
    link: n.link,
    is_read: n.is_read,
    created_at: n.created_at,
  }));

  return ok(
    res,
    { notifications: rendered, unread },
    { meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  );
}

/**
 * PATCH /api/v1/me/notifications/:id/read
 */
export async function markReadHandler(req, res) {
  await notificationService.markRead(req.params.id, req.user.id);
  return ok(res, { read: true });
}

/**
 * POST /api/v1/me/notifications/read-all
 */
export async function markAllReadHandler(req, res) {
  const count = await notificationService.markAllRead(req.user.id);
  return ok(res, { updated: count });
}

/**
 * DELETE /api/v1/me/notifications/:id
 */
export async function removeHandler(req, res) {
  await notificationService.removeNotification(req.params.id, req.user.id);
  return noContent(res);
}

export default Object.freeze({
  listHandler,
  markReadHandler,
  markAllReadHandler,
  removeHandler,
});