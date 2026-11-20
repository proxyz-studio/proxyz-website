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
interface Light { kind: 'spot' | 'panel'; pos: V3; aim: V3; cone?: number; pen?: number; int: number }
interface Shot { obj: string; cam: Cam; light: Light; phone?: { pos?: V3; rot?: V3; floor?: V3 } | null; trio?: number[] }
const SHOTS = (shotsData as unknown as { pictures: Record<string, Shot> }).pictures;

const dirFrom = (az: number, el: number): V3 => [Math.sin(az * DEG) * Math.cos(el * DEG), Math.sin(el * DEG), Math.cos(az * DEG) * Math.cos(el * DEG)];
const add = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];

/** where scene 3's race piece stands in the world (scene 6 does not hold it), per shape: x, z, turn */
const TROPHY: Record<Form, [number, number, number]> = { desktop: [-250, -40, 8], phone: [-230, -20, 8] };
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
}

/* ---------- shapes ---------- */
interface Part { name: string; P: Float32Array; N: Float32Array; I: Uint32Array | Uint16Array }
async function loadParts(): Promise<{ parts: Map<string, Part>; coinMap: { n: number; rgba: Uint8Array } }> {
  const res = await fetch(worldUrl);
  if (!res.ok || !res.body) throw new Error('world');
  const buf = await new Response(res.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  const n = new DataView(buf).getUint32(0, true);
  const head = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 4, n))) as {
    parts: { name: string; v: number; i: number; min: number[]; max: number[]; i32: boolean }[]; coin: { n: number; r: number; hmax: number };
  };
  let o = 4 + n;
  o += (4 - (o % 4)) % 4;
  const out = new Map<string, Part>();
  for (const p of head.parts) {
    const q = new Uint16Array(buf, o, p.v * 3); o += p.v * 6;
    const nb = new Int8Array(buf, o, p.v * 3); o += p.v * 3; o += (4 - (o % 4)) % 4;
    const ib = p.i32 ? new Uint32Array(buf, o, p.i) : new Uint16Array(buf, o, p.i);
    o += ib.byteLength; o += (4 - (o % 4)) % 4;
    const P = new Float32Array(p.v * 3), N = new Float32Array(p.v * 3), last = [0, 0, 0];
    for (let i = 0; i < P.length; i++) {
      const k = i % 3, v = (last[k] + q[i]) & 0xffff;
      last[k] = v;
      P[i] = p.min[k] + (v / 65535) * (p.max[k] - p.min[k]);
      N[i] = nb[i] / 127;
    }
    const I = p.v > 65535 ? new Uint32Array(p.i) : new Uint16Array(p.i);
    for (let k = 0, prev = 0; k < p.i; k++) { const z = ib[k], d = z & 1 ? -(z + 1) / 2 : z / 2; prev += d; I[k] = prev; }
    out.set(p.name, { name: p.name, P, N, I });
  }
  // the coin: its height field as a disc of rings (exact round rim), and its outer wall
  const { n: G, r: R, hmax } = head.coin, hq = new Uint16Array(buf, o, G * G), H = new Float32Array(G * G);
  for (let k = 0, prev = 0; k < hq.length; k++) { prev = (prev + hq[k]) & 0xffff; H[k] = (prev / 65535) * hmax; }
  // the coin's own colours where no still saw it: the spools of the print (ptDark.ts LINES_MAT), linear
  const part = new Uint8Array(buf, o + G * G * 2, G * G), COL = [[2, 2, 2], [66, 69, 62], [5, 20, 190], [237, 4, 4]];
  const rgba = new Uint8Array(G * G * 4);
  for (let k = 0; k < part.length; k++) rgba.set([...COL[part[k]], 255], k * 4);
  const hAt = (x: number, z: number) => {
    const fx = ((x + R) / (2 * R)) * (G - 1), fz = ((z + R) / (2 * R)) * (G - 1);
    const i = Math.max(0, Math.min(G - 2, Math.floor(fx))), j = Math.max(0, Math.min(G - 2, Math.floor(fz))), u = fx - i, v = fz - j;
    return H[j * G + i] * (1 - u) * (1 - v) + H[j * G + i + 1] * u * (1 - v) + H[(j + 1) * G + i] * (1 - u) * v + H[(j + 1) * G + i + 1] * u * v;
  };
  const RINGS = 150, SEG = 560, pos: number[] = [], idx: number[] = [];
  pos.push(0, hAt(0, 0), 0);
  for (let r = 1; r <= RINGS; r++) {
    const rr = (R * r) / RINGS;
    for (let s = 0; s < SEG; s++) { const a = (s / SEG) * Math.PI * 2, x = rr * Math.cos(a), z = rr * Math.sin(a); pos.push(x, hAt(x * 0.999, z * 0.999), z); }
  }
  const ring = (r: number, s: number) => (r === 0 ? 0 : 1 + (r - 1) * SEG + (s % SEG));
  for (let s = 0; s < SEG; s++) idx.push(0, ring(1, s + 1), ring(1, s));
  for (let r = 1; r < RINGS; r++) for (let s = 0; s < SEG; s++) idx.push(ring(r, s), ring(r, s + 1), ring(r + 1, s), ring(r, s + 1), ring(r + 1, s + 1), ring(r + 1, s));
  // the wall: the rim ring again with its own (outward) normals, down to the floor
  const top0 = pos.length / 3;
  for (let s = 0; s < SEG; s++) { const a = (s / SEG) * Math.PI * 2, x = R * Math.cos(a), z = R * Math.sin(a); pos.push(x, pos[ring(RINGS, s) * 3 + 1], z, x, 0, z); }
  for (let s = 0; s < SEG; s++) { const a = top0 + 2 * s, b = top0 + 2 * ((s + 1) % SEG); idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const P = Float32Array.from(pos), Nn = new Float32Array(P.length);
  // normals: the top from the height field's slopes, the wall radial
  for (let k = 0; k < top0; k++) {
    const x = P[k * 3], z = P[k * 3 + 2], e = 0.35;
    const dx = (hAt(x + e, z) - hAt(x - e, z)) / (2 * e), dz = (hAt(x, z + e) - hAt(x, z - e)) / (2 * e), l = Math.hypot(dx, 1, dz);
    Nn.set([-dx / l, 1 / l, -dz / l], k * 3);
  }
  for (let k = top0; k < P.length / 3; k++) { const x = P[k * 3], z = P[k * 3 + 2], l = Math.hypot(x, z) || 1; Nn.set([x / l, 0, z / l], k * 3); }
  out.set('coin', { name: 'coin', P, N: Nn, I: Uint32Array.from(idx) });
  // the floor: one big square
  const F = 4000;
  out.set('floor', { name: 'floor', P: Float32Array.of(-F, -0.02, -F, F, -0.02, -F, F, -0.02, F, -F, -0.02, F), N: Float32Array.of(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0), I: Uint16Array.of(0, 2, 1, 0, 3, 2) });
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
};
const STAND_PARTS = ['tall_body_lod1', 'tall_accent', 'tall_web', 'plate', 'let_pro', 'let_x', 'let_y', 'let_z'];
const TILE_AT: V3[] = [[-51.9, 13.6684, 5.2229], [-17.3, 13.6684, 5.2229], [17.3, 13.6684, 5.2229], [51.9, 13.6684, 5.2229]];

type ThingName = 'stand' | 'menu' | 'trophy' | 'coin' | 'coach' | 'floor';
interface Draw { part: string; local: M4; mat: Mat }
interface Thing { name: ThingName; draws: Draw[]; /** the scenes whose stills hold it */ scenes: number[]; fg: number[] }

function things(): Thing[] {
  const stand: Draw[] = STAND_PARTS.map((p) => ({ part: p, local: ident(), mat: MATS[p] ?? MATS.black }));
  for (const t of TILE_AT) stand.push({ part: 'tile', local: mul(translate(...t), rotX(15 * DEG)), mat: MATS.black });
  const phone = (): Draw[] => ['phone_body', 'phone_glass', 'phone_display'].map((p) => ({ part: p, local: ident(), mat: MATS[p] }));
  return [
    { name: 'stand', draws: stand, scenes: [1, 2, 6], fg: [2, 6] },
    { name: 'menu', draws: phone(), scenes: [2], fg: [2] },
    { name: 'trophy', draws: [{ part: 'base', local: ident(), mat: MATS.base }, { part: 'coin', local: COIN_ON_BASE, mat: MATS.coin }], scenes: [3], fg: [3] },
    { name: 'coin', draws: [{ part: 'coin', local: ident(), mat: MATS.coin }], scenes: [4, 6], fg: [6] },
    { name: 'coach', draws: phone(), scenes: [5, 6], fg: [5, 6] },
    { name: 'floor', draws: [{ part: 'floor', local: ident(), mat: MATS.floor }], scenes: [1, 2, 3, 4, 5, 6, 7], fg: [] },
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
  light: { pos: V3; dir: V3; cos: [number, number]; int: number; kind: number };
}
export interface Layout {
  form: Form;
  /** each thing's world pose (scene 2's phone: in the stand's room, see menuPose) */
  pose: Record<Exclude<ThingName, 'menu'>, M4>;
  stand: M4;
  tap: M4; lift: M4;
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
  const L = s.light, lp = point(room, L.pos), la = point(room, L.aim);
  const dl = [la[0] - lp[0], la[1] - lp[1], la[2] - lp[2]] as V3, dn = Math.hypot(...dl);
  const cone = (L.cone ?? 90) * DEG, pen = L.pen ?? 0;
  void form;
  return {
    key, scene, pass, eye, target, VP, near, far, w: c.w, h: c.h, fpx, ppx, ppy, poses,
    light: { pos: lp, dir: [dl[0] / dn, dl[1] / dn, dl[2] / dn], cos: [Math.cos(cone), Math.cos(cone * (1 - pen))], int: L.int, kind: L.kind === 'panel' ? 1 : 0 },
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
    6: ident(), 7: ident(),
  };
  const projectors = new Map<string, Projector>();
  for (const [n, keys] of Object.entries(passes)) keys.forEach((k, i) => projectors.set(k, projectorOf(k, +n, i, rooms[+n], form, base, stand)));
  const s2 = passes[2];
  const tap = projectors.get(s2[1])?.poses.get('menu') ?? ident(), lift = projectors.get(s2[2])?.poses.get('menu') ?? ident();
  return { form, pose: base, stand, tap, lift, projectors };
}

/** Scene 2's phone between its two poses: slerp-free blend of the two matrices' parts, lifted a little in an arc. */
function menuPose(L: Layout, t: number): M4 {
  if (t <= 0) return L.tap;
  if (t >= 1) return L.lift;
  // blend position, and the turn by its three Euler angles read back from the matrices (both small and well apart)
  const ang = (m: M4): V3 => [Math.asin(Math.max(-1, Math.min(1, -m[9]))), Math.atan2(m[8], m[10]), Math.atan2(m[1], m[5])];
  const a = ang(L.tap), b = ang(L.lift), e = t;
  const r: V3 = [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e];
  const pos: V3 = [L.tap[12] + (L.lift[12] - L.tap[12]) * e, L.tap[13] + (L.lift[13] - L.tap[13]) * e + 14 * Math.sin(Math.PI * e), L.tap[14] + (L.lift[14] - L.tap[14]) * e];
  return mulAll(translate(...pos), rotY(r[1]), rotX(r[0]), rotZ(r[2]));
}

/* ---------- the drawing ---------- */
interface Mesh { vao: WebGLVertexArrayObject; count: number; type: number; bufs: WebGLBuffer[] }
interface Tex { key: string; state: 'none' | 'loading' | 'decoded' | 'ready' | 'failed'; url: string; bitmap: ImageBitmap | null; tex: WebGLTexture | null; bytes: number; used: number; row: number }
interface DepthMap { fb: WebGLFramebuffer; tex: WebGLTexture; rb: WebGLRenderbuffer; w: number; h: number }

export interface WorldEvents { lost(): void; restored(): void }

export class World {
  static EXPOSURE = 0.45;
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

  static async create(events: WorldEvents, budget: number): Promise<World> {
    const canvas = document.createElement('canvas');
    canvas.className = 'world';
    canvas.setAttribute('aria-hidden', 'true');
    // the context first: no WebGL 2, no download
    const probe = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance', depth: true, stencil: false });
    if (!probe) throw new Error('no webgl2');
    const parts = await loadParts();
    return new World(canvas, parts, events, budget);
  }

  private init(): void {
    const gl = this.canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance', depth: true, stencil: false });
    if (!gl) throw new Error('no webgl2');
    this.gl = gl;
    const compile = (vs: string, fs: string) => {
      const p = gl.createProgram()!;
      for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]] as const) {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) throw new Error('shader: ' + gl.getShaderInfoLog(s));
        gl.attachShader(p, s);
      }
      gl.bindAttribLocation(p, 0, 'aPos'); gl.bindAttribLocation(p, 1, 'aNor');
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS) && !gl.isContextLost()) throw new Error('link: ' + gl.getProgramInfoLog(p));
      return p;
    };
    this.progW = compile(WORLD_VS, WORLD_FS(World.EXPOSURE));
    this.progD = compile(DEPTH_VS, DEPTH_FS);
    this.uW.clear(); this.uD.clear();
    this.meshes.clear();
    for (const [name, p] of this.parts) {
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
    // every picture and depth map is gone with a lost context: read again when asked
    for (const t of this.texs.values()) { t.tex = null; t.row = 0; if (t.state === 'ready') t.state = 'none'; }
    this.held = 0;
    this.depth.clear();
    this.blank = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.blank);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    this.coinTex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.coinTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.coinMap.n, this.coinMap.n, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.coinMap.rgba);
    for (const [a, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, a, v);
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
    }
    this.layout = L;
  }

  /* ---------- the stills, read into the chip ---------- */
  /** Asks for these pictures (most wanted first); starts reading those not yet read. */
  want(list: { key: string; url: string }[]): void {
    const now = performance.now();
    for (const { key, url } of list) {
      let t = this.texs.get(key);
      if (t && t.url !== url && t.state !== 'loading') { this.drop(t); t = undefined; }
      if (!t) { t = { key, state: 'none', url, bitmap: null, tex: null, bytes: 0, used: now, row: 0 }; this.texs.set(key, t); }
      t.used = now;
      if (t.state === 'none') this.load(t);
    }
  }
  private load(t: Tex): void {
    t.state = 'loading';
    fetch(t.url, { credentials: 'same-origin' })
      .then((r) => { if (!r.ok) throw new Error('picture'); return r.blob(); })
      .then((b) => createImageBitmap(b, { premultiplyAlpha: 'none', colorSpaceConversion: 'default' }))
      .then((bm) => {
        if (this.texs.get(t.key) !== t) { bm.close(); return; }
        t.bitmap = bm; t.state = 'decoded';
        this.onDecoded?.();
      })
      .catch(() => { t.state = 'failed'; this.onDecoded?.(); });
  }
  onDecoded: (() => void) | null = null;
  /** true once a picture is in the chip */
  has(key: string): boolean { const t = this.texs.get(key); return !!t && t.state === 'ready' && !!t.tex; }
  failed(key: string): boolean { return this.texs.get(key)?.state === 'failed'; }
  /** decoded pictures still waiting to go into the chip */
  pending(): number { let n = 0; for (const t of this.texs.values()) if (t.state === 'decoded') n++; return n; }
  /** Puts up to `max` decoded pictures into the chip (the most wanted first), and lets go of the least used ones over
   *  the budget. Returns how many went in. */
  upload(max: number, keep: Set<string>): number {
    if (this.lost) return 0;
    const gl = this.gl;
    // one picture at a time, in strips of rows, one strip a call (a whole 2880 x 1800 picture took 20 to 24 ms of the
    // page's time at a fourth of a laptop's speed; a strip takes a quarter of that)
    let t = [...this.texs.values()].find((x) => x.state === 'decoded' && x.row > 0);
    if (!t) t = [...this.texs.values()].filter((x) => x.state === 'decoded').sort((a, b) => b.used - a.used)[0];
    let n = 0;
    for (let k = 0; t && k < max; k++) {
      const bm = t.bitmap!, W = bm.width, H = bm.height;
      if (!t.tex) {
        t.tex = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, t.tex);
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, W, H);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        t.bytes = W * H * 4;
        this.held += t.bytes;
        t.row = 0;
      }
      const rows = Math.min(H - t.row, Math.ceil(H / 4));
      gl.bindTexture(gl.TEXTURE_2D, t.tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.BROWSER_DEFAULT_WEBGL);
      gl.pixelStorei(gl.UNPACK_SKIP_ROWS, t.row);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, t.row, W, rows, gl.RGBA, gl.UNSIGNED_BYTE, bm);
      gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 0);
      t.row += rows;
      n++;
      if (t.row >= H) { bm.close(); t.bitmap = null; t.state = 'ready'; t.row = 0; break; }
    }
    // over the budget: let go of the least used, never one still wanted
    if (this.held > this.budget) {
      const old = [...this.texs.values()].filter((x) => x.state === 'ready' && !keep.has(x.key)).sort((a, b) => a.used - b.used);
      for (const x of old) { if (this.held <= this.budget) break; this.drop(x); this.texs.delete(x.key); }
    }
    return n;
  }
  private drop(t: Tex): void {
    if (t.tex && !this.lost) this.gl.deleteTexture(t.tex);
    if (t.tex) this.held -= t.bytes;
    t.row = 0;
    t.bitmap?.close();
    t.tex = null; t.bitmap = null; t.state = 'none';
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
    const gl = this.gl, long = 1024, w = p.w >= p.h ? long : Math.round((long * p.w) / p.h), h = p.w >= p.h ? Math.round((long * p.h) / p.w) : long;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    for (const [a, v] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, a, v);
    const rb = gl.createRenderbuffer()!;
    gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, w, h);
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
    d = { fb, tex, rb, w, h };
    this.depth.set(k, d);
    return d;
  }
  private dropDepth(d: DepthMap): void {
    if (this.lost) return;
    this.gl.deleteFramebuffer(d.fb); this.gl.deleteTexture(d.tex); this.gl.deleteRenderbuffer(d.rb);
  }

  /** where a world point lands on screen with this camera (CSS px), or null behind it */
  project(state: { vw: number; vh: number; cam: CamState }, p: V3): [number, number] | null {
    const VP = this.camVP(state);
    const c = [0, 0, 0, 0];
    for (let r = 0; r < 4; r++) c[r] = VP[r] * p[0] + VP[4 + r] * p[1] + VP[8 + r] * p[2] + VP[12 + r];
    if (c[3] <= 1e-6) return null;
    return [((c[0] / c[3]) * 0.5 + 0.5) * state.vw, (1 - ((c[1] / c[3]) * 0.5 + 0.5)) * state.vh];
  }
  camVP(state: { vw: number; vh: number; cam: CamState }): M4 {
    const { cam, vw, vh } = state, n = 20, f = 8000;
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
    if (this.lost || !this.layout) return false;
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
    const pe: number[] = [], np: number[] = [], w: number[] = [], sat: number[] = [], fade: number[] = [], lp: number[] = [], ld: number[] = [], lc: number[] = [], li: number[] = [], lk: number[] = [];
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
      lp.push(...(l ? l.pos : [0, 1000, 0])); ld.push(...(l ? l.dir : [0, -1, 0])); lc.push(...(l ? l.cos : [0, 1])); li.push(l ? l.int : 0); lk.push(l ? l.kind : 0);
    }
    gl.uniform3fv(u('uPE[0]'), pe);
    gl.uniform1iv(u('uNP[0]'), np);
    gl.uniform1fv(u('uW[0]'), w);
    // the visibility test erodes edges as the camera leaves each still's camera (none at a rest)
    gl.uniform1fv(u('uEr[0]'), pe.length ? [0, 1].map((s) => { const e = proj[s * PASSES]?.eye; return e ? Math.min(2, Math.hypot(st.cam.eye[0] - e[0], st.cam.eye[1] - e[1], st.cam.eye[2] - e[2]) / 15) : 0; }) : [0, 0]);
    gl.uniform1fv(u('uSat[0]'), sat);
    gl.uniform4fv(u('uFade[0]'), fade);
    gl.uniform3fv(u('uSides[0]'), slots.flatMap((sl) => sl.sides ?? [0, 0, 0]).concat(slots.length < 2 ? [0, 0, 0] : []).slice(0, 6));
    gl.uniform1f(u('uPr'), st.pr);
    gl.uniform3fv(u('uLp[0]'), lp); gl.uniform3fv(u('uLd[0]'), ld); gl.uniform2fv(u('uLc[0]'), lc); gl.uniform1fv(u('uLi[0]'), li); gl.uniform1fv(u('uLk[0]'), lk);
    gl.uniform1f(u('uDepthFar'), 6000);
    gl.uniform1f(u('uDbg'), this.debug);
    const T: number[] = [], ov: number[] = [], dt: number[] = [];
    for (let i = 0; i < UNITS; i++) {
      const ps = slots[Math.floor(i / PASSES)]?.passes[i % PASSES], p = proj[i];
      T.push(ps ? ps.t : 0);
      if (ps?.oval && p) ov.push(ps.oval[0] / p.w, ps.oval[1] / p.h, ps.oval[2] / p.w, ps.oval[3] / p.h); else ov.push(0, 0, 0, 0);
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
    gl.uniform1fv(u('uT[0]'), T);
    gl.uniform4fv(u('uOv[0]'), ov);
    gl.uniform2fv(u('uDT[0]'), dt);
    gl.enable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE);
    // which things show: those of a scene on screen (the floor always)
    const scenesOn = new Set(slots.filter((s) => s.W > 0).map((s) => s.scene));
    const drawThings = (only: ((t: Thing) => boolean) | null) => {
      for (const th of this.things) {
        if (!th.scenes.some((n) => scenesOn.has(n))) continue;
        if (only && !only(th)) continue;
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
          gl.uniform3fv(u('uAlb'), dr.mat.alb); gl.uniform1f(u('uRough'), dr.mat.rough); gl.uniform1f(u('uMetal'), dr.mat.metal); gl.uniform1f(u('uMap'), dr.mat.map ? 1 : 0);
          gl.bindVertexArray(mesh.vao);
          gl.drawElements(gl.TRIANGLES, mesh.count, mesh.type, 0);
        }
      }
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
        drawThings((t) => t.fg.some((n) => front.has(n)));
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

  /** Compiles the shaders and sends the shapes to the chip now (a draw nothing sees), so the first frame the scroll
   *  asks for does not stop for it. */
  warm(): void {
    if (this.lost) return;
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, 1, 1);
    gl.useProgram(this.progW);
    for (let i = 0; i < 2 * UNITS + 1; i++) { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, this.blank); }
    for (const [name, m] of this.meshes) {
      if (name === 'floor') continue;
      gl.bindVertexArray(m.vao);
      gl.drawElements(gl.TRIANGLES, Math.min(m.count, 3), m.type, 0);
    }
    gl.useProgram(this.progD);
    gl.bindVertexArray(this.meshes.get('tile')!.vao);
    gl.drawElements(gl.TRIANGLES, 3, this.meshes.get('tile')!.type, 0);
    gl.bindVertexArray(null);
    gl.finish();
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
