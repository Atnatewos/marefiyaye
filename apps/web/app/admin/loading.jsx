/**
 * @file apps/web/app/admin/loading.jsx
 *
 * Admin panel loading skeleton.
 *
 * Why this file exists:
 *   - Admin pages load data tables — a shell skeleton keeps the layout
 *     stable while data comes in.
 */

import { Skeleton, SkeletonTableRow } from '@/components/ui';

export default function AdminLoading() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          padding: 'var(--space-6)',
        }}
      >
        <Skeleton width="70%" height={20} className="mb-6" />
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={index}
            width="100%"
            height={36}
            className="mb-2"
            borderRadius="var(--radius-md)"
          />
        ))}
      </div>
      <div style={{ padding: 'var(--space-8)' }}>
        <Skeleton width="40%" height={32} className="mb-6" />
        <div>
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonTableRow key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}