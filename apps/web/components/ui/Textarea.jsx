/**
 * @file apps/web/components/ui/Textarea.jsx
 *
 * Textarea primitive.
 *
 * Why this component exists:
 *   - Long-form text needs a multiline field with the same accessibility
 *     and error/helper contract as `Input`.
 *   - Admin reject-reason forms and settings notes use this everywhere.
 *
 * Accessibility:
 *   - Label is linked via htmlFor/id.
 *   - aria-invalid, aria-describedby, aria-required set based on props.
 */

'use client';

import { forwardRef, useId } from 'react';
import { classNames } from '@/lib/classNames';
import styles from './Input.module.css';

/**
 * Textarea primitive (reuses Input.module.css for consistent visuals).
 *
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {string} [props.helperText]
 * @param {boolean} [props.required=false]
 * @param {number} [props.rows=4]
 * @param {string} [props.id]
 * @param {string} [props.className]
 */
export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    required = false,
    rows = 4,
    id: providedId,
    className = '',
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const hasError = Boolean(error);

  const ariaDescribedBy = hasError ? errorId : helperText ? helperId : undefined;

  return (
    <div className={classNames(styles.field, className)}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className={styles.inputWrapper}>
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={ariaDescribedBy}
          aria-required={required || undefined}
          className={classNames(styles.input, hasError && styles.inputError)}
          style={{ paddingTop: 'var(--space-3)', paddingBottom: 'var(--space-3)', resize: 'vertical' }}
          {...rest}
        />
      </div>

      {hasError && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}

      {!hasError && helperText && (
        <p id={helperId} className={styles.helper}>
          {helperText}
        </p>
      )}
    </div>
  );
});