// Build 12: the whole film as one live 3D world (WebGL 2, no library).
//
// One world per screen shape. The things stand where scene 6's still puts them (the stand, the race coin, the coach
// phone); scenes 1 and 2 are close visits to the stand, scene 4 to the coin, scene 5 to the phone, and scene 6 pulls back
// to show the three on one floor. Scene 3's race piece on its base stands on its own spot, and scene 2's phone, the one
// that taps the tile, is there only in scene 2.
//
// Every surface is drawn from the stills themselves (src/world/shaders.ts): each still is cast back onto the shapes
// from the camera that drew it. At a scene's rest the film's camera is exactly that camera, so the frame is the still,
// whatever the shapes; while the camera moves the shapes give the picture its depth. The pictures are the very files
// the still film shows (the same address, so the browser's cache serves them), read once into the graphics chip.
//
// This module draws; src/world/film3d.ts decides what to draw from the playhead.
import { DEPTH_FS, DEPTH_VS, PASSES, SLOTS, UNITS, WORLD_FS, WORLD_VS } from './shaders';
import { DEG, eulerYXZ, floorPose, frustum, ident, lookAt, mul, mulAll, point, rotX, rotY, rotZ, translate, type M4, type V3 } from './mat';
import shotsData from './shots.json';
import worldUrl from './world.bin?url';

export type Form = 'desktop' | 'phone';
interface Cam { az: number; el: number; dist: number; look: V3; fov: number; sx: number; sy: number; w: number; h: number }
interface Light { kind: 'spot' | 'panel'; pos: V3; aim: V3; cone?: number; pen?: number; int: number;
  /** build 12E: a black card in the light's path (centre and two half sides, mm in the still's room) */
  flag?: { c: V3; u: V3; v: V3 } }
interface Shot { obj: string; cam: Cam; light: Light; phone?: { pos?: V3; rot?: V3; floor?: V3 } | null; trio?: number[];
  /** the other things of the one room the still holds, where they stand in its own room (build 12D) */
  extra?: { name: 'stand' | 'coin' | 'coach'; x: number; z: number; turn: number }[] }
const SHOTS = (shotsData as unknown as { pictures: Record<string, Shot> }).pictures;

const dirFrom = (az: number, el: number): V3 => [Math.sin(az * DEG) * Math.cos(el * DEG), Math.sin(el * DEG), Math.cos(az * DEG) * Math.cos(el * DEG)];
const add = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];

/** where scene 3's race piece stands in the world, per shape: x, z, turn. Build 12D: to the right of the stand, outside
 *  every other still's frame (scenes 1, 2, 4, 5 and 6 never see it), and scene 3's own frame holds nothing else; turned
 *  so scene 3's camera stands about where scene 2's stands (2 to 3 is a pan) */
const TROPHY: Record<Form, [number, number, number]> = { desktop: [500, -50, -30], phone: [300, -100, -30] };
/** the coin on the trophy's base (ptRound5.ts coinOnPlinth): its bottom centre up 38.85 mm, turned 22 degrees about x */
const COIN_ON_BASE = mul(translate(0, 14 + 65 * Math.sin(22 * DEG) + 0.5, 0), rotX(22 * DEG));
const PHONE_T = 8;

/* ---------- what is drawn ---------- */
export interface CamState {
  eye: V3; target: V3;
  /** the lens: focal length in CSS px and the point the lens axis meets the screen, CSS px from the top left */
  fpx: number; cx: number; cy: number;
}
export interface PassState { key: string; t: number; oval: [number, number, number, number] | null }
export interface SlotState { scene: number; W: number; passes: PassState[]; sat: number; fade: [number, number, number, number] | null;
  /** a phone's soft side edges of the picture: its left and right edge on screen (CSS px) and the width of the fade */
  sides: [number, number, number] | null }
export interface FrameState {
  vw: number; vh: number; pr: number;
  cam: CamState;
  slots: SlotState[];
  /** scene 2's phone between where it taps the tile (0) and lifted to the camera (1) */
  lift: number;
  /** the box (CSS px) of the copy of the things in front of the giant words, or null */
  fg: [number, number, number, number] | null;
  /** scene 2's phone drawn by the live light (0: from the stills, 1: live), and its screen's picture */
  menuLive: number; screen: string | null;
  /** build 12H: which picture the live phone's screen shows (0: the calm screen, 1: the cafe's profile page) */
  page?: number;
  /** build 12H: the picture of the four tile icons, for the tiles where no still saw them */
  tiles?: string;
  /** how strongly each thing stands in front of the giant words in the copy above them (1 when not named) */
  fgA?: Record<string, number>;
  /** a thing held by one scene's stills only is drawn by that scene (not between scenes 6 and 7: one camera) */
  hold: boolean;
  /** the dark band at the foot of each scene shown: its weight, and where (share of the screen's height from the foot)
   *  it is at 0.45 or 0.6 and where it ends */
  shade: [number, number, number][];
}

/* ---------- shapes ---------- */
interface Part { name: string; P: Float32Array; N: Float32Array; I: Uint32Array | Uint16Array }
/** Gives the page back for a moment once a few ms of work have run (the shapes are read in slices between frames: in
 *  one piece they took 130 ms at a fourth of a laptop's speed, a stop at the visitor's first gesture). */
function slicer(ms = 5): () => Promise<void> | null {
  let t = performance.now();
  return () => {
    if (performance.now() - t < ms) return null;
    // the next slice right after the next frame is drawn (a message or a timer alone ran slice after slice before the
    // page drew: one frame of 85 ms)
    return new Promise<void>((r) => requestAnimationFrame(() => setTimeout(() => { t = performance.now(); r(); }, 0)));
  };
}
async function loadParts(): Promise<{ parts: Map<string, Part>; coinMap: { n: number; rgba: Uint8Array } }> {
  const res = await fetch(worldUrl);
  if (!res.ok || !res.body) throw new Error('world');
  const buf = await new Response(res.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  const breathe = slicer();
  const n = new DataView(buf).getUint32(0, true);
  const head = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 4, n))) as {
    parts: { name: string; v: number; i: number; min: number[]; max: number[]; i32: boolean }[]; coin: { n: number; r: number; hmax: number };
  };
  let o = 4 + n;
  o += (4 - (o % 4)) % 4;
  const out = new Map<string, Part>();
  const STEP = 30000;
  for (const p of head.parts) {
    const q = new Uint16Array(buf, o, p.v * 3); o += p.v * 6;
    const nb = new Int8Array(buf, o, p.v * 3); o += p.v * 3; o += (4 - (o % 4)) % 4;
    const ib = p.i32 ? new Uint32Array(buf, o, p.i) : new Uint16Array(buf, o, p.i);
    o += ib.byteLength; o += (4 - (o % 4)) % 4;
    const P = new Float32Array(p.v * 3), N = new Float32Array(p.v * 3), last = [0, 0, 0];
    for (let i0 = 0; i0 < P.length; i0 += STEP) {
      for (let i = i0; i < Math.min(P.length, i0 + STEP); i++) {
        const k = i % 3, v = (last[k] + q[i]) & 0xffff;
        last[k] = v;
        P[i] = p.min[k] + (v / 65535) * (p.max[k] - p.min[k]);
        N[i] = nb[i] / 127;
      }
      await breathe();
    }
    const I = p.v > 65535 ? new Uint32Array(p.i) : new Uint16Array(p.i);
    let prev = 0;
    for (let k0 = 0; k0 < p.i; k0 += STEP) {
      for (let k = k0; k < Math.min(p.i, k0 + STEP); k++) { const z = ib[k], d = z & 1 ? -(z + 1) / 2 : z / 2; prev += d; I[k] = prev; }
      await breathe();
    }
    out.set(p.name, { name: p.name, P, N, I });
  }
  // the coin: its height field as a disc of rings (exact round rim), and its outer wall
  const { n: G, r: R, hmax } = head.coin, hq = new Uint16Array(buf, o, G * G), H = new Float32Array(G * G);
  for (let k = 0, prev = 0; k < hq.length; k++) { prev = (prev + hq[k]) & 0xffff; H[k] = (prev / 65535) * hmax; }
  // the coin's own colours where no still saw it: the spools of the print (ptDark.ts LINES_MAT), linear
  const part = new Uint8Array(buf, o + G * G * 2, G * G), COL = [[2, 2, 2], [66, 69, 62], [5, 20, 190], [237, 4, 4]];
  const rgba = new Uint8Array(G * G * 4);
  for (let k = 0; k < part.length; k++) { const c = COL[part[k]]; rgba[k * 4] = c[0]; rgba[k * 4 + 1] = c[1]; rgba[k * 4 + 2] = c[2]; rgba[k * 4 + 3] = 255; }
  await breathe();
  const hAt = (x: number, z: number) => {
    const fx = ((x + R) / (2 * R)) * (G - 1), fz = ((z + R) / (2 * R)) * (G - 1);
    const i = Math.max(0, Math.min(G - 2, Math.floor(fx))), j = Math.max(0, Math.min(G - 2, Math.floor(fz))), u = fx - i, v = fz - j;
    return H[j * G + i] * (1 - u) * (1 - v) + H[j * G + i + 1] * u * (1 - v) + H[(j + 1) * G + i] * (1 - u) * v + H[(j + 1) * G + i + 1] * u * v;
  };
  const RINGS = 150, SEG = 560, top0 = 1 + RINGS * SEG, NV = top0 + 2 * SEG;
  const P = new Float32Array(NV * 3), Nn = new Float32Array(NV * 3);
  const I = new Uint32Array(SEG * 3 + (RINGS - 1) * SEG * 6 + SEG * 6);
  P[1] = hAt(0, 0);
  const COS = new Float32Array(SEG), SIN = new Float32Array(SEG);
  for (let s = 0; s < SEG; s++) { COS[s] = Math.cos((s / SEG) * Math.PI * 2); SIN[s] = Math.sin((s / SEG) * Math.PI * 2); }
  for (let r = 1; r <= RINGS; r++) {
    const rr = (R * r) / RINGS;
    for (let s = 0; s < SEG; s++) { const k = (1 + (r - 1) * SEG + s) * 3, x = rr * COS[s], z = rr * SIN[s]; P[k] = x; P[k + 1] = hAt(x * 0.999, z * 0.999); P[k + 2] = z; }
    if (r % 10 === 0) await breathe();
  }
  const ring = (r: number, s: number) => (r === 0 ? 0 : 1 + (r - 1) * SEG + (s % SEG));
  let ii = 0;
  for (let s = 0; s < SEG; s++) { I[ii++] = 0; I[ii++] = ring(1, s + 1); I[ii++] = ring(1, s); }
  for (let r = 1; r < RINGS; r++) {
    for (let s = 0; s < SEG; s++) { I[ii++] = ring(r, s); I[ii++] = ring(r, s + 1); I[ii++] = ring(r + 1, s); I[ii++] = ring(r, s + 1); I[ii++] = ring(r + 1, s + 1); I[ii++] = ring(r + 1, s); }
    if (r % 30 === 0) await breathe();
  }
  // the wall: the rim ring again with its own (outward) normals, down to the floor
  for (let s = 0; s < SEG; s++) {
    const x = R * COS[s], z = R * SIN[s], k = (top0 + 2 * s) * 3;
    P[k] = x; P[k + 1] = P[ring(RINGS, s) * 3 + 1]; P[k + 2] = z; P[k + 3] = x; P[k + 4] = 0; P[k + 5] = z;
  }
  for (let s = 0; s < SEG; s++) { const a = top0 + 2 * s, b = top0 + 2 * ((s + 1) % SEG); I[ii++] = a; I[ii++] = a + 1; I[ii++] = b; I[ii++] = b; I[ii++] = a + 1; I[ii++] = b + 1; }
  // normals: the top from the height field's slopes, the wall radial
  for (let k = 0; k < top0; k++) {
    const x = P[k * 3], z = P[k * 3 + 2], e = 0.35;
    const dx = (hAt(x + e, z) - hAt(x - e, z)) / (2 * e), dz = (hAt(x, z + e) - hAt(x, z - e)) / (2 * e), l = Math.hypot(dx, 1, dz);
    Nn[k * 3] = -dx / l; Nn[k * 3 + 1] = 1 / l; Nn[k * 3 + 2] = -dz / l;
    if (k % 8000 === 0) await breathe();
  }
  for (let k = top0; k < NV; k++) { const x = P[k * 3], z = P[k * 3 + 2], l = Math.hypot(x, z) || 1; Nn[k * 3] = x / l; Nn[k * 3 + 2] = z / l; }
  out.set('coin', { name: 'coin', P, N: Nn, I });
  // the floor: one big square
  const F = 4000;
  out.set('floor', { name: 'floor', P: Float32Array.of(-F, -0.02, -F, F, -0.02, -F, F, -0.02, F, -F, -0.02, F), N: Float32Array.of(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0), I: Uint16Array.of(0, 2, 1, 0, 3, 2) });
  // the room round it all, far off: what the stills show past the floor's edge and above it (the soft glow of a thing
  // near the camera reaches there), so no part of the screen is empty while the film is live
  const B = 5200, rp: number[] = [], rn: number[] = [], ri: number[] = [];
  const quad = (c: number[][], n: number[]) => { const o = rp.length / 3; for (const q of c) { rp.push(...q); rn.push(...n); } ri.push(o, o + 1, o + 2, o, o + 2, o + 3); };
  quad([[-B, -B, -B], [B, -B, -B], [B, B, -B], [-B, B, -B]], [0, 0, 1]);
  quad([[B, -B, B], [-B, -B, B], [-B, B, B], [B, B, B]], [0, 0, -1]);
  quad([[-B, -B, B], [-B, -B, -B], [-B, B, -B], [-B, B, B]], [1, 0, 0]);
  quad([[B, -B, -B], [B, -B, B], [B, B, B], [B, B, -B]], [-1, 0, 0]);
  quad([[-B, B, -B], [B, B, -B], [B, B, B], [-B, B, B]], [0, -1, 0]);
  out.set('room', { name: 'room', P: Float32Array.from(rp), N: Float32Array.from(rn), I: Uint16Array.from(ri) });
  return { parts: out, coinMap: { n: G, rgba } };
}

/* ---------- the things, their colours for the live light ---------- */
interface Mat { alb: V3; rough: number; metal: number; map?: boolean }
const lin = (v: number): V3 => [v, v, v * 1.07];
const MATS: Record<string, Mat> = {
  black: { alb: lin(0.011), rough: 0.6, metal: 0 },
  let_pro: { alb: [0.78, 0.77, 0.74], rough: 0.46, metal: 0 },
  let_x: { alb: [0.93, 0.79, 0.43], rough: 0.48, metal: 0 },
  let_y: { alb: [0.096, 0.53, 0.44], rough: 0.5, metal: 0 },
  let_z: { alb: [0.85, 0.05, 0.25], rough: 0.5, metal: 0 },
  phone_body: { alb: [0.45, 0.45, 0.48], rough: 0.3, metal: 1 },
  phone_glass: { alb: [0.002, 0.002, 0.0025], rough: 0.05, metal: 0 },
  phone_display: { alb: [0.003, 0.003, 0.0035], rough: 0.05, metal: 0 },
  coin: { alb: [0.04, 0.04, 0.04], rough: 0.5, metal: 0, map: true },
  base: { alb: [0.04, 0.034, 0.03], rough: 0.86, metal: 0 },
  // the stills' floor: 0.012 under a texture that averages a half
  floor: { alb: [0.006, 0.006, 0.0058], rough: 0.95, metal: 0 },
  room: { alb: [0, 0, 0], rough: 1, metal: 0 },
};
const STAND_PARTS = ['tall_body_lod1', 'tall_accent', 'tall_web', 'plate', 'let_pro', 'let_x', 'let_y', 'let_z'];
const TILE_AT: V3[] = [[-51.9, 13.6684, 5.2229], [-17.3, 13.6684, 5.2229], [17.3, 13.6684, 5.2229], [51.9, 13.6684, 5.2229]];

type ThingName = 'stand' | 'menu' | 'trophy' | 'coin' | 'coach' | 'floor';
/** how far (mm) a thing may be hidden behind itself in a still and still take the still's colour (its own relief) */
const TOL: Record<ThingName, number> = { stand: 4, menu: 2, trophy: 12, coin: 22, coach: 2, floor: 0 };
interface Draw { part: string; local: M4; mat: Mat; /** build 12H: which tile (its printed icon) */ tile?: number }
interface Thing { name: ThingName; draws: Draw[]; /** the scenes whose stills hold it */ scenes: number[]; fg: number[] }

function things(): Thing[] {
  const stand: Draw[] = STAND_PARTS.map((p) => ({ part: p, local: ident(), mat: MATS[p] ?? MATS.black }));
  TILE_AT.forEach((t, i) => stand.push({ part: 'tile', local: mul(translate(...t), rotX(15 * DEG)), mat: MATS.black, tile: i }));
  const phone = (): Draw[] => ['phone_body', 'phone_glass', 'phone_display'].map((p) => ({ part: p, local: ident(), mat: MATS[p] }));
  return [
    { name: 'stand', draws: stand, scenes: [1, 2, 6], fg: [2, 6] },
    { name: 'menu', draws: phone(), scenes: [2], fg: [2] },
    { name: 'trophy', draws: [{ part: 'base', local: ident(), mat: MATS.base }, { part: 'coin', local: COIN_ON_BASE, mat: MATS.coin }], scenes: [3], fg: [3] },
    { name: 'coin', draws: [{ part: 'coin', local: ident(), mat: MATS.coin }], scenes: [4, 6], fg: [6] },
    { name: 'coach', draws: phone(), scenes: [5, 6], fg: [5, 6] },
    { name: 'floor', draws: [{ part: 'floor', local: ident(), mat: MATS.floor }, { part: 'room', local: ident(), mat: MATS.room }], scenes: [1, 2, 3, 4, 5, 6], fg: [] },
  ];
}

/* ---------- the world of one screen shape: where everything stands, and every still's camera in it ---------- */
export interface Projector {
  key: string; scene: number; pass: number;
  /** the still's camera, in the world */
  eye: V3; target: V3; VP: M4; near: number; far: number;
  /** the still's frame: picture px, focal length and lens axis */
  w: number; h: number; fpx: number; ppx: number; ppy: number;
  /** each thing's pose when the still was drawn (null: the still did not hold it) */
  poses: Map<ThingName, M4 | null>;
  light: { pos: V3; dir: V3; cos: [number, number]; int: number; kind: number; aim: V3;
    /** a black card that keeps this light off a thing (scene 5: the coin), in the world: centre, two half sides */
    flag: [V3, V3, V3] | null };
}
export interface Layout {
  form: Form;
  /** each thing's world pose (scene 2's phone: in the stand's room, see menuPose) */
  pose: Record<Exclude<ThingName, 'menu'>, M4>;
  stand: M4;
  tap: M4; lift: M4;
  /** build 12H: where scene 2's phone starts, below the frame, held out toward the stand (see menuPose) */
  from: { pos: V3; ang: V3; ctl: V3 };
  projectors: Map<string, Projector>;
}

function projectorOf(key: string, scene: number, pass: number, room: M4, form: Form, base: Record<Exclude<ThingName, 'menu'>, M4>, standRoom: M4): Projector {
  const s = SHOTS[key];
  if (!s) throw new Error('no shot ' + key);
  const c = s.cam;
  const eye = point(room, add(c.look, dirFrom(c.az, c.el), c.dist)), target = point(room, c.look);
  const fpx = c.h / 2 / Math.tan((c.fov / 2) * DEG), ppx = c.w * (0.5 + c.sx), ppy = c.h * (0.5 - c.sy);
  const near = 20, far = 6000;
  const P = frustum((-ppx / fpx) * near, ((c.w - ppx) / fpx) * near, (-(c.h - ppy) / fpx) * near, (ppy / fpx) * near, near, far);
  const VP = mul(P, lookAt(eye, target));
  const poses = new Map<ThingName, M4 | null>();
  for (const n of ['stand', 'menu', 'trophy', 'coin', 'coach'] as ThingName[]) poses.set(n, null);
  poses.set('floor', ident());
  if (s.obj === 'stand' || s.obj === 'stand5') poses.set('stand', base.stand);
  if (s.obj === 'stand5' && s.phone?.pos && s.phone.rot) poses.set('menu', mul(standRoom, mul(translate(...s.phone.pos), eulerYXZ(...s.phone.rot))));
  if (s.obj === 'trophy') poses.set('trophy', base.trophy);
  if (s.obj === 'lines') poses.set('coin', base.coin);
  if (s.obj === 'coach') poses.set('coach', base.coach);
  if (s.obj === 'trio') { poses.set('stand', base.stand); poses.set('coin', base.coin); poses.set('coach', base.coach); }
  // the other things of the room in the still's view, drawn where they stand (its room placed in the world: where they
  // stand in the world, by construction)
  for (const e of s.extra ?? []) poses.set(e.name, mul(room, floorPose(e.x, e.z, e.turn, e.name === 'coach' ? PHONE_T / 2 : 0)));
  const L = s.light, lp = point(room, L.pos), la = point(room, L.aim);
  const dl = [la[0] - lp[0], la[1] - lp[1], la[2] - lp[2]] as V3, dn = Math.hypot(...dl);
  const cone = (L.cone ?? 90) * DEG, pen = L.pen ?? 0;
  void form;
  const fl = L.flag ? (() => { const c = point(room, L.flag!.c), at = (d: V3) => { const q = point(room, add(L.flag!.c, d)); return [q[0] - c[0], q[1] - c[1], q[2] - c[2]] as V3; }; return [c, at(L.flag!.u), at(L.flag!.v)] as [V3, V3, V3]; })() : null;
  return {
    key, scene, pass, eye, target, VP, near, far, w: c.w, h: c.h, fpx, ppx, ppy, poses,
    light: { pos: lp, dir: [dl[0] / dn, dl[1] / dn, dl[2] / dn], cos: [Math.cos(cone), Math.cos(cone * (1 - pen))], int: L.int, kind: L.kind === 'panel' ? 1 : 0, aim: la, flag: fl },
  };
}

/** The world of one screen shape: built from scene 6's still (the three things' places) and every scene's passes. */
export function layoutOf(form: Form, passes: Record<number, string[]>): Layout {
  const trio = SHOTS[passes[6][0]].trio!;
  const stand = floorPose(trio[0], trio[1], trio[2]);
  const coin = floorPose(trio[3], trio[4], trio[5]);
  const coach = floorPose(trio[6], trio[7], trio[8], PHONE_T / 2);
  const T = TROPHY[form];
  const base = { stand, coin, coach, trophy: floorPose(T[0], T[1], T[2]), floor: ident() };
  // each scene's room in the world: the room of the still placed so its thing lands on the thing in the world
  const coachShot = SHOTS[passes[5][0]].phone?.floor ?? [0, 0, -18];
  const rooms: Record<number, M4> = {
    1: stand, 2: stand, 3: base.trophy, 4: coin,
    5: floorPose(trio[6] - 0, trio[7], trio[8] - coachShot[2]),
    6: ident(),
  };
  const projectors = new Map<string, Projector>();
  for (const [n, keys] of Object.entries(passes)) keys.forEach((k, i) => projectors.set(k, projectorOf(k, +n, i, rooms[+n], form, base, stand)));
  const s2 = passes[2];
  const tap = projectors.get(s2[1])?.poses.get('menu') ?? ident(), lift = projectors.get(s2[2])?.poses.get('menu') ?? ident();
  return { form, pose: base, stand, tap, lift, from: fromOf(tap, projectors.get(s2[0])), projectors };
}

const angOf = (m: M4): V3 => [Math.asin(Math.max(-1, Math.min(1, -m[9]))), Math.atan2(m[8], m[10]), Math.atan2(m[1], m[5])];
/** Build 12H: scene 2's phone before it taps, as a person holds a phone out toward a counter: below the frame of scene 2's
 *  first still, between the camera and the stand, standing up more (its screen toward the person, so toward the camera),
 *  its foot toward the camera. It comes up from there over the tile (ctl: the curve's middle point, above the tile and a
 *  little in front of it) and tips onto it. The farther from the tile the start, the lower in the frame: it is moved
 *  toward the camera until the whole phone is under the frame's foot. */
function fromOf(tap: M4, p1: Projector | undefined): { pos: V3; ang: V3; ctl: V3 } {
  const P: V3 = [tap[12], tap[13], tap[14]], a = angOf(tap);
  if (!p1) return { pos: P, ang: a, ctl: P };
  const e = p1.eye, hx = e[0] - P[0], hz = e[2] - P[2], hl = Math.hypot(hx, hz) || 1, to: V3 = [hx / hl, 0, hz / hl];
  const ang: V3 = [a[0] + 50 * DEG, Math.atan2(to[0], to[2]), 0];
  const box = BOUNDS_MENU;
  for (let d = 120; d < 900; d += 10) {
    const pos: V3 = [P[0] + to[0] * d, P[1] + 30 + d * 0.12, P[2] + to[2] * d];
    const M = mulAll(translate(...pos), rotY(ang[1]), rotX(ang[0]), rotZ(ang[2])), PM = mul(p1.VP, M);
    let below = true;
    for (let c = 0; c < 8 && below; c++) {
      const q: V3 = [c & 1 ? box[3] : box[0], c & 2 ? box[4] : box[1], c & 4 ? box[5] : box[2]];
      const w = PM[3] * q[0] + PM[7] * q[1] + PM[11] * q[2] + PM[15], y = (PM[1] * q[0] + PM[5] * q[1] + PM[9] * q[2] + PM[13]) / w;
      if (w > 0 && y > -1.04) below = false;
    }
    if (below) return { pos, ang, ctl: [P[0] + to[0] * d * 0.3, P[1] + 55, P[2] + to[2] * d * 0.3] };
  }
  return { pos: P, ang: a, ctl: P };
}
/** the phone's box, mm in its own frame (as film3d's BOUNDS) */
const BOUNDS_MENU = [-36, -4, -75, 36, 4, 75];

/** Scene 2's phone between its two poses: slerp-free blend of the two matrices' parts, lifted a little in an arc. */
export function menuPose(L: Layout, t: number): M4 {
  if (t < 0) {
    // build 12H: on its way from below the frame (-1) to the tile (0): along a curve up and over the tile, turning from
    // held up toward the person to lying back on the tile; slow at both ends
    const e = 1 + Math.max(-1, t), f = L.from, a = angOf(L.tap), q = 1 - e;
    const pos = [0, 1, 2].map((j) => q * q * f.pos[j] + 2 * q * e * f.ctl[j] + e * e * L.tap[12 + j]) as V3;
    const k = e * e * (3 - 2 * e), wrap = (d: number) => Math.atan2(Math.sin(d), Math.cos(d));
    const r = [0, 1, 2].map((j) => f.ang[j] + wrap(a[j] - f.ang[j]) * k) as V3;
    return mulAll(translate(...pos), rotY(r[1]), rotX(r[0]), rotZ(r[2]));
  }
  if (t <= 0) return L.tap;
  if (t >= 1) return L.lift;
  // blend position, and the turn by its three Euler angles read back from the matrices (both small and well apart)
  const a = angOf(L.tap), b = angOf(L.lift), e = t;
  const r: V3 = [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e];
  const pos: V3 = [L.tap[12] + (L.lift[12] - L.tap[12]) * e, L.tap[13] + (L.lift[13] - L.tap[13]) * e + 14 * Math.sin(Math.PI * e), L.tap[14] + (L.lift[14] - L.tap[14]) * e];
  return mulAll(translate(...pos), rotY(r[1]), rotX(r[0]), rotZ(r[2]));
}

/* ---------- the drawing ---------- */
interface Mesh { vao: WebGLVertexArrayObject; count: number; type: number; bufs: WebGLBuffer[] }
interface Tex { key: string; state: 'none' | 'loading' | 'decoded' | 'ready' | 'failed'; url: string; strips: ImageBitmap[]; size: [number, number]; tex: WebGLTexture | null; bytes: number; used: number; row: number; rank: number; want: boolean;
  /** build 12E (WebKit): the picture's pixels, decoded while the page was still (see World.PIXELS) */
  px: Uint8Array | null;
  /** build 12E (WebKit): asked for only to be decoded ahead (the scene after the wanted ones), not to go into the chip */
  ahead: boolean;
  /** the picture, small and soft (about 128 px on its long side): the floor past its frame takes it */
  small: WebGLTexture | null;
  /** build 12G: every row is in, its smaller copies (mipmaps) are made next, in a call of their own */
  mipDue?: boolean }
interface DepthMap { fb: WebGLFramebuffer; tex: WebGLTexture; w: number; h: number }
/** Build 12G: a still is drawn smaller than its own pixels almost everywhere (a phone's canvas is at most twice the page,
 *  860 px wide, against a 1572 px still; a quarter of it at the lowest sharpness), so it keeps its whole chain of smaller
 *  copies (mipmaps), each half the one before, and is read through them (trilinear, and anisotropic where the chip has
 *  it). With one level only, every screen pixel took the one or four texels nearest it: the stand's fine print lines
 *  came out as zebra stripes and the edges as steps (Tew's iPhone, 21 Nov 2026). The copies cost a third more memory. */
const levelsOf = (w: number, h: number) => Math.floor(Math.log2(Math.max(w, h))) + 1;
const bytesOf = (w: number, h: number) => { let b = 0; for (let l = 0; l < levelsOf(w, h); l++) b += Math.max(1, w >> l) * Math.max(1, h >> l) * 4; return b; };

export interface WorldEvents { lost(): void; restored(): void }

export class World {
  static EXPOSURE = 0.45;
  static TOUCH = true;
  /** the screen's light of scene 2's phone drawn live, against the stills' (matched on the lifted phone at its rest) */
  static SCREEN = 0.6;
  /** build 12G: which of a still's smaller copies is read (0: as the chip chooses; negative: sharper) */
  static BIAS = -0.5;
  /** Build 12E. WebKit (Safari, and every browser on an iPhone) decodes a picture read in as an ImageBitmap only when
   *  its first rows go into the chip: 29 to 36 ms in the simulator, a stop when that falls in a scroll (9 of 12D's 21
   *  stops). There the pictures are decoded ahead, while the page is still (drawn once into a canvas read on the processor), into plain pixels, and those go
   *  into the chip a strip at a time with nothing left to decode. Elsewhere the ImageBitmap is decoded when it is made. */
  static PIXELS = typeof navigator !== 'undefined' && /AppleWebKit/.test(navigator.userAgent) && (!/Chrome|Chromium|Edg|Android/.test(navigator.userAgent) || /CriOS|FxiOS|EdgiOS/.test(navigator.userAgent));
  /** the bytes of a picture read into the chip in one call (smaller on a phone) */
  stripBytes = 1.1e6;
  private lastUpload = 0;
  /** the depth maps' long side: finer on a laptop (the moves' edges), smaller on a phone (its memory) */
  depthLong = 1024;
  readonly canvas: HTMLCanvasElement;
  gl!: WebGL2RenderingContext;
  private parts: Map<string, Part>;
  private coinMap: { n: number; rgba: Uint8Array };
  private coinTex!: WebGLTexture;
  private things = things();
  private meshes = new Map<string, Mesh>();
  private progW!: WebGLProgram; private progD!: WebGLProgram;
  private uW = new Map<string, WebGLUniformLocation | null>(); private uD = new Map<string, WebGLUniformLocation | null>();
  private texs = new Map<string, Tex>();
  private depth = new Map<string, DepthMap>();
  private blank!: WebGLTexture;
  layout: Layout | null = null;
  lost = false;
  /** tints what is lit live (a check of the build, never on for a visitor) */
  debug = 0;
  /** bytes of pictures held in the graphics chip */
  held = 0;
  budget: number;
  private events: WorldEvents;

  private constructor(canvas: HTMLCanvasElement, loaded: { parts: Map<string, Part>; coinMap: { n: number; rgba: Uint8Array } }, events: WorldEvents, budget: number) {
    this.canvas = canvas; this.parts = loaded.parts; this.coinMap = loaded.coinMap; this.events = events; this.budget = budget;
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.lost = true; this.events.lost(); });
    canvas.addEventListener('webglcontextrestored', () => {
      try { this.init(); this.lost = false; this.events.restored(); } catch { /* stays lost: the still film */ }
    });
    this.init();
  }

  static async create(events: WorldEvents, budget: number, idle = false): Promise<World> {
    const canvas = document.createElement('canvas');
    canvas.className = 'world';
    canvas.setAttribute('aria-hidden', 'true');
    // the context first: no WebGL 2, no download
    const probe = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance', depth: true, stencil: false });
    if (!probe) throw new Error('no webgl2');
    // made ahead on idle: not on a chip drawn in software (it would only spend the visitor's processor; at a gesture
    // the film measures it and gives up as before)
    if (idle) {
      const info = probe.getExtension('WEBGL_debug_renderer_info');
      const name = info ? String(probe.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
      if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(name)) { probe.getExtension('WEBGL_lose_context')?.loseContext(); throw new Error('software'); }
    }
    const parts = await loadParts();
    return new World(canvas, parts, events, budget);
  }

  private init(): void {
    const gl = this.canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance', depth: true, stencil: false });
    if (!gl) throw new Error('no webgl2');
    this.gl = gl;
    // the shaders compile while the page goes on (the browser's own threads where it can): their state is asked only
    // once they are done (asking at once waited for the compiler on the page's thread, a stop at the first gesture)
    this.parallel = gl.getExtension('KHR_parallel_shader_compile');
    this.aniso = gl.getExtension('EXT_texture_filter_anisotropic');
    this.anisoN = this.aniso ? Math.min(4, Number(gl.getParameter((this.aniso as unknown as { MAX_TEXTURE_MAX_ANISOTROPY_EXT: number }).MAX_TEXTURE_MAX_ANISOTROPY_EXT)) || 1) : 1;
    this.linkedOk = false;
    this.progW = this.progD = null!;
    const compile = (vs: string, fs: string) => {
      const p = gl.createProgram()!;
      for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]] as const) {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src); gl.compileShader(s);
        gl.attachShader(p, s);
      }
      gl.bindAttribLocation(p, 0, 'aPos'); gl.bindAttribLocation(p, 1, 'aNor');
      gl.linkProgram(p);
      // where the browser has no compiler of its own threads (Safari), the link is done here and now, in this step's
      // frame (asked at once, so it never lands on a later frame together with another program's)
      if (!this.parallel) gl.getProgramParameter(p, gl.LINK_STATUS);
      return p;
    };
    this.uW.clear(); this.uD.clear();
    this.meshes.clear();
    // every picture and depth map is gone with a lost context: read again when asked
    for (const t of this.texs.values()) { t.tex = null; t.small = null; t.row = 0; if (t.state === 'ready' || t.mipDue) t.state = 'none'; t.mipDue = false; }
    this.clearFb = null; this.shrinkProg = null; this.shrinkVao = null; this.shrinkFb = null;
    this.spare.clear(); this.spareBytes = 0;
    this.held = 0;
    this.depth.clear();
    this.depthRb.clear();
    this.blank = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.blank);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    // Build 12D: the rest of the work is done one step at a time, at most one a frame (src/world/film3d.ts paces them:
    // on idle only once the page has been still for a second, else one a frame): Safari links a program on the page's
    // thread (about 300 ms for the world's) and builds its pipeline at its first draw (78 to 113 ms), so no frame ever
    // holds more than one of them
    const upload = (names: string[]) => () => {
      for (const name of names) {
        const p = this.parts.get(name)!;
        const vao = gl.createVertexArray()!;
        gl.bindVertexArray(vao);
        const b0 = gl.createBuffer()!, b1 = gl.createBuffer()!, b2 = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, b0); gl.bufferData(gl.ARRAY_BUFFER, p.P, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, b1); gl.bufferData(gl.ARRAY_BUFFER, p.N, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b2); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, p.I, gl.STATIC_DRAW);
        gl.bindVertexArray(null);
        this.meshes.set(name, { vao, count: p.I.length, type: p.I instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, bufs: [b0, b1, b2] });
      }
    };
    const names = [...this.parts.keys()];
    this.steps = [
      { run: upload(names.filter((n) => n !== 'coin')) },
      { run: () => {
        upload(['coin'])();
        this.coinTex = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, this.coinTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.coinMap.n, this.coinMap.n, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.coinMap.rgba);
        for (const [a, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, a, v);
      } },
      { run: () => { this.progW = compile(WORLD_VS, WORLD_FS(World.EXPOSURE)); } },
      { run: () => { this.progD = compile(DEPTH_VS, DEPTH_FS); } },
      { run: () => { this.shrinkInit(); if (!this.parallel) gl.getProgramParameter(this.shrinkProg!, gl.LINK_STATUS); } },
      // each program drawn once, in the very state the frames draw with (a browser builds a program's pipeline for its
      // state at its first draw), once it is linked
      { run: () => this.warmWorld(), wait: () => !this.done(this.progW) },
      { run: () => this.warmDepth(), wait: () => !this.done(this.progD) },
      { run: () => { this.shrinkTo(this.blank, 1, 1, null); gl.flush(); }, wait: () => !this.done(this.shrinkProg!) },
    ];
  }

  /** the work still to do before the first frame (src/world/film3d.ts runs it, one step a frame) */
  private steps: { run(): void; wait?(): boolean }[] = [];
  private stepAt = -1e9;
  /** Runs the next step of the world's making, at most one a frame. Returns true while steps remain. */
  step(): boolean {
    if (this.lost || this.broken) return false;
    const now = performance.now();
    if (!this.steps.length) return false;
    if (now - this.stepAt < 12) return true;
    const s = this.steps[0];
    if (s.wait?.()) return true;
    this.steps.shift();
    this.stepAt = now;
    s.run();
    this.ready();
    return this.steps.length > 0;
  }
  /** every step done: the world can draw */
  get built(): boolean { return !this.steps.length && !this.lost; }
  /** a program the browser has finished (never waits for it where the browser compiles on its own threads) */
  private done(p: WebGLProgram): boolean {
    return !this.parallel || !!this.gl.getProgramParameter(p, this.parallel.COMPLETION_STATUS_KHR);
  }

  private parallel: { COMPLETION_STATUS_KHR: number } | null = null;
  /** anisotropic filtering: the extension, and how many samples (at most 4) */
  private aniso: { TEXTURE_MAX_ANISOTROPY_EXT: number } | null = null;
  private anisoN = 1;
  private linkedOk = false;
  /** why the shaders could not be built, if they could not */
  broken = '';
  /** the shaders are compiled and linked (never waits for them where the browser compiles on its own threads) */
  ready(): boolean {
    if (this.linkedOk) return !this.steps.length;
    if (this.lost || !this.progW || !this.progD || !this.shrinkProg) return false;
    const gl = this.gl;
    if (!this.done(this.progW) || !this.done(this.progD) || !this.done(this.shrinkProg)) return false;
    for (const p of [this.progW, this.progD, this.shrinkProg]) {
      if (!gl.getProgramParameter(p, gl.LINK_STATUS) && !gl.isContextLost()) {
        // a chip that cannot build them: the still film (src/world/film3d.ts gives up)
        this.broken = 'link: ' + gl.getProgramInfoLog(p) + ' ' + (gl.getAttachedShaders(p)?.map((x) => gl.getShaderInfoLog(x)).join(' ') ?? '');
        return false;
      }
    }
    this.linkedOk = true;
    return !this.steps.length;
  }

  private uni(prog: WebGLProgram, map: Map<string, WebGLUniformLocation | null>, name: string): WebGLUniformLocation | null {
    if (!map.has(name)) map.set(name, this.gl.getUniformLocation(prog, name));
    return map.get(name)!;
  }

  setLayout(L: Layout): void {
    if (this.layout?.form !== L.form) {
      // another shape: its own stills and depth maps
      for (const t of this.texs.values()) this.drop(t);
      this.texs.clear();
      for (const d of this.depth.values()) this.dropDepth(d);
      this.depth.clear();
      if (!this.lost) for (const rb of this.depthRb.values()) this.gl.deleteRenderbuffer(rb);
      this.depthRb.clear();
    }
    this.layout = L;
  }

  /* ---------- the stills, read into the chip ---------- */
  /** Asks for these pictures (most wanted first); starts reading those not yet read. */
  want(list: { key: string; url: string }[], ahead: { key: string; url: string }[] = [], idle = false): void {
    const now = performance.now();
    for (const { key, url } of list) {
      let t = this.texs.get(key);
      if (t && t.url !== url && t.state !== 'loading') { this.drop(t); t = undefined; }
      if (!t) { t = { key, state: 'none', url, strips: [], size: [0, 0], tex: null, bytes: 0, used: now, row: 0, rank: 0, want: true, small: null, px: null, ahead: false }; this.texs.set(key, t); }
      t.used = now;
    }
    // build 12E (WebKit): the pictures of the scene after those, decoded ahead into pixels while the page is still
    for (const { key, url } of ahead) {
      if (this.texs.has(key)) continue;
      this.texs.set(key, { key, state: 'none', url, strips: [], size: [0, 0], tex: null, bytes: 0, used: now - 1, row: 0, rank: 0, want: false, small: null, px: null, ahead: true });
    }
    this.idle = idle;
    // the order of this list is the order of reading (a picture no longer asked for is not read)
    const order = new Map([...list, ...ahead].map((x, i) => [x.key, i])), wanted = new Set(list.map((x) => x.key));
    for (const t of this.texs.values()) {
      t.want = wanted.has(t.key); t.ahead = !t.want && order.has(t.key); t.rank = order.get(t.key) ?? 1e9;
      // pixels decoded ahead for a picture no longer asked for: let go (they are its whole size in memory)
      if (t.px && !t.want && !t.ahead && !t.tex) { t.px = null; t.state = 'none'; }
    }
    this.pump();
  }
  /** One picture decoded at a time, the most wanted first, a frame between two (each decoded picture handed back to
   *  the page costs it about 10 ms at a fourth of a laptop's speed: seven at once were one frame of 75 ms) */
  private decoding = false;
  /** the page has been still for a second (build 12E: only then are pictures read ahead) */
  private idle = false;
  private pump(): void {
    if (this.decoding) return;
    const t = [...this.texs.values()].filter((x) => x.state === 'none' && (x.want || (x.ahead && this.idle))).sort((a, b) => a.rank - b.rank)[0];
    if (t) this.load(t);
  }
  private load(t: Tex): void {
    t.state = 'loading';
    this.decoding = true;
    const next = () => { this.decoding = false; requestAnimationFrame(() => this.pump()); };
    fetch(t.url, { credentials: 'same-origin' })
      .then((r) => { if (!r.ok) throw new Error('picture'); return r.blob(); })
      // the pictures are sRGB already: no colour conversion on the way (Firefox warned of a slow upload for each)
      .then((b) => createImageBitmap(b, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' }))
      .then((bm) => {
        next();
        if (this.texs.get(t.key) !== t) { bm.close(); return; }
        // one decoded picture, read into the chip a range of rows at a time (pictures cut out of it first came back
        // from the chip in Chromium, 60 to 75 ms at a change)
        t.strips = [bm]; t.size = [bm.width, bm.height]; t.state = 'decoded';
        this.onDecoded?.();
      })
      .catch(() => { next(); t.state = 'failed'; this.onDecoded?.(); });
  }
  onDecoded: (() => void) | null = null;
  /** true once a picture is in the chip */
  has(key: string): boolean { const t = this.texs.get(key); return !!t && t.state === 'ready' && !!t.tex; }
  failed(key: string): boolean { return this.texs.get(key)?.state === 'failed'; }
  /** decoded pictures still waiting to go into the chip */
  pending(): number { let n = 0; for (const t of this.texs.values()) if (t.state === 'decoded' && (t.want || !t.ahead)) n++; return n; }
  /** build 12E: pictures still to read or decode ahead (frames go on while the page is still, one step each) */
  aheadWork(): boolean {
    if (!World.PIXELS || this.warmFailed) return false;
    for (const t of this.texs.values()) if ((t.want || t.ahead) && (t.state === 'none' || t.state === 'loading' || (t.state === 'decoded' && !t.px && !t.tex && t.row === 0))) return true;
    return false;
  }
  /** Build 12E (WebKit only): decodes one picture into plain pixels (about 20 ms in the simulator, the decode Safari
   *  would otherwise do at the picture's first rows, 29 to 36 ms, and then 7 ms a strip). The most wanted first; a picture
   *  asked for only ahead (the scene after) only while the page has been still for a second (`idle`). film3d.ts calls it
   *  once a frame and puts nothing into the chip in a frame that decoded; while the film moves, only a picture of a scene
   *  on screen that is not drawn yet (`only`). Returns true when it decoded one. */
  private canvas2d: HTMLCanvasElement | null = null;
  private warmFailed = false;
  private lastWarm = -1e9;
  warm(idle: boolean, only: Set<string> | null = null): boolean {
    if (!World.PIXELS || this.lost || this.warmFailed) return false;
    // (the page may run its frame more than once in one of the browser's frames: never two pictures decoded, or a
    // picture decoded and rows put into the chip, within one frame's time)
    const now = performance.now();
    if (now - this.lastWarm < 40 || now - this.lastUpload < 16) return false;
    const t = [...this.texs.values()].filter((x) => x.state === 'decoded' && (x.want || (x.ahead && idle)) && (!only || only.has(x.key)) && !x.px && x.row === 0 && !x.tex && x.strips[0]).sort((a, b) => a.rank - b.rank)[0];
    if (!t) return false;
    const [W, H] = t.size, bm = t.strips[0];
    try {
      // a canvas read on the processor (willReadFrequently): drawing the picture decodes it, getImageData hands its pixels
      // back as they are (the pictures are opaque sRGB: nothing to convert or unpremultiply)
      const c = this.canvas2d ?? (this.canvas2d = document.createElement('canvas'));
      if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
      const ctx = c.getContext('2d', { willReadFrequently: true, alpha: false });
      if (!ctx) { this.warmFailed = true; return false; }
      ctx.drawImage(bm, 0, 0);
      const d = ctx.getImageData(0, 0, W, H).data;
      t.px = new Uint8Array(d.buffer, d.byteOffset, d.byteLength);
      this.lastWarm = performance.now();
      bm.close(); t.strips = [];
      // (the canvas keeps no copy: made 1 x 1 again)
      c.width = 1; c.height = 1;
    } catch { this.warmFailed = true; return false; }
    return true;
  }
  /** Puts up to `max` decoded pictures into the chip (the most wanted first), and lets go of the least used ones over
   *  the budget. Returns how many went in. */
  upload(max: number, keep: Set<string>, still = true): number {
    if (this.lost) return 0;
    const gl = this.gl;
    // one picture at a time, in strips of rows, one strip a call (a whole 2880 x 1800 picture took 20 to 24 ms of the
    // page's time at a fourth of a laptop's speed; a strip takes a quarter of that)
    let t = [...this.texs.values()].find((x) => x.state === 'decoded' && x.row > 0);
    // (not a picture asked for only to be decoded ahead; in WebKit only one already decoded into pixels, see warm())
    const px = World.PIXELS && !this.warmFailed;
    if (!t) t = [...this.texs.values()].filter((x) => x.state === 'decoded' && (x.want || !x.ahead) && (!px || x.px)).sort((a, b) => b.used - a.used)[0];
    let n = 0;
    const t0 = performance.now();
    // never two calls within one frame's time (Safari ran several in one long frame), and never more than about 4 ms
    if (t && (t0 - this.lastUpload < 12 || t0 - this.lastWarm < 16)) t = undefined;
    for (let k = 0; t && k < max && (k === 0 || performance.now() - t0 < 4); k++) {
      const [W, H] = t.size;
      if (t.mipDue && t.tex) {
        // build 12G: its smaller copies, made by the chip from the whole picture, alone in this call (a frame after its
        // last rows); only then is the picture drawn, and read through them
        gl.bindTexture(gl.TEXTURE_2D, t.tex);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        if (this.aniso && this.anisoN > 1) gl.texParameterf(gl.TEXTURE_2D, this.aniso.TEXTURE_MAX_ANISOTROPY_EXT, this.anisoN);
        t.mipDue = false; t.state = 'ready'; t.row = 0;
        n++;
        this.lastUpload = performance.now();
        break;
      }
      if (!t.tex) {
        // a texture let go of earlier, of the same size, if there is one (no new memory, nothing to wait for)
        const k = W + 'x' + H, spare = this.spare.get(k)?.pop();
        t.tex = spare ?? gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, t.tex);
        if (!spare) {
          // (build 12G: with room for its smaller copies, made once every row is in)
          const lv = levelsOf(W, H);
          gl.texStorage2D(gl.TEXTURE_2D, lv, gl.RGBA8, W, H);
          // cleared once by the chip (Firefox otherwise clears it itself before the first rows go in, and warns), every level
          if (!this.clearFb) this.clearFb = gl.createFramebuffer();
          gl.bindFramebuffer(gl.FRAMEBUFFER, this.clearFb);
          gl.clearColor(0, 0, 0, 1); gl.disable(gl.SCISSOR_TEST);
          for (let l = 0; l < lv; l++) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t.tex, l);
            gl.clear(gl.COLOR_BUFFER_BIT);
          }
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        else this.spareBytes -= bytesOf(W, H);
        // (the base level alone until the smaller copies are made)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        t.bytes = bytesOf(W, H);
        this.held += t.bytes;
        t.row = 0;
        // the new memory alone this frame (a phone's chip took 25 ms to make it), the rows from the next
        if (!spare) { n++; this.lastUpload = performance.now(); break; }
      }
      // about a megabyte a call (a quarter of a 2880 x 1800 picture took 20 ms of the page's time at a fourth of a
      // laptop's speed)
      // (plain pixels go in at about a millisecond a megabyte: four times the rows a call)
      const bm = t.strips[0], rows = Math.min(H - t.row, Math.max(32, Math.floor(((t.px ? 4 : 1) * this.stripBytes) / (W * 4))));
      gl.bindTexture(gl.TEXTURE_2D, t.tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
      if (t.px) gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, t.row, W, rows, gl.RGBA, gl.UNSIGNED_BYTE, t.px, t.row * W * 4);
      else {
        gl.pixelStorei(gl.UNPACK_SKIP_ROWS, t.row);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, t.row, W, rows, gl.RGBA, gl.UNSIGNED_BYTE, bm);
        gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 0);
      }
      t.row += rows;
      n++;
      this.lastUpload = performance.now();
      if (t.row >= H) {
        bm?.close(); t.strips = []; t.px = null;
        // (build 12G: ready once its smaller copies are made, in the next call)
        t.mipDue = true;
        // read once now, by a draw nobody sees, so the chip has it before the first frame that shows it (a browser
        // may send a picture to the chip only when it is first drawn with: a stop in the middle of a scene change)
        // its small soft copy, made by the chip from it (which also reads it into the chip before its first frame), from
        // its base level as before the smaller copies
        this.shrink(t);
        break;
      }
    }
    // over the budget: let go of the least used, never one still wanted
    // (while the film moves, only past one and a half times the budget: a long fast scroll must not pile them up)
    if ((still && this.held > this.budget) || this.held > 1.5 * this.budget) {
      const old = [...this.texs.values()].filter((x) => x.state === 'ready' && !keep.has(x.key)).sort((a, b) => a.used - b.used);
      for (const x of old) { if (this.held <= this.budget) break; this.drop(x); this.texs.delete(x.key); }
    }
    return n;
  }
  private drop(t: Tex): void {
    // kept as a spare for the next picture of the same size: a texture deleted (or a new one made) while the film moves
    // made Safari wait 100 to 180 ms for the chip
    if (t.tex && !this.lost) {
      const k = t.size[0] + 'x' + t.size[1], list = this.spare.get(k) ?? [];
      list.push(t.tex); this.spare.set(k, list); this.spareBytes += t.bytes;
      // (a spare goes back to its base level alone until its next picture's copies are made)
      this.gl.bindTexture(this.gl.TEXTURE_2D, t.tex); this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    }
    if (t.tex) this.held -= t.bytes;
    t.row = 0;
    for (const x of t.strips) x.close();
    if (t.small && !this.lost) this.gl.deleteTexture(t.small);
    t.tex = null; t.small = null; t.strips = []; t.px = null; t.state = 'none'; t.mipDue = false;
  }

  /* ---------- depth maps: what each still's camera saw ---------- */
  private depthKey(p: Projector): string {
    // the stills of one scene share one depth map, unless a thing stood elsewhere (scene 2's phone)
    return p.scene + ':' + [...p.poses.entries()].map(([n, m]) => (m ? n + (n === 'menu' ? p.pass : '') : '')).join(',');
  }
  private depthOf(p: Projector): DepthMap {
    const k = this.depthKey(p);
    let d = this.depth.get(k);
    if (d) return d;
    const gl = this.gl, long = this.depthLong, w = p.w >= p.h ? long : Math.round((long * p.w) / p.h), h = p.w >= p.h ? Math.round((long * p.h) / p.w) : long;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    for (const [a, v] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, a, v);
    // one depth buffer for every map of a size (it is needed only while a map is drawn)
    let rb = this.depthRb.get(w + 'x' + h);
    if (!rb) {
      rb = gl.createRenderbuffer()!;
      gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, w, h);
      this.depthRb.set(w + 'x' + h, rb);
    }
    const fb = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);
    gl.viewport(0, 0, w, h);
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE);
    gl.useProgram(this.progD);
    gl.uniform1f(this.uni(this.progD, this.uD, 'uDepthFar'), p.far);
    for (const th of this.things) {
      if (th.name === 'floor') continue;
      const m = p.poses.get(th.name);
      if (!m) continue;
      for (const dr of th.draws) {
        const mesh = this.meshes.get(dr.part);
        if (!mesh) continue;
        gl.uniformMatrix4fv(this.uni(this.progD, this.uD, 'uPM'), false, mul(p.VP, mul(m, dr.local)));
        gl.bindVertexArray(mesh.vao);
        gl.drawElements(gl.TRIANGLES, mesh.count, mesh.type, 0);
      }
    }
    gl.bindVertexArray(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    d = { fb, tex, w, h };
    this.depth.set(k, d);
    return d;
  }
  /** Builds the depth map of the first of these stills that has none yet (one a call: a new one takes new memory).
   *  Returns true when it built one. */
  prepare(keys: string[]): boolean {
    if (this.lost || !this.layout || !this.ready()) return false;
    for (const k of keys) {
      const p = this.layout.projectors.get(k);
      if (!p || this.depth.has(this.depthKey(p))) continue;
      this.depthOf(p);
      return true;
    }
    return false;
  }
  private dropDepth(d: DepthMap): void {
    if (this.lost) return;
    this.gl.deleteFramebuffer(d.fb); this.gl.deleteTexture(d.tex);
  }
  private depthRb = new Map<string, WebGLRenderbuffer>();

  /** where a world point lands on screen with this camera (CSS px), or null behind it */
  project(state: { vw: number; vh: number; cam: CamState }, p: V3): [number, number] | null {
    const VP = this.camVP(state);
    const c = [0, 0, 0, 0];
    for (let r = 0; r < 4; r++) c[r] = VP[r] * p[0] + VP[4 + r] * p[1] + VP[8 + r] * p[2] + VP[12 + r];
    if (c[3] <= 1e-6) return null;
    return [((c[0] / c[3]) * 0.5 + 0.5) * state.vw, (1 - ((c[1] / c[3]) * 0.5 + 0.5)) * state.vh];
  }
  camVP(state: { vw: number; vh: number; cam: CamState }): M4 {
    const { cam, vw, vh } = state, n = 20, f = 20000;
    const P = frustum((-cam.cx / cam.fpx) * n, ((vw - cam.cx) / cam.fpx) * n, (-(vh - cam.cy) / cam.fpx) * n, (cam.cy / cam.fpx) * n, n, f);
    return mul(P, lookAt(cam.eye, cam.target));
  }
  /** each thing's pose now (scene 2's phone at its lift) */
  thingPose(name: ThingName, lift: number): M4 {
    const L = this.layout!;
    if (name === 'menu') return menuPose(L, lift);
    return L.pose[name as Exclude<ThingName, 'menu'>];
  }

  /** Draws one frame. Returns false when it could not (no context, a picture missing). */
  draw(st: FrameState, fgCtx: CanvasRenderingContext2D | null): boolean {
    if (this.lost || !this.layout || !this.ready()) return false;
    const gl = this.gl, L = this.layout;
    const W = Math.max(1, Math.round(st.vw * st.pr)), H = Math.max(1, Math.round(st.vh * st.pr));
    if (this.canvas.width !== W || this.canvas.height !== H) { this.canvas.width = W; this.canvas.height = H; }
    const VP = this.camVP(st);
    // the passes of each slot, and their projectors and pictures (a slot without its pictures cannot be drawn)
    const slots = st.slots.slice(0, SLOTS);
    const proj: (Projector | null)[] = [];
    for (let s = 0; s < SLOTS; s++) for (let k = 0; k < PASSES; k++) {
      const ps = slots[s]?.passes[k];
      const p = ps ? L.projectors.get(ps.key) ?? null : null;
      if (ps && (!p || !this.has(ps.key))) return false;
      proj.push(p);
    }
    const depthMaps = proj.map((p) => (p ? this.depthOf(p) : null));
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, W, H);
    gl.useProgram(this.progW);
    const u = (n: string) => this.uni(this.progW, this.uW, n);
    gl.uniformMatrix4fv(u('uVP'), false, VP);
    gl.uniform3fv(u('uEye'), st.cam.eye);
    const pe: number[] = [], np: number[] = [], w: number[] = [], sat: number[] = [], fade: number[] = [], lp: number[] = [], ld: number[] = [], lc: number[] = [], li: number[] = [], lk: number[] = [], lf: number[] = [];
    const keys: (Projector['light'] | null)[] = [];
    for (let s = 0; s < SLOTS; s++) {
      const sl = slots[s], p0 = proj[s * PASSES];
      np.push(sl && p0 ? sl.passes.length : 0);
      w.push(sl ? sl.W : 0);
      sat.push(sl ? sl.sat : 1);
      fade.push(...(sl?.fade ?? [0, 0, 0, 0]));
      pe.push(...(p0 ? p0.eye : [0, 0, 0]));
      // the live light: the key of the strongest pass shown
      let best = p0;
      if (sl) sl.passes.forEach((ps, k) => { if (k > 0 && ps.t >= 0.5 && proj[s * PASSES + k]) best = proj[s * PASSES + k]; });
      const l = best?.light;
      // the spot that travels: the strongest spot pass shown, else the scene's first spot (scene 3 lights its first
      // pass with a soft panel)
      let spot: Projector | null = null;
      if (sl) sl.passes.forEach((ps, k) => { const pk = proj[s * PASSES + k]; if (pk && pk.light.kind === 0 && (!spot || ps.t >= 0.5)) spot = pk; });
      keys.push(spot ? (spot as Projector).light : null);
      lp.push(...(l ? l.pos : [0, 1000, 0])); ld.push(...(l ? l.dir : [0, -1, 0])); lc.push(...(l ? l.cos : [0, 1])); li.push(l ? l.int : 0); lk.push(l ? l.kind : 0);
      lf.push(...(l?.flag ? l.flag.flat() : [0, 0, 0, 0, 0, 0, 0, 0, 0]));
    }
    gl.uniform3fv(u('uPE[0]'), pe);
    gl.uniform1iv(u('uNP[0]'), np);
    gl.uniform1fv(u('uW[0]'), w);
    // at a still's own camera (a rest) the frame is the still, with no visibility test; it comes in over the first
    // few mm the camera moves away
    // (not for a still whose phone stood elsewhere than it stands now: scene 2's phone while it lifts)
    gl.uniform1fv(u('uNear[0]'), proj.map((p, i) => {
      if (!p) return 0;
      const m = p.poses.get('menu');
      if (m && Math.abs((p === L.projectors.get(slots[Math.floor(i / PASSES)]?.passes[2]?.key ?? '') ? 1 : 0) - st.lift) > 1e-4) return 0;
      const e = p.eye, d = Math.hypot(st.cam.eye[0] - e[0], st.cam.eye[1] - e[1], st.cam.eye[2] - e[2]), x = Math.min(1, Math.max(0, (d - 1) / 24));
      return 1 - x * x * (3 - 2 * x);
    }));
    gl.uniform1f(u('uHoldOn'), st.hold ? 1 : 0);
    gl.uniform1fv(u('uSat[0]'), sat);
    gl.uniform4fv(u('uFade[0]'), fade);
    gl.uniform3fv(u('uSides[0]'), slots.flatMap((sl) => sl.sides ?? [0, 0, 0]).concat(slots.length < 2 ? [0, 0, 0] : []).slice(0, 6));
    gl.uniform1f(u('uPr'), st.pr);
    gl.uniform2f(u('uRes'), W, H);
    gl.uniform3fv(u('uLp[0]'), lp); gl.uniform3fv(u('uLd[0]'), ld); gl.uniform2fv(u('uLc[0]'), lc); gl.uniform1fv(u('uLi[0]'), li); gl.uniform1fv(u('uLk[0]'), lk);
    gl.uniform3fv(u('uLf[0]'), lf);
    // the floor's light between two scenes: one spot travelling from the first scene's key to the second's, as far as
    // the second scene's still has come in (two spots only; a soft panel does not travel)
    const [ka, kb] = keys, wa = slots[0]?.W ?? 0, wb = slots[1]?.W ?? 0, tm = wa + wb > 0 ? wb / (wa + wb) : 0;
    if (ka && kb && ka.kind === 0 && kb.kind === 0 && tm > 1e-4 && tm < 1 - 1e-4) {
      const lerp = (a: number, b: number) => a + (b - a) * tm;
      const d: V3 = [lerp(ka.dir[0], kb.dir[0]), lerp(ka.dir[1], kb.dir[1]), lerp(ka.dir[2], kb.dir[2])], dn = Math.hypot(...d) || 1;
      gl.uniform3f(u('uMp'), lerp(ka.pos[0], kb.pos[0]), lerp(ka.pos[1], kb.pos[1]), lerp(ka.pos[2], kb.pos[2]));
      gl.uniform3f(u('uMd'), d[0] / dn, d[1] / dn, d[2] / dn);
      // (its pool on the empty floor opens on the way, up to three times as wide half way, so it spans the floor between
      // the two things, as a light pulled back while it travels)
      const open = 1 + 2 * Math.sin(Math.PI * tm), cone = (c: number) => Math.cos(Math.min(1.2, Math.acos(c) * open));
      gl.uniform2f(u('uMc'), lerp(ka.cos[0], kb.cos[0]), lerp(ka.cos[1], kb.cos[1]));
      gl.uniform2f(u('uMw'), cone(lerp(ka.cos[0], kb.cos[0])), cone(lerp(ka.cos[1], kb.cos[1])));
      gl.uniform1f(u('uMi'), Math.exp(lerp(Math.log(ka.int), Math.log(kb.int))));
      gl.uniform1f(u('uMove'), 1);
      // the pool's middle: on the floor under the point the light aims at, travelling from the one thing to the other
      gl.uniform3f(u('uPc'), lerp(ka.aim[0], kb.aim[0]), 0, lerp(ka.aim[2], kb.aim[2]));
      gl.uniform3fv(u('uTp[0]'), [...ka.pos, ...kb.pos]); gl.uniform3fv(u('uTd[0]'), [...ka.dir, ...kb.dir]);
      gl.uniform2fv(u('uTc[0]'), [...ka.cos, ...kb.cos]); gl.uniform1fv(u('uTi[0]'), [ka.int, kb.int]);
    } else gl.uniform1f(u('uMove'), 0);
    // the glass of scene 2's lifted phone reflects what scene 2's first still shows
    const s2 = slots.findIndex((x) => x?.scene === 2), env = s2 >= 0 ? proj[s2 * PASSES] : null;
    gl.uniform1i(u('uLiveSlot'), Math.max(0, s2));
    gl.uniform1f(u('uScrPage'), st.page ?? 1);
    gl.uniformMatrix4fv(u('uEnvVP'), false, env ? env.VP : ident());
    gl.uniform1f(u('uDepthFar'), 6000);
    gl.uniform1f(u('uDbg'), this.debug);
    gl.uniform1f(u('uBias'), World.BIAS);
    const T: number[] = [], ov: number[] = [], dt: number[] = [];
    for (let i = 0; i < UNITS; i++) {
      const ps = slots[Math.floor(i / PASSES)]?.passes[i % PASSES], p = proj[i];
      T.push(ps ? ps.t : 0);
      // the growing oval is in the picture's logical pixels (1440 x 900, 786 x 1704: src/main.ts), whatever size the
      // still was drawn at (scene 6's third pass was drawn at twice that: build 12D found its oval at half its place,
      // the phone's pad drawn before the phone lit)
      const lw = L.form === 'phone' ? 786 : 1440, lh = L.form === 'phone' ? 1704 : 900;
      if (ps?.oval && p) ov.push(ps.oval[0] / lw, ps.oval[1] / lh, ps.oval[2] / lw, ps.oval[3] / lh); else ov.push(0, 0, 0, 0);
      const d = depthMaps[i];
      dt.push(d ? 1 / d.w : 0, d ? 1 / d.h : 0);
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, ps && p ? this.texs.get(ps.key)!.tex : this.blank);
      gl.uniform1i(u('uC' + i), i);
      gl.activeTexture(gl.TEXTURE0 + UNITS + i);
      gl.bindTexture(gl.TEXTURE_2D, d ? d.tex : this.blank);
      gl.uniform1i(u('uD' + i), UNITS + i);
    }
    gl.activeTexture(gl.TEXTURE0 + 2 * UNITS);
    gl.bindTexture(gl.TEXTURE_2D, this.coinTex);
    gl.uniform1i(u('uCoinMap'), 2 * UNITS);
    // scene 2's phone while it lifts: drawn live (only with its screen's picture in the chip)
    const screen = st.screen && st.menuLive > 0 && this.has(st.screen) ? this.texs.get(st.screen)!.tex : null;
    gl.activeTexture(gl.TEXTURE0 + 2 * UNITS + 1);
    gl.bindTexture(gl.TEXTURE_2D, screen ?? this.blank);
    gl.uniform1i(u('uScreen'), 2 * UNITS + 1);
    // each slot's first still, small and soft (the floor past its frame)
    for (let s = 0; s < SLOTS; s++) {
      const ps = slots[s]?.passes[0], small = ps ? this.texs.get(ps.key)?.small : null;
      gl.activeTexture(gl.TEXTURE0 + 2 * UNITS + 2 + s);
      gl.bindTexture(gl.TEXTURE_2D, small ?? this.blank);
      gl.uniform1i(u('uB' + s), 2 * UNITS + 2 + s);
    }
    gl.uniform1f(u('uScreenGain'), World.SCREEN);
    const tilesTex = st.tiles && this.has(st.tiles) ? this.texs.get(st.tiles)!.tex : null;
    // (it shares the coin's unit: a phone's chip may have only 16, all others taken; a tile is never the coin)
    let unit12: WebGLTexture | null = this.coinTex;
    const menuK = screen ? st.menuLive : 0;
    gl.uniform1fv(u('uT[0]'), T);
    gl.uniform4fv(u('uOv[0]'), ov);
    gl.uniform2fv(u('uDT[0]'), dt);
    gl.enable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE);
    // which things show: those of a scene on screen (the floor always)
    const scenesOn = new Set(slots.filter((s) => s.W > 0).map((s) => s.scene));
    const drawThings = (only: ((t: Thing) => boolean) | null) => {
      // build 12G: scene 2's phone last, laid over what is drawn behind it by how much of it the stills show
      for (const th of [...this.things.filter((x) => x.name !== 'menu'), ...this.things.filter((x) => x.name === 'menu')]) {
        if (!th.scenes.some((n) => scenesOn.has(n))) continue;
        if (only && !only(th)) continue;
        const menu = th.name === 'menu';
        gl.uniform1f(u('uMenu'), menu ? 1 : 0);
        if (menu) { gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); } else gl.disable(gl.BLEND);
        const model = this.thingPose(th.name, st.lift);
        for (const dr of th.draws) {
          const mesh = this.meshes.get(dr.part);
          if (!mesh) continue;
          const M = mul(model, dr.local);
          gl.uniformMatrix4fv(u('uModel'), false, M);
          const pm: number[] = [], mp: number[] = [], pres: number[] = [];
          for (let i = 0; i < UNITS; i++) {
            const p = proj[i];
            const at = p ? p.poses.get(th.name) : null;
            // in the still: its pose then; not in it: where it is now (so the still shows what lay behind it)
            const Mi = at ? mul(at, dr.local) : M;
            pm.push(...(p ? mul(p.VP, Mi) : ident()));
            mp.push(...Mi);
            pres.push(at ? 1 : 0);
          }
          gl.uniformMatrix4fv(u('uPM[0]'), false, pm);
          gl.uniformMatrix4fv(u('uMP[0]'), false, mp);
          gl.uniform1fv(u('uPres[0]'), pres);
          // does each slot's scene hold this thing (any of its stills)
          gl.uniform1fv(u('uHold[0]'), [0, 1].map((s) => (proj.slice(s * PASSES, s * PASSES + PASSES).some((p) => p?.poses.get(th.name)) || th.name === 'floor' ? 1 : 0)));
          gl.uniform1f(u('uLiveK'), th.name === 'menu' && s2 >= 0 ? menuK : 0);
          gl.uniform1f(u('uTol'), TOL[th.name]);
          gl.uniform1f(u('uFgA'), st.fgA?.[th.name] ?? 1);
          gl.uniform1f(u('uIsFloor'), th.name === 'floor' ? 1 : 0);
          // a thing that stands in the world the whole film (scene 2's phone is there in scene 2 only)
          gl.uniform1f(u('uSolid'), th.name === 'menu' || th.name === 'floor' ? 0 : 1);
          gl.uniform1i(u('uPart'), dr.part === 'phone_display' ? 2 : dr.part === 'phone_glass' ? 1 : 0);
          gl.uniform1f(u('uTile'), dr.tile !== undefined && tilesTex ? dr.tile : -1);
          const want12 = dr.tile !== undefined && tilesTex ? tilesTex : this.coinTex;
          if (want12 !== unit12) { gl.activeTexture(gl.TEXTURE0 + 2 * UNITS); gl.bindTexture(gl.TEXTURE_2D, want12); unit12 = want12; }
          gl.uniform3fv(u('uAlb'), dr.mat.alb); gl.uniform1f(u('uRough'), dr.mat.rough); gl.uniform1f(u('uMetal'), dr.mat.metal); gl.uniform1f(u('uMap'), dr.mat.map ? 1 : 0);
          gl.bindVertexArray(mesh.vao);
          gl.drawElements(gl.TRIANGLES, mesh.count, mesh.type, 0);
        }
      }
      gl.disable(gl.BLEND);
    };
    // 1. the things that stand in front of the giant words, alone, copied into the page layer above the words
    if (st.fg && fgCtx) {
      const [x, y, fw, fh] = st.fg;
      const sx = Math.max(0, Math.floor(x * st.pr)), sy = Math.max(0, Math.floor(y * st.pr));
      const sw = Math.min(W - sx, Math.ceil(fw * st.pr)), sh = Math.min(H - sy, Math.ceil(fh * st.pr));
      if (sw > 0 && sh > 0) {
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(sx, H - sy - sh, sw, sh);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        const front = new Set(slots.filter((s) => s.W > 0).map((s) => s.scene));
        // the dark band at the foot, as the page lays it over the live picture (this copy is above it)
        const band = st.shade.slice(0, 2);
        gl.uniform4fv(u('uShade[0]'), [0, 1].flatMap((i) => (band[i] ? [band[i][0], band[i][1], band[i][2], band[i][1] < 0.15 ? 0.45 : 0.6] : [0, 0, 1, 0])));
        gl.uniform1f(u('uFgH'), H);
        gl.uniform1f(u('uFg'), 1);
        drawThings((t) => t.fg.some((n) => front.has(n)));
        gl.uniform1f(u('uFg'), 0);
        gl.disable(gl.SCISSOR_TEST);
        // the copy is the size of the live picture, made once (a canvas sized again on every frame stalls the page)
        const c = fgCtx.canvas;
        if (c.width !== W || c.height !== H) { c.width = W; c.height = H; this.fgAt = null; }
        if (this.fgAt) fgCtx.clearRect(...this.fgAt);
        fgCtx.drawImage(this.canvas, sx, sy, sw, sh, sx, sy, sw, sh);
        this.fgAt = [sx, sy, sw, sh];
      }
    }
    // 2. the whole world
    gl.clearColor(1 / 255, 1 / 255, 1 / 255, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawThings(null);
    gl.bindVertexArray(null);
    // send the work now: a context left with its work queued stalls the next frame that shows it (look 11's stall)
    gl.flush();
    return true;
  }

  /** textures let go of, by size, for the next picture of that size */
  private spare = new Map<string, WebGLTexture[]>();
  private spareBytes = 0;
  /** While the page is still: spares beyond two of a size are deleted (never while the film moves). */
  tidy(): void {
    if (this.lost) return;
    for (const [k, list] of this.spare) while (list.length > 2) { const [w, h] = k.split('x').map(Number); this.gl.deleteTexture(list.shift()!); this.spareBytes -= bytesOf(w, h); }
  }
  private clearFb: WebGLFramebuffer | null = null;
  private shrinkProg: WebGLProgram | null = null;
  private shrinkVao: WebGLVertexArrayObject | null = null;
  private shrinkFb: WebGLFramebuffer | null = null;
  /** The picture's small soft copy: each texel the average of 16 bilinear taps over its cell (a box of about 64 of the
   *  picture's pixels, a blur once drawn with a linear filter at this size). */
  private shrink(t: Tex): void {
    const [W, H] = t.size, L = 128;
    const sw = W >= H ? L : Math.max(8, Math.round((L * W) / H)), sh = W >= H ? Math.max(8, Math.round((L * H) / W)) : L;
    t.small = this.shrinkTo(t.tex!, sw, sh, null);
  }
  private shrinkInit(): void {
    const gl = this.gl;
    if (!this.shrinkProg) {
      const p = gl.createProgram()!;
      const add = (type: number, src: string) => { const x = gl.createShader(type)!; gl.shaderSource(x, src); gl.compileShader(x); gl.attachShader(p, x); };
      add(gl.VERTEX_SHADER, '#version 300 es\nin vec2 a;\nvoid main(){ gl_Position = vec4(a, 0.0, 1.0); }');
      add(gl.FRAGMENT_SHADER, '#version 300 es\nprecision highp float; uniform sampler2D t; uniform vec2 n; out vec4 o;\n'
        + 'void main(){ vec4 c = vec4(0.0); for (int i = 0; i < 4; i++) for (int j = 0; j < 4; j++) c += texture(t, (gl_FragCoord.xy + (vec2(float(i), float(j)) + 0.5) / 4.0 - 0.5) / n); o = c / 16.0; }');
      gl.bindAttribLocation(p, 0, 'a');
      gl.linkProgram(p);
      this.shrinkProg = p;
      this.shrinkVao = gl.createVertexArray();
      gl.bindVertexArray(this.shrinkVao);
      const vb = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);
      this.shrinkFb = gl.createFramebuffer();
    }
  }
  /** draws a texture small and soft into a new texture of sw x sh (or into the given one) */
  private shrinkTo(src: WebGLTexture, sw: number, sh: number, into: WebGLTexture | null): WebGLTexture {
    const gl = this.gl;
    this.shrinkInit();
    const small = into ?? gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, small);
    if (!into) {
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, sw, sh);
      for (const [a, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, a, v);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.shrinkFb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, small, 0);
    gl.viewport(0, 0, sw, sh);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.SCISSOR_TEST); gl.disable(gl.BLEND);
    gl.useProgram(this.shrinkProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, src);
    gl.uniform1i(gl.getUniformLocation(this.shrinkProg!, 't'), 0);
    gl.uniform2f(gl.getUniformLocation(this.shrinkProg!, 'n'), sw, sh);
    gl.bindVertexArray(this.shrinkVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.flush();
    if (src === this.blank) { gl.deleteTexture(small); }
    return small;
  }

  /** The world's program drawn once (a draw nothing sees), in the state the frames draw with, so the first frame the
   *  scroll asks for does not stop for its pipeline (Safari took 78 to 113 ms). */
  private warmWorld(): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, 1, 1);
    gl.enable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE); gl.disable(gl.SCISSOR_TEST);
    gl.useProgram(this.progW);
    for (let i = 0; i < 2 * UNITS + 4; i++) { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, this.blank); }
    for (const [name, m] of this.meshes) {
      if (name === 'floor' || name === 'room') continue;
      gl.bindVertexArray(m.vao);
      gl.drawElements(gl.TRIANGLES, Math.min(m.count, 3), m.type, 0);
    }
    gl.bindVertexArray(null);
    gl.flush();
  }
  /** The depth maps' program drawn once, into a target of their kind (colour and depth). */
  private warmDepth(): void {
    const gl = this.gl;
    const tex = gl.createTexture()!, rb = gl.createRenderbuffer()!, fb = gl.createFramebuffer()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 4, 4, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, 4, 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);
    gl.viewport(0, 0, 4, 4);
    gl.enable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE); gl.disable(gl.SCISSOR_TEST);
    gl.useProgram(this.progD);
    gl.bindVertexArray(this.meshes.get('tile')!.vao);
    gl.drawElements(gl.TRIANGLES, 3, this.meshes.get('tile')!.type, 0);
    gl.bindVertexArray(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(fb); gl.deleteRenderbuffer(rb); gl.deleteTexture(tex);
    gl.flush();
  }
  /** how long the chip takes to finish what was asked of it (ms) */
  finish(): number {
    // a pixel read back waits for every drawing before it (a browser may answer finish() at once)
    const t = performance.now();
    if (!this.lost) this.gl.readPixels(0, 0, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.px);
    return performance.now() - t;
  }
  private px = new Uint8Array(4);
  private fgAt: [number, number, number, number] | null = null;

  dispose(): void {
    for (const t of this.texs.values()) this.drop(t);
    this.texs.clear();
    try { this.gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* gone */ }
  }
}
