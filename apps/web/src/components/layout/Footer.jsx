/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Footer
 * Path: apps/web/src/components/layout/Footer.jsx
 *
 * Purpose:
 *   4-column footer matching the prototype. Reads contact info from config
 *   so admins can update support details without a deploy.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { useConfig } from '../../hooks/useConfig.js';
import { useI18n } from '../../hooks/useI18n.js';

export default function Footer() {
  const { get } = useConfig();
  const { t, lang } = useI18n();

  const appName = get('general.platform_name', 'MAREFIYAYE');
  const tagline = lang === 'am' ? get('general.tagline_am') : get('general.tagline_en');
  const supportPhone = get('general.support_phone');
  const supportEmail = get('general.support_email');

  return (
    <footer className="bg-neutral-50 dark:bg-neutral-900 border-t border-border mt-20 text-xs text-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-fg font-bold text-base">
            <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-white">
              <Home className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            <span>{appName}</span>
          </div>
          <p className="leading-relaxed">{tagline}</p>
        </div>

        <div>
          <h4 className="text-fg font-bold mb-3">{t('common.footer.neighborhoods')}</h4>
          <ul className="space-y-2">
            <li><Link href="/stays?location=Bole" className="hover:underline">{t('home.neighborhoods.bole')}</Link></li>
            <li><Link href="/stays?location=Kazanchis" className="hover:underline">{t('home.neighborhoods.kazanchis')}</Link></li>
            <li><Link href="/stays?location=Hawassa" className="hover:underline">{t('home.neighborhoods.hawassa')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-fg font-bold mb-3">Explore</h4>
          <ul className="space-y-2">
            <li><Link href="/stays?mode=short" className="hover:underline">{t('common.mode.short')}</Link></li>
            <li><Link href="/stays?mode=long" className="hover:underline">{t('common.mode.long')}</Link></li>
            <li><Link href="/host/register" className="hover:underline">{t('common.nav.host')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-fg font-bold mb-3">{t('common.footer.support')}</h4>
          <p>{t('common.footer.supportLine')}</p>
          {supportPhone && (
            <p className="font-bold text-fg mt-1">{supportPhone}</p>
          )}
          {supportEmail && (
            <p className="mt-1">{supportEmail}</p>
          )}
        </div>
      </div>

      <div className="border-t border-border py-6 text-center text-muted">
        © {new Date().getFullYear()} {appName}. {t('common.footer.rights')}.
      </div>
    </footer>
  );
}