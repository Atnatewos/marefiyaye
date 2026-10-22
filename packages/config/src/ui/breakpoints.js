/**
 * @file packages/config/src/ui/breakpoints.js
 *
 * Responsive breakpoint configuration.
 *
 * Why this file exists:
 *   - JS media-query hooks need breakpoint values as numbers, not strings.
 *   - Breakpoints must match the CSS in `tokens.css` so responsive layouts behave
 *     identically whether CSS or JS drives the decision.
 *   - Changing a breakpoint must be a one-file change.
 *
 * Contract: `useMediaQuery('(min-width: ...)')` reads from BREAKPOINTS values.
 */

/**
 * Breakpoints in pixels. Keys match Tailwind conventions (sm, md, lg, xl, 2xl)
 * so familiar mental models carry over.
 */
export const BREAKPOINTS = Object.freeze({
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
});

/**
 * Returns a media query string for a given breakpoint key.
 * Example: mediaQueryMin('lg') → '(min-width: 1024px)'.
 */
export function mediaQueryMin(breakpointKey) {
  const px = BREAKPOINTS[breakpointKey];
  if (typeof px !== 'number') {
    throw new Error(`Unknown breakpoint: ${breakpointKey}`);
  }
  return `(min-width: ${px}px)`;
}

/**
 * Returns a max-width media query string for a given breakpoint key.
 */
export function mediaQueryMax(breakpointKey) {
  const px = BREAKPOINTS[breakpointKey];
  if (typeof px !== 'number') {
    throw new Error(`Unknown breakpoint: ${breakpointKey}`);
  }
  return `(max-width: ${px}px)`;
}