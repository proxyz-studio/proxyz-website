import type { CSSProperties } from 'react';
import { studioOsContent } from '../../content';
import { HAIRLINE } from '../../theme';

const { modules } = studioOsContent;

/** The six product modules + a virtual "walkthrough" entry for the slot. */
export const MODULES = modules.items;
export const LABELS = [...MODULES.map((m) => m.name), 'Walkthrough'];

/** Shared card surface — a faint top-lit panel on the dark ground. */
export const cardSurface: CSSProperties = {
  border: `1px solid ${HAIRLINE}`,
  borderRadius: '12px',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.012))',
};

/** True when the page may run scroll-pinned choreography (desktop, motion ok). */
export function canPin() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  return window.innerWidth >= 860;
}

/** True when motion is allowed at all (any width). */
export function canAnimate() {
  if (typeof window === 'undefined') return false;
  return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
