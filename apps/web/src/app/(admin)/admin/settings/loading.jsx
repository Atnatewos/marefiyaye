/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Settings Admin Loading State
 * Path: apps/web/src/app/(admin)/admin/settings/loading.jsx
 *
 * Purpose:
 *   Route-level skeleton shown while the server component fetches settings.
 *   Next.js automatically renders this in place of the page during navigation.
 *   Uses skeleton blocks to mimic the layout of the settings page.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import Container from '@/components/layout/Container.jsx';
import Stack from '@/components/layout/Stack.jsx';
import Skeleton from '@/components/ui/Skeleton.jsx';

/**
 * Loading skeleton for the admin settings page.
 * Renders 3 collapsible category panels, each with 3 placeholder rows.
 *
 * @returns {JSX.Element}
 */
export default function Loading() {
  return (
    <Container>
      <Stack size="lg" className="py-6 sm:py-8">
        {/* Header skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Category panels */}
        <div className="space-y-3" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, panelIdx) => (
            <div
              key={`panel-${panelIdx}`}
              className="rounded-lg border border-border bg-bg p-4 space-y-3"
            >
              <Skeleton className="h-6 w-40" />
              {Array.from({ length: 3 }).map((__, rowIdx) => (
                <Skeleton key={`row-${panelIdx}-${rowIdx}`} className="h-10 w-full" />
              ))}
            </div>
          ))}
        </div>
      </Stack>
    </Container>
  );
}