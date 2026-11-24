/**
 * MAREFIYAYE WEB — Payments Admin Loading State
 * Path: apps/web/src/app/(admin)/admin/payments/loading.jsx
 */

import Container from '@/components/layout/Container.jsx';
import Stack from '@/components/layout/Stack.jsx';
import Skeleton, { SkeletonText } from '@/components/ui/Skeleton.jsx';

/**
 * Payments loading skeleton — heading + 4 review cards.
 * @returns {JSX.Element}
 */
export default function Loading() {
  return (
    <Container>
      <Stack size="lg" className="py-6 sm:py-8">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-4 rounded-lg border border-border bg-bg">
              <Skeleton variant="card" className="w-24 h-24 shrink-0" />
              <div className="flex-1">
                <SkeletonText lines={4} />
              </div>
            </div>
          ))}
        </div>
      </Stack>
    </Container>
  );
}