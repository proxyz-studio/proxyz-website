// Build 12: the little matrix arithmetic the live film needs (4 x 4, column major, as WebGL reads them).
export type M4 = Float32Array;
export type V3 = [number, number, number];

export const DEG = Math.PI / 180;

export function ident(): M4 { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; }

/** a times b */
export function mul(a: M4, b: M4, out: M4 = new Float32Array(16)): M4 {
  const r = out === a || out === b ? new Float32Array(16) : out;
  for (let c = 0; c < 4; c++) for (let row = 0; row < 4; row++) {
    r[c * 4 + row] = a[row] * b[c * 4] + a[4 + row] * b[c * 4 + 1] + a[8 + row] * b[c * 4 + 2] + a[12 + row] * b[c * 4 + 3];
  }
  if (r !== out) out.set(r);
  return out;
}
export const mulAll = (...ms: M4[]): M4 => ms.reduce((a, b) => mul(a, b));

export function translate(x: number, y: number, z: number): M4 { const m = ident(); m[12] = x; m[13] = y; m[14] = z; return m; }
export function rotX(a: number): M4 { const m = ident(), c = Math.cos(a), s = Math.sin(a); m[5] = c; m[6] = s; m[9] = -s; m[10] = c; return m; }
export function rotY(a: number): M4 { const m = ident(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[2] = -s; m[8] = s; m[10] = c; return m; }
export function rotZ(a: number): M4 { const m = ident(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[1] = s; m[4] = -s; m[5] = c; return m; }
/** a turn in degrees in the order three.js calls YXZ (the stills' poses) */
export const eulerYXZ = (x: number, y: number, z: number): M4 => mulAll(rotY(y * DEG), rotX(x * DEG), rotZ(z * DEG));
/** a place on the floor and a turn about the up axis, degrees */
export const floorPose = (x: number, z: number, turn: number, y = 0): M4 => mul(translate(x, y, z), rotY(turn * DEG));

export function frustum(l: number, r: number, b: number, t: number, n: number, f: number): M4 {
  const m = new Float32Array(16);
  m[0] = (2 * n) / (r - l); m[5] = (2 * n) / (t - b);
  m[8] = (r + l) / (r - l); m[9] = (t + b) / (t - b); m[10] = -(f + n) / (f - n); m[11] = -1;
  m[14] = (-2 * f * n) / (f - n);
  return m;
}

/** the view matrix of a camera at eye looking at target, its up the world's up (no roll) */
export function lookAt(eye: V3, target: V3): M4 {
  let zx = eye[0] - target[0], zy = eye[1] - target[1], zz = eye[2] - target[2];
  const zl = Math.hypot(zx, zy, zz) || 1; zx /= zl; zy /= zl; zz /= zl;
  let xx = zz, xy = 0, xz = -zx;   // up (0,1,0) x z
  const xl = Math.hypot(xx, xy, xz) || 1; xx /= xl; xy /= xl; xz /= xl;
  const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
  const m = ident();
  m[0] = xx; m[4] = xy; m[8] = xz;
  m[1] = yx; m[5] = yy; m[9] = yz;
  m[2] = zx; m[6] = zy; m[10] = zz;
  m[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
  m[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
  m[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
  return m;
}

export function apply(m: M4, v: V3): [number, number, number, number] {
  const [x, y, z] = v;
  return [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14], m[3] * x + m[7] * y + m[11] * z + m[15]];
}
export const point = (m: M4, v: V3): V3 => { const r = apply(m, v); return [r[0] / r[3], r[1] / r[3], r[2] / r[3]]; };

/** the upper 3 x 3 for normals (rotations and uniform scale only, which is all the film uses) */
export function normalOf(m: M4): Float32Array { return Float32Array.of(m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]); }

/** a 3 x 3 (row major) as the 4 x 4 CSS matrix3d of a plane mapping: (x, y) -> (a x + b y + c, d x + e y + f) / (g x + h y + i) */
export function cssHomography(H: number[]): string {
  const [a, b, c, d, e, f, g, h, i] = H.map((v) => v / H[8]);
  return `matrix3d(${[a, d, 0, g, b, e, 0, h, 0, 0, 1, 0, c, f, 0, i].map((v) => (Math.abs(v) < 1e-12 ? 0 : +v.toPrecision(9))).join(',')})`;
}

/** solve the 3 x 3 homography taking four points p to four points q (row major, h33 = 1) */
export function homography(p: number[][], q: number[][]): number[] {
  const A: number[][] = [];
  for (let k = 0; k < 4; k++) {
    const [x, y] = p[k], [u, v] = q[k];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
  }
  // Gauss with partial pivoting on the 8 x 9 system
  for (let c = 0; c < 8; c++) {
    let best = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[best][c])) best = r;
    [A[c], A[best]] = [A[best], A[c]];
    const pv = A[c][c] || 1e-12;
    for (let k = c; k < 9; k++) A[c][k] /= pv;
    for (let r = 0; r < 8; r++) if (r !== c) { const f = A[r][c]; if (f) for (let k = c; k < 9; k++) A[r][k] -= f * A[c][k]; }
  }
  return [...A.map((r) => r[8]), 1];
}
