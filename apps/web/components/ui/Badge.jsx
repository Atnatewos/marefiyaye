/**
 * @file apps/web/components/ui/Badge.jsx
 *
 * Badge primitive.
 *
 * Why this component exists:
 *   - Every status indicator (paid, pending, verified, short-term, long-term)
 *     renders through this so styling stays consistent.
 *   - Variants map to semantic meanings — success = paid, warning = pending,
 *     danger = rejected, etc.
 *   - Optional icon supports visual emphasis.
 *
 * Usage:
 *   <Badge variant="success">Verified</Badge>
 *   <Badge variant="warning" icon={<ClockIcon />}>Pending</Badge>
 *   <Badge variant="brand" size="sm">SHORT_TERM</Badge>
 */

import { classNames } from '@/lib/classNames';
import styles from './Badge.module.css';

/**
 * Badge primitive.
 *
 * @param {object} props
 * @param {'default'|'success'|'warning'|'danger'|'info'|'brand'} [props.variant='default']
 * @param {'sm'|'md'} [props.size='md']
 * @param {React.ReactNode} [props.icon]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function Badge({
  variant = 'default',
  size = 'md',
  icon = null,
  className = '',
  children,
}) {
  return (
    <span
      className={classNames(
        styles.badge,
        styles[variant],
        styles[size],
        className
      )}
    >
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}