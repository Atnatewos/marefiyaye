/**
 * @file apps/web/app/(public)/properties/[slug]/loading.jsx
 *
 * Property detail loading skeleton.
 *
 * Why this file exists:
 *   - Property detail is image-heavy — a skeleton matching the eventual
 *     layout reduces perceived load time on Ethiopian 3G networks.
 */

import { Skeleton, SkeletonText } from '@/components/ui';

export default function PropertyDetailLoading() {
  return (
    <div
      className="container"
      style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}
    >
      <Skeleton width="40%" height={20} className="mb-6" />

      <Skeleton width="70%" height={32} className="mb-4" />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-8)',
        }}
      >
        <Skeleton width="100%" height={360} borderRadius="var(--radius-2xl)" />
        <Skeleton width="100%" height={172} borderRadius="var(--radius-2xl)" />
        <Skeleton width="100%" height={172} borderRadius="var(--radius-2xl)" />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 'var(--space-8)',
        }}
      >
        <div>
          <SkeletonText lines={4} />
        </div>
        <div>
          <Skeleton width="100%" height={400} borderRadius="var(--radius-2xl)" />
        </div>
      </div>
    </div>
  );
}