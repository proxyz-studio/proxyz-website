// Scene 2, version A (look 11): the stand's parts for the live 3D scene, from the TAPZ site's own packed model
// (the TAPZ site's repo at tag v13-delivered, src/three/models/stand-parts.data.ts; read only, never changed).
// The same parts the stills drew (the stills' stand5: body, foot words, plate, the PROXYZ letters, a tile), with
// creased normals (30 degrees, as the TAPZ site), into one small binary file the film loads when scene 2 is near.
//
//   git -C <the TAPZ site's repo> show v13-delivered:src/three/models/stand-parts.data.ts > /tmp/parts.ts
//   node scripts/s2-model.mjs /tmp/parts.ts            writes src/s2/stand.bin
//
// File: 4 bytes (little endian) the length of a JSON header, the header ({ parts: [{ name, v, i, min, max, i32 }] }),
// padding to 4 bytes, then per part: positions (Uint16 x 3, quantised in the part's box, each the step from the vertex before, mod 65536), normals (Int8 x 3), padding
// to 4 bytes, indices (Uint16, or Uint32 when i32; each the step from the one before, zigzag), padding to 4 bytes.
// The whole file is gzipped (the browser unpacks it with DecompressionStream), so it travels small from any host.
import { readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PARTS = ['tall_body_lod1', 'tall_accent', 'tall_web', 'plate', 'let_pro', 'let_x', 'let_y', 'let_z', 'tile'];
const src = readFileSync(process.argv[2], 'utf8');

function packed(name) {
  const m = new RegExp(`\\n  ${name}: \\{ vertexCount: (\\d+), indexCount: (\\d+), min: \\[([^\\]]*)\\], max: \\[([^\\]]*)\\], idx16: (true|false), pos: '([^']*)', idx: '([^']*)'`).exec(src);
  if (!m) throw new Error(`no part ${name}`);
  const pb = Buffer.from(m[6], 'base64'), ib = Buffer.from(m[7], 'base64');
  const min = m[3].split(',').map(Number), max = m[4].split(',').map(Number);
  const q = new Uint16Array(pb.buffer.slice(pb.byteOffset, pb.byteOffset + pb.byteLength));
  const P = new Float32Array(q.length);
  for (let i = 0; i < q.length; i++) { const k = i % 3; P[i] = min[k] + (q[i] / 65535) * (max[k] - min[k]); }
  const I = m[5] === 'true' ? Uint32Array.from(new Uint16Array(ib.buffer.slice(ib.byteOffset, ib.byteOffset + ib.byteLength))) : new Uint32Array(ib.buffer.slice(ib.byteOffset, ib.byteOffset + ib.byteLength));
  if (P.length !== Number(m[1]) * 3 || I.length !== Number(m[2])) throw new Error(`part ${name} is damaged`);
  return { P, I };
}

/** creased normals (the TAPZ site's creasedGeometry, src/three/stand/geometry.ts, the same steps) */
function crease({ P, I }, deg = 30) {
  const nV = P.length / 3, nT = I.length / 3, fn = new Float32Array(nT * 3), ang = new Float32Array(nT * 3);
  for (let t = 0; t < nT; t++) {
    const a = I[t * 3] * 3, b = I[t * 3 + 1] * 3, c = I[t * 3 + 2] * 3;
    const abx = P[b] - P[a], aby = P[b + 1] - P[a + 1], abz = P[b + 2] - P[a + 2];
    const acx = P[c] - P[a], acy = P[c + 1] - P[a + 1], acz = P[c + 2] - P[a + 2];
    const bcx = P[c] - P[b], bcy = P[c + 1] - P[b + 1], bcz = P[c + 2] - P[b + 2];
    let nx = aby * acz - abz * acy, ny = abz * acx - abx * acz, nz = abx * acy - aby * acx;
    const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    fn.set([nx, ny, nz], t * 3);
    const lab = Math.hypot(abx, aby, abz) || 1, lac = Math.hypot(acx, acy, acz) || 1, lbc = Math.hypot(bcx, bcy, bcz) || 1;
    const A = Math.acos(Math.max(-1, Math.min(1, (abx * acx + aby * acy + abz * acz) / (lab * lac))));
    const B = Math.acos(Math.max(-1, Math.min(1, (-abx * bcx - aby * bcy - abz * bcz) / (lab * lbc))));
    ang.set([A, B, Math.max(0, Math.PI - A - B)], t * 3);
  }
  const start = new Uint32Array(nV + 1);
  for (let i = 0; i < I.length; i++) start[I[i] + 1]++;
  for (let v = 0; v < nV; v++) start[v + 1] += start[v];
  const fill = start.slice(0, nV), corners = new Uint32Array(I.length);
  for (let i = 0; i < I.length; i++) corners[fill[I[i]]++] = i;
  const cosT = Math.cos((deg * Math.PI) / 180), outP = [], outN = [], outI = new Uint32Array(I.length);
  for (let v = 0; v < nV; v++) {
    const s = start[v], e = start[v + 1], made = [];
    for (let ci = s; ci < e; ci++) {
      const corner = corners[ci], t = (corner / 3) | 0, fx = fn[t * 3], fy = fn[t * 3 + 1], fz = fn[t * 3 + 2];
      let cx = 0, cy = 0, cz = 0;
      for (let cj = s; cj < e; cj++) {
        const o = corners[cj], u = (o / 3) | 0, gx = fn[u * 3], gy = fn[u * 3 + 1], gz = fn[u * 3 + 2];
        if (fx * gx + fy * gy + fz * gz >= cosT) { const w = ang[o]; cx += gx * w; cy += gy * w; cz += gz * w; }
      }
      const l = Math.hypot(cx, cy, cz) || 1, nx = cx / l, ny = cy / l, nz = cz / l;
      let id = -1;
      for (const m of made) if (outN[m * 3] * nx + outN[m * 3 + 1] * ny + outN[m * 3 + 2] * nz > 0.99995) { id = m; break; }
      if (id < 0) { id = outP.length / 3; outP.push(P[v * 3], P[v * 3 + 1], P[v * 3 + 2]); outN.push(nx, ny, nz); made.push(id); }
      outI[corner] = id;
    }
  }
  return { P: Float32Array.from(outP), N: Float32Array.from(outN), I: outI };
}

const header = { parts: [] }, chunks = [];
const pad4 = (n) => (4 - (n % 4)) % 4;
let at = 0;   // bytes of part data so far (the data starts on a multiple of 4)
for (const name of PARTS) {
  const g = crease(packed(name));
  const v = g.P.length / 3, min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < g.P.length; i++) { const k = i % 3; min[k] = Math.min(min[k], g.P[i]); max[k] = Math.max(max[k], g.P[i]); }
  const pos = new Uint16Array(g.P.length), last = [0, 0, 0];
  // each position the step from the vertex before on the same axis (wrapping in 16 bits), which packs smaller
  for (let i = 0; i < g.P.length; i++) { const k = i % 3, r = max[k] - min[k] || 1, q = Math.round(((g.P[i] - min[k]) / r) * 65535); pos[i] = (q - last[k]) & 0xffff; last[k] = q; }
  const nor = new Int8Array(g.N.length);
  for (let i = 0; i < g.N.length; i++) nor[i] = Math.round(g.N[i] * 127);
  const i32 = v > 65535;
  // indices as the step from the one before (zigzag), which packs far smaller
  const dz = new Uint32Array(g.I.length);
  for (let k = 0, prev = 0; k < g.I.length; k++) { const d = g.I[k] - prev; prev = g.I[k]; dz[k] = d >= 0 ? 2 * d : -2 * d - 1; }
  if (!i32 && dz.some((d) => d > 65535)) throw new Error(`part ${name}: an index step does not fit 16 bits`);
  const idx = i32 ? dz : Uint16Array.from(dz);
  header.parts.push({ name, v, i: g.I.length, min: min.map((x) => +x.toFixed(5)), max: max.map((x) => +x.toFixed(5)), i32 });
  // padding by the place in the file (the reader skips to the next multiple of 4 after the normals and the indices)
  at += pos.byteLength + nor.byteLength;
  chunks.push(Buffer.from(pos.buffer), Buffer.from(nor.buffer), Buffer.alloc(pad4(at)));
  at += pad4(at) + idx.byteLength;
  chunks.push(Buffer.from(idx.buffer), Buffer.alloc(pad4(at)));
  at += pad4(at);
}
const hj = Buffer.from(JSON.stringify(header));
const len = Buffer.alloc(4);
len.writeUInt32LE(hj.length);
// positions start 4-aligned: each chunk is a multiple of 2 (Uint16) and padded after normals and indices
const out = Buffer.concat([len, hj, Buffer.alloc(pad4(4 + hj.length)), ...chunks]);
const gz = gzipSync(out, { level: 9 });
writeFileSync(path.join(root, 'src/s2/stand.bin'), gz);
console.log(`src/s2/stand.bin ${(gz.length / 1024).toFixed(0)} KB (${(out.length / 1024).toFixed(0)} KB unpacked), ${header.parts.map((p) => `${p.name} ${p.v}/${p.i / 3}`).join(', ')}`);
