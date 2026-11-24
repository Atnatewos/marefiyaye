/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Badge
 * Path: apps/web/src/components/ui/Badge.jsx
 *
 * Purpose:
 *   Small inline status label. Used for status chips, listing verification
 *   tags, notification counts, category pills.
 *
 * Variants:
 *   default | brand | success | warning | danger | info | neutral
 *
 * Sizes:
 *   sm — 10px text, tight padding (pill inside card image)
 *   md — 12px text, default
 *
 * Usage:
 *   <Badge variant="success">Verified</Badge>
 *   <Badge variant="brand" size="sm">Hybrid Stay</Badge>
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { cn } from '../../lib/utils.js';

const VARIANT_STYLES = {
  default: 'bg-neutral-100 dark:bg-neutral-800 text-fg',
  brand: 'bg-brand-500 text-white',
  success: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200',
  warning: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200',
  danger: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200',
  info: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200',
  neutral: 'bg-neutral-200 dark:bg-neutral-700 text-fg',
};

const SIZE_STYLES = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

export default function Badge({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...rest
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-bold whitespace-nowrap',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}