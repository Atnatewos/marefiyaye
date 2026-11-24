/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Profile Menu
 * Path: apps/web/src/components/layout/ProfileMenu.jsx
 *
 * Purpose:
 *   Airbnb-style profile pill in the header.
 *
 *   Behaviour:
 *     - Logged out      → single pill → /login?next=<current>
 *     - Logged in       → pill + dropdown with:
 *                         • My Bookings
 *                         • Saved
 *                         • "Become a host" (if not yet a host) OR
 *                           "Host dashboard" (if host profile exists)
 *                         • Admin (if admin/super_admin)
 *                         • Log Out
 *
 *   Host detection:
 *     The user's role stays `guest` even after they create a host profile.
 *     So we fetch `/host/me` on mount to check whether a host row exists.
 *     The result is cached in state so we don't fetch on every render.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu, User, Heart, Calendar, LayoutDashboard, LogOut, Shield,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.js';
import { useI18n } from '@/hooks/useI18n.js';
import { useToast } from '@/hooks/useToast.js';
import { useConfirm } from '@/hooks/useConfirm.js';
import api from '@/lib/api.js';
import { Avatar } from '@/components/ui';

export default function ProfileMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useI18n();
  const toast = useToast();
  const confirm = useConfirm();
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [hasHostProfile, setHasHostProfile] = useState(false);
  const ref = useRef(null);

  /* Fetch host profile status once we know the user is authenticated */
  useEffect(() => {
    if (!isAuthenticated) {
      setHasHostProfile(false);
      return;
    }
    let cancelled = false;
    api
      .get('/host/me')
      .then(({ data }) => {
        if (!cancelled) setHasHostProfile(!!data?.host);
      })
      .catch(() => {
        if (!cancelled) setHasHostProfile(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  /* Close dropdown on outside click */
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    const ok = await confirm({
      title: t('auth.logout.title'),
      description: t('auth.logout.confirm'),
      confirmLabel: t('common.nav.logout'),
      variant: 'logout',
    });
    if (!ok) return;
    await logout();
    toast.success(t('auth.logout.successToast'));
    router.push('/');
    router.refresh();
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  /* Preserve intended destination for login redirect */
  const loginHref =
    pathname && pathname !== '/'
      ? `/login?next=${encodeURIComponent(pathname)}`
      : '/login';

  /* Logged out — compact pill */
  if (!isAuthenticated) {
    return (
      <Link
        href={loginHref}
        className="flex items-center space-x-2 border border-border rounded-full p-1.5 pl-3 hover:shadow-md transition-shadow bg-bg"
      >
        <Menu className="w-4 h-4 text-muted" />
        <div className="w-7 h-7 rounded-full bg-neutral-700 dark:bg-neutral-600 text-white flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
      </Link>
    );
  }

  /* Logged in — avatar + dropdown */
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Profile menu"
        aria-expanded={open}
        className="flex items-center space-x-2 border border-border rounded-full p-1.5 pl-3 hover:shadow-md transition-shadow bg-bg"
      >
        <Menu className="w-4 h-4 text-muted" />
        <Avatar name={user.full_name || user.email} size="sm" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-64 bg-bg rounded-lg shadow-modal border border-border py-1 z-50 animate-scale-in"
        >
          <div className="px-4 py-2 border-b border-border">
            <p className="font-bold text-sm truncate">{user.full_name}</p>
            <p className="text-xs text-muted truncate">{user.email}</p>
          </div>

          <MenuItem href="/bookings" icon={Calendar}>
            {t('common.nav.bookings')}
          </MenuItem>
          <MenuItem href="/saved" icon={Heart}>
            {t('common.nav.saved')}
          </MenuItem>

          {/* Host option — differs based on whether they have a host profile */}
          {hasHostProfile ? (
            <MenuItem href="/host/dashboard" icon={LayoutDashboard}>
              {t('host.dashboard.title')}
            </MenuItem>
          ) : (
            <MenuItem href="/host/register" icon={Sparkles}>
              {t('common.nav.host')}
            </MenuItem>
          )}

          {isAdmin && (
            <MenuItem href="/admin" icon={Shield}>
              Admin
            </MenuItem>
          )}

          <div className="border-t border-border mt-1 pt-1">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t('common.nav.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Small menu item — consistent styling for every link in the dropdown.
 *
 * @param {object} props
 * @param {string} props.href
 * @param {import('react').ComponentType} props.icon
 * @param {import('react').ReactNode} props.children
 */
function MenuItem({ href, icon: Icon, children }) {
  return (
    <Link
      href={href}
      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
    >
      <Icon className="w-4 h-4 text-muted" />
      {children}
    </Link>
  );
}