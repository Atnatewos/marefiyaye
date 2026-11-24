/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — useConfig Hook
 * Path: apps/web/src/hooks/useConfig.js
 *
 * Purpose:
 *   Convenience re-export of the ConfigContext consumer. Kept separate so
 *   imports stay clean (`import { useConfig } from '@/hooks/useConfig'`).
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

export { useConfig } from '../contexts/ConfigContext.jsx';