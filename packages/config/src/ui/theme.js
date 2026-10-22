/**
 * @file packages/config/src/ui/theme.js
 *
 * Design tokens in JS form, mirroring `packages/ui/tokens.css`.
 *
 * Why this file exists:
 *   - Components sometimes need color values in JS (charts, canvas, inline styles).
 *   - Defining them here keeps them in sync with tokens.css (edit both together).
 *   - Light/dark modes are declared side by side so themes can be audited.
 *
 * Contract: React components import from here, not from hex literals.
 * When you edit a value here, edit tokens.css to match — they must never drift.
 */

/**
 * Light theme tokens.
 * Names mirror the CSS custom-property names in tokens.css (without the `--`).
 */
export const LIGHT_THEME = Object.freeze({
  brand50: '#fffbf0',
  brand100: '#fef3c7',
  brand500: '#d97706',
  brand600: '#b45309',
  brand700: '#92400e',
  brand900: '#451a03',

  ethGreen: '#009b48',
  ethYellow: '#fffe00',
  ethRed: '#e52521',

  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate400: '#94a3b8',
  slate600: '#475569',
  slate800: '#1e293b',
  slate900: '#0f172a',

  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  textPrimary: '#0f172a',
  textMuted: '#475569',
  border: '#e2e8f0',
});

/**
 * Dark theme tokens. Mirrors the `[data-theme="dark"]` block in tokens.css.
 */
export const DARK_THEME = Object.freeze({
  brand50: '#1f1409',
  brand100: '#2e1d0a',
  brand500: '#f59e0b',
  brand600: '#fbbf24',
  brand700: '#fcd34d',
  brand900: '#fef3c7',

  ethGreen: '#22c55e',
  ethYellow: '#facc15',
  ethRed: '#ef4444',

  slate50: '#0b1220',
  slate100: '#111827',
  slate200: '#1f2937',
  slate400: '#6b7280',
  slate600: '#9ca3af',
  slate800: '#e5e7eb',
  slate900: '#f9fafb',

  surface: '#111827',
  surfaceMuted: '#0b1220',
  textPrimary: '#f9fafb',
  textMuted: '#9ca3af',
  border: '#1f2937',
});

/**
 * Default theme applied before the user has a preference cookie.
 */
export const DEFAULT_THEME = 'light';

/**
 * Returns the token object for a given theme name.
 * Falls back to the light theme for unknown values.
 */
export function getThemeTokens(themeName) {
  return themeName === 'dark' ? DARK_THEME : LIGHT_THEME;
}