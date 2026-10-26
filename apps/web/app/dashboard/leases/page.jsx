/**
 * @file apps/web/app/(dashboard)/leases/page.jsx
 *
 * Tenant's lease applications with status + document link.
 */

/**
 * @file apps/web/app/dashboard/leases/page.jsx
 *
 * Tenant leases.
 * i18n: keys prefixed with `dashboard.leases.*`.
 */

'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, EmptyState, Skeleton, useToast } from '@/components/ui';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { fetchMyLeases, getLeaseDocumentUrl } from '@/lib/leases';
import { useCurrency } from '@/context/CurrencyContext';

function statusVariant(status) {
  if (status === 'ACTIVE') return 'success';
  if (status === 'APPLIED') return 'warning';
  if (status === 'APPROVED') return 'info';
  if (status === 'REJECTED' || status === 'TERMINATED') return 'danger';
  return 'default';
}

export default function LeasesPage() {
  const toast = useToast();
  const { t } = useTranslation();
  const { format } = useCurrency();
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyLeases()
      .then(setLeases)
      .catch((err) => toast.error(err.message || t('dashboard.leases.loadError')))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        {t('dashboard.leases.title')}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-8)' }}>
        {t('dashboard.leases.description')}
      </p>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} height={120} borderRadius="var(--radius-2xl)" />)}
        </div>
      )}

      {!loading && leases.length === 0 && (
        <EmptyState
          icon={<span style={{ fontSize: '48px' }}>📄</span>}
          title={t('dashboard.leases.empty.title')}
          description={t('dashboard.leases.empty.description')}
        />
      )}

      {!loading && leases.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {leases.map((lease) => (
            <div key={lease.id} style={{ padding: 'var(--space-4)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 4 }}>{lease.property?.title}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {String(lease.leaseStart).slice(0, 10)} → {String(lease.leaseEnd).slice(0, 10)} · {lease.months} months
                  </div>
                </div>
                <Badge variant={statusVariant(lease.status)}>{t(`payment.status.${lease.status}`)}</Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{t('lease.apply.monthlyRent')}</div>
                  <div style={{ fontWeight: 'var(--font-weight-extrabold)' }}>{format(lease.monthlyRateSnapshot)}</div>
                </div>
                {(lease.status === 'ACTIVE' || lease.status === 'APPROVED') && (
                  <a
                    href={getLeaseDocumentUrl(lease.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      background: 'var(--color-brand-600)',
                      color: '#fff',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-weight-bold)',
                      textDecoration: 'none',
                    }}
                  >
                    {t('dashboard.leases.viewDocument')}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}