/**
 * @file apps/web/components/ui/Input.jsx
 *
 * Input field primitive.
 *
 * Why this component exists:
 *   - Every text, email, password, number, and date field renders through
 *     this. Consistent label, error, focus, and helper state in one place.
 *   - Support for leading/trailing icons (search magnifier, currency symbol).
 *   - Full accessibility: aria-invalid, aria-describedby, aria-required.
 *
 * Accessibility:
 *   - Label is linked via htmlFor/id.
 *   - When `error` is present: aria-invalid=true and aria-describedby points
 *     to the error element.
 *   - When `helperText` is present (and no error): aria-describedby points
 *     to the helper element.
 *   - The input auto-generates an id if none is provided.
 */

'use client';

import { forwardRef, useId } from 'react';
import { classNames } from '@/lib/classNames';
import styles from './Input.module.css';

/**
 * Input field primitive.
 *
 * @param {object} props
 * @param {string} [props.label] - Visible label above the input.
 * @param {string} [props.error] - Error message; puts input in error state.
 * @param {string} [props.helperText] - Helper text under the input.
 * @param {boolean} [props.required=false] - Shows asterisk in label, sets aria-required.
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 * @param {string} [props.id] - Overrides auto-generated id.
 * @param {string} [props.type='text']
 * @param {string} [props.className]
 */
export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    required = false,
    leftIcon = null,
    rightIcon = null,
    id: providedId,
    type = 'text',
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

  // aria-describedby points to whichever description exists (error takes priority).
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

      <div
        className={classNames(
          styles.inputWrapper,
          leftIcon && styles.hasLeftIcon,
          rightIcon && styles.hasRightIcon
        )}
      >
        {leftIcon && (
          <span className={styles.leftIcon} aria-hidden="true">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={id}
          type={type}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={ariaDescribedBy}
          aria-required={required || undefined}
          className={classNames(styles.input, hasError && styles.inputError)}
          {...rest}
        />

        {rightIcon && (
          <span className={styles.rightIcon} aria-hidden="true">
            {rightIcon}
          </span>
        )}
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