/**
 * @file apps/web/components/layout/Footer.jsx
 *
 * Site footer.
 *
 * Why this component exists:
 *   - Brand attribution, payment method hints, and footer navigation.
 *   - Bilingual: English + Amharic attribution.
 */

import { BRAND, BRAND_COPY } from '@marefiyaye/config/app';
import { classNames } from '@/lib/classNames';
import styles from './Footer.module.css';

/**
 * Footer component.
 *
 * @param {object} props
 * @param {string} [props.className]
 */
export function Footer({ className = '' }) {
  return (
    <footer className={classNames(styles.footer, className)}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.brandMark} aria-hidden="true">
            {BRAND.shortCode}
          </div>
          <div className={styles.brandName}>
            {BRAND.nameEn} ({BRAND.nameAm}) Technologies
          </div>
        </div>

        <p className={styles.attribution}>
          {BRAND_COPY.footerAttributionEn}
        </p>

        <div className={styles.badges}>
          <span>CBE Local</span>
          <span>Telebirr Integrated</span>
          <span>Hybrid Housing</span>
        </div>
      </div>
    </footer>
  );
}