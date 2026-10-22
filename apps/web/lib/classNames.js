/**
 * @file apps/web/lib/classNames.js
 *
 * Class name composition helper.
 *
 * Why this file exists:
 *   - Conditional class names are common: `isLoading && 'loading'`.
 *   - Without a helper, JSX becomes `${a} ${b} ${c ? d : ''}`.
 *   - This mirrors the `clsx` API without a dependency — one function, no
 *     runtime overhead, works everywhere.
 *
 * Usage:
 *   classNames('btn', isPrimary && 'btn--primary', isDisabled && 'btn--disabled')
 *   → 'btn btn--primary' (or 'btn btn--primary btn--disabled')
 *
 *   classNames(['a', 'b'], { c: true, d: false })
 *   → 'a b c'
 */

/**
 * Composes class names into a single string.
 *
 * Accepts:
 *   - strings: 'btn', 'active'
 *   - numbers: 0, 1 (rendered as string)
 *   - arrays: ['a', 'b', condition && 'c']
 *   - objects: { active: true, hidden: false }
 *   - falsy: null, undefined, false → ignored
 *
 * @param {...unknown} values - Any mix of the above.
 * @returns {string} Space-separated class string.
 */
export function classNames(...values) {
  const classes = [];

  for (const value of values) {
    if (!value) continue;

    // String or number — add directly
    if (typeof value === 'string' || typeof value === 'number') {
      classes.push(String(value));
      continue;
    }

    // Array — flatten recursively
    if (Array.isArray(value)) {
      const nested = classNames(...value);
      if (nested) classes.push(nested);
      continue;
    }

    // Object — add keys with truthy values
    if (typeof value === 'object') {
      for (const [key, isActive] of Object.entries(value)) {
        if (isActive) classes.push(key);
      }
    }
  }

  return classes.join(' ');
}