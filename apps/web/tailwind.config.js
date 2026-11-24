/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Tailwind Configuration
 * Path: apps/web/tailwind.config.js
 *
 * Purpose:
 *   Wires Tailwind utilities to design tokens declared in
 *   `src/styles/tokens.css`. No hardcoded colors, radii, shadows or fonts
 *   appear here — everything resolves through CSS custom properties so the
 *   admin panel can re-theme the entire site at runtime.
 *
 *   The `rgb(var(--color-*) / <alpha-value>)` pattern is the correct way to
 *   support Tailwind's alpha modifiers (e.g. `bg-brand-500/50`) while the
 *   source of truth stays a CSS variable.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',

  content: [
    './src/app/**/*.{js,jsx,mdx}',
    './src/components/**/*.{js,jsx,mdx}',
    './src/contexts/**/*.{js,jsx,mdx}',
  ],

  theme: {
    extend: {
      /* ── Brand palette ── */
      colors: {
        brand: {
          50:  'rgb(var(--color-brand-50)  / <alpha-value>)',
          100: 'rgb(var(--color-brand-100) / <alpha-value>)',
          500: 'rgb(var(--color-brand-500) / <alpha-value>)',
          600: 'rgb(var(--color-brand-600) / <alpha-value>)',
          700: 'rgb(var(--color-brand-700) / <alpha-value>)',
        },

        /* ── Neutral scale ── */
        neutral: {
          50:  'rgb(var(--color-neutral-50)  / <alpha-value>)',
          100: 'rgb(var(--color-neutral-100) / <alpha-value>)',
          200: 'rgb(var(--color-neutral-200) / <alpha-value>)',
          300: 'rgb(var(--color-neutral-300) / <alpha-value>)',
          400: 'rgb(var(--color-neutral-400) / <alpha-value>)',
          500: 'rgb(var(--color-neutral-500) / <alpha-value>)',
          600: 'rgb(var(--color-neutral-600) / <alpha-value>)',
          700: 'rgb(var(--color-neutral-700) / <alpha-value>)',
          800: 'rgb(var(--color-neutral-800) / <alpha-value>)',
          850: 'rgb(var(--color-neutral-850) / <alpha-value>)',
          900: 'rgb(var(--color-neutral-900) / <alpha-value>)',
        },

        /* ── Semantic colors (dark mode aware) ── */
        bg:     'rgb(var(--color-bg)     / <alpha-value>)',
        fg:     'rgb(var(--color-fg)     / <alpha-value>)',
        muted:  'rgb(var(--color-muted)  / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        ring:   'rgb(var(--color-ring)   / <alpha-value>)',
      },

      /* ── Radii ── */
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
      },

      /* ── Shadows ── */
      boxShadow: {
        card:   'var(--shadow-card)',
        search: 'var(--shadow-search)',
        modal:  'var(--shadow-modal)',
      },

      /* ── Motion ── */
      transitionTimingFunction: {
        out: 'var(--ease-out)',
      },

      /* ── Fonts ── */
      fontFamily: {
        sans:     'var(--font-sans)',
        ethiopic: 'var(--font-ethiopic)',
      },
    },
  },

  plugins: [],
};