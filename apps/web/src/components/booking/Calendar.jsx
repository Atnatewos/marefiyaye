/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Calendar (Range)
 * Path: apps/web/src/components/booking/Calendar.jsx
 *
 * Purpose:
 *   Airbnb-faithful range calendar. Visual details:
 *     - Month header centered, bold, single line
 *     - Chevron arrows flanking header, hover circle
 *     - Weekday row in caps, muted
 *     - Selected edge days: solid dark circle, white text (Airbnb black)
 *     - In-range days: subtle grey background pill (not brand — subtle)
 *     - Hover on unselected day: soft grey circle
 *     - Dual month on md+; single on mobile
 *     - Navigation offset state shared between both months (one control)
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n.js';
import { cn } from '../../lib/utils.js';

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function monthGrid(month) {
  const first = month.startOf('month');
  const daysInMonth = month.daysInMonth();
  const firstDayOfWeek = first.day(); // 0 = Sun

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i += 1) days.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) days.push(first.date(d));
  return days;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/* ── Month renderer ─────────────────────────────────────────────────────── */

function MonthGrid({
  month,
  checkIn,
  checkOut,
  onSelect,
  minDate,
  maxDate,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  showNav,
}) {
  const days = monthGrid(month);

  const isStart = (d) => d && checkIn && d.isSame(dayjs(checkIn), 'day');
  const isEnd = (d) => d && checkOut && d.isSame(dayjs(checkOut), 'day');
  const isInRange = (d) => {
    if (!d || !checkIn || !checkOut) return false;
    const t0 = dayjs(checkIn).startOf('day');
    const t1 = dayjs(checkOut).startOf('day');
    return d.isAfter(t0) && d.isBefore(t1);
  };

  return (
    <div className="w-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        {showNav ? (
          <button
            type="button"
            onClick={onPrev}
            disabled={!canGoPrev}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        ) : (
          <span className="w-8" />
        )}

        <p className="text-base font-bold text-fg">
          {month.format('MMMM YYYY')}
        </p>

        {showNav ? (
          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <span className="w-8" />
        )}
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="text-[10px] font-bold text-muted uppercase tracking-wider text-center py-1"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} className="h-10" />;

          const disabled = d.isBefore(minDate, 'day') || d.isAfter(maxDate, 'day');
          const start = isStart(d);
          const end = isEnd(d);
          const inRange = isInRange(d);
          const edge = start || end;

          /* Range background — spans full cell height so it "connects" */
          let rangeBgClass = '';
          if (inRange) {
            rangeBgClass = 'bg-neutral-100 dark:bg-neutral-800';
          } else if (start && checkOut) {
            /* start of range with a checkout → right side rounded */
            rangeBgClass = 'bg-neutral-100 dark:bg-neutral-800 rounded-r-full';
          } else if (end && checkIn) {
            /* end of range with a checkin → left side rounded */
            rangeBgClass = 'bg-neutral-100 dark:bg-neutral-800 rounded-l-full';
          }

          return (
            <div
              key={d.format('YYYY-MM-DD')}
              className={cn(
                'relative h-10 flex items-center justify-center',
                rangeBgClass
              )}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && onSelect(d)}
                className={cn(
                  'w-10 h-10 rounded-full text-sm font-semibold transition-colors',
                  disabled &&
                    'text-neutral-300 dark:text-neutral-700 cursor-not-allowed line-through',
                  !disabled &&
                    !edge &&
                    'text-fg hover:bg-neutral-100 dark:hover:bg-neutral-800',
                  edge && 'bg-brand-500 text-white'
                )}
              >
                {d.date()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */

export default function Calendar({
  checkIn,
  checkOut,
  onChange,
  minDate = dayjs().startOf('day'),
  maxDate = dayjs().add(2, 'year'),
}) {
  const { t } = useI18n();
  const [monthOffset, setMonthOffset] = useState(0);

  const today = dayjs().startOf('day');
  const canGoPrev = monthOffset > 0;
  const canGoNext = monthOffset < 12;
  const baseMonth = today.add(monthOffset, 'month');

  const handleSelect = (date) => {
    if (!date) return;
    const d = dayjs(date);

    if (!checkIn) {
      onChange({ checkIn: d.toDate(), checkOut: null });
      return;
    }

    if (!checkOut) {
      if (d.isAfter(dayjs(checkIn))) {
        onChange({ checkIn, checkOut: d.toDate() });
      } else {
        onChange({ checkIn: d.toDate(), checkOut: null });
      }
      return;
    }

    onChange({ checkIn: d.toDate(), checkOut: null });
  };

  const rangeSummary = (() => {
    if (checkIn && checkOut) {
      return `${dayjs(checkIn).format('MMM D')} → ${dayjs(checkOut).format('MMM D')}`;
    }
    if (checkIn) {
      return `${dayjs(checkIn).format('MMM D')} → select checkout`;
    }
    return t('booking.calendar.selectDates');
  })();

  return (
    <div>
      <p className="text-xs font-semibold text-muted text-center pb-3">
        {rangeSummary}
      </p>

      {/* Mobile: single month with nav */}
      <div className="md:hidden">
        <MonthGrid
          month={baseMonth}
          checkIn={checkIn}
          checkOut={checkOut}
          onSelect={handleSelect}
          minDate={minDate}
          maxDate={maxDate}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          onPrev={() => setMonthOffset((o) => o - 1)}
          onNext={() => setMonthOffset((o) => o + 1)}
          showNav
        />
      </div>

      {/* Desktop: dual month, nav on outer edges of full group */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between pb-3">
          <button
            type="button"
            onClick={() => setMonthOffset((o) => o - 1)}
            disabled={!canGoPrev}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <p className="text-xs text-muted">
            {checkIn && checkOut
              ? `${dayjs(checkIn).format('MMM D')} → ${dayjs(checkOut).format('MMM D')}`
              : checkIn
                ? `${dayjs(checkIn).format('MMM D')} → pick checkout`
                : t('booking.calendar.selectDates')}
          </p>

          <button
            type="button"
            onClick={() => setMonthOffset((o) => o + 1)}
            disabled={!canGoNext}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <MonthGrid
            month={baseMonth}
            checkIn={checkIn}
            checkOut={checkOut}
            onSelect={handleSelect}
            minDate={minDate}
            maxDate={maxDate}
          />
          <MonthGrid
            month={baseMonth.add(1, 'month')}
            checkIn={checkIn}
            checkOut={checkOut}
            onSelect={handleSelect}
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>
      </div>
    </div>
  );
}