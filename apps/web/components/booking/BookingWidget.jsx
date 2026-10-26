/**
 * @file apps/web/components/booking/BookingWidget.jsx
 *
 * Booking widget — date picker + price preview + checkout modal.
 *
 * i18n: every visible string flows through `t()`.
 */

/**
 * @file apps/web/components/booking/BookingWidget.jsx
 *
 * Booking widget + checkout modal.
 * i18n: keys prefixed with `booking.` (widget + checkout).
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Modal, useToast } from '@/components/ui';
import { DateRangePicker } from '@/components/property';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { createBooking, submitPayment } from '@/lib/bookings';
import { calculateShortTermTotal, calculateHybridTotal, calculateNights } from '@marefiyaye/shared';
import { STAY_TYPES } from '@marefiyaye/config/business';
import { ROUTES } from '@marefiyaye/config/app';

export function BookingWidget({ property }) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { format } = useCurrency();

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [booking, setBooking] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0;
  const canBook = nights > 0 && guests > 0;
  const nightlyRate = property.nightlyRateEtb || 0;

  const pricing = nights > 0
    ? (property.stayType === STAY_TYPES.HYBRID
        ? calculateHybridTotal(nightlyRate, nights)
        : calculateShortTermTotal(nightlyRate, nights))
    : null;

  async function handleBook() {
    if (!isAuthenticated) {
      toast.info(t('booking.widget.signInPrompt'));
      router.push(`${ROUTES.AUTH.LOGIN}?redirect=${ROUTES.PUBLIC.PROPERTY(property.slug)}`);
      return;
    }
    try {
      const created = await createBooking({ propertyId: property.id, checkIn, checkOut, guests });
      setBooking(created);
      setCheckoutOpen(true);
    } catch (err) {
      toast.error(
        err?.code ? t(`validation.errors.${err.code}`) : t('booking.widget.bookFailed')
      );
    }
  }

  const nightsLabel = t(
    nights === 1 ? 'booking.widget.nightsLabel_one' : 'booking.widget.nightsLabel_other',
    { count: nights }
  );

  return (
    <>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)' }}>
            {format(nightlyRate)}
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: 'var(--space-1)' }}>
              {t('booking.widget.perNight')}
            </span>
          </div>
        </div>

        <DateRangePicker
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={({ checkIn: ci, checkOut: co }) => { setCheckIn(ci); setCheckOut(co); }}
          minDate={new Date().toISOString().split('T')[0]}
        />

        <div style={{ marginTop: 'var(--space-4)' }}>
          <Input
            label={t('booking.widget.guestsLabel', { max: property.maxGuests })}
            type="number"
            min={1}
            max={property.maxGuests}
            value={guests}
            onChange={(e) => setGuests(Math.max(1, Math.min(property.maxGuests, Number(e.target.value) || 1)))}
          />
        </div>

        {pricing && (
          <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
            <Row label={`${format(nightlyRate)} × ${nightsLabel}`} value={format(pricing.base)} />
            {pricing.appliedDiscountPct > 0 && (
              <Row label={t('booking.widget.discountApplied')} value={`−${pricing.appliedDiscountPct}%`} muted />
            )}
            <Row label={t('booking.widget.serviceFee')} value={format(pricing.serviceFee)} />
            <div style={{ paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontWeight: 'var(--font-weight-bold)' }}>
              <span>{t('booking.widget.total')}</span>
              <span style={{ color: 'var(--color-brand-600)' }}>{format(pricing.total)}</span>
            </div>
          </div>
        )}

        <Button onClick={handleBook} fullWidth disabled={!canBook} style={{ marginTop: 'var(--space-4)' }}>
          {canBook ? t('booking.widget.bookButton') : t('booking.widget.selectDates')}
        </Button>
      </div>

      {checkoutOpen && booking && (
        <CheckoutModal
          booking={booking}
          property={property}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={() => {
            setCheckoutOpen(false);
            toast.success(t('booking.checkout.submitSuccess'));
            router.push(ROUTES.DASHBOARD.TRIPS);
          }}
        />
      )}
    </>
  );
}

function Row({ label, value, muted }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', color: muted ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function CheckoutModal({ booking, property, onClose, onSuccess }) {
  const toast = useToast();
  const { t } = useTranslation();
  const { format } = useCurrency();
  const [method, setMethod] = useState('TELEBIRR');
  const [reference, setReference] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!reference.trim()) {
      toast.error(t('booking.checkout.referenceRequired'));
      return;
    }
    setSubmitting(true);
    try {
      await submitPayment({
        bookingId: booking.id,
        method,
        referenceCode: reference.trim(),
        receiptUrl: receiptUrl.trim() || undefined,
      });
      onSuccess();
    } catch (err) {
      toast.error(
        err?.code ? t(`validation.errors.${err.code}`) : t('booking.checkout.submitError')
      );
    } finally {
      setSubmitting(false);
    }
  }

  const methodName = t(`payment.methods.${method}`);
  const nightsLine = `${booking.nights} ${t('booking.widget.total').toLowerCase()} · ${property.title}`;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={t('booking.checkout.title')}
      description={t('booking.checkout.description', { amount: format(booking.totalEtb), method: methodName })}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('booking.checkout.cancel')}</Button>
          <Button onClick={handleSubmit} isLoading={submitting}>{t('booking.checkout.submit')}</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ background: 'var(--color-brand-50)', border: '1px solid var(--color-brand-200)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase', color: 'var(--color-brand-700)' }}>
            {t('booking.checkout.totalPayable')}
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-black)', color: 'var(--color-brand-900)' }}>
            {format(booking.totalEtb)}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-brand-700)', marginTop: 'var(--space-1)' }}>
            {nightsLine}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
            {t('booking.checkout.methodLabel')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-2)' }}>
            {['TELEBIRR', 'CBE', 'BOA', 'AWASH'].map((m) => (
              <button key={m} type="button" onClick={() => setMethod(m)} style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', border: method === m ? '2px solid var(--color-brand-600)' : '1px solid var(--border)', background: method === m ? 'var(--color-brand-50)' : 'var(--surface)', color: method === m ? 'var(--color-brand-700)' : 'var(--text-secondary)', fontWeight: 'var(--font-weight-bold)', cursor: 'pointer' }}>
                {t(`payment.methods.${m}`)}
              </button>
            ))}
          </div>
        </div>

        <Input
          label={t('booking.checkout.referenceLabel')}
          placeholder={t('booking.checkout.referencePlaceholder')}
          value={reference}
          onChange={(e) => setReference(e.target.value.toUpperCase())}
          helperText={t('booking.checkout.referenceHelp')}
          required
        />

        <Input
          label={t('booking.checkout.receiptLabel')}
          placeholder={t('booking.checkout.receiptPlaceholder')}
          value={receiptUrl}
          onChange={(e) => setReceiptUrl(e.target.value)}
          helperText={t('booking.checkout.receiptHelp')}
        />

        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', padding: 'var(--space-3)', background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)' }}>
          {t('booking.checkout.notice')}
        </div>
      </div>
    </Modal>
  );
}