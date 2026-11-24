/**
 * MAREFIYAYE WEB — Hosts Admin Loading State
 * Path: apps/web/src/app/(admin)/admin/hosts/loading.jsx
 */

import Container from '@/components/layout/Container.jsx';
import Stack from '@/components/layout/Stack.jsx';
import Skeleton, { SkeletonText } from '@/components/ui/Skeleton.jsx';

/**
 * Hosts loading skeleton — heading + 5 host rows.
 * @returns {JSX.Element}
 */
export default function Loading() {
  return (
    <Container>
      <Stack size="lg" className="py-6 sm:py-8">
        <Skeleton className="h-8 w-40" />
        <div className="space-y-2" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg border border-border bg-bg">
              <Skeleton variant="avatar" className="w-12 h-12 shrink-0" />
              <div className="flex-1"><SkeletonText lines={3} /></div>
            </div>
          ))}
        </div>
      </Stack>
    </Container>
  );
}