/**
 * @file apps/web/app/admin/audit-log/page.jsx
 *
 * Admin — audit log.
 */

'use client';

import { useEffect, useState } from 'react';
import { Skeleton, useToast } from '@/components/ui';
import { DataTable } from '@/components/admin/DataTable';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { fetchAuditLog } from '@/lib/admin';
import { formatDate } from '@marefiyaye/shared';

export default function AdminAuditLogPage() {
  const toast = useToast();
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLog()
      .then(setEntries)
      .catch((err) => toast.error(err?.message || t('admin.auditLog.loadError')))
      .finally(() => setLoading(false));
  }, [toast, t]);

  const columns = [
    { key: 'action', header: t('admin.auditLog.columns.action'), render: (row) => row.action },
    {
      key: 'actor',
      header: t('admin.auditLog.columns.actor'),
      render: (row) => row.actorName || '—',
    },
    {
      key: 'entity',
      header: t('admin.auditLog.columns.entity'),
      render: (row) => `${row.entityType || '—'}${row.entityId ? ` · ${row.entityId.slice(0, 8)}` : ''}`,
    },
    { key: 'date', header: t('admin.auditLog.columns.date'), render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        {t('admin.auditLog.title')}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
        {t('admin.auditLog.description')}
      </p>

      {loading ? (
        <Skeleton height={400} borderRadius="var(--radius-lg)" />
      ) : (
        <DataTable
          columns={columns}
          rows={entries}
          emptyTitle={t('admin.auditLog.emptyTitle')}
          emptyDescription={t('admin.auditLog.emptyDescription')}
        />
      )}
    </div>
  );
}