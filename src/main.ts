// The film.
// One fixed stage per scene, each scene a stack of light passes of one fixed camera. One number, the playhead (the
// scroll position, eased a little for a mouse wheel), sets everything shown: how far the light has come, where each
// picture sits, the words, the change from one scene to the next (src/film/motion.ts). Nothing runs on a timer, so
// scrolling back plays it all in reverse. The border on top.
// Without this script the page stays a plain document (seven sections, each with its resting picture).
import './style.css';
import { startClock } from './clock';
import { scenes as SCENES, lightShare as LIGHT_SHARE, brainScene as BRAIN } from './film/scenes.json';
import pictureData from './generated/pictures.json';
import { clamp, cutMask, frameMask, lightAt, passStrength } from './film/math';
import { camera, dissolve, eased, lineIn, lineOut, lineTravel, smooth, ramp as rampOf, windowAt, WINDOW, type Lines } from './film/motion';
import { startDoors, type Doors } from './door';
import type { Pictures, PictureFile, View } from './types';
import type { Film3d, Hooks3 } from './world/film3d';

type Form = 'desktop' | 'phone';
interface Pass { key: string; img: HTMLImageElement; node: HTMLElement; ready: boolean; lit: number;
  /** scene 6: the box whose oval mask the pass shows through while its light grows (src/main.ts light) */
  lens: HTMLElement | null }
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
  /** the lines of words that leave and arrive one by one: at the top (the giant lines, the letterhead), then at the
   *  foot (the giant lines of scenes 1 and 7, the small line, its note, the tool and height lines), for one shape */
  lines: { form: Form; top: HTMLElement[]; foot: HTMLElement[] } | null;
  /** when its first picture was ready (a change into it never shows its black ground before its picture) */
  readyAt: number;
  /** what the camera moves: a box inside the pictures' box holding the light passes and the board, and a box around
   *  the giant words' box. The boxes with a mask (the pictures' soft sides, the matte cut) are never written to while
   *  the film moves: a browser draws a masked box again whenever its style is touched. */
  frame: HTMLElement | null; cam: HTMLElement | null;
}

/* ---------- writing styles: only when a value changes ---------- */
const written = new WeakMap<Element, Record<string, string>>();
function put(e: Element, prop: string, v: string): void {
  let w = written.get(e);
  if (!w) { w = {}; written.set(e, w); }
  if (w[prop] === v) return;
  w[prop] = v;
  (e as HTMLElement).style.setProperty(prop, v);
}
/** an opacity as written: '' for full (the style sheet's own value) */
const opv = (v: number): string => (v >= 0.999 ? '' : v <= 0.001 ? '0' : v.toFixed(3));
/** every element the motion has moved (a picture, the words, a door) */
const moved = new Set<HTMLElement>();
function move(e: HTMLElement, v: string): void { if (v) moved.add(e); put(e, 'transform', v); }
/** Runs fn with nothing moved: whatever it measures (the words, the giant lines, a picture's room) is where it rests.
 *  The moves are put back before anything is drawn. */
function still<T>(fn: () => T): T {
  const back: [HTMLElement, string][] = [];
  for (const e of moved) if (e.style.transform) { back.push([e, e.style.transform]); e.style.transform = ''; }
  try { return fn(); } finally { for (const [e, v] of back) e.style.transform = v; }
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
/** scene 6: the board's five labels, in a box of their own beside the pictures (the picture's soft side edges, a mask
 *  on .passes, never reach them); it follows the board's box in and out and takes the same place */
let labelBox: HTMLElement | null = null;
const stills = new Map<number, HTMLElement>();
// Each scene's description stays on its stage from the start (a screen reader hears it before the pictures load);
// the light passes themselves are decoration.
const alts = sections.map((s) => $<HTMLImageElement>('img', s)?.alt ?? '');
// What the page holds before the film touches it, so that giving up hands back exactly the plain page: every
// attribute the film writes (styles, classes, roles, labels, a hidden flag, a picture's own flags, the board's path
// data, a door's place) on every element of the film and the border, and each scene's resting picture. Attributes the
// film never writes are left as they are when it gives up (a translator or a reader's extension may have added some).
let gaveUp = false;
const FILM_ATTRS = ['style', 'class', 'role', 'aria-label', 'aria-hidden', 'alt', 'loading', 'hidden', 'd', 'src', 'data-spot', 'mask'];
const pristine = new Map<Element, [string, string][]>();
for (const e of document.querySelectorAll('#film, #film *, #top, #top *')) pristine.set(e, FILM_ATTRS.filter((n) => e.hasAttribute(n)).map((n) => [n, e.getAttribute(n) ?? '']));
const restPics = sections.map((s) => $('picture', s));
sections.forEach((s, i) => {
  const pic = i > 0 ? $('picture', s) : null;
  if (pic) { stills.set(i + 1, pic); pic.remove(); }
  // the board waits for its scene too (it goes back in with the scene's pictures)
  const bb = $('.bbox', s);
  if (bb) { boardBox = bb; bb.remove(); }
  const lb = $('.lbox', s);
  if (lb) { labelBox = lb; lb.remove(); }
  const box = $('.passes', s)!;
  box.setAttribute('role', 'img');
  box.setAttribute('aria-label', alts[i]);
});
// If anything below fails, the page goes back to the plain document, pictures and all, and the film stops for good:
// every entry point below returns at once once gaveUp is set. The visitor stays on the scene they were looking at.
function giveUp(): void {
  if (gaveUp) return;
  // the doors first: a hand-over under way puts the scene's picture back where it was
  try { doors?.giveUp(); } catch { /* not started */ }
  gaveUp = true;
  let on = 1;
  try { on = active; } catch { /* the film had not started its scroll work */ }
  try { stopPulses(); cancelAnimationFrame(pulseRaf); clearTimeout(settle); clearTimeout(saveT); clearTimeout(aheadT); } catch { /* not started */ }
  try { live3d?.dispose(); } catch { /* not started */ }
  try { for (const o of observers) o.disconnect(); } catch { /* not started */ }
  doc.classList.remove('film', 'film-init');
  doc.classList.add('nofilm');
  try { for (const s of S) if (s.cam?.isConnected && s.cut) s.cam.replaceWith(s.cut); } catch { /* not started */ }
  // each scene: its resting picture back as the only picture (the film's own pass pictures go), scene 6 its board in
  // the pictures' box and its labels just after it
  sections.forEach((s, i) => {
    const box = $('.passes', s);
    if (!box) return;
    const keep: Element[] = [];
    if (restPics[i]) keep.push(restPics[i]!);
    if (i === BRAIN - 1 && boardBox) keep.push(boardBox);
    box.replaceChildren(...keep);
    if (i === BRAIN - 1 && labelBox) box.after(labelBox);
  });
  // every attribute as the page had it (no inline style, class, role or hidden flag of the film's; the board's lines
  // whole)
  pristine.forEach((attrs, e) => {
    for (const n of FILM_ATTRS) if (e.hasAttribute(n) && !attrs.some(([a]) => a === n)) e.removeAttribute(n);
    for (const [n, v] of attrs) if (e.getAttribute(n) !== v) e.setAttribute(n, v);
  });
  for (const e of $$('body > .probe, body > .probe-b, body > .probe-s')) e.remove();
  // the plain page restores its own place on a reload, and its clock runs (even when the film failed before starting it)
  try { history.scrollRestoration = 'auto'; } catch { /* old browser */ }
  try { startClock(); } catch { /* no clock on this page */ }
  // the plain page is much shorter than the film: the scene that was on screen comes back on screen
  const back = sections[Math.max(0, Math.min(sections.length, on) - 1)];
  if (back) scrollTo(0, back.offsetTop);
}
addEventListener('error', giveUp, { once: true });
const first = $<HTMLImageElement>('#s1 img.pass');
let doors: Doors | null = null;
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
  lines: null,
  readyAt: 0,
  frame: null,
  cam: null,
}));
// the giant words' box goes into a box of its own that the camera moves (put back as it was if the film gives up)
for (const s of S) {
  if (!s.cut) continue;
  const c = document.createElement('div');
  c.className = 'cam';
  s.cut.replaceWith(c);
  c.append(s.cut);
  s.cam = c;
}
S[0].readyAt = -1e9;
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
/** Called on resize and when the safe area's probe changes size (or, without an observer, on scroll): when the
 *  bottom safe area grows past the largest seen, place the pictures again. */
function checkInset(): void {
  if (gaveUp) return;
  const b = probeB.offsetHeight;
  if (b > insetMax) { insetMax = b; layoutAll(); }
}
/** The scene's matte, when its view names one and the picture manifest holds it. */
const matteOf = (view: View): string | null => (view.matte && pictures[view.matte]?.matte ? view.matte : null);

const geometry = (view: View, s: SceneState): Box => still(() => geometryAtRest(view, s));
function geometryAtRest(view: View, s: SceneState): Box {
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
  if (gaveUp) return;
  const c = s.cut;
  if (!c) return;
  // a scene drawn live (build 12): the live things stand in front of the words themselves (src/world/film3d.ts)
  if (!g || !s.matte?.ready || live3d?.live(S.indexOf(s) + 1)) { c.removeAttribute('style'); return; }
  const px = (v: number) => v.toFixed(2) + 'px';
  const m = cutMask(s.matte.url, view.opens ? '' : frameMask(view, pictures[view.passes[0]].size), { left: px(g.left), top: px(g.top), w: px(g.w), h: px(g.h) });
  const st = c.style;
  st.setProperty('-webkit-mask-image', m.image); st.setProperty('mask-image', m.image);
  st.setProperty('-webkit-mask-size', m.size); st.setProperty('mask-size', m.size);
  st.setProperty('-webkit-mask-position', m.position); st.setProperty('mask-position', m.position);
  st.setProperty('-webkit-mask-repeat', m.repeat); st.setProperty('mask-repeat', m.repeat);
  st.setProperty('-webkit-mask-composite', m.webkitComposite); st.setProperty('mask-composite', m.composite);
}

/** scene 6: each lens is the box of its oval at full size (1.6 times the new pool of light), in its layer, its mask
 *  the oval filling it: [left, top, half width, half height, screen px per picture px, picture left, picture top] */
const lensAt = new WeakMap<HTMLElement, number[]>();
const lensOf = (p: Pass) => p.lens!;
function placeLens(lens: HTMLElement, img: HTMLImageElement, view: View, k: number, g: Box): void {
  const b = view.opens![k], kk = g.w / pictures[view.passes[0]].size[0];
  const RX = b[2] * 1.6 * kk, RY = b[3] * 1.6 * kk, lx = g.left + b[0] * kk - RX, ly = g.top + b[1] * kk - RY;
  lensAt.set(lens, [lx, ly, RX, RY, kk, g.left, g.top]);
  Object.assign(lens.style, { left: lx.toFixed(2) + 'px', top: ly.toFixed(2) + 'px', width: (2 * RX).toFixed(2) + 'px', height: (2 * RY).toFixed(2) + 'px' });
  // the picture in it, where it sits in the layer
  Object.assign(img.style, { left: (g.left - lx).toFixed(2) + 'px', top: (g.top - ly).toFixed(2) + 'px' });
  // the transforms of the moment were worked out for the old place: written again on the next frame
  written.delete(lens); written.delete(img);
  schedule();
}
function place(s: SceneState, view: View): void { still(() => placeAtRest(s, view)); }
function placeAtRest(s: SceneState, view: View): void {
  if (gaveUp) return;
  const g = geometry(view, s);
  const mask = frameMask(view, pictures[view.passes[0]].size);
  for (const p of s.passes) {
    Object.assign(p.img.style, { width: g.w + 'px', height: g.h + 'px', left: g.left + 'px', top: g.top + 'px', filter: view.filter ?? '' });
    if (!view.opens) { p.img.style.webkitMaskImage = mask; p.img.style.maskImage = mask; }
    if (p.lens) placeLens(p.lens, p.img, view, s.passes.indexOf(p), g);
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
  if (view.doors) doors?.place(S.indexOf(s) + 1, g);
}

/* ---------- building the light passes of one scene ---------- */
// the last scene may use the twin of scene 6 (a build time choice, written on the section)
const viewOf = (n: number): View => scenes[sections[n - 1].dataset.view === 'twin' ? `${n}twin` : String(n)][form];

function build(n: number): void {
  if (gaveUp) return;
  const s = S[n - 1], view = viewOf(n);
  const width = geometry(view, s).w;
  const files = view.passes.map((k) => fileFor(k, width));
  const want = form + '|' + files.map((f) => f.webp).join('|');
  if (s.built === want) return;
  s.built = want;
  warm.delete(n - 1);
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
    written.delete(img);
    img.style.opacity = k === 0 ? '1' : '0';
    // scene 6: each later pass grows from the old pool of light inside a lens (an oval mask moved by transforms)
    let lens: HTMLElement | null = null;
    if (view.opens && k > 0) {
      // the lens moves; the box inside it carries the oval (never written to while the light grows)
      lens = document.createElement('div'); lens.className = 'lens';
      const lm = document.createElement('div'); lm.className = 'lm';
      lm.append(node); lens.append(lm);
    }
    return { key, img, node, ready: false, lit: 0, lens };
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
  s.readyAt = firstReady ? -1e9 : 0;
  // the passes and the board in the box the camera moves
  const frame = document.createElement('div');
  frame.className = 'frame';
  frame.append(...s.passes.map((p) => p.lens ?? p.node), ...(s.things && boardBox ? [boardBox] : []));
  s.box.replaceChildren(frame);
  s.frame = frame;
  // the labels go in with the board, just after the pictures (as the page holds them)
  if (n === BRAIN && labelBox) {
    if (!(s.things && boardBox)) labelBox.remove();
    else if (labelBox.previousElementSibling !== s.box) s.box.after(labelBox);
  }
  if (n === BRAIN) boardForm();
  place(s, view);
  const mine = s.built;
  const shown = () => {
    if (gaveUp || s.built !== mine || !s.passes[0].ready || (s.matte && !s.matte.ready)) return;
    if (!s.box.classList.contains('ready')) s.readyAt = performance.now();
    s.box.classList.add('ready');
    place(s, view);
    schedule();
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
  if (gaveUp) return;
  const s = S[n - 1];
  s.built = '';
  // Firefox picks the fallback file of a picture it is about to drop and fetches it; with no src it fetches nothing
  for (const p of s.passes) p.img.removeAttribute('src');
  s.passes = [];
  s.matte = null;
  s.things = null;
  if (n === BRAIN) { boardGone(); labelBox?.remove(); }
  s.cut?.removeAttribute('style');
  s.box.replaceChildren();
  s.frame = null;
  s.box.classList.remove('ready');
  s.readyAt = 0;
  warm.delete(n - 1);
  if (n === 1) firstKept = false;
}

/* ---------- the light ---------- */
/** Pass k's shown strength when the light has come q of the way: eased at both ends of its step, resting exactly
 *  where the light arithmetic rests it; with less motion, the light arithmetic's own value. */
function shownStrength(view: View, q: number, k: number, rest: boolean): number {
  const t = passStrength(view, q, k);
  return rest ? t : eased(t, passStrength(view, lightAt(view, 1, false), k));
}
function light(n: number, prog: number): void {
  if (gaveUp) return;
  const s = S[n - 1], view = viewOf(n);
  if (!s.passes.length) return;
  const rest = reduced();
  const q = lightAt(view, prog, rest);
  s.passes.forEach((p, k) => {
    if (k === 0) return;
    const t = p.ready ? shownStrength(view, q, k, rest) : 0;
    p.lit = t;
    // a layer of its own only while its light grows (at rest, where a scene's light may rest part way, the picture
    // is drawn exactly as the page draws it)
    const grows = t > 0 && t < 1 && Math.abs(t - passStrength(view, lightAt(view, 1, rest), k)) > 0.001;
    put(p.img, 'will-change', grows ? (view.opens ? 'transform, opacity' : 'opacity') : '');
    if (!view.opens) { put(p.img, 'opacity', t.toFixed(3)); return; }
    // opens: the pass shows at full strength through an oval that grows from the old pool to 1.6 times the new one,
    // so the edge of the light travels. Off before it starts, no oval once it is done. The oval is the lens's mask,
    // drawn once at its full size (src/main.ts placeLens); the lens is scaled down to the oval of the moment and the
    // picture in it scaled back up, so it stays exactly in place: only transforms change from frame to frame.
    const lens = lensOf(p), o = lensAt.get(lens);
    if (o) {
      const a = view.opens[k - 1], b = view.opens[k], e = t * t * (3 - 2 * t), [lx, ly, RX, RY, kk, gl, gt] = o;
      const L = (u: number, v: number, g = 1) => u + (v * g - u) * e;
      const on = t > 0 && t < 1;
      // the oval of the moment: its half sizes and its top left corner, in the layer
      const rx = L(a[2], b[2], 1.6) * kk, ry = L(a[3], b[3], 1.6) * kk;
      const sx = on ? rx / RX : 1, sy = on ? ry / RY : 1;
      const tx = on ? gl + L(a[0], b[0]) * kk - rx - lx : 0, ty = on ? gt + L(a[1], b[1]) * kk - ry - ly : 0;
      // the picture scaled back, so it stays exactly where it is
      const ox = gl - lx, oy = gt - ly;
      put(lens, 'transform', on ? `translate(${tx.toFixed(2)}px,${ty.toFixed(2)}px) scale(${sx.toFixed(5)},${sy.toFixed(5)})` : '');
      put(p.img, 'transform', on ? `translate(${((ox - tx) / sx - ox).toFixed(2)}px,${((oy - ty) / sy - oy).toFixed(2)}px) scale(${(1 / sx).toFixed(5)},${(1 / sy).toFixed(5)})` : '');
      lens.classList.toggle('oval', on);
      put(lens, 'will-change', on ? 'transform' : '');
    }
    // the new pass comes in over the first eighth of its step, so the rim of the light does not tick when it starts
    put(p.img, 'opacity', t > 0 ? Math.min(1, t / 0.12).toFixed(3) : '0');
  });
  put($('.dim', s.layer)!, 'opacity', view.end === 'dark' ? (q * 0.75).toFixed(3) : '0');
  // a door's logo shows once the light rests (the last pass at full strength)
  if (view.doors) doors?.light(n, s.passes.length > 1 ? s.passes[s.passes.length - 1].lit : 1);
}

/* ---------- scene 6: the board on the floor ---------- */
// The page holds the board at rest (build/board.ts). The film draws it in as a pure function of the scroll, in steps
// tied to the light: the chip and the stand's trace as the scene comes in, the race piece's trace with the second
// pass, the phone's with the third, then the net and the place for the next one. At rest small pulses run the three
// live traces. With less motion: the rest state, no pulses.
type Pt = number[];
interface Line { pts: Pt[]; at: number[]; d: string }
interface Trace { co: SVGPathElement; gl: SVGPathElement; sd: SVGPathElement[]; pd: SVGPathElement; pu: SVGPathElement; fl: SVGPathElement; line: Line; side: Line[]; f: number;
  /** its thing's name tag (none when the venture has no name) */
  nm: HTMLElement | null }
interface BoardView { svg: SVGSVGElement; b1: SVGElement; b4: SVGElement[]; dm: SVGElement; arrive: number[]; tr: Trace[]; dr: SVGPathElement; dp: SVGPathElement; route: Line }
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
/** where a point sits along a line: the length up to its nearest point on it */
function alongOf(l: Line, p: Pt): number {
  let best = Infinity, at = 0;
  for (let i = 1; i < l.pts.length; i++) {
    const a = l.pts[i - 1], b = l.pts[i], dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1;
    const t = clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2), d = Math.hypot(a[0] + dx * t - p[0], a[1] + dy * t - p[1]);
    if (d < best) { best = d; at = l.at[i - 1] + t * Math.sqrt(L2); }
  }
  return at;
}
/** a side line drawn only as far as the main trace's head: up to the length whose end sits at most h along the main
 *  run (searched, since a mitred corner bends the relation) */
function sideD(s: Line, main: Line, h: number): string {
  const L = lenOf(s), at = (v: number) => alongOf(main, ptAt(s, v));
  if (at(L) <= h + 0.01) return partD(s, 0, L);
  if (at(0) > h) return '';
  let lo = 0, hi = L;
  for (let i = 0; i < 22; i++) { const m = (lo + hi) / 2; if (at(m) <= h) lo = m; else hi = m; }
  return partD(s, 0, lo);
}
/** the point at length v along a line */
function ptAt(l: Line, v: number): Pt {
  let i = 1;
  while (i < l.at.length - 1 && l.at[i] < v) i++;
  const t = clamp((v - l.at[i - 1]) / (l.at[i] - l.at[i - 1] || 1)), p = l.pts[i - 1], q = l.pts[i];
  return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
}
const setD = (e: SVGPathElement, d: string) => { if (e.getAttribute('d') !== d) e.setAttribute('d', d); };
const setO = (e: Element, o: number) => { const v = o >= 1 ? '' : o.toFixed(3); const st = (e as HTMLElement).style; if (st.opacity !== v) st.opacity = v; };
const ramp = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

let BV: BoardView | null = null;
// how a label stands off its point (as build/board.ts LABEL_SHIFT)
const SHIFT: Record<string, string> = { r: 'translate(8px,-50%)', l: 'translate(calc(-100% - 8px),-50%)', b: 'translate(-50%,4px)', a: 'translate(-50%,calc(-100% - 4px))', d: 'translate(0,4px)' };
function boardForm(): void {
  if (gaveUp) return;
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
    const line = lineOf(restD.get(co)!), side = sd.map((e) => lineOf(restD.get(e)!));
    return { co, gl: q('.gl', g), sd, pd: q('.pd', g), pu: q('.pu', g), fl: q('.fl', g), line, side, f: -1, nm: labelBox ? $('.blab.n-' + t, labelBox) : null };
  });
  const dr = q<SVGPathElement>('.dr');
  BV = { svg, b1: q('.b1'), dm: q('.dm'), arrive: (svg.dataset.arrive ?? '0.7,0.7').split(',').map(Number), b4: [...svg.querySelectorAll<SVGElement>('g.b4:not(.nx)')], tr, dr, dp: q('.dp'), route: lineOf(restD.get(dr)!) };
  // the labels sit by share of the picture box, for this screen shape
  if (labelBox) for (const e of $$('.blab', labelBox)) {
    const [x, y, side] = (e.dataset[form === 'desktop' ? 'd' : 'p'] ?? '0,0,r').split(',');
    e.style.left = x + '%'; e.style.top = y + '%'; e.style.transform = SHIFT[side] ?? '';
  }
  schedule();
}
/** where the labels' box sits in its layer (the camera moves it with the picture) */
let labelAt: [number, number] = [0, 0];
function placeBoard(view: View, g: Box): void {
  if (gaveUp) return;
  labelAt = [g.left, g.top];
  const bw = (g.w / pictures[view.passes[0]].size[0]).toFixed(4) + 'px';
  for (const b of [boardBox, labelBox]) {
    if (!b) continue;
    const st = b.style;
    Object.assign(st, { left: g.left + 'px', top: g.top + 'px', width: g.w + 'px', height: g.h + 'px' });
    st.setProperty('--bw', bw);
  }
}
/** the board hidden inside the three things */
function boardMask(url: string): void {
  if (gaveUp) return;
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
  if (gaveUp) return;
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
  if (gaveUp) return;
  const s = S[BRAIN - 1];
  if (!BV || !boardBox || !s.things?.ready || !tops.length) {
    if (boardBox) put(boardBox, 'visibility', 'hidden');
    if (labelBox) put(labelBox, 'visibility', 'hidden');
    return;
  }
  put(boardBox, 'visibility', '');
  if (labelBox) put(labelBox, 'visibility', '');
  const i = BRAIN - 1, view = viewOf(BRAIN), rest = reduced();
  const pre = clamp((y - tops[i] + VH / 2) / (VH / 2)), u = (y - tops[i]) / Math.max(1, heights[i] - VH);
  const q = lightAt(view, clamp(u / LIGHT_SHARE), false);
  const step = rest ? [1, 1, 1, 1, 1, 1, 1] : [
    ramp(pre, 0.05, 0.25),                       // the chip and its label
    ramp(pre, 0.2, 0.7),                         // the stand's trace
    // the race piece's with the second pass, the phone's with the third: each head lands on its pad where the light
    // has covered 70% of its thing (the strengths come from the build, which runs the film's own light arithmetic;
    // the shown strength, as the light passes show it)
    ramp(shownStrength(view, q, 1, false), 0, BV.arrive[0]),
    ramp(shownStrength(view, q, 2, false), 0, BV.arrive[1]),
    ramp(u, 0.7, 0.78),                          // the net and the dimmed floor
    ramp(u, 0.78, 0.92),                         // the dashed trace to the empty place
    ramp(u, 0.92, 0.98),                         // its ring and NEXT
  ];
  setO(BV.b1, step[0]);
  const chip = labelBox && $('.blab.chip', labelBox), next = labelBox && $('.blab.next', labelBox);
  if (chip) setO(chip, step[0]);
  BV.tr.forEach((t, k) => {
    const f = step[1 + k];
    if (f === t.f) return;
    t.f = f;
    const L = lenOf(t.line), d = partD(t.line, 0, f * L);
    setD(t.co, d); setD(t.gl, d);
    // the side lines never run ahead of the head
    t.sd.forEach((e, j) => setD(e, sideD(t.side[j], t.line, f * L)));
    // a name shows with its pad's outline, never before it
    const pad = ramp(f, 0.96, 1);
    setO(t.pd, pad);
    if (t.nm) setO(t.nm, pad);
    // the head of a trace being drawn is brighter
    if (!pulsing) setD(t.pu, f > 0 && f < 1 ? partD(t.line, f * L - 30, f * L) : '');
  });
  for (const g of BV.b4) setO(g, step[4]);
  // the darker floor lifts again over the scene's last stretch, before the change to the empty pool starts, so
  // through the change the light holds still
  setO(BV.dm, rest ? 1 : 1 - ramp(u, 1, 1.07));
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
/** Once the visitor scrolls, the scenes just before and after the one on screen load while the page is still (about
 *  0.3 s after the last scroll), so a change never waits for its pictures and the work of building them never lands
 *  in a scroll. (Not before the first scroll: the first load stays small.) */
let aheadT = 0;
/** the scenes next to the one on screen that have been painted unseen while the page was still (their stage stays
 *  on, at no strength, so a change into them never has to draw them first) */
const warm = new Set<number>();
function ahead(): void {
  clearTimeout(aheadT);
  aheadT = window.setTimeout(() => {
    if (gaveUp || frozen || !tops.length) return;
    for (const k of [active, active - 2]) {
      if (k < 0 || k >= S.length) continue;
      if (!S[k].built) { build(k + 1); schedule(); return ahead(); }
      // painted once its first picture is ready (asked again until it is)
      if (!warm.has(k)) { if (S[k].readyAt) { warm.add(k); schedule(); } else return ahead(); }
    }
  }, 300);
}

/* ---------- build 12: the whole film as one live 3D world (src/world/) ---------- */
// It loads at the visitor's first sign of intent (a touch, the wheel, a key, the pointer moving), never with the first
// screen, and only with motion allowed. Until a scene is live, and whenever the live film cannot run, the still film
// shows it; at rest the two are the same picture.
let live3d: Film3d | null = null, live3dTried = false, shownTop = 0, shownS = 1, lastScroll = -1e9;
let avif: boolean | null = null;
const pictureUrl = (key: string, n: number): string => {
  const f = fileFor(key, geometry(viewOf(n), S[n - 1]).w);
  if (avif === null) { const u = first?.currentSrc ?? ''; avif = u ? u.endsWith('.avif') : !!f.avif && document.createElement('canvas').toDataURL('image/avif').startsWith('data:image/avif'); }
  return avif && f.avif ? f.avif : f.webp;
};
/** the middle of the foot of a scene's door thing, at rest (screen px) */
function logoAnchor(n: number): [number, number] {
  const v = viewOf(n), d = v.doors ? Object.values(v.doors)[0] : null, g = S[n - 1].passes.length ? geometry(v, S[n - 1]) : null;
  if (!d || !g) return [0, 0];
  const k = g.w / pictures[v.passes[0]].size[0];
  return [g.left + ((d.thing[0] + d.thing[2]) / 2) * k, g.top + d.thing[3] * k];
}
function start3d(): void {
  if (live3dTried || gaveUp || reduced() || !tops.length) return;
  live3dTried = true;
  const hooks: Hooks3 = {
    form: () => form, vw: () => VW, vh: () => VH,
    tops: () => tops, heights: () => heights,
    lightShare: LIGHT_SHARE, count: S.length,
    view: (n) => viewOf(n),
    box: (n) => geometry(viewOf(n), S[n - 1]),
    strengths: (n, y) => {
      const v = viewOf(n), q = lightAt(v, progress(n - 1, y), false);
      return v.passes.map((_, k) => (k === 0 ? 1 : shownStrength3(v, q, k)));
    },
    els: (n) => ({ layer: S[n - 1].layer, box: S[n - 1].box, passes: S[n - 1].passes.map((p) => p.lens ?? p.node), shade: $('.shade', S[n - 1].layer), top: S[n - 1].top }),
    url: pictureUrl,
    active: () => active,
    schedule,
    put,
    changed: (n) => { if (S[n - 1].passes.length) place(S[n - 1], viewOf(n)); },
  };
  import('./world/film3d').then((m) => m.startFilm3d(hooks, () => { live3d = null; layoutAll(); schedule(); })).then((f) => {
    if (gaveUp) { f.dispose(); return; }
    live3d = f;
    still(() => f.relayout());
    schedule();
  }, () => { /* no WebGL 2 or no shapes: the still film */ });
}
const shownStrength3 = (v: View, q: number, k: number) => shownStrength(v, q, k, false);
for (const t of ['wheel', 'touchstart', 'keydown', 'pointerdown']) addEventListener(t, start3d, { passive: true, once: true });
addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') start3d(); }, { passive: true });

/* ---------- the playhead ---------- */
// The scroll position, followed closely: at once for a script, a key or a scroll bar; within about 40 ms for a finger
// (it smooths the uneven steps of a touch screen without letting go of the finger); within about 90 ms for a mouse
// wheel, which moves the page in steps. A jump of more than a screen and a half is followed at once.
let Y = scrollY, lastFrame = 0, lastWheel = -1e9, lastTouch = -1e9;
addEventListener('wheel', () => { lastWheel = performance.now(); }, { passive: true });
for (const t of ['touchstart', 'touchmove', 'touchend']) addEventListener(t, () => { lastTouch = performance.now(); }, { passive: true });
function playhead(now: number): number {
  const to = scrollY, dt = lastFrame ? Math.min(64, Math.max(0, now - lastFrame)) : 16;
  lastFrame = now;
  const tau = reduced() ? 0 : now - lastWheel < 450 ? 90 : now - lastTouch < 4000 ? 40 : 0;
  if (!tau || Math.abs(to - Y) > 1.5 * VH) Y = to;
  else {
    Y += (to - Y) * (1 - Math.exp(-dt / tau));
    if (Math.abs(to - Y) < 0.25) Y = to;
  }
  return Y;
}
/** The playhead takes the scroll position at once (a jump: a reload, an address, Back, a turned screen). */
const snap = () => { Y = scrollY; };

/* ---------- the motion: layers, pictures, words, doors (src/film/motion.ts) ---------- */
const lineGap = () => lineTravel(VH);
/** the lines of words of a scene that leave and arrive one by one, for the shape of screen now */
function linesOf(s: SceneState): { form: Form; top: HTMLElement[]; foot: HTMLElement[] } {
  if (s.lines?.form === form) return s.lines;
  if (s.lines) for (const e of [...s.lines.top, ...s.lines.foot]) { move(e, ''); put(e, 'opacity', ''); put(e, 'will-change', ''); }
  // a giant line is a .ln on a wide screen; upright, each .pl stands on its own line
  const each = (box: Element | null) => (box ? $$(form === 'phone' ? '.pl' : '.ln', box) : []);
  const top = each(s.top);
  const addr = $('.addr', s.layer);
  if (addr) top.push(addr);
  const foot: HTMLElement[] = [];
  if (s.words) for (const c of [...s.words.children] as HTMLElement[]) {
    if (c.classList.contains('door')) continue;
    if (c.classList.contains('big')) foot.push(...each(c)); else foot.push(c);
  }
  return (s.lines = { form, top, foot });
}
/** how far a scene's first picture has come in once it is ready (a picture that arrives late fades in over 0.28 s
 *  rather than appearing; normally it was ready long before) */
const readyK = (s: SceneState, now: number) => (s.readyAt ? clamp((now - s.readyAt) / 280) : 0);
/** the camera's move as a transform on an element whose top left corner sits at (x, y) in its layer: the picture's
 *  box and the giant words' box (both at 0, 0), the board's labels. Origin of the scale: the middle of the screen. */
const cam = (dy: number, k: number, x = 0, y = 0): string =>
  Math.abs(dy) < 0.01 && Math.abs(k - 1) < 0.00005 ? ''
    : `translate(${((k - 1) * (x - VW / 2)).toFixed(2)}px,${((k - 1) * (y - VH / 2) + dy).toFixed(2)}px) scale(${k.toFixed(5)})`;

/** Everything shown, from the playhead y. Returns true while a late picture is still fading in. */
function motion(y: number, now: number): boolean {
  const n = S.length, rest = reduced();
  let more = false;
  // each scene's strength over the one before it: 0 before the change into it, 1 after
  const wIn = S.map((_, k) => (k ? windowAt(y, tops[k], VH) : 1));
  // the scene arriving: the last one whose change has started (with less motion, the scene on screen); it comes in
  // over the one before it, held at full; every scene before those two is covered
  let top = 0;
  if (rest) top = active - 1;
  else for (let k = 1; k < n; k++) if (dissolve(wIn[k]) > 0) top = k;
  // a scene the live film can draw needs no picture of its own to come in
  const r = top && !rest ? (live3d?.ready(top + 1) ? 1 : readyK(S[top], now)) : 1;
  if (r > 0 && r < 1) more = true;
  const strength = top && !rest ? dissolve(wIn[top]) * r : 1;
  shownTop = top; shownS = strength;
  for (let k = 0; k < n; k++) {
    const s = S[k];
    const shown = (k === top && strength > 0) || (k === top - 1 && strength < 1);
    // a scene next to it stays laid out and painted, unseen (at no strength): once it was painted while the page was
    // still, or for half a screen before the change into it starts, so the first frame that shows it does not also
    // have to draw it
    const unseen = !shown && !rest && s.readyAt !== 0 && Math.abs(k + 1 - active) <= 1 && s.passes.length > 0
      && (warm.has(k) || (k === top + 1 && y > tops[k] - VH / 2 - (WINDOW / 2 + 0.5) * VH));
    put(s.layer, 'visibility', shown || unseen ? 'visible' : 'hidden');
    put(s.layer, 'opacity', !shown ? '0' : k === top ? opv(strength) : '');
    if (!shown && !unseen) continue;
    light(k + 1, progress(k, y));
    stage(k, y, wIn[k], k < n - 1 ? wIn[k + 1] : 0, rest, k === top ? strength : 1);
  }
  return more;
}

/** One scene on screen: its camera (the picture, its giant words at the top, the board's labels and its door move
 *  together), its lines of words, its door. */
function stage(k: number, y: number, wIn: number, wOut: number, rest: boolean, strength: number): void {
  const s = S[k], n = S.length;
  const twin = sections[k].dataset.view === 'twin', twinNext = k < n - 1 && sections[k + 1].dataset.view === 'twin';
  const h = heights[k] / VH, sr = LIGHT_SHARE * Math.max(0, h - 1);
  // within 3 px of its rest the scene is exactly at rest
  const at = Math.abs(y - tops[k] - sr * VH) < 3 ? sr : (y - tops[k]) / VH;
  const [dyS, sc] = rest ? [0, 1] : camera(at, sr, h, wIn, wOut, { first: k === 0, last: k === n - 1, stillIn: twin, stillOut: twinNext });
  const dy = dyS * VH;
  // a live scene: its picture is the live camera's; scene 6's board and labels follow the floor (src/world/film3d.ts)
  const live = live3d?.live(k + 1) ? live3d : null, bd = live && k === BRAIN - 1 ? live.board(k + 1) : null;
  if (s.frame) move(s.frame, live ? bd?.frame ?? '' : cam(dy, sc));
  if (s.cam) move(s.cam, cam(dy, sc));
  if (k === BRAIN - 1 && labelBox) {
    const t = live ? bd?.labels ?? '' : cam(dy, sc, labelAt[0], labelAt[1]);
    move(labelBox, t);
    labelBox.classList.toggle('moving', !!t);
  }
  // the lines of words: the scene leaving takes them away one by one (upwards, the way the page goes), the scene
  // arriving brings them in from below (src/film/motion.ts plans both scenes' lines together)
  const L = linesOf(s), all = [...L.top, ...L.foot], d = lineGap();
  const leaving = !rest && k < n - 1 && wOut > 0, arriving = !rest && k > 0 && wIn < 1;
  const plan = (o: SceneState, a: SceneState): Lines => {
    const lo = linesOf(o), la = linesOf(a);
    return { oTop: lo.top.length, oFoot: lo.foot.length, aTop: la.top.length, aFoot: la.foot.length };
  };
  const P = leaving ? plan(s, S[k + 1]) : arriving ? plan(S[k - 1], s) : null;
  for (let r = 0; r < all.length; r++) {
    const [o, tr] = !P ? [1, 0] : leaving ? lineOut(wOut, r, P) : lineIn(wIn, r, P, strength);
    move(all[r], Math.abs(tr * d) < 0.01 ? '' : `translate(0px,${(tr * d).toFixed(2)}px)`);
    put(all[r], 'opacity', opv(o));
    // a layer of its own only through a change
    put(all[r], 'will-change', P ? 'transform, opacity' : '');
  }
  // the door: it shows as the light comes to rest (rising the last few pixels), and leaves first, with the first line
  if (doors && s.passes.length) {
    const last = s.passes.length > 1 ? s.passes[s.passes.length - 1].lit : 1;
    const lit = rest ? 1 : smooth(rampOf(last, 0.6, 1));
    const [go, gt] = leaving && P ? lineOut(wOut, 0, { ...P, oTop: 1 }) : [1, 0];
    // a live scene's logo moves with the thing it stands by (the floor under it), else with the picture
    const lg = live ? live.logo(k + 1, logoAnchor(k + 1)) : null;
    doors.motion(k + 1, lit * go, lg ? lg[1] : dy, (1 - lit) * 10 + gt * d, lg ? lg[0] : 0);
  }
}

function update(now?: number): void {
  if (gaveUp) return;
  ticking = false;
  // a hand-over is under way: the scroll moves nothing until the scene is back
  if (!tops.length || frozen) return;
  // the bottom safe area: watched by its own observer where there is one, so no frame reads the layout
  if (typeof ResizeObserver !== 'function') checkInset();
  const y = playhead(now ?? performance.now()), mid = y + VH / 2;
  let i = 0;
  while (i < sections.length - 1 && mid >= tops[i + 1]) i++;
  if (i + 1 !== active) {
    active = i + 1;
    sections.forEach((el, k) => el.classList.toggle('on', k === i));
  }
  for (let k = 0; k < sections.length; k++) {
    if (!S[k].built && near(k, y)) build(k + 1);
    else if (S[k].built && Math.abs(k + 1 - active) > 2 && !near(k, y)) release(k + 1);
  }
  const t = now ?? performance.now();
  let more = motion(y, t);
  if (live3d && live3d.frame(y, shownTop, shownS, t, y !== scrollY || t - lastScroll < 150)) more = true;
  boardAt(y);
  marks();
  // the playhead still on its way, or a late picture fading in: the next frame
  if (more || y !== scrollY) schedule();
}

/* ---------- coming back after a reload: the same scene, the same light ---------- */
/** The scroll position of scene n with its light at rest (just past where the light completes). */
const restY = (n: number): number => tops[n - 1] + LIGHT_SHARE * Math.max(0, heights[n - 1] - VH) + 1;
/** While the visitor leaves through a door, the place saved is that scene at rest (or further on in it). */
let holdN: number | null = null;
function remember(): void {
  if (gaveUp) return;
  if (!tops.length) return;
  // the scene the scroll is in (the playhead may still be on its way to it)
  let i = 0;
  while (i < sections.length - 1 && scrollY + VH / 2 >= tops[i + 1]) i++;
  let f = (scrollY - tops[i]) / heights[i];
  if (holdN) {
    const j = holdN - 1, rest = (restY(holdN) - tops[j]) / heights[j];
    f = j === i ? Math.max(f, rest) : rest;
    i = j;
  }
  try { history.replaceState({ ...(history.state ?? {}), film: { i, f } }, ''); } catch { /* not allowed now */ }
}
/** Back to the saved place, if there is one. */
function returnTo(): boolean {
  const at = (history.state as { film?: { i: number; f: number } } | null)?.film;
  if (!at || !(at.i >= 0 && at.i < S.length) || !Number.isFinite(at.f)) return false;
  scrollTo(0, Math.round(tops[at.i] + clamp(at.f) * heights[at.i]));
  snap();
  return true;
}
let ticking = false, frozen = false;
function schedule(): void { if (gaveUp) return; if (!ticking) { ticking = true; requestAnimationFrame(update); } }

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
  if (gaveUp) return;
  const m = S[active - 1].mark;
  const lit = new Set([m, ...(active === BRAIN ? brainLit() : [])]);
  markEls.forEach((d, k) => d.classList.toggle('on', lit.has(k)));
  for (const nm of names) { const h = Number(nm.dataset.mark) !== m || m >= markEls.length - 1; if (nm.hidden !== h) nm.hidden = h; }
}

/* ---------- size and shape changes ---------- */
function layoutAll(): void {
  if (gaveUp) return;
  for (let n = 1; n <= S.length; n++) if (S[n - 1].passes.length) place(S[n - 1], viewOf(n));
  if (live3d) still(() => live3d!.relayout());
}
/** Some engines report the old steady height during a resize; look again once the layout has settled. */
let settle = 0;
function onResizeSoon(): void {
  if (gaveUp) return;
  onResize();
  requestAnimationFrame(onResize);
  clearTimeout(settle);
  settle = setTimeout(() => { layoutAll(); onResize(); }, 150);
}
function onResize(): void {
  if (gaveUp) return;
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
  const was = tops;
  measure();
  // the playhead jumps with the page only when the page itself changed size (not when a phone's bar slides)
  if (tops.some((t, i) => t !== was[i])) snap();
  update();
}

/* ---------- the doors to the products' own sites (src/door.ts) ---------- */
doors = startDoors({
  scene: (n) => ({ el: S[n - 1].el, layer: S[n - 1].layer, words: S[n - 1].words, top: S[n - 1].top }),
  view: (n) => viewOf(n),
  size: (n) => pictures[viewOf(n).passes[0]].size,
  picture: (n) => (S[n - 1].passes.length ? geometry(viewOf(n), S[n - 1]) : null),
  vh: () => VH,
  svh: () => SVH,
  active: () => active,
  reduced,
  gaveUp: () => gaveUp,
  hold: (n) => { holdN = n; if (n) remember(); },
  freeze: (on) => { frozen = on; if (!on) { measure(); snap(); schedule(); } },
  relayout: () => { onResize(); layoutAll(); },
});

/* ---------- go ---------- */
build(1);
measure();
// an address with #s1 to #s7 opens on that scene (the sections grew when the film switched on); else the place saved
// for this page (a reload, Back); else a door's hash (/#tapz) opens on its product's scene, its light at rest
const target = /^#s([1-9])$/.exec(location.hash);
if (target && +target[1] <= S.length) scrollTo(0, tops[+target[1] - 1]);
else if (!returnTo()) {
  const n = doors.hashScene(location.hash);
  if (n) scrollTo(0, Math.round(restY(n)));
}
snap();
update();
let saveT = 0;
// the observers of the steady screen sizes (let go when the film gives up)
const observers: ResizeObserver[] = [];
addEventListener('scroll', () => { lastScroll = performance.now(); schedule(); clearTimeout(saveT); saveT = setTimeout(remember, 200); ahead(); }, { passive: true });
addEventListener('resize', onResizeSoon);
addEventListener('pagehide', remember);
// Back from the back/forward cache: Safari brings the page back at the top, and with the film keeping its own place
// (scrollRestoration manual) it never scrolls down again. The saved place, before the first picture is drawn.
addEventListener('pageshow', (e) => {
  if (!e.persisted || gaveUp) return;
  const was = frozen;
  frozen = true; onResize(); frozen = was;   // the screen may have turned while away; nothing moves at the top
  if (returnTo()) update();
});
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') remember(); schedule(); });
reducedMQ.addEventListener('change', schedule);
portrait.addEventListener('change', onResizeSoon);
if (typeof ResizeObserver === 'function') {
  const a = new ResizeObserver(() => onResize()), b = new ResizeObserver(() => checkInset());
  a.observe(probe); a.observe(probeS); b.observe(probeB);
  observers.push(a, b);
}
if (document.fonts) document.fonts.ready.then(() => { layoutAll(); measure(); update(); });
