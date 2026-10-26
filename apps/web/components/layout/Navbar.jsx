/**
 * @file apps/web/components/layout/Navbar.jsx
 *
 * Site navigation bar.
 *
 * Why this file exists:
 *   - One navbar renders on every public + dashboard page.
 *   - Self-contained: reads auth / currency / wishlist / search state directly
 *     from context. No prop wiring required by callers.
 *   - Three visual states based on the user:
 *       Guest → "Sign in" + "List Property" (guest gets redirect to login)
 *       Host  → Avatar dropdown with dashboard + logout
 *   - SECURITY: Admin access is strictly isolated to `/admin/*` routes and is
 *     NOT exposed in the public navbar.
 *
 * Layout:
 *   [Logo] | [Stay-Type Toggle] | [Currency] [Locale] [Wishlist] [User] [CTA]
 *
 * i18n: every visible string flows through `t()`.
 * Mobile: hamburger opens a slide-down drawer with all links.
 */
/**
 * @file apps/web/components/layout/Navbar.jsx
 *
 * Site navigation bar.
 *
 * i18n: keys use `common.*` prefix (from `messages/en/common.js`).
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useWishlist } from '@/context/WishlistContext';
import { useSearch } from '@/context/SearchContext';
import { useTranslation } from '@/lib/i18n/I18nProvider';

import { ROUTES, BRAND } from '@marefiyaye/config/app';
import { CURRENCY } from '@marefiyaye/config/integrations';
import { SUPPORTED_LOCALES } from '@marefiyaye/i18n';

import styles from './Navbar.module.css';

function CoinsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1110.34 18" />
      <path d="M7 6h1v4" />
      <path d="M16.71 13.88l.7.71-2.82 2.82" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const STAY_OPTIONS = [
  { key: 'SHORT_TERM', labelKey: 'common.nav.stayShort', icon: '🏨' },
  { key: 'LONG_TERM', labelKey: 'common.nav.stayLong', icon: '🔑' },
  { key: 'ALL', labelKey: 'common.nav.stayAll', icon: '·' },
];

function StayTypeToggle({ current, onChange, t }) {
  return (
    <div className={styles.stayToggle} role="tablist" aria-label="Stay type">
      {STAY_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          role="tab"
          aria-selected={current === opt.key}
          onClick={() => onChange(opt.key)}
          className={`${styles.stayOption} ${current === opt.key ? styles.stayOptionActive : ''}`}
        >
          <span aria-hidden="true">{opt.icon}</span>
          <span>{t(opt.labelKey)}</span>
        </button>
      ))}
    </div>
  );
}

function UserMenu({ user, onLogout, t }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.userMenuWrap}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={styles.avatarButton}
        aria-label={t('common.nav.account')}
        aria-expanded={open}
      >
        <span className={styles.avatarCircle}>
          {(user?.fullName || '?').charAt(0).toUpperCase()}
        </span>
      </button>

      {open && (
        <div className={styles.dropdown} onMouseLeave={() => setOpen(false)}>
          <div className={styles.dropdownHeader}>
            <div className={styles.dropdownName}>{user?.fullName}</div>
            <div className={styles.dropdownRole}>{user?.role}</div>
          </div>

          <Link href={ROUTES.DASHBOARD.ROOT} className={styles.dropdownItem} onClick={() => setOpen(false)}>
            {t('common.nav.dashboard')}
          </Link>

          {user?.role === 'HOST' && (
            <Link href={ROUTES.DASHBOARD.HOST_ROOT} className={styles.dropdownItem} onClick={() => setOpen(false)}>
              {t('common.nav.hostDashboard')}
            </Link>
          )}

          <button
            type="button"
            className={styles.dropdownItem}
            onClick={() => { setOpen(false); onLogout(); }}
          >
            {t('common.nav.logout')}
          </button>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const router = useRouter();
  const { t, locale, setLocale } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { currency, toggle: toggleCurrency } = useCurrency();
  const wishlist = useWishlist();
  const { filters, setStayType } = useSearch();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push(ROUTES.PUBLIC.HOME);
  };

  const handleListProperty = () => {
    if (!isAuthenticated) {
      router.push(`${ROUTES.AUTH.LOGIN}?redirect=${ROUTES.DASHBOARD.HOST_LISTING_NEW}`);
      return;
    }
    router.push(ROUTES.DASHBOARD.HOST_LISTING_NEW);
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link href={ROUTES.PUBLIC.HOME} className={styles.brand} aria-label={`${BRAND.nameEn} home`}>
          <span className={styles.brandMark} aria-hidden="true">{BRAND.shortCode}</span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>{BRAND.nameEn}</span>
            <span className={styles.brandTagline}>{BRAND.taglineEn}</span>
          </span>
        </Link>

        <div className={styles.center}>
          <StayTypeToggle current={filters.stayType} onChange={setStayType} t={t} />
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            onClick={toggleCurrency}
            className={styles.iconBtn}
            aria-label={t('common.nav.currency')}
            title={`${t('common.nav.currency')}: ${currency}`}
          >
            <CoinsIcon />
            <span className={styles.iconLabel}>
              {currency === 'ETB' ? CURRENCY.symbols.ETB : CURRENCY.symbols.USD}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setLocale(locale === 'en' ? 'am' : 'en')}
            className={styles.iconBtn}
            aria-label={t('common.nav.language')}
            title={SUPPORTED_LOCALES.map((l) => l.toUpperCase()).join(' / ')}
          >
            <GlobeIcon />
            <span className={styles.iconLabel}>{locale.toUpperCase()}</span>
          </button>

          <button
            type="button"
            onClick={() => router.push(ROUTES.DASHBOARD.WISHLIST)}
            className={styles.iconBtn}
            aria-label={t('common.nav.wishlist')}
          >
            <HeartIcon />
            {wishlist.count > 0 && (
              <span className={styles.badge}>{wishlist.count}</span>
            )}
          </button>

          <button
            type="button"
            onClick={handleListProperty}
            className={styles.ctaButton}
          >
            <PlusIcon />
            <span>{t('common.nav.listProperty')}</span>
          </button>

          {isAuthenticated ? (
            <UserMenu user={user} onLogout={handleLogout} t={t} />
          ) : (
            <Link href={ROUTES.AUTH.LOGIN} className={styles.signInBtn}>
              <UserIcon />
              <span>{t('common.nav.login')}</span>
            </Link>
          )}

          <button
            type="button"
            className={styles.mobileToggle}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? t('common.nav.closeMenu') : t('common.nav.openMenu')}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className={styles.mobileDrawer}>
          <div className={styles.mobileSection}>
            <StayTypeToggle
              current={filters.stayType}
              onChange={(v) => { setStayType(v); setMobileOpen(false); }}
              t={t}
            />
          </div>

          <Link href={ROUTES.PUBLIC.PROPERTIES} className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
            {t('common.nav.properties')}
          </Link>

          <Link href={ROUTES.DASHBOARD.WISHLIST} className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
            {t('common.nav.wishlist')} {wishlist.count > 0 ? `(${wishlist.count})` : ''}
          </Link>

          {isAuthenticated ? (
            <>
              <Link href={ROUTES.DASHBOARD.ROOT} className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                {t('common.nav.dashboard')}
              </Link>
              <button
                type="button"
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className={styles.mobileLink}
              >
                {t('common.nav.logout')}
              </button>
            </>
          ) : (
            <Link href={ROUTES.AUTH.LOGIN} className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
              {t('common.nav.login')}
            </Link>
          )}
        </div>
      )}
    </header>
  );
}