/**
 * @file apps/web/app/loading.jsx
 *
 * Root loading skeleton — shown while top-level routes load.
 *
 * Why this file exists:
 *   - Next.js renders this as the fallback for any route that suspends.
 *   - Matches the general layout with a centered spinner.
 */

import { Spinner } from '@/components/ui';

export default function RootLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--surface-muted, #f8fafc)',
      }}
    >
      <Spinner size="lg" label="Loading..." />
    </div>
  );
}