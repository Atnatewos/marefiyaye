/**
 * @file apps/web/app/(dashboard)/host/viewings/page.jsx
 *
 * Viewings requested on host's properties — with confirm/cancel actions.
 */

'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, EmptyState, Skeleton, useToast } from '@/components/ui';
import { fetchHostViewings, updateViewingStatus } from '@/lib/host';
import { useTranslation } from '@/lib/i18n/I18nProvider';

function statusVariant(status) {
  if (status === 'CONFIRMED') return 'success';
  if (status === 'PENDING') return 'warning';
  if (status === 'COMPLETED') return 'info';
  if (status === 'CANCELLED') return 'danger';
  return 'default';
}

export default function HostViewingsPage() {
  const toast = useToast();
  const { t } = useTranslation();
  const [viewings, setViewings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchHostViewings();
      setViewings(data);
    } catch (err) {
      toast.error(err?.code ? t(`validation.errors.${err.code}`) : t('dashboard.host.loadError'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleStatus(id, status) {
    setActing(id);
    try {
      await updateViewingStatus(id, status);
      toast.success(t('dashboard.host.viewingUpdated'));
      load();
    } catch (err) {
      toast.error(err?.code ? t(`validation.errors.${err.code}`) : t('dashboard.host.viewingUpdateFailed'));
    } finally {
      setActing(null);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        {t('dashboard.host.viewingsTitle')}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
        {t('dashboard.host.viewingsDescription')}
      </p>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={100} borderRadius="var(--radius-lg)" />)}
        </div>
      )}

      {!loading && viewings.length === 0 && (
        <EmptyState
          icon={<span style={{ fontSize: '48px' }}>📆</span>}
          title={t('dashboard.host.viewingsEmpty')}
          description={t('dashboard.host.viewingsEmptyDescription')}
        />
      )}

      {!loading && viewings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {viewings.map((v) => (
            <div key={v.id} style={{ padding: 'var(--space-4)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 4 }}>{v.propertyTitle}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {v.requesterName} · {String(v.preferredDate).slice(0, 10)} · {v.timeSlot}
                  </div>
                  {v.note && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>“{v.note}”</div>}
                </div>
                <Badge variant={statusVariant(v.status)} size="sm">
                  {t(`common.status.${v.status}`)}
                </Badge>
              </div>
              {v.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Button size="sm" onClick={() => handleStatus(v.id, 'CONFIRMED')} isLoading={acting === v.id}>
                    {t('dashboard.host.confirm')}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleStatus(v.id, 'CANCELLED')} isLoading={acting === v.id}>
                    {t('dashboard.host.cancel')}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}