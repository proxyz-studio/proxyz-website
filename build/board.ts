// Scene 6, the board: the circuit board on the floor, written into the page at rest (as the page shows it with no
// script). The film (src/main.ts) draws it in step by step from the same elements. The shapes come from
// src/generated/board.json (made by scripts/board.mjs from src/film/board.json), in picture pixels.
import { readFileSync } from 'node:fs';
import type { BoardForm, BoardWords, Venture } from '../src/types';

const WHITE = '#f3eee4';
export const BOARD_COLOURS = { stand: '#F2D78C', coin: '#5BC9B8', phone: '#FF4193' } as const;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const line = (pts: number[][]) => 'M' + pts.map((p) => p.join(',')).join('L');

/** An ellipse shaped radial gradient in picture pixels. */
function oval(id: string, [cx, cy, rx, ry]: number[], colour: string, stops: [number, number][]): string {
  const s = stops.map(([o, a]) => `<stop offset="${o}" stop-color="${colour}" stop-opacity="${a}"/>`).join('');
  return `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${rx}" gradientTransform="translate(${cx} ${cy}) scale(1 ${(ry / rx).toFixed(4)}) translate(${-cx} ${-cy})">${s}</radialGradient>`;
}

/** The board of one screen shape (k: "d" desktop, "p" phone), every part at rest. Each part carries the class the
 *  film steps it by: b1 the chip, t-stand / t-coin / t-phone a live trace, b4 the net and the place for the next one. */
export function boardSvg(f: BoardForm, k: 'd' | 'p'): string {
  const [W, H] = f.size, id = (s: string) => `b${k}${s}`;
  const defs = oval(id('n'), f.pool, WHITE, [[0, 0.26], [0.55, 0.19], [1, 0]])
    + oval(id('m'), [f.pool[0], f.pool[1], f.pool[2] * 1.15, f.pool[3] * 1.15], '#000', [[0, 0.2], [0.75, 0.16], [1, 0]])
    + oval(id('c'), f.chip.glow, WHITE, [[0, 0.24], [0.45, 0.09], [1, 0]]);
  const c = f.chip;
  const traces = (['stand', 'coin', 'phone'] as const).map((t) => {
    const L = f.live[t], col = BOARD_COLOURS[t], d = line(L.pts);
    return `<g class="tr t-${t}" stroke="${col}">`
      + L.side.map((s) => `<path class="sd w1" d="${line(s)}" stroke-opacity=".45"/>`).join('')
      + `<path class="gl wg" d="${d}" stroke-opacity=".2"/><path class="co wl" d="${d}" stroke-opacity=".95"/>`
      + `<path class="pd wp" d="${L.pad}" stroke-opacity=".62"/>`
      + `<path class="pu wu" d=""/><path class="fl wf" d="${L.pad}" stroke-opacity="0"/></g>`;
  }).join('');
  // data-arrive: the pass strengths at which the race piece and the coach phone are 70% lit (the film lands each
  // trace's head on its pad there)
  return `<svg class="board b${k}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true" focusable="false" data-arrive="${f.arrive.coin[1]},${f.arrive.phone[1]}"><defs>${defs}</defs>`
    + `<g class="b4"><rect class="dm" width="${W}" height="${H}" fill="url(#${id('m')})"/><path class="w1" d="${f.net}" stroke="url(#${id('n')})"/><path class="wv" d="${f.vias}" stroke="url(#${id('n')})"/></g>`
    + `<g class="b1"><ellipse class="cg" cx="${c.glow[0]}" cy="${c.glow[1]}" rx="${c.glow[2]}" ry="${c.glow[3]}" fill="url(#${id('c')})"/>`
    + `<path class="w1" d="${c.pins}" stroke="${WHITE}" stroke-opacity=".7"/>`
    + c.sides.map((s) => `<path class="w0" d="${s}" fill="#050506" stroke="${WHITE}" stroke-opacity=".35"/>`).join('')
    + `<path class="wr" d="${c.top}" fill="#0d0d0f" stroke="${WHITE}" stroke-opacity=".95"/>`
    + `<path class="w0" d="${c.inner}" stroke="${WHITE}" stroke-opacity=".35"/>`
    + `<path class="wv" d="M${c.dot.join(',')}h0" stroke="${WHITE}"/>`
    + `<path class="w0" d="${line(c.leader)}" stroke="${WHITE}" stroke-opacity=".7"/></g>`
    + traces
    + `<g class="b4 nx" stroke="${WHITE}" stroke-opacity=".42"><path class="dr wn" d="${line(f.empty.pts)}"/><path class="dp wn" d="${f.empty.pad}"/></g>`
    + '</svg>';
}

const TRACES = ['stand', 'coin', 'phone'] as const;
type Kind = 'studio' | 'next' | (typeof TRACES)[number];
/** A label's point and side in one form: "x%,y%,side" (shares of the picture box). */
function spot(f: BoardForm, k: Kind): [number[], string] {
  const L = f.labels;
  return k === 'studio' ? [L.studio, L.studioSide] : k === 'next' ? [L.next, L.nextSide] : [L.names[k].at, L.names[k].side];
}
const shares = (f: BoardForm, k: Kind) => { const [at, side] = spot(f, k); return [...at.map((v, i) => +((v / f.size[i]) * 100).toFixed(3)), side].join(','); };

/** The five labels (real text), in their own box (.lbox) beside the picture's box, so the picture's soft side edges
 *  never fade them: placed by share of the box, per screen shape (see labelCss). The three names come from the
 *  ventures (by id); a venture with no name gets no tag. */
export function boardLabels(w: BoardWords, ventures: Venture[], d: BoardForm, p: BoardForm, doors: { venture: string; arrow: string; link: string }[] = []): string {
  // the film places them by these shares (desktop, phone), so it never depends on a media query agreeing with it
  const tag = (cls: string, k: Kind, text: string, after = '') => `<p class="blab ${cls}" aria-hidden="true" data-d="${shares(d, k)}" data-p="${shares(p, k)}">${esc(text)}${after}</p>`;
  const names = TRACES.map((t) => {
    const id = d.labels.names[t].venture;
    if (p.labels.names[t].venture !== id) throw new Error(`board: the ${t} name tag is a different venture in the two forms`);
    const name = ventures.find((v) => v.id === id)?.name;
    // a venture whose door is on: its name tag gets the door's small arrow (the tag and its thing are the link)
    return name ? tag(`name n-${t}`, t, name, doors.find((x) => x.venture === id)?.arrow ?? '') : '';
  }).join('');
  return `<div class="lbox">${tag('chip', 'studio', w.chip)}${names}${tag('next', 'next', w.next)}${doors.map((x) => x.link).join('')}</div>`;
}

/** How a label stands off its point: right (r) or left (l) of it, below (b) or above (a) it and centred, or hanging
 *  below it with its left edge on it (d). src/main.ts holds the same five. */
export const LABEL_SHIFT: Record<string, string> = { r: 'translate(8px,-50%)', l: 'translate(calc(-100% - 8px),-50%)', b: 'translate(-50%,4px)', a: 'translate(-50%,calc(-100% - 4px))', d: 'translate(0,4px)' };

/** Where the labels sit in the picture box of one screen shape, as CSS (shares of the box). */
export function labelCss(f: BoardForm): string {
  const [W, H] = f.size, pc = (v: number, d: number) => +((v / d) * 100).toFixed(3) + '%';
  const one = (sel: string, k: Kind) => { const [at, side] = spot(f, k); return `${sel}{left:${pc(at[0], W)};top:${pc(at[1], H)};transform:${LABEL_SHIFT[side]}}`; };
  return one('.blab.chip', 'studio') + one('.blab.next', 'next') + TRACES.map((t) => one(`.blab.n-${t}`, t)).join('');
}

/** Each name in its trace's colour. */
export const nameCss = (): string => TRACES.map((t) => `.blab.n-${t}{color:${BOARD_COLOURS[t]}}`).join('');

/* ---------- build 12H: the board at work ---------- */
// While scene 6 rests, the three ventures work at the same time (src/main.ts alive): the stand's tiles light one after
// another as if tapped, the race route draws itself in on the coin, the coach phone's dial fills; then a spark of each
// one's colour runs down its trace to the chip, the chip flashes, and white sparks run back out. All of it is drawn
// here, over the picture (light added to it: screen), empty at rest; the zero frame of the loop is the still.

/** The four tile pictures, left to right, exactly as the TAPZ site draws them (build 12I: src/film/icons, made by
 *  scripts/tile-pictograms.mjs from TAPZ's own geometry, the same drawings the stills raise on the tiles): a green chat
 *  bubble, a pink camera, a white fork and knife, a white globe. */
export const TILE_ICONS = ['chat', 'photo', 'menu', 'web'] as const;
/** the main colour of each picture (its glow on the tile): TAPZ's green and pink, and a warm white */
const ICON_GLOW = ['#22C55E', '#FF4193', '#ECEAE6', '#ECEAE6'];
const iconRoot = new URL('../src/film/icons/', import.meta.url);
/** an icon's drawing (its 512 unit square), its ids made unique (drawn in place, not through <use>: WebKit draws a <use>
 *  copy in a hidden tree of its own, which a strict style policy may refuse) */
function iconBody(name: string, id: string): string {
  const src = readFileSync(new URL(name + '.svg', iconRoot), 'utf8');
  return src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
    .replace(/id="([^"]+)"/g, `id="${id}-$1"`).replace(/url\(#([^)]+)\)/g, `url(#${id}-$1)`);
}
const n1 = (v: number) => +v.toFixed(4);

/** The board at work for one screen shape: empty and unseen at rest, moved by src/main.ts. */
export function aliveSvg(f: BoardForm, k: 'd' | 'p'): string {
  const [W, H] = f.size, id = (s: string) => `a${k}${s}`, A = f.alive;
  const defs = ICON_GLOW.map((c, i) => `<radialGradient id="${id('h' + i)}"><stop offset="0" stop-color="${c}" stop-opacity=".9"/><stop offset=".55" stop-color="${c}" stop-opacity=".35"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('')
    + `<radialGradient id="${id('c')}"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".35" stop-color="#f3eee4" stop-opacity=".45"/><stop offset="1" stop-color="#f3eee4" stop-opacity="0"/></radialGradient>`;
  // each tile: its halo (an oval of the icon's colour round the tile) and the icon itself, laid on the tile's face
  const tiles = A.tiles.map(([tl, tr, bl], i) => {
    const a = (tr[0] - tl[0]) / 512, b = (tr[1] - tl[1]) / 512, c = (bl[0] - tl[0]) / 512, d = (bl[1] - tl[1]) / 512;
    const cx = (tr[0] + bl[0]) / 2, cy = (tr[1] + bl[1]) / 2, rx = Math.hypot(tr[0] - tl[0], tr[1] - tl[1]) * 0.95, ry = Math.hypot(bl[0] - tl[0], bl[1] - tl[1]) * 1.05;
    return `<g class="ti" opacity="0"><ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(rx)}" ry="${n1(ry)}" fill="url(#${id('h' + i)})"/>`
      + `<g transform="matrix(${[a, b, c, d, tl[0], tl[1]].map(n1).join(' ')})">${iconBody(TILE_ICONS[i], id('i' + i))}</g></g>`;
  }).join('');
  const [cx, cy, rx, ry] = f.chip.glow;
  return `<svg class="alive a${k}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true" focusable="false" data-route="${A.route.map((p) => p.join(',')).join(' ')}" data-screen="${A.screen.flat().join(',')}" data-dial="${A.dial.join(',')}"><defs>${defs}</defs>`
    + `<g class="at">${tiles}</g>`
    + '<g class="ar" opacity="0"><path class="rg" d=""/><path class="rc" d=""/></g>'
    + '<g class="ad" opacity="0"><path class="dg" d=""/><path class="dc" d=""/></g>'
    + `<ellipse class="cf" cx="${cx}" cy="${cy}" rx="${n1(rx * 1.6)}" ry="${n1(ry * 1.6)}" fill="url(#${id('c')})" opacity="0"/>`
    + (['stand', 'coin', 'phone'] as const).map((t) => `<g class="sp s-${t}" stroke="${BOARD_COLOURS[t]}"><path class="k3" d=""/><path class="k2" d=""/><path class="k1" d=""/><path class="k0" d=""/></g>`).join('')
    + '</svg>';
}
