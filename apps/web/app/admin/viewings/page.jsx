/**
 * @file apps/web/app/admin/viewings/page.jsx
 *
 * Admin — all viewing requests.
 */

'use client';

import { useEffect, useState } from 'react';
import { Badge, Skeleton, useToast } from '@/components/ui';
import { DataTable } from '@/components/admin/DataTable';
import { FilterBar } from '@/components/admin/FilterBar';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { fetchAdminViewings } from '@/lib/admin';

const TABS = [
  { key: 'ALL', labelKey: 'admin.viewings.tabs.all' },
  { key: 'PENDING', labelKey: 'admin.viewings.tabs.pending' },
  { key: 'CONFIRMED', labelKey: 'admin.viewings.tabs.confirmed' },
  { key: 'COMPLETED', labelKey: 'admin.viewings.tabs.completed' },
  { key: 'CANCELLED', labelKey: 'admin.viewings.tabs.cancelled' },
];

function statusVariant(s) {
  if (s === 'CONFIRMED') return 'success';
  if (s === 'PENDING') return 'warning';
  if (s === 'COMPLETED') return 'info';
  if (s === 'CANCELLED') return 'danger';
  return 'default';
}

export default function AdminViewingsPage() {
  const toast = useToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('ALL');
  const [viewings, setViewings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAdminViewings(activeTab)
      .then(setViewings)
      .catch((err) => toast.error(err?.message || t('admin.viewings.loadError')))
      .finally(() => setLoading(false));
  }, [activeTab, toast, t]);

  const columns = [
    { key: 'requester', header: t('admin.viewings.columns.requester'), render: (row) => row.requesterName },
    { key: 'property', header: t('admin.viewings.columns.property'), render: (row) => row.propertyTitle },
    { key: 'date', header: t('admin.viewings.columns.date'), render: (row) => String(row.preferredDate).slice(0, 10) },
    { key: 'timeSlot', header: t('admin.viewings.columns.timeSlot'), render: (row) => row.timeSlot },
    {
      key: 'status',
      header: t('admin.viewings.columns.status'),
      render: (row) => (
        <Badge variant={statusVariant(row.status)} size="sm">{row.status}</Badge>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        {t('admin.viewings.title')}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
        {t('admin.viewings.description')}
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
          rows={viewings}
          emptyTitle={t('admin.viewings.emptyTitle')}
          emptyDescription={t('admin.viewings.emptyDescription')}
        />
      )}
    </div>
  );
}