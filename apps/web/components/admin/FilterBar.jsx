/**
 * @file apps/web/components/admin/FilterBar.jsx
 *
 * Filter tab bar for admin list pages.
 *
 * Why this component exists:
 *   - Every admin list has tabs (Pending / Verified / Rejected / All).
 *   - Centralizing the styling means a change to tab look is one edit.
 */

'use client';

import { classNames } from '@/lib/classNames';
import styles from './FilterBar.module.css';

/**
 * @param {object} props
 * @param {Array<{ key: string, label: string }>} props.tabs
 * @param {string} props.activeKey
 * @param {(key: string) => void} props.onChange
 */
export function FilterBar({ tabs, activeKey, onChange }) {
  return (
    <div className={styles.bar} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={activeKey === tab.key}
          onClick={() => onChange(tab.key)}
          className={classNames(styles.tab, activeKey === tab.key && styles.active)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}