/**
 * @file apps/api/src/queries/messages.queries.js
 *
 * SQL for the flat messages table.
 *
 * Why this file exists:
 *   - Host ↔ guest messaging.
 *   - Threads are derived from unique (property, otherUser) pairs.
 *   - Messages are flat rows; grouping into threads happens in the query.
 */

import { query } from '../config/db.js';
import { TABLES } from '@marefiyaye/config/database';

/**
 * Lists all distinct conversation threads for a user.
 * A thread = (property, the other party) — messages grouped.
 *
 * @param {string} userId
 */
export async function findThreadsForUser(userId) {
  const { rows } = await query(
    `WITH latest AS (
       SELECT
         m.*,
         ROW_NUMBER() OVER (
           PARTITION BY m.property_id, LEAST(m.sender_id, m.receiver_id), GREATEST(m.sender_id, m.receiver_id)
           ORDER BY m.created_at DESC
         ) AS rn
       FROM ${TABLES.MESSAGES} m
       WHERE m.sender_id = $1 OR m.receiver_id = $1
     )
     SELECT
       l.id, l.property_id, l.sender_id, l.receiver_id, l.body, l.created_at, l.is_read,
       p.title AS property_title, p.slug AS property_slug,
       CASE WHEN l.sender_id = $1 THEN l.receiver_id ELSE l.sender_id END AS other_user_id,
       u.full_name AS other_user_name
     FROM latest l
     JOIN ${TABLES.PROPERTIES} p ON p.id = l.property_id
     JOIN ${TABLES.USERS} u ON u.id = CASE WHEN l.sender_id = $1 THEN l.receiver_id ELSE l.sender_id END
     WHERE l.rn = 1
     ORDER BY l.created_at DESC`,
    [userId]
  );
  return rows;
}

/**
 * Loads all messages in a thread between two users about a property.
 *
 * @param {string} userId
 * @param {string} otherUserId
 * @param {string} propertyId
 */
export async function findThreadMessages(userId, otherUserId, propertyId) {
  const { rows } = await query(
    `SELECT m.*, u.full_name AS sender_name
     FROM ${TABLES.MESSAGES} m
     JOIN ${TABLES.USERS} u ON u.id = m.sender_id
     WHERE m.property_id = $1
       AND ((m.sender_id = $2 AND m.receiver_id = $3) OR (m.sender_id = $3 AND m.receiver_id = $2))
     ORDER BY m.created_at ASC`,
    [propertyId, userId, otherUserId]
  );
  return rows;
}

/**
 * Inserts a message. Returns the created row.
 */
export async function insertMessage(senderId, receiverId, propertyId, body) {
  const { rows } = await query(
    `INSERT INTO ${TABLES.MESSAGES} (sender_id, receiver_id, property_id, body, is_read)
     VALUES ($1, $2, $3, $4, FALSE)
     RETURNING *`,
    [senderId, receiverId, propertyId, body]
  );
  return rows[0];
}