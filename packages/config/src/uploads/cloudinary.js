/**
 * @file packages/config/src/uploads/cloudinary.js
 *
 * Cloudinary upload configuration.
 *
 * Why this file exists:
 *   - File size and MIME limits must be identical on client (UX) and server (enforcement).
 *   - Folder structure should be centralized so asset management stays organized.
 *   - Transformation presets avoid magic strings sprinkled through the codebase.
 *
 * Contract: `apps/api/src/middleware/upload.js` reads these limits; the web upload UI
 * reads the same values so the user sees the right constraints.
 */

/**
 * Maximum bytes for any single image upload (10 MB).
 */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/**
 * Accepted image MIME types. `image/svg+xml` is excluded on purpose — SVG can carry
 * script payloads and is unsafe to serve from the same origin as user content.
 */
export const ACCEPTED_IMAGE_MIME_TYPES = Object.freeze([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

/**
 * Canonical Cloudinary folder names. Each upload type has its own folder so
 * retention policies and CDN rules can be applied per type.
 */
export const CLOUDINARY_FOLDERS = Object.freeze({
  PROPERTIES: 'marefiyaye/properties',
  RECEIPTS: 'marefiyaye/receipts',
  AVATARS: 'marefiyaye/avatars',
});

/**
 * Default transformation presets.
 *
 * propertyCard – small card thumbnail served in the feed
 * propertyFull – full-size gallery image
 * receiptProof – receipt thumbnail for admin review
 * avatar       – small circular profile image
 */
export const TRANSFORMATIONS = Object.freeze({
  propertyCard: 'c_fill,w_600,h_450,q_auto,f_auto',
  propertyFull: 'c_limit,w_1600,q_auto,f_auto',
  receiptProof: 'c_limit,w_800,q_auto,f_auto',
  avatar: 'c_fill,w_200,h_200,g_face,q_auto,f_auto',
});