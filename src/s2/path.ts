// Scene 2 in 3D (look 11): one camera move and one light, keyed along the scroll, shared by the live 3D version (A)
// and the frames rendered ahead of time (B, written by scripts/s2-frames.mjs). Pure numbers, no three.js, so the
// frame script can read it in Node.
//
// s: where the playhead is in scene 2, in screens from the scene's top (the film's own measure). The change into the
// scene runs from -0.9 to -0.1, the light rests at 1.12 (the film's rest: 0.8 of the scene's 1.4 screens of light),
// the change out runs from 1.5 to 2.3. At the rest every number is exactly the still picture's own (pass 3 of
// the stills project's out5/s2v2-*-p3@2x.json), so the scene at rest is today's composition.

export type Form = 'desktop' | 'phone';

/** the first and last place of the move, and the rest */
export const S_FROM = -0.9, S_REST = 1.12, S_TO = 2.3;

/** a camera as the stills set it: turned az (plus = to the right) and raised el round the look point, dist mm away,
 *  a 30 degree lens (top to bottom), the picture slid by sx, sy of its width and height (a lens shift) */
export interface Cam { az: number; el: number; dist: number; lx: number; ly: number; lz: number; sx: number; sy: number }

/** The phone: where it taps tile 3 (from the left) and where it is lifted to face the camera. pos mm, rot degrees
 *  (order YXZ, as the stills). The tap pose is the stills' own (tap mode), written out as a position and a turn by
 *  scripts/s2-frames.mjs --tap. */
export interface Pose { pos: [number, number, number]; rot: [number, number, number] }

interface FormPath { keys: [number, Cam][]; tap: Pose; lift: Pose; aim: [number, number, number] }

export const PATH: Record<Form, FormPath> = {
  desktop: {
    keys: [
      [S_FROM, { az: 38, el: 22, dist: 750, lx: 0, ly: 50, lz: 10, sx: 0.12, sy: -0.05 }],
      [S_REST, { az: 30, el: 20, dist: 680, lx: 0, ly: 50, lz: 10, sx: 0.13, sy: -0.05 }],
      [S_TO, { az: 23, el: 18.5, dist: 640, lx: 0, ly: 50, lz: 10, sx: 0.14, sy: -0.05 }],
    ],
    tap: { pos: [62.16, 26.05, 74.24], rot: [-2.36, 38.625, 9.59] },
    lift: { pos: [124, 91.9, 39.8], rot: [71.2, 20.5, -3] },
    aim: [20, 30, 30],
  },
  phone: {
    keys: [
      [S_FROM, { az: 36, el: 34, dist: 1010, lx: 0, ly: 55, lz: 20, sx: 0, sy: 0.03 }],
      [S_REST, { az: 28, el: 32, dist: 920, lx: 0, ly: 55, lz: 20, sx: 0, sy: 0.03 }],
      [S_TO, { az: 22, el: 30.5, dist: 875, lx: 0, ly: 55, lz: 20, sx: 0, sy: 0.03 }],
    ],
    tap: { pos: [55.2, 35.06, 77.34], rot: [-9.505, 32.63, 8.662] },
    lift: { pos: [33.2, 98.8, 116.5], rot: [56.9, 29.4, -3] },
    aim: [10, 30, 30],
  },
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => { const u = clamp(t); return u * u * (3 - 2 * u); };
const ramp = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

/** One number of the camera at s: a cubic through the three keys, with the slope at the rest the average of the two
 *  stretches (so the move passes through the rest without stopping) and each end leaving or arriving gently. */
function track(keys: [number, Cam][], k: keyof Cam, s: number): number {
  const [[s0, a], [s1, b], [s2, c]] = keys;
  const v0 = a[k], v1 = b[k], v2 = c[k];
  const m1 = (v2 - v0) / (s2 - s0);
  const herm = (t: number, p0: number, p1: number, m0: number, mm1: number, h: number) => {
    const t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * p0 + (t3 - 2 * t2 + t) * h * m0 + (-2 * t3 + 3 * t2) * p1 + (t3 - t2) * h * mm1;
  };
  if (s <= s1) {
    const h = s1 - s0, t = clamp((s - s0) / h);
    // arriving: starts slow (a quarter of the stretch's own slope)
    return herm(t, v0, v1, 0.25 * (v1 - v0) / h, m1, h);
  }
  const h = s2 - s1, t = clamp((s - s1) / h);
  return herm(t, v1, v2, m1, 0.6 * (v2 - v1) / h, h);
}

export interface Shot {
  cam: Cam;
  /** the key light's strength, a share of the stills' own (1 at and after the light has come up) */
  key: number;
  /** the phone between its tap (0) and lifted (1) poses */
  lift: number;
  /** the mint ring round the tapped tile (the stills: 10 at the tap, 4 once the phone is lifted) */
  glow: number;
  /** the screen's own light (the stills: 1.8 when on) */
  screen: number;
}

/** Everything of scene 2 at s. The phone taps as the second light came in today (s 0.11 to 0.45) and lifts as the
 *  third did (0.67 to 1.01), so the scene keeps today's beats. */
export function shotAt(form: Form, s: number): Shot {
  const keys = PATH[form].keys;
  const cam = {} as Cam;
  for (const k of Object.keys(keys[0][1]) as (keyof Cam)[]) cam[k] = s >= S_REST - 1e-6 && s <= S_REST + 1e-6 ? keys[1][1][k] : track(keys, k, s);
  const on = smooth(ramp(s, 0.11, 0.45));
  const lift = smooth(ramp(s, 0.67, 1.01));
  return {
    cam,
    key: 0.3 + 0.7 * smooth(ramp(s, S_FROM, 0)),
    lift,
    glow: on * (10 - 6 * lift),
    screen: 1.8 * on,
  };
}
