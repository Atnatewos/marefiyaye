/**
 * @file apps/web/components/lease/LeaseActions.jsx
 *
 * Lease actions for long-term property detail pages.
 *
 * i18n: every visible string flows through `t()`.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Modal, Select, useToast } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { applyForLease, scheduleViewing } from '@/lib/leases';
import { LEASE_DURATIONS, VIEWING_TIME_SLOTS } from '@marefiyaye/config/business';
import { ROUTES } from '@marefiyaye/config/app';
import { addDays } from '@marefiyaye/shared';

export function LeaseActions({ property }) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const [viewingOpen, setViewingOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  function ensureAuth() {
    if (!isAuthenticated) {
      toast.info(t('lease.actions.signInPrompt'));
      router.push(`${ROUTES.AUTH.LOGIN}?redirect=${ROUTES.PUBLIC.PROPERTY(property.slug)}`);
      return false;
    }
    return true;
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Button variant="primary" fullWidth onClick={() => { if (ensureAuth()) setViewingOpen(true); }}>
          {t('lease.actions.scheduleViewing')}
        </Button>
        <Button variant="secondary" fullWidth onClick={() => { if (ensureAuth()) setApplyOpen(true); }}>
          {t('lease.actions.applyForLease')}
        </Button>
      </div>

      {viewingOpen && (
        <ViewingSchedulerModal
          property={property}
          minDate={today}
          onClose={() => setViewingOpen(false)}
          onSuccess={() => {
            setViewingOpen(false);
            toast.success(t('lease.actions.viewingSuccess'));
            router.push(ROUTES.DASHBOARD.TRIPS);
          }}
        />
      )}

      {applyOpen && (
        <ApplyLeaseModal
          property={property}
          onClose={() => setApplyOpen(false)}
          onSuccess={() => {
            setApplyOpen(false);
            toast.success(t('lease.actions.applySuccess'));
            router.push(ROUTES.DASHBOARD.LEASES);
          }}
        />
      )}
    </>
  );
}

function ViewingSchedulerModal({ property, minDate, onClose, onSuccess }) {
  const toast = useToast();
  const { t } = useTranslation();
  const [date, setDate] = useState(addDays(minDate, 3).toISOString().slice(0, 10));
  const [timeSlot, setTimeSlot] = useState(VIEWING_TIME_SLOTS[0]);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await scheduleViewing({ propertyId: property.id, preferredDate: date, timeSlot, note: note.trim() || undefined });
      onSuccess();
    } catch (err) {
      toast.error(err?.code ? t(`validation.errors.${err.code}`) : t('lease.viewing.failed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={t('lease.viewing.title')}
      description={t('lease.viewing.description', { title: property.title })}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('lease.viewing.cancel')}</Button>
          <Button onClick={handleSubmit} isLoading={submitting}>{t('lease.viewing.submit')}</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Input label={t('lease.viewing.dateLabel')} type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} />
        <Select label={t('lease.viewing.timeLabel')} value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
          {VIEWING_TIME_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
        </Select>
        <Input label={t('lease.viewing.noteLabel')} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('lease.viewing.notePlaceholder')} />
      </div>
    </Modal>
  );
}

function ApplyLeaseModal({ property, onClose, onSuccess }) {
  const toast = useToast();
  const { t } = useTranslation();
  const { format } = useCurrency();
  const minMonths = property.minLeaseMonths || 1;
  const [months, setMonths] = useState(minMonths);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const start = new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);
  const leaseStart = start.toISOString().slice(0, 10);
  const leaseEnd = end.toISOString().slice(0, 10);

  const total = (property.monthlyRateEtb || 0) * months + (property.securityDepositEtb || 0);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await applyForLease({ propertyId: property.id, leaseStart, leaseEnd, months, note: note.trim() || undefined });
      onSuccess();
    } catch (err) {
      toast.error(err?.code ? t(`validation.errors.${err.code}`) : t('lease.apply.failed'));
    } finally {
      setSubmitting(false);
    }
  }

  const availableDurations = LEASE_DURATIONS.filter((d) => d.months >= minMonths);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={t('lease.apply.title')}
      description={t('lease.apply.description', { months: minMonths, plural: minMonths > 1 ? 's' : '' })}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('lease.apply.cancel')}</Button>
          <Button onClick={handleSubmit} isLoading={submitting}>{t('lease.apply.submit')}</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Select label={t('lease.apply.durationLabel')} value={months} onChange={(e) => setMonths(Number(e.target.value))}>
          {availableDurations.map((d) => <option key={d.months} value={d.months}>{d.labelEn}</option>)}
        </Select>
        <div style={{ padding: 'var(--space-4)', background: 'var(--color-brand-50)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)' }}>
          <Row label={t('lease.apply.start')} value={leaseStart} />
          <Row label={t('lease.apply.end')} value={leaseEnd} />
          <Row label={t('lease.apply.monthlyRent')} value={format(property.monthlyRateEtb)} />
          <Row label={t('lease.apply.deposit')} value={format(property.securityDepositEtb || 0)} />
          <div style={{ marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-brand-200)', display: 'flex', justifyContent: 'space-between', fontWeight: 'var(--font-weight-bold)' }}>
            <span>{t('lease.apply.totalContract')}</span>
            <span style={{ color: 'var(--color-brand-700)' }}>{format(total)}</span>
          </div>
        </div>
        <Input label={t('lease.apply.noteLabel')} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('lease.apply.notePlaceholder')} />
      </div>
    </Modal>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 4 }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{value}</span>
    </div>
  );
}