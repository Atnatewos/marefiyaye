/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — BookingWidget
 * Path: apps/web/src/components/booking/BookingWidget.jsx
 *
 * Purpose:
 *   Sticky booking panel. Guest picker dropdown works correctly — escapes
 *   parent clipping, renders above Reserve button, closes on Done or click
 *   outside.
 *
 *   Critical layout rules:
 *     - No `overflow-hidden` on the container that holds the picker — it
 *       would clip the popover.
 *     - `divide-y` replaced with per-child border-t so we don't need
 *       overflow-hidden.
 *     - Picker uses `absolute` + `z-50` so it floats above the CTA.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { ChevronDown, CreditCard } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { useRouter } from 'next/navigation';
import api from '../../lib/api.js';
import { Button } from '../ui';
import Calendar from './Calendar.jsx';
import GuestPicker from './GuestPicker.jsx';
import PriceBreakdown from './PriceBreakdown.jsx';
import PaymentModal from '../payment/PaymentModal.jsx';

export default function BookingWidget({ listing }) {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [mode, setMode] = useState('short');
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState({ adults: 1, children: 0, infants: 0 });
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGuests, setShowGuests] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  const guestRef = useRef(null);
  const calendarRef = useRef(null);

  const rate = mode === 'short' ? Number(listing.short_rate) : Number(listing.long_rate);
  const unitLabel = mode === 'short' ? t('common.unit.night') : t('common.unit.month');

  const totalGuests = guests.adults + guests.children;
  const guestSummary =
    totalGuests === 1
      ? `1 ${t('common.unit.guest')}`
      : `${totalGuests} ${t('common.unit.guests')}`;

  const monthsForLong =
    checkIn && checkOut
      ? Math.max(1, Math.ceil(dayjs(checkOut).diff(dayjs(checkIn), 'month', true)))
      : 1;

  /* ── Quote fetch ── */
  useEffect(() => {
    if (!checkIn) {
      setQuote(null);
      return;
    }
    const run = async () => {
      setLoading(true);
      try {
        const payload = {
          listing_id: listing.id,
          rent_mode: mode,
          check_in: dayjs(checkIn).format('YYYY-MM-DD'),
          check_out: checkOut
            ? dayjs(checkOut).format('YYYY-MM-DD')
            : dayjs(checkIn).add(1, 'day').format('YYYY-MM-DD'),
          guests,
        };
        if (mode === 'long') payload.months = monthsForLong;

        const { data } = await api.post('/bookings/quote', payload);
        setQuote(data?.quote || null);
      } catch {
        setQuote(null);
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, checkIn, checkOut, guests, listing.id]);

  /* ── Outside-click handlers ── */
  useEffect(() => {
    if (!showGuests) return;
    const onClick = (e) => {
      if (guestRef.current && !guestRef.current.contains(e.target)) {
        setShowGuests(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showGuests]);

  useEffect(() => {
    if (!showCalendar) return;
    const onClick = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showCalendar]);

  const handleReserve = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to book');
      router.push('/login');
      return;
    }
    if (!checkIn || !checkOut || !quote) {
      toast.error('Pick your dates first');
      return;
    }

    const payload = {
      listing_id: listing.id,
      rent_mode: mode,
      check_in: dayjs(checkIn).format('YYYY-MM-DD'),
      check_out: dayjs(checkOut).format('YYYY-MM-DD'),
      guests,
    };
    if (mode === 'long') payload.months = monthsForLong;

    try {
      const { data } = await api.post('/bookings', payload);
      setCreatedBooking(data.booking);
      setShowPayment(true);
    } catch (err) {
      toast.error(err.message || 'Could not create booking');
    }
  };

  return (
    <>
      <div className="bg-bg border border-border rounded-lg p-4 sm:p-6 shadow-card sm:sticky sm:top-24">
        <div className="space-y-4">
          {/* Price */}
          <div className="flex items-baseline justify-between pb-3 border-b border-border">
            <div>
              <span className="text-2xl font-extrabold text-fg">
                {rate.toLocaleString()} ETB
              </span>
              <span className="text-sm text-muted"> / {unitLabel}</span>
            </div>
          </div>

          {/* Mode tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-md text-xs font-bold text-center">
            <button
              type="button"
              onClick={() => setMode('short')}
              className={`py-2 rounded ${mode === 'short' ? 'bg-bg shadow-sm text-fg' : 'text-muted'}`}
            >
              {t('listings.widget.tabShort')}
            </button>
            <button
              type="button"
              onClick={() => setMode('long')}
              className={`py-2 rounded ${mode === 'long' ? 'bg-bg shadow-sm text-fg' : 'text-muted'}`}
            >
              {t('listings.widget.tabLong')}
            </button>
          </div>

          {/* Dates + guests block — NO overflow-hidden */}
          <div className="border border-border rounded-md">

            {/* Dates row */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setShowCalendar((v) => !v);
                setShowGuests(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && setShowCalendar((v) => !v)}
              className="grid grid-cols-2 divide-x divide-border cursor-pointer"
            >
              <div className="p-3">
                <span className="block text-[10px] font-extrabold text-fg uppercase tracking-wider">
                  {t('listings.widget.checkIn')}
                </span>
                <span className="block text-sm font-semibold text-fg mt-0.5">
                  {checkIn ? dayjs(checkIn).format('MMM D') : t('listings.widget.addDate')}
                </span>
              </div>
              <div className="p-3">
                <span className="block text-[10px] font-extrabold text-fg uppercase tracking-wider">
                  {t('listings.widget.checkOut')}
                </span>
                <span className="block text-sm font-semibold text-fg mt-0.5">
                  {checkOut ? dayjs(checkOut).format('MMM D') : t('listings.widget.addDate')}
                </span>
              </div>
            </div>

            {/* Guests row + picker */}
            <div
              ref={guestRef}
              className="relative border-t border-border"
            >
              <button
                type="button"
                onClick={() => {
                  setShowGuests((v) => !v);
                  setShowCalendar(false);
                }}
                className="w-full p-3 text-left flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-b-md"
              >
                <div>
                  <span className="block text-[10px] font-extrabold text-fg uppercase tracking-wider">
                    {t('listings.widget.guests')}
                  </span>
                  <span className="block text-sm font-semibold text-fg mt-0.5">
                    {guestSummary}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-muted transition-transform ${showGuests ? 'rotate-180' : ''}`}
                />
              </button>

              {showGuests && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-bg border border-border rounded-lg shadow-modal">
                  <GuestPicker
                    value={guests}
                    onChange={setGuests}
                    onDone={() => setShowGuests(false)}
                    maxGuests={listing.max_guests}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Calendar panel */}
          {showCalendar && (
            <div ref={calendarRef} className="border border-border rounded-md p-3 bg-bg">
              <Calendar
                checkIn={checkIn}
                checkOut={checkOut}
                onChange={({ checkIn: ci, checkOut: co }) => {
                  setCheckIn(ci);
                  setCheckOut(co);
                  if (ci && co) setShowCalendar(false);
                }}
              />
            </div>
          )}

          {/* CTA */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleReserve}
            disabled={loading || !quote}
            leftIcon={CreditCard}
          >
            {t('listings.widget.reserveCta')}
          </Button>

          <p className="text-xs text-muted text-center">
            {t('listings.widget.paymentNote')}
          </p>

          {quote && (
            <div className="pt-3 border-t border-border">
              <PriceBreakdown quote={quote} />
            </div>
          )}
        </div>
      </div>

      {createdBooking && (
        <PaymentModal
          open={showPayment}
          onClose={() => setShowPayment(false)}
          booking={createdBooking}
        />
      )}
    </>
  );
}