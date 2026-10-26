/**
 * @file apps/web/app/(public)/checkout/[bookingId]/page.jsx
 *
 * Checkout page — dedicated payment submission for a booking.
 *
 * Why this file exists:
 *   - The booking widget inline checkout is a shortcut, but a full page
 *     is useful when the user closes the modal by mistake or comes back
 *     to finish payment later.
 *   - Reads `PAYMENT_METHOD_SEEDS` from config (the same seeds the seed
 *     script inserts into the `payment_methods` table).
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Spinner, EmptyState, Badge, useToast } from '@/components/ui';
import { useCurrency } from '@/context/CurrencyContext';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { fetchMyBookings, submitPayment } from '@/lib/bookings';
import { PAYMENT_METHOD_SEEDS } from '@marefiyaye/config/business';
import { ROUTES } from '@marefiyaye/config/app';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();
  const { format } = useCurrency();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [method, setMethod] = useState(PAYMENT_METHOD_SEEDS[0]?.key || 'TELEBIRR');
  const [reference, setReference] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!params?.bookingId) return undefined;
    let cancelled = false;
    setLoading(true);
    fetchMyBookings()
      .then((list) => {
        if (cancelled) return;
        const found = list.find((b) => b.id === params.bookingId);
        if (!found) {
          setError('Booking not found');
        } else if (found.status !== 'PENDING') {
          setError('This booking is not awaiting payment');
        } else {
          setBooking(found);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load booking');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [params?.bookingId]);

  async function handleSubmit(event) {
    event.preventDefault();
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
      toast.success(t('booking.checkout.submitSuccess'));
      router.push(ROUTES.DASHBOARD.TRIPS);
    } catch (err) {
      toast.error(err?.code ? t(`validation.errors.${err.code}`) : t('booking.checkout.submitError'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        <EmptyState
          icon={<span style={{ fontSize: '48px' }}>🧾</span>}
          title="Cannot checkout this booking"
          description={error || 'The booking may have been cancelled or already paid.'}
          actionLabel="Back to trips"
          onAction={() => router.push(ROUTES.DASHBOARD.TRIPS)}
        />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)', maxWidth: '720px' }}>
      <Link href={ROUTES.DASHBOARD.TRIPS} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textDecoration: 'none' }}>
        ← Back to trips
      </Link>

      <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-black)', marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
        {t('booking.checkout.title')}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-8)' }}>
        {booking.property?.title}
      </p>

      <div style={{
        padding: 'var(--space-5)',
        background: 'var(--color-brand-50)',
        border: '1px solid var(--color-brand-200)',
        borderRadius: 'var(--radius-2xl)',
        marginBottom: 'var(--space-6)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-3)', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase', color: 'var(--color-brand-700)' }}>
              {t('booking.checkout.totalPayable')}
            </div>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-black)', color: 'var(--color-brand-900)', marginTop: 4 }}>
              {format(booking.totalEtb)}
            </div>
          </div>
          <Badge variant="warning" size="sm">
            {t('payment.status.PENDING')}
          </Badge>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-brand-700)' }}>
          <span>{String(booking.checkIn).slice(0, 10)} → {String(booking.checkOut).slice(0, 10)}</span>
          <span>{booking.nights} nights</span>
          <span>{booking.guests} guests</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
            {t('booking.checkout.methodLabel')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
            {PAYMENT_METHOD_SEEDS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMethod(m.key)}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  border: method === m.key ? '2px solid var(--color-brand-600)' : '1px solid var(--border)',
                  background: method === m.key ? 'var(--color-brand-50)' : 'var(--surface)',
                  color: method === m.key ? 'var(--color-brand-700)' : 'var(--text-secondary)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>{t(`payment.methods.${m.key}`)}</div>
                {(m.accountNumber || m.accountNo) && (
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginTop: 4 }}>
                    {m.accountNumber || m.accountNo}
                  </div>
                )}
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

        <Button type="submit" isLoading={submitting} fullWidth>
          {t('booking.checkout.submit')}
        </Button>
      </form>
    </div>
  );
}