// The film.
// One fixed stage per scene, each scene a stack of light passes of one fixed camera. The scroll position sets how far
// the light has come. A cut with a short fade between scenes. The border on top.
// Without this script the page stays a plain document (seven sections, each with its resting picture).
import './style.css';
import { startClock } from './clock';
import { scenes as SCENES, lightShare as LIGHT_SHARE, brainScene as BRAIN } from './film/scenes.json';
import pictureData from './generated/pictures.json';
import { clamp, cutMask, frameMask, lightAt, passStrength } from './film/math';
import type { Pictures, PictureFile, View } from './types';

type Form = 'desktop' | 'phone';
interface Pass { key: string; img: HTMLImageElement; node: HTMLElement; ready: boolean; lit: number }
interface Matte { url: string; img: HTMLImageElement; ready: boolean }
interface SceneState {
  el: HTMLElement; layer: HTMLElement; box: HTMLElement;
  /** the words at the foot of the screen (the giant words of scenes 1 and 7, the small line of the others) */
  words: HTMLElement | null;
  /** the stage wide box of the giant words at the top, and the heading in it (scenes 2 to 6) */
  cut: HTMLElement | null; top: HTMLElement | null;
  mark: number; built: string; passes: Pass[];
  /** the matte of the thing lit from the first pass, when the scene's view names one the manifest holds */
  matte: Matte | null;
  /** scene 6: the matte of all three things, which the board on the floor is hidden in */
  things: Matte | null;
}

const pictures = pictureData as unknown as Pictures;
const scenes = SCENES as unknown as Record<string, Record<Form, View>>;
const doc = document.documentElement;
const $ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];

const portrait = matchMedia('(max-aspect-ratio: 1/1)');
const reducedMQ = matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => reducedMQ.matches;
// the shape from the window itself: some engines answer the media query late during a resize
const formNow = (): Form => (innerWidth / Math.max(1, innerHeight) <= 1 ? 'phone' : 'desktop');
const top = $('#top');
// the film puts the visitor back in the same scene after a reload itself (the page grows only once this script runs,
// so a browser restoring the old place by itself lands too high)
try { history.scrollRestoration = 'manual'; } catch { /* old browser: it restores what it can */ }

/* ---------- start: take the later pictures out, then switch the film on ---------- */
// The resting pictures of scenes 2 to 7 are for the page without the script. Taken out before the film styles apply,
// so they do not all load at once; each is put back as a light pass when the visitor nears its scene.
const sections = $$('#film .scene');
let boardBox: HTMLElement | null = null;
const stills = new Map<number, HTMLElement>();
// Each scene's description stays on its stage from the start (a screen reader hears it before the pictures load);
// the light passes themselves are decoration.
const alts = sections.map((s) => $<HTMLImageElement>('img', s)?.alt ?? '');
sections.forEach((s, i) => {
  const pic = i > 0 ? $('picture', s) : null;
  if (pic) { stills.set(i + 1, pic); pic.remove(); }
  // the board waits for its scene too (it goes back in with the scene's pictures)
  const bb = $('.bbox', s);
  if (bb) { boardBox = bb; bb.remove(); }
  const box = $('.passes', s)!;
  box.setAttribute('role', 'img');
  box.setAttribute('aria-label', alts[i]);
});
// If anything below fails, the page goes back to the plain document, pictures and all.
addEventListener('error', () => {
  doc.classList.remove('film', 'film-init');
  doc.classList.add('nofilm');
  sections.forEach((s) => { const box = $('.passes', s)!; box.removeAttribute('role'); box.removeAttribute('aria-label'); });
  stills.forEach((pic, n) => { if (!pic.isConnected) $('.passes', sections[n - 1])?.append(pic); });
  if (boardBox) {
    stopPulses();
    for (const e of [boardBox, ...boardBox.querySelectorAll<HTMLElement>('[style]')]) e.removeAttribute('style');
    restD.forEach((d, e) => e.setAttribute('d', d));
    if (!boardBox.isConnected) $('.passes', sections[BRAIN - 1])?.append(boardBox);
  }
  // the plain page's own cut (style.css) takes over from the film's
  $$('.cut').forEach((c) => c.removeAttribute('style'));
}, { once: true });
const first = $<HTMLImageElement>('#s1 img.pass');
let firstKept = true;   // the first paint picture is reused until a full rebuild for the other screen shape

const S: SceneState[] = sections.map((el) => ({
  el,
  layer: $('.layer', el)!,
  box: $('.passes', el)!,
  words: $('.words', el),
  cut: $('.cut', el),
  top: $('.cut .big', el),
  mark: Number(el.dataset.mark ?? -1),
  built: '',
  passes: [],
  matte: null,
  things: null,
}));
S.slice(1).forEach((s) => s.box.classList.remove('ready'));
doc.classList.add('film', 'film-init');
sections[0].classList.add('on');
requestAnimationFrame(() => requestAnimationFrame(() => doc.classList.remove('film-init')));

// a steady screen height: the large viewport, which does not change when a phone browser's bar slides
const probe = document.createElement('div');
probe.className = 'probe';
probe.setAttribute('aria-hidden', 'true');
document.body.append(probe);
// the bottom safe area (an iPhone's home bar). Older iPhones report 0 with the browser's bar showing and 34 px with it
// away, so the pictures are placed for the largest inset seen so far: a scene placed while the bar shows is placed
// again once, the first time the bar slides away, and never changes after that.
const probeB = document.createElement('div');
probeB.className = 'probe-b';
probeB.setAttribute('aria-hidden', 'true');
document.body.append(probeB);
let insetMax = probeB.offsetHeight;
// the small viewport (a phone browser's bar showing): the pictures leave room for the words at the foot as they sit
// then, so nothing that appears later ever runs under them, whichever bar layout the browser uses
const probeS = document.createElement('div');
probeS.className = 'probe-s';
probeS.setAttribute('aria-hidden', 'true');
document.body.append(probeS);
// the width the styles call 100vw (Firefox leaves a classic scroll bar out of it, the window's own width keeps it in)
const vwNow = () => probe.getBoundingClientRect().width || innerWidth;
let VW = vwNow(), VH = probe.offsetHeight || innerHeight, SVH = Math.min(VH, probeS.offsetHeight || VH), form: Form = formNow();
// in em of a giant line (set by the build from the display face): its capitals' height, its box under the baseline
const typeEm = (name: string) => parseFloat(getComputedStyle(doc).getPropertyValue(name)) || 0;

startClock();

/* ---------- pictures ---------- */
const keyOfUrl = new Map<string, string>();
for (const [key, v] of Object.entries(pictures)) for (const f of v.files) for (const u of [f.avif, f.webp]) if (u) keyOfUrl.set(u, key);
const keyOf = (img: HTMLImageElement) => {
  const u = img.currentSrc || img.src;
  return keyOfUrl.get(u.startsWith('data:') ? u : new URL(u, location.href).pathname);
};

function fileFor(key: string, cssWidth: number): PictureFile {
  const files = pictures[key].files;
  const need = cssWidth * (devicePixelRatio || 1);
  return files.find((f) => f.w * 1.15 >= need) ?? files[files.length - 1];
}

function makePicture(file: PictureFile): { node: HTMLElement; img: HTMLImageElement } {
  const node = document.createElement('picture');
  if (file.avif) {
    const s = document.createElement('source');
    s.type = 'image/avif';
    s.srcset = file.avif;
    node.append(s);
  }
  // the address is set only once the img sits inside its picture, after its source: an img that gets its address
  // first starts the fallback file at once (the Safari engine then fetches the WebP as well as the AVIF)
  const img = new Image();
  img.decoding = 'async';
  node.append(img);
  img.src = file.webp;
  return { node, img };
}

/** Resolves once the picture is loaded and decoded, so it never shows half drawn. */
async function whenReady(img: HTMLImageElement): Promise<void> {
  try { await img.decode(); return; } catch { /* not loaded yet, or the browser cannot decode early */ }
  if (img.complete && img.naturalWidth) return;
  await new Promise<void>((res) => { img.addEventListener('load', () => res(), { once: true }); img.addEventListener('error', () => res(), { once: true }); });
}

/* ---------- placing one picture from its frame (logical size from the manifest, never the file's own) ---------- */
interface Box { left: number; top: number; w: number; h: number }
// the screens on which the words stand without the safe area (as in style.css)
const deskMQ = matchMedia('(min-width: 900px) and (min-height: 501px)');
/** How far the words at the foot stand above the visible bottom: the base from style.css (--words-base: 60 on
 *  phones upright, 20 sideways, the desktop value on desktop); on phones the bottom safe area comes on top. */
const wordsBase = (): number => parseFloat(getComputedStyle(doc).getPropertyValue('--words-base')) || 0;
/** Called on resize and on scroll: when the bottom safe area grows past the largest seen, place the pictures again. */
function checkInset(): void {
  const b = probeB.offsetHeight;
  if (b > insetMax) { insetMax = b; layoutAll(); }
}
/** The scene's matte, when its view names one and the picture manifest holds it. */
const matteOf = (view: View): string | null => (view.matte && pictures[view.matte]?.matte ? view.matte : null);

function geometry(view: View, s: SceneState): Box {
  const [iw, ih] = pictures[view.passes[0]].size;
  const f = view.frame, vw = VW, vh = VH, vs = SVH;
  const roomN = view.placeAs ?? S.indexOf(s) + 1;
  const room = S[roomN - 1];   // the words that set the room (and the view that may tuck the thing under them)
  // the words at the foot start here: at the small height (the bar showing) or, without a bar, above the home bar
  const foot = room.words ? room.words.getBoundingClientRect().height : 0;
  const inset = deskMQ.matches ? 0 : insetMax;
  const footTop = Math.min(vs - wordsBase() - foot, vh - wordsBase() - inset - foot);
  // the giant words at the top end here; a thing with a matte may reach into the capitals of their lowest line
  const topEnd = room.top ? room.top.offsetTop + room.top.getBoundingClientRect().height : 0;
  let k = f.fit === 'width' ? vw / iw : f.fit === 'contain' ? Math.min(vw / iw, vh / ih) : Math.max(vw / iw, vh / ih);
  k *= f.zoom ?? 1;
  let roomTop = 0, roomBot = 0;
  if (f.span) {
    // span: these picture rows fit in the room the words leave, the picture made smaller when it must (never under
    // half); the room ends 16 px over the words at the foot
    const rv = viewOf(roomN);
    const tuck = matteOf(rv) ? rv.frame.tuck ?? 0 : 0;
    // the lowest line's size (on a wide screen every line has the block's size, so the last .pl serves both shapes)
    const lines = room.top ? room.top.querySelectorAll<HTMLElement>('.pl') : null;
    const last = lines && lines.length ? parseFloat(getComputedStyle(lines[lines.length - 1]).fontSize) : 0;
    roomTop = !room.top ? (top ? top.getBoundingClientRect().bottom : 0) + 12
      : tuck ? topEnd - (typeEm('--type-under') + tuck * typeEm('--type-cap')) * last
      : topEnd + 12;
    roomBot = footTop - 16;
    const rows = f.span[1] - f.span[0];
    k = Math.min(k, Math.max(roomBot - roomTop, 0.5 * k * rows) / rows);
  }
  const w = iw * k, h = ih * k;
  let left = f.vx * vw - f.fx * w, topY = f.vy * vh - f.fy * h;
  // cover: a picture wider than the screen covers it; one narrower stays inside it
  if (f.fit === 'cover') { left = clamp(left, Math.min(0, vw - w), Math.max(0, vw - w)); topY = clamp(topY, Math.min(0, vh - h), Math.max(0, vh - h)); }
  // above and below: a picture row kept clear of the giant words at the foot or at the top
  if (f.above && room.words && !room.top) topY = Math.min(topY, footTop - f.above[1] - f.above[0] * k);
  if (f.below && room.top) topY = Math.max(topY, topEnd + f.below[1] - f.below[0] * k);
  // the span's rows inside the room (as CSS clamp: when the room is too small, its top wins)
  if (f.span) topY = Math.max(roomTop - f.span[0] * k, Math.min(topY, roomBot - f.span[1] * k));
  return { left, top: topY, w, h };
}

/** The cut in the giant words, placed exactly where the picture sits; or none. */
function setCut(s: SceneState, view: View, g: Box | null): void {
  const c = s.cut;
  if (!c) return;
  if (!g || !s.matte?.ready) { c.removeAttribute('style'); return; }
  const px = (v: number) => v.toFixed(2) + 'px';
  const m = cutMask(s.matte.url, view.opens ? '' : frameMask(view, pictures[view.passes[0]].size), { left: px(g.left), top: px(g.top), w: px(g.w), h: px(g.h) });
  const st = c.style;
  st.setProperty('-webkit-mask-image', m.image); st.setProperty('mask-image', m.image);
  st.setProperty('-webkit-mask-size', m.size); st.setProperty('mask-size', m.size);
  st.setProperty('-webkit-mask-position', m.position); st.setProperty('mask-position', m.position);
  st.setProperty('-webkit-mask-repeat', m.repeat); st.setProperty('mask-repeat', m.repeat);
  st.setProperty('-webkit-mask-composite', m.webkitComposite); st.setProperty('mask-composite', m.composite);
}

function place(s: SceneState, view: View): void {
  const g = geometry(view, s);
  const mask = frameMask(view, pictures[view.passes[0]].size);
  for (const p of s.passes) {
    Object.assign(p.img.style, { width: g.w + 'px', height: g.h + 'px', left: g.left + 'px', top: g.top + 'px', filter: view.filter ?? '' });
    if (!view.opens) { p.img.style.webkitMaskImage = mask; p.img.style.maskImage = mask; }
  }
  // the cut only once the first pass shows: a hole in the letters before the thing is there would give it away
  setCut(s, view, s.box.classList.contains('ready') ? g : null);
  // sides: a picture narrower than the screen fades into black at its left and right edges
  let sm = '';
  if (view.frame.sides) {
    const fe = 0.14 * g.w;
    if (g.left > -fe || g.left + g.w < VW + fe) {
      sm = `linear-gradient(to right,transparent ${g.left.toFixed(1)}px,#000 ${(g.left + fe).toFixed(1)}px,#000 ${(g.left + g.w - fe).toFixed(1)}px,transparent ${(g.left + g.w).toFixed(1)}px)`;
    }
  }
  s.box.style.webkitMaskImage = sm;
  s.box.style.maskImage = sm;
  if (S.indexOf(s) === BRAIN - 1) placeBoard(view, g);
}

/* ---------- building the light passes of one scene ---------- */
// the last scene may use the twin of scene 6 (a build time choice, written on the section)
const viewOf = (n: number): View => scenes[sections[n - 1].dataset.view === 'twin' ? `${n}twin` : String(n)][form];

function build(n: number): void {
  const s = S[n - 1], view = viewOf(n);
  const width = geometry(view, s).w;
  const files = view.passes.map((k) => fileFor(k, width));
  const want = form + '|' + files.map((f) => f.webp).join('|');
  if (s.built === want) return;
  s.built = want;
  const keepFirst = n === 1 && firstKept && first && keyOf(first) === view.passes[0] ? first : null;
  const still = stills.get(n);
  const stillImg = still ? $<HTMLImageElement>('img', still) : null;
  let usedStill = false;
  s.passes = view.passes.map((key, k) => {
    let img: HTMLImageElement, node: HTMLElement;
    if (k === 0 && keepFirst) { img = keepFirst; node = keepFirst.parentElement!; }
    else if (still && stillImg && (stillImg.currentSrc || stillImg.complete) && keyOf(stillImg) === key && !still.isConnected) {
      img = stillImg; node = still; img.loading = 'eager'; usedStill = true;
    } else ({ node, img } = makePicture(files[k]));
    img.classList.add('pass');
    img.classList.remove('still');
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.style.opacity = k === 0 ? '1' : '0';
    return { key, img, node, ready: false, lit: 0 };
  });
  if (n === 1 && !keepFirst) firstKept = false;
  if (usedStill) stills.delete(n);
  // the matte loads with the passes; the first pass waits for it, so the thing and its cut arrive together
  const mk = s.cut ? matteOf(view) : null;
  s.matte = null;
  if (mk) {
    const file = fileFor(mk, width), img = new Image();
    img.decoding = 'async';
    img.src = file.webp;
    s.matte = { url: file.webp, img, ready: false };
  }
  // scene 6: the matte of all three things; the board shows only once it is there (its lines run behind them)
  s.things = null;
  if (n === BRAIN && boardBox && view.things && pictures[view.things]?.matte) {
    const file = fileFor(view.things, width), img = new Image();
    img.decoding = 'async';
    img.src = file.webp;
    s.things = { url: file.webp, img, ready: false };
  }
  const firstReady = !!keepFirst && keepFirst.complete && keepFirst.naturalWidth > 0 && !s.matte;
  s.box.classList.toggle('ready', firstReady);
  s.box.replaceChildren(...s.passes.map((p) => p.node), ...(s.things && boardBox ? [boardBox] : []));
  if (n === BRAIN) boardForm();
  place(s, view);
  const mine = s.built;
  const shown = () => {
    if (s.built !== mine || !s.passes[0].ready || (s.matte && !s.matte.ready)) return;
    s.box.classList.add('ready');
    place(s, view);
  };
  for (const p of s.passes) {
    whenReady(p.img).then(() => {
      if (s.built !== mine) return;
      p.ready = true;
      if (p === s.passes[0]) shown();
      schedule();
    });
  }
  const t = s.things;
  if (t) whenReady(t.img).then(() => {
    if (s.built !== mine || !boardBox) return;
    if (t.img.naturalWidth > 0) { t.ready = true; boardMask(t.url); schedule(); }
  });
  const m = s.matte;
  if (m) whenReady(m.img).then(() => {
    if (s.built !== mine) return;
    // a matte that cannot load: the letters simply show, whole
    if (m.img.naturalWidth > 0) m.ready = true; else s.matte = null;
    shown();
  });
}

/** Lets go of a scene's pictures (a phone cannot hold every big picture of the film at once). */
function release(n: number): void {
  const s = S[n - 1];
  s.built = '';
  // Firefox picks the fallback file of a picture it is about to drop and fetches it; with no src it fetches nothing
  for (const p of s.passes) p.img.removeAttribute('src');
  s.passes = [];
  s.matte = null;
  s.things = null;
  if (n === BRAIN) boardGone();
  s.cut?.removeAttribute('style');
  s.box.replaceChildren();
  s.box.classList.remove('ready');
  if (n === 1) firstKept = false;
}

/* ---------- the light ---------- */
function light(n: number, prog: number): void {
  const s = S[n - 1], view = viewOf(n);
  if (!s.passes.length) return;
  const q = lightAt(view, prog, reduced());
  s.passes.forEach((p, k) => {
    if (k === 0) return;
    const t = p.ready ? passStrength(view, q, k) : 0;
    p.lit = t;
    if (!view.opens) { p.img.style.opacity = t.toFixed(3); return; }
    // opens: the pass shows at full strength through an oval that grows from the old pool to 1.6 times the new one,
    // so the edge of the light travels. Off before it starts, no oval once it is done.
    const [W, H] = pictures[view.passes[0]].size, a = view.opens[k - 1], b = view.opens[k];
    let m = '';
    if (t > 0 && t < 1) {
      const e = t * t * (3 - 2 * t);
      const L = (u: number, v: number, g = 1) => u + (v * g - u) * e;
      const pc = (v: number, d: number) => ((v / d) * 100).toFixed(2) + '%';
      m = `radial-gradient(ellipse ${pc(L(a[2], b[2], 1.6), W)} ${pc(L(a[3], b[3], 1.6), H)} at ${pc(L(a[0], b[0]), W)} ${pc(L(a[1], b[1]), H)},#000 0,#000 68%,transparent 100%)`;
    }
    // the new pass comes in over the first eighth of its step, so the rim of the light does not tick when it starts
    p.img.style.opacity = t > 0 ? Math.min(1, t / 0.12).toFixed(3) : '0';
    p.img.style.webkitMaskImage = m;
    p.img.style.maskImage = m;
  });
  $('.dim', s.layer)!.style.opacity = view.end === 'dark' ? (q * 0.75).toFixed(3) : '0';
}

/* ---------- scene 6: the board on the floor ---------- */
// The page holds the board at rest (build/board.ts). The film draws it in as a pure function of the scroll, in steps
// tied to the light: the chip and the stand's trace as the scene comes in, the race piece's trace with the second
// pass, the phone's with the third, then the net and the place for the next one. At rest small pulses run the three
// live traces. With less motion: the rest state, no pulses.
type Pt = number[];
interface Line { pts: Pt[]; at: number[]; d: string }
interface Trace { co: SVGPathElement; gl: SVGPathElement; sd: SVGPathElement[]; pd: SVGPathElement; pu: SVGPathElement; fl: SVGPathElement; line: Line; side: Line[]; f: number }
interface BoardView { svg: SVGSVGElement; b1: SVGElement; b4: SVGElement[]; dm: SVGElement; tr: Trace[]; dr: SVGPathElement; dp: SVGPathElement; route: Line }
/** every path's resting d, so the plain page gets the board back whole if the film gives up */
const restD = new Map<SVGPathElement, string>();
const lineOf = (d: string): Line => {
  const pts = [...d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((m) => [+m[1], +m[2]]);
  const at = [0];
  for (let i = 1; i < pts.length; i++) at.push(at[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, at, d };
};
/** the part of a line between lengths a and b (in picture pixels), as path data */
function partD(l: Line, a: number, b: number): string {
  const L = l.at[l.at.length - 1];
  a = Math.max(0, a); b = Math.min(L, b);
  if (b <= a) return '';
  if (a <= 0 && b >= L) return l.d;   // whole: the page's own path, exactly
  const pos = (v: number): Pt => {
    let i = 1;
    while (i < l.at.length - 1 && l.at[i] < v) i++;
    const s = l.at[i] - l.at[i - 1] || 1, t = (v - l.at[i - 1]) / s, p = l.pts[i - 1], q = l.pts[i];
    return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  };
  const out = [pos(a)];
  for (let i = 1; i < l.pts.length; i++) if (l.at[i] > a && l.at[i] < b) out.push(l.pts[i]);
  out.push(pos(b));
  return 'M' + out.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L');
}
const lenOf = (l: Line) => l.at[l.at.length - 1];
const setD = (e: SVGPathElement, d: string) => { if (e.getAttribute('d') !== d) e.setAttribute('d', d); };
const setO = (e: Element, o: number) => { const v = o >= 1 ? '' : o.toFixed(3); const st = (e as HTMLElement).style; if (st.opacity !== v) st.opacity = v; };
const ramp = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

let BV: BoardView | null = null;
// how a label stands off its point (as build/board.ts LABEL_SHIFT)
const SHIFT: Record<string, string> = { r: 'translate(8px,-50%)', l: 'translate(calc(-100% - 8px),-50%)', b: 'translate(-50%,4px)', a: 'translate(-50%,calc(-100% - 4px))' };
function boardForm(): void {
  if (!boardBox) return;
  const k = form === 'desktop' ? 'bd' : 'bp';
  for (const svg of boardBox.querySelectorAll<SVGSVGElement>('svg.board')) svg.style.display = svg.classList.contains(k) ? '' : 'none';
  const svg = boardBox.querySelector<SVGSVGElement>('svg.' + k)!;
  if (BV?.svg === svg) return;
  const q = <T extends Element>(sel: string, el: ParentNode = svg) => el.querySelector<T>(sel)!;
  for (const e of svg.querySelectorAll('path')) if (!restD.has(e)) restD.set(e, e.getAttribute('d') ?? '');
  const tr = ['stand', 'coin', 'phone'].map((t): Trace => {
    const g = q<SVGGElement>('.t-' + t), sd = [...g.querySelectorAll<SVGPathElement>('.sd')];
    const co = q<SVGPathElement>('.co', g);
    return { co, gl: q('.gl', g), sd, pd: q('.pd', g), pu: q('.pu', g), fl: q('.fl', g), line: lineOf(restD.get(co)!), side: sd.map((e) => lineOf(restD.get(e)!)), f: -1 };
  });
  const dr = q<SVGPathElement>('.dr');
  BV = { svg, b1: q('.b1'), dm: q('.dm'), b4: [...svg.querySelectorAll<SVGElement>('g.b4:not(.nx)')], tr, dr, dp: q('.dp'), route: lineOf(restD.get(dr)!) };
  // the labels sit by share of the picture box, for this screen shape
  for (const e of $$('.blab', boardBox)) {
    const [x, y, side] = (e.dataset[form === 'desktop' ? 'd' : 'p'] ?? '0,0,r').split(',');
    e.style.left = x + '%'; e.style.top = y + '%'; e.style.transform = SHIFT[side] ?? '';
  }
  schedule();
}
function placeBoard(view: View, g: Box): void {
  if (!boardBox) return;
  const st = boardBox.style;
  Object.assign(st, { left: g.left + 'px', top: g.top + 'px', width: g.w + 'px', height: g.h + 'px' });
  st.setProperty('--bw', (g.w / pictures[view.passes[0]].size[0]).toFixed(4) + 'px');
}
/** the board hidden inside the three things */
function boardMask(url: string): void {
  if (!boardBox) return;
  for (const svg of boardBox.querySelectorAll<SVGSVGElement>('svg.board')) {
    const st = svg.style, img = `linear-gradient(#000, #000), url("${url}")`;
    st.setProperty('-webkit-mask-image', img); st.setProperty('mask-image', img);
    st.setProperty('-webkit-mask-size', '100% 100%'); st.setProperty('mask-size', '100% 100%');
    st.setProperty('-webkit-mask-repeat', 'no-repeat'); st.setProperty('mask-repeat', 'no-repeat');
    st.setProperty('-webkit-mask-composite', 'xor'); st.setProperty('mask-composite', 'exclude');
  }
}
function boardGone(): void { stopPulses(); BV = null; }

let pulseRaf = 0, pulsing = false;
function stopPulses(): void {
  cancelAnimationFrame(pulseRaf);
  pulseRaf = 0;
  if (pulsing && BV) for (const t of BV.tr) { setD(t.pu, ''); setO(t.fl, 0); }
  pulsing = false;
}
// a loop of 3.6 s: each pulse runs its trace in 1.5 s, the three 0.4 s apart; the pad flashes as it arrives
function pulseFrame(now: number): void {
  pulseRaf = requestAnimationFrame(pulseFrame);
  if (!BV) return;
  const sec = now / 1000;
  BV.tr.forEach((t, k) => {
    const L = lenOf(t.line), ph = ((((sec - 0.4 * k) % 3.6) + 3.6) % 3.6) / 1.5;
    setD(t.pu, ph <= 1 ? partD(t.line, ph * L - 46, ph * L) : '');
    const since = (ph - 1) * 1.5;
    setO(t.fl, ph < 1 ? 0 : since < 0.08 ? since / 0.08 : Math.max(0, 1 - (since - 0.08) / 0.5));
  });
}

function boardAt(y: number): void {
  const s = S[BRAIN - 1];
  if (!BV || !boardBox || !s.things?.ready || !tops.length) { if (boardBox) boardBox.style.visibility = 'hidden'; return; }
  boardBox.style.visibility = '';
  const i = BRAIN - 1, view = viewOf(BRAIN), rest = reduced();
  const pre = clamp((y - tops[i] + VH / 2) / (VH / 2)), u = (y - tops[i]) / Math.max(1, heights[i] - VH);
  const q = lightAt(view, clamp(u / LIGHT_SHARE), false);
  const step = rest ? [1, 1, 1, 1, 1, 1, 1] : [
    ramp(pre, 0.05, 0.25),                       // the chip and its label
    ramp(pre, 0.2, 0.7),                         // the stand's trace
    ramp(passStrength(view, q, 1), 0, 0.7),      // the race piece's, with the second pass
    ramp(passStrength(view, q, 2), 0, 0.7),      // the phone's, with the third
    ramp(u, 0.7, 0.78),                          // the net and the dimmed floor
    ramp(u, 0.78, 0.92),                         // the dashed trace to the empty place
    ramp(u, 0.92, 0.98),                         // its ring and NEXT
  ];
  setO(BV.b1, step[0]);
  const chip = $('.blab.chip', boardBox), next = $('.blab.next', boardBox);
  if (chip) setO(chip, step[0]);
  BV.tr.forEach((t, k) => {
    const f = step[1 + k];
    if (f === t.f) return;
    t.f = f;
    const L = lenOf(t.line), d = partD(t.line, 0, f * L);
    setD(t.co, d); setD(t.gl, d);
    t.sd.forEach((e, j) => setD(e, partD(t.side[j], 0, ramp(f, 0.3, 0.78) * lenOf(t.side[j]))));
    setO(t.pd, ramp(f, 0.96, 1));
    // the head of a trace being drawn is brighter
    if (!pulsing) setD(t.pu, f > 0 && f < 1 ? partD(t.line, f * L - 30, f * L) : '');
  });
  for (const g of BV.b4) setO(g, step[4]);
  // the darker floor lifts again over the scene's last stretch, so at the cut to the empty pool the light holds still
  setO(BV.dm, rest ? 1 : 1 - ramp(u, 1.02, 1.15));
  setD(BV.dr, partD(BV.route, 0, step[5] * lenOf(BV.route)));
  setO(BV.dp, step[6]);
  if (next) setO(next, step[6]);
  // pulses: at rest, while the scene is on screen, with motion allowed
  const want = !rest && active === BRAIN && step[3] >= 1 && document.visibilityState === 'visible';
  if (want && !pulsing) { pulsing = true; pulseRaf = requestAnimationFrame(pulseFrame); }
  else if (!want && pulsing) stopPulses();
}

/* ---------- scroll: which scene, how far through its light ---------- */
let tops: number[] = [], heights: number[] = [], active = 1;
function measure(): void {
  tops = sections.map((s) => s.offsetTop);
  heights = sections.map((s) => s.offsetHeight);
}
function progress(i: number, y: number): number {
  if (reduced()) return 1;
  return clamp((y - tops[i]) / (LIGHT_SHARE * (heights[i] - VH)));
}
/** A scene loads when it is within one screen of the view, and always the scene on screen. */
function near(i: number, y: number): boolean {
  return i + 1 === active || (tops[i] - (y + VH) < VH && y - (tops[i] + heights[i]) < VH);
}
function update(): void {
  ticking = false;
  if (!tops.length) return;
  checkInset();
  const y = scrollY, mid = y + VH / 2;
  let i = 0;
  while (i < sections.length - 1 && mid >= tops[i + 1]) i++;
  if (i + 1 !== active) {
    active = i + 1;
    sections.forEach((el, k) => el.classList.toggle('on', k === i));
  }
  for (let k = 0; k < sections.length; k++) {
    if (!S[k].built && near(k, y)) build(k + 1);
    else if (S[k].built && Math.abs(k + 1 - active) > 2 && !near(k, y)) release(k + 1);
    light(k + 1, progress(k, y));
  }
  boardAt(y);
  marks();
}

/* ---------- coming back after a reload: the same scene, the same light ---------- */
function remember(): void {
  if (!tops.length) return;
  const i = active - 1;
  try { history.replaceState({ ...(history.state ?? {}), film: { i, f: (scrollY - tops[i]) / heights[i] } }, ''); } catch { /* not allowed now */ }
}
function returnTo(): void {
  const at = (history.state as { film?: { i: number; f: number } } | null)?.film;
  if (!at || !(at.i >= 0 && at.i < S.length) || !Number.isFinite(at.f)) return;
  scrollTo(0, Math.round(tops[at.i] + clamp(at.f) * heights[at.i]));
}
let ticking = false;
function schedule(): void { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

/* ---------- the five marks, and a name beside its own mark ---------- */
const markEls = $$('.marks i');
const names = $$('.marks .nm');
// Scene 6: the system's mark is white from the start, and the stand's (the light starts on it); the disc's once
// pass 2 is half in, the phone's once pass 3 is half in. With less motion: all four.
function brainLit(): number[] {
  if (reduced()) return [0, 1, 2];
  const ps = S[BRAIN - 1].passes;
  const lit = (k: number) => (ps[k] ? ps[k].lit : 0);
  return [0, ...(lit(1) >= 0.5 ? [1] : []), ...(lit(2) >= 0.5 ? [2] : [])];
}
function marks(): void {
  const m = S[active - 1].mark;
  const lit = new Set([m, ...(active === BRAIN ? brainLit() : [])]);
  markEls.forEach((d, k) => d.classList.toggle('on', lit.has(k)));
  for (const nm of names) nm.hidden = Number(nm.dataset.mark) !== m || m >= markEls.length - 1;
}

/* ---------- size and shape changes ---------- */
function layoutAll(): void { for (let n = 1; n <= S.length; n++) if (S[n - 1].passes.length) place(S[n - 1], viewOf(n)); }
/** Some engines report the old steady height during a resize; look again once the layout has settled. */
let settle = 0;
function onResizeSoon(): void {
  onResize();
  requestAnimationFrame(onResize);
  clearTimeout(settle);
  settle = setTimeout(() => { layoutAll(); onResize(); }, 150);
}
function onResize(): void {
  const w = vwNow(), h = probe.offsetHeight || innerHeight, hs = Math.min(h, probeS.offsetHeight || h), f = formNow();
  // re-place only when the width, the steady heights or the screen shape change, never when a phone's bar slides
  if (f !== form) {
    form = f;
    VW = w; VH = h; SVH = hs;
    for (const s of S) if (s.built) { s.built = ''; build(S.indexOf(s) + 1); }
    boardForm();
  } else if (w !== VW || h !== VH || hs !== SVH) {
    VW = w; VH = h; SVH = hs;
    layoutAll();
    for (const s of S) if (s.built) build(S.indexOf(s) + 1);   // a bigger screen may want the bigger file
  }
  checkInset();
  measure();
  update();
}

/* ---------- go ---------- */
build(1);
measure();
// an address with #s1 to #s7 opens on that scene (the sections grew when the film switched on)
const target = /^#s([1-9])$/.exec(location.hash);
if (target && +target[1] <= S.length) scrollTo(0, tops[+target[1] - 1]);
else returnTo();
update();
let saveT = 0;
addEventListener('scroll', () => { schedule(); clearTimeout(saveT); saveT = setTimeout(remember, 200); }, { passive: true });
addEventListener('resize', onResizeSoon);
addEventListener('pagehide', remember);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') remember(); schedule(); });
reducedMQ.addEventListener('change', schedule);
portrait.addEventListener('change', onResizeSoon);
if (typeof ResizeObserver === 'function') {
  new ResizeObserver(() => onResize()).observe(probe);
  new ResizeObserver(() => onResize()).observe(probeS);
  new ResizeObserver(() => checkInset()).observe(probeB);
}
if (document.fonts) document.fonts.ready.then(() => { layoutAll(); measure(); update(); });
