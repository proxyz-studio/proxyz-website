/**
 * Motion tokens for Framer Motion (the `motion` package).
 *
 * Mirrors the CSS custom properties in src/index.css :root and the Tailwind
 * utilities in tailwind.config.js. Three sources of truth that stay in sync.
 *
 * Use:
 *   import { ease, dur } from '@/motion/tokens'
 *   <motion.div transition={{ duration: dur.base, ease: ease.outExpo }} />
 *
 * Impeccable motion law: exponential ease-outs only, no bounce, no elastic.
 */

// Framer Motion cubic-bezier easings as [x1, y1, x2, y2] tuples.
export const ease = {
  outQuart: [0.25, 1, 0.5, 1] as const,
  outQuint: [0.22, 1, 0.36, 1] as const,
  outExpo:  [0.16, 1, 0.3, 1] as const,
  inQuart:  [0.5, 0, 0.75, 0] as const,
  /** Legacy curve preserved for backward compat with existing pvz-* / pmark-* keyframes. */
  pvz:      [0.2, 0.7, 0.1, 1] as const,
} as const;

// Durations in seconds (Framer Motion takes seconds; CSS takes ms).
export const dur = {
  instant:  0.12,
  quick:    0.22,
  base:     0.32,
  layout:   0.48,
  entrance: 0.72,
  hero:     1.10,
  exit:     0.18,
} as const;

/** Common transition presets. */
export const transition = {
  /** Default state change (open, close, fade). */
  base:     { duration: dur.base,     ease: ease.outQuart } as const,
  /** Hover, tooltip, micro-state change. */
  quick:    { duration: dur.quick,    ease: ease.outQuart } as const,
  /** Layout shifts, accordion, modal. */
  layout:   { duration: dur.layout,   ease: ease.outExpo  } as const,
  /** Section reveal on scroll. */
  entrance: { duration: dur.entrance, ease: ease.outExpo  } as const,
  /** Hero choreography. */
  hero:     { duration: dur.hero,     ease: ease.outExpo  } as const,
} as const;
