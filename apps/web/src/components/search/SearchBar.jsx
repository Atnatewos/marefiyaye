/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — SearchBar
 * Path: apps/web/src/components/search/SearchBar.jsx
 *
 * Purpose:
 *   Responsive search bar.
 *     - Desktop (md+)  : single pill, 3 fields + submit
 *     - Mobile         : stacked card, fields as rows, full-width button
 *
 *   URL-driven; hydrates from existing query params.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n.js';
import { Button } from '../ui';

const LOCATIONS = ['Bole', 'Kazanchis', 'Old Airport', 'CMC', 'Hawassa', 'Bishoftu'];
const TYPES = ['Apartment', 'Villa', 'Guest House', 'Condo', 'Studio', 'Townhouse'];

export default function SearchBar({ defaultValues = {} }) {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [budget, setBudget] = useState('');

  useEffect(() => {
    setLocation(searchParams.get('location') || defaultValues.location || '');
    setType(searchParams.get('type') || defaultValues.type || '');
    setBudget(searchParams.get('budget') || defaultValues.budget || '');
  }, [searchParams, defaultValues]);

  const onSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchParams.get('mode')) params.set('mode', searchParams.get('mode'));
    if (location) params.set('location', location);
    if (type) params.set('type', type);
    if (budget) params.set('budget', budget);
    router.push(`/stays${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className={[
        /* Mobile: stacked card */
        'bg-bg border border-border rounded-lg sm:rounded-full',
        'p-3 sm:p-2',
        'shadow-search',
        'w-full max-w-4xl mx-auto',
      ].join(' ')}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">

        {/* Location */}
        <div className="flex-1 sm:border-r sm:border-border px-2 sm:px-4 py-2 sm:py-1.5">
          <label
            htmlFor="search-location"
            className="block text-[10px] font-extrabold text-fg tracking-wider uppercase"
          >
            {t('home.search.where')}
          </label>
          <select
            id="search-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-xs font-semibold text-fg focus:outline-none cursor-pointer mt-0.5"
          >
            <option value="">{t('home.search.allRegions')}</option>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div className="flex-1 sm:border-r sm:border-border px-2 sm:px-4 py-2 sm:py-1.5">
          <label
            htmlFor="search-type"
            className="block text-[10px] font-extrabold text-fg tracking-wider uppercase"
          >
            {t('home.search.type')}
          </label>
          <select
            id="search-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-xs font-semibold text-fg focus:outline-none cursor-pointer mt-0.5"
          >
            <option value="">{t('home.search.allTypes')}</option>
            {TYPES.map((tp) => (
              <option key={tp} value={tp}>{tp}</option>
            ))}
          </select>
        </div>

        {/* Budget */}
        <div className="flex-1 px-2 sm:px-4 py-2 sm:py-1.5">
          <label
            htmlFor="search-budget"
            className="block text-[10px] font-extrabold text-fg tracking-wider uppercase"
          >
            {t('home.search.budget')}
          </label>
          <input
            id="search-budget"
            type="number"
            inputMode="numeric"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 30000"
            className="w-full bg-transparent text-sm sm:text-xs font-semibold text-fg focus:outline-none mt-0.5"
          />
        </div>

        {/* Submit */}
        <div className="px-2 sm:px-1 py-1 sm:py-0">
          <Button
            type="submit"
            variant="primary"
            size="md"
            leftIcon={Search}
            className="w-full sm:w-auto sm:!rounded-full !h-11"
            aria-label={t('common.button.search')}
          >
            {t('common.button.search')}
          </Button>
        </div>
      </div>
    </form>
  );
}