/**
 * @file apps/web/app/admin/layout.jsx
 *
 * Admin panel layout — wraps all /admin/* pages EXCEPT /admin/login.
 *
 * Why this file exists:
 *   - Provides the admin shell (dark sidebar, topbar).
 *   - Renders the login page WITHOUT the shell by checking the route.
 *   - Uses the Sidebar component with admin-specific nav sections.
 *
 * Note: auth is enforced by middleware BEFORE this layout renders — a
 * non-admin visitor never reaches this component.
 */

'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout';
import { ROUTES } from '@marefiyaye/config/app';
import { useAuth } from '@/context/AuthContext';

const ADMIN_NAV = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Payments', href: '/admin/payments' },
      { label: 'Bookings', href: '/admin/bookings' },
      { label: 'Leases', href: '/admin/leases' },
      { label: 'Viewings', href: '/admin/viewings' },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Properties', href: '/admin/properties' },
      { label: 'Users', href: '/admin/users' },
      { label: 'Reviews', href: '/admin/reviews' },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', href: '/admin/settings' },
      { label: 'Audit Log', href: '/admin/audit-log' },
    ],
  },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { admin } = useAuth();

  // Login page renders without the admin shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-muted)' }}>
      <div style={{ background: 'var(--color-slate-900)' }}>
        <Sidebar activePath={pathname} sections={ADMIN_NAV} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: '64px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-muted)' }}>
            Admin Panel
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            {admin?.fullName || 'Admin'}
          </div>
        </header>
        <main style={{ flex: 1, padding: 'var(--space-8)' }}>{children}</main>
      </div>
    </div>
  );
}