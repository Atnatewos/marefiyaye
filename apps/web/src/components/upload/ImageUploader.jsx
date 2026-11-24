/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — ImageUploader (Bulletproof Drag & Drop)
 * Path: apps/web/src/components/upload/ImageUploader.jsx
 *
 * Purpose:
 *   Multi-image uploader with drag & drop, paste, URL fetch, and reorderable
 *   thumbnails. Every accepted image goes through Cloudinary via signed URL.
 *
 *   Architecture note on drag & drop:
 *     Local drop zones on a specific <div> are fragile — they break when:
 *       • A parent captures dragover with stopPropagation
 *       • A form wraps the target
 *       • The drop zone is partially offscreen on mobile
 *       • A browser extension injects overlays
 *
 *     The professional solution (used by Gmail, Notion, Dropbox) is a
 *     GLOBAL drop handler attached to `document` that:
 *       1. Listens to `dragenter`/`dragover`/`dragleave`/`drop` on the
 *          entire window
 *       2. Shows a full-screen overlay when files are dragged anywhere
 *       3. Accepts the drop no matter where the user releases
 *       4. Cleans up on unmount
 *
 *     We keep a local visible drop zone as a visual affordance, but the
 *     actual event handling is global — so drag from OS, from another tab,
 *     from Finder/Explorer, all work reliably.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  UploadCloud, Trash2, Loader2, ImagePlus, Clipboard, Link2,
  GripVertical, ArrowLeft, ArrowRight,
} from 'lucide-react';
import api from '@/lib/api.js';
import { useToast } from '@/hooks/useToast.js';
import { useI18n } from '@/hooks/useI18n.js';
import { cn } from '@/lib/utils.js';

const MAX_MB = 5;

/**
 * Whitelist — must match the API's `allowed_formats`.
 * Anything outside this list is rejected client-side with a helpful toast.
 */
const ACCEPTED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_LABEL = 'JPG, PNG, WEBP';

/**
 * Fetches a remote URL and returns a File object. Used when the user drops
 * a link or an <img> element from another webpage.
 *
 * @param {string} url
 * @returns {Promise<File>}
 */
async function urlToFile(url) {
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error('Could not fetch image');
  const blob = await res.blob();
  if (!ACCEPTED_MIMES.includes(blob.type)) {
    throw new Error(`Unsupported image type: ${blob.type}`);
  }
  const ext = blob.type.split('/')[1] || 'jpg';
  return new File([blob], `imported.${ext}`, { type: blob.type });
}

export default function ImageUploader({
  value = [],
  onChange,
  maxImages = 10,
  category = 'listing',
}) {
  const { t } = useI18n();
  const toast = useToast();

  const inputRef = useRef(null);
  const dragDepthRef = useRef(0);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [globalDragging, setGlobalDragging] = useState(false);

  /** Reorder-by-drag state */
  const reorderIndexRef = useRef(null);
  const [reorderOver, setReorderOver] = useState(null);

  /* ── Cloudinary upload ── */

  const uploadToCloudinary = useCallback(
    async (file) => {
      const { data: signed } = await api.post('/uploads/sign', { category });

      const form = new FormData();
      form.append('file', file);
      Object.entries(signed.params).forEach(([k, v]) => form.append(k, v));

      const res = await fetch(signed.uploadUrl, { method: 'POST', body: form });

      if (!res.ok) {
        let message = `HTTP ${res.status}`;
        try {
          const body = await res.json();
          message = body?.error?.message || JSON.stringify(body);
        } catch {
          /* non-JSON error */
        }
        console.error('[ImageUploader] Cloudinary rejected upload:', {
          status: res.status,
          message,
          file: { name: file.name, type: file.type, size: file.size },
        });
        throw new Error(message);
      }

      const json = await res.json();
      return { url: json.secure_url, public_id: json.public_id };
    },
    [category]
  );

  /* ── Batch upload ── */

  const handleFiles = useCallback(
    async (files) => {
      const valid = [];
      for (const f of files) {
        if (!(f instanceof File) || f.size === 0) continue;
        if (!ACCEPTED_MIMES.includes(f.type)) {
          toast.error(`${f.name || 'File'}: unsupported type (${ACCEPTED_LABEL})`);
          continue;
        }
        if (f.size > MAX_MB * 1024 * 1024) {
          toast.error(`${f.name || 'File'}: ${t('errors.upload.tooLarge', { max: MAX_MB })}`);
          continue;
        }
        valid.push(f);
      }

      if (!valid.length) return;

      const slotsLeft = maxImages - value.length;
      if (slotsLeft <= 0) {
        toast.error(t('host.newListing.imageLimit', { max: maxImages }));
        return;
      }

      const accepted = valid.slice(0, slotsLeft);
      setUploading(true);
      setProgress({ done: 0, total: accepted.length });

      const uploaded = [];
      for (const file of accepted) {
        try {
          const { url, public_id } = await uploadToCloudinary(file);
          uploaded.push({
            url,
            public_id,
            alt: '',
            order: value.length + uploaded.length,
          });
        } catch (err) {
          toast.error(err.message || t('errors.upload.failed'));
        }
        setProgress((p) => ({ ...p, done: p.done + 1 }));
      }

      if (uploaded.length) {
        onChange([...value, ...uploaded]);
        toast.success(t('host.newListing.imagesUploaded', { count: uploaded.length }));
      }

      setUploading(false);
      setProgress({ done: 0, total: 0 });
    },
    [value, onChange, maxImages, uploadToCloudinary, toast, t]
  );

  /* ── GLOBAL drag & drop (bulletproof) ── */

  useEffect(() => {
    /**
     * True if the drag carries files (from OS, another app, or another tab).
     * Drags of text, links, or in-page elements return false.
     *
     * @param {DragEvent} e
     * @returns {boolean}
     */
    const hasFiles = (e) =>
      e.dataTransfer &&
      Array.from(e.dataTransfer.types || []).includes('Files');

    /**
     * True if the drag carries a URL (link or image from another tab).
     *
     * @param {DragEvent} e
     * @returns {boolean}
     */
    const hasUrl = (e) =>
      e.dataTransfer &&
      (e.dataTransfer.types || []).includes('text/uri-list');

    const onDragEnter = (e) => {
      if (!hasFiles(e) && !hasUrl(e)) return;
      e.preventDefault();
      dragDepthRef.current += 1;
      setGlobalDragging(true);
    };

    const onDragOver = (e) => {
      if (!hasFiles(e) && !hasUrl(e)) return;
      /* CRITICAL — without this the drop never fires */
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    };

    const onDragLeave = (e) => {
      if (!hasFiles(e) && !hasUrl(e)) return;
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      /* Only hide overlay when all drags have left */
      if (dragDepthRef.current === 0) setGlobalDragging(false);
    };

    const onDrop = async (e) => {
      if (!hasFiles(e) && !hasUrl(e)) return;
      e.preventDefault();
      dragDepthRef.current = 0;
      setGlobalDragging(false);

      /* Case 1 — OS file drop */
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        await handleFiles(Array.from(e.dataTransfer.files));
        return;
      }

      /* Case 2 — URL drop from another webpage */
      const url =
        e.dataTransfer.getData('text/uri-list') ||
        e.dataTransfer.getData('text/plain');
      if (url && /^https?:\/\//.test(url)) {
        try {
          const file = await urlToFile(url);
          await handleFiles([file]);
        } catch (err) {
          toast.error(err.message || t('errors.upload.failed'));
        }
      }
    };

    /* Attach to document — survives parent rerenders and form wrapping */
    document.addEventListener('dragenter', onDragEnter);
    document.addEventListener('dragover', onDragOver);
    document.addEventListener('dragleave', onDragLeave);
    document.addEventListener('drop', onDrop);

    return () => {
      document.removeEventListener('dragenter', onDragEnter);
      document.removeEventListener('dragover', onDragOver);
      document.removeEventListener('dragleave', onDragLeave);
      document.removeEventListener('drop', onDrop);
    };
  }, [handleFiles, toast, t]);

  /* ── Paste from clipboard ── */

  useEffect(() => {
    const onPaste = async (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files = [];
      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length) {
        e.preventDefault();
        await handleFiles(files);
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [handleFiles]);

  /* ── Remove ── */

  const removeImage = (index) => {
    const next = value.filter((_, i) => i !== index);
    onChange(next.map((img, i) => ({ ...img, order: i })));
  };

  /* ── Move by arrow ── */

  const moveImage = (from, to) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next.map((img, i) => ({ ...img, order: i })));
  };

  /* ── Reorder by dragging thumbnails ── */

  const thumbDragStart = (i) => (e) => {
    reorderIndexRef.current = i;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(i));
    /* CRITICAL — stop the global OS drag handler from showing the overlay */
    e.stopPropagation();
  };

  const thumbDragOver = (i) => (e) => {
    if (reorderIndexRef.current === null) return;
    e.preventDefault();
    setReorderOver(i);
  };

  const thumbDragEnd = () => {
    reorderIndexRef.current = null;
    setReorderOver(null);
  };

  const thumbDrop = (i) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const from = reorderIndexRef.current;
    if (from === null || from === i) {
      thumbDragEnd();
      return;
    }
    moveImage(from, i);
    thumbDragEnd();
  };

  /* ── Render ── */

  return (
    <>
      {/* Full-page overlay when dragging anywhere */}
      {globalDragging && (
        <div className="fixed inset-0 z-[100] bg-brand-500/20 backdrop-blur-sm flex items-center justify-center pointer-events-none animate-fade-in">
          <div className="bg-bg border-2 border-dashed border-brand-500 rounded-lg p-10 shadow-modal text-center">
            <UploadCloud className="w-14 h-14 text-brand-500 mx-auto mb-4" />
            <p className="text-lg font-extrabold text-fg">
              {t('host.newListing.dropAnywhere')}
            </p>
            <p className="text-sm text-muted mt-1">
              {t('host.newListing.imageLimit', { max: maxImages })}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {/* Thumbnails */}
        {value.length > 0 && (
          <>
            <p className="text-xs text-muted">{t('host.newListing.reorderHint')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {value.map((img, i) => (
                <div
                  key={img.public_id || i}
                  draggable
                  onDragStart={thumbDragStart(i)}
                  onDragOver={thumbDragOver(i)}
                  onDragEnd={thumbDragEnd}
                  onDrop={thumbDrop(i)}
                  className={cn(
                    'relative aspect-square rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800 group cursor-move',
                    reorderOver === i && 'ring-2 ring-brand-500',
                    reorderIndexRef.current === i && 'opacity-50'
                  )}
                >
                  <Image
                    src={img.url}
                    alt={img.alt || `Image ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover pointer-events-none"
                  />

                  <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    aria-label={t('common.button.delete')}
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="absolute bottom-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(i, i - 1)}
                        aria-label={t('host.newListing.moveLeft')}
                        className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {i < value.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(i, i + 1)}
                        aria-label={t('host.newListing.moveRight')}
                        className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {i === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold bg-brand-500 text-white px-1.5 py-0.5 rounded">
                      {t('host.newListing.coverLabel')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Drop zone — visually inviting; real handling is global */}
        <div
          className={cn(
            'rounded-md border-2 border-dashed transition-colors',
            'flex flex-col items-center justify-center gap-3 p-6',
            'border-border bg-bg hover:border-brand-500'
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
              <p className="text-sm font-semibold text-fg">
                {t('common.state.loading')} ({progress.done}/{progress.total})
              </p>
            </>
          ) : (
            <>
              <ImagePlus className="w-8 h-8 text-muted" />
              <p className="text-sm font-semibold text-fg">
                {t('host.newListing.addImages')}
              </p>
              <p className="text-xs text-muted text-center max-w-sm">
                {t('host.newListing.dropHint')}
              </p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={value.length >= maxImages}
                className="mt-1 text-xs font-bold text-brand-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('host.newListing.browseFiles')}
              </button>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(Array.from(e.target.files || []));
            e.target.value = '';
          }}
        />

        <div className="flex items-center justify-center gap-4 text-[11px] text-muted">
          <span className="flex items-center gap-1">
            <UploadCloud className="w-3.5 h-3.5" />
            {t('host.newListing.hintDrop')}
          </span>
          <span className="flex items-center gap-1">
            <Clipboard className="w-3.5 h-3.5" />
            {t('host.newListing.hintPaste')}
          </span>
          <span className="flex items-center gap-1">
            <Link2 className="w-3.5 h-3.5" />
            {t('host.newListing.hintUrl')}
          </span>
        </div>
      </div>
    </>
  );
}