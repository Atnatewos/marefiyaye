/**
 * @file apps/web/components/ui/EmptyState.jsx
 *
 * Empty state primitive.
 *
 * Why this component exists:
 *   - Not all loading ends with content. Wishlists empty, searches miss,
 *     dashboards have no bookings yet.
 *   - Every empty context needs a clear, actionable message — not a blank page.
 *   - Single component keeps the pattern consistent.
 *
 * Usage:
 *   <EmptyState
 *     icon={<HeartIcon />}
 *     title="No saved properties"
 *     description="Click the heart on any listing to save it here."
 *     actionLabel="Explore properties"
 *     onAction={() => router.push('/properties')}
 *   />
 */

'use client';

import { classNames } from '@/lib/classNames';
import { Button } from './Button';
import styles from './EmptyState.module.css';

/**
 * Empty state primitive.
 *
 * @param {object} props
 * @param {React.ReactNode} props.icon - Icon shown above the title.
 * @param {string} props.title - Short headline.
 * @param {string} [props.description] - Explanatory text.
 * @param {string} [props.actionLabel] - Label for the CTA button.
 * @param {() => void} [props.onAction] - Click handler for the CTA.
 * @param {React.ReactNode} [props.secondaryAction] - Optional second button.
 * @param {string} [props.className]
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryAction,
  className = '',
}) {
  return (
    <div className={classNames(styles.container, className)}>
      {icon && (
        <div className={styles.iconWrapper} aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {(actionLabel || secondaryAction) && (
        <div className={styles.action}>
          {actionLabel && onAction && (
            <Button onClick={onAction}>{actionLabel}</Button>
          )}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}