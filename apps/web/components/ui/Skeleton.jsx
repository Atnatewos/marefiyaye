/**
 * @file apps/web/components/ui/Skeleton.jsx
 *
 * Skeleton loading primitives.
 *
 * Why this component exists:
 *   - Skeletons are the standard loading placeholder for content (not spinners).
 *   - Each variant (base, text, card, table row) matches the shape of the
 *     content it stands in for.
 *   - Used in Next.js `loading.jsx` files to auto-show while pages load.
 *
 * Usage:
 *   <Skeleton width="100%" height={200} />
 *   <SkeletonText lines={3} />
 *   <SkeletonCard />
 *   <SkeletonTableRow />
 */

import { classNames } from '@/lib/classNames';
import styles from './Skeleton.module.css';

/**
 * Base skeleton block.
 *
 * @param {object} props
 * @param {string|number} [props.width='100%']
 * @param {string|number} [props.height=16]
 * @param {string} [props.borderRadius]
 * @param {boolean} [props.circle=false]
 * @param {string} [props.className]
 */
export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius,
  circle = false,
  className = '',
}) {
  return (
    <div
      aria-hidden="true"
      className={classNames(
        styles.skeleton,
        circle && styles.circle,
        borderRadius && styles.rounded,
        className
      )}
      style={{
        width,
        height: circle ? undefined : height,
        borderRadius,
      }}
    />
  );
}

/**
 * Multi-line text skeleton.
 *
 * @param {object} props
 * @param {number} [props.lines=3] - Number of placeholder lines.
 * @param {string} [props.width='100%']
 * @param {string} [props.className]
 */
export function SkeletonText({ lines = 3, width = '100%', className = '' }) {
  // Last line is shorter to mimic natural paragraph ending
  return (
    <div
      aria-hidden="true"
      className={classNames(styles.textGroup, className)}
      style={{ width }}
    >
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={classNames(styles.skeleton, styles.textLine)}
          style={{ width: index === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

/**
 * Property card skeleton — matches PropertyCard dimensions.
 * Used in feed grids while properties load.
 */
export function SkeletonCard({ className = '' }) {
  return (
    <div aria-hidden="true" className={classNames(styles.card, className)}>
      <div className={classNames(styles.skeleton, styles.cardImage)} />
      <div className={styles.cardBody}>
        <div className={classNames(styles.skeleton, styles.cardTitle)} />
        <div className={classNames(styles.skeleton, styles.cardSubtitle)} />
        <div className={classNames(styles.skeleton, styles.cardSubtitle)} style={{ width: '40%' }} />
      </div>
    </div>
  );
}

/**
 * Table row skeleton.
 * Used in admin tables, bookings list, viewings list.
 */
export function SkeletonTableRow({ className = '' }) {
  return (
    <div aria-hidden="true" className={classNames(styles.tableRow, className)}>
      <div className={classNames(styles.skeleton, styles.tableCell)} />
      <div className={classNames(styles.skeleton, styles.tableCell)} />
      <div className={classNames(styles.skeleton, styles.tableCell)} />
      <div className={classNames(styles.skeleton, styles.tableCell)} />
    </div>
  );
}