/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — PaymentReviewCard
 * Path: apps/web/src/components/admin/PaymentReviewCard.jsx
 *
 * Purpose:
 *   Rich card for reviewing a manual payment submission. Shows:
 *     - Guest, booking code, amount
 *     - Transaction reference
 *     - Receipt thumbnail (opens in new tab)
 *     - Verify / Reject actions (with confirm modal)
 *     - Rejection requires a reason (inline prompt)
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button, Badge, Input, Modal } from '@/components/ui';
import { useConfirm } from '@/hooks/useConfirm.js';
import { useI18n } from '@/hooks/useI18n.js';
import { useToast } from '@/hooks/useToast.js';
import api from '@/lib/api.js';

export default function PaymentReviewCard({ payment, onChanged }) {
  const { t } = useI18n();
  const toast = useToast();
  const confirm = useConfirm();

  const [busy, setBusy] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  /**
   * Verifies the payment. Uses confirm() to prevent accidental clicks.
   */
  const handleVerify = async () => {
    const ok = await confirm({
      title: t('admin.payments.confirmVerifyTitle'),
      description: t('admin.payments.confirmVerifyDesc', {
        amount: Number(payment.amount).toLocaleString(),
        code: payment.booking_code,
      }),
      confirmLabel: t('admin.payments.verify'),
      variant: 'primary',
    });
    if (!ok) return;

    setBusy(true);
    try {
      await api.post(`/admin/payments/${payment.id}/verify`);
      toast.success(t('admin.payments.verifiedSuccess'));
      onChanged?.();
    } catch (err) {
      toast.error(err.message || 'errors.generic');
    } finally {
      setBusy(false);
    }
  };

  /**
   * Opens the reject dialog. On submit, calls the API.
   */
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error(t('validation.admin.reasonRequired'));
      return;
    }
    setBusy(true);
    try {
      await api.post(`/admin/payments/${payment.id}/reject`, {
        reason: rejectReason.trim(),
      });
      toast.success(t('admin.payments.rejectedSuccess'));
      setRejectOpen(false);
      setRejectReason('');
      onChanged?.();
    } catch (err) {
      toast.error(err.message || 'errors.generic');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="rounded-lg border border-border bg-bg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-4 p-4">
          {/* Receipt thumbnail */}
          <a
            href={payment.receipt_url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-full md:w-[120px] aspect-square rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800 group"
          >
            <Image
              src={payment.receipt_url}
              alt="Receipt"
              fill
              sizes="120px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>

          {/* Details */}
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="info" size="sm">{payment.method}</Badge>
              <span className="text-[10px] font-mono text-muted">{payment.booking_code}</span>
            </div>
            <p className="font-bold text-fg">
              {Number(payment.amount).toLocaleString()} ETB
            </p>
            <p className="text-xs text-muted">
              {payment.user_name || payment.user_email}
            </p>
            <p className="text-xs text-muted">
              <span className="font-mono">{payment.reference}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-row md:flex-col gap-2 md:items-end">
            <Button
              variant="primary"
              size="sm"
              leftIcon={busy ? Loader2 : CheckCircle2}
              onClick={handleVerify}
              disabled={busy}
            >
              {t('admin.payments.verify')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={XCircle}
              onClick={() => setRejectOpen(true)}
              disabled={busy}
            >
              {t('admin.payments.reject')}
            </Button>
          </div>
        </div>
      </div>

      {/* Reject modal */}
      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title={t('admin.payments.rejectTitle')}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {t('admin.payments.rejectDesc', { code: payment.booking_code })}
          </p>
          <Input
            label={t('admin.payments.rejectReasonLabel')}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={t('admin.payments.rejectReasonPlaceholder')}
            required
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRejectOpen(false)}>
              {t('common.button.cancel')}
            </Button>
            <Button variant="danger" loading={busy} onClick={handleReject}>
              {t('admin.payments.reject')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}