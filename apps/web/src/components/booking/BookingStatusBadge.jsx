/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — BookingStatusBadge
 * Path: apps/web/src/components/booking/BookingStatusBadge.jsx
 *
 * Purpose:
 *   Color-coded status chip for a booking. Single source of truth for
 *   status → visual mapping.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { Badge } from '@/components/ui';
import { useI18n } from '@/hooks/useI18n.js';

const STATUS_MAP = {
  pending_payment: { variant: 'warning', key: 'common.state.pending' },
  payment_review: { variant: 'info', key: 'common.state.pending' },
  confirmed: { variant: 'success', key: 'common.state.approved' },
  completed: { variant: 'neutral', key: 'common.state.approved' },
  cancelled: { variant: 'danger', key: 'common.state.rejected' },
  refunded: { variant: 'neutral', key: 'common.state.rejected' },
};

export default function BookingStatusBadge({ status }) {
  const { t } = useI18n();
  const config = STATUS_MAP[status] || { variant: 'neutral', key: 'common.state.pending' };

  return (
    <Badge variant={config.variant} size="md">
      {t(config.key)}
    </Badge>
  );
}