/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Theme Toggle
 * Path: apps/web/src/components/layout/ThemeToggle.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.js';
import { Button } from '../ui';

export default function ThemeToggle() {
  const { isDark, toggleTheme, mounted } = useTheme();

  /* Render nothing until mounted — prevents SSR/client icon mismatch */
  if (!mounted) {
    return (
      <div
        className="w-10 h-10 rounded-full"
        aria-hidden="true"
      />
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-10 h-10 p-0 rounded-full"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  );
}