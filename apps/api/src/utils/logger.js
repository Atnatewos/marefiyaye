/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE API — Structured Logger
 * Path: apps/api/src/utils/logger.js
 *
 * Purpose:
 *   Minimal, dependency-free structured logger with level filtering.
 *   Emits JSON lines in production (parsable by Vercel log drains) and
 *   human-friendly lines in development.
 *
 * Level comes from `config.logging.level` (env: LOG_LEVEL).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import config from '../config/env.js';

const LEVELS = Object.freeze({ debug: 10, info: 20, warn: 30, error: 40 });
const MIN_LEVEL = LEVELS[config.logging.level] || LEVELS.info;

/**
 * Serializes an error for safe JSON output.
 * @param {unknown} err
 * @returns {object|null}
 */
function serializeError(err) {
  if (!err) return null;
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: config.app.isProd ? undefined : err.stack,
      code: err.code,
    };
  }
  return { raw: String(err) };
}

/**
 * Emits a log line if the level passes the filter.
 * @param {'debug'|'info'|'warn'|'error'} level
 * @param {string} message
 * @param {object} [meta]
 */
function emit(level, message, meta = {}) {
  if (LEVELS[level] < MIN_LEVEL) return;

  const timestamp = new Date().toISOString();
  const payload = { level, timestamp, message, ...meta };
  if (payload.error) payload.error = serializeError(payload.error);

  if (config.app.isProd) {
    // JSON line — parseable by log drains
    process.stdout.write(`${JSON.stringify(payload)}\n`);
  } else {
    // Human-friendly in dev
    const levelTag = `[${level.toUpperCase()}]`.padEnd(7);
    const metaStr = Object.keys(meta).length
      ? ` ${JSON.stringify({ ...meta, error: undefined })}`
      : '';
    process.stdout.write(`${levelTag} ${timestamp} ${message}${metaStr}\n`);
  }
}

/* ── Public API ──────────────────────────────────────────────────────────── */

export const logger = Object.freeze({
  debug: (message, meta) => emit('debug', message, meta),
  info: (message, meta) => emit('info', message, meta),
  warn: (message, meta) => emit('warn', message, meta),
  error: (message, meta) => emit('error', message, meta),
});

export default logger;