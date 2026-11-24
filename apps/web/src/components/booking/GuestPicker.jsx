/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — GuestPicker
 * Path: apps/web/src/components/booking/GuestPicker.jsx
 *
 * Purpose:
 *   Airbnb-style inline guest counter. Stays open while adjusting — closes
 *   only when the parent decides (via Done button or outside click).
 *
 *   Props:
 *     value     — { adults, children, infants }
 *     onChange  — (nextValue) => void
 *     onDone    — () => void
 *     maxGuests — number (adults + children must stay ≤ this)
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useI18n } from '../../hooks/useI18n.js';
import { cn } from '../../lib/utils.js';

function Counter({ label, hint, value, min = 0, max = 20, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-bold text-fg">{label}</p>
        <p className="text-xs text-muted mt-0.5">{hint}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={disabled || value <= min}
          className={cn(
            'w-8 h-8 rounded-full border flex items-center justify-center text-base font-bold',
            'border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400',
            'hover:border-neutral-800 dark:hover:border-neutral-200 hover:text-neutral-800 dark:hover:text-neutral-200',
            'transition-colors',
            'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-neutral-300 disabled:hover:text-neutral-500'
          )}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-bold text-fg">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={disabled || value >= max}
          className={cn(
            'w-8 h-8 rounded-full border flex items-center justify-center text-base font-bold',
            'border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400',
            'hover:border-neutral-800 dark:hover:border-neutral-200 hover:text-neutral-800 dark:hover:text-neutral-200',
            'transition-colors',
            'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-neutral-300 disabled:hover:text-neutral-500'
          )}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function GuestPicker({ value, onChange, onDone, maxGuests = 10 }) {
  const { t } = useI18n();
  const guests = value || { adults: 1, children: 0, infants: 0 };

  const set = (key, v) => onChange({ ...guests, [key]: v });

  const adultsPlusChildren = guests.adults + guests.children;
  const reachedCapacity = adultsPlusChildren >= maxGuests;

  return (
    <div className="p-4">
      <Counter
        label={t('booking.guest.adults')}
        hint={t('booking.guest.adultsHint')}
        value={guests.adults}
        min={1}
        max={maxGuests}
        onChange={(v) => set('adults', v)}
        disabled={reachedCapacity && guests.adults < maxGuests}
      />
      <Counter
        label={t('booking.guest.children')}
        hint={t('booking.guest.childrenHint')}
        value={guests.children}
        min={0}
        max={maxGuests}
        onChange={(v) => set('children', v)}
        disabled={reachedCapacity && guests.children < maxGuests}
      />
      <Counter
        label={t('booking.guest.infants')}
        hint={t('booking.guest.infantsHint')}
        value={guests.infants}
        min={0}
        max={5}
        onChange={(v) => set('infants', v)}
      />

      {reachedCapacity && (
        <p className="text-xs text-muted mt-3">
          This place has a maximum of {maxGuests} guests, not including infants.
        </p>
      )}

      <div className="pt-3 text-right">
        <button
          type="button"
          onClick={onDone}
          className="text-sm font-bold text-fg underline hover:text-brand-500 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}