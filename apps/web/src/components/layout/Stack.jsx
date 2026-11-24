/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Stack
 * Path: apps/web/src/components/layout/Stack.jsx
 *
 * Purpose:
 *   Vertical spacing primitive. Eliminates ad-hoc `space-y-*` sprawl across
 *   components. Uses tokens so section gaps stay consistent site-wide.
 *
 * Sizes:
 *   xs  — 8px   (tight icon rows)
 *   sm  — 12px  (form fields)
 *   md  — 16px  (default)
 *   lg  — 24px  (sections)
 *   xl  — 32px  (major sections)
 *   hero — clamp (responsive section gap)
 *
 * Directions:
 *   vertical   — column (default)
 *   horizontal — row
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { cn } from '../../lib/utils.js';

const SPACE = {
  xs:   'space-y-2',
  sm:   'space-y-3',
  md:   'space-y-4',
  lg:   'space-y-6',
  xl:   'space-y-8',
  hero: 'space-y-[var(--section-gap-mobile)] sm:space-y-[var(--section-gap-tablet)] lg:space-y-[var(--section-gap-desktop)]',
};

export default function Stack({
  size = 'md',
  direction = 'vertical',
  className,
  children,
  ...rest
}) {
  if (direction === 'horizontal') {
    return (
      <div className={cn('flex items-center gap-3', className)} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn(SPACE[size] || SPACE.md, className)} {...rest}>
      {children}
    </div>
  );
}