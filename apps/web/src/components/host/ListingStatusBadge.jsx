/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — ListingStatusBadge
 * Path: apps/web/src/components/host/ListingStatusBadge.jsx
 *
 * Purpose:
 *   Color-coded chip for a listing's moderation status. Single source of
 *   truth for the status → visual mapping used across host dashboard and
 *   admin panel.
 *
 *   Statuses:
 *     - draft              → neutral
 *     - pending_approval   → warning (awaiting admin review)
 *     - approved           → success (live on the site)
 *     - rejected           → danger (needs fix)
 *     - suspended          → danger (temporarily disabled by admin)
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { Badge } from '@/components/ui';
import { useI18n } from '@/hooks/useI18n.js';

/**
 * Maps a listing status to a visual variant + i18n key.
 * Fallback to `neutral` and `pending` for unknown statuses.
 */
const STATUS_MAP = {
  draft: { variant: 'neutral', key: 'host.listings.status.draft' },
  pending_approval: { variant: 'warning', key: 'host.listings.status.pending' },
  approved: { variant: 'success', key: 'host.listings.status.approved' },
  rejected: { variant: 'danger', key: 'host.listings.status.rejected' },
  suspended: { variant: 'danger', key: 'host.listings.status.suspended' },
};

export default function ListingStatusBadge({ status }) {
  const { t } = useI18n();
  const config =
    STATUS_MAP[status] || { variant: 'neutral', key: 'host.listings.status.draft' };

  return (
    <Badge variant={config.variant} size="md">
      {t(config.key)}
    </Badge>
  );
}