/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Grid
 * Path: apps/web/src/components/layout/Grid.jsx
 *
 * Purpose:
 *   Responsive grid primitive. Use `cols` to pick the responsive pattern.
 *
 * Presets:
 *   cards       — 1 → 2 → 3 (property listings)
 *   cards-wide  — 1 → 2 → 3 → 4 (admin dashboards)
 *   two-col     — 1 → 2 (form fields, forms)
 *   three-col   — 1 → 2 → 3 (feature blocks)
 *   four-col    — 1 → 2 → 4 (stats)
 *   sidebar     — 1 → 7/5 split (detail page: content + widget)
 *   custom      — pass className with your own grid classes
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { cn } from '../../lib/utils.js';

const PRESETS = {
  cards:      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8',
  'cards-wide': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
  'two-col':  'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6',
  'three-col': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
  'four-col': 'grid grid-cols-2 lg:grid-cols-4 gap-4',
  sidebar:    'grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12',
  custom:     '',
};

export default function Grid({
  cols = 'cards',
  className,
  children,
  as: Tag = 'div',
  ...rest
}) {
  return (
    <Tag className={cn(PRESETS[cols] || PRESETS.cards, className)} {...rest}>
      {children}
    </Tag>
  );
}