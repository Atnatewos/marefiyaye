/**
 * @file apps/web/components/property/DateRangePicker.jsx
 *
 * Date range picker (Airbnb-style).
 *
 * Why this component exists:
 *   - Booking widget needs range selection with disabled dates.
 *   - Native <input type="date"> can't do ranges or disable individual dates.
 *   - Dual-month view on desktop, single on mobile.
 *
 * Usage:
 *   <DateRangePicker
 *     checkIn="2026-11-01"
 *     checkOut="2026-11-05"
 *     disabledDates={['2026-11-03']}
 *     minDate={todayIso()}
 *     onChange={({ checkIn, checkOut }) => setRange({ checkIn, checkOut })}
 *   />
 *
 * Data flow:
 *   - User clicks start date → sets checkIn, clears checkOut
 *   - User clicks second date → sets checkOut (if after checkIn)
 *   - Both set → emits onChange
 */

'use client';

import { useMemo, useState } from 'react';
import { classNames } from '@/lib/classNames';
import {
  calculateNights,
  formatMonthYear,
  getNightDates,
  todayUtc,
  toIsoDate,
  addDays,
} from '@marefiyaye/shared';
import { DEFAULT_LOCALE } from '@marefiyaye/config/app';
import styles from './DateRangePicker.module.css';

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Returns the first day of the month containing the given date.
 */
function startOfMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

/**
 * Returns an array of dates for a month grid — leading blanks + all days.
 */
function buildMonthGrid(year, month) {
  const firstDay = new Date(Date.UTC(year, month, 1));
  const firstWeekday = firstDay.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const cells = [];
  // Leading empty cells
  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push(null);
  }
  // Actual days
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(Date.UTC(year, month, day)));
  }
  return cells;
}

/**
 * Date range picker.
 *
 * @param {object} props
 * @param {string} [props.checkIn] - ISO 'YYYY-MM-DD' or null
 * @param {string} [props.checkOut] - ISO 'YYYY-MM-DD' or null
 * @param {string[]} [props.disabledDates=[]] - ISO dates that cannot be selected
 * @param {string} [props.minDate] - ISO; dates before this are disabled
 * @param {string} [props.locale=DEFAULT_LOCALE]
 * @param {(range: { checkIn: string, checkOut: string }) => void} props.onChange
 * @param {string} [props.className]
 */
export function DateRangePicker({
  checkIn = null,
  checkOut = null,
  disabledDates = [],
  minDate,
  locale = DEFAULT_LOCALE,
  onChange,
  className = '',
}) {
  const today = todayUtc();
  const min = minDate ? new Date(`${minDate}T00:00:00.000Z`) : today;

  // Initial month = the month of checkIn, or current month.
  const [viewDate, setViewDate] = useState(() =>
    checkIn ? new Date(`${checkIn}T00:00:00.000Z`) : today
  );

  const disabledSet = useMemo(() => new Set(disabledDates), [disabledDates]);

  const currentMonth = viewDate.getUTCMonth();
  const currentYear = viewDate.getUTCFullYear();
  const nextMonthDate = addDays(startOfMonth(addDays(startOfMonth(viewDate), 32)), 0);
  const nextMonth = nextMonthDate.getUTCMonth();
  const nextYear = nextMonthDate.getUTCFullYear();

  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0;
  const nightsInRange = checkIn && checkOut ? new Set(getNightDates(checkIn, checkOut)) : new Set();

  function isDateDisabled(date) {
    if (date < min) return true;
    if (disabledSet.has(toIsoDate(date))) return true;
    return false;
  }

  function handleDayClick(date) {
    if (isDateDisabled(date)) return;

    const iso = toIsoDate(date);

    // No check-in yet, or user is resetting the range
    if (!checkIn || (checkIn && checkOut)) {
      onChange?.({ checkIn: iso, checkOut: null });
      return;
    }

    // User clicked a date before current checkIn → restart with this as checkIn
    if (iso < checkIn) {
      onChange?.({ checkIn: iso, checkOut: null });
      return;
    }

    // Same day → ignore
    if (iso === checkIn) {
      return;
    }

    // Valid end date
    onChange?.({ checkIn, checkOut: iso });
  }

  function goToPreviousMonth() {
    const prev = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
    if (prev >= startOfMonth(min)) setViewDate(prev);
  }

  function goToNextMonth() {
    setViewDate(new Date(Date.UTC(currentYear, currentMonth + 1, 1)));
  }

  function clearRange() {
    onChange?.({ checkIn: null, checkOut: null });
  }

  function renderDay(date) {
    if (!date) {
      return <div className={styles.dayEmpty} aria-hidden="true" />;
    }
    const iso = toIsoDate(date);
    const disabled = isDateDisabled(date);
    const isCheckIn = checkIn === iso;
    const isCheckOut = checkOut === iso;
    const isInRange = nightsInRange.has(iso);

    const dayClasses = classNames(
      styles.day,
      disabled && styles.dayEmpty,
      isInRange && !isCheckIn && !isCheckOut && styles.inRange,
      isCheckIn && styles.rangeStart,
      isCheckOut && styles.rangeEnd,
      isCheckIn && isCheckOut && styles.rangeStart
    );

    return (
      <button
        type="button"
        onClick={() => handleDayClick(date)}
        disabled={disabled}
        className={dayClasses}
        aria-label={formatMonthYear(date, locale) + ' ' + date.getUTCDate()}
        aria-pressed={isCheckIn || isCheckOut}
      >
        {date.getUTCDate()}
      </button>
    );
  }

  function renderMonth(year, month) {
    const grid = buildMonthGrid(year, month);
    const monthDate = new Date(Date.UTC(year, month, 1));

    return (
      <div className={styles.month}>
        <div className={styles.monthTitle}>{formatMonthYear(monthDate, locale)}</div>
        <div className={styles.weekdays}>
          {WEEKDAYS.map((day) => (
            <div key={day} className={styles.weekday}>{day}</div>
          ))}
        </div>
        <div className={styles.days}>
          {grid.map((date, index) => (
            <div key={date ? date.toISOString() : `empty-${index}`}>
              {renderDay(date)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.header}>
        <button
          type="button"
          onClick={goToPreviousMonth}
          className={styles.navButton}
          disabled={startOfMonth(viewDate) <= startOfMonth(min)}
          aria-label="Previous month"
        >
          <ChevronLeft />
        </button>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}>
          {nights > 0 ? `${nights} night${nights === 1 ? '' : 's'}` : 'Select dates'}
        </div>
        <div className={styles.monthNav}>
          <button
            type="button"
            onClick={goToNextMonth}
            className={styles.navButton}
            aria-label="Next month"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className={styles.months}>
        {renderMonth(currentYear, currentMonth)}
        {renderMonth(nextYear, nextMonth)}
      </div>

      <div className={styles.footer}>
        <div className={styles.summary}>
          <span className={styles.summaryLabel}>
            {checkIn ? formatMonthYear(new Date(`${checkIn}T00:00:00Z`), locale) : 'No dates selected'}
          </span>
          {checkOut && (
            <span className={styles.nights}>
              {nights} night{nights === 1 ? '' : 's'} selected
            </span>
          )}
        </div>
        {(checkIn || checkOut) && (
          <button type="button" onClick={clearRange} className={styles.clearButton}>
            Clear
          </button>
        )}
      </div>
    </div>
  );
}