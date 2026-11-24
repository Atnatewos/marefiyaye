/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Admin Sidebar
 * Path: apps/web/src/components/layout/AdminSidebar.jsx
 *
 * Purpose:
 *   Persistent left navigation for the admin panel. Fixed on lg+, slide-out
 *   drawer on mobile (toggled from a small header inside the layout).
 *
 *   Every link maps to a route under `/admin/*`. The current route is
 *   highlighted. Sections are grouped:
 *     - Overview       (dashboard)
 *     - Moderation     (listings, hosts, payments, bookings)
 *     - People         (users)
 *     - God Panel      (settings, bank accounts, banners, broadcasts)
 *     - Audit          (audit log)
 *
 *   Labels are i18n-keyed via `admin.sidebar.*`. Adding a new admin page is
 *   adding one entry to NAV_SECTIONS below.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Admin Sidebar
 * Path: apps/web/src/components/layout/AdminSidebar.jsx
 *
 * Purpose:
 *   Persistent left navigation for the admin panel. Links to every admin
 *   page. Active route is highlighted. Labels are i18n-driven.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Home, UserCheck, CreditCard, Calendar,
  Users, Settings, Landmark, Megaphone, Radio, ScrollText, ChevronRight,
} from 'lucide-react';
import { useI18n } from '@/hooks/useI18n.js';
import { cn } from '@/lib/utils.js';

const NAV_SECTIONS = [
  {
    titleKey: 'admin.sidebar.overview',
    items: [
      { href: '/admin', icon: LayoutDashboard, labelKey: 'admin.sidebar.overview', exact: true },
    ],
  },
  {
    titleKey: 'admin.sidebar.listings',
    items: [
      { href: '/admin/listings', icon: Home, labelKey: 'admin.sidebar.listings' },
      { href: '/admin/hosts', icon: UserCheck, labelKey: 'admin.sidebar.hosts' },
      { href: '/admin/payments', icon: CreditCard, labelKey: 'admin.sidebar.payments' },
      { href: '/admin/bookings', icon: Calendar, labelKey: 'admin.sidebar.bookings' },
    ],
  },
  {
    titleKey: 'admin.sidebar.users',
    items: [
      { href: '/admin/users', icon: Users, labelKey: 'admin.sidebar.users' },
    ],
  },
  {
    titleKey: 'admin.sidebar.settings',
    items: [
      { href: '/admin/settings', icon: Settings, labelKey: 'admin.sidebar.settings' },
      { href: '/admin/bank-accounts', icon: Landmark, labelKey: 'admin.sidebar.bankAccounts' },
      { href: '/admin/banners', icon: Megaphone, labelKey: 'admin.sidebar.banners' },
      { href: '/admin/broadcasts', icon: Radio, labelKey: 'admin.sidebar.broadcast' },
    ],
  },
  {
    titleKey: 'admin.sidebar.auditLog',
    items: [
      { href: '/admin/audit-log', icon: ScrollText, labelKey: 'admin.sidebar.auditLog' },
    ],
  },
];

export default function AdminSidebar({ onNavigate }) {
  const pathname = usePathname();
  const { t } = useI18n();

  const isActive = (href, exact = false) => {
    if (exact) return pathname === href;
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <nav aria-label="Admin navigation" className="flex flex-col h-full">
      {NAV_SECTIONS.map((section, i) => (
        <div key={i} className="mb-4 last:mb-0">
          <p className="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-muted">
            {t(section.titleKey)}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-colors',
                      active
                        ? 'bg-brand-500 text-white'
                        : 'text-fg hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{t(item.labelKey)}</span>
                    {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}