/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Select
 * Path: apps/web/src/components/ui/Select.jsx
 *
 * Purpose:
 *   Native <select> wrapper for reliability + accessibility. Custom dropdowns
 *   will be a separate component (later in Sub-Step 1.2) for cases where the
 *   native control isn't flexible enough.
 *
 * Options format:
 *   <Select options={[{ value: 'bole', label: 'Bole' }, ...]} />
 *   or
 *   <Select>{<option>...</option>}</Select>
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils.js';

const Select = forwardRef(function Select(
  {
    label,
    error,
    helpText,
    placeholder,
    options = null,
    id: idProp,
    required = false,
    className,
    containerClassName,
    children,
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
        <select
          id={id}
          ref={ref}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={cn(
            'w-full h-11 rounded-md border bg-bg text-fg text-sm px-3 pr-10',
            'appearance-none cursor-pointer',
            'transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-border',
            'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-50 dark:disabled:bg-neutral-900',
            className
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
          aria-hidden="true"
        />
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

export default Select;