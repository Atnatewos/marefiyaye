/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Listings Admin Client (Raw HTML, Focus-Safe)
 * Path: apps/web/src/app/(admin)/admin/listings/_ListingsAdminClient.jsx
 *
 * Purpose:
 *   Lists all listings with status filters. Approve / reject / suspend actions.
 *   Approve uses native confirm(). Reject / Suspend require a typed reason via
 *   a raw HTML modal.
 *
 * Focus-safety:
 *   Reason modal uses raw HTML inputs so typing into the reason field does
 *   not lose focus across keystrokes.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/hooks/useI18n.js';
import { useToast } from '@/hooks/useToast.js';
import api from '@/lib/api.js';

/* ── Filter tabs ─────────────────────────────────────────────────────────── */

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending_approval', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
];

/* ── Status badge ────────────────────────────────────────────────────────── */

const STATUS_STYLES = {
  pending_approval: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  suspended: 'bg-gray-100 text-gray-700',
  draft: 'bg-gray-100 text-gray-700',
};

/**
 * Small colored status pill.
 * @param {{ status: string }} props
 * @returns {JSX.Element}
 */
function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || STATUS_STYLES.draft;
  return (
    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${cls}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

/* ── Component ───────────────────────────────────────────────────────────── */

/**
 * Admin listings moderation UI.
 *
 * @param {object} props
 * @param {Array<object>} props.initialListings
 * @returns {JSX.Element}
 */
export default function ListingsAdminClient({ initialListings }) {
  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();

  const [listings, setListings] = useState(initialListings);
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(null);

  /* `rejectTarget` = null | { listing, action: 'reject' | 'suspend' } */
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState('');

  /** Filtered view based on active tab. */
  const filtered =
    filter === 'all' ? listings : listings.filter((l) => l.status === filter);

  /** Approve a listing after native confirm(). */
  const approve = async (listing) => {
    const ok = window.confirm(
      `Approve "${listing.title_en}"? It will become visible to guests.`
    );
    if (!ok) return;
    setBusy(listing.id);
    try {
      await api.patch(`/admin/listings/${listing.id}/moderate`, {
        action: 'approve',
      });
      setListings((prev) =>
        prev.map((l) =>
          l.id === listing.id ? { ...l, status: 'approved', is_verified: true } : l
        )
      );
      toast.success(t('admin.listings.approveSuccess'));
    } catch (err) {
      toast.error(err.message || 'errors.generic');
    } finally {
      setBusy(null);
    }
  };

  /** Opens reject / suspend reason modal. */
  const openReject = (listing, action) => {
    setReason('');
    setRejectTarget({ listing, action });
  };

  /** Submits the reject / suspend with a reason. */
  const submitReject = async () => {
    if (!reason.trim() || !rejectTarget) return;
    const { listing, action } = rejectTarget;
    setBusy(listing.id);
    try {
      await api.patch(`/admin/listings/${listing.id}/moderate`, {
        action,
        reason: reason.trim(),
      });
      setListings((prev) =>
        prev.map((l) =>
          l.id === listing.id
            ? { ...l, status: action === 'reject' ? 'rejected' : 'suspended' }
            : l
        )
      );
      toast.success(
        action === 'reject'
          ? t('admin.listings.rejectSuccess')
          : t('admin.listings.suspendSuccess')
      );
      setRejectTarget(null);
      setReason('');
    } catch (err) {
      toast.error(err.message || 'errors.generic');
    } finally {
      setBusy(null);
    }
  };

  /* ── Render ── */

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Listings moderation</h1>
          <p className="text-sm text-gray-500 mt-1">
            Approve, reject, or suspend listings before they go live.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-bold"
        >
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap ${
                active
                  ? 'border-gray-900 bg-gray-100'
                  : 'border-gray-300 text-gray-500 hover:border-gray-900'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Listings */}
      <div className="space-y-2">
        {filtered.map((listing) => {
          const image = listing.images?.[0]?.url;
          const isBusy = busy === listing.id;
          return (
            <div
              key={listing.id}
              className="flex flex-col sm:flex-row gap-3 p-3 border border-gray-200 rounded-lg"
            >
              {/* Thumbnail */}
              <div className="relative w-full sm:w-24 h-24 rounded-md overflow-hidden bg-gray-100 shrink-0">
                {image ? (
                  <Image
                    src={image}
                    alt={listing.title_en}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                    No image
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={listing.status} />
                  <span className="text-[10px] font-mono text-gray-400">
                    {listing.id.slice(0, 8)}
                  </span>
                </div>
                <p className="font-bold truncate mt-1">{listing.title_en}</p>
                <p className="text-xs text-gray-500">
                  {listing.city} ·{' '}
                  {Number(listing.short_rate).toLocaleString()} ETB / night ·{' '}
                  {Number(listing.long_rate).toLocaleString()} ETB / month
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {listing.status === 'pending_approval' && (
                  <>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => approve(listing)}
                      className="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-md disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => openReject(listing, 'reject')}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-bold"
                    >
                      Reject
                    </button>
                  </>
                )}
                {listing.status === 'approved' && (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => openReject(listing, 'suspend')}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-bold"
                  >
                    Suspend
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">
              No listings in this filter.
            </p>
          </div>
        )}
      </div>

      {/* Reject / Suspend reason modal — raw HTML */}
      {rejectTarget !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {rejectTarget.action === 'suspend'
                  ? 'Suspend listing'
                  : 'Reject listing'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setRejectTarget(null);
                  setReason('');
                }}
                className="text-gray-500 hover:text-gray-800 text-lg leading-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                {rejectTarget.action === 'suspend'
                  ? `Explain why "${rejectTarget.listing.title_en}" is being suspended.`
                  : `Explain why "${rejectTarget.listing.title_en}" is being rejected.`}
              </p>

              <div>
                <label className="block text-sm font-bold mb-1">
                  Reason *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Describe the issue with this listing."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectTarget(null);
                    setReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitReject}
                  disabled={!reason.trim() || busy === rejectTarget.listing.id}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-md disabled:opacity-50"
                >
                  {busy === rejectTarget.listing.id
                    ? 'Saving…'
                    : rejectTarget.action === 'suspend'
                    ? 'Suspend'
                    : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}