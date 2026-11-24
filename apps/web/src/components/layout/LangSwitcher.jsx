/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Language Switcher
 * Path: apps/web/src/components/layout/LangSwitcher.jsx
 *
 * Purpose:
 *   Compact EN / አማ pill that matches the prototype's dual-language control.
 *   Reads supported languages from the shared i18n registry — adding Oromo
 *   or Tigrinya later requires zero changes here.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useI18n } from '../../hooks/useI18n.js';
import { useConfig } from '../../hooks/useConfig.js';
import { cn } from '../../lib/utils.js';

export default function LangSwitcher() {
  const { lang, setLang, availableLangs } = useI18n();
  const { features } = useConfig();

  if (!features.languageSwitcherEnabled) return null;

  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center border border-border rounded-full p-1 bg-neutral-50 dark:bg-neutral-900 text-xs font-semibold"
    >
      {availableLangs.map((l) => {
        const isActive = lang === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            aria-pressed={isActive}
            className={cn(
              'px-2.5 py-1 rounded-full transition-colors',
              isActive
                ? 'bg-white dark:bg-neutral-700 text-fg shadow-sm'
                : 'text-muted hover:text-fg'
            )}
          >
            {l.code === 'am' ? 'አማ' : l.code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}