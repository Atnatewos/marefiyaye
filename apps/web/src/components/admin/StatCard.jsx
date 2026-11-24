/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — StatCard
 * Path: apps/web/src/components/admin/StatCard.jsx
 *
 * Purpose:
 *   Reusable metric card used on the admin overview. Shows a big number,
 *   a label, an icon, and an optional delta / trend indicator.
 *
 *   Props:
 *     label       — string  (already translated)
 *     value       — string|number
 *     icon        — lucide component
 *     accent      — 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
 *     hint        — optional subtitle (small, muted)
 *     onClick     — optional click handler (makes card interactive)
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — StatCard
 * Path: apps/web/src/components/admin/StatCard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { cn } from '@/lib/utils.js';

const ACCENT_STYLES = {
  brand: { bg: 'bg-brand-100 dark:bg-brand-500/20', fg: 'text-brand-600 dark:text-brand-400' },
  success: { bg: 'bg-emerald-100 dark:bg-emerald-950/50', fg: 'text-emerald-600 dark:text-emerald-400' },
  warning: { bg: 'bg-amber-100 dark:bg-amber-950/50', fg: 'text-amber-600 dark:text-amber-400' },
  danger: { bg: 'bg-red-100 dark:bg-red-950/50', fg: 'text-red-600 dark:text-red-400' },
  info: { bg: 'bg-blue-100 dark:bg-blue-950/50', fg: 'text-blue-600 dark:text-blue-400' },
  neutral: { bg: 'bg-neutral-200 dark:bg-neutral-800', fg: 'text-neutral-700 dark:text-neutral-300' },
};

export default function StatCard({ label, value, icon: Icon, accent = 'neutral', hint = null, onClick = null }) {
  const styles = ACCENT_STYLES[accent] || ACCENT_STYLES.neutral;
  const interactive = typeof onClick === 'function';

  const content = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-muted truncate">{label}</p>
        <p className="text-2xl sm:text-3xl font-extrabold text-fg mt-1">{value}</p>
        {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
      </div>
      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', styles.bg)}>
        <Icon className={cn('w-5 h-5', styles.fg)} aria-hidden="true" />
      </div>
    </div>
  );

  if (interactive) {
    return (
      <button type="button" onClick={onClick} className="w-full text-left p-4 rounded-lg border border-border bg-bg hover:shadow-card hover:-translate-y-0.5 transition-all">
        {content}
      </button>
    );
  }

  return <div className="p-4 rounded-lg border border-border bg-bg">{content}</div>;
}