/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — PaymentModal
 * Path: apps/web/src/components/payment/PaymentModal.jsx
 *
 * Purpose:
 *   Two-step manual payment flow:
 *     1. Show bank accounts + ref + receipt upload
 *     2. Submit to /payments → close + redirect to booking page
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n.js';
import { useToast } from '../../hooks/useToast.js';
import api from '../../lib/api.js';
import { Modal, Button, Input } from '../ui';
import BankAccountsList from './BankAccountsList.jsx';
import ReceiptUpload from './ReceiptUpload.jsx';

export default function PaymentModal({ open, onClose, booking }) {
  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();

  const [reference, setReference] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const amount = booking?.total || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reference.trim()) {
      toast.error('Please enter the transaction reference');
      return;
    }
    if (!receipt) {
      toast.error('Please upload a payment receipt');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/payments', {
        booking_id: booking.id,
        method: 'bank_transfer',
        reference: reference.trim(),
        receipt_url: receipt.url,
        receipt_public_id: receipt.public_id,
        amount: Number(amount),
        currency: 'ETB',
      });
      toast.success(t('booking.payment.submitted'));
      onClose();
      router.push(`/bookings/${booking.id}`);
    } catch (err) {
      toast.error(err.message || 'Payment submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('booking.payment.manualBankTitle')}
      description={t('booking.payment.manualBankSubtitle')}
      size="lg"
    >
      {/* Summary */}
      <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-md border border-border flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold text-muted uppercase">Booking</p>
          <p className="text-sm font-bold text-fg">{booking?.code}</p>
        </div>
        <p className="text-lg font-extrabold text-brand-500">
          {Number(amount).toLocaleString()} ETB
        </p>
      </div>

      {/* Bank accounts */}
      <div className="mb-4">
        <p className="text-[10px] font-extrabold text-muted uppercase mb-2">
          1. {t('booking.payment.step1')}
        </p>
        <BankAccountsList />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('booking.payment.step2')}
          placeholder="e.g. FT24098XXXXX"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-bold text-fg mb-1.5">
            {t('booking.payment.step3')}
          </label>
          <ReceiptUpload value={receipt} onChange={setReceipt} />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={submitting}
          leftIcon={ShieldCheck}
        >
          {t('booking.payment.confirmCta')}
        </Button>
      </form>
    </Modal>
  );
}