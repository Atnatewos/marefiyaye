/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Header (Responsive)
 * Path: apps/web/src/components/layout/Header.jsx
 *
 * Purpose:
 *   Responsive header.
 *     - Desktop (md+): logo | nav | controls
 *     - Mobile: logo | compact controls (icons only)
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Home } from 'lucide-react';
import { useConfig } from '../../hooks/useConfig.js';
import { useI18n } from '../../hooks/useI18n.js';
import { useAuth } from '../../hooks/useAuth.js';
import { cn } from '../../lib/utils.js';
import Container from './Container.jsx';
import LangSwitcher from './LangSwitcher.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import NotificationsDropdown from './NotificationsDropdown.jsx';
import ProfileMenu from './ProfileMenu.jsx';

export default function Header() {
  const { get } = useConfig();
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  const appName = get('general.platform_name', 'MAREFIYAYE');
  const appNameAm = get('general.platform_name_am', 'ማረፊያዬ');

  return (
    <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur-md border-b border-border">
      <Container>
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-brand-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Home className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-xl font-extrabold tracking-tight text-brand-500 leading-tight">
                {appName}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-muted tracking-wider -mt-0.5 font-ethiopic">
                {appNameAm}
              </span>
            </div>
          </Link>

          {/* Center nav — desktop only */}
          <nav
            aria-label="Primary"
            className="hidden lg:flex items-center space-x-1 text-sm font-semibold"
          >
            <NavPill href="/stays" active={pathname?.startsWith('/stays')}>
              {t('common.nav.explore')}
            </NavPill>
            <NavPill href="/host" active={pathname?.startsWith('/host')}>
              {t('common.nav.host')}
            </NavPill>
          </nav>

          {/* Right controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            <div className="hidden md:block">
              <LangSwitcher />
            </div>

            <Link
              href="/saved"
              aria-label={t('common.nav.saved')}
              className="w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {isAuthenticated && <NotificationsDropdown />}

            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <ProfileMenu />
          </div>
        </div>
      </Container>
    </header>
  );
}

function NavPill({ href, active, children }) {
  return (
    <Link
      href={href}
      className={cn(
        'px-4 py-2 rounded-full transition-colors',
        active
          ? 'bg-neutral-100 dark:bg-neutral-800 text-fg'
          : 'text-muted hover:text-fg hover:bg-neutral-100 dark:hover:bg-neutral-800'
      )}
    >
      {children}
    </Link>
  );
}