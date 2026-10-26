/**
 * @file apps/web/app/admin/reviews/page.jsx
 *
 * Admin — all reviews.
 */

'use client';

import { useEffect, useState } from 'react';
import { Skeleton, useToast } from '@/components/ui';
import { DataTable } from '@/components/admin/DataTable';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { fetchAdminReviews } from '@/lib/admin';
import { formatDate } from '@marefiyaye/shared';

export default function AdminReviewsPage() {
  const toast = useToast();
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminReviews()
      .then(setReviews)
      .catch((err) => toast.error(err?.message || t('admin.reviews.loadError')))
      .finally(() => setLoading(false));
  }, [toast, t]);

  const columns = [
    { key: 'author', header: t('admin.reviews.columns.author'), render: (row) => row.authorName },
    { key: 'property', header: t('admin.reviews.columns.property'), render: (row) => row.propertyTitle },
    {
      key: 'rating',
      header: t('admin.reviews.columns.rating'),
      render: (row) => `${'★'.repeat(row.rating)}${'☆'.repeat(5 - row.rating)}`,
    },
    { key: 'comment', header: t('admin.reviews.columns.comment'), render: (row) => row.comment || '—' },
    { key: 'date', header: t('admin.reviews.columns.date'), render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        {t('admin.reviews.title')}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
        {t('admin.reviews.description')}
      </p>

      {loading ? (
        <Skeleton height={400} borderRadius="var(--radius-lg)" />
      ) : (
        <DataTable
          columns={columns}
          rows={reviews}
          emptyTitle={t('admin.reviews.emptyTitle')}
          emptyDescription={t('admin.reviews.emptyDescription')}
        />
      )}
    </div>
  );
}