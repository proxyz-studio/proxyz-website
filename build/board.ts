// Scene 6, the board: the circuit board on the floor, written into the page at rest (as the page shows it with no
// script). The film (src/main.ts) draws it in step by step from the same elements. The shapes come from
// src/generated/board.json (made by scripts/board.mjs from src/film/board.json), in picture pixels.
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
export function boardLabels(w: BoardWords, ventures: Venture[], d: BoardForm, p: BoardForm): string {
  // the film places them by these shares (desktop, phone), so it never depends on a media query agreeing with it
  const tag = (cls: string, k: Kind, text: string) => `<p class="blab ${cls}" aria-hidden="true" data-d="${shares(d, k)}" data-p="${shares(p, k)}">${esc(text)}</p>`;
  const names = TRACES.map((t) => {
    const id = d.labels.names[t].venture;
    if (p.labels.names[t].venture !== id) throw new Error(`board: the ${t} name tag is a different venture in the two forms`);
    const name = ventures.find((v) => v.id === id)?.name;
    return name ? tag(`name n-${t}`, t, name) : '';
  }).join('');
  return `<div class="lbox">${tag('chip', 'studio', w.chip)}${names}${tag('next', 'next', w.next)}</div>`;
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
