// Scene 6, the board: the circuit board on the floor, written into the page at rest (as the page shows it with no
// script). The film (src/main.ts) draws it in step by step from the same elements. The shapes come from
// src/generated/board.json (made by scripts/board.mjs from src/film/board.json), in picture pixels.
import type { BoardForm, BoardWords } from '../src/types';

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
  return `<svg class="board b${k}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs>${defs}</defs>`
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

/** The two labels (real text): placed in the picture box by share of its size, per screen shape (see boardCss). */
export function boardLabels(w: BoardWords, d: BoardForm, p: BoardForm): string {
  // the film places them by these shares (desktop, phone), so it never depends on a media query agreeing with it
  const at = (f: BoardForm, k: 'studio' | 'next') => [...f.labels[k].map((v, i) => +((v / f.size[i]) * 100).toFixed(3)), f.labels[k === 'studio' ? 'studioSide' : 'nextSide']].join(',');
  return `<p class="blab chip" aria-hidden="true" data-d="${at(d, 'studio')}" data-p="${at(p, 'studio')}">${esc(w.chip)}</p>`
    + `<p class="blab next" aria-hidden="true" data-d="${at(d, 'next')}" data-p="${at(p, 'next')}">${esc(w.next)}</p>`;
}

/** How a label stands off its point: the chip's word right (r) or left (l) of its leader, NEXT below (b) or above (a).
 *  src/main.ts holds the same four. */
export const LABEL_SHIFT: Record<string, string> = { r: 'translate(8px,-50%)', l: 'translate(calc(-100% - 8px),-50%)', b: 'translate(-50%,4px)', a: 'translate(-50%,calc(-100% - 4px))' };

/** Where the labels sit in the picture box of one screen shape, as CSS (shares of the box). */
export function labelCss(f: BoardForm): string {
  const [W, H] = f.size, pc = (v: number, d: number) => +((v / d) * 100).toFixed(3) + '%', L = f.labels;
  return `.blab.chip{left:${pc(L.studio[0], W)};top:${pc(L.studio[1], H)};transform:${LABEL_SHIFT[L.studioSide]}}`
    + `.blab.next{left:${pc(L.next[0], W)};top:${pc(L.next[1], H)};transform:${LABEL_SHIFT[L.nextSide]}}`;
}
