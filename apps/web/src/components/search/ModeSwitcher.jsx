/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Mode Switcher
 * Path: apps/web/src/components/search/ModeSwitcher.jsx
 *
 * Purpose:
 *   Three-way toggle: All / Short-term / Long-term. URL-driven — changing
 *   mode pushes a new query string so links are shareable.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '../../hooks/useI18n.js';
import { cn } from '../../lib/utils.js';

const MODES = [
  { key: 'all',   i18n: 'common.mode.all' },
  { key: 'short', i18n: 'common.mode.short' },
  { key: 'long',  i18n: 'common.mode.long' },
];

export default function ModeSwitcher() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('mode') || 'all';

  const setMode = (mode) => {
    const params = new URLSearchParams(searchParams);
    if (mode === 'all') params.delete('mode');
    else params.set('mode', mode);
    const qs = params.toString();
    router.push(`/stays${qs ? `?${qs}` : ''}`);
  };

  return (
    <div
      role="tablist"
      className="hidden md:flex items-center space-x-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-full border border-border"
    >
      {MODES.map((m) => {
        const isActive = current === m.key;
        return (
          <button
            key={m.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setMode(m.key)}
            className={cn(
              'px-5 py-2 rounded-full text-xs font-semibold transition-colors',
              isActive
                ? 'bg-white dark:bg-neutral-700 text-fg shadow-sm'
                : 'text-muted hover:text-fg'
            )}
          >
            {t(m.i18n)}
          </button>
        );
      })}
    </div>
  );
}