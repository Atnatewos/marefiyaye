/**
 * @file apps/api/src/middleware/upload.js
 *
 * Multer middleware for image uploads.
 *
 * Why this file exists:
 *   - Uses `multer.memoryStorage()` so files are held in memory (Vercel has no disk).
 *   - Enforces MIME type and size limits from `@marefiyaye/config/uploads`.
 *   - Exposes `upload.single('file')` for endpoints.
 *
 * Security:
 *   - MIME allowlist — no arbitrary file types.
 *   - Size cap — prevents DoS via huge files.
 *   - Multer 2.x — patched against known CVEs.
 */

import multer from 'multer';
import {
  MAX_IMAGE_BYTES,
  ACCEPTED_IMAGE_MIME_TYPES,
} from '@marefiyaye/config/uploads';
import { ValidationError } from '../utils/errors.js';

/**
 * Memory storage — file held in `req.file.buffer`, never touches disk.
 */
const storage = multer.memoryStorage();

/**
 * File filter — enforce MIME allowlist.
 */
function fileFilter(req, file, cb) {
  if (!ACCEPTED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    cb(new ValidationError(`Unsupported file type: ${file.mimetype}`));
    return;
  }
  cb(null, true);
}

/**
 * Configured multer instance.
 * Single-file mode: `upload.single('file')`.
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_IMAGE_BYTES,
    files: 1,
  },
});