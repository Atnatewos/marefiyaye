/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Announcement Bar
 * Path: apps/web/src/components/layout/AnnouncementBar.jsx
 *
 * Purpose:
 *   Top sticky promo bar. Reads the first active banner with placement
 *   `top_bar` from the API. Dismissible — remembers dismissal in
 *   localStorage per banner id.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import api from '../../lib/api.js';
import { useConfig } from '../../hooks/useConfig.js';
import { useI18n } from '../../hooks/useI18n.js';

const DISMISS_KEY = 'mrf_dismissed_banners';

function readDismissed() {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function persistDismissed(set) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DISMISS_KEY, JSON.stringify([...set]));
}

export default function AnnouncementBar() {
  const { features } = useConfig();
  const { lang } = useI18n();
  const [banner, setBanner] = useState(null);
  const [dismissed, setDismissed] = useState(() => readDismissed());

  useEffect(() => {
    if (!features.broadcastsEnabled) return;

    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/banners?placement=top_bar');
        const first = data?.banners?.[0];
        if (!cancelled && first) setBanner(first);
      } catch {
        /* Silent — announcements are non-critical */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [features.broadcastsEnabled]);

  if (!banner || dismissed.has(banner.id)) return null;

  const message = lang === 'am' ? banner.message_am : banner.message_en;
  const linkLabel = lang === 'am' ? banner.link_label_am : banner.link_label_en;

  const handleDismiss = () => {
    const next = new Set(dismissed);
    next.add(banner.id);
    setDismissed(next);
    persistDismissed(next);
  };

  return (
    <div
      role="region"
      aria-label="Announcement"
      className="bg-neutral-900 text-neutral-200 px-4 py-2.5 text-xs border-b border-neutral-800"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center space-x-2 truncate">
          <span className="bg-brand-500 text-white font-bold px-2 py-0.5 rounded text-[10px] tracking-wider shrink-0 uppercase">
            {lang === 'am' ? 'ማስታወቂያ' : 'ANNOUNCEMENT'}
          </span>
          <span className="truncate font-medium text-neutral-300">{message}</span>
        </div>

        <div className="flex items-center space-x-4 shrink-0">
          {banner.link_url && linkLabel && (
            <Link
              href={banner.link_url}
              className="underline hover:text-white font-semibold transition-colors"
            >
              {linkLabel}
            </Link>
          )}
          {banner.dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss announcement"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}