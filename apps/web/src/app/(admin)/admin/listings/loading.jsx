/**
 * MAREFIYAYE WEB — Listings Admin Loading State
 * Path: apps/web/src/app/(admin)/admin/listings/loading.jsx
 *
 * Purpose:
 *   Route-level skeleton shown while the server component fetches listings.
 *   Next.js automatically renders this in place of the page during navigation
 *   and data loading.
 */

import Container from '@/components/layout/Container.jsx';
import Stack from '@/components/layout/Stack.jsx';
import Skeleton, { SkeletonText } from '@/components/ui/Skeleton.jsx';

/**
 * Listings loading skeleton — heading + 6 row skeletons.
 * @returns {JSX.Element}
 */
export default function Loading() {
  return (
    <Container>
      <Stack size="lg" className="py-6 sm:py-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-2" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg border border-border bg-bg">
              <Skeleton variant="card" className="w-16 h-16 shrink-0" />
              <div className="flex-1">
                <SkeletonText lines={3} />
              </div>
            </div>
          ))}
        </div>
      </Stack>
    </Container>
  );
}