/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — FilterPills
 * Path: apps/web/src/components/search/FilterPills.jsx
 *
 * Purpose:
 *   Horizontal filter chips — Verified / Furnished / Wifi. URL-driven.
 *   Multiple filters can be active. "Reset" clears all.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ShieldCheck, Sofa, Wifi } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n.js';
import { cn } from '../../lib/utils.js';

const FILTERS = [
  { key: 'verified',  i18n: 'home.filter.verified',  icon: ShieldCheck },
  { key: 'furnished', i18n: 'home.filter.furnished', icon: Sofa },
  { key: 'wifi',      i18n: 'home.filter.wifi',      icon: Wifi },
];

export default function FilterPills() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const toggle = (key) => {
    const params = new URLSearchParams(searchParams);
    if (params.get(key) === 'true') params.delete(key);
    else params.set(key, 'true');
    router.push(`/stays${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const reset = () => router.push('/stays');

  const anyActive = FILTERS.some((f) => searchParams.get(f.key) === 'true');

  return (
    <div className="flex items-center space-x-3 overflow-x-auto scrollbar-hide pb-2">
      <button
        type="button"
        onClick={reset}
        className={cn(
          'px-4 py-2 rounded-full border text-xs font-bold transition-colors shrink-0',
          !anyActive
            ? 'border-fg bg-neutral-100 dark:bg-neutral-800'
            : 'border-border hover:border-fg'
        )}
      >
        <SlidersHorizontal className="w-3.5 h-3.5 inline mr-1.5" />
        {t('home.filter.all')}
      </button>

      {FILTERS.map((f) => {
        const Icon = f.icon;
        const active = searchParams.get(f.key) === 'true';
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => toggle(f.key)}
            aria-pressed={active}
            className={cn(
              'px-4 py-2 rounded-full border text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0',
              active
                ? 'border-fg bg-neutral-100 dark:bg-neutral-800'
                : 'border-border text-muted hover:border-fg hover:text-fg'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {t(f.i18n)}
          </button>
        );
      })}
    </div>
  );
}