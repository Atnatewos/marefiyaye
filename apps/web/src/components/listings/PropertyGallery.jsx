/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — PropertyGallery
 * Path: apps/web/src/components/listings/PropertyGallery.jsx
 *
 * Purpose:
 *   Responsive property image gallery.
 *     - Mobile  : horizontal scroll-snap carousel
 *     - md+     : 5-image grid (1 large + 4 small)
 *   Falls back to a single "No images" placeholder if none.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Modal } from '../ui';

export default function PropertyGallery({ images = [], title = '' }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!images.length) {
    return (
      <div className="w-full aspect-[16/9] rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-muted text-sm">
        No images available
      </div>
    );
  }

  const open = (index) => setOpenIndex(index);
  const close = () => setOpenIndex(null);
  const prev = () => setOpenIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setOpenIndex((i) => (i + 1) % images.length);

  return (
    <>
      {/* ── Mobile: scroll-snap carousel ── */}
      <div className="md:hidden -mx-4 sm:-mx-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory flex gap-2 px-4 sm:px-6 pb-1">
        {images.map((img, i) => (
          <button
            key={img.public_id || i}
            type="button"
            onClick={() => open(i)}
            className="relative shrink-0 w-[85%] aspect-[4/3] rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 snap-center"
          >
            <Image
              src={img.url}
              alt={img.alt || `${title} — ${i + 1}`}
              fill
              sizes="85vw"
              className="object-cover"
              priority={i === 0}
            />
          </button>
        ))}
      </div>

      {/* ── Desktop: 5-image grid ── */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 rounded-lg overflow-hidden aspect-[2/1] max-h-[480px]">
        <button
          type="button"
          onClick={() => open(0)}
          className="col-span-2 row-span-2 relative bg-neutral-100 dark:bg-neutral-800 group"
        >
          <Image
            src={images[0].url}
            alt={images[0].alt || title}
            fill
            sizes="(max-width: 1024px) 50vw, 40vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            priority
          />
        </button>

        {images.slice(1, 5).map((img, i) => (
          <button
            key={img.public_id || i}
            type="button"
            onClick={() => open(i + 1)}
            className="relative bg-neutral-100 dark:bg-neutral-800 group"
          >
            <Image
              src={img.url}
              alt={img.alt || `${title} — ${i + 2}`}
              fill
              sizes="(max-width: 1024px) 25vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      {/* ── Lightbox ── */}
      {openIndex !== null && (
        <Modal open={openIndex !== null} onClose={close} size="xl">
          <div className="relative -m-5">
            <div className="relative w-full aspect-[16/10] bg-black">
              <Image
                src={images[openIndex].url}
                alt={images[openIndex].alt || title}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>

            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-neutral-800/90 text-fg flex items-center justify-center hover:scale-105 transition-transform"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-neutral-800/90 text-fg flex items-center justify-center hover:scale-105 transition-transform"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-neutral-800/90 text-fg flex items-center justify-center hover:scale-105 transition-transform"
            >
              <X className="w-4 h-4" />
            </button>

            <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-black/60 px-2.5 py-1 rounded-full">
              {openIndex + 1} / {images.length}
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}