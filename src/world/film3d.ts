// Build 12: the live 3D film, as the film (src/main.ts) drives it.
//
// It starts at the visitor's first sign of intent (src/main.ts), loads the shapes, and reads each scene's stills into
// the graphics chip in the order the film needs them (the scene on screen, then the next, then the one before). A scene
// is live once its stills are in; until then the still film shows it, and since a live scene at rest is its still, the
// change from one to the other cannot be seen.
//
// The live picture is one canvas. It sits in the page as a scene's own picture would: inside the pictures' box of the
// lowest scene on screen that is live (so the page's own dark band at the foot, the board of scene 6 and the giant
// words all stay above it, as above a still). A live scene above it is see-through but for its words, board and dark
// band; a scene that is not live yet covers it as the still film always did. The things that stand in front of the
// giant words are copied into a second, small canvas above the words.
//
// Fallbacks: no WebGL 2, a context lost and not given back, or frames that stay slow even at the lowest sharpness:
// the still film, for good (or until the context comes back). Less motion: never started.
import type { View } from '../types';
import { World, layoutOf, type CamState, type Form, type FrameState, type Layout, type SlotState } from './world';
import { at, camOf, keyOf, keysOf, type Key, type Shape } from './path';
import { cssHomography, homography, type V3 } from './mat';

export interface Box { left: number; top: number; w: number; h: number }
export interface SceneEls { layer: HTMLElement; box: HTMLElement; passes: HTMLElement[]; shade: HTMLElement | null; top: HTMLElement | null }
export interface Hooks3 {
  form(): Form; vw(): number; vh(): number;
  tops(): number[]; heights(): number[];
  lightShare: number;
  count: number;
  view(n: number): View;
  /** scene n's picture box at rest (CSS px, in its layer, which starts at the window's top left) */
  box(n: number): Box | null;
  /** the shown strength of each light pass of scene n at playhead y (pass 1 always 1) */
  strengths(n: number, y: number): number[];
  els(n: number): SceneEls;
  url(key: string, n: number): string;
  active(): number;
  schedule(): void;
  put(e: Element, prop: string, v: string): void;
  /** liveness of a scene changed (the film re-places it: the giant words' matte cut goes or comes back) */
  changed(n: number): void;
}

const DEG = Math.PI / 180;
/** the scene of the board (it shares its camera with the last scene) */
const BRAIN = 6;
/** how each move between two rests is shaped (scene i+1 to i+2) */
const SHAPES: Shape[] = [
  { leave: 0.3, settle: 0.5, ease: 0.03 },                               // 1 to 2: the pull back from the letters to the whole stand
  { leave: 0.3, settle: 0.5, ease: 0.03, via: { out: 1.25, lift: 4 } },  // 2 to 3: back a little, across to the race piece
  { leave: 0.3, settle: 0.5, ease: 0.03, via: { out: 1.1, lift: 6 } },   // 3 to 4: over to the coin and down along it
  { leave: 0.3, settle: 0.5, ease: 0.03, via: { out: 1.3, lift: 8 } },   // 4 to 5: up off the coin, over to the phone
  { leave: 0.3, settle: 1.55, ease: 0.025 },                             // 5 to 6: the pull back lands early, the light then opens
  { leave: 0, settle: 0, ease: 0 },                                      // 6 to 7: one camera
];

export interface Film3d {
  /** one frame: the scenes on screen (top: 0-based index of the scene arriving, s: its strength over the one before) */
  frame(y: number, top: number, s: number, now: number, moving: boolean): boolean;
  live(n: number): boolean;
  /** scene n's stills are in the chip: it can be drawn live */
  ready(n: number): boolean;
  /** the transform of scene 6's board (its frame) and labels while live, or null */
  board(n: number): { frame: string; labels: string } | null;
  /** how far a door's logo moves with the live picture: [dx, dy] px */
  logo(n: number, anchor: [number, number]): [number, number] | null;
  relayout(): void;
  dispose(): void;
}

export async function startFilm3d(h: Hooks3, onGone: () => void): Promise<Film3d> {
  const phoneChip = matchMedia('(pointer: coarse)').matches;
  let world: World | null = null;
  let gone = false;
  const events = {
    lost: () => { lostAt = performance.now(); unlive(); h.schedule(); },
    restored: () => { lostAt = 0; layoutKey = ''; h.schedule(); },
  };
  let lostAt = 0;
  world = await World.create(events, phoneChip ? 150e6 : 260e6);
  world.onDecoded = () => h.schedule();
  let canvas = world.canvas;
  // the copy of the things in front of the giant words
  const fg = document.createElement('canvas');
  fg.className = 'world-fg';
  fg.setAttribute('aria-hidden', 'true');
  const fgCtx = fg.getContext('2d');
  document.getElementById('film')?.after(fg);

  /* ---------- the world of this screen shape, and the camera path ---------- */
  let L: Layout | null = null, layoutKey = '', keys: Key[] = [], rests: number[][] = [], restBox: (Box | null)[] = [];
  const passesOf = (n: number) => h.view(n).passes;
  function relayout(): void {
    if (!world) return;
    const form = h.form(), vw = h.vw(), vh = h.vh(), tops = h.tops(), hs = h.heights();
    const k = [form, vw, vh, ...tops].join('|');
    if (k === layoutKey && L) return;
    layoutKey = k;
    const passes: Record<number, string[]> = {};
    for (let n = 1; n <= h.count; n++) passes[n] = passesOf(n);
    L = layoutOf(form, passes);
    world.setLayout(L);
    restBox = [];
    const R: { y: number; v: number[] }[] = [];
    for (let n = 1; n <= h.count; n++) {
      const g = h.box(n), p = L.projectors.get(passes[n][0])!;
      restBox.push(g);
      const b = g ?? { left: 0, top: 0, w: vw, h: vw * (p.h / p.w) };
      const v = keyOf(p.eye, p.target, p.fpx * (b.h / p.h), b.left + b.w * (p.ppx / p.w), b.top + b.h * (p.ppy / p.h));
      R.push({ y: tops[n - 1] + h.lightShare * Math.max(0, hs[n - 1] - vh), v });
    }
    rests = R.map((r) => r.v);
    const end = tops[h.count - 1] + hs[h.count - 1];
    keys = keysOf(R, SHAPES, vh, { y: 0, v: R[0].v }, { y: end, v: R[R.length - 1].v });
    drawn = '';
  }

  /* ---------- which scenes are live ---------- */
  const ready = new Set<number>();
  const isReady = (n: number) => !!world && !world.lost && !!L && passesOf(n).every((k) => world!.has(k));
  let host: number | null = null;
  const liveNow = new Set<number>();
  function setLive(n: number, on: boolean): void {
    const e = h.els(n);
    // a scene's pictures may be built again (a bigger file, a turned screen): hidden on every frame it is live
    for (const p of e.passes) h.put(p, 'visibility', on ? 'hidden' : '');
    if (liveNow.has(n) === on) return;
    if (on) liveNow.add(n); else liveNow.delete(n);
    e.box.classList.toggle('live', on);
    h.put(e.layer, 'background', on ? 'transparent' : '');
    if (!on && e.shade) h.put(e.shade, 'opacity', '');
    h.changed(n);
  }
  function unlive(): void {
    for (const n of [...liveNow]) setLive(n, false);
    canvas.remove();
    host = null;
    fg.style.visibility = 'hidden';
  }

  /* ---------- the governor: sharpness from the measured frame times ---------- */
  const DPR = Math.max(1, devicePixelRatio || 1);
  const steps = [Math.min(2, DPR), 1.5, 1.25, 1].filter((v, i, a) => v <= DPR && a.indexOf(v) === i);
  let step = 0, slow = 0;
  const times: number[] = [];
  let lastDraw = 0;
  function measure(now: number): void {
    if (lastDraw && now - lastDraw < 200) times.push(now - lastDraw);
    lastDraw = now;
    if (times.length < 24) return;
    const sorted = [...times].sort((a, b) => a - b), p75 = sorted[Math.floor(sorted.length * 0.75)];
    times.length = 0;
    if (p75 > 34) {
      if (step < steps.length - 1) step++;
      else if (++slow >= 2) giveUp();
    } else slow = 0;
  }
  function giveUp(): void {
    if (gone) return;
    gone = true;
    unlive();
    fg.remove();
    world?.dispose();
    world = null;
    onGone();
  }

  /* ---------- what to read into the chip next ---------- */
  function wanted(active: number): string[] {
    const order = [active, active + 1, active - 1, active + 2].filter((n) => n >= 1 && n <= h.count);
    const out: string[] = [];
    for (const n of order) for (const k of passesOf(n)) if (!out.includes(k)) out.push(k);
    return out;
  }

  /* ---------- one frame ---------- */
  let drawn = '', settled = 0;
  function frame(y: number, top: number, s: number, now: number, moving: boolean): boolean {
    if (gone || !world) return false;
    if (world.lost) {
      // a context lost and not given back within two seconds: a fresh one
      if (lostAt && now - lostAt > 2000 && document.visibilityState === 'visible') {
        lostAt = 0;
        const old = world;
        World.create(events, old.budget).then((w) => { world = w; w.onDecoded = () => h.schedule(); layoutKey = ''; old.dispose(); swap(w.canvas); h.schedule(); }, giveUp);
      }
      return false;
    }
    relayout();
    if (!L) return false;
    const active = h.active();
    const want = wanted(active);
    world.want(want.map((k) => ({ key: k, url: h.url(k, Number(/^s(\d)/.exec(k)?.[1] ?? active)) })));
    // one picture into the chip a frame, and only while the page is still or the scene needs it now
    const need = [top + 1, top, top + 2].filter((n) => n >= 1 && n <= h.count && !isReady(n));
    const more = world.pending() > 0;
    if (world.pending() && (!moving || need.length)) world.upload(1, new Set(want));
    for (let n = 1; n <= h.count; n++) if (isReady(n)) ready.add(n); else ready.delete(n);

    // the scenes the page shows (its layers: the words, and the still film where a scene is not live yet)
    const shown: { n: number; W: number }[] = [];
    if (top > 0 && s < 1) shown.push({ n: top, W: 1 - s });
    shown.push({ n: top + 1, W: top > 0 ? s : 1 });
    const live = shown.filter((x) => ready.has(x.n));
    // the stills the live picture is drawn from: by where the camera is, each still strongest while the camera is near
    // its own (scenes 6 and 7 share one camera: there the page's own change, the pool holding still)
    const camV = at(keys, y), u = Math.max(0, Math.min(h.count - 1, camV[9])), a = Math.min(h.count - 1, Math.floor(u)), e = u - a;
    let pair: { n: number; W: number }[];
    if (a + 1 === BRAIN && a + 2 <= h.count) pair = shown.some((x) => x.n === a + 2) ? shown : [{ n: a + 1, W: 1 }];
    else {
      const w = e <= 0.3 ? 0 : e >= 0.7 ? 1 : ((e - 0.3) / 0.4) ** 2 * (3 - 2 * (e - 0.3) / 0.4);
      pair = [{ n: a + 1, W: 1 - w }, { n: a + 2, W: w }].filter((x) => x.W > 0.0005 && x.n <= h.count);
    }
    const drawable = pair.filter((x) => ready.has(x.n));
    let slots: SlotState[] = [];
    if (live.length && drawable.length) {
      const sum = drawable.reduce((t, x) => t + x.W, 0);
      slots = drawable.map((x) => slotOf(x.n, x.W / sum, y));
    }
    // a scene arriving over a still one: only its own light, faded in by its page layer
    if (live.length === 1 && shown.length === 2 && live[0].n === top + 1) slots = [slotOf(top + 1, 1, y)];
    else if (live.length === 1 && shown.length === 2) slots = [slotOf(live[0].n, 1, y)];
    const newHost = live.length ? live[0].n : null;
    for (let n = 1; n <= h.count; n++) setLive(n, live.some((x) => x.n === n));
    if (newHost !== host) {
      host = newHost;
      if (host) { const b = h.els(host).box; if (canvas.parentElement !== b) b.prepend(canvas); }
      else canvas.remove();
    }
    if (!host || !slots.length) { fg.style.visibility = 'hidden'; return more; }
    // the host's dark band gives way to the one of a live scene arriving over it (each scene's own band, mixed)
    for (const x of shown) {
      const sh = h.els(x.n).shade;
      if (sh) h.put(sh, 'opacity', x.n === host && live.length === 2 && shown.length === 2 ? (1 - s).toFixed(3) : '');
    }
    const cam = camOf(camV);
    const lift = liftOf(y);
    if (!moving) settled = settled || now; else settled = 0;
    const pr = settled && now - settled > 120 ? Math.min(DPR, 3) : steps[step];
    const fgBox = fgRect(cam, slots, lift);
    const st: FrameState = { vw: h.vw(), vh: h.vh(), pr, cam, slots, lift, fg: fgBox };
    const sig = JSON.stringify([st, liveNow.size]);
    if (sig === drawn) return more;
    canvas.style.width = st.vw + 'px'; canvas.style.height = st.vh + 'px';
    const t0 = performance.now();
    const ok = world.draw(st, fgBox ? fgCtx : null);
    if (!ok) return more;
    drawn = sig;
    if (moving) measure(t0);
    // the copy of the things in front of the giant words: as strong as the live picture under it
    if (fgBox) {
      const sx = Math.max(0, Math.floor(fgBox[0] * pr)) / pr, sy = Math.max(0, Math.floor(fgBox[1] * pr)) / pr;
      Object.assign(fg.style, { left: sx + 'px', top: sy + 'px', width: fg.width / pr + 'px', height: fg.height / pr + 'px', visibility: '' });
      fg.style.opacity = live.length === 1 && shown.length === 2 && live[0].n === top + 1 ? s.toFixed(3) : '';
    } else fg.style.visibility = 'hidden';
    return more || !settled || now - settled < 200;
  }
  function swap(c: HTMLCanvasElement): void {
    canvas.remove();
    canvas = c;
    host = null;
    for (const n of [...liveNow]) setLive(n, false);
  }

  function slotOf(n: number, W: number, y: number): SlotState {
    const v = h.view(n), t = h.strengths(n, y);
    return {
      scene: n, W,
      sat: /saturate\(([\d.]+)\)/.test(v.filter ?? '') ? Number(/saturate\(([\d.]+)\)/.exec(v.filter!)![1]) : 1,
      fade: v.frame.fade ? (v.frame.fade as [number, number, number, number]) : null,
      passes: v.passes.map((key, k) => {
        const tk = k === 0 ? 1 : t[k] ?? 0;
        if (!v.opens || k === 0) return { key, t: tk, oval: null };
        // scene 6: the later pass shows inside an oval growing from the old pool of light (as src/main.ts light)
        if (tk <= 0 || tk >= 1) return { key, t: tk >= 1 ? 1 : 0, oval: null };
        const a = v.opens[k - 1], b = v.opens[k], e = tk * tk * (3 - 2 * tk);
        const Lr = (u: number, w: number, g = 1) => u + (w * g - u) * e;
        return { key, t: Math.min(1, tk / 0.12), oval: [Lr(a[0], b[0]), Lr(a[1], b[1]), Lr(a[2], b[2], 1.6), Lr(a[3], b[3], 1.6)] as [number, number, number, number] };
      }),
    };
  }
  /** scene 2's phone: on the tile while the second light comes in, lifted as the third does (with that light) */
  function liftOf(y: number): number {
    const t = h.strengths(2, y)[2] ?? 0;
    return t * t * (3 - 2 * t);
  }

  /** the box of the things in front of the giant words of the scenes on screen, where it meets those words */
  function fgRect(cam: CamState, slots: SlotState[], lift: number): [number, number, number, number] | null {
    if (!world || !L) return null;
    const vw = h.vw(), vh = h.vh();
    let wx0 = Infinity, wy0 = Infinity, wx1 = -Infinity, wy1 = -Infinity;
    for (const sl of slots) {
      const t = h.els(sl.scene).top;
      if (!t || !h.view(sl.scene).matte) continue;
      const r = wordsBox.get(sl.scene);
      if (!r) continue;
      wx0 = Math.min(wx0, r[0] - 48); wy0 = Math.min(wy0, r[1] - 48); wx1 = Math.max(wx1, r[2] + 48); wy1 = Math.max(wy1, r[3] + 48);
    }
    if (!(wx1 > wx0)) return null;
    // the things' box on screen: the corners of their boxes in the world
    const st = { vw, vh, cam };
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const scenes = new Set(slots.map((s) => s.scene));
    for (const [name, box] of BOUNDS) {
      if (!FG[name].some((n) => scenes.has(n))) continue;
      const M = world.thingPose(name, lift);
      for (let c = 0; c < 8; c++) {
        const p: V3 = [c & 1 ? box[3] : box[0], c & 2 ? box[4] : box[1], c & 4 ? box[5] : box[2]];
        const w = [M[0] * p[0] + M[4] * p[1] + M[8] * p[2] + M[12], M[1] * p[0] + M[5] * p[1] + M[9] * p[2] + M[13], M[2] * p[0] + M[6] * p[1] + M[10] * p[2] + M[14]] as V3;
        const q = world.project(st, w);
        if (!q) return [Math.max(0, wx0), Math.max(0, wy0), Math.min(vw, wx1) - Math.max(0, wx0), Math.min(vh, wy1) - Math.max(0, wy0)];
        x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]);
      }
    }
    const ax = Math.max(0, wx0, x0 - 2), ay = Math.max(0, wy0, y0 - 2), bx = Math.min(vw, wx1, x1 + 2), by = Math.min(vh, wy1, y1 + 2);
    return bx > ax && by > ay ? [ax, ay, bx - ax, by - ay] : null;
  }
  const wordsBox = new Map<number, [number, number, number, number]>();

  /* ---------- scene 6's board and a door's logo, moved with the live camera ---------- */
  function floorMap(n: number): number[] | null {
    if (!world || !L || !liveNow.has(n) || !keys.length) return null;
    const g = restBox[n - 1];
    if (!g) return null;
    const y = lastY;
    const now = camOf(at(keys, y)), rest = camOf(rests[n - 1]);
    const st = { vw: h.vw(), vh: h.vh() };
    const pts: V3[] = [[-300, 0, -300], [300, 0, -300], [300, 0, 300], [-300, 0, 300]];
    const a = pts.map((p) => world!.project({ ...st, cam: rest }, p)), b = pts.map((p) => world!.project({ ...st, cam: now }, p));
    if (a.some((p) => !p) || b.some((p) => !p)) return null;
    return homography(a as number[][], b as number[][]);
  }
  let lastY = 0;

  return {
    frame(y, top, s, now, moving) { lastY = y; return frame(y, top, s, now, moving); },
    live: (n) => liveNow.has(n),
    ready: (n) => ready.has(n) && !gone,
    board(n) {
      const H = floorMap(n);
      if (!H) return null;
      const g = restBox[n - 1]!;
      const still = H.every((v, i) => Math.abs(v - [1, 0, 0, 0, 1, 0, 0, 0, 1][i]) < (i === 2 || i === 5 ? 0.05 : 2e-5));
      if (still) return { frame: '', labels: '' };
      // the labels' box has its own corner: the same mapping, seen from there
      const T = (x: number, yy: number) => [1, 0, x, 0, 1, yy, 0, 0, 1];
      const m3 = (A: number[], B: number[]) => [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => A[r * 3] * B[c] + A[r * 3 + 1] * B[3 + c] + A[r * 3 + 2] * B[6 + c]));
      return { frame: cssHomography(H), labels: cssHomography(m3(T(-g.left, -g.top), m3(H, T(g.left, g.top)))) };
    },
    logo(n, anchor) {
      const H = floorMap(n);
      if (!H) return null;
      const [x, y] = anchor, w = H[6] * x + H[7] * y + H[8];
      return [(H[0] * x + H[1] * y + H[2]) / w - x, (H[3] * x + H[4] * y + H[5]) / w - y];
    },
    relayout() {
      layoutKey = '';
      for (let n = 1; n <= h.count; n++) {
        const t = h.els(n).top;
        if (!t) continue;
        const r = t.getBoundingClientRect();
        if (r.width) wordsBox.set(n, [r.left, r.top, r.right, r.bottom]);
      }
      h.schedule();
    },
    dispose() { giveUp(); },
  };
}

/** each thing's box in its own frame (mm), for the copy above the giant words */
const BOUNDS: [Parameters<World['thingPose']>[0], number[]][] = [
  ['stand', [-74, 0, -28, 74, 120, 30]],
  ['menu', [-36, -4, -75, 36, 4, 75]],
  ['trophy', [-88, 0, -88, 88, 70, 88]],
  ['coin', [-65, 0, -65, 65, 20, 65]],
  ['coach', [-36, -4, -75, 36, 4, 75]],
];
const FG: Record<string, number[]> = { stand: [2, 6], menu: [2], trophy: [3], coin: [6], coach: [5, 6] };
void DEG;
