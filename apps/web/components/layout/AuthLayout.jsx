/**
 * @file apps/web/components/layout/AuthLayout.jsx
 *
 * Split-screen layout for authentication pages (Login / Register).
 *
 * Why this file exists:
 *   - Keeps the branding visual identical across auth flows.
 *   - Steps indicator on the left, form on the right.
 *   - Responsive: stacks to single column on mobile.
 */

/**
 * @file apps/web/components/layout/AuthLayout.jsx
 *
 * Split-screen layout for auth pages.
 * i18n: register.* keys now prefixed with `auth.`.
 */

'use client';

import Link from 'next/link';
import { BRAND } from '@marefiyaye/config/app';
import { ROUTES } from '@marefiyaye/config/app';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import styles from './AuthLayout.module.css';

export function AuthLayout({ children, step = 1 }) {
  const { t } = useTranslation();

  const steps = [
    { num: 1, label: t('auth.register.title'), active: step === 1 },
    { num: 2, label: t('auth.register.nameLabel'), active: step === 2 },
    { num: 3, label: t('auth.register.phoneLabel'), active: step === 3 },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.brandWrap}>
          <Link href={ROUTES.PUBLIC.HOME} className={styles.brandLink}>
            <span className={styles.brandMark}>{BRAND.shortCode}</span>
            <span className={styles.brandName}>{BRAND.nameEn}</span>
          </Link>
        </div>

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{t('property.home.hero.title')}</h1>
          <p className={styles.heroSubtitle}>{t('property.home.hero.subtitle')}</p>

          <div className={styles.stepsContainer}>
            {steps.map((s) => (
              <div key={s.num} className={`${styles.stepItem} ${s.active ? styles.stepActive : ''}`}>
                <span className={styles.stepNum}>{s.num}</span>
                <span className={styles.stepLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formWrapper}>{children}</div>
      </div>
    </div>
  );
}