/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — ReceiptUpload
 * Path: apps/web/src/components/payment/ReceiptUpload.jsx
 *
 * Purpose:
 *   File picker + upload to Cloudinary via signed params from /uploads/sign.
 *   Returns { url, public_id } to the parent. Handles size limits client-side.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, X } from 'lucide-react';
import api from '../../lib/api.js';
import { useToast } from '../../hooks/useToast.js';
import { useI18n } from '../../hooks/useI18n.js';

const MAX_MB = 5;

export default function ReceiptUpload({ value, onChange }) {
  const { t } = useI18n();
  const toast = useToast();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`File too large. Max ${MAX_MB}MB.`);
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      /* 1. Get signed upload params from API */
      const { data: signed } = await api.post('/uploads/sign', {
        category: 'receipt',
      });

      /* 2. Build multipart form */
      const form = new FormData();
      form.append('file', file);
      Object.entries(signed.params).forEach(([k, v]) => form.append(k, v));

      /* 3. POST directly to Cloudinary */
      setProgress(40);
      const res = await fetch(signed.uploadUrl, { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');
      const json = await res.json();
      setProgress(100);

      onChange({
        url: json.secure_url,
        public_id: json.public_id,
        filename: file.name,
      });
      toast.success('Receipt uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div>
      {value ? (
        <div className="flex items-center justify-between gap-3 p-3 rounded-md border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200 truncate">
              {value.filename || 'Receipt attached'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-emerald-700 hover:text-red-600 transition-colors shrink-0"
            aria-label="Remove receipt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full p-6 rounded-md border-2 border-dashed border-border hover:border-brand-500 transition-colors flex flex-col items-center gap-2 disabled:opacity-60"
        >
          <UploadCloud className="w-6 h-6 text-muted" />
          <span className="text-sm font-semibold text-fg">
            {uploading ? `Uploading ${progress}%` : t('booking.payment.uploadHint')}
          </span>
          <span className="text-xs text-muted">
            {t('booking.payment.uploadFormats', { max: MAX_MB })}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}