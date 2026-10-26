/**
 * @file apps/web/app/(dashboard)/layout.jsx
 *
 * Guest + host dashboard layout.
 *
 * Why this file exists:
 *   - All /dashboard/* pages share the same shell.
 *   - Sidebar switches between guest and host sections based on user role.
 *   - Auth is enforced by middleware before this layout renders.
 */

'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout';
import { useAuth } from '@/context/AuthContext';

const GUEST_NAV = [
  {
    title: 'Guest',
    items: [
      { label: 'My Trips', href: '/dashboard/trips' },
      { label: 'Leases', href: '/dashboard/leases' },
      { label: 'Wishlist', href: '/dashboard/wishlist' },
      { label: 'Messages', href: '/dashboard/messages' },
      { label: 'Settings', href: '/dashboard/settings' },
    ],
  },
];

const HOST_NAV = [
  {
    title: 'Host',
    items: [
      { label: 'Overview', href: '/dashboard/host' },
      { label: 'Listings', href: '/dashboard/host/listings' },
      { label: 'Bookings', href: '/dashboard/host/bookings' },
      { label: 'Viewings', href: '/dashboard/host/viewings' },
    ],
  },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const sections = user?.role === 'HOST' ? [...GUEST_NAV, ...HOST_NAV] : GUEST_NAV;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-muted)' }}>
      <Sidebar activePath={pathname} sections={sections} />
      <main style={{ flex: 1, padding: 'var(--space-8)' }}>{children}</main>
    </div>
  );
}