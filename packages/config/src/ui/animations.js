/**
 * @file packages/config/src/ui/animations.js
 *
 * Animation timing and easing tokens.
 *
 * Why this file exists:
 *   - Consistent motion is a mark of quality; inconsistent motion feels wrong.
 *   - Timing values appear in CSS transitions, JS animations, and framer-motion.
 *   - Centralizing them means a single change re-tunes the whole interface.
 *
 * Contract: components import these values instead of literals like 200 or 'ease-in-out'.
 */

/**
 * Duration tokens in milliseconds.
 * fast   – micro-interactions (button hover, icon color)
 * normal – standard transitions (modal open, dropdown)
 * slow   – large surface changes (page fade, drawer slide)
 */
export const DURATIONS = Object.freeze({
  fast: 150,
  normal: 250,
  slow: 400,
});

/**
 * Easing curves as CSS cubic-bezier strings.
 * standard – general-purpose ease in and out
 * enter    – starts fast, decelerates (elements appearing)
 * exit     – starts slow, accelerates (elements leaving)
 */
export const EASINGS = Object.freeze({
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  enter: 'cubic-bezier(0, 0, 0.2, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
});

/**
 * Convenience presets for common UI interactions.
 * Used by CSS modules and React animations alike.
 */
export const ANIMATION_PRESETS = Object.freeze({
  buttonHover: `${DURATIONS.fast}ms ${EASINGS.standard}`,
  dropdownOpen: `${DURATIONS.normal}ms ${EASINGS.enter}`,
  modalOpen: `${DURATIONS.normal}ms ${EASINGS.enter}`,
  pageTransition: `${DURATIONS.slow}ms ${EASINGS.standard}`,
});