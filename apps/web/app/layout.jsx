/**
 * @file apps/web/app/layout.jsx
 *
 * Root layout — runs for every route.
 *
 * Why this file exists:
 *   - Loads design system CSS once.
 *   - Loads fonts via next/font.
 *   - Wraps the tree in `<I18nProvider>` (translations) and `<Providers>`
 *     (toasts, auth, currency, search, wishlist).
 *
 * Provider order:
 *   1. I18nProvider   — outermost so any provider below can use t()
 *   2. Providers      — everything else (needs translations available)
 */

import { Plus_Jakarta_Sans, Noto_Sans_Ethiopic } from 'next/font/google';
import { Providers } from './providers';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { BRAND } from '@marefiyaye/config/app';
import { DEFAULT_LOCALE } from '@marefiyaye/i18n';
import '@/styles/index.css';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans-override',
  display: 'swap',
});

const notoEthiopic = Noto_Sans_Ethiopic({
  subsets: ['ethiopic'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-eth-override',
  display: 'swap',
});

export const metadata = {
  title: `${BRAND.nameEn} — ${BRAND.taglineEn}`,
  description:
    "Ethiopia's first hybrid housing engine. Short-term stays, long-term rentals, and every stay in between.",
  icons: { icon: BRAND.faviconPath },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#b45309',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      className={`${plusJakarta.variable} ${notoEthiopic.variable}`}
    >
      <body>
        <I18nProvider initialLocale={DEFAULT_LOCALE}>
          <Providers>{children}</Providers>
        </I18nProvider>
      </body>
    </html>
  );
}