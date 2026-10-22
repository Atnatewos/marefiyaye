/**
 * @file apps/api/src/routes/uploads.routes.js
 *
 * Image upload endpoint.
 *
 * Why this file exists:
 *   - Frontend needs to upload images to Cloudinary without exposing secrets.
 *   - Endpoint validates auth, file type, size, then delegates to service.
 *
 * Folder handling:
 *   - Client sends a short key (`properties`, `receipts`, `avatars`).
 *   - This endpoint maps the key to the full Cloudinary folder path
 *     (`marefiyaye/properties`) before delegating to the upload service.
 *   - Unknown keys are rejected with a clear list of valid options.
 *
 * Endpoints:
 *   POST /api/uploads/image
 *     body: multipart/form-data with `file` field
 *     query: ?folder=properties|receipts|avatars
 *     response: { url, publicId, width, height, format }
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { RATE_LIMITS } from '@marefiyaye/config/security';
import { CLOUDINARY_FOLDERS } from '@marefiyaye/config/uploads';
import { authGuard } from '../middleware/authGuard.js';
import { upload } from '../middleware/upload.js';
import { uploadImage, isCloudinaryConfigured } from '../services/upload.service.js';
import { InternalError, ValidationError } from '../utils/errors.js';

const router = Router();
router.use(authGuard);

/**
 * Maps short folder keys to full Cloudinary folder paths.
 * Client sends `?folder=properties`, this map resolves to `marefiyaye/properties`.
 */
const FOLDER_KEY_MAP = Object.freeze({
  properties: CLOUDINARY_FOLDERS.PROPERTIES,
  receipts: CLOUDINARY_FOLDERS.RECEIPTS,
  avatars: CLOUDINARY_FOLDERS.AVATARS,
});

const uploadLimiter = rateLimit({
  windowMs: RATE_LIMITS.uploads.windowMs,
  max: RATE_LIMITS.uploads.max,
  message: { error: { message: RATE_LIMITS.uploads.message, code: 'TooManyRequestsError' } },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/uploads/image
 * Query: folder=properties|receipts|avatars
 */
router.post(
  '/image',
  uploadLimiter,
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!isCloudinaryConfigured()) {
        throw new InternalError('Image upload is not configured on this server');
      }
      if (!req.file) {
        throw new ValidationError('No file uploaded');
      }

      const folderKey = req.query.folder;
      const resolvedFolder = FOLDER_KEY_MAP[folderKey];
      if (!resolvedFolder) {
        throw new ValidationError(
          `Invalid folder "${folderKey}". Use one of: ${Object.keys(FOLDER_KEY_MAP).join(', ')}`
        );
      }

      const result = await uploadImage(req.file.buffer, resolvedFolder);
      res.status(201).json({ image: result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;