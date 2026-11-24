/**
 * MAREFIYAYE WEB — Audit Log Admin Loading State
 * Path: apps/web/src/app/(admin)/admin/audit-log/loading.jsx
 */

import Container from '@/components/layout/Container.jsx';
import Stack from '@/components/layout/Stack.jsx';
import Skeleton, { SkeletonText } from '@/components/ui/Skeleton.jsx';

/**
 * Audit log loading skeleton — heading + 10 log rows.
 * @returns {JSX.Element}
 */
export default function Loading() {
  return (
    <Container>
      <Stack size="lg" className="py-6 sm:py-8">
        <Skeleton className="h-8 w-48" />
        <div className="rounded-lg border border-border bg-bg" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="p-3 border-b border-border last:border-0">
              <SkeletonText lines={2} />
            </div>
          ))}
        </div>
      </Stack>
    </Container>
  );
}