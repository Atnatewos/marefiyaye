/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Notifications Dropdown
 * Path: apps/web/src/components/layout/NotificationsDropdown.jsx
 *
 * Purpose:
 *   Bell icon button + dropdown list of notifications. Fetches on open,
 *   polls every 30s. Mark-all-read + individual delete. Uses the API's
 *   server-rendered i18n titles/bodies — zero client translation needed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import api from '../../lib/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useI18n } from '../../hooks/useI18n.js';
import { cn } from '../../lib/utils.js';
import { Badge, Button, Spinner } from '../ui';

const POLL_MS = 30_000;

export default function NotificationsDropdown() {
  const { isAuthenticated } = useAuth();
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  /* Fetch whenever opened */
  useEffect(() => {
    if (!open || !isAuthenticated) return;
    let cancelled = false;
    setLoading(true);
    api
      .get('/me/notifications?limit=20')
      .then(({ data }) => {
        if (cancelled) return;
        setNotifications(data?.notifications || []);
        setUnread(data?.unread || 0);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, isAuthenticated]);

  /* Poll for unread while authenticated */
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const tick = () => {
      api
        .get('/me/notifications?limit=1')
        .then(({ data }) => {
          if (!cancelled) setUnread(data?.unread || 0);
        })
        .catch(() => {});
    };
    tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [isAuthenticated]);

  /* Click-outside to close */
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  if (!isAuthenticated) return null;

  const markAllRead = async () => {
    try {
      await api.post('/me/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnread(0);
    } catch {}
  };

  const removeNotification = async (id) => {
    try {
      await api.delete(`/me/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {}
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        aria-label={t('common.notifications.title')}
        aria-expanded={open}
        className="relative w-10 h-10 p-0 rounded-full"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-bg" />
        )}
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-80 bg-bg rounded-lg shadow-modal border border-border p-3 z-50 animate-scale-in"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
            <h4 className="font-bold text-sm">{t('common.notifications.title')}</h4>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-brand-500 font-semibold hover:underline"
              >
                {t('common.notifications.markAllRead')}
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
            {loading && <Spinner variant="full" size="sm" />}

            {!loading && notifications.length === 0 && (
              <p className="text-muted text-xs text-center py-6">
                {t('common.notifications.empty')}
              </p>
            )}

            {!loading &&
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'group relative p-2.5 rounded-md border border-border flex items-start gap-2',
                    !n.is_read && 'bg-brand-50 dark:bg-brand-500/10'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-fg truncate">{n.title}</p>
                    <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-muted mt-1">
                      {new Date(n.created_at).toLocaleDateString(lang === 'am' ? 'am-ET' : 'en-GB', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNotification(n.id)}
                    aria-label="Dismiss"
                    className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-500 transition-opacity shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}