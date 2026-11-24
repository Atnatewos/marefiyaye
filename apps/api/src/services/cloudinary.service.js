/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Cloudinary Service
 * Path: apps/api/src/services/cloudinary.service.js
 *
 * Purpose:
 *   Signs Cloudinary uploads server-side so the browser can upload directly
 *   to Cloudinary without exposing the API secret. The signature guarantees
 *   the upload was authorized by us.
 *
 *   Two upload categories:
 *     - receipt    : payment receipt screenshots
 *     - listing    : property images (public)
 *
 * Clock skew protection:
 *   Cloudinary rejects uploads whose `timestamp` is more than 1 hour off
 *   from their server clock. If the machine running this API has a drifted
 *   system clock, uploads silently fail with a 400. We now validate the
 *   local clock against the DB's NOW() BEFORE signing and return a clear
 *   error if the clock is off. This prevents a mountain of debugging for
 *   a bug that takes 30 seconds to fix (sync the system clock).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import crypto from 'node:crypto';
import config from '../config/env.js';
import { AppError } from '../middleware/error.middleware.js';
import { logger } from '../utils/logger.js';
import { query } from '../db/pool.js';

/* ── Categories ──────────────────────────────────────────────────────────── */

const UPLOAD_CATEGORIES = Object.freeze({
  RECEIPT: 'receipt',
  LISTING: 'listing',
});

const CATEGORY_OPTIONS = Object.freeze({
  [UPLOAD_CATEGORIES.RECEIPT]: {
    folder: 'receipts',
    allowedFormats: 'jpg,jpeg,png,webp',
    maxFileSizeBytes: config.uploads.maxFileSizeBytes,
  },
  [UPLOAD_CATEGORIES.LISTING]: {
    folder: 'listings',
    allowedFormats: 'jpg,jpeg,png,webp',
    maxFileSizeBytes: config.uploads.maxFileSizeBytes,
  },
});

/**
 * Maximum tolerated clock skew between this server and the DB.
 * Cloudinary's tolerance is ~1 hour, so we use 10 minutes as a safety margin.
 */
const CLOCK_SKEW_TOLERANCE_MS = 10 * 60 * 1000;

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/**
 * Confirms the local system clock is close enough to the DB's clock for a
 * Cloudinary signature to remain valid. Throws an AppError on failure.
 *
 * Why the DB: the DB (Neon) runs on a controlled, always-correct clock.
 * It's our reference for "real time".
 *
 * @returns {Promise<number>} — drift in milliseconds (positive = local ahead)
 */
async function assertClockIsSane() {
  const localMs = Date.now();
  const dbResult = await query(`SELECT EXTRACT(EPOCH FROM NOW()) * 1000 AS now_ms`);
  const dbMs = Number(dbResult.rows[0]?.now_ms || 0);

  if (!dbMs) {
    /* Can't reach DB to compare — skip the check, don't block uploads */
    logger.warn('[cloudinary] could not verify clock skew (DB returned no time)');
    return 0;
  }

  const drift = localMs - dbMs;

  if (Math.abs(drift) > CLOCK_SKEW_TOLERANCE_MS) {
    const driftMinutes = Math.round(drift / 60_000);
    logger.error('[cloudinary] system clock is too far off from real time', {
      driftMs: drift,
      driftMinutes,
      localMs,
      dbMs,
    });
    throw new AppError({
      status: 500,
      code: 'server.clock_drift',
      message: 'errors.config.invalid',
      details: {
        hint: 'Your system clock is off. Sync Windows/Mac time settings and retry.',
        driftMinutes,
      },
    });
  }

  return drift;
}

/**
 * Cloudinary signs uploads by SHA-1 hashing a sorted "key=value&…" string
 * that includes the API secret. We replicate exactly that algorithm.
 *
 * @param {Record<string, string|number>} params
 * @returns {string}
 */
function signParams(params) {
  const sortedKeys = Object.keys(params).sort();
  const toSign = sortedKeys.map((key) => `${key}=${params[key]}`).join('&');
  return crypto
    .createHash('sha1')
    .update(`${toSign}${config.cloudinary.apiSecret}`)
    .digest('hex');
}

/* ── Public API ──────────────────────────────────────────────────────────── */

/**
 * Returns a signed payload the browser can use to POST directly to
 * Cloudinary's upload endpoint.
 *
 * @param {object} params
 * @param {string} params.category   — "receipt" | "listing"
 * @param {string} [params.publicId] — optional custom public_id
 * @returns {Promise<{ cloudName, apiKey, uploadUrl, params, maxFileSizeBytes }>}
 */
export async function buildSignedUpload({ category, publicId = null }) {
  const options = CATEGORY_OPTIONS[category];
  if (!options) {
    throw new AppError({
      status: 400,
      code: 'upload.invalid_category',
      message: 'errors.validation',
      details: { category, allowed: Object.keys(CATEGORY_OPTIONS) },
    });
  }

  /* Validate clock before doing anything else — fail fast on skew */
  await assertClockIsSane();

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `${config.cloudinary.folder}/${options.folder}`;

  const signedParams = {
    timestamp,
    folder,
    allowed_formats: options.allowedFormats,
  };

  if (publicId) {
    signedParams.public_id = publicId;
  }

  const signature = signParams(signedParams);

  logger.info('[cloudinary] upload signature issued', {
    category,
    folder,
    timestamp,
  });

  return {
    cloudName: config.cloudinary.cloudName,
    apiKey: config.cloudinary.apiKey,
    uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/auto/upload`,
    maxFileSizeBytes: options.maxFileSizeBytes,
    params: {
      ...signedParams,
      api_key: config.cloudinary.apiKey,
      signature,
    },
  };
}

/**
 * Deletes an asset from Cloudinary by public_id. Fails silently — a missing
 * asset should never break a user flow.
 *
 * @param {string} publicId
 * @returns {Promise<boolean>}
 */
export async function destroyAsset(publicId) {
  if (!publicId) return false;

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = signParams({ public_id: publicId, timestamp });

    const body = new URLSearchParams({
      public_id: publicId,
      timestamp: String(timestamp),
      api_key: config.cloudinary.apiKey,
      signature,
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/image/destroy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      }
    );

    if (!response.ok) {
      logger.warn('[cloudinary] destroy returned non-OK status', {
        publicId,
        status: response.status,
      });
      return false;
    }

    const json = await response.json();
    return json.result === 'ok';
  } catch (err) {
    logger.warn('[cloudinary] destroy failed', { publicId, error: err });
    return false;
  }
}

export const UPLOAD_CATEGORY = UPLOAD_CATEGORIES;

export default Object.freeze({
  buildSignedUpload,
  destroyAsset,
  UPLOAD_CATEGORY,
});