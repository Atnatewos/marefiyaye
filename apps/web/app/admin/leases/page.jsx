/**
 * @file apps/web/app/admin/leases/page.jsx
 *
 * Admin — all lease applications.
 */

'use client';

import { useEffect, useState } from 'react';
import { Badge, Skeleton, useToast } from '@/components/ui';
import { DataTable } from '@/components/admin/DataTable';
import { FilterBar } from '@/components/admin/FilterBar';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { fetchAdminLeases } from '@/lib/admin';

const TABS = [
  { key: 'ALL', labelKey: 'admin.leases.tabs.all' },
  { key: 'APPLIED', labelKey: 'admin.leases.tabs.applied' },
  { key: 'APPROVED', labelKey: 'admin.leases.tabs.approved' },
  { key: 'ACTIVE', labelKey: 'admin.leases.tabs.active' },
  { key: 'TERMINATED', labelKey: 'admin.leases.tabs.terminated' },
];

function statusVariant(s) {
  if (s === 'ACTIVE') return 'success';
  if (s === 'APPROVED') return 'info';
  if (s === 'APPLIED') return 'warning';
  if (s === 'TERMINATED' || s === 'REJECTED') return 'danger';
  return 'default';
}

export default function AdminLeasesPage() {
  const toast = useToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('ALL');
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAdminLeases(activeTab)
      .then(setLeases)
      .catch((err) => toast.error(err?.message || t('admin.leases.loadError')))
      .finally(() => setLoading(false));
  }, [activeTab, toast, t]);

  const columns = [
    { key: 'tenant', header: t('admin.leases.columns.tenant'), render: (row) => row.tenantName },
    { key: 'property', header: t('admin.leases.columns.property'), render: (row) => row.propertyTitle },
    {
      key: 'duration',
      header: t('admin.leases.columns.duration'),
      render: (row) => `${String(row.leaseStart).slice(0, 10)} → ${String(row.leaseEnd).slice(0, 10)}`,
    },
    { key: 'months', header: t('admin.leases.columns.months'), render: (row) => row.months },
    {
      key: 'monthlyRent',
      header: t('admin.leases.columns.monthlyRent'),
      render: (row) => `${Number(row.monthlyRateEtb).toLocaleString()} ብር`,
    },
    {
      key: 'total',
      header: t('admin.leases.columns.total'),
      render: (row) => `${Number(row.totalContractEtb).toLocaleString()} ብር`,
    },
    {
      key: 'status',
      header: t('admin.leases.columns.status'),
      render: (row) => (
        <Badge variant={statusVariant(row.status)} size="sm">{row.status}</Badge>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        {t('admin.leases.title')}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
        {t('admin.leases.description')}
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
          rows={leases}
          emptyTitle={t('admin.leases.emptyTitle')}
          emptyDescription={t('admin.leases.emptyDescription')}
        />
      )}
    </div>
  );
}