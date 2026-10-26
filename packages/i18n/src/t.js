/**
 * @file packages/i18n/src/t.js
 *
 * Tree walker and translator factory.
 *
 * Why this file exists:
 *   - Replaces the old flatten-based resolver. Instead of a flat dict with
 *     dot-keys, this walks the nested translations tree directly on each
 *     lookup. Same input (`'admin.nav.overview'`), same output — but the
 *     tree preserves real hierarchy so both `t('admin.nav.overview')` and
 *     `t('nav.overview')` can resolve if the tree happens to have both.
 *
 * How it works:
 *   1. Split the key on '.' into parts.
 *   2. Walk the nested object following those parts.
 *   3. If a node is found and is a string, interpolate `{{var}}` placeholders.
 *   4. If not found, try the fallback locale (English).
 *   5. If still not found, return the raw key path (visible in UI for debugging).
 *
 * Pluralization:
 *   If `vars.count` is provided, try `key_one` (count === 1) or `key_other`
 *   first. This mirrors the convention used across the message files.
 *
 * Contract: `createT(translations, fallback)` returns a function
 * `(key, vars) => string`. The function never throws.
 */

/**
 * Walks a nested object using a dot-notation path.
 * Returns the resolved value, or `undefined` if any part of the path is missing.
 *
 * @param {object} tree - The nested translations object.
 * @param {string} key  - Dot-notation path (e.g. 'admin.nav.overview').
 * @returns {unknown}
 */
function walk(tree, key) {
  if (!tree || typeof tree !== 'object') return undefined;
  const parts = key.split('.');
  let node = tree;
  for (const part of parts) {
    if (node == null || typeof node !== 'object') return undefined;
    node = node[part];
  }
  return node;
}

/**
 * Interpolates `{{varName}}` placeholders in a string.
 * Null/undefined vars are replaced with empty string.
 *
 * @param {string} template
 * @param {object} [vars]
 * @returns {string}
 */
function interpolate(template, vars) {
  if (typeof template !== 'string') return template;
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, name) =>
    vars[name] !== undefined && vars[name] !== null ? String(vars[name]) : ''
  );
}

/**
 * Creates a translator bound to the given translations + fallback.
 *
 * @param {object} translations - The current-locale tree.
 * @param {object} fallback     - The fallback-locale tree (usually English).
 * @returns {(key: string, vars?: object) => string}
 */
export function createT(translations, fallback) {
  return function t(key, vars) {
    // Pluralization: try `_one` or `_other` suffix first
    if (vars && typeof vars.count === 'number') {
      const suffix = vars.count === 1 ? '_one' : '_other';
      const pluralKey = `${key}${suffix}`;
      const pluralValue = walk(translations, pluralKey)
        ?? walk(fallback, pluralKey);
      if (typeof pluralValue === 'string') {
        return interpolate(pluralValue, vars);
      }
    }

    const value = walk(translations, key) ?? walk(fallback, key);
    if (typeof value === 'string') {
      return interpolate(value, vars);
    }

    // Missing — return the raw key path so devs see it in the UI
    return key;
  };
}