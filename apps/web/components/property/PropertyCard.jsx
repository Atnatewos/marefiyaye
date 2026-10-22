/**
 * @file apps/web/components/property/PropertyCard.jsx
 *
 * Property card — the most visible UI element in the platform.
 *
 * Why this component exists:
 *   - Home feed, search results, wishlist, and host dashboard all render
 *     properties as cards.
 *   - Matches the reference prototype's card exactly.
 *   - Accepts property data shaped for the DB schema (snake_case or camelCase —
 *     see propTypes below).
 *
 * Usage:
 *   <PropertyCard
 *     property={property}
 *     isWishlisted={wishlist.has(property.id)}
 *     onWishlistToggle={() => toggleWishlist(property.id)}
 *     onCardClick={() => router.push(ROUTES.PUBLIC.PROPERTY(property.slug))}
 *     formatPrice={(amount) => formatPrice(amount)}
 *   />
 */

'use client';

import { classNames } from '@/lib/classNames';
import { STAY_TYPES } from '@marefiyaye/config/business';
import styles from './PropertyCard.module.css';

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

function HotelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V7l9-4 9 4v14" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="15" r="4" />
      <path d="M10.85 12.15L19 4h3v3l-8.15 8.15" />
    </svg>
  );
}

/**
 * Property card.
 *
 * @param {object} props
 * @param {object} props.property
 * @param {string} props.property.id
 * @param {string} props.property.title
 * @param {string} props.property.city
 * @param {string} [props.property.neighborhood]
 * @param {string} [props.property.stayType] - 'SHORT_TERM' | 'LONG_TERM' | 'HYBRID'
 * @param {number} [props.property.nightlyRateEtb]
 * @param {number} [props.property.monthlyRateEtb]
 * @param {number} [props.property.ratingAvg]
 * @param {number} [props.property.reviewCount]
 * @param {number} [props.property.beds]
 * @param {number} [props.property.baths]
 * @param {number} [props.property.maxGuests]
 * @param {Array<{url: string}>} [props.property.images]
 * @param {boolean} [props.isWishlisted=false]
 * @param {() => void} [props.onWishlistToggle]
 * @param {() => void} props.onCardClick
 * @param {(amount: number) => string} [props.formatPrice]
 * @param {string} [props.className]
 */
export function PropertyCard({
  property,
  isWishlisted = false,
  onWishlistToggle,
  onCardClick,
  formatPrice = (amount) => `${amount} ETB`,
  className = '',
}) {
  const primaryImage = property.images?.[0]?.url || '';
  const isLongTerm = property.stayType === STAY_TYPES.LONG_TERM;
  const isHybrid = property.stayType === STAY_TYPES.HYBRID;

  const stayLabel = (property.stayType || '').replace('_', ' ');
  const location = property.neighborhood
    ? `${property.neighborhood}, ${property.city}`
    : property.city;

  function handleWishlistClick(event) {
    event.stopPropagation();
    event.preventDefault();
    onWishlistToggle?.();
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onCardClick?.();
      }}
      className={classNames(styles.card, className)}
      aria-label={`${property.title} in ${location}`}
    >
      {/* Image + overlays */}
      <div className={styles.imageWrapper}>
        {primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={primaryImage} alt={property.title} className={styles.image} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--color-slate-100)' }} />
        )}

        {/* Stay type badge */}
        {property.stayType && (
          <div className={styles.stayBadge}>
            <span className={classNames(styles.stayBadgeIcon, isLongTerm ? styles.longTermBadge : styles.shortTermBadge)}>
              {isLongTerm ? <KeyIcon /> : <HotelIcon />}
            </span>
            {stayLabel}
          </div>
        )}

        {/* Wishlist heart */}
        {onWishlistToggle && (
          <button
            type="button"
            onClick={handleWishlistClick}
            className={classNames(styles.heartButton, isWishlisted && styles.wishlisted)}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={isWishlisted}
          >
            <HeartIcon filled={isWishlisted} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div>
          <div className={styles.meta}>
            <span className={styles.location}>
              <LocationIcon />
              <span className={styles.locationText}>{location}</span>
            </span>
            {property.ratingAvg > 0 && (
              <span className={styles.rating}>
                <StarIcon />
                {Number(property.ratingAvg).toFixed(2)}
              </span>
            )}
          </div>

          <h4 className={styles.title}>{property.title}</h4>

          <p className={styles.details}>
            {property.beds ?? 0} Beds • {property.baths ?? 0} Baths • Up to {property.maxGuests ?? 0} Guests
          </p>
        </div>

        <div className={styles.priceRow}>
          <div className={styles.prices}>
            {property.nightlyRateEtb && (
              <div className={styles.nightlyPrice}>
                {formatPrice(property.nightlyRateEtb)}
                <span className={styles.nightlyPriceUnit}>/ night</span>
              </div>
            )}
            {isHybrid && property.monthlyRateEtb && (
              <div className={styles.monthlyPrice}>
                {formatPrice(property.monthlyRateEtb)}
                <span className={styles.monthlyPriceUnit}>/ mo</span>
              </div>
            )}
            {!isHybrid && isLongTerm && property.monthlyRateEtb && (
              <div className={styles.monthlyPrice}>
                {formatPrice(property.monthlyRateEtb)}
                <span className={styles.monthlyPriceUnit}>/ mo</span>
              </div>
            )}
          </div>
          <span className={styles.viewLink}>View Details</span>
        </div>
      </div>
    </div>
  );
}