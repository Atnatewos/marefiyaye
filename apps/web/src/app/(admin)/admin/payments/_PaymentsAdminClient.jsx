'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/hooks/useI18n.js';
import Container from '@/components/layout/Container.jsx';
import Stack from '@/components/layout/Stack.jsx';
import PaymentReviewCard from '@/components/admin/PaymentReviewCard.jsx';

const FILTERS = [
  { value: 'under_review', key: 'common.state.pending' },
  { value: 'verified', key: 'common.state.approved' },
  { value: 'rejected', key: 'common.state.rejected' },
  { value: 'all', key: 'common.state.all' },
];

export default function PaymentsAdminClient({ initialPayments }) {
  const { t } = useI18n();
  const router = useRouter();
  const [filter, setFilter] = useState('under_review');

  const filtered = filter === 'all' ? initialPayments : initialPayments.filter((p) => p.status === filter);

  return (
    <Container>
      <Stack size="lg" className="py-6 sm:py-8">
        <div>
          <h1 className="text-2xl font-extrabold text-fg">{t('admin.payments.title')}</h1>
          <p className="text-sm text-muted mt-1">
            {filtered.length} {filtered.length === 1 ? 'payment' : 'payments'}
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-colors ${
                filter === f.value
                  ? 'border-fg bg-neutral-100 dark:bg-neutral-800'
                  : 'border-border text-muted hover:border-fg'
              }`}
            >
              {t(f.key)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 rounded-lg border border-border bg-bg">
            <p className="text-sm text-muted">{t('admin.payments.empty')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((payment) => (
              <PaymentReviewCard
                key={payment.id}
                payment={payment}
                onChanged={() => router.refresh()}
              />
            ))}
          </div>
        )}
      </Stack>
    </Container>
  );
}