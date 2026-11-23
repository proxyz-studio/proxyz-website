// How the film moves between and within scenes: pure functions of one number, the playhead (build 10).
// Everything the film shows is set from these on every frame, so scrolling back plays it all in reverse exactly, and
// nothing runs on a timer. Shared by the film (src/main.ts) and the check.
import { clamp } from './math';

/** The change between two scenes plays over this many screens of scroll, centred where the scene on screen changes
 *  (the middle of the screen reaching the next scene's top). */
export const WINDOW = 0.8;
/** How far a scene's picture (with its giant words at the top) rests below its place as the change into it starts,
 *  in screens; it rises into place as the light comes, and keeps rising at the same pace after it, so some motion
 *  always answers the scroll. At each scene's rest it is exactly in place. */
export const DRIFT = 0.06;
/** How much larger a picture is as it leaves (and as the next one starts to come in). */
export const GROW = 0.03;
/** How far each line of words travels as it leaves or arrives, in screens (kept between 22 and 40 px). */
export const LINE = 0.04;
export const lineTravel = (vh: number): number => clamp(LINE * vh, 22, 40);

export const smooth = (t: number): number => { const u = clamp(t); return u * u * (3 - 2 * u); };
export const ramp = (v: number, a: number, b: number): number => clamp((v - a) / (b - a));

/** Where the playhead is in the change into scene `next` (0-based index of the arriving scene): 0 before it starts,
 *  1 once it is over. `top` is that scene's top, `vh` the steady screen height, `y` the playhead. */
export const windowAt = (y: number, top: number, vh: number): number => clamp((y - (top - vh / 2) + (WINDOW * vh) / 2) / (WINDOW * vh));

/** The arriving scene's strength over the one leaving (its whole layer, on a black ground, over the old one held at
 *  full): a dissolve with no dip in the light and no black frame between. */
export const dissolve = (w: number): number => smooth(ramp(w, 0.06, 0.76));

// The lines of words through a change, one after another (STAGGER apart). Words never pass over other words: the
// scene leaving takes its giant lines at the top away first; the scene arriving brings its giant lines in at the top
// once the old ones are gone; meanwhile the words at the foot stay, and leave later; the arriving words at the foot
// come once the old ones are gone (at once where a scene has no words in that place). So some words always show.
const STAGGER = 0.07, OUT = 0.28, IN = 0.3, FOOT_OUT = 0.4;
/** the number of lines at the top and at the foot of the scene leaving (o) and the scene arriving (a) */
export interface Lines { oTop: number; oFoot: number; aTop: number; aFoot: number }
const outStart = (r: number, L: Lines) => (r < L.oTop ? r * STAGGER : FOOT_OUT + (r - L.oTop) * STAGGER);
/** where the arriving lines start: in each place, once the old lines there are gone */
const topFree = (L: Lines) => (L.oTop ? Math.min(0.45, (L.oTop - 1) * STAGGER + OUT + 0.01) : 0.22);
const footFree = (L: Lines) => (L.oFoot ? FOOT_OUT + (L.oFoot - 1) * STAGGER + OUT - 0.04 : 0.2);
function inStart(r: number, L: Lines): number {
  const topRow = r < L.aTop, i = topRow ? r : r - L.aTop, count = topRow ? L.aTop : L.aFoot;
  const base = topRow ? topFree(L) : footFree(L);
  const st = count > 1 ? Math.max(0, Math.min(STAGGER, (1 - IN - base) / (count - 1))) : 0;
  return Math.min(base + i * st, 1 - IN);
}

/** Line r of the scene leaving (its lines at the top first, then at the foot), at w: [opacity, travel] (travel in
 *  shares of lineTravel, negative = up: the words go the way the page goes, faster as they go). */
export function lineOut(w: number, r: number, L: Lines): [number, number] {
  const t = clamp((w - outStart(r, L)) / OUT);
  return [1 - smooth(t), -(t * t)];
}

/** Line r of the scene arriving, at w: [opacity, travel] (positive = still below its place, slowing into it). Its
 *  stage comes in at strength `stage`; the line's own opacity makes up for it, so the line shows at its own pace (as
 *  far as the stage's strength allows). */
export function lineIn(w: number, r: number, L: Lines, stage = 1): [number, number] {
  const t = clamp((w - inStart(r, L)) / IN);
  return [Math.min(1, smooth(t) / Math.max(stage, 0.001)), (1 - t) * (1 - t)];
}

/** A scene's camera at local position s (screens from its top): [rise below its place in screens, scale].
 *  sr: its rest; h: its height in screens; first, last: no change into it / out of it; wIn, wOut: where the changes
 *  into and out of it are. */
export function camera(s: number, sr: number, h: number, wIn: number, wOut: number,
  o: { first: boolean; last: boolean }): [number, number] {
  const sa = -0.5 - WINDOW / 2, sd = h - 0.5 + WINDOW / 2;
  const rate = DRIFT / Math.max(0.5, sr - sa);
  let dy = 0, k = 1;
  if (s < sr) { if (!o.first) dy = rate * Math.min(sr - s, sr - sa); }
  else if (!o.last) dy = -rate * Math.min(s - sr, sd - sr);
  if (!o.first) k += GROW * (1 - smooth(wIn));
  if (!o.last) k += GROW * smooth(wOut);
  return [dy, k];
}

/** A light pass's shown strength: its strength from the light arithmetic (src/film/math.ts), eased at both ends of
 *  its step, with the value it rests at kept exactly (a scene whose light rests part way keeps that part). */
export function eased(t: number, atRest: number): number {
  if (atRest <= 0) return 0;
  return atRest * smooth(Math.min(1, t / atRest));
}
