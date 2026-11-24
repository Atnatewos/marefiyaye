/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE — i18n Single Source of Truth
 * Path: packages/shared/src/i18n/index.js
 *
 * Purpose:
 *   Central registry for every translatable string in the platform.
 *   Provides synchronous and asynchronous translation utilities consumed by:
 *     - apps/api  (renders notifications in the user's preferred language)
 *     - apps/web  (builds the I18nContext for the entire UI)
 *     - future mobile app / Telegram bot (same package, same guarantees)
 *
 * Architecture:
 *   - LANGUAGES : the ONLY registry of supported languages. Add one here
 *                 and the loader picks it up. No imports to wire.
 *   - NAMESPACES : the ONLY registry of namespace files. Add one here and
 *                  every language folder must have that file.
 *   - loadLangStatic() : the ONLY place that knows which files exist on disk.
 *                        Add a namespace → add one line per language here.
 *
 * How to add a language (2 steps):
 *   1. Add an entry to LANGUAGES.
 *   2. Add a `case '<code>'` block in loadLangStatic() loading the
 *      same list of namespace files as other languages.
 *   Then create `locales/<code>/<namespace>.js` files — one per namespace.
 *
 * How to add a namespace (2 steps):
 *   1. Add the namespace string to NAMESPACES.
 *   2. Add one `namespace: (await import(...)).default` line to every
 *      `case` block in loadLangStatic().
 *   Then create the file in every `locales/<lang>/` folder.
 *
 * Guarantees:
 *   - Missing keys return the raw key (debuggable, never throws).
 *   - Overrides (admin-edited strings) always win over bundled defaults.
 *   - Dictionary is built once per language per process and cached.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* ── Supported Languages ─────────────────────────────────────────────────── */

/**
 * Language registry. Add a language here and it becomes available
 * everywhere (UI switcher, detectLanguage fallback, API notifications).
 * The `font` and `dir` fields are consumed by the HTML layer.
 */
export const LANGUAGES = Object.freeze({
  en: {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    dir: 'ltr',
    font: 'Plus Jakarta Sans',
    flag: '🇬🇧',
  },
  am: {
    code: 'am',
    label: 'Amharic',
    nativeLabel: 'አማርኛ',
    dir: 'ltr',
    font: 'Noto Sans Ethiopic',
    flag: '🇪🇹',
  },
});

export const SUPPORTED_LANGUAGES = Object.freeze(Object.keys(LANGUAGES));
export const DEFAULT_LANGUAGE = 'en';

/* ── Namespaces ──────────────────────────────────────────────────────────── */

/**
 * Every namespace is one file inside `locales/<lang>/`. Keys are flat
 * dotted strings (`namespace.subdomain.key`). This shape makes DB
 * overrides trivial — one row per key, no nested merge conflicts.
 */
export const NAMESPACES = Object.freeze([
  'common',
  'home',
  'listings',
  'booking',
  'bookings',
  'auth',
  'admin',
  'errors',
  'notifications',
  'validation',
]);

/* ── Static Loaders ──────────────────────────────────────────────────────── */

/**
 * Resolves the namespace files for a language by dynamic import. Called
 * once per language per process. Cached by `loadLanguage()`.
 *
 * ADDING A LANGUAGE: append a `case` block below with the same namespaces
 * as `en`. If a namespace is not in this list, its keys will not resolve.
 *
 * ADDING A NAMESPACE: add a line to every `case` block:
 *   <namespace>: (await import('./locales/<code>/<namespace>.js')).default,
 *
 * @param {string} lang - language code ('en' | 'am')
 * @returns {Promise<Record<string, object> | null>}
 */
async function loadLangStatic(lang) {
  switch (lang) {
    case 'en':
      return {
        common: (await import('./locales/en/common.js')).default,
        home: (await import('./locales/en/home.js')).default,
        listings: (await import('./locales/en/listings.js')).default,
        booking: (await import('./locales/en/booking.js')).default,
        bookings: (await import('./locales/en/bookings.js')).default,
        auth: (await import('./locales/en/auth.js')).default,
        admin: (await import('./locales/en/admin.js')).default,
        errors: (await import('./locales/en/errors.js')).default,
        notifications: (await import('./locales/en/notifications.js')).default,
        validation: (await import('./locales/en/validation.js')).default,
      };

    case 'am':
      return {
        common: (await import('./locales/am/common.js')).default,
        home: (await import('./locales/am/home.js')).default,
        listings: (await import('./locales/am/listings.js')).default,
        booking: (await import('./locales/am/booking.js')).default,
        bookings: (await import('./locales/am/bookings.js')).default,
        auth: (await import('./locales/am/auth.js')).default,
        admin: (await import('./locales/am/admin.js')).default,
        errors: (await import('./locales/am/errors.js')).default,
        notifications: (await import('./locales/am/notifications.js')).default,
        validation: (await import('./locales/am/validation.js')).default,
      };

    default:
      return null;
  }
}

/* ── Caches ──────────────────────────────────────────────────────────────── */

/**
 * Two-level cache:
 *   - dictionaryCache : populated once a language fully loads
 *   - loadPromiseCache : deduplicates concurrent load requests for the same
 *                        language so we don't fire multiple dynamic imports
 *                        during a single render pass.
 */
const dictionaryCache = new Map();
const loadPromiseCache = new Map();

/* ── Internal helpers ────────────────────────────────────────────────────── */

/**
 * Normalizes a language code to a supported one, falling back to default.
 *
 * @param {string} code
 * @returns {string}
 */
function resolveCode(code) {
  return isSupportedLanguage(code) ? code : DEFAULT_LANGUAGE;
}

/**
 * Flattens a map of namespace dictionaries into a single flat dictionary.
 * Namespace names are not part of the resulting keys — the keys themselves
 * are already prefixed (`bookings.detail.title`), so no additional prefixing
 * is needed.
 *
 * @param {Record<string, object>} namespaceMap
 * @returns {Record<string, string>}
 */
function flattenNamespaces(namespaceMap) {
  const merged = {};
  for (const namespace of NAMESPACES) {
    const dict = namespaceMap[namespace];
    if (!dict || typeof dict !== 'object') continue;
    for (const [key, value] of Object.entries(dict)) {
      merged[key] = value;
    }
  }
  return merged;
}

/**
 * Loads (or retrieves from cache) the flat dictionary for a language.
 *
 * @param {string} code
 * @returns {Promise<Record<string, string>>}
 */
async function loadLanguage(code) {
  const resolved = resolveCode(code);

  if (dictionaryCache.has(resolved)) {
    return dictionaryCache.get(resolved);
  }

  if (loadPromiseCache.has(resolved)) {
    return loadPromiseCache.get(resolved);
  }

  const promise = (async () => {
    const namespaceMap = (await loadLangStatic(resolved)) || {};
    const flat = Object.freeze(flattenNamespaces(namespaceMap));
    dictionaryCache.set(resolved, flat);
    return flat;
  })();

  loadPromiseCache.set(resolved, promise);
  try {
    return await promise;
  } finally {
    loadPromiseCache.delete(resolved);
  }
}

/**
 * Interpolates `{name}`-style placeholders inside a string.
 * Unknown variables are left as-is so bugs are visually obvious.
 *
 * @param {string} template
 * @param {Record<string, string|number>} [vars]
 * @returns {string}
 */
function interpolate(template, vars) {
  if (!vars || typeof template !== 'string') return template;
  return template.replace(/\{(\w+)\}/g, (match, name) => {
    return Object.prototype.hasOwnProperty.call(vars, name)
      ? String(vars[name])
      : match;
  });
}

/**
 * Builds a translator function bound to a dictionary.
 *
 * @param {Record<string, string>} dict
 * @param {Record<string, string>|null} overrides
 * @returns {(key: string, vars?: Record<string, string|number>, fallback?: string) => string}
 */
function makeTranslator(dict, overrides) {
  const overrideDict =
    overrides && typeof overrides === 'object' ? overrides : null;

  return function translate(key, vars = null, fallback = null) {
    let resolved;

    if (overrideDict && Object.prototype.hasOwnProperty.call(overrideDict, key)) {
      resolved = overrideDict[key];
    } else if (Object.prototype.hasOwnProperty.call(dict, key)) {
      resolved = dict[key];
    } else {
      resolved = fallback != null ? fallback : key;
    }

    return interpolate(resolved, vars);
  };
}

/* ── Public API: language metadata ───────────────────────────────────────── */

/**
 * Returns true if the given code is a supported language.
 *
 * @param {string} code
 * @returns {boolean}
 */
export function isSupportedLanguage(code) {
  return typeof code === 'string' && SUPPORTED_LANGUAGES.includes(code);
}

/**
 * Returns metadata for a language, or the default language's metadata
 * if the code is not supported.
 *
 * @param {string} code
 * @returns {object}
 */
export function getLanguageMeta(code) {
  return LANGUAGES[code] || LANGUAGES[DEFAULT_LANGUAGE];
}

/**
 * Returns the full list of language metadata, suitable for a language
 * switcher component.
 *
 * @returns {ReadonlyArray<object>}
 */
export function listLanguages() {
  return SUPPORTED_LANGUAGES.map((code) => LANGUAGES[code]);
}

/**
 * Normalizes a language tag such as `am-ET` or `am_ET` to a bare
 * supported code (`am`). Falls back to default when unsupported.
 *
 * @param {string} raw
 * @returns {string}
 */
export function normalizeLanguageCode(raw) {
  if (!raw || typeof raw !== 'string') return DEFAULT_LANGUAGE;
  const short = raw.trim().toLowerCase().split(/[-_]/)[0];
  return isSupportedLanguage(short) ? short : DEFAULT_LANGUAGE;
}

/**
 * Resolves the best language from multiple signals.
 * Priority:
 *   1. Explicit user preference (from profile / cookie)
 *   2. Accept-Language header (first supported tag)
 *   3. Default language
 *
 * @param {object} [options]
 * @param {string|null} [options.userPref]
 * @param {string|null} [options.acceptLanguageHeader]
 * @returns {string}
 */
export function detectLanguage({
  userPref = null,
  acceptLanguageHeader = null,
} = {}) {
  if (isSupportedLanguage(userPref)) return userPref;

  if (typeof acceptLanguageHeader === 'string' && acceptLanguageHeader.length > 0) {
    const candidates = acceptLanguageHeader
      .split(',')
      .map((part) => part.split(';')[0].trim().toLowerCase());

    for (const candidate of candidates) {
      const short = candidate.split(/[-_]/)[0];
      if (isSupportedLanguage(short)) return short;
    }
  }

  return DEFAULT_LANGUAGE;
}

/* ── Public API: dictionary loading ──────────────────────────────────────── */

/**
 * Async dictionary loader. Use in Server Components and any code path that
 * can await. Returns a frozen flat dictionary.
 *
 * @param {string} lang
 * @returns {Promise<Record<string, string>>}
 */
export async function loadDictionary(lang) {
  return loadLanguage(lang);
}

/**
 * Eagerly preloads the dictionary for all supported languages (or a
 * caller-specified subset). Call this once at API boot and in the root
 * layout so subsequent `getTranslator()` calls are synchronous.
 *
 * @param {string[]} [langs]
 * @returns {Promise<void>}
 */
export async function preloadDictionaries(langs = SUPPORTED_LANGUAGES) {
  await Promise.all(langs.map((lang) => loadLanguage(lang)));
}

/* ── Public API: translator ──────────────────────────────────────────────── */

/**
 * Returns a synchronous translator bound to a language.
 *
 * Throws if the dictionary has not been loaded yet. This is intentional:
 * silent fallbacks hide bugs. Use `preloadDictionaries()` at boot, or
 * `getTranslatorAsync()` in async contexts.
 *
 * @param {string} lang
 * @param {Record<string, string>} [overrides]
 * @returns {(key: string, vars?: Record<string, string|number>, fallback?: string) => string}
 */
export function getTranslator(lang, overrides = null) {
  const code = resolveCode(lang);
  if (!dictionaryCache.has(code)) {
    throw new Error(
      `[i18n] Dictionary for "${code}" is not loaded. ` +
        `Call \`await preloadDictionaries()\` at boot, or use \`await getTranslatorAsync("${code}")\`.`
    );
  }
  return makeTranslator(dictionaryCache.get(code), overrides);
}

/**
 * Async variant of `getTranslator()`. Loads the dictionary on demand.
 * Use in Server Components where sync access isn't guaranteed.
 *
 * @param {string} lang
 * @param {Record<string, string>} [overrides]
 * @returns {Promise<(key: string, vars?: Record<string, string|number>, fallback?: string) => string>}
 */
export async function getTranslatorAsync(lang, overrides = null) {
  const code = resolveCode(lang);
  const dict = await loadLanguage(code);
  return makeTranslator(dict, overrides);
}

/**
 * One-shot async translate — no need to keep the translator function.
 *
 * @param {string} lang
 * @param {string} key
 * @param {Record<string, string|number>} [vars]
 * @param {string} [fallback]
 * @returns {Promise<string>}
 */
export async function translateAsync(lang, key, vars = null, fallback = null) {
  const t = await getTranslatorAsync(lang);
  return t(key, vars, fallback);
}