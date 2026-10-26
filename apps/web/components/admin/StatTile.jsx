/**
 * @file apps/web/components/admin/StatTile.jsx
 *
 * Reusable KPI card for the admin dashboard.
 *
 * Why this component exists:
 *   - Every admin landing page needs a compact metric tile.
 *   - One component keeps colour, spacing, and typography consistent.
 */

'use client';

import Link from 'next/link';
import { classNames } from '@/lib/classNames';
import styles from './StatTile.module.css';

/**
 * @param {object} props
 * @param {string} props.label       - Human-readable KPI name (e.g. "Pending Payments")
 * @param {string|number} props.value - Numeric value
 * @param {string} [props.href]       - Optional link destination
 * @param {'default'|'warning'|'success'|'danger'|'info'|'brand'} [props.accent='default']
 * @param {string} [props.viewLabel]  - Text on the bottom link (defaults "View →")
 */
export function StatTile({ label, value, href, accent = 'default', viewLabel }) {
  const content = (
    <>
      <div className={styles.label}>{label}</div>
      <div className={classNames(styles.value, styles[accent])}>{value}</div>
      {viewLabel && <div className={styles.view}>{viewLabel}</div>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={styles.tile}>
        {content}
      </Link>
    );
  }

  return <div className={styles.tile}>{content}</div>;
}