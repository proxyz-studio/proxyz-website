// Pure helpers shared by the film (in the browser) and the page builder (at build time).
import type { View } from '../types';

export const clamp = (v: number, a = 0, b = 1): number => Math.min(b, Math.max(a, v));

/** How far the light of a view has come at progress p (0 to 1); with less motion, its still light. */
export function lightAt(view: View, p: number, reduced: boolean): number {
  const rest = view.rest ?? 1;
  return reduced ? (view.still ?? rest) : p * rest;
}

/** Strength (0 to 1) of pass k (k >= 1) when the light has come q of the way. Pass 0 is always on. */
export function passStrength(view: View, q: number, k: number): number {
  const x = q * Math.max(0, view.passes.length - 1);
  const hold = view.hold || 0;
  return clamp((x - (k - 1) - hold / 2) / (1 - hold));
}

/** The pass that carries most of the resting light: the top pass that is at least half in. */
export function restingPass(view: View): number {
  const q = lightAt(view, 1, true);
  let best = 0;
  for (let k = 1; k < view.passes.length; k++) if (passStrength(view, q, k) >= 0.5) best = k;
  return best;
}

/** shade: black below a slanted line through two picture points, fading from a px to b px below it. */
export function shadeMask(iw: number, ih: number, [x1, y1, x2, y2, a, b]: [number, number, number, number, number, number]): string {
  const th = Math.PI + Math.atan2(y2 - y1, x2 - x1);
  const dx = Math.sin(th), dy = -Math.cos(th);
  const L = Math.abs(iw * dx) + Math.abs(ih * dy);
  const t = ((x1 - iw / 2) * dx + (y1 - ih / 2) * dy) / L + 0.5;
  const pc = (v: number) => (v * 100).toFixed(2) + '%';
  return `linear-gradient(${((th * 180) / Math.PI).toFixed(2)}deg,#000 ${pc(t + a / L)},transparent ${pc(t + b / L)})`;
}

/** The mask a single pass carries from its frame: fade, shade or oval. '' when none. */
export function frameMask(view: View, size: [number, number]): string {
  const f = view.frame;
  if (f.fade) return `linear-gradient(to bottom,transparent ${f.fade[0] * 100}%,#000 ${f.fade[1] * 100}%,#000 ${f.fade[2] * 100}%,transparent ${f.fade[3] * 100}%)`;
  if (f.shade) return shadeMask(size[0], size[1], f.shade);
  if (f.oval) return 'radial-gradient(closest-side at 50% 50%,#000 82%,transparent 100%)';
  return '';
}
