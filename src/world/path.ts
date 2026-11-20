// Build 12: the film's one camera, as a pure function of the playhead.
//
// At each scene's rest the camera is exactly the still's camera, framed exactly where the page puts that still (its
// box). Between two rests it travels like a camera on a slider: it leaves the rest slowly, does most of its travel
// while the light changes from one scene to the next, and settles slowly into the next rest, never stopping and never
// overshooting (each number eased with a curve that cannot swing past its keys). Scene 1 holds still until its light
// rests (the first screen is the page as it loads), and scenes 6 and 7 share one camera (the pool of light holds while
// the three things leave it).
//
// The camera is kept as nine numbers: the point it looks at (3), its turn, height and distance around that point (so
// it moves in arcs round the things, not through them), and its lens on the screen (focal length, and where the lens
// axis meets the screen), so the framing glides from one scene's box to the next.
import type { V3 } from './mat';
import type { CamState } from './world';

export interface Key { y: number; v: number[] }

/** a rest camera as nine numbers */
export function keyOf(eye: V3, target: V3, fpx: number, cx: number, cy: number): number[] {
  const o = [eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]], d = Math.hypot(o[0], o[1], o[2]);
  return [target[0], target[1], target[2], Math.atan2(o[0], o[2]), Math.asin(o[1] / d), Math.log(d), Math.log(fpx), cx, cy];
}
export function camOf(v: number[]): CamState {
  const [tx, ty, tz, az, el, ld, lf, cx, cy] = v, d = Math.exp(ld);
  return {
    target: [tx, ty, tz],
    eye: [tx + Math.sin(az) * Math.cos(el) * d, ty + Math.sin(el) * d, tz + Math.cos(az) * Math.cos(el) * d],
    fpx: Math.exp(lf), cx, cy,
  };
}

/** How each move between two rests is shaped (in screens of scroll). */
export interface Shape {
  /** after a rest, the camera has moved `ease` of the way by `leave` screens */
  leave: number;
  /** before the next rest, it is `ease` short of it `settle` screens ahead of the rest */
  settle: number;
  ease: number;
  /** a pulled back view half way, which holds both things (out: how much further than the farther rest, as a factor;
   *  lift: degrees higher) */
  via?: { out?: number; lift?: number; frame?: number };
}

/** The keys of the whole film: rests[i] is scene i+1's rest camera and its playhead; holds lists the rests the camera
 *  also holds from an earlier playhead (scene 1 from the top) or to a later one (the last scene to the end). */
export function keysOf(rests: { y: number; v: number[] }[], shapes: Shape[], vh: number, from: { y: number; v: number[] } | null, to: { y: number; v: number[] } | null): Key[] {
  const keys: Key[] = [];
  if (from) keys.push({ y: from.y, v: [...from.v, 0] });
  // the turn takes the short way round from each rest to the next
  const vs = rests.map((r) => [...r.v]);
  for (let i = 1; i < vs.length; i++) while (vs[i][3] - vs[i - 1][3] > Math.PI) vs[i][3] -= 2 * Math.PI;
  for (let i = 1; i < vs.length; i++) while (vs[i][3] - vs[i - 1][3] < -Math.PI) vs[i][3] += 2 * Math.PI;
  // a tenth number: where the camera is in the film, i at scene i+1's rest (src/world/film3d.ts mixes the stills by it)
  vs.forEach((v, i) => v.push(i));
  const lerp = (a: number[], b: number[], t: number) => a.map((x, j) => x + (b[j] - x) * t);
  for (let i = 0; i < rests.length; i++) {
    keys.push({ y: rests[i].y, v: vs[i] });
    if (i === rests.length - 1) break;
    const s = shapes[i], a = vs[i], b = vs[i + 1];
    // one camera (scenes 6 and 7): no keys between (the tenth number, where the camera is, runs straight on)
    const same = a.every((x, j) => j > 8 || Math.abs(x - b[j]) < 1e-9);
    if (same) continue;
    const y0 = rests[i].y, y1 = rests[i + 1].y;
    const yl = Math.min(y0 + s.leave * vh, (y0 + y1) / 2 - 1), ys = Math.max(y1 - s.settle * vh, yl + 1);
    keys.push({ y: yl, v: lerp(a, b, s.ease) });
    if (s.via) {
      // half way; the framing (what it looks at, and where on the screen) may lead (frame: its share of the way)
      const m = lerp(a, b, 0.5), f = s.via.frame ?? 0.5;
      for (const j of [0, 1, 2, 6, 7, 8]) m[j] = a[j] + (b[j] - a[j]) * f;
      m[4] += (s.via.lift ?? 0) * (Math.PI / 180);
      if (s.via.out) m[5] = Math.max(a[5], b[5]) + Math.log(s.via.out);
      keys.push({ y: (yl + ys) / 2, v: m });
    }
    keys.push({ y: ys, v: lerp(a, b, 1 - s.ease) });
  }
  if (to && to.y > rests[rests.length - 1].y) keys.push({ y: to.y, v: vs[vs.length - 1] });
  return keys;
}

/** The camera at playhead y: each number eased between its keys (monotone cubic: no swing past a key). */
export function at(keys: Key[], y: number): number[] {
  if (y <= keys[0].y) return keys[0].v;
  const last = keys[keys.length - 1];
  if (y >= last.y) return last.v;
  let i = 0;
  while (i < keys.length - 2 && y > keys[i + 1].y) i++;
  const k0 = keys[i], k1 = keys[i + 1], h = k1.y - k0.y, t = (y - k0.y) / h;
  // exactly the key at a key (a rest is the still)
  if (t <= 0) return k0.v;
  if (t >= 1) return k1.v;
  const slope = (j: number, c: number): number => {
    // Fritsch and Carlson: the average of the two sides, zero at a turn or a hold, never more than three times either
    const a = keys[j - 1], b = keys[j], d = keys[j + 1];
    if (!a || !d) return 0;
    const s0 = (b.v[c] - a.v[c]) / (b.y - a.y), s1 = (d.v[c] - b.v[c]) / (d.y - b.y);
    if (s0 * s1 <= 0) return 0;
    const m = (s0 + s1) / 2;
    return Math.sign(m) * Math.min(Math.abs(m), 3 * Math.abs(s0), 3 * Math.abs(s1));
  };
  const t2 = t * t, t3 = t2 * t;
  return k0.v.map((p0, c) => {
    const p1 = k1.v[c], m0 = slope(i, c) * h, m1 = slope(i + 1, c) * h;
    return (2 * t3 - 3 * t2 + 1) * p0 + (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) * p1 + (t3 - t2) * m1;
  });
}
