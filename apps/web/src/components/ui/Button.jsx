/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Button
 * Path: apps/web/src/components/ui/Button.jsx
 *
 * Purpose:
 *   Primary action primitive. Polymorphic (renders <button> by default, <a>
 *   when `href` is provided), variant-aware, size-aware, supports loading
 *   and icon slots.
 *
 * Variants:
 *   primary   — brand background, white text (main CTAs)
 *   secondary — neutral surface, subtle border
 *   ghost     — transparent, hover fill only (icon buttons, nav)
 *   danger    — red destructive actions
 *   outline   — transparent with brand border
 *
 * Sizes:
 *   sm / md / lg — enforced min-heights for touch targets (≥44px on md/lg)
 *
 * Accessibility:
 *   - <button> default type="button" (prevents accidental form submit)
 *   - Loading state: aria-busy + disabled
 *   - Icon-only buttons require an `aria-label`
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';

/* ── Style maps ──────────────────────────────────────────────────────────── */

const VARIANTS = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 focus-visible:ring-brand-500',
  secondary:
    'bg-neutral-100 dark:bg-neutral-800 text-fg border border-border hover:bg-neutral-200 dark:hover:bg-neutral-700 focus-visible:ring-neutral-400',
  ghost:
    'bg-transparent text-fg hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:ring-neutral-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500',
  outline:
    'bg-transparent text-brand-500 border border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 focus-visible:ring-brand-500',
};

const SIZES = {
  sm: 'h-9 px-3 text-xs gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-14 px-8 text-base gap-2.5',
};

/* ── Component ───────────────────────────────────────────────────────────── */

const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    leftIcon: LeftIcon = null,
    rightIcon: RightIcon = null,
    fullWidth = false,
    href = null,
    type = 'button',
    className,
    children,
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;

  const classes = cn(
    /* Base */
    'inline-flex items-center justify-center font-bold rounded-md transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-offset-bg',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    /* Variant + size */
    VARIANTS[variant],
    SIZES[size],
    /* Optional full-width */
    fullWidth && 'w-full',
    className
  );

  const content = (
    <>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : (
        LeftIcon && <LeftIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
      )}
      {children}
      {!loading && RightIcon && <RightIcon className="w-4 h-4 shrink-0" aria-hidden="true" />}
    </>
  );

  /* Link variant — navigation, never triggers forms */
  if (href) {
    return (
      <Link
        href={href}
        ref={ref}
        className={classes}
        aria-disabled={isDisabled || undefined}
        {...rest}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={classes}
      {...rest}
    >
      {content}
    </button>
  );
});

export default Button;