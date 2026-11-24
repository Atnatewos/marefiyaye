/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Skeleton
 * Path: apps/web/src/components/ui/Skeleton.jsx
 *
 * Purpose:
 *   Skeleton loader primitive. Renders pulsing grey blocks that mimic the
 *   shape of content while it loads. Used in route-level loading.jsx files
 *   and inline loading states.
 *
 * Variants:
 *   - text  : rounded-sm block sized to a line of text
 *   - card  : rounded-md block for a card thumbnail
 *   - avatar: circular block
 *   - bar   : short rounded block for inline placeholders
 *
 * Accessibility:
 *   Each Skeleton has aria-hidden="true". The parent loading container
 *   supplies a single aria-live="polite" region with a screen-reader label.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { cn } from '@/lib/utils.js';

/* ── Variant class maps ──────────────────────────────────────────────────── */

/**
 * Base + variant class combinations for each skeleton shape.
 * Widths / heights are intentionally generic — callers override via className.
 */
const VARIANTS = {
  text: 'h-4 rounded-sm',
  card: 'rounded-md',
  avatar: 'rounded-full aspect-square',
  bar: 'h-3 rounded-full',
};

/* ── Public component ────────────────────────────────────────────────────── */

/**
 * Renders a single skeleton block.
 *
 * @param {object} props
 * @param {'text'|'card'|'avatar'|'bar'} [props.variant='text']
 * @param {string} [props.className] — extra classes (e.g. w-24 h-8)
 * @returns {JSX.Element}
 */
export default function Skeleton({ variant = 'text', className }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-neutral-200 dark:bg-neutral-800',
        VARIANTS[variant] || VARIANTS.text,
        className
      )}
    />
  );
}

/* ── Compound skeletons ──────────────────────────────────────────────────── */

/**
 * A row of text-like skeleton lines. Common use: loading list items.
 *
 * @param {object} props
 * @param {number} [props.lines=3] — how many lines to render
 * @param {string} [props.className]
 * @returns {JSX.Element}
 */
export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse h-4 rounded-sm bg-neutral-200 dark:bg-neutral-800',
            /* Last line is 60% width, mimics natural paragraph flow */
            i === lines - 1 ? 'w-3/5' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

/**
 * A card-shaped skeleton (thumbnail + text rows).
 *
 * @param {object} props
 * @param {string} [props.className]
 * @returns {JSX.Element}
 */
export function SkeletonCard({ className }) {
  return (
    <div
      className={cn('rounded-lg border border-border bg-bg p-3 space-y-3', className)}
      aria-hidden="true"
    >
      <div className="animate-pulse aspect-[4/3] rounded-md bg-neutral-200 dark:bg-neutral-800" />
      <div className="space-y-2">
        <div className="animate-pulse h-4 w-2/3 rounded-sm bg-neutral-200 dark:bg-neutral-800" />
        <div className="animate-pulse h-3 w-full rounded-sm bg-neutral-200 dark:bg-neutral-800" />
        <div className="animate-pulse h-3 w-4/5 rounded-sm bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  );
}

/**
 * A grid of N SkeletonCard blocks. Used for listing grids while loading.
 *
 * @param {object} props
 * @param {number} [props.count=6]
 * @param {string} [props.className] — usually the grid classes
 * @returns {JSX.Element}
 */
export function SkeletonGrid({ count = 6, className }) {
  return (
    <div
      className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', className)}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}