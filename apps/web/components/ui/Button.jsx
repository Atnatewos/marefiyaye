/**
 * @file apps/web/components/ui/Button.jsx
 *
 * Button primitive.
 *
 * Why this component exists:
 *   - Every clickable action renders through this. Consistent styling,
 *     focus ring, loading state, and accessibility in one place.
 *   - Variants (primary, secondary, ghost, danger) map to brand language.
 *   - Sizes (sm, md, lg) match the reference prototype's usage.
 *
 * Accessibility:
 *   - `type="button"` default prevents accidental form submission.
 *   - `aria-busy` set when loading.
 *   - Native `disabled` attribute blocks clicks.
 *   - `focus-visible` outline uses brand color.
 */

'use client';

import { forwardRef } from 'react';
import { classNames } from '@/lib/classNames';
import styles from './Button.module.css';

/**
 * Loading spinner shown inside the button when `isLoading` is true.
 * Same color as the button text (currentColor).
 */
function ButtonSpinner() {
  return <span className={styles.spinner} aria-hidden="true" />;
}

/**
 * Button primitive.
 *
 * @param {object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.isLoading=false] - Shows spinner and disables the button.
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.fullWidth=false]
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 * @param {'button'|'submit'|'reset'} [props.type='button']
 * @param {string} [props.className] - Additional classes.
 * @param {React.ReactNode} props.children
 */
export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    fullWidth = false,
    leftIcon = null,
    rightIcon = null,
    type = 'button',
    className = '',
    children,
    ...rest
  },
  ref
) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={classNames(
        styles.button,
        styles[variant],
        styles[size],
        isLoading && styles.loading,
        fullWidth && styles.fullWidth,
        className
      )}
      {...rest}
    >
      {isLoading && <ButtonSpinner />}
      {!isLoading && leftIcon && (
        <span className={styles.iconLeft} aria-hidden="true">
          {leftIcon}
        </span>
      )}
      {children}
      {!isLoading && rightIcon && (
        <span className={styles.iconRight} aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
});