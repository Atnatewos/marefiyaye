/**
 * @file apps/web/components/admin/AdminShell.jsx
 *
 * Admin panel shell — sidebar + main content area.
 *
 * Why this component exists:
 *   - Every admin page needs the same sidebar and content layout.
 *   - One wrapper means a navigation change is a one-file edit.
 *   - Admin pages themselves stay focused on their data.
 */

'use client';

import { AdminSidebar } from './AdminSidebar';
import styles from './AdminShell.module.css';

export function AdminShell({ children }) {
  return (
    <div className={styles.shell}>
      <AdminSidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}