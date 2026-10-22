/**
 * @file apps/web/components/layout/Navbar.jsx
 *
 * Site navigation bar.
 *
 * Why this component exists:
 *   - Every public page needs the same top navigation.
 *   - Decoupled from context — accepts state via props so the parent decides
 *     where currency, wishlist count, and auth live (Context providers land in P0-F).
 *
 * Usage:
 *   <Navbar
 *     onBrandClick={() => router.push('/')}
 *     currency="ETB"
 *     onCurrencyToggle={() => setCurrency(...)}
 *     wishlistCount={3}
 *     onWishlistClick={() => router.push('/dashboard/wishlist')}
 *     user={null}
 *     onLoginClick={() => router.push('/login')}
 *     onListPropertyClick={() => router.push('/dashboard/host/listings/new')}
 *   />
 */

'use client';

import Link from 'next/link';
import { classNames } from '@/lib/classNames';
import { BRAND } from '@marefiyaye/config/app';
import styles from './Navbar.module.css';

function CoinsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1110.34 18" />
      <path d="M7 6h1v4" />
      <path d="M16.71 13.88l.7.71-2.82 2.82" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

/**
 * Navbar component.
 *
 * @param {object} props
 * @param {string} [props.currency='ETB']
 * @param {() => void} [props.onCurrencyToggle]
 * @param {number} [props.wishlistCount=0]
 * @param {() => void} [props.onWishlistClick]
 * @param {object|null} [props.user]
 * @param {() => void} [props.onLoginClick]
 * @param {() => void} [props.onListPropertyClick]
 * @param {string} [props.className]
 */
export function Navbar({
  currency = 'ETB',
  onCurrencyToggle,
  wishlistCount = 0,
  onWishlistClick,
  user = null,
  onLoginClick,
  onListPropertyClick,
  className = '',
}) {
  return (
    <header className={classNames(styles.navbar, className)}>
      <div className={styles.inner}>
        {/* Brand */}
        <Link href="/" className={styles.brand} aria-label={`${BRAND.nameEn} home`}>
          <div className={styles.brandMark} aria-hidden="true">
            {BRAND.shortCode}
          </div>
          <div className={styles.brandText}>
            <div className={styles.brandName}>
              {BRAND.nameEn}
              <span className={styles.brandNameAm}>{BRAND.nameAm}</span>
            </div>
            <div className={styles.brandTagline}>{BRAND.taglineEn}</div>
          </div>
        </Link>

        {/* Right controls */}
        <div className={styles.controls}>
          {onCurrencyToggle && (
            <button
              type="button"
              onClick={onCurrencyToggle}
              className={styles.iconButton}
              aria-label={`Switch currency (current: ${currency})`}
              title={`Currency: ${currency}`}
            >
              <CoinsIcon />
            </button>
          )}

          {onWishlistClick && (
            <button
              type="button"
              onClick={onWishlistClick}
              className={styles.iconButton}
              aria-label={`Wishlist (${wishlistCount} items)`}
            >
              <HeartIcon />
              {wishlistCount > 0 && (
                <span className={styles.badge} aria-hidden="true">
                  {wishlistCount}
                </span>
              )}
            </button>
          )}

          {user ? (
            onListPropertyClick && (
              <button
                type="button"
                onClick={onListPropertyClick}
                className={styles.iconButton}
                aria-label="List your property"
              >
                <UserIcon />
              </button>
            )
          ) : (
            onLoginClick && (
              <button
                type="button"
                onClick={onLoginClick}
                className={styles.iconButton}
                aria-label="Sign in"
              >
                <UserIcon />
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
}