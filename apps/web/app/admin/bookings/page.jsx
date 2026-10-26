/**
 * @file apps/web/app/admin/bookings/page.jsx
 *
 * Admin — all bookings.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Skeleton, useToast } from '@/components/ui';
import { DataTable } from '@/components/admin/DataTable';
import { FilterBar } from '@/components/admin/FilterBar';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { fetchAdminBookings } from '@/lib/admin';
import { formatDate } from '@marefiyaye/shared';

const TABS = [
  { key: 'ALL', labelKey: 'admin.bookings.tabs.all' },
  { key: 'PENDING', labelKey: 'admin.bookings.tabs.pending' },
  { key: 'AWAITING_VERIFICATION', labelKey: 'admin.bookings.tabs.awaiting' },
  { key: 'CONFIRMED', labelKey: 'admin.bookings.tabs.confirmed' },
  { key: 'COMPLETED', labelKey: 'admin.bookings.tabs.completed' },
  { key: 'CANCELLED', labelKey: 'admin.bookings.tabs.cancelled' },
];

function statusVariant(s) {
  if (s === 'CONFIRMED') return 'success';
  if (s === 'AWAITING_VERIFICATION') return 'warning';
  if (s === 'CANCELLED') return 'danger';
  if (s === 'COMPLETED') return 'info';
  return 'default';
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('ALL');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAdminBookings(activeTab)
      .then(setBookings)
      .catch((err) => toast.error(err?.message || t('admin.bookings.loadError')))
      .finally(() => setLoading(false));
  }, [activeTab, toast, t]);

  const columns = [
    { key: 'guest', header: t('admin.bookings.columns.guest'), render: (row) => row.guestName },
    { key: 'property', header: t('admin.bookings.columns.property'), render: (row) => row.propertyTitle },
    {
      key: 'dates',
      header: t('admin.bookings.columns.dates'),
      render: (row) => `${String(row.checkIn).slice(0, 10)} → ${String(row.checkOut).slice(0, 10)}`,
    },
    { key: 'nights', header: t('admin.bookings.columns.nights'), render: (row) => row.nights },
    { key: 'guests', header: t('admin.bookings.columns.guests'), render: (row) => row.guests },
    {
      key: 'total',
      header: t('admin.bookings.columns.total'),
      render: (row) => `${Number(row.totalEtb).toLocaleString()} ብር`,
    },
    {
      key: 'status',
      header: t('admin.bookings.columns.status'),
      render: (row) => (
        <Badge variant={statusVariant(row.status)} size="sm">
          {t(`payment.status.${row.status}`)}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        {t('admin.bookings.title')}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
        {t('admin.bookings.description')}
      </p>

      <FilterBar
        tabs={TABS.map((tab) => ({ key: tab.key, label: t(tab.labelKey) }))}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      {loading ? (
        <Skeleton height={400} borderRadius="var(--radius-lg)" />
      ) : (
        <DataTable
          columns={columns}
          rows={bookings}
          emptyTitle={t('admin.bookings.emptyTitle')}
          emptyDescription={t('admin.bookings.emptyDescription')}
        />
      )}
    </div>
  );
}