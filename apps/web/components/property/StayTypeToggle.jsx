/**
 * @file apps/web/components/property/StayTypeToggle.jsx
 *
 * Stay type toggle (segmented control).
 *
 * Why this component exists:
 *   - The header toggle from the reference prototype — switches between
 *     short-term, long-term, and all properties.
 *   - Values match the STAY_TYPES config from @marefiyaye/config/business.
 *
 * Usage:
 *   <StayTypeToggle value="ALL" onChange={(v) => setFilter(v)} />
 *   // v ∈ { 'SHORT_TERM', 'LONG_TERM', 'ALL' }
 */

'use client';

import { classNames } from '@/lib/classNames';
import { STAY_TYPES, STAY_TYPE_LABELS } from '@marefiyaye/config/business';
import styles from './StayTypeToggle.module.css';

function HotelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V7l9-4 9 4v14" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="15" r="4" />
      <path d="M10.85 12.15L19 4h3v3l-8.15 8.15" />
    </svg>
  );
}

/**
 * StayTypeToggle component.
 *
 * @param {object} props
 * @param {'ALL'|'SHORT_TERM'|'LONG_TERM'} props.value
 * @param {(value: 'ALL'|'SHORT_TERM'|'LONG_TERM') => void} props.onChange
 * @param {string} [props.className]
 */
export function StayTypeToggle({ value = 'ALL', onChange, className = '' }) {
  const options = [
    {
      key: STAY_TYPES.SHORT_TERM,
      icon: <HotelIcon />,
      labelEn: STAY_TYPE_LABELS[STAY_TYPES.SHORT_TERM].labelEn,
      subLabel: '(Nightly)',
    },
    {
      key: STAY_TYPES.LONG_TERM,
      icon: <KeyIcon />,
      labelEn: STAY_TYPE_LABELS[STAY_TYPES.LONG_TERM].labelEn,
      subLabel: '(Monthly)',
    },
    {
      key: 'ALL',
      icon: null,
      labelEn: 'All Stays',
      subLabel: '',
    },
  ];

  return (
    <div
      role="tablist"
      aria-label="Stay type filter"
      className={classNames(styles.container, className)}
    >
      {options.map((option) => {
        const isActive = value === option.key;
        const isAllOption = option.key === 'ALL';

        return (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange?.(option.key)}
            className={classNames(
              styles.option,
              isActive && (isAllOption ? styles.activeNeutral : styles.active)
            )}
          >
            {option.icon && (
              <span className={styles.icon} aria-hidden="true">{option.icon}</span>
            )}
            <span>
              {option.labelEn}
              {option.subLabel && <span style={{ opacity: 0.7, marginLeft: 4 }}>{option.subLabel}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}