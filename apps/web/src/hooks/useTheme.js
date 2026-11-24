/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — useTheme Hook
 * Path: apps/web/src/hooks/useTheme.js
 *
 * Purpose:
 *   Manages dark mode. Reads initial theme from localStorage → system
 *   preference → light. Persists user choice. Applies/removes the `.dark`
 *   class on <html> (which activates token overrides in tokens.css).
 *
 *   API:
 *     const { theme, setTheme, toggleTheme, isDark, mounted } = useTheme();
 *
 *   `mounted` is false during SSR and on first render — use it to avoid
 *   hydration mismatch when rendering theme-dependent UI (e.g. icon).
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'mrf_theme'; // 'light' | 'dark' | 'system'

/**
 * @returns {'light'|'dark'} resolved theme
 */
function resolveTheme(pref) {
  if (typeof window === 'undefined') return 'light';
  if (pref === 'light' || pref === 'dark') return pref;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [pref, setPref] = useState(() => {
    if (typeof window === 'undefined') return 'system';
    return localStorage.getItem(STORAGE_KEY) || 'system';
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolved = mounted ? resolveTheme(pref) : 'light';
  const isDark = resolved === 'dark';

  /* Apply to <html> */
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (resolved === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [resolved, mounted]);

  /* Follow system changes when pref='system' */
  useEffect(() => {
    if (!mounted || pref !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const next = media.matches ? 'dark' : 'light';
      if (next === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [pref, mounted]);

  const setTheme = useCallback((next) => {
    setPref(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setPref((prev) => {
      const currentResolved = resolveTheme(prev);
      const next = currentResolved === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, next);
      }
      return next;
    });
  }, []);

  return { theme: pref, setTheme, toggleTheme, isDark, mounted };
}

export default useTheme;