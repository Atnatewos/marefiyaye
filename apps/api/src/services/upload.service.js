/**
 * @file apps/api/src/services/upload.service.js
 *
 * Cloudinary upload service.
 *
 * Why this file exists:
 *   - Every image upload (property, receipt, avatar) goes through one service.
 *   - Handles config validation, folder routing, format enforcement.
 *   - Returns the shape the DB stores: `{ url, publicId, width, height }`.
 *
 * Security:
 *   - File size and MIME type enforced by multer middleware BEFORE this runs.
 *   - Cloudinary handles virus scanning and format conversion.
 *   - `publicId` returned so future DELETE can remove the image.
 *
 * Folder resolution:
 *   - Caller passes the FULL Cloudinary folder path (e.g. `marefiyaye/properties`).
 *   - The route layer resolves short keys (`properties`) to full paths before
 *     calling this service, keeping this file focused on upload mechanics.
 */

import { v2 as cloudinary } from 'cloudinary';
import { apiEnv } from '../config/env.js';
import { InternalError } from '../utils/errors.js';

// Configure Cloudinary once at module load
cloudinary.config({
  cloud_name: apiEnv.CLOUDINARY_CLOUD_NAME,
  api_key: apiEnv.CLOUDINARY_API_KEY,
  api_secret: apiEnv.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * True when Cloudinary credentials are set.
 * Endpoints check this before attempting uploads.
 */
export function isCloudinaryConfigured() {
  return Boolean(
    apiEnv.CLOUDINARY_CLOUD_NAME &&
      apiEnv.CLOUDINARY_API_KEY &&
      apiEnv.CLOUDINARY_API_SECRET
  );
}

/**
 * Uploads a single buffer to Cloudinary.
 *
 * @param {Buffer} buffer - File buffer from multer.
 * @param {string} folder - Full Cloudinary folder path (e.g. `marefiyaye/properties`).
 * @param {string} [publicIdPrefix] - Optional prefix for the publicId.
 * @returns {Promise<{url: string, publicId: string, width: number, height: number, format: string}>}
 */
export async function uploadImage(buffer, folder, publicIdPrefix = '') {
  if (!isCloudinaryConfigured()) {
    throw new InternalError('Image upload is not configured. Set CLOUDINARY_* env vars.');
  }
  if (typeof folder !== 'string' || folder.length === 0) {
    throw new InternalError('Upload folder is required');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicIdPrefix
          ? `${publicIdPrefix}-${Date.now()}`
          : undefined,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) {
          reject(new InternalError(`Cloudinary upload failed: ${error.message}`));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      }
    );
    uploadStream.end(buffer);
  });
}