/**
 * @file apps/web/app/admin/payments/page.jsx
 *
 * Admin payment verification queue.
 *
 * i18n: every visible string flows through `t()`.
 */

'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, EmptyState, Input, Modal, Skeleton, useToast } from '@/components/ui';
import {
  fetchAdminPayments,
  fetchAdminPaymentDetail,
  verifyPayment,
  rejectPayment,
} from '@/lib/admin';
import { useCurrency } from '@/context/CurrencyContext';
import { useTranslation } from '@/lib/i18n/I18nProvider';

const TAB_KEYS = ['AWAITING_VERIFICATION', 'VERIFIED', 'REJECTED', 'ALL'];

function statusVariant(status) {
  if (status === 'VERIFIED') return 'success';
  if (status === 'REJECTED') return 'danger';
  if (status === 'AWAITING_VERIFICATION') return 'warning';
  return 'default';
}

function tabLabel(t, key) {
  const map = {
    AWAITING_VERIFICATION: 'admin.payments.tabs.pending',
    VERIFIED: 'admin.payments.tabs.verified',
    REJECTED: 'admin.payments.tabs.rejected',
    ALL: 'admin.payments.tabs.all',
  };
  return t(map[key]);
}

function statusLabel(t, status) {
  const map = {
    AWAITING_VERIFICATION: 'payment.status.AWAITING_VERIFICATION',
    VERIFIED: 'payment.status.VERIFIED',
    REJECTED: 'payment.status.REJECTED',
    PENDING: 'payment.status.PENDING',
  };
  return map[status] ? t(map[status]) : status;
}

export default function AdminPaymentsPage() {
  const toast = useToast();
  const { t } = useTranslation();
  const { format } = useCurrency();
  const [activeTab, setActiveTab] = useState('AWAITING_VERIFICATION');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  async function loadPayments() {
    setLoading(true);
    try {
      const data = await fetchAdminPayments(activeTab);
      setPayments(data);
    } catch (err) {
      toast.error(err?.code ? t(`validation.errors.${err.code}`) : t('admin.payments.loadError'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPayments(); }, [activeTab]);

  useEffect(() => {
    if (!selectedId) { setSelectedPayment(null); return; }
    setDetailLoading(true);
    fetchAdminPaymentDetail(selectedId)
      .then(setSelectedPayment)
      .catch((err) => toast.error(err?.code ? t(`validation.errors.${err.code}`) : t('admin.payments.loadError')))
      .finally(() => setDetailLoading(false));
  }, [selectedId, t]);

  async function handleVerify() {
    setActionLoading(true);
    try {
      await verifyPayment(selectedPayment.id);
      toast.success(t('admin.payments.verifySuccess'));
      setSelectedId(null);
      loadPayments();
    } catch (err) {
      toast.error(err?.code ? t(`validation.errors.${err.code}`) : t('admin.payments.verifyError'));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (rejectReason.trim().length < 3) {
      toast.error(t('admin.payments.reasonRequired'));
      return;
    }
    setActionLoading(true);
    try {
      await rejectPayment(selectedPayment.id, rejectReason.trim());
      toast.success(t('admin.payments.rejectSuccess'));
      setSelectedId(null);
      setRejectReason('');
      loadPayments();
    } catch (err) {
      toast.error(err?.code ? t(`validation.errors.${err.code}`) : t('admin.payments.rejectError'));
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', marginBottom: 'var(--space-2)' }}>
        {t('admin.payments.title')}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
        {t('admin.payments.description')}
      </p>

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', overflowX: 'auto' }}>
        {TAB_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              border: activeTab === key ? '1px solid var(--color-brand-600)' : '1px solid var(--border)',
              background: activeTab === key ? 'var(--color-brand-50)' : 'var(--surface)',
              color: activeTab === key ? 'var(--color-brand-700)' : 'var(--text-secondary)',
              fontWeight: 'var(--font-weight-bold)',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
            }}
          >
            {tabLabel(t, key)}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={80} borderRadius="var(--radius-lg)" />)}
        </div>
      )}

      {!loading && payments.length === 0 && (
        <EmptyState
          icon={<span style={{ fontSize: '48px' }}>📭</span>}
          title={t('admin.payments.empty.title')}
          description={t('admin.payments.empty.description', { status: tabLabel(t, activeTab).toLowerCase() })}
        />
      )}

      {!loading && payments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {payments.map((p) => (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedId(p.id)}
              onKeyDown={(e) => { if (e.key === 'Enter') setSelectedId(p.id); }}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto auto',
                gap: 'var(--space-4)',
                alignItems: 'center',
                padding: 'var(--space-4)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}>
                  {p.property?.title || '—'}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {p.guest?.fullName} · {t(`payment.methods.${p.method}`)} · ref <code>{p.referenceCode}</code>
                </div>
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-extrabold)' }}>
                {format(p.amountEtb)}
              </div>
              <Badge variant={statusVariant(p.status)} size="sm">{statusLabel(t, p.status)}</Badge>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>→</span>
            </div>
          ))}
        </div>
      )}

      {selectedId && (
        <Modal
          isOpen
          onClose={() => { setSelectedId(null); setRejectReason(''); }}
          title={detailLoading ? t('common.labels.loading') : t('admin.payments.modalTitle', { status: statusLabel(t, selectedPayment?.status || '') })}
          size="lg"
          footer={
            selectedPayment?.status === 'AWAITING_VERIFICATION' && (
              <>
                <Button variant="secondary" onClick={() => setSelectedId(null)}>{t('admin.payments.closeButton')}</Button>
                <Button variant="danger" onClick={handleReject} isLoading={actionLoading}>{t('admin.payments.rejectButton')}</Button>
                <Button onClick={handleVerify} isLoading={actionLoading}>{t('admin.payments.verifyButton')}</Button>
              </>
            )
          }
        >
          {detailLoading ? (
            <Skeleton height={200} />
          ) : selectedPayment ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Section label={t('admin.payments.sections.guest')}>
                {selectedPayment.guest?.fullName} · {selectedPayment.guest?.email}
              </Section>
              <Section label={t('admin.payments.sections.property')}>
                {selectedPayment.property?.title}
                <br />
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                  {selectedPayment.property?.neighborhood}, {selectedPayment.property?.city}
                </span>
              </Section>
              <Section label={t('admin.payments.sections.booking')}>
                {selectedPayment.booking?.nights} nights · {selectedPayment.booking?.guests} guests
                <br />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {selectedPayment.booking?.checkIn?.slice(0, 10)} → {selectedPayment.booking?.checkOut?.slice(0, 10)}
                </span>
              </Section>
              <Section label={t('admin.payments.sections.payment')}>
                {t(`payment.methods.${selectedPayment.method}`)} · {format(selectedPayment.amountEtb)}
                <br />
                <span style={{ fontSize: 'var(--text-xs)' }}>
                  Ref: <code>{selectedPayment.referenceCode}</code>
                </span>
              </Section>
              {selectedPayment.receiptUrl && (
                <Section label={t('admin.payments.sections.receipt')}>
                  <a href={selectedPayment.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-brand-600)' }}>
                    {t('admin.payments.viewReceipt')}
                  </a>
                </Section>
              )}
              {selectedPayment.status === 'AWAITING_VERIFICATION' && (
                <div>
                  <Input
                    label={t('admin.payments.rejectReasonLabel')}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder={t('admin.payments.rejectReasonPlaceholder')}
                  />
                </div>
              )}
              {selectedPayment.status === 'REJECTED' && selectedPayment.rejectionReason && (
                <Section label={t('admin.payments.sections.rejectionReason')}>
                  {selectedPayment.rejectionReason}
                </Section>
              )}
            </div>
          ) : null}
        </Modal>
      )}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
        {label}
      </div>
      <div style={{ fontSize: 'var(--text-sm)' }}>{children}</div>
    </div>
  );
}