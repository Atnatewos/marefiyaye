/**
 * @file apps/web/components/ui/ToastProvider.jsx
 *
 * Toast provider — context + portal for toast notifications.
 *
 * Why this file exists:
 *   - Any component needs to show a toast (submit form, save property, etc.)
 *     without prop-drilling a callback through 5 levels.
 *   - A context provider exposes a `useToast()` hook so any descendant can
 *     trigger a notification.
 *   - Auto-dismiss after 4 seconds; user can also click to dismiss.
 *
 * Usage:
 *   In app/layout.jsx:
 *     <ToastProvider>{children}</ToastProvider>
 *
 *   In any component:
 *     const toast = useToast();
 *     toast.success('Saved!');
 *     toast.error('Payment failed.');
 */

'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { classNames } from '@/lib/classNames';
import styles from './Toast.module.css';

/**
 * Context exposing the toast API.
 * Null when not inside a ToastProvider.
 */
const ToastContext = createContext(null);

/**
 * Auto-dismiss timeout in milliseconds.
 * Exposed as a constant so tests can reference the same value.
 */
const TOAST_DURATION_MS = 4000;

/**
 * Icon rendered for each variant.
 * Inline SVG — no icon library dependency.
 */
function ToastIcon({ variant }) {
  const paths = {
    success: 'M20 6L9 17l-5-5',
    error: 'M18 6L6 18M6 6l12 12',
    warning: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
    info: 'M12 16v-4m0-4h.01M12 22a10 10 0 100-20 10 10 0 000 20z',
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[variant]} />
    </svg>
  );
}

/**
 * Close icon.
 */
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

/**
 * Single toast row.
 * Auto-dismisses via useEffect timer.
 */
function ToastRow({ id, variant, message, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <div className={classNames(styles.toast, styles[variant])} role="status">
      <span className={styles.icon} aria-hidden="true">
        <ToastIcon variant={variant} />
      </span>
      <span className={styles.message}>{message}</span>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        className={styles.closeButton}
        aria-label="Dismiss notification"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

/**
 * Toast provider component.
 * Wraps the app and renders the toast container as a fixed overlay.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /**
   * Adds a toast to the stack. Returns a unique id for optional manual dismissal.
   */
  const addToast = useCallback((variant, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, variant, message }]);
    return id;
  }, []);

  /**
   * Removes a toast by id.
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Public API exposed via context.
   */
  const api = useMemo(
    () => ({
      success: (msg) => addToast('success', msg),
      error: (msg) => addToast('error', msg),
      warning: (msg) => addToast('warning', msg),
      info: (msg) => addToast('info', msg),
      dismiss: removeToast,
    }),
    [addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toasts.length > 0 && (
        <div className={styles.container} aria-live="polite">
          {toasts.map((toast) => (
            <ToastRow
              key={toast.id}
              id={toast.id}
              variant={toast.variant}
              message={toast.message}
              onDismiss={removeToast}
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

/**
 * Hook to access the toast API from any descendant component.
 * Throws if called outside a ToastProvider.
 *
 * @returns {{ success: (msg: string) => string, error: (msg: string) => string, warning: (msg: string) => string, info: (msg: string) => string, dismiss: (id: string) => void }}
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return context;
}