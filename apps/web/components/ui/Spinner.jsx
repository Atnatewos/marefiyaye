/**
 * @file apps/web/components/ui/Spinner.jsx
 *
 * Loading spinner primitive.
 *
 * Why this component exists:
 *   - Provides a consistent loading indicator across the entire app.
 *   - Used inline in buttons, full-screen during page loads, and within
 *     modals while submitting forms.
 *   - Zero JavaScript — pure CSS rotation.
 *
 * Accessibility:
 *   - `role="status"` tells screen readers this is a status indicator.
 *   - Visually hidden label text announced to assistive tech.
 *   - aria-hidden spinner (visual) paired with visible or sr-only text.
 */

import { classNames } from '@/lib/classNames';
import styles from './Spinner.module.css';

/**
 * Loading spinner primitive.
 *
 * @param {object} props
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {'primary'|'white'|'muted'} [props.color='primary']
 * @param {string} [props.label='Loading...'] - Screen reader announcement.
 * @param {boolean} [props.centered=false] - Centers spinner in its container.
 * @param {string} [props.className]
 */
export function Spinner({
  size = 'md',
  color = 'primary',
  label = 'Loading...',
  centered = false,
  className = '',
}) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={classNames(
        centered && styles.centered,
        className
      )}
      style={centered ? centeredStyle : undefined}
    >
      <span
        className={classNames(
          styles.spinner,
          styles[size],
          styles[color]
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/**
 * Inline style for centered mode.
 * Avoids a new CSS class for one simple positioning concern.
 */
const centeredStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-8)',
};