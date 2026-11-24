/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Detail Page Client
 * Path: apps/web/src/app/stays/[id]/_DetailClient.jsx
 *
 * Purpose:
 *   Airbnb-style detail page. Mobile-first:
 *     - Mobile: stacked sections (gallery → header → widgets → left → right → info)
 *     - md+:    2-col layout (7/5 split — left content, right sticky widget)
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { Star, ShieldCheck, MapPin } from 'lucide-react';
import { useI18n } from '../../../hooks/useI18n.js';
import Container from '../../../components/layout/Container.jsx';
import Stack from '../../../components/layout/Stack.jsx';
import Breadcrumb from '../../../components/layout/Breadcrumb.jsx';
import PropertyGallery from '../../../components/listings/PropertyGallery.jsx';
import AmenitiesList from '../../../components/listings/AmenitiesList.jsx';
import BookingWidget from '../../../components/booking/BookingWidget.jsx';

export default function DetailClient({ listing }) {
  const { t, lang } = useI18n();
  const title = lang === 'am' && listing.title_am ? listing.title_am : listing.title_en;
  const description =
    lang === 'am' && listing.description_am ? listing.description_am : listing.description_en;

  return (
    <>
      <Breadcrumb
        items={[
          { label: t('common.nav.explore'), href: '/stays' },
          { label: title },
        ]}
      />

      <Container>
        <Stack size="lg" className="py-6 sm:py-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-fg">
              {title}
            </h1>
            <div className="flex items-center flex-wrap gap-3 text-xs text-muted mt-2">
              <span className="flex items-center gap-1 font-bold text-fg">
                <Star className="w-3.5 h-3.5 fill-fg" />
                4.9 (0 reviews)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {listing.city}
                {listing.subcity ? `, ${listing.subcity}` : ''}
              </span>
              {listing.is_verified && (
                <>
                  <span>•</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {t('listings.detail.verifiedListing')}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Gallery */}
          <PropertyGallery images={listing.images || []} title={title} />

          {/* Body: 2-col on lg+ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-2">
            {/* Left column */}
            <div className="lg:col-span-7 space-y-8">
              {/* Host + BedBath */}
              <div className="pb-6 border-b border-border">
                <h2 className="text-lg font-bold text-fg">
                  {t('listings.detail.hostedBy', { type: listing.property_type })}
                </h2>
                <p className="text-xs text-muted mt-1">
                  {listing.bedrooms} {t('common.unit.rooms')} • {listing.bathrooms}{' '}
                  {t('common.unit.baths')} •{' '}
                  {listing.is_furnished ? t('listings.detail.furnished') : t('listings.detail.unfurnished')}
                </p>
              </div>

              {/* Description */}
              <div className="pb-6 border-b border-border">
                <h3 className="text-base font-bold text-fg mb-2">
                  {t('listings.detail.about')}
                </h3>
                <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>

              {/* Amenities */}
              <div className="pb-6 border-b border-border">
                <h3 className="text-base font-bold text-fg mb-3">
                  {t('listings.detail.amenities')}
                </h3>
                <AmenitiesList amenities={listing.amenities || []} />
              </div>

              {/* House rules */}
              <div>
                <h3 className="text-base font-bold text-fg mb-3">
                  {t('listings.detail.houseRules')}
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 text-xs text-muted">
                  <div className="p-3 rounded-md bg-neutral-50 dark:bg-neutral-800/50 border border-border">
                    <p className="font-bold text-fg mb-1">
                      {t('listings.detail.flexibleCancellation')}
                    </p>
                    <p>{t('listings.detail.flexibleCancellationDesc')}</p>
                  </div>
                  <div className="p-3 rounded-md bg-neutral-50 dark:bg-neutral-800/50 border border-border">
                    <p className="font-bold text-fg mb-1">
                      {t('listings.detail.bankGuarantee')}
                    </p>
                    <p>{t('listings.detail.bankGuaranteeDesc')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: booking widget */}
            <div className="lg:col-span-5">
              <BookingWidget listing={listing} />
            </div>
          </div>
        </Stack>
      </Container>
    </>
  );
}