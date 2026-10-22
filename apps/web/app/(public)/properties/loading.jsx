/**
 * @file apps/web/app/(public)/properties/loading.jsx
 *
 * Properties feed loading skeleton.
 *
 * Why this file exists:
 *   - Replaces spinner with a card grid skeleton that matches the eventual
 *     property cards, making the page feel faster.
 */

import { SkeletonCard } from '@/components/ui';

export default function PropertiesLoading() {
  return (
    <div
      className="container"
      style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}
    >
      <div style={{ height: '32px', width: '200px', marginBottom: 'var(--space-6)' }}>
        <div
          className="animate-shimmer"
          style={{ height: '100%', borderRadius: 'var(--radius-md)' }}
        />
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--space-6)',
        }}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}