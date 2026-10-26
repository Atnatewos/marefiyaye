/**
 * @file apps/web/lib/messages.js
 *
 * Client-side messaging API helpers.
 */

import { apiClient } from './apiClient';

export async function fetchThreads() {
  const { items } = await apiClient.get('/api/messages/threads');
  return items;
}

export async function fetchThreadMessages(propertyId, otherUserId) {
  const { items } = await apiClient.get(`/api/messages/${propertyId}/${otherUserId}`);
  return items;
}

export async function sendMessage({ receiverId, propertyId, body }) {
  const { message } = await apiClient.post('/api/messages', {
    receiverId,
    propertyId,
    body,
  });
  return message;
}