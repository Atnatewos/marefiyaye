/**
 * @file apps/web/app/admin/users/page.jsx
 *
 * Admin — all users.
 */

'use client';

import { useEffect, useState } from 'react';
import { Badge, Skeleton, useToast } from '@/components/ui';
import { DataTable } from '@/components/admin/DataTable';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { fetchAdminUsers } from '@/lib/admin';
import { formatDate } from '@marefiyaye/shared';

function roleVariant(role) {
  if (role === 'ADMIN') return 'warning';
  if (role === 'HOST') return 'brand';
  return 'default';
}

export default function AdminUsersPage() {
  const toast = useToast();
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminUsers()
      .then(setUsers)
      .catch((err) => toast.error(err?.message || t('admin.users.loadError')))
      .finally(() => setLoading(false));
  }, [toast, t]);

  const columns = [
    { key: 'name', header: t('admin.users.columns.name'), render: (row) => row.fullName },
    { key: 'email', header: t('admin.users.columns.email'), render: (row) => row.email },
    { key: 'phone', header: t('admin.users.columns.phone'), render: (row) => row.phone || '—' },
    {
      key: 'role',
      header: t('admin.users.columns.role'),
      render: (row) => <Badge variant={roleVariant(row.role)} size="sm">{row.role}</Badge>,
    },
    {
      key: 'verified',
      header: t('admin.users.columns.verified'),
      render: (row) => (row.isVerified ? '✓' : '—'),
    },
    { key: 'joined', header: t('admin.users.columns.joined'), render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        {t('admin.users.title')}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
        {t('admin.users.description')}
      </p>

      {loading ? (
        <Skeleton height={400} borderRadius="var(--radius-lg)" />
      ) : (
        <DataTable
          columns={columns}
          rows={users}
          emptyTitle={t('admin.users.emptyTitle')}
          emptyDescription={t('admin.users.emptyDescription')}
        />
      )}
    </div>
  );
}