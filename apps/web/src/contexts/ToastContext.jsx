/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Toast Context
 * Path: apps/web/src/contexts/ToastContext.jsx
 *
 * Purpose:
 *   Global toast notification system. Provides:
 *     - toast.success(message, opts?)
 *     - toast.error(message, opts?)
 *     - toast.info(message, opts?)
 *     - toast.warning(message, opts?)
 *
 *   Renders a stack in the bottom-right. Auto-dismiss after 4s (paused on
 *   hover). Max 5 visible — oldest dismissed when exceeded.
 *
 *   Toast messages may be plain strings or i18n keys. If the string looks
 *   like a key (`common.button.save`, `errors.generic`), it is translated
 *   automatically via useI18n.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { useI18n } from './I18nContext.jsx';
import { cn } from '../lib/utils.js';

const ToastContext = createContext(null);
const AUTO_DISMISS_MS = 4000;
const MAX_VISIBLE = 5;

/* ── Type styling ────────────────────────────────────────────────────────── */

const TYPE_STYLES = {
  success: {
    icon: CheckCircle2,
    container: 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
  },
  error: {
    icon: AlertCircle,
    container: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
    iconClass: 'text-red-600 dark:text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    container: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100',
    iconClass: 'text-amber-600 dark:text-amber-400',
  },
  info: {
    icon: Info,
    container: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
    iconClass: 'text-blue-600 dark:text-blue-400',
  },
};

/* ── Single toast ────────────────────────────────────────────────────────── */

function ToastItem({ toast, onDismiss }) {
  const styles = TYPE_STYLES[toast.type] || TYPE_STYLES.info;
  const Icon = styles.icon;
  const timerRef = useRef(null);
  const [paused, setPaused] = useState(false);

  /* Auto-dismiss timer (pause on hover) */
  if (!timerRef.current) {
    timerRef.current = { remaining: AUTO_DISMISS_MS, startedAt: Date.now() };
  }

  const handleMouseEnter = () => {
    setPaused(true);
    if (timerRef.current) {
      timerRef.current.remaining -= Date.now() - timerRef.current.startedAt;
    }
  };

  const handleMouseLeave = () => {
    setPaused(false);
    if (timerRef.current) {
      timerRef.current.startedAt = Date.now();
    }
  };

  /* Use useEffect-based timer */
  useMemo(() => {
    if (paused) return;
    const ms = Math.max(500, timerRef.current?.remaining ?? AUTO_DISMISS_MS);
    const id = setTimeout(() => onDismiss(toast.id), ms);
    return () => clearTimeout(id);
  }, [paused, toast.id, onDismiss]);

  return (
    <div
      role="alert"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-modal animate-slide-in-right pointer-events-auto',
        'max-w-md w-full text-sm font-medium',
        styles.container
      )}
    >
      <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', styles.iconClass)} />
      <div className="flex-1 leading-relaxed break-words">{toast.message}</div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ── Provider ────────────────────────────────────────────────────────────── */

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const { t } = useI18n();
  const idRef = useRef(0);

  /**
   * Resolves a message: if it looks like an i18n key (contains a dot,
   * lowercase), tries to translate. Otherwise renders as plain text.
   */
  const resolveMessage = useCallback(
    (message) => {
      if (typeof message !== 'string') return String(message);
      if (/^[a-z0-9._]+$/i.test(message) && message.includes('.')) {
        const translated = t(message);
        return translated !== message ? translated : message;
      }
      return message;
    },
    [t]
  );

  const push = useCallback(
    (type, message) => {
      const id = ++idRef.current;
      const item = { id, type, message: resolveMessage(message) };
      setToasts((prev) => {
        const next = [...prev, item];
        return next.length > MAX_VISIBLE ? next.slice(next.length - MAX_VISIBLE) : next;
      });
      return id;
    },
    [resolveMessage]
  );

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useMemo(
    () => ({
      success: (msg) => push('success', msg),
      error: (msg) => push('error', msg),
      warning: (msg) => push('warning', msg),
      info: (msg) => push('info', msg),
      dismiss,
    }),
    [push, dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((item) => (
          <ToastItem key={item.id} toast={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ── Consumer hook ───────────────────────────────────────────────────────── */

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx.toast;
}

export default ToastContext;