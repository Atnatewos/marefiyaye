/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Switch
 * Path: apps/web/src/components/ui/Switch.jsx
 *
 * Purpose:
 *   Accessible toggle switch primitive. Used for boolean settings in the
 *   God Panel and anywhere a binary on/off control is needed.
 *
 * Accessibility:
 *   - role="switch" with aria-checked
 *   - Keyboard: Space or Enter toggles
 *   - Focus ring uses brand token
 *   - Disabled state prevents all interaction
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils.js';

/* ── Size tokens ─────────────────────────────────────────────────────────── */

const SIZES = {
  sm: {
    track: 'w-8 h-[18px]',
    thumb: 'w-[14px] h-[14px]',
    translate: 'translate-x-[14px]',
    pad: 'left-[2px]',
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'w-5 h-5',
    translate: 'translate-x-5',
    pad: 'left-[2px]',
  },
};

/* ── Component ───────────────────────────────────────────────────────────── */

/**
 * Controlled toggle switch.
 *
 * @param {object} props
 * @param {boolean} [props.checked=false]
 * @param {(next: boolean) => void} [props.onChange]
 * @param {boolean} [props.disabled=false]
 * @param {'sm'|'md'} [props.size='md']
 * @param {string} [props.label]     — optional visible label
 * @param {string} [props.description] — optional helper text under the label
 * @param {string} [props.className]
 * @param {string} [props.id]
 * @returns {JSX.Element}
 */
const Switch = forwardRef(function Switch(
  {
    checked = false,
    onChange,
    disabled = false,
    size = 'md',
    label = null,
    description = null,
    className,
    id,
    ...rest
  },
  ref
) {
  const s = SIZES[size] || SIZES.md;

  /**
   * Toggles the value if the control is interactive.
   */
  const handleToggle = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  /**
   * Handles Space / Enter to activate.
   * @param {React.KeyboardEvent<HTMLButtonElement>} e
   */
  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label
              htmlFor={id}
              className="block text-sm font-semibold text-fg cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-muted mt-0.5">{description}</p>
          )}
        </div>
      )}

      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative inline-flex shrink-0 items-center rounded-full transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          checked ? 'bg-brand-500' : 'bg-neutral-300 dark:bg-neutral-700',
          disabled && 'opacity-50 cursor-not-allowed',
          s.track
        )}
        {...rest}
      >
        <span
          className={cn(
            'inline-block rounded-full bg-white shadow-sm transform transition-transform',
            s.thumb,
            checked ? s.translate : 'translate-x-[2px]'
          )}
        />
      </button>
    </div>
  );
});

export default Switch;