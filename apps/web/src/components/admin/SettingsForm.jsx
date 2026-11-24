/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — SettingsForm (God Panel, Tabbed UI)
 * Path: apps/web/src/components/admin/SettingsForm.jsx
 *
 * Purpose:
 *   Renders every admin-editable setting grouped by category with a tab
 *   interface. Non-technical admins edit via purpose-built field types —
 *   toggles for booleans, number fields, color pickers, amenity chips — no
 *   JSON exposed unless truly free-form.
 *
 * UX principles:
 *   - One category visible at a time (horizontal tabs).
 *   - Per-category "Save changes" saves every dirty field in the tab in
 *     parallel. Only dirty fields trigger API calls.
 *   - A field is dirty if its value differs from the loaded value.
 *   - Successful saves mark the tab clean; failures surface an inline error
 *     under the specific field.
 *
 * API contract:
 *   PATCH /api/v1/config/admin/:key   { value }
 *   Auth: super_admin required (API enforces)
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useMemo, useState } from 'react';
import {
  Save, Plus, X, GripVertical, CheckCircle2, AlertCircle,
  Settings as SettingsIcon, Percent, CreditCard, Sparkles,
  Palette, Calendar, Search,
} from 'lucide-react';
import { Button, Input, Textarea, Switch } from '@/components/ui';
import { useI18n } from '@/hooks/useI18n.js';
import { useToast } from '@/hooks/useToast.js';
import api from '@/lib/api.js';
import { cn } from '@/lib/utils.js';

/* ── Category metadata (icon + description per tab) ─────────────────────── */

/**
 * Icons + one-line descriptions shown above each category's settings.
 * Keyed by category name from SETTINGS_SCHEMA.
 */
const CATEGORY_META = {
  general: {
    icon: SettingsIcon,
    title: 'General',
    description: 'Platform identity, contact info, and locale defaults.',
  },
  commission: {
    icon: Percent,
    title: 'Commission',
    description: 'How the platform earns on each booking.',
  },
  payment: {
    icon: CreditCard,
    title: 'Payment',
    description: 'Manual bank transfer rules and receipt handling.',
  },
  features: {
    icon: Sparkles,
    title: 'Features',
    description: 'Toggle capabilities and manage editable lists.',
  },
  theme: {
    icon: Palette,
    title: 'Theme',
    description: 'Brand colors, fonts, and design tokens.',
  },
  booking: {
    icon: Calendar,
    title: 'Booking',
    description: 'Advance windows, duration limits, and fees.',
  },
  seo: {
    icon: Search,
    title: 'SEO',
    description: 'Meta tags, structured data, and social cards.',
  },
};

/* ── Field renderers ─────────────────────────────────────────────────────── */

/**
 * Renders a single primitive setting (string/number/bool) as an appropriate
 * input with labels and error message.
 *
 * @param {object} props
 * @param {object} props.entry — one SETTINGS_SCHEMA entry
 * @param {*} props.value
 * @param {(v: any) => void} props.onChange
 * @param {string|null} props.error
 * @returns {JSX.Element}
 */
function PrimitiveField({ entry, value, onChange, error }) {
  const { lang } = useI18n();
  const label = lang === 'am' ? entry.label_am : entry.label_en;

  /* Boolean — toggle switch with label + description inline */
  if (entry.type === 'bool') {
    return (
      <div className="py-3 border-b border-border last:border-0">
        <Switch
          id={entry.key}
          checked={!!value}
          onChange={onChange}
          label={label}
          description={entry.description}
        />
        {error && (
          <p className="text-xs font-semibold text-red-600 mt-1">{error}</p>
        )}
      </div>
    );
  }

  /* String — choose a color input for color keys, textarea for long labels */
  if (entry.type === 'string') {
    const isColor = entry.key.endsWith('_color');
    const isLongText = entry.key.includes('description') || entry.key.includes('tagline');

    return (
      <div className="py-3 border-b border-border last:border-0">
        <label className="block text-sm font-semibold text-fg mb-1">{label}</label>
        {entry.description && (
          <p className="text-xs text-muted mb-2">{entry.description}</p>
        )}

        {isColor ? (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="w-10 h-10 rounded-md border border-border cursor-pointer"
            />
            <Input
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1"
              placeholder="#000000"
            />
          </div>
        ) : isLongText ? (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
          />
        ) : (
          <Input value={value || ''} onChange={(e) => onChange(e.target.value)} />
        )}

        <p className="text-[10px] font-mono text-muted mt-1">{entry.key}</p>
        {error && (
          <p className="text-xs font-semibold text-red-600 mt-1">{error}</p>
        )}
      </div>
    );
  }

  /* Number */
  if (entry.type === 'number') {
    return (
      <div className="py-3 border-b border-border last:border-0">
        <label className="block text-sm font-semibold text-fg mb-1">{label}</label>
        {entry.description && (
          <p className="text-xs text-muted mb-2">{entry.description}</p>
        )}
        <Input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <p className="text-[10px] font-mono text-muted mt-1">{entry.key}</p>
        {error && (
          <p className="text-xs font-semibold text-red-600 mt-1">{error}</p>
        )}
      </div>
    );
  }

  /* Fallback: render as JSON textarea (for unusual types) */
  return (
    <div className="py-3 border-b border-border last:border-0">
      <label className="block text-sm font-semibold text-fg mb-1">{label}</label>
      <Textarea
        rows={6}
        className="font-mono text-xs"
        value={JSON.stringify(value ?? entry.default ?? null, null, 2)}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value));
          } catch {
            /* keep typing */
          }
        }}
      />
      <p className="text-[10px] font-mono text-muted mt-1">{entry.key}</p>
    </div>
  );
}

/**
 * Renders an amenity list (features.amenities_list) as a friendly
 * add/remove/edit grid. Each entry has value, icon name, and EN/AM labels.
 *
 * @param {object} props
 * @param {Array<object>} props.value
 * @param {(v: Array<object>) => void} props.onChange
 * @param {string|null} props.error
 * @returns {JSX.Element}
 */
function AmenityEditor({ value = [], onChange, error }) {
  /**
   * Updates one field on one amenity.
   * @param {number} idx
   * @param {string} field
   * @param {string} newValue
   */
  const updateRow = (idx, field, newValue) => {
    const next = [...value];
    next[idx] = { ...next[idx], [field]: newValue };
    onChange(next);
  };

  /**
   * Appends a blank amenity.
   */
  const addRow = () => {
    onChange([
      ...value,
      { value: '', icon: 'check', label_en: '', label_am: '' },
    ]);
  };

  /**
   * Removes an amenity at an index.
   * @param {number} idx
   */
  const removeRow = (idx) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-fg">Amenities</label>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          leftIcon={Plus}
          onClick={addRow}
        >
          Add amenity
        </Button>
      </div>
      <p className="text-xs text-muted mb-3">
        Amenities admins can attach to listings. <code className="font-mono">icon</code>{' '}
        uses a Lucide icon name (e.g. wifi, car, shield).
      </p>

      <div className="space-y-2">
        {value.map((a, i) => (
          <div
            key={`${a.value || 'new'}-${i}`}
            className="grid grid-cols-1 sm:grid-cols-[1fr_120px_1fr_1fr_auto] gap-2 p-2 rounded-md border border-border bg-neutral-50 dark:bg-neutral-800/40"
          >
            <Input
              placeholder="value (e.g. wifi)"
              value={a.value || ''}
              onChange={(e) => updateRow(i, 'value', e.target.value)}
            />
            <Input
              placeholder="icon"
              value={a.icon || ''}
              onChange={(e) => updateRow(i, 'icon', e.target.value)}
            />
            <Input
              placeholder="Label (EN)"
              value={a.label_en || ''}
              onChange={(e) => updateRow(i, 'label_en', e.target.value)}
            />
            <Input
              placeholder="Label (AM)"
              value={a.label_am || ''}
              onChange={(e) => updateRow(i, 'label_am', e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              aria-label="Remove amenity"
              className="w-9 h-9 rounded-md border border-border hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}

/**
 * Renders a property-type list (features.property_types_list) as a friendly
 * add/remove/edit grid.
 *
 * @param {object} props
 * @param {Array<object>} props.value
 * @param {(v: Array<object>) => void} props.onChange
 * @param {string|null} props.error
 * @returns {JSX.Element}
 */
function PropertyTypeEditor({ value = [], onChange, error }) {
  /** Updates one field on one row. */
  const updateRow = (idx, field, newValue) => {
    const next = [...value];
    next[idx] = { ...next[idx], [field]: newValue };
    onChange(next);
  };

  /** Appends a blank row. */
  const addRow = () => {
    onChange([...value, { value: '', label_en: '', label_am: '' }]);
  };

  /** Removes a row. */
  const removeRow = (idx) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-fg">Property types</label>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          leftIcon={Plus}
          onClick={addRow}
        >
          Add type
        </Button>
      </div>
      <p className="text-xs text-muted mb-3">
        Property types shown in host forms and public listings.
      </p>

      <div className="space-y-2">
        {value.map((t, i) => (
          <div
            key={`${t.value || 'new'}-${i}`}
            className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 p-2 rounded-md border border-border bg-neutral-50 dark:bg-neutral-800/40"
          >
            <Input
              placeholder="value (e.g. Apartment)"
              value={t.value || ''}
              onChange={(e) => updateRow(i, 'value', e.target.value)}
            />
            <Input
              placeholder="Label (EN)"
              value={t.label_en || ''}
              onChange={(e) => updateRow(i, 'label_en', e.target.value)}
            />
            <Input
              placeholder="Label (AM)"
              value={t.label_am || ''}
              onChange={(e) => updateRow(i, 'label_am', e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              aria-label="Remove type"
              className="w-9 h-9 rounded-md border border-border hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}

/**
 * Picks the right field renderer for a given setting.
 *
 * @param {object} props
 * @param {object} props.entry
 * @param {*} props.value
 * @param {(v: any) => void} props.onChange
 * @param {string|null} props.error
 * @returns {JSX.Element}
 */
function FieldForEntry({ entry, value, onChange, error }) {
  if (entry.key === 'features.amenities_list') {
    return <AmenityEditor value={value} onChange={onChange} error={error} />;
  }
  if (entry.key === 'features.property_types_list') {
    return <PropertyTypeEditor value={value} onChange={onChange} error={error} />;
  }
  return <PrimitiveField entry={entry} value={value} onChange={onChange} error={error} />;
}

/* ── Main form ───────────────────────────────────────────────────────────── */

/**
 * Renders the God Panel with category tabs, batched saves, and dirty-state
 * tracking.
 *
 * @param {object} props
 * @param {Array<{category: string, entries: Array<object>}>} props.groups
 * @param {Record<string, any>} props.initialValues
 * @returns {JSX.Element}
 */
export default function SettingsForm({ groups = [], initialValues = {} }) {
  const { t } = useI18n();
  const toast = useToast();

  /* Active tab — defaults to the first category */
  const [activeTab, setActiveTab] = useState(groups[0]?.category || 'general');

  /* Values loaded from server — the reference for dirty checks */
  const originalValues = useMemo(() => ({ ...initialValues }), [initialValues]);

  /* Editable copy of the values */
  const [values, setValues] = useState(initialValues);

  /* Per-key error messages surfaced after a failed save */
  const [errors, setErrors] = useState({});

  /* Save progress */
  const [saving, setSaving] = useState(false);

  /* Active category's entry list */
  const activeEntries = useMemo(() => {
    const g = groups.find((grp) => grp.category === activeTab);
    return g ? g.entries : [];
  }, [groups, activeTab]);

  /* Whether ANY value in the active tab is dirty */
  const hasDirty = activeEntries.some(
    (e) => JSON.stringify(values[e.key]) !== JSON.stringify(originalValues[e.key])
  );

  /* Per-field change handler */
  const updateValue = (key, v) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    /* Clear this field's error when the admin edits it */
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  /**
   * Saves every dirty setting in the active tab in parallel.
   */
  const saveActiveTab = async () => {
    const dirtyEntries = activeEntries.filter(
      (e) => JSON.stringify(values[e.key]) !== JSON.stringify(originalValues[e.key])
    );

    if (dirtyEntries.length === 0) return;

    setSaving(true);
    const nextErrors = {};

    /* Fire all PATCH requests in parallel */
    const results = await Promise.allSettled(
      dirtyEntries.map(async (entry) => {
        try {
          await api.patch(`/config/admin/${encodeURIComponent(entry.key)}`, {
            value: values[entry.key],
          });
          return { key: entry.key, ok: true };
        } catch (err) {
          return { key: entry.key, ok: false, error: err.message || 'errors.generic' };
        }
      })
    );

    /* Collect failures */
    for (const res of results) {
      if (res.status === 'fulfilled' && !res.value.ok) {
        nextErrors[res.value.key] = t(res.value.error);
      }
    }

    setErrors(nextErrors);
    setSaving(false);

    if (Object.keys(nextErrors).length === 0) {
      toast.success(t('admin.settings.saveSuccess'));
    } else {
      toast.error(t('admin.settings.saveError'));
    }
  };

  /* Guard: no categories at all */
  if (groups.length === 0) {
    return (
      <div className="text-center py-16 rounded-lg border border-border bg-bg">
        <AlertCircle className="w-10 h-10 text-muted mx-auto mb-2" />
        <p className="text-sm text-muted">No settings available.</p>
      </div>
    );
  }

  const meta = CATEGORY_META[activeTab] || { icon: SettingsIcon, title: activeTab, description: '' };
  const Icon = meta.icon;

  return (
    <div className="space-y-6">
      {/* Horizontal category tabs */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-1 border-b border-border min-w-max">
          {groups.map((group) => {
            const gMeta = CATEGORY_META[group.category] || { title: group.category };
            const GIcon = gMeta.icon || SettingsIcon;
            const isActive = activeTab === group.category;
            return (
              <button
                key={group.category}
                type="button"
                onClick={() => setActiveTab(group.category)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2 -mb-px',
                  isActive
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-muted hover:text-fg'
                )}
              >
                <GIcon className="w-4 h-4" />
                {gMeta.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active category panel */}
      <section className="rounded-lg border border-border bg-bg">
        {/* Category header */}
        <div className="p-4 sm:p-6 border-b border-border flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-fg capitalize">{meta.title}</h2>
            {meta.description && (
              <p className="text-sm text-muted mt-0.5">{meta.description}</p>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="p-4 sm:p-6 divide-y divide-border">
          {activeEntries.map((entry) => (
            <FieldForEntry
              key={entry.key}
              entry={entry}
              value={values[entry.key]}
              onChange={(v) => updateValue(entry.key, v)}
              error={errors[entry.key] || null}
            />
          ))}
        </div>

        {/* Footer save bar */}
        <div className="p-4 sm:px-6 border-t border-border bg-neutral-50 dark:bg-neutral-800/40 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-muted">
            {hasDirty
              ? 'You have unsaved changes in this category.'
              : 'All changes saved.'}
          </p>
          <Button
            variant="primary"
            size="md"
            leftIcon={saving ? undefined : Save}
            loading={saving}
            disabled={!hasDirty || saving}
            onClick={saveActiveTab}
          >
            {saving ? t('common.state.saving') : t('common.button.save')}
          </Button>
        </div>
      </section>
    </div>
  );
}