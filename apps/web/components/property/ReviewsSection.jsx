/**
 * @file apps/web/components/property/ReviewsSection.jsx
 *
 * Reviews display for a property.
 */

/**
 * @file apps/web/components/property/ReviewsSection.jsx
 *
 * Property reviews.
 * i18n: keys prefixed with `property.reviews.`.
 */

'use client';

import { useEffect, useState } from 'react';
import { Skeleton, EmptyState } from '@/components/ui';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { fetchPropertyReviews } from '@/lib/reviews';
import { formatDate } from '@marefiyaye/shared';

function Stars({ rating, size = 14 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            fontSize: size,
            color: i <= rating ? 'var(--color-brand-500)' : 'var(--color-slate-300)',
            lineHeight: 1,
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export function ReviewsSection({ propertyId, ratingAvg = 0, reviewCount = 0 }) {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!propertyId) return;
    setLoading(true);
    fetchPropertyReviews(propertyId)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [propertyId]);

  return (
    <section style={{ marginBottom: 'var(--space-8)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)' }}>
          {t('property.reviews.title')}
        </h2>
        {reviewCount > 0 && (
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            <Stars rating={Math.round(ratingAvg)} size={14} />
            {' '}
            {ratingAvg.toFixed(2)} · {t(reviewCount === 1 ? 'property.reviews.count_one' : 'property.reviews.count_other', { count: reviewCount })}
          </span>
        )}
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} height={80} borderRadius="var(--radius-lg)" />
          ))}
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <EmptyState
          icon={<span style={{ fontSize: '40px' }}>⭐</span>}
          title={t('property.reviews.empty.title')}
          description={t('property.reviews.empty.description')}
        />
      )}

      {!loading && reviews.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {reviews.map((r) => (
            <div
              key={r.id}
              style={{
                padding: 'var(--space-4)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: 'var(--radius-full)',
                  background: 'var(--color-brand-100)', color: 'var(--color-brand-700)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'var(--font-weight-black)', fontSize: 'var(--text-sm)',
                }}>
                  {(r.author?.fullName || '?').charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)' }}>
                    {r.author?.fullName || 'Guest'}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {formatDate(r.createdAt)}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <Stars rating={r.rating} size={14} />
                </div>
              </div>
              {r.comment && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
                  {r.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}