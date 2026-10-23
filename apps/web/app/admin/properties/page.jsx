/**
 * @file apps/web/app/admin/properties/page.jsx
 *
 * Admin listing verification queue.
 *
 * Why this file exists:
 *   - Admins review new listings before they go live.
 *   - Filter tabs by verification status.
 *   - Click a card → detail page for review.
 *
 * i18n: all strings via `t()`.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, EmptyState, Skeleton, useToast } from '@/components/ui';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { fetchAdminListings } from '@/lib/admin-listings';
import { useCurrency } from '@/context/CurrencyContext';
import { ROUTES } from '@marefiyaye/config/app';

const TABS = [
  { key: 'PENDING', labelKey: 'admin.listings.tabs.pending' },
  { key: 'VERIFIED', labelKey: 'admin.listings.tabs.verified' },
  { key: 'ALL', labelKey: 'admin.listings.tabs.all' },
];

export default function AdminListingsPage() {
  const toast = useToast();
  const { t } = useTranslation();
  const { format } = useCurrency();
  const [activeTab, setActiveTab] = useState('PENDING');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchAdminListings(activeTab);
      setListings(data);
    } catch (err) {
      toast.error(err?.code ? t(`validation.errors.${err.code}`) : t('admin.listings.loadError'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [activeTab]);

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        {t('admin.listings.title')}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
        {t('admin.listings.description')}
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', overflowX: 'auto' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              border: activeTab === tab.key ? '1px solid var(--color-brand-600)' : '1px solid var(--border)',
              background: activeTab === tab.key ? 'var(--color-brand-50)' : 'var(--surface)',
              color: activeTab === tab.key ? 'var(--color-brand-700)' : 'var(--text-secondary)',
              fontWeight: 'var(--font-weight-bold)',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
            }}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={100} borderRadius="var(--radius-lg)" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && listings.length === 0 && (
        <EmptyState
          icon={<span style={{ fontSize: '48px' }}>📋</span>}
          title={t('admin.listings.empty.title')}
          description={t('admin.listings.empty.description', { status: t(`admin.listings.tabs.${activeTab.toLowerCase()}`).toLowerCase() })}
        />
      )}

      {/* List */}
      {!loading && listings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {listings.map((l) => (
            <Link
              key={l.id}
              href={`/admin/properties/${l.id}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr auto auto',
                gap: 'var(--space-4)',
                alignItems: 'center',
                padding: 'var(--space-4)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div style={{ width: '100px', height: '72px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--surface-muted)' }}>
                {l.images?.[0]?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.images[0].url} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div>
                <div style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 4 }}>{l.title}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {l.neighborhood ? `${l.neighborhood}, ` : ''}{l.city} · {l.stayType.replace('_', ' ')} · {l.host.fullName}
                </div>
              </div>
              <Badge variant={l.isVerified ? 'success' : 'warning'} size="sm">
                {l.isVerified ? t('property.detail.verified') : t('payment.status.PENDING')}
              </Badge>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                {l.nightlyRateEtb ? format(l.nightlyRateEtb) : format(l.monthlyRateEtb)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}