/**
 * @file apps/web/components/ui/ImageUploader.jsx
 *
 * Drag-and-drop image uploader.
 *
 * Why this component exists:
 *   - Property photos need a professional upload UX.
 *   - Uploads directly to Cloudinary via the API (never exposes keys).
 *   - Supports multiple images with reorder + delete.
 *
 * i18n: every string flows through `t()`.
 */

'use client';

import { useRef, useState } from 'react';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { uploadImage } from '@/lib/uploads';
import { useToast } from '@/components/ui';
import {
  MAX_IMAGE_BYTES,
  ACCEPTED_IMAGE_MIME_TYPES,
} from '@marefiyaye/config/uploads';

export function ImageUploader({ images = [], onChange, folder = 'properties', max = 10 }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  function handleFiles(files) {
    const list = Array.from(files || []);
    if (list.length === 0) return;
    if (images.length + list.length > max) {
      toast.error(t('listing.wizard.photos.tooMany', { max }));
      return;
    }
    setUploading(true);
    Promise.all(
      list.map(async (file) => {
        if (file.size > MAX_IMAGE_BYTES) {
          toast.error(t('listing.wizard.photos.tooBig', { name: file.name }));
          return null;
        }
        if (!ACCEPTED_IMAGE_MIME_TYPES.includes(file.type)) {
          toast.error(t('listing.wizard.photos.badType', { name: file.name }));
          return null;
        }
        try {
          const uploaded = await uploadImage(file, folder);
          return uploaded;
        } catch (err) {
          toast.error(err.message || t('listing.wizard.photos.uploadFailed'));
          return null;
        }
      })
    )
      .then((uploaded) => {
        const successful = uploaded.filter(Boolean).map((img, i) => ({
          url: img.url,
          publicId: img.publicId,
          order: images.length + i,
        }));
        onChange([...images, ...successful]);
      })
      .finally(() => setUploading(false));
  }

  function removeImage(index) {
    const next = images.filter((_, i) => i !== index).map((img, i) => ({ ...img, order: i }));
    onChange(next);
  }

  function moveImage(from, to) {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next.map((img, i) => ({ ...img, order: i })));
  }

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          textAlign: 'center',
          cursor: 'pointer',
          background: 'var(--surface-muted)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_MIME_TYPES.join(',')}
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
        <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>📷</div>
        <div style={{ fontWeight: 'var(--font-weight-bold)' }}>
          {uploading ? t('listing.wizard.photos.uploading') : t('listing.wizard.photos.dropHere')}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
          {t('listing.wizard.photos.limits', { max, mb: Math.round(MAX_IMAGE_BYTES / 1024 / 1024) })}
        </div>
      </div>

      {images.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
          {images.map((img, i) => (
            <div key={`${img.publicId || img.url}-${i}`} style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '1 / 1', background: 'var(--surface-muted)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 4 }}>
                <button type="button" onClick={() => moveImage(i, i - 1)} disabled={i === 0} style={{ padding: '2px 6px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '11px', cursor: 'pointer' }}>←</button>
                <button type="button" onClick={() => moveImage(i, i + 1)} disabled={i === images.length - 1} style={{ padding: '2px 6px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '11px', cursor: 'pointer' }}>→</button>
                <button type="button" onClick={() => removeImage(i)} style={{ padding: '2px 6px', background: 'rgba(220,38,38,0.9)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '11px', cursor: 'pointer' }}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}