/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — PostCSS Configuration
 * Path: apps/web/postcss.config.js
 *
 * Purpose:
 *   Standard Tailwind pipeline: Tailwind → Autoprefixer.
 *   No other PostCSS plugins are needed — everything else is handled by
 *   Next.js internally (nested CSS is already supported).
 * ─────────────────────────────────────────────────────────────────────────────
 */

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};