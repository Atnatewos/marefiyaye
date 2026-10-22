/**
 * @file apps/web/components/layout/Breadcrumbs.jsx
 *
 * Breadcrumb navigation.
 *
 * Why this component exists:
 *   - Detail pages, checkout, dashboards all need breadcrumbs.
 *   - Config-driven — page routes call `<Breadcrumbs items={[...]} />` with
 *     labels from `@marefiyaye/config/app/routes.js`.
 *   - The last item is not a link (it's the current page).
 *
 * Usage:
 *   <Breadcrumbs items={[
 *     { label: 'Properties', href: '/properties' },
 *     { label: property.title },  // current — no href
 *   ]} />
 */

import Link from 'next/link';
import { classNames } from '@/lib/classNames';
import styles from './Breadcrumbs.module.css';

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

/**
 * Breadcrumbs component.
 *
 * @param {object} props
 * @param {Array<{label: string, href?: string}>} props.items
 * @param {string} [props.className]
 */
export function Breadcrumbs({ items = [], className = '' }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={classNames(styles.nav, className)}>
      <ol style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0, listStyle: 'none', margin: 0, padding: 0 }}>
        <li className={styles.item}>
          <Link href="/" className={styles.link} aria-label="Home">
            <span className={styles.homeIcon} aria-hidden="true"><HomeIcon /></span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className={styles.item}>
              <span className={styles.separator} aria-hidden="true">/</span>
              {isLast || !item.href ? (
                <span className={styles.current} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}