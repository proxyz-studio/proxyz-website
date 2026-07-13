// src/features/mira-class/theme.ts
//
// Page-scoped design tokens for the MIRA Valley AI Workshop page.
// PROXYZ editorial-dark: near-black bg, near-white ink, hot pink the only accent.
// IBM Plex Mono is the brand typeface (already loaded globally).

export const BG = '#0A0A0A';
export const INK = '#F2F2F2';
export const INK_DIM = 'rgba(242,242,242,0.65)';
export const INK_FAINT = 'rgba(242,242,242,0.40)';
export const PINK = '#FF4193';
export const PINK_DIM = 'rgba(255,65,147,0.65)';
export const PINK_SUBTLE = 'rgba(255,65,147,0.12)';
export const PINK_GHOST = 'rgba(255,65,147,0.06)';
export const DIVIDER = 'rgba(255,255,255,0.09)';
export const SURFACE = 'rgba(255,255,255,0.03)';
export const SURFACE_FAINT = 'rgba(255,255,255,0.02)';

export const MONO = "'IBM Plex Mono', monospace";

/** Exponential ease-out, the only curve this page uses (mirrors motion/tokens). */
export const EASE_OUT_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
/** GSAP-friendly ease string for the same feel. */
export const GSAP_EASE = 'expo.out';
/** Framer-Motion tuple form. */
export const EASE_OUT_EXPO_TUPLE = [0.16, 1, 0.3, 1] as const;
