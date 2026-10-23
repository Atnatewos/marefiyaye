/**
 * @file apps/web/components/booking/ReviewForm.jsx
 *
 * Review submission modal for COMPLETED bookings.
 *
 * Why this component exists:
 *   - Guests must be able to leave reviews after their stay.
 *   - Rating (1-5 stars) + optional comment.
 *   - Same endpoint powers the public display via aggregate refresh.
 */

'use client';

import { useState } from 'react';
import { Button, Modal, Input, useToast } from '@/components/ui';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { submitReview } from '@/lib/reviews';

export function ReviewForm({ booking, isOpen, onClose, onSubmitted }) {
  const toast = useToast();
  const { t } = useTranslation();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await submitReview({
        bookingId: booking.id,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success(t('property.reviews.submitSuccess'));
      onSubmitted?.();
      onClose();
    } catch (err) {
      toast.error(err?.code ? t(`validation.errors.${err.code}`) : t('property.reviews.submitError'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('property.reviews.submitTitle')}
      description={booking?.property?.title || ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('common.buttons.cancel')}</Button>
          <Button onClick={handleSubmit} isLoading={submitting}>{t('property.reviews.submit')}</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
            {t('property.reviews.rating')}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                style={{
                  fontSize: '36px',
                  lineHeight: 1,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: n <= rating ? 'var(--color-brand-500)' : 'var(--color-slate-300)',
                  padding: 0,
                }}
                aria-label={`${n} stars`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <Input
          label={t('property.reviews.commentLabel')}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('property.reviews.commentPlaceholder')}
        />
      </div>
    </Modal>
  );
}