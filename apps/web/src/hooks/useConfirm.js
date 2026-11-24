/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — useConfirm Hook
 * Path: apps/web/src/hooks/useConfirm.js
 *
 * Purpose:
 *   Convenience re-export of the ConfirmContext consumer. Kept in the hooks
 *   folder so imports stay clean:
 *
 *     import { useConfirm } from '@/hooks/useConfirm.js';
 *
 *   The actual provider + hook live in `contexts/ConfirmContext.jsx`.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

export { useConfirm } from '@/contexts/ConfirmContext.jsx';