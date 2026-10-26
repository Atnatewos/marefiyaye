/**
 * @file apps/api/src/routes/messages.routes.js
 *
 * Messaging endpoints.
 *
 * Why this file exists:
 *   - Flat host ↔ guest chat within a property context.
 *   - Threads are derived from unique (property, other user) pairs.
 *
 * Endpoints:
 *   GET  /api/messages/threads                          - list conversation threads
 *   GET  /api/messages/:propertyId/:otherUserId         - load thread messages
 *   POST /api/messages                                  - send a message
 */

import { Router } from 'express';
import { z } from 'zod';
import { authGuard } from '../middleware/authGuard.js';
import { validate } from '../middleware/validate.js';
import {
  findThreadsForUser,
  findThreadMessages,
  insertMessage,
} from '../queries/messages.queries.js';

const router = Router();
router.use(authGuard);

const sendSchema = z.object({
  receiverId: z.string().uuid(),
  propertyId: z.string().uuid(),
  body: z.string().min(1).max(2000),
});

router.get('/threads', async (req, res, next) => {
  try {
    const rows = await findThreadsForUser(req.user.id);
    const items = rows.map((row) => ({
      id: row.id,
      propertyId: row.property_id,
      propertyTitle: row.property_title,
      propertySlug: row.property_slug,
      otherUserId: row.other_user_id,
      otherUserName: row.other_user_name,
      body: row.body,
      isRead: row.is_read,
      createdAt: row.created_at,
    }));
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/:propertyId/:otherUserId', async (req, res, next) => {
  try {
    const rows = await findThreadMessages(
      req.user.id,
      req.params.otherUserId,
      req.params.propertyId
    );
    const items = rows.map((row) => ({
      id: row.id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      senderName: row.sender_name,
      body: row.body,
      isRead: row.is_read,
      createdAt: row.created_at,
    }));
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/', validate(sendSchema), async (req, res, next) => {
  try {
    const { receiverId, propertyId, body } = req.body;
    const created = await insertMessage(req.user.id, receiverId, propertyId, body);
    res.status(201).json({
      message: {
        id: created.id,
        senderId: created.sender_id,
        receiverId: created.receiver_id,
        propertyId: created.property_id,
        body: created.body,
        isRead: created.is_read,
        createdAt: created.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;