// Scene 2, version A (look 11): the stand and the phone drawn live with three.js, the camera, the light, the phone and
// the glow set from the film's playhead along src/s2/path.ts. The same scene as today's three still passes (the stills'
// stand5, /Users/tews/Code/proxyz-site-stills/pt/src/export/ptRound5.ts and ptDark.ts): the TAPZ stand's own parts,
// black plastic, the PROXYZ letters, the phone with the menu, a near black floor, one hard spot light from the left.
// Drawn only when something changed; at rest nothing is drawn.
import {
  BufferAttribute, BufferGeometry, CircleGeometry, Color, CustomToneMapping, DataTexture, Euler,
  ExtrudeGeometry, Group, LinearFilter, LinearMipmapLinearFilter, LinearSRGBColorSpace, Matrix4, Mesh, MeshStandardMaterial, NoColorSpace,
  PCFShadowMap, PerspectiveCamera, PlaneGeometry, Quaternion, RepeatWrapping, RGBAFormat, Scene,
  ShaderChunk, Shape, ShapeGeometry, SpotLight, SRGBColorSpace, Texture, UnsignedByteType, Vector2, Vector3, WebGLRenderer,
} from 'three';
import { PATH, shotAt, type Form, type Pose } from './path';
import standUrl from './stand.bin?url';
import menuUrl from './menu.webp?url';

export interface Box { left: number; top: number; w: number; h: number }
export interface Player {
  canvas: HTMLCanvasElement;
  /** draws scene 2 at s (screens from its top) into the picture box of today's still; nothing when nothing changed.
   *  Returns true when it drew. */
  draw(s: number, form: Form, box: Box, vw: number, vh: number): boolean;
  dispose(): void;
}

const DEG = Math.PI / 180;
const lin = (r: number, g: number, b: number) => new Color().setRGB(r, g, b, LinearSRGBColorSpace);
const dirFrom = (az: number, el: number) => new Vector3(Math.sin(az * DEG) * Math.cos(el * DEG), Math.sin(el * DEG), Math.cos(az * DEG) * Math.cos(el * DEG));

// the stills' camera curve: AgX, then a gentle S curve (0.35) and a touch of colour (1.08) in display space
// (ptMain.ts postProcess), so the live picture has the stills' contrast
ShaderChunk.tonemapping_pars_fragment = ShaderChunk.tonemapping_pars_fragment.replace(
  'vec3 CustomToneMapping( vec3 color ) { return color; }',
  `vec3 CustomToneMapping( vec3 color ) {
    vec3 c = clamp( AgXToneMapping( color ), 0.0, 1.0 );
    vec3 s = mix( c * 12.92, 1.055 * pow( c, vec3( 1.0 / 2.4 ) ) - 0.055, step( vec3( 0.0031308 ), c ) );
    vec3 m = s * s * ( 3.0 - 2.0 * s );
    s = s + ( m - s ) * 0.35;
    float L = dot( s, vec3( 0.2126, 0.7152, 0.0722 ) );
    s = clamp( L + ( s - L ) * 1.08, 0.0, 1.0 );
    return mix( s / 12.92, pow( ( s + 0.055 ) / 1.055, vec3( 2.4 ) ), step( vec3( 0.04045 ), s ) );
  }`,
);

/* ---------- the stand: src/s2/stand.bin (scripts/s2-model.mjs) ---------- */
interface PartHead { name: string; v: number; i: number; min: number[]; max: number[]; i32: boolean }
async function loadStand(): Promise<Map<string, BufferGeometry>> {
  const res = await fetch(standUrl);
  if (!res.ok || !res.body) throw new Error('stand');
  const buf = await new Response(res.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  const n = new DataView(buf).getUint32(0, true);
  const head = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 4, n))) as { parts: PartHead[] };
  let o = 4 + n;
  o += (4 - (o % 4)) % 4;
  const out = new Map<string, BufferGeometry>();
  for (const p of head.parts) {
    const q = new Uint16Array(buf, o, p.v * 3); o += p.v * 6;
    const nb = new Int8Array(buf, o, p.v * 3); o += p.v * 3; o += (4 - (o % 4)) % 4;
    const ib = p.i32 ? new Uint32Array(buf, o, p.i) : new Uint16Array(buf, o, p.i);
    o += ib.byteLength; o += (4 - (o % 4)) % 4;
    const pos = new Float32Array(p.v * 3), nor = new Float32Array(p.v * 3), last = [0, 0, 0];
    for (let i = 0; i < pos.length; i++) {
      const k = i % 3, v = (last[k] + q[i]) & 0xffff;
      last[k] = v;
      pos[i] = p.min[k] + (v / 65535) * (p.max[k] - p.min[k]);
      nor[i] = nb[i] / 127;
    }
    const idx = p.v > 65535 ? new Uint32Array(p.i) : new Uint16Array(p.i);
    for (let k = 0, prev = 0; k < p.i; k++) { const z = ib[k], d = z & 1 ? -(z + 1) / 2 : z / 2; prev += d; idx[k] = prev; }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3));
    g.setAttribute('normal', new BufferAttribute(nor, 3));
    g.setIndex(new BufferAttribute(idx, 1));
    g.computeBoundingSphere();
    out.set(p.name, g);
  }
  return out;
}

/* ---------- the phone (the stills' generic phone, 72 x 150 x 8 mm, corner 9: ptGeometry.ts phoneGeometry) ---------- */
const PHONE = { w: 72, l: 150, t: 8, r: 9 };
function roundedRect(w: number, l: number, r: number): Shape {
  const s = new Shape(), x0 = -w / 2, y0 = -l / 2, x1 = w / 2, y1 = l / 2;
  s.moveTo(x0 + r, y0); s.lineTo(x1 - r, y0); s.absarc(x1 - r, y0 + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x1, y1 - r); s.absarc(x1 - r, y1 - r, r, 0, Math.PI / 2, false);
  s.lineTo(x0 + r, y1); s.absarc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x0, y0 + r); s.absarc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}
function buildPhone(tex: Texture): { group: Group; display: MeshStandardMaterial } {
  const { w, l, t, r } = PHONE, bevel = 1.5;
  const body = new ExtrudeGeometry(roundedRect(w - 2.2, l - 2.2, r - 1.1), { depth: t - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: 1.1, bevelSegments: 6, curveSegments: 24 });
  body.rotateX(-Math.PI / 2); body.translate(0, -t / 2 + bevel, 0);
  const top = t / 2 + 0.02;
  const glass = new ShapeGeometry(roundedRect(w - 2, l - 2, r - 1), 24).rotateX(-Math.PI / 2).translate(0, top, 0);
  const dw = w - 5.2, dl = l - 5.2;
  const disp = new ShapeGeometry(roundedRect(dw, dl, r - 2.4), 24).rotateX(-Math.PI / 2).translate(0, top + 0.03, 0);
  const dp = disp.attributes.position, uv = new Float32Array(dp.count * 2);
  for (let i = 0; i < dp.count; i++) { uv[i * 2] = (dp.getX(i) + dw / 2) / dw; uv[i * 2 + 1] = (dl / 2 - dp.getZ(i)) / dl; }
  disp.setAttribute('uv', new BufferAttribute(uv, 2));
  const cam = new CircleGeometry(1.75, 32).rotateX(-Math.PI / 2).translate(0, top + 0.06, -l / 2 + 8.8);
  const ring = new CircleGeometry(2.3, 32).rotateX(-Math.PI / 2).translate(0, top + 0.05, -l / 2 + 8.8);
  const display = new MeshStandardMaterial({ color: lin(0.003, 0.003, 0.0035), roughness: 0.05, emissive: new Color(1, 1, 1), emissiveMap: tex, emissiveIntensity: 0 });
  const group = new Group();
  const add = (g: BufferGeometry, m: MeshStandardMaterial, shadow = false) => { const x = new Mesh(g, m); x.castShadow = shadow; x.receiveShadow = shadow; group.add(x); };
  add(body, new MeshStandardMaterial({ color: lin(0.45, 0.45, 0.48), metalness: 1, roughness: 0.3 }), true);
  add(glass, new MeshStandardMaterial({ color: lin(0.002, 0.002, 0.0025), roughness: 0.05 }));
  add(disp, display);
  add(ring, new MeshStandardMaterial({ color: lin(0.02, 0.02, 0.025), metalness: 1, roughness: 0.25 }));
  add(cam, new MeshStandardMaterial({ color: lin(0, 0, 0), roughness: 0.2 }));
  return { group, display };
}

/* ---------- the mint ring round tile 3's edge (ptRound5.ts tileGlow) ---------- */
const TILE = { top: new Vector3(17.3, 21.4, 7.29), up: new Vector3(0, 0.9659258, 0.258819), fwd: new Vector3(0, -0.258819, 0.9659258), half: [14.99, 15] };
function glowRing(): { mesh: Mesh; mat: MeshStandardMaterial } {
  const [hr, hf] = TILE.half, width = 1.4;
  const rr = (w: number, h: number, r: number) => {
    const s = new Shape();
    s.moveTo(-w + r, -h); s.lineTo(w - r, -h); s.absarc(w - r, -h + r, r, -Math.PI / 2, 0, false);
    s.lineTo(w, h - r); s.absarc(w - r, h - r, r, 0, Math.PI / 2, false);
    s.lineTo(-w + r, h); s.absarc(-w + r, h - r, r, Math.PI / 2, Math.PI, false);
    s.lineTo(-w, -h + r); s.absarc(-w + r, -h + r, r, Math.PI, Math.PI * 1.5, false);
    return s;
  };
  const outer = rr(hr + width, hf + width, 2 + width);
  outer.holes.push(rr(hr + 0.15, hf + 0.15, 2.15));
  const geo = new ShapeGeometry(outer, 16);
  const across = new Vector3().crossVectors(TILE.fwd, TILE.up).normalize();
  geo.applyMatrix4(new Matrix4().makeBasis(across, TILE.fwd, TILE.up));
  const mat = new MeshStandardMaterial({ color: lin(0, 0, 0), emissive: new Color('#5BC9B8'), emissiveIntensity: 0, roughness: 1 });
  const mesh = new Mesh(geo, mat);
  mesh.position.copy(TILE.top).addScaledVector(TILE.up, -0.35);
  return { mesh, mat };
}

/** a faint matte floor texture (the stills' ftex 0.3: the albedo varies a few percent, no pattern) */
function floorTexture(): DataTexture {
  const N = 256, d = new Uint8Array(N * N * 4);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const grid = Array.from({ length: 17 * 17 }, rnd);
  const fine = Array.from({ length: N * N }, rnd);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const x = (i / N) * 16, y = (j / N) * 16, xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    const g = (a: number, b: number) => grid[(b % 16) * 17 + (a % 16)];
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const v = g(xi, yi) * (1 - sx) * (1 - sy) + g(xi + 1, yi) * sx * (1 - sy) + g(xi, yi + 1) * (1 - sx) * sy + g(xi + 1, yi + 1) * sx * sy;
    const b = Math.round(255 * Math.min(1, Math.max(0, 0.5 + 0.3 * ((v - 0.5) * 0.9 + (fine[j * N + i] - 0.5) * 0.35))));
    d.set([b, b, b, 255], (j * N + i) * 4);
  }
  const t = new DataTexture(d, N, N, RGBAFormat, UnsignedByteType);
  t.colorSpace = NoColorSpace; t.wrapS = t.wrapT = RepeatWrapping; t.repeat.set(16, 16);
  t.magFilter = LinearFilter; t.needsUpdate = true;
  return t;
}

/* ---------- print lines: the stills' FDM layer and infill bump (ptGeometry.ts withPrintLines, ptTextures.ts
   printLineNormalMap), so the black plastic catches the light as printed plastic does ---------- */
const LAYER_MM = 0.2, INFILL_MM = 0.42, PRINT_LAYERS = 64;
function printLineMap(): DataTexture {
  const W = 4, PX = 16, Hh = PRINT_LAYERS * PX, d = new Uint8Array(W * Hh * 4);
  let a = 11;
  const r = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const amps = Array.from({ length: PRINT_LAYERS }, () => 0.65 + 0.35 * r());
  for (let j = 0; j < Hh; j++) {
    const layer = Math.floor(j / PX), f = (j + 0.5) / PX - layer, t = 2 * f - 1;
    const slope = (-t / Math.sqrt(Math.max(0.25, 1 - t * t))) * amps[layer];
    let ny = -slope * 0.35, nz = 1;
    const l = Math.hypot(ny, nz); ny /= l; nz /= l;
    for (let i = 0; i < W; i++) d.set([128, Math.round((ny * 0.5 + 0.5) * 255), Math.round((nz * 0.5 + 0.5) * 255), 255], (j * W + i) * 4);
  }
  const tex = new DataTexture(d, W, Hh, RGBAFormat, UnsignedByteType);
  tex.colorSpace = NoColorSpace; tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.magFilter = LinearFilter; tex.minFilter = LinearMipmapLinearFilter; tex.generateMipmaps = true; tex.anisotropy = 16;
  tex.needsUpdate = true;
  return tex;
}
/** uv and tangents for the print line map: walls of the layers (along `axis`) get layer lines, the top skin the 45
 *  degree infill; the tangent runs along the lines */
function withPrintLines(g: BufferGeometry, axis: 'y' | 'z'): BufferGeometry {
  const pos = g.attributes.position, nor = g.attributes.normal, n = pos.count;
  const uv = new Float32Array(n * 2), tan = new Float32Array(n * 4);
  const A = axis === 'z' ? new Vector3(0, 0, 1) : new Vector3(0, 1, 0), e1 = new Vector3(1, 0, 0), e2 = axis === 'z' ? new Vector3(0, 1, 0) : new Vector3(0, 0, 1);
  const along = new Vector3().addVectors(e1, e2).normalize(), across = new Vector3().subVectors(e1, e2).normalize();
  const p = new Vector3(), nv = new Vector3(), t = new Vector3(), b = new Vector3();
  for (let i = 0; i < n; i++) {
    p.fromBufferAttribute(pos, i); nv.fromBufferAttribute(nor, i).normalize();
    let w: number;
    if (Math.abs(nv.dot(A)) < 0.7) {
      t.crossVectors(A, nv); if (t.lengthSq() < 1e-8) t.set(1, 0, 0); t.normalize();
      b.crossVectors(nv, t); w = b.dot(A) >= 0 ? 1 : -1;
      uv[i * 2 + 1] = p.dot(A) / (LAYER_MM * PRINT_LAYERS);
    } else {
      t.copy(along).addScaledVector(nv, -nv.dot(along)); if (t.lengthSq() < 1e-8) t.copy(e1); t.normalize();
      b.crossVectors(nv, t); w = b.dot(across) >= 0 ? 1 : -1;
      uv[i * 2 + 1] = p.dot(across) / (INFILL_MM * PRINT_LAYERS);
    }
    uv[i * 2] = 0.5;
    tan.set([t.x, t.y, t.z, w], i * 4);
  }
  const out = g.clone();
  out.setAttribute('uv', new BufferAttribute(uv, 2));
  out.setAttribute('tangent', new BufferAttribute(tan, 4));
  return out;
}

const quat = (p: Pose) => new Quaternion().setFromEuler(new Euler(p.rot[0] * DEG, p.rot[1] * DEG, p.rot[2] * DEG, 'YXZ'));

export async function startLive(): Promise<Player> {
  const canvas = document.createElement('canvas');
  canvas.className = 's2live';
  canvas.setAttribute('aria-hidden', 'true');
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setClearColor(0x010101, 1);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = CustomToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;

  const [parts, tex] = await Promise.all([loadStand(), new Promise<Texture>((res, rej) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => { const t = new Texture(img); t.colorSpace = SRGBColorSpace; t.anisotropy = 4; t.needsUpdate = true; res(t); };
    img.onerror = () => rej(new Error('menu'));
    img.src = menuUrl;
  })]);

  const scene = new Scene();
  const lines = printLineMap();
  const plastic = (color: Color, roughness: number) => new MeshStandardMaterial({ color, roughness, normalMap: lines, normalScale: new Vector2(0.6, 0.6) });
  const black = plastic(lin(0.011, 0.011, 0.01177), 0.6);
  const letters: Record<string, MeshStandardMaterial> = {
    let_pro: plastic(lin(0.78, 0.77, 0.74), 0.46),
    let_x: plastic(lin(0.93, 0.79, 0.43), 0.48),
    let_y: plastic(new Color('#5BC9B8').multiplyScalar(0.92), 0.5),
    let_z: plastic(new Color('#FF4193').multiplyScalar(0.85), 0.5),
  };
  const stand = new Group();
  for (const [name, g] of parts) {
    if (name === 'tile') continue;
    // the stand was printed lying on its back: its layers stack along z
    const m = new Mesh(withPrintLines(g, 'z'), letters[name] ?? black);
    m.castShadow = true; m.receiveShadow = true;
    stand.add(m);
  }
  // the four tiles in their sockets, turned 15 degrees with the deck
  const tileGeo = withPrintLines(parts.get('tile')!, 'y');
  for (const x of [-51.9, -17.3, 17.3, 51.9]) {
    const m = new Mesh(tileGeo, black);
    m.position.set(x, 13.6684, 5.2229);
    m.rotation.x = 15 * DEG;
    m.castShadow = true; m.receiveShadow = true;
    stand.add(m);
  }
  scene.add(stand);
  const glow = glowRing();
  scene.add(glow.mesh);
  const phone = buildPhone(tex);
  scene.add(phone.group);
  phone.group.traverse((o) => { o.matrixAutoUpdate = true; });

  const floorMat = new MeshStandardMaterial({ color: lin(0.012, 0.012, 0.01164), roughness: 0.95, map: floorTexture() });
  const floor = new Mesh(new PlaneGeometry(8000, 8000).rotateX(-Math.PI / 2), floorMat);
  floor.position.y = -0.02;
  floor.receiveShadow = true;
  scene.add(floor);

  // the one hard light: a small spot from the left, in one fixed place, aimed at the stand (the stills' key)
  const key = new SpotLight(lin(1, 0.975, 0.94), 0, 0, 9 * DEG, 0.2, 2);
  key.position.set(-721.8, 776, 383.8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 700;
  key.shadow.camera.far = 1700;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.25;
  key.shadow.radius = 2;
  scene.add(key, key.target);

  const camera = new PerspectiveCamera(30, 1.6, 60, 12000);
  const q0 = { desktop: quat(PATH.desktop.tap), phone: quat(PATH.phone.tap) };
  const q1 = { desktop: quat(PATH.desktop.lift), phone: quat(PATH.phone.lift) };
  const look = new Vector3(), tmp = new Vector3();
  let lastKey = '', lastLift = -1, lastForm = '';

  function draw(s: number, form: Form, box: Box, vw: number, vh: number): boolean {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = Math.round(vw * dpr), H = Math.round(vh * dpr);
    const sh = shotAt(form, s), c = sh.cam;
    const sig = [s.toFixed(4), form, box.left.toFixed(1), box.top.toFixed(1), box.w.toFixed(1), box.h.toFixed(1), W, H].join('|');
    if (sig === lastKey) return false;
    lastKey = sig;
    if (canvas.width !== W || canvas.height !== H) {
      renderer.setPixelRatio(1);
      renderer.setSize(W, H, false);
      canvas.style.width = vw + 'px';
      canvas.style.height = vh + 'px';
    }
    // the camera, framed as today's still: the picture's box is the camera's whole frame (30 degrees over its
    // height), the lens shift slides it, and the screen shows the part of it the box puts on screen
    look.set(c.lx, c.ly, c.lz);
    camera.position.copy(look).addScaledVector(dirFrom(c.az, c.el), c.dist);
    camera.up.set(0, 1, 0);
    camera.lookAt(look);
    camera.aspect = box.w / box.h;
    camera.setViewOffset(box.w, box.h, -box.left - c.sx * box.w, -box.top + c.sy * box.h, vw, vh);
    camera.updateProjectionMatrix();
    // the key light: aimed per form, its strength as the scene arrives
    const a = PATH[form].aim;
    key.target.position.set(a[0], a[1], a[2]);
    key.target.updateMatrixWorld();
    key.intensity = 11000000 * sh.key;
    // the phone between its tap and lifted poses (as scripts/s2-frames.mjs phonePose)
    if (sh.lift !== lastLift || form !== lastForm) {
      const P = PATH[form];
      phone.group.quaternion.copy(q0[form]).slerp(q1[form], sh.lift);
      phone.group.position.set(...P.tap.pos).lerp(tmp.set(...P.lift.pos), sh.lift);
      phone.group.position.y += 14 * Math.sin(Math.PI * sh.lift);
      renderer.shadowMap.needsUpdate = true;
      lastLift = sh.lift; lastForm = form;
    }
    phone.display.emissiveIntensity = sh.screen;
    glow.mat.emissiveIntensity = sh.glow;
    glow.mesh.visible = sh.glow > 0.01;
    renderer.render(scene, camera);
    return true;
  }

  return {
    canvas,
    draw,
    dispose() { renderer.dispose(); renderer.forceContextLoss(); },
  };
}
