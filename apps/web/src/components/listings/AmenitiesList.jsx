/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — AmenitiesList
 * Path: apps/web/src/components/listings/AmenitiesList.jsx
 *
 * Purpose:
 *   Grid of amenity chips with icons + translated labels. Reads icons from
 *   lucide-react. Falls back to a generic "check" icon for unknown amenities.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import {
  Wifi, Zap, Car, Shield, Tv, Droplet, Utensils, Wind, WashingMachine, MoveUp, Trees, Waves, CheckCircle2,
} from 'lucide-react';
import { useI18n } from '../../hooks/useI18n.js';

const ICONS = {
  wifi: Wifi,
  generator: Zap,
  parking: Car,
  security: Shield,
  tv: Tv,
  water_tank: Droplet,
  kitchen: Utensils,
  air_conditioning: Wind,
  washer: WashingMachine,
  elevator: MoveUp,
  balcony: Trees,
  pool: Waves,
};

const LABEL_KEYS = {
  wifi: 'listings.amenity.wifi',
  generator: 'listings.amenity.generator',
  parking: 'listings.amenity.parking',
  security: 'listings.amenity.security',
  tv: 'listings.amenity.tv',
  water_tank: 'listings.amenity.waterTank',
  kitchen: 'listings.amenity.kitchen',
  air_conditioning: 'listings.amenity.airConditioning',
  washer: 'listings.amenity.washer',
  elevator: 'listings.amenity.elevator',
  balcony: 'listings.amenity.balcony',
  pool: 'listings.amenity.pool',
};

export default function AmenitiesList({ amenities = [] }) {
  const { t } = useI18n();

  if (!amenities.length) {
    return <p className="text-sm text-muted">No amenities listed.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
      {amenities.map((key) => {
        const Icon = ICONS[key] || CheckCircle2;
        const labelKey = LABEL_KEYS[key] || key;
        return (
          <div key={key} className="flex items-center space-x-3">
            <Icon className="w-5 h-5 text-muted shrink-0" aria-hidden="true" />
            <span>{t(labelKey)}</span>
          </div>
        );
      })}
    </div>
  );
}