/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Spinner
 * Path: apps/web/src/components/ui/Spinner.jsx
 *
 * Purpose:
 *   Loading indicator. Two variants:
 *     inline  — small, brand-colored, for buttons and inline use
 *     full    — centered, wraps a labeled loading state for full panels
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export default function Spinner({
  size = 'md',
  variant = 'inline',
  label = null,
  className,
}) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };
  const iconClass = sizeMap[size] || sizeMap.md;

  if (variant === 'full') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn('flex flex-col items-center justify-center py-12 gap-3', className)}
      >
        <Loader2 className={cn(iconClass, 'animate-spin text-brand-500')} aria-hidden="true" />
        {label && <p className="text-sm text-muted">{label}</p>}
        <span className="sr-only">{label || 'Loading'}</span>
      </div>
    );
  }

  return (
    <Loader2
      role="status"
      aria-label={label || 'Loading'}
      className={cn(iconClass, 'animate-spin text-brand-500', className)}
    />
  );
}