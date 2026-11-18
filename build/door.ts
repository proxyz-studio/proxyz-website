// The doors: a product's own site, opened from its scene (build 9, rulebook v1 section 3).
// The studio serves each product under its own address (vercel.json forwards /tapz/ to the product's public site),
// so the browser can blend the two pages. This file writes what the page holds without any script: the door in the
// product's scene (its logo for dark grounds and a small arrow, a real link), the board scene's link (its name tag and
// the stand), the address hash that lands on the product's scene, the door's place on the page with scripts off, and
// the speculation rules file. src/door.ts runs the hand-over itself.
import { readFileSync } from 'node:fs';
import type { Content, Door, View } from '../src/types';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PORTRAIT = '(max-aspect-ratio: 1/1)';
const LANDSCAPE = '(min-aspect-ratio: 1001/1000)';
/** The orange of the lit tile: the one fill the logo's Z tile carries (the logo's own rule: nothing else is orange). */
const LIT = '#FF5A1F';
/** The small arrow after a door, in the logo's cream. */
export const DOOR_ARROW = '<svg class="arr" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M2 8 8 2M3.5 2H8V6.5" fill="none" stroke="#F0E8D8" stroke-width="1.2"/></svg>';

/** The doors that are on, each with the venture's scenes that hold it. */
export function openDoors(c: Content): Door[] {
  return c.doors.filter((d) => d.on);
}

/** The doors that are on in scene n (each door lists its scenes: its product's own scene, and the board). */
export function doorsOf(c: Content, n: number): Door[] {
  return openDoors(c).filter((d) => d.scenes?.includes(n));
}

/** The scene whose address hash a door owns: its venture's first scene (whether or not the door is on, so the
 *  product's own "back to the studio" link always lands on its scene). */
export function hashScene(c: Content, d: Door): number {
  return c.scenes.findIndex((s) => s.venture === d.venture) + 1;
}

/** The logo, inline (its own shapes, byte for byte), with the lit Z tile and its letter in a group of their own so the
 *  Z can press like a key. The file must be plain shapes: no style, script, image, link or font. */
export function logoSvg(root: string, d: Door): string {
  if (!d.logo) throw new Error(`door ${d.id}: no logo`);
  const src = readFileSync(root + d.logo, 'utf8');
  if (/<(style|script|image|use|foreignObject|text)\b|\sstyle=|href=/i.test(src)) throw new Error(`door ${d.id}: the logo ${d.logo} is not plain shapes`);
  const box = /viewBox="([^"]+)"/.exec(src)?.[1];
  const paths = [...src.matchAll(/<path\b[^>]*\/>/g)].map((m) => m[0]);
  const lit = paths.findIndex((p) => p.includes(`fill="${LIT}"`));
  if (!box || lit < 0 || paths.filter((p) => p.includes(`fill="${LIT}"`)).length !== 1 || lit !== paths.length - 2) {
    throw new Error(`door ${d.id}: the logo ${d.logo} must end with the one lit tile (${LIT}) and its letter`);
  }
  return `<svg class="tlogo" viewBox="${box}" aria-hidden="true" focusable="false">${paths.slice(0, lit).join('')}<g class="dz">${paths.slice(lit).join('')}</g></svg>`;
}

/** The door in the product's own scene: the logo and the arrow, one link. */
export function sceneDoor(root: string, d: Door, n: number): string {
  return `<a class="door dlogo" href="${esc(d.open ?? d.path)}" aria-label="${esc(d.label ?? '')}" data-door="${esc(d.id)}" data-scene="${n}">${logoSvg(root, d)}${DOOR_ARROW}</a>`;
}

/** The board scene's door: one link over the stand and its name tag (no logo on the board; the tag gets the arrow). */
export function boardDoor(d: Door, n: number): string {
  return `<a class="door dboard" href="${esc(d.open ?? d.path)}" aria-label="${esc(d.label ?? '')}" data-door="${esc(d.id)}" data-scene="${n}"></a>`;
}

/** Where a door's hash lands: a mark at the top of the scene's resting light (with the film: at the light's end, as
 *  the film lands; without it: the scene's top), so the browser's own jump to the hash and the film agree. */
export function hashMark(d: Door): string {
  return `<i id="${esc(d.id)}" class="at" aria-hidden="true"></i>`;
}

/** The speculation rules file the home page names in its Speculation-Rules header: the open doors, made ready in the
 *  browser at the first touch or click on them (Chrome). */
export function speculationRules(c: Content): string {
  const urls = openDoors(c).map((d) => d.open ?? d.path);
  return JSON.stringify(urls.length ? { prefetch: [{ source: 'list', urls, eagerness: 'conservative' }] } : {}) + '\n';
}

/** The door's size: a tile of the logo (px) on each kind of screen, the link's height (the touch area) and the gap
 *  between its last line of small words and the link's middle. The film picks the size by the room it has. */
export const DOOR_TILE = { desk: 24, phone: 20, small: 18 };

/** The door's place without the film (scripts off, or once the film has given up), as CSS:
 *  - wide screens: just under the product's thing, its logo's left edge on the thing's left edge;
 *  - upright screens: on the line of the small words' last line, at the right margin; on narrow phones (where the
 *    small line leaves no room beside it) just under the small words.
 *  The place uses the same arithmetic as the picture (the placement variables of build/pages.ts). */
export function doorCss(d: Door, n: number, form: 'desktop' | 'phone', media: string, view: View, place: { vars: string[]; left: string; top: string }, iw: number): string {
  const dv = view.doors?.[d.venture];
  if (!dv) throw new Error(`door ${d.id}: scene ${n} (${form}) has no door data in src/film/scenes.json`);
  const sel = `#s${n} .door.dlogo[data-door="${d.id}"]`;
  const r6 = (v: number) => +v.toFixed(6);
  if (form === 'desktop') {
    const left = `calc(${place.left} + ${r6(dv.thing[0] / iw)} * var(--sw) - var(--t) / 2)`;
    const top = `calc(${place.top} + ${r6(dv.thing[3] / iw)} * var(--sw) + 2px)`;
    return `@media ${media}{${sel}{${[...place.vars, `left:${left}`, `top:${top}`].join(';')}}}`;
  }
  // the words at the foot stand this far above the layer's foot (as .words in style.css); their last line is 15 px
  // at 1.45 on phones, and the link (44 px) is centred on it
  const foot = 'calc(var(--H) - var(--S) + var(--words-base) + var(--safe-b))';
  const line = 15 * 1.45, link = 44;
  const beside = `${sel}{--t:${DOOR_TILE.phone}px;left:auto;right:calc(var(--side) - var(--t) / 2);bottom:calc(${foot} - ${r6((link - line) / 2)}px)}`;
  const under = `${sel}{--t:${DOOR_TILE.small}px;right:auto;left:calc(var(--side) - var(--t) / 2);bottom:calc(${foot} - ${link + 4}px)}`;
  // beside the small words when they surely leave room (430 px and up; from 380 px where the browser balances their
  // lines, which keeps them short), else under them
  return `@media ${media}{${beside}}@media ${PORTRAIT} and (max-width: 429.98px){${under}}@supports (text-wrap: balance){@media ${PORTRAIT} and (min-width: 380px){${beside}}}`;
}

/** The board scene's link: the stand and its name tag, in shares of the picture's box (its labels' box). */
export function boardDoorCss(d: Door, n: number, media: string, view: View, iw: number, ih: number): string {
  const h = view.doors?.[d.venture]?.hit;
  if (!h) throw new Error(`door ${d.id}: the board scene ${n} has no link area ("hit") in src/film/scenes.json`);
  const pc = (v: number, s: number) => +((v / s) * 100).toFixed(3) + '%';
  return `@media ${media}{#s${n} .door.dboard[data-door="${d.id}"]{left:${pc(h[0], iw)};top:${pc(h[1], ih)};width:${pc(h[2] - h[0], iw)};height:${pc(h[3] - h[1], ih)}}}`;
}

/** With the film, a hash mark sits at the top of the scene's resting light (lightShare of the scene's run). */
export function hashMarkCss(n: number, share: number): string {
  return `.film #film #s${n} > .at{top:calc((100% - var(--H)) * ${share})}`;
}

export { LANDSCAPE as DOOR_LANDSCAPE, PORTRAIT as DOOR_PORTRAIT };
