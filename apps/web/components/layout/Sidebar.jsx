/**
 * @file apps/web/components/layout/Sidebar.jsx
 *
 * Dashboard sidebar navigation.
 *
 * Why this component exists:
 *   - Guest, host, and admin dashboards all render the same vertical nav.
 *   - Items come from props so each dashboard defines its own list without
 *     duplicating the sidebar layout.
 *
 * Usage:
 *   <Sidebar
 *     activePath="/dashboard/trips"
 *     sections={[
 *       {
 *         title: 'Guest',
 *         items: [
 *           { label: 'My Trips', href: '/dashboard/trips', icon: <PlaneIcon /> },
 *           { label: 'Wishlist', href: '/dashboard/wishlist', icon: <HeartIcon />, badge: 3 },
 *         ],
 *       },
 *     ]}
 *   />
 */

'use client';

import Link from 'next/link';
import { classNames } from '@/lib/classNames';
import styles from './Sidebar.module.css';

/**
 * Sidebar component.
 *
 * @param {object} props
 * @param {string} props.activePath - Current pathname for active highlighting.
 * @param {Array<{title?: string, items: Array<{label: string, href: string, icon?: React.ReactNode, badge?: number}>}>} props.sections
 * @param {string} [props.className]
 */
export function Sidebar({ activePath = '', sections = [], className = '' }) {
  return (
    <aside className={classNames(styles.sidebar, className)}>
      <nav className={styles.nav}>
        {sections.map((section, sIndex) => (
          <div key={section.title || sIndex} className={sIndex > 0 ? styles.section : undefined}>
            {section.title && (
              <div className={styles.sectionTitle}>{section.title}</div>
            )}
            {section.items.map((item) => {
              const isActive = activePath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={classNames(styles.item, isActive && styles.itemActive)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.icon && (
                    <span className={styles.icon} aria-hidden="true">{item.icon}</span>
                  )}
                  <span className={styles.label}>{item.label}</span>
                  {item.badge > 0 && (
                    <span className={styles.badge}>{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}