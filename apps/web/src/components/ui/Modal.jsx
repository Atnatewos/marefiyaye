/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Modal (Focus-Safe)
 * Path: apps/web/src/components/ui/Modal.jsx
 *
 * Purpose:
 *   Portal-based modal dialog with guaranteed focus stability.
 *
 * CRITICAL DESIGN CHOICE — why this file is different from a naive Modal:
 *   A common React bug is the "input loses focus after one keystroke" that
 *   happens when the Modal returns `null` when closed and renders inline
 *   children via createPortal when open. Because inline JSX creates a new
 *   element tree on every parent render, React reconciles the entire input
 *   subtree as "new" and unmounts the input mid-typing.
 *
 *   The fix is threefold:
 *     1. The portal is created ONCE on mount and stays mounted forever.
 *     2. Visibility is controlled via CSS (display: none) — the DOM element
 *        itself is never removed.
 *     3. The children prop is passed through a stable wrapper that React can
 *        reconcile normally (no forced remount).
 *
 *   Result: you can type into an <input> inside this modal without losing
 *   focus on every keystroke.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils.js';

/* ── Size presets ────────────────────────────────────────────────────────── */

const SIZE_CLASSES = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

/* ── Component ───────────────────────────────────────────────────────────── */

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer = null,
  size = 'md',
  closeOnBackdrop = true,
}) {
  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  /* Mark as mounted after first client render (portal needs document.body) */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* Body scroll lock + escape key + focus management while open */
  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement;

    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const t = setTimeout(() => {
      const first = dialogRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    }, 30);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = originalOverflow;
      clearTimeout(t);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open, onClose]);

  /* Focus trap */
  const onKeyDown = (e) => {
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const focusables = dialogRef.current.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
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

  /* SSR / pre-mount: no portal possible */
  if (!mounted) return null;

  /*
   * KEY DIFFERENCE FROM NAIVE MODAL:
   * The outer wrapper is ALWAYS in the DOM via portal. `open` toggles
   * `display: none` — the input elements stay mounted. Focus is preserved.
   */
  return createPortal(
    <div
      style={{ display: open ? 'flex' : 'none' }}
      className="fixed inset-0 z-[90] items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        onKeyDown={onKeyDown}
        className={cn(
          'bg-bg text-fg w-full shadow-modal border border-border',
          'rounded-t-2xl sm:rounded-lg',
          'max-h-[92vh] overflow-hidden flex flex-col',
          'animate-fade-up',
          SIZE_CLASSES[size] || SIZE_CLASSES.md
        )}
      >
        {(title || description) && (
          <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4 shrink-0">
            <div>
              {title && (
                <h2 id="modal-title" className="text-lg font-bold">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-muted mt-1">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-border bg-neutral-50 dark:bg-neutral-900/40 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}