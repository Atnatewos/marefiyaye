/**
 * @file apps/web/components/admin/AdminSidebar.jsx
 *
 * Admin sidebar navigation.
 *
 * Why this component exists:
 *   - Admin panel has its own navigation, distinct from the guest dashboard.
 *   - Consumes ADMIN_NAV_SECTIONS from config so adding a section is one edit.
 *   - Highlights the active route based on `usePathname`.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_NAV_SECTIONS } from '@marefiyaye/config/admin';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { classNames } from '@/lib/classNames';
import styles from './AdminSidebar.module.css';

export function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.title}>{t('admin.nav.overview')}</span>
      </div>

      <nav className={styles.nav}>
        {ADMIN_NAV_SECTIONS.map((section) => (
          <div key={section.titleKey} className={styles.section}>
            <div className={styles.sectionTitle}>{t(section.titleKey)}</div>
            <ul className={styles.list}>
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={classNames(styles.link, isActive && styles.active)}
                    >
                      {t(item.labelKey)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}