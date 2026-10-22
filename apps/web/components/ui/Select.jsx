/**
 * @file apps/web/components/ui/Select.jsx
 *
 * Select dropdown primitive.
 *
 * Why this component exists:
 *   - Consistent label, error, focus state as `Input`.
 *   - Native `<select>` — no custom dropdown library, works everywhere.
 *   - Used in lease duration picker, viewing time slot picker, currency switcher.
 */

'use client';

import { forwardRef, useId } from 'react';

/**
 * Select primitive.
 *
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {boolean} [props.required=false]
 * @param {string} [props.id]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children - <option> elements
 */
export const Select = forwardRef(function Select(
  { label, error, required = false, id: providedId, className = '', children, ...rest },
  ref
) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const errorId = `${id}-error`;
  const hasError = Boolean(error);

  return (
    <div className={`mf-field ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', width: '100%' }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-wide)',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-danger)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        style={{
          width: '100%',
          padding: 'var(--space-3) var(--space-4)',
          fontFamily: 'inherit',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-primary)',
          background: 'var(--surface)',
          border: hasError ? '1px solid var(--color-danger)' : '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          cursor: 'pointer',
        }}
        {...rest}
      >
        {children}
      </select>
      {hasError && (
        <p id={errorId} role="alert" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger)', marginTop: 2 }}>
          {error}
        </p>
      )}
    </div>
  );
});