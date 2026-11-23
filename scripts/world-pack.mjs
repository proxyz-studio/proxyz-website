// Build 12: the shapes of the live 3D film (src/world/), packed into one small binary file the film loads at the
// visitor's first sign of intent.
//
// The film draws every scene from the stills' own pictures, cast back onto the shapes from the stills' own cameras
// (src/world/README in src/world/world.ts). So the shapes only have to be where the drawn things are: at a scene's rest
// the camera is the still's camera and any shape gives exactly the still; while the camera moves, the shapes give the
// picture its depth. They are:
//
// - the stand: the TAPZ stand's own parts, as look 11 packed them (src/world/stand.bin, read here, never rebuilt);
// - the race piece: the height lines coin of the stills, as a height field (the top of its real triangles, sampled
//   on a grid), made from the stills project's baked coin files (the folder given as the first argument, read only);
// - the phone: the stills' generic phone (72 x 150 x 8 mm, corner 9), made here with three.js as the stills make it;
// - the trophy's plain base (the stills' plinth and rest), made here the same way.
//
//   node scripts/world-pack.mjs <the stills project's pt/tools/pt/coin-lines folder>
//
// File (gzipped): 4 bytes (little endian) the length of a JSON header, the header, padding to 4 bytes, then the
// parts in the stand.bin layout (see scripts/s2-model.mjs: positions Uint16 x 3 quantised in the part's box, each the
// step from the vertex before; normals Int8 x 3; indices as zigzag steps), then the coin's height field: Uint16, row
// after row, each the step from the value before (wrapping), quantised over [0, hmax] mm; then which part is on top
// at each node (Uint8: 0 ground, 1 height lines, 2 sea, 3 route).
import { readFileSync, writeFileSync } from 'node:fs';
import { gzipSync, gunzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CircleGeometry, ExtrudeGeometry, LatheGeometry, Shape, ShapeGeometry, Vector2, BoxGeometry } from 'three';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coinDir = process.argv[2];
if (!coinDir) { console.error('usage: node scripts/world-pack.mjs <coin-lines folder>'); process.exit(2); }

/* ---------- the stand, as look 11 packed it ---------- */
function readParts(file) {
  const buf = gunzipSync(readFileSync(file));
  const n = buf.readUInt32LE(0);
  const head = JSON.parse(buf.subarray(4, 4 + n).toString());
  let o = 4 + n;
  o += (4 - (o % 4)) % 4;
  const out = [];
  for (const p of head.parts) {
    const q = new Uint16Array(buf.buffer.slice(buf.byteOffset + o, buf.byteOffset + o + p.v * 6)); o += p.v * 6;
    const nb = new Int8Array(buf.buffer.slice(buf.byteOffset + o, buf.byteOffset + o + p.v * 3)); o += p.v * 3; o += (4 - (o % 4)) % 4;
    const isz = p.i32 ? 4 : 2;
    const ib = p.i32 ? new Uint32Array(buf.buffer.slice(buf.byteOffset + o, buf.byteOffset + o + p.i * 4)) : new Uint16Array(buf.buffer.slice(buf.byteOffset + o, buf.byteOffset + o + p.i * 2));
    o += p.i * isz; o += (4 - (o % 4)) % 4;
    const P = new Float32Array(p.v * 3), N = new Float32Array(p.v * 3), last = [0, 0, 0];
    for (let i = 0; i < P.length; i++) { const k = i % 3, v = (last[k] + q[i]) & 0xffff; last[k] = v; P[i] = p.min[k] + (v / 65535) * (p.max[k] - p.min[k]); N[i] = nb[i] / 127; }
    const I = new Uint32Array(p.i);
    for (let k = 0, prev = 0; k < p.i; k++) { const z = ib[k], d = z & 1 ? -(z + 1) / 2 : z / 2; prev += d; I[k] = prev; }
    out.push({ name: p.name, P, N, I });
  }
  return out;
}

/* ---------- three.js shapes as parts (positions, normals, indices) ---------- */
function fromGeometry(name, g) {
  const ng = g.index ? g : (() => { const idx = []; for (let i = 0; i < g.attributes.position.count; i++) idx.push(i); g.setIndex(idx); return g; })();
  if (!ng.attributes.normal) ng.computeVertexNormals();
  return { name, P: Float32Array.from(ng.attributes.position.array), N: Float32Array.from(ng.attributes.normal.array), I: Uint32Array.from(ng.index.array) };
}
function merge(name, gs) {
  let P = [], N = [], I = [], base = 0;
  for (const g of gs) {
    const p = fromGeometry(name, g);
    P.push(...p.P); N.push(...p.N); for (const i of p.I) I.push(i + base);
    base += p.P.length / 3;
  }
  return { name, P: Float32Array.from(P), N: Float32Array.from(N), I: Uint32Array.from(I) };
}
function roundedRect(w, l, r) {
  const s = new Shape(), x0 = -w / 2, y0 = -l / 2, x1 = w / 2, y1 = l / 2;
  s.moveTo(x0 + r, y0); s.lineTo(x1 - r, y0); s.absarc(x1 - r, y0 + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x1, y1 - r); s.absarc(x1 - r, y1 - r, r, 0, Math.PI / 2, false);
  s.lineTo(x0 + r, y1); s.absarc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x0, y0 + r); s.absarc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}
/** the stills' phone (ptGeometry.ts phoneGeometry): face +y, top end toward -z, centred on its middle */
function phoneParts() {
  const w = 72, l = 150, t = 8, r = 9, bevel = 1.5;
  const body = new ExtrudeGeometry(roundedRect(w - 2.2, l - 2.2, r - 1.1), { depth: t - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: 1.1, bevelSegments: 4, curveSegments: 12 });
  body.rotateX(-Math.PI / 2); body.translate(0, -t / 2 + bevel, 0);
  const top = t / 2 + 0.02;
  const glass = new ShapeGeometry(roundedRect(w - 2, l - 2, r - 1), 12).rotateX(-Math.PI / 2).translate(0, top, 0);
  // the display a hair over the glass: it carries the screen's own picture when the film draws it live
  const display = new ShapeGeometry(roundedRect(w - 5.2, l - 5.2, r - 2.4), 12).rotateX(-Math.PI / 2).translate(0, top + 0.03, 0);
  const ring = new CircleGeometry(2.3, 20).rotateX(-Math.PI / 2).translate(0, top + 0.05, -l / 2 + 8.8);
  return [merge('phone_body', [body]), merge('phone_glass', [glass, ring]), merge('phone_display', [display])];
}
/** the trophy's plain base (ptRound5.ts plinthGeometry and the rest under the coin) */
function baseParts() {
  const R = 88, h = 14, e = 2;
  const pts = [new Vector2(0, h), new Vector2(R - e, h)];
  for (let i = 1; i <= 6; i++) { const a = (i / 6) * (Math.PI / 2); pts.push(new Vector2(R - e + e * Math.sin(a), h - e + e * Math.cos(a))); }
  pts.push(new Vector2(R, 3), new Vector2(R - 3, 0), new Vector2(0, 0));
  const plinth = new LatheGeometry(pts.reverse(), 96);
  // the rest: 46 x rh x 18 under the coin's low side (coinOnPlinth: tilt 22 degrees about x, rim on the drum)
  // (a turn of +22 degrees about x: the coin's +z rim goes down onto the drum, its -z side rests on the box)
  const tilt = (22 * Math.PI) / 180, COIN_R = 65;
  const cy = h + COIN_R * Math.sin(tilt) + 0.5;   // the coin's bottom centre height
  const d = -COIN_R * 0.55, underY = cy - d * Math.sin(tilt), underZ = d * Math.cos(tilt);
  const rh = Math.max(2, underY - h - 0.5);
  const rest = new BoxGeometry(46, rh, 18).translate(0, h + rh / 2, underZ);
  return [merge('base', [plinth, rest])];
}

/* ---------- the coin as a height field ---------- */
function heightField(N, R) {
  const H = new Float32Array(N * N).fill(-1);
  // which part is on top at each node: 0 ground, 1 height lines, 2 sea, 3 route (the coin's own colours, for the parts
  // of it no still saw)
  const C = new Uint8Array(N * N);
  const step = (2 * R) / (N - 1);
  let tris = 0;
  for (const [pi, name] of ['terrain', 'contours', 'sea', 'route'].entries()) {
    const pb = readFileSync(path.join(coinDir, `${name}.pos.bin`)), ib = readFileSync(path.join(coinDir, `${name}.idx.bin`));
    const P = new Float32Array(pb.buffer.slice(pb.byteOffset, pb.byteOffset + pb.byteLength));
    const I = new Uint32Array(ib.buffer.slice(ib.byteOffset, ib.byteOffset + ib.byteLength));
    tris += I.length / 3;
    for (let t = 0; t < I.length; t += 3) {
      const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
      const ax = P[a], ay = P[a + 1], az = P[a + 2], bx = P[b], by = P[b + 1], bz = P[b + 2], cx = P[c], cy = P[c + 1], cz = P[c + 2];
      const den = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz);
      if (Math.abs(den) < 1e-9) continue;   // a wall seen from above
      const i0 = Math.max(0, Math.floor((Math.min(ax, bx, cx) + R) / step)), i1 = Math.min(N - 1, Math.ceil((Math.max(ax, bx, cx) + R) / step));
      const j0 = Math.max(0, Math.floor((Math.min(az, bz, cz) + R) / step)), j1 = Math.min(N - 1, Math.ceil((Math.max(az, bz, cz) + R) / step));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const x = -R + i * step, z = -R + j * step;
        const l1 = ((bz - cz) * (x - cx) + (cx - bx) * (z - cz)) / den, l2 = ((cz - az) * (x - cx) + (ax - cx) * (z - cz)) / den, l3 = 1 - l1 - l2;
        if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue;
        const y = l1 * ay + l2 * by + l3 * cy;
        if (y > H[j * N + i] - (pi === 1 || pi === 3 ? 0.05 : 0)) { if (y > H[j * N + i]) H[j * N + i] = y; C[j * N + i] = pi; }
      }
    }
  }
  // holes (no triangle over a node, at the rim): the nearest neighbour's height
  for (let pass = 0; pass < 4; pass++) for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    if (H[j * N + i] >= 0) continue;
    let best = -1;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + di, jj = j + dj; if (ii >= 0 && jj >= 0 && ii < N && jj < N && H[jj * N + ii] > best) best = H[jj * N + ii]; }
    if (best >= 0) H[j * N + i] = best;
  }
  for (let k = 0; k < H.length; k++) if (H[k] < 0) H[k] = 0;
  return { H, C, tris };
}

/* ---------- pack ---------- */
const pad4 = (n) => (4 - (n % 4)) % 4;
const parts = [...readParts(path.join(root, 'src/world/stand.bin')), ...phoneParts(), ...baseParts()];
const header = { parts: [], coin: null }, chunks = [];
let at = 0;
for (const g of parts) {
  const v = g.P.length / 3, min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < g.P.length; i++) { const k = i % 3; min[k] = Math.min(min[k], g.P[i]); max[k] = Math.max(max[k], g.P[i]); }
  const pos = new Uint16Array(g.P.length), last = [0, 0, 0];
  for (let i = 0; i < g.P.length; i++) { const k = i % 3, r = max[k] - min[k] || 1, q = Math.round(((g.P[i] - min[k]) / r) * 65535); pos[i] = (q - last[k]) & 0xffff; last[k] = q; }
  const nor = new Int8Array(g.N.length);
  for (let i = 0; i < g.N.length; i++) nor[i] = Math.max(-127, Math.min(127, Math.round(g.N[i] * 127)));
  const i32 = v > 65535;
  const dz = new Uint32Array(g.I.length);
  for (let k = 0, prev = 0; k < g.I.length; k++) { const d = g.I[k] - prev; prev = g.I[k]; dz[k] = d >= 0 ? 2 * d : -2 * d - 1; }
  if (!i32 && dz.some((d) => d > 65535)) throw new Error(`part ${g.name}: an index step does not fit 16 bits`);
  const idx = i32 ? dz : Uint16Array.from(dz);
  header.parts.push({ name: g.name, v, i: g.I.length, min: min.map((x) => +x.toFixed(5)), max: max.map((x) => +x.toFixed(5)), i32 });
  at += pos.byteLength + nor.byteLength;
  chunks.push(Buffer.from(pos.buffer), Buffer.from(nor.buffer), Buffer.alloc(pad4(at)));
  at += pad4(at) + idx.byteLength;
  chunks.push(Buffer.from(idx.buffer), Buffer.alloc(pad4(at)));
  at += pad4(at);
}
const N = 288, R = 65;
const { H, C, tris } = heightField(N, R);
let hmax = 0;
for (const h of H) hmax = Math.max(hmax, h);
hmax = Math.ceil(hmax * 10) / 10;
const hq = new Uint16Array(N * N);
let prev = 0;
for (let k = 0; k < H.length; k++) { const q = Math.round((H[k] / hmax) * 65535); hq[k] = (q - prev) & 0xffff; prev = q; }
header.coin = { n: N, r: R, hmax };
chunks.push(Buffer.from(hq.buffer), Buffer.from(C.buffer));
const hj = Buffer.from(JSON.stringify(header));
const len = Buffer.alloc(4);
len.writeUInt32LE(hj.length);
const out = Buffer.concat([len, hj, Buffer.alloc(pad4(4 + hj.length)), ...chunks]);
const gz = gzipSync(out, { level: 9 });
writeFileSync(path.join(root, 'src/world/world.bin'), gz);
console.log(`src/world/world.bin ${(gz.length / 1024).toFixed(0)} KB (${(out.length / 1024).toFixed(0)} KB unpacked); coin ${N} x ${N} from ${tris} triangles, top ${hmax} mm; ${header.parts.map((p) => `${p.name} ${p.v}/${p.i / 3}`).join(', ')}`);
