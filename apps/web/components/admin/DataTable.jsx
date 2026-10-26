/**
 * @file apps/web/components/admin/DataTable.jsx
 *
 * Generic table for admin list pages.
 *
 * Why this component exists:
 *   - Bookings, leases, viewings, reviews, users, audit log — six different
 *     admin pages that are all structurally "a table of rows."
 *   - One component keeps typography, padding, and empty states identical.
 *   - Supports optional row click (navigation to detail) and custom cell renderers.
 */

'use client';

import { Skeleton, EmptyState } from '@/components/ui';
import { classNames } from '@/lib/classNames';
import styles from './DataTable.module.css';

/**
 * @typedef {object} Column
 * @property {string} key
 * @property {string} header
 * @property {(row: object) => React.ReactNode} [render]
 * @property {string} [width]
 */

/**
 * @param {object} props
 * @param {Column[]} props.columns
 * @param {Array<object>} props.rows
 * @param {boolean} [props.loading=false]
 * @param {string} [props.emptyTitle]
 * @param {string} [props.emptyDescription]
 * @param {(row: object) => void} [props.onRowClick]
 * @param {string} [props.rowKey='id']
 */
export function DataTable({
  columns,
  rows,
  loading = false,
  emptyTitle = 'No results',
  emptyDescription = '',
  onRowClick,
  rowKey = 'id',
}) {
  if (loading) {
    return (
      <div className={styles.stack}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={64} borderRadius="var(--radius-lg)" />
        ))}
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={styles.th} style={col.width ? { width: col.width } : undefined}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row[rowKey]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={classNames(styles.tr, onRowClick && styles.clickable)}
            >
              {columns.map((col) => (
                <td key={col.key} className={styles.td}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}