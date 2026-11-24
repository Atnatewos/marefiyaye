/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Config Context
 * Path: apps/web/src/contexts/ConfigContext.jsx
 *
 * Purpose:
 *   Holds the public config from GET /config/public. Provided server-side
 *   on first paint (no client flash). Provides:
 *     - settings            — { 'theme.primary_color': '#964B00', ... }
 *     - get(key, fallback)  — read any setting with type-safe fallback
 *     - features            — feature flags for conditional UI
 *     - refresh()           — re-fetch config (used after admin updates)
 *
 *   Also injects CSS variable overrides at runtime for theme changes.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api.js';

const ConfigContext = createContext(null);

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/**
 * Converts a hex color (#RRGGBB) to an RGB triplet string "R G B" usable
 * in `--color-*` CSS variables. Falls back to null if invalid.
 *
 * @param {string} hex
 * @returns {string|null}
 */
function hexToRgbTriplet(hex) {
  if (typeof hex !== 'string') return null;
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return `${parseInt(m[1], 16)} ${parseInt(m[2], 16)} ${parseInt(m[3], 16)}`;
}

/* ── Provider ────────────────────────────────────────────────────────────── */

export function ConfigProvider({ initialSettings = {}, children }) {
  const [settings, setSettings] = useState(initialSettings);

  /* Apply theme overrides from config on mount + whenever settings change */
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const primary = hexToRgbTriplet(settings['theme.primary_color']);
    const hover = hexToRgbTriplet(settings['theme.primary_hover_color']);
    const contrast = hexToRgbTriplet(settings['theme.primary_contrast_color']);

    if (primary) root.style.setProperty('--color-brand-500', primary);
    if (hover) root.style.setProperty('--color-brand-600', hover);
    if (contrast) root.style.setProperty('--color-brand-50', contrast);

    if (settings['theme.radius_sm']) root.style.setProperty('--radius-sm', settings['theme.radius_sm']);
    if (settings['theme.radius_md']) root.style.setProperty('--radius-md', settings['theme.radius_md']);
    if (settings['theme.radius_lg']) root.style.setProperty('--radius-lg', settings['theme.radius_lg']);
  }, [settings]);

  const get = useCallback(
    (key, fallback = null) => {
      const v = settings[key];
      return v !== undefined && v !== null ? v : fallback;
    },
    [settings]
  );

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/config/public');
      if (data?.settings) setSettings(data.settings);
    } catch {
      /* Silent — retain last known good config */
    }
  }, []);

  const value = useMemo(
    () => ({
      settings,
      get,
      features: {
        shortTermEnabled: settings['features.short_term_enabled'] !== false,
        longTermEnabled: settings['features.long_term_enabled'] !== false,
        favoritesEnabled: settings['features.favorites_enabled'] !== false,
        reviewsEnabled: settings['features.reviews_enabled'] !== false,
        hostRegistrationEnabled: settings['features.host_registration_enabled'] !== false,
        notificationsEnabled: settings['features.notifications_enabled'] !== false,
        broadcastsEnabled: settings['features.broadcast_enabled'] !== false,
        languageSwitcherEnabled: settings['features.language_switcher_enabled'] !== false,
        darkModeEnabled: settings['features.dark_mode_enabled'] !== false,
      },
      refresh,
    }),
    [settings, get, refresh]
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

/* ── Consumer hook ───────────────────────────────────────────────────────── */

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within <ConfigProvider>');
  return ctx;
}

export default ConfigContext;