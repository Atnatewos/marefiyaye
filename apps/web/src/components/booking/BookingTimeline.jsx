/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — BookingTimeline
 * Path: apps/web/src/components/booking/BookingTimeline.jsx
 *
 * Purpose:
 *   Visual state machine for a booking. Shows progress from
 *   pending_payment → payment_review → confirmed → completed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { Check, Clock, X } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n.js';

const STEPS = [
  { key: 'created', i18n: 'bookings.timeline.created' },
  { key: 'payment', i18n: 'bookings.timeline.payment' },
  { key: 'confirmed', i18n: 'bookings.timeline.confirmed' },
  { key: 'completed', i18n: 'bookings.timeline.completed' },
];

function stepState(status, stepKey) {
  if (status === 'cancelled' || status === 'refunded') {
    if (stepKey === 'created') return 'done';
    if (stepKey === 'payment') return 'cancelled';
    return 'idle';
  }
  if (status === 'pending_payment') {
    return stepKey === 'created' ? 'done' : stepKey === 'payment' ? 'current' : 'idle';
  }
  if (status === 'payment_review') {
    if (stepKey === 'created') return 'done';
    if (stepKey === 'payment') return 'current';
    return 'idle';
  }
  if (status === 'confirmed') {
    if (stepKey === 'confirmed') return 'current';
    return ['created', 'payment'].includes(stepKey) ? 'done' : 'idle';
  }
  if (status === 'completed') return 'done';
  return 'idle';
}

export default function BookingTimeline({ status }) {
  const { t } = useI18n();

  return (
    <ol className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
      {STEPS.map((step, i) => {
        const state = stepState(status, step.key);
        const isLast = i === STEPS.length - 1;

        const circleClass =
          state === 'done'
            ? 'bg-emerald-500 text-white border-emerald-500'
            : state === 'current'
              ? 'bg-brand-500 text-white border-brand-500'
              : state === 'cancelled'
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-bg text-muted border-border';

        const lineClass = state === 'done' ? 'bg-emerald-500' : 'bg-border';

        return (
          <li key={step.key} className="flex items-center gap-3 flex-1">
            <div className="flex flex-col items-center sm:flex-row sm:flex-1 gap-3">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${circleClass}`}
              >
                {state === 'done' && <Check className="w-4 h-4" />}
                {state === 'current' && <Clock className="w-4 h-4" />}
                {state === 'cancelled' && <X className="w-4 h-4" />}
                {state === 'idle' && <span className="text-xs font-bold">{i + 1}</span>}
              </div>
              <div className="flex-1 sm:text-left">
                <p className="text-xs font-bold text-fg">{t(step.i18n)}</p>
              </div>
              {!isLast && <div className={`hidden sm:block h-0.5 flex-1 ${lineClass}`} />}
            </div>
          </li>
        );
      })}
    </ol>
  );
}