/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — BroadcastRenderer
 * Path: apps/web/src/components/layout/BroadcastRenderer.jsx
 *
 * Purpose:
 *   Fetches the active broadcasts for the current user's audience and
 *   renders them as sticky alerts at the top of the screen.
 *
 *   Behaviors:
 *   - Dismissible per session (stored in sessionStorage)
 *   - Auto-hides if no active broadcasts exist
 *   - Respects i18n (renders title_am/body_am when lang === 'am')
 *   - Renders different severities with different background colors
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth.js';
import { useI18n } from '@/hooks/useI18n.js';
import api from '@/lib/api.js';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

const SEVERITY_STYLES = {
  info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800',
  success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800',
  warning: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800',
  danger: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800',
};

const SEVERITY_ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  danger: AlertCircle,
};

export default function BroadcastRenderer() {
  const { user, isAuthenticated } = useAuth();
  const { lang } = useI18n();
  const [broadcasts, setBroadcasts] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  // Determine audience based on user role
  const audience = !isAuthenticated
    ? 'guests'
    : user?.role === 'admin' || user?.role === 'super_admin'
      ? 'admins'
      : user?.role === 'host'
        ? 'hosts'
        : 'guests';

  useEffect(() => {
    let cancelled = false;
    api.get(`/broadcasts?audience=${audience}`)
      .then(({ data }) => {
        if (!cancelled) setBroadcasts(data.broadcasts || []);
      })
      .catch((err) => {
        // Silently fail — broadcasts are non-critical
        console.warn('[broadcasts] failed to fetch', err);
      });
    return () => { cancelled = true; };
  }, [audience]);

  // Load dismissed IDs from session storage
  useEffect(() => {
    const raw = sessionStorage.getItem('mrf_dismissed_broadcasts');
    if (raw) {
      try { setDismissed(JSON.parse(raw)); } catch {}
    }
  }, []);

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    sessionStorage.setItem('mrf_dismissed_broadcasts', JSON.stringify(next));
  };

  const visible = broadcasts.filter((b) => !dismissed.includes(b.id));

  if (visible.length === 0) return null;

  return (
    <div className="w-full space-y-2 px-4 pt-2">
      {visible.map((b) => {
        const Icon = SEVERITY_ICONS[b.severity] || Info;
        const style = SEVERITY_STYLES[b.severity] || SEVERITY_STYLES.info;
        const title = lang === 'am' ? b.title_am : b.title_en;
        const body = lang === 'am' ? b.body_am : b.body_en;

        return (
          <div
            key={b.id}
            className={`relative flex items-start gap-3 p-3 rounded-md border text-sm ${style} animate-slide-in-right`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">{title}</p>
              <p className="mt-0.5 opacity-90">{body}</p>
            </div>
            <button
              type="button"
              onClick={() => dismiss(b.id)}
              className="p-1 rounded-md hover:bg-black/5 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}