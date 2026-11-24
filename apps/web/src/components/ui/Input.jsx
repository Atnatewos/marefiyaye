/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Input (Focus-Safe)
 * Path: apps/web/src/components/ui/Input.jsx
 *
 * Purpose:
 *   Controlled text input with label, error, help text, and optional
 *   left/right icons.
 *
 * Focus stability rules:
 *   - The `id` is generated once per instance via useId()
 *   - The `value` prop is passed unchanged to the native input
 *   - The `onChange` handler is called with the native event
 *   - NEVER compute value or id from a function call on every render
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils.js';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helpText,
    leftIcon: LeftIcon = null,
    rightIcon: RightIcon = null,
    id: idProp,
    required = false,
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

      <div className="relative">
        {LeftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
            <LeftIcon className="w-4 h-4" aria-hidden="true" />
          </div>
        )}

        <input
          id={id}
          ref={ref}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={cn(
            'w-full h-11 rounded-md border bg-bg text-fg',
            'text-sm px-3',
            'transition-colors',
            'placeholder:text-muted',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
            LeftIcon && 'pl-10',
            RightIcon && 'pr-10',
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-border',
            'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-50 dark:disabled:bg-neutral-900',
            className
          )}
          {...rest}
        />

        {RightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
            <RightIcon className="w-4 h-4" aria-hidden="true" />
          </div>
        )}
      </div>

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

export default Input;