/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Textarea
 * Path: apps/web/src/components/ui/Textarea.jsx
 *
 * Purpose:
 *   Multi-line text input. Same API as Input for label/error/help so forms
 *   stay consistent.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { forwardRef, useId } from 'react';
import { cn } from '../../lib/utils.js';

const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helpText,
    id: idProp,
    required = false,
    rows = 4,
    className,
    containerClassName,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const id = idProp || generatedId;
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const describedBy = error ? errorId : helpText ? helpId : undefined;

  return (
    <div className={cn('w-full space-y-1.5', containerClassName)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-bold text-fg">
          {label}
          {required && <span className="text-red-600 ml-0.5">*</span>}
        </label>
      )}

      <textarea
        id={id}
        ref={ref}
        rows={rows}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={cn(
          'w-full rounded-md border bg-bg text-fg text-sm px-3 py-2.5',
          'resize-y min-h-[88px]',
          'transition-colors',
          'placeholder:text-muted',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-border',
          'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-50 dark:disabled:bg-neutral-900',
          className
        )}
        {...rest}
      />

      {error && (
        <p id={errorId} className="text-xs font-semibold text-red-600">
          {error}
        </p>
      )}

      {!error && helpText && (
        <p id={helpId} className="text-xs text-muted">
          {helpText}
        </p>
      )}
    </div>
  );
});

export default Textarea;