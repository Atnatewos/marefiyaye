/**
 * @file apps/web/lib/uploads.js
 *
 * Client-side image upload helpers.
 *
 * Why this file exists:
 *   - The wizard and receipt UI both need to upload images.
 *   - Centralizes multipart handling and error mapping.
 */

import { apiClient, ApiClientError } from './apiClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/**
 * Uploads a single image to Cloudinary via the API.
 *
 * @param {File} file
 * @param {'properties'|'receipts'|'avatars'} folder
 * @returns {Promise<{ url: string, publicId: string, width: number, height: number }>}
 */
export async function uploadImage(file, folder) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${API_BASE}/api/uploads/image?folder=${encodeURIComponent(folder)}`,
    {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }
  );

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message = body?.error?.message || `Upload failed (${response.status})`;
    const code = body?.error?.code || 'UploadError';
    throw new ApiClientError(response.status, message, code);
  }
  return body.image;
}