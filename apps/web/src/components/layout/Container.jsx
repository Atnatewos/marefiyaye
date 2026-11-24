/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Container
 * Path: apps/web/src/components/layout/Container.jsx
 *
 * Purpose:
 *   Centered page container with responsive gutters. Every section uses this
 *   instead of ad-hoc `max-w-* mx-auto px-*`.
 *
 * Sizes:
 *   narrow  — reading width (640px)
 *   default — standard content (1280px)
 *   wide    — dashboards (1536px)
 *   full    — no max-width
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { cn } from '../../lib/utils.js';

const SIZE_CLASSES = {
  narrow: 'max-w-[var(--content-narrow)]',
  default: 'max-w-[var(--content-max)]',
  wide: 'max-w-[var(--content-wide)]',
  full: 'max-w-none',
};

export default function Container({
  size = 'default',
  className,
  children,
  as: Tag = 'div',
  ...rest
}) {
  return (
    <Tag
      className={cn(
        'w-full mx-auto',
        'px-[var(--gutter-mobile)] sm:px-[var(--gutter-tablet)] lg:px-[var(--gutter-desktop)]',
        SIZE_CLASSES[size],
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}