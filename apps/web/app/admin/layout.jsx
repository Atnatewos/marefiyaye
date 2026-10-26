/**
 * @file apps/web/app/admin/layout.jsx
 *
 * Admin panel layout — wraps every /admin/* route.
 *
 * Why this file exists:
 *   - All admin pages share the AdminShell (sidebar + main).
 *   - The login page (`/admin/login`) is the exception: it renders its own
 *     split-screen layout and must NOT be wrapped in AdminShell.
 *
 * Security:
 *   - Auth is enforced by `middleware.js` (checks the admin_token cookie).
 *   - This layout only handles the visual chrome — never auth logic.
 */

'use client';

import { usePathname } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return <AdminShell>{children}</AdminShell>;
}