/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Avatar
 * Path: apps/web/src/components/ui/Avatar.jsx
 *
 * Purpose:
 *   User avatar. Shows image when available; otherwise initials on a
 *   deterministic color derived from the name (so the same user always gets
 *   the same color across the app).
 *
 * Sizes:
 *   xs (24) | sm (32) | md (40) | lg (48) | xl (64)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { cn } from '../../lib/utils.js';

const SIZE_MAP = {
  xs: { px: 24, text: 'text-[10px]' },
  sm: { px: 32, text: 'text-xs' },
  md: { px: 40, text: 'text-sm' },
  lg: { px: 48, text: 'text-base' },
  xl: { px: 64, text: 'text-lg' },
};

/* Deterministic palette — 6 hues, subtle but distinct */
const COLOR_PALETTE = [
  'bg-red-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-purple-500',
];

/**
 * @param {string} name
 * @returns {number} index into COLOR_PALETTE
 */
function colorFromName(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % COLOR_PALETTE.length;
}

/**
 * @param {string} name
 * @returns {string} 1 or 2 uppercase initials
 */
function initialsFromName(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({
  src = null,
  name = '',
  size = 'md',
  alt = '',
  className,
  ...rest
}) {
  const { px, text } = SIZE_MAP[size] || SIZE_MAP.md;
  const hasImage = !!src;
  const colorClass = COLOR_PALETTE[colorFromName(name)];

  if (hasImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        width={px}
        height={px}
        className={cn(
          'rounded-full object-cover bg-neutral-200 dark:bg-neutral-800 shrink-0',
          className
        )}
        style={{ width: px, height: px }}
        {...rest}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt || name || 'Avatar'}
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-white shrink-0',
        colorClass,
        text,
        className
      )}
      style={{ width: px, height: px }}
      {...rest}
    >
      {initialsFromName(name)}
    </div>
  );
}