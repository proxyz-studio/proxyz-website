// The film.
// One fixed stage per scene, each scene a stack of light passes of one fixed camera. The scroll position sets how far
// the light has come. A cut with a short fade between scenes. The border on top.
// Without this script the page stays a plain document (seven sections, each with its resting picture).
import './style.css';
import { startClock } from './clock';
import { scenes as SCENES, lightShare as LIGHT_SHARE, brainScene as BRAIN } from './film/scenes.json';
import pictureData from './generated/pictures.json';
import { clamp, frameMask, lightAt, passStrength } from './film/math';
import type { Pictures, PictureFile, View } from './types';

type Form = 'desktop' | 'phone';
interface Pass { key: string; img: HTMLImageElement; node: HTMLElement; ready: boolean; lit: number }
interface SceneState { el: HTMLElement; layer: HTMLElement; box: HTMLElement; words: HTMLElement | null; mark: number; built: string; passes: Pass[] }

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
const stills = new Map<number, HTMLElement>();
// Each scene's description stays on its stage from the start (a screen reader hears it before the pictures load);
// the light passes themselves are decoration.
const alts = sections.map((s) => $<HTMLImageElement>('img', s)?.alt ?? '');
sections.forEach((s, i) => {
  const pic = i > 0 ? $('picture', s) : null;
  if (pic) { stills.set(i + 1, pic); pic.remove(); }
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
}, { once: true });
const first = $<HTMLImageElement>('#s1 img.pass');
let firstKept = true;   // the first paint picture is reused until a full rebuild for the other screen shape

const S: SceneState[] = sections.map((el) => ({
  el,
  layer: $('.layer', el)!,
  box: $('.passes', el)!,
  words: $('.words', el),
  mark: Number(el.dataset.mark ?? -1),
  built: '',
  passes: [],
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
let VW = innerWidth, VH = probe.offsetHeight || innerHeight, form: Form = formNow();

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
/** How far the words' low place stands above the bottom: the base from style.css (--words-base: 60 on phones upright,
 *  20 sideways, the desktop value on desktop), plus on phones the largest bottom safe area seen so far. */
function wordsBase(): number {
  const base = parseFloat(getComputedStyle(doc).getPropertyValue('--words-base')) || 0;
  return base + (deskMQ.matches ? 0 : insetMax);
}
/** Called on resize and on scroll: when the bottom safe area grows past the largest seen, place the pictures again. */
function checkInset(): void {
  const b = probeB.offsetHeight;
  if (b > insetMax) { insetMax = b; layoutAll(); }
}
function geometry(view: View, s: SceneState): Box {
  const [iw, ih] = pictures[view.passes[0]].size;
  const f = view.frame, vw = VW, vh = VH;
  const room = view.placeAs ? S[view.placeAs - 1] : s;   // the words box that sets the span
  let k = f.fit === 'width' ? vw / iw : f.fit === 'contain' ? Math.min(vw / iw, vh / ih) : Math.max(vw / iw, vh / ih);
  k *= f.zoom ?? 1;
  let w = iw * k, h = ih * k;
  let left = f.vx * vw - f.fx * w, topY = f.vy * vh - f.fy * h;
  if (f.fit === 'cover') { left = clamp(left, vw - w, 0); topY = clamp(topY, vh - h, 0); }
  // span: picture rows that must fit between the border strip and the words (short phone screens)
  if (f.span) {
    const roomTop = (top ? top.getBoundingClientRect().bottom : 0) + 12;
    // the room ends above the words at their LOW place (on a phone they ride a browser's sliding bar, so where they
    // are right now depends on the bar; the picture must not), so a scene built in either state gets the same box.
    // Worked out from the steady height, never read from the words' own place (their safe area part may glide).
    const roomBot = (room.words ? vh - wordsBase() - room.words.offsetHeight : vh) - 16;
    const [y0, y1] = f.span;
    if (roomBot > roomTop && (topY + y0 * k < roomTop || topY + y1 * k > roomBot)) {
      const k2 = Math.min(k, (roomBot - roomTop) / (y1 - y0));
      w = iw * k2; h = ih * k2;
      left = f.vx * vw - f.fx * w;
      topY = (roomTop + roomBot) / 2 - ((y0 + y1) / 2) * k2;
    }
  }
  return { left, top: topY, w, h };
}

function place(s: SceneState, view: View): void {
  const g = geometry(view, s);
  const mask = frameMask(view, pictures[view.passes[0]].size);
  for (const p of s.passes) {
    Object.assign(p.img.style, { width: g.w + 'px', height: g.h + 'px', left: g.left + 'px', top: g.top + 'px', filter: view.filter ?? '' });
    if (!view.opens) { p.img.style.webkitMaskImage = mask; p.img.style.maskImage = mask; }
  }
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
  const firstReady = !!keepFirst && keepFirst.complete && keepFirst.naturalWidth > 0;
  s.box.classList.toggle('ready', firstReady);
  s.box.replaceChildren(...s.passes.map((p) => p.node));
  place(s, view);
  for (const p of s.passes) {
    const mine = s.built;
    whenReady(p.img).then(() => {
      if (s.built !== mine) return;
      p.ready = true;
      if (p === s.passes[0]) s.box.classList.add('ready');
      schedule();
    });
  }
}

/** Lets go of a scene's pictures (a phone cannot hold every big picture of the film at once). */
function release(n: number): void {
  const s = S[n - 1];
  s.built = '';
  // Firefox picks the fallback file of a picture it is about to drop and fetches it; with no src it fetches nothing
  for (const p of s.passes) p.img.removeAttribute('src');
  s.passes = [];
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
  const w = innerWidth, h = probe.offsetHeight || innerHeight, f = formNow();
  // re-place only when the width, the steady height or the screen shape changes, never when a phone's bar slides
  if (f !== form) {
    form = f;
    VW = w; VH = h;
    for (const s of S) if (s.built) { s.built = ''; build(S.indexOf(s) + 1); }
  } else if (w !== VW || h !== VH) {
    VW = w; VH = h;
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
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') remember(); });
reducedMQ.addEventListener('change', schedule);
portrait.addEventListener('change', onResizeSoon);
if (typeof ResizeObserver === 'function') {
  new ResizeObserver(() => onResize()).observe(probe);
  new ResizeObserver(() => checkInset()).observe(probeB);
}
if (document.fonts) document.fonts.ready.then(() => { layoutAll(); measure(); update(); });
