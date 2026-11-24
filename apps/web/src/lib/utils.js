/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Utility Helpers
 * Path: apps/web/src/lib/utils.js
 *
 * Purpose:
 *   Shared frontend utility functions: class name composition, safe string
 *   handling, clipboard, debounce. All pure functions — no React, no DOM
 *   except explicit browser APIs.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Composes class names with Tailwind conflict resolution.
 *
 * Usage:
 *   cn('px-4 py-2', isActive && 'bg-brand-500', className)
 *   // Later classes win → `className` overrides default styles
 *
 * @param {...(string|object|false|null|undefined)} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Copies text to the clipboard with graceful fallback.
 * Returns true on success, false on failure.
 *
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  if (typeof window === 'undefined' || !navigator?.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Debounces a function. Returns a new function that only fires after
 * `wait` ms of silence.
 *
 * @template {(...args: any[]) => any} F
 * @param {F} fn
 * @param {number} wait
 * @returns {F}
 */
export function debounce(fn, wait = 300) {
  let timeoutId = null;
  return function debounced(...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Truncates a string, appending an ellipsis if shortened.
 *
 * @param {string} input
 * @param {number} [max=80]
 * @returns {string}
 */
export function truncate(input, max = 80) {
  if (typeof input !== 'string') return '';
  return input.length <= max ? input : `${input.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Returns a stable id from a string (for use as React keys or DOM anchors).
 * Not cryptographic — just deterministic.
 *
 * @param {string} input
 * @returns {string}
 */
export function stableId(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `id-${Math.abs(hash).toString(36)}`;
}