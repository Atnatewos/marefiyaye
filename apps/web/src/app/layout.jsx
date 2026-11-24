/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Root Layout
 * Path: apps/web/src/app/layout.jsx
 *
 * Purpose:
 *   Root providers only — no header, no footer. Those live in
 *   `app/(main)/layout.jsx` so the auth shell can render without app chrome.
 *
 *   Responsibilities:
 *     1. Load fonts once (Plus Jakarta Sans + Noto Sans Ethiopic)
 *     2. Preload i18n dictionaries so every Server Component below can
 *        call the synchronous `getTranslator()` immediately
 *     3. Fetch current user + public config server-side (no client flash)
 *     4. Wire all four contexts (Config, I18n, Auth, Toast)
 *
 *   Why preloadDictionaries here:
 *     Auth pages call `getTranslator()` in their Server Component render.
 *     That's synchronous. If dictionaries aren't loaded first, it throws.
 *     Root layout runs before any child segment, so preloading here makes
 *     the whole app safe for synchronous translation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Root Layout
 * Path: apps/web/src/app/layout.jsx
 *
 * Providers stack (outermost → innermost):
 *   ConfigProvider → I18nProvider → AuthProvider → ToastProvider → ConfirmProvider
 *
 *   ConfirmProvider is innermost so confirm() has access to every other
 *   context — including translations, toasts, and auth state.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { cookies } from 'next/headers';
import { Plus_Jakarta_Sans, Noto_Sans_Ethiopic } from 'next/font/google';
import './globals.css';

import { env } from '@/lib/env.js';
import { getCurrentUser } from '@/lib/auth-server.js';
import { I18nProvider } from '@/contexts/I18nContext.jsx';
import { ConfigProvider } from '@/contexts/ConfigContext.jsx';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { ToastProvider } from '@/contexts/ToastContext.jsx';
import { ConfirmProvider } from '@/contexts/ConfirmContext.jsx';
import {
  isSupportedLanguage,
  DEFAULT_LANGUAGE,
  preloadDictionaries,
} from '@marefiyaye/shared/i18n';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const notoEthiopic = Noto_Sans_Ethiopic({
  subsets: ['ethiopic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-ethiopic',
  display: 'swap',
});

export const metadata = {
  title: `${env.appName} (${env.appNameAm}) — Hybrid Rental Platform`,
  description:
    "Ethiopia's hybrid home rental marketplace for short daily stays and long monthly leases.",
};

async function resolveLang() {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get('mrf_lang')?.value;
  return isSupportedLanguage(cookieLang) ? cookieLang : DEFAULT_LANGUAGE;
}

async function fetchInitialConfig() {
  try {
    const res = await fetch(`${env.apiBaseUrl}/config/public`, { cache: 'no-store' });
    if (!res.ok) return {};
    const parsed = await res.json();
    return parsed?.data?.settings || {};
  } catch {
    return {};
  }
}

export default async function RootLayout({ children }) {
  await preloadDictionaries().catch((err) => {
    console.warn('[root-layout] i18n preload failed', err);
  });

  const [lang, userResult, settings] = await Promise.all([
    resolveLang(),
    getCurrentUser(),
    fetchInitialConfig(),
  ]);

  const { user, impersonatedBy } = userResult;

  return (
    <html
      lang={lang}
      className={`${plusJakarta.variable} ${notoEthiopic.variable}`}
      suppressHydrationWarning
    >
      <body
        className="font-sans bg-bg text-fg antialiased min-h-screen flex flex-col"
        suppressHydrationWarning
      >
        <ConfigProvider initialSettings={settings}>
          <I18nProvider initialLang={lang}>
            <AuthProvider initialUser={user} initialImpersonatedBy={impersonatedBy}>
              <ToastProvider>
                <ConfirmProvider>{children}</ConfirmProvider>
              </ToastProvider>
            </AuthProvider>
          </I18nProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}