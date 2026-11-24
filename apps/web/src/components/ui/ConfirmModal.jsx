/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — ConfirmModal
 * Path: apps/web/src/components/ui/ConfirmModal.jsx
 *
 * Purpose:
 *   Purpose-built confirmation dialog. Used for destructive or irreversible
 *   actions: delete, logout, publish, cancel, approve, reject.
 *
 *   Visually distinct from the generic Modal:
 *     - Centered card with an accent icon (danger/primary/warning)
 *     - Single decisive question
 *     - Optional short description
 *     - Exactly two actions: cancel (secondary) + confirm (primary/danger)
 *     - Loading state on the confirm button during async ops
 *     - Escape key OR cancel button = safe path
 *
 *   Controlled component:
 *     - Parent decides `open`
 *     - Parent controls `isLoading` during async confirm
 *     - Parent handles the resolved action
 *
 *   For the imperative `await confirm(...)` API, use `useConfirm()`
 *   from `hooks/useConfirm.js` — it wires this modal for you.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle, AlertCircle, CheckCircle2, LogOut, Trash2, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils.js';
import Button from './Button.jsx';

/* ── Variant config ──────────────────────────────────────────────────────── */

/**
 * Each variant defines an accent color and a default icon. The icon can be
 * overridden by passing an `icon` prop.
 */
const VARIANTS = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-red-100 dark:bg-red-950/50',
    iconColor: 'text-red-600 dark:text-red-400',
    confirmClass: '!bg-red-600 hover:!bg-red-700 !text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-100 dark:bg-amber-950/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    confirmClass: '!bg-amber-600 hover:!bg-amber-700 !text-white',
  },
  primary: {
    icon: CheckCircle2,
    iconBg: 'bg-brand-100 dark:bg-brand-500/20',
    iconColor: 'text-brand-600 dark:text-brand-400',
    confirmClass: '',
  },
  info: {
    icon: AlertCircle,
    iconBg: 'bg-blue-100 dark:bg-blue-950/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    confirmClass: '!bg-blue-600 hover:!bg-blue-700 !text-white',
  },
  logout: {
    icon: LogOut,
    iconBg: 'bg-neutral-200 dark:bg-neutral-800',
    iconColor: 'text-neutral-700 dark:text-neutral-300',
    confirmClass: '!bg-neutral-900 hover:!bg-black !text-white dark:!bg-white dark:!text-neutral-900',
  },
  admin: {
    icon: Shield,
    iconBg: 'bg-purple-100 dark:bg-purple-950/50',
    iconColor: 'text-purple-600 dark:text-purple-400',
    confirmClass: '!bg-purple-600 hover:!bg-purple-700 !text-white',
  },
};

/* ── Component ───────────────────────────────────────────────────────────── */

export default function ConfirmModal({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  icon: CustomIcon = null,
  loading = false,
}) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  /* Lock body scroll + focus management + escape key */
  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement;

    const onKey = (e) => {
      if (e.key === 'Escape' && !loading) {
        e.preventDefault();
        onCancel?.();
      }
    };
    document.addEventListener('keydown', onKey);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    /* Focus the cancel button — the safe choice — by default */
    const t = setTimeout(() => cancelRef.current?.focus(), 30);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = originalOverflow;
      clearTimeout(t);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open, onCancel, loading]);

  /* Focus trap between cancel and confirm */
  const onKeyDown = (e) => {
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const focusables = dialogRef.current.querySelectorAll(
      'button:not([disabled])'
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!open || typeof document === 'undefined') return null;

  const v = VARIANTS[variant] || VARIANTS.primary;
  const Icon = CustomIcon || v.icon;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby={description ? 'confirm-desc' : undefined}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel?.();
      }}
    >
      <div
        ref={dialogRef}
        onKeyDown={onKeyDown}
        className={cn(
          'bg-bg border border-border rounded-xl shadow-modal w-full max-w-sm',
          'p-6 animate-scale-in'
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4',
            v.iconBg
          )}
        >
          <Icon className={cn('w-6 h-6', v.iconColor)} />
        </div>

        {/* Copy */}
        <div className="text-center space-y-2 mb-6">
          <h2
            id="confirm-title"
            className="text-lg font-extrabold text-fg"
          >
            {title}
          </h2>
          {description && (
            <p id="confirm-desc" className="text-sm text-muted leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            ref={cancelRef}
            type="button"
            variant="secondary"
            size="md"
            fullWidth
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            fullWidth
            onClick={onConfirm}
            loading={loading}
            className={v.confirmClass}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}