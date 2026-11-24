#!/usr/bin/env node
// Scene 6, the board: projects the floor layout of src/film/board.json (millimetres on the floor) through each
// drawing's own camera into picture pixels and writes src/generated/board.json, which the pages and the film read.
// Run by hand after a change to the layout (npm run board). The camera is the drawing program's: a pinhole looking
// from (az, el, dist) at (lx, ly, lz), vertical field of view fov, the picture shifted by (sx, sy) of its size.
//
//   node scripts/board.mjs [--proof <form>]   --proof prints the footprints of the three things as SVG (for a proof
//                                            sheet over the drawing; not used by the site)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const layout = JSON.parse(readFileSync(ROOT + 'src/film/board.json', 'utf8'));
const film = JSON.parse(readFileSync(ROOT + 'src/film/scenes.json', 'utf8'));
// the words of the five labels, for the room the net leaves them (never copied: read from the content file)
const content = JSON.parse(readFileSync(ROOT + 'content/site.json', 'utf8'));
// build 12H: the race route as one line on the coin (scripts/route-line.mjs, from the GPX track and the print file)
const ROUTE = JSON.parse(readFileSync(ROOT + 'src/film/route.json', 'utf8')).pts;
const WORDS = content.scenes.find((s) => s.board)?.board ?? { chip: '', next: '' };
const nameOf = (t) => content.ventures.find((v) => v.id === layout.ventures[t])?.name ?? '';
const DEG = Math.PI / 180;
const G = layout.grid;
const r1 = (v) => Math.round(v * 10) / 10;

/* ---------- the camera ---------- */
function camera(c, [W, H]) {
  const sub = (a, b) => a.map((v, i) => v - b[i]);
  const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const nrm = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };
  const look = [c.lx, c.ly, c.lz];
  const d = [Math.sin(c.az * DEG) * Math.cos(c.el * DEG), Math.sin(c.el * DEG), Math.cos(c.az * DEG) * Math.cos(c.el * DEG)];
  const pos = look.map((l, i) => l + d[i] * c.dist);
  const f = nrm(sub(look, pos)), r = nrm(cross(f, [0, 1, 0])), u = cross(r, f);
  const t = Math.tan((c.fov / 2) * DEG);
  /** a floor point (x, z) at height y, in picture pixels */
  return (x, z, y = 0) => {
    const p = sub([x, y, z], pos);
    const nx = dot(p, r) / (dot(p, f) * t * (W / H)), ny = dot(p, u) / (dot(p, f) * t);
    return [((nx + 1) / 2) * W + (c.sx ?? 0) * W, ((1 - ny) / 2) * H - (c.sy ?? 0) * H];
  };
}

/* ---------- floor shapes (millimetres) ---------- */
const rect = (cx, cz, w, l, turn) => {
  const c = Math.cos(turn * DEG), s = Math.sin(turn * DEG);
  return [[-w / 2, -l / 2], [w / 2, -l / 2], [w / 2, l / 2], [-w / 2, l / 2]].map(([a, b]) => [cx + a * c + b * s, cz - a * s + b * c]);
};
const circle = (cx, cz, R, n = 96) => Array.from({ length: n }, (_, i) => [cx + R * Math.cos((2 * Math.PI * i) / n), cz + R * Math.sin((2 * Math.PI * i) / n)]);
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const plen = (pts) => pts.slice(1).reduce((s, p, i) => s + dist(pts[i], p), 0);
function inPoly(p, fp) {
  let c = false;
  for (let i = 0, j = fp.length - 1; i < fp.length; j = i++) {
    const a = fp[i], b = fp[j];
    if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}
function segDist(p, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz;
  const t = L2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / L2)) : 0;
  return dist(p, [a[0] + dx * t, a[1] + dz * t]);
}
/** where a route first meets a closed outline: the route up to that point */
function clipRoute(route, pad) {
  const out = [route[0]];
  for (let i = 0; i < route.length - 1; i++) {
    const a = route[i], b = route[i + 1];
    let best = null;
    for (let k = 0; k < pad.length; k++) {
      const p = pad[k], q = pad[(k + 1) % pad.length];
      const r = [b[0] - a[0], b[1] - a[1]], s = [q[0] - p[0], q[1] - p[1]];
      const den = r[0] * s[1] - r[1] * s[0];
      if (Math.abs(den) < 1e-9) continue;
      const t = ((p[0] - a[0]) * s[1] - (p[1] - a[1]) * s[0]) / den;
      const u = ((p[0] - a[0]) * r[1] - (p[1] - a[1]) * r[0]) / den;
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1 && (best === null || t < best)) best = t;
    }
    if (best !== null) { out.push([a[0] + (b[0] - a[0]) * best, a[1] + (b[1] - a[1]) * best]); return out; }
    out.push(b);
  }
  return out;
}
/** a parallel line at d mm (to the left), mitred corners */
function offsetLine(pts, d) {
  const n = (a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz); return [-dz / L, dx / L]; };
  return pts.map((p, i) => {
    if (i === 0) { const m = n(pts[0], pts[1]); return [p[0] + m[0] * d, p[1] + m[1] * d]; }
    if (i === pts.length - 1) { const m = n(pts[i - 1], p); return [p[0] + m[0] * d, p[1] + m[1] * d]; }
    const a = n(pts[i - 1], p), b = n(p, pts[i + 1]), k = 1 + a[0] * b[0] + a[1] * b[1];
    return [p[0] + (d * (a[0] + b[0])) / k, p[1] + (d * (a[1] + b[1])) / k];
  });
}
/** the part of a line between two shares of its length */
function subLine(pts, f0, f1) {
  const L = plen(pts), a = f0 * L, b = f1 * L, out = [];
  let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const p = pts[i], q = pts[i + 1], s = dist(p, q), lo = Math.max(a, acc), hi = Math.min(b, acc + s);
    if (lo <= hi && s > 0) {
      const at = (v) => [p[0] + ((q[0] - p[0]) * (v - acc)) / s, p[1] + ((q[1] - p[1]) * (v - acc)) / s];
      if (!out.length) out.push(at(lo));
      out.push(at(hi));
    }
    acc += s;
  }
  return out;
}

/* ---------- when each thing's light has come ---------- */
/** How far the light of pass k (1 the second pass) covers the floor points pts (picture pixels) when that pass's
 *  strength is t: the film's own arithmetic (src/main.ts light(): the pass shows through an oval that grows from the
 *  old pool to 1.6 times the new one, solid to 68% of its radius, with an opacity of t / 0.12 at the start). */
function cover(view, k, t, pts) {
  if (t >= 1) return 1;
  if (t <= 0) return 0;
  const a = view.opens[k - 1], b = view.opens[k], e = t * t * (3 - 2 * t), L = (u, v, g = 1) => u + (v * g - u) * e;
  const cx = L(a[0], b[0]), cy = L(a[1], b[1]), rx = L(a[2], b[2], 1.6), ry = L(a[3], b[3], 1.6), o = Math.min(1, t / 0.12);
  let s = 0;
  for (const [x, y] of pts) { const d = Math.hypot((x - cx) / rx, (y - cy) / ry); s += d <= 0.68 ? 1 : d >= 1 ? 0 : 1 - (d - 0.68) / 0.32; }
  return (o * s) / pts.length;
}
/** The pass strengths at which the light covers 40% and 70% of a thing (its floor outline, filled). */
function arrival(view, k, outline) {
  const xs = outline.map((p) => p[0]), ys = outline.map((p) => p[1]), pts = [];
  for (let x = Math.min(...xs); x <= Math.max(...xs); x += 2) for (let y = Math.min(...ys); y <= Math.max(...ys); y += 2) if (inPoly([x, y], outline)) pts.push([x, y]);
  if (!view.opens) return [0.4, 0.7];
  let t40 = 1, t70 = 1;
  for (let t = 1; t >= 0; t -= 0.001) { const c = cover(view, k, t, pts); if (c >= 0.4) t40 = t; if (c >= 0.7) t70 = t; }
  return [+t40.toFixed(3), +t70.toFixed(3)];
}

/* ---------- the room each label takes ---------- */
// As style.css draws them: IBM Plex Mono (each letter 0.6 em wide) plus the letter spacing, line height 1 (the letters
// reach about 0.15 em above and below the line box); the size grows with the picture above scale 1, up to twice the
// base (clamp(base, scale * base, 2 * base)); the word stands off its point by LABEL_SHIFT in build/board.ts, in
// screen pixels.
const LABEL_TYPE = { chip: [14, 0.06], name: [12, 0.08], next: [12, 0.08] };
/** a label's box in screen pixels around its point, at font size s: [x0, y0, x1, y1] */
function labelRect(side, chars, s, track) {
  const w = chars * (0.6 + track) * s, t = -0.2 * s, b = 1.2 * s;   // the letters, from the element's top
  switch (side) {
    case 'r': return [8, t - s / 2, 8 + w, b - s / 2];
    case 'l': return [-8 - w, t - s / 2, -8, b - s / 2];
    case 'b': return [-w / 2, 4 + t, w / 2, 4 + b];
    case 'a': return [-w / 2, -4 - s + t, w / 2, -4 - s + b];
    case 'd': return [0, 4 + t, w, 4 + b];
    default: throw new Error(`board: no label side ${side}`);
  }
}
/** The picture pixel box a label may take at any scale from minScale up, with pad screen pixels round it. */
function labelKeep([x, y], side, word, kind, minScale, pad) {
  const [base, track] = LABEL_TYPE[kind], out = [Infinity, Infinity, -Infinity, -Infinity];
  for (const k of [minScale, (minScale + 1) / 2, 1, 1.25, 1.5, 2, 3, 6]) {
    const s = Math.min(2 * base, Math.max(base, k * base)), r = labelRect(side, word.length, s, track);
    const q = [x + (r[0] - pad) / k, y + (r[1] - pad) / k, x + (r[2] + pad) / k, y + (r[3] + pad) / k];
    out[0] = Math.min(out[0], q[0]); out[1] = Math.min(out[1], q[1]); out[2] = Math.max(out[2], q[2]); out[3] = Math.max(out[3], q[3]);
  }
  return out;
}

/* ---------- one form ---------- */
function form(F, key) {
  const P = camera(F.camera, F.size);
  const pt = ([x, z], y = 0) => P(x, z, y).map(r1);
  const T = F.things, gap = layout.padGap;
  const [cx, cz, CH] = F.chip, [ex, ez, ER] = F.empty;
  const pads = {
    stand: rect(T.stand[0], T.stand[1], T.stand[3] + 2 * gap, T.stand[4] + 2 * gap, T.stand[2]),
    coin: circle(T.coin[0], T.coin[1], T.coin[2] + gap, 120),
    phone: rect(T.phone[0], T.phone[1], T.phone[3] + 2 * gap, T.phone[4] + 2 * gap, T.phone[2]),
    empty: circle(ex, ez, ER, 120),
  };
  const routes = Object.fromEntries(Object.entries(F.routes).map(([k, r]) => [k, clipRoute(r, pads[k])]));
  for (const [k, r] of Object.entries(routes)) if (r.length < 2 || dist(r[r.length - 1], F.routes[k][F.routes[k].length - 1]) < 1e-6) throw new Error(`board: the ${k} route of a form never meets its pad`);

  // the label's leader: from one corner of the chip's top, out at 45 degrees, then a short run to the word (none when
  // the word hangs below the leader's end)
  const H = 4;
  const { corner: [kx, kz], leader: [ldx, ldy, run], next: nextSide, side: studioSideSet } = F.label;
  const corner = P(cx + kx * CH, cz + kz * CH, H);
  const bend = [corner[0] + ldx, corner[1] + ldy], end = [bend[0] + run, bend[1]];
  const studioSide = studioSideSet ?? (run < 0 ? 'l' : 'r');
  const nextAt = pt([ex, nextSide === 'above' ? ez - ER - 4 : ez + ER + 4]);
  const names = Object.fromEntries(Object.entries(F.names).map(([t, [x, y, side]]) => [t, { at: [x, y], side, venture: layout.ventures[t] }]));
  // the picture boxes kept clear (the giant words), and the floor kept clear around the things, the chip, the routes
  const keep = (q) => { const [x, y] = P(q[0], q[1]); return F.keep.some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1); };
  // the five labels: no net line, dot or part within 6 screen pixels of a label's letters (3 more for a dot's radius
  // and the soft edge of a line), at every scale the form is shown at
  const PAD = 9;
  const labelKeeps = [
    labelKeep(end, studioSide, WORDS.chip, 'chip', F.minScale, PAD),
    labelKeep(nextAt, nextSide === 'above' ? 'a' : 'b', WORDS.next, 'next', F.minScale, PAD),
    ...Object.entries(names).map(([t, n]) => labelKeep(n.at, n.side, nameOf(t), 'name', F.minScale, PAD)),
  ];
  const nearLabel = (q) => { const [x, y] = P(q[0], q[1]); return labelKeeps.some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1); };
  const excluded = (p) => {
    if (nearLabel(p)) return true;
    if (inPoly(p, rect(T.stand[0], T.stand[1], T.stand[3] + 40, T.stand[4] + 40, T.stand[2]))) return true;
    if (inPoly(p, rect(T.phone[0], T.phone[1], T.phone[3] + 36, T.phone[4] + 36, T.phone[2]))) return true;
    if (dist(p, T.coin) < T.coin[2] + 20) return true;
    if (dist(p, [ex, ez]) < ER + 14) return true;
    if (Math.abs(p[0] - cx) < CH + 20 && Math.abs(p[1] - cz) < CH + 20) return true;
    for (const r of Object.values(routes)) for (let i = 0; i < r.length - 1; i++) if (segDist(p, r[i], r[i + 1]) < 20) return true;
    return keep(p);
  };
  /** a floor line with the excluded parts taken out, as picture path data */
  const clipped = (pts, step = 2) => {
    const parts = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.round(dist(a, b) / step));
      let run = null;
      for (let k = 0; k <= n; k++) {
        const q = [a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n];
        if (excluded(q)) { if (run && dist(run[0], run[1]) > 0) parts.push(run); run = null; }
        else run = run ? [run[0], q] : [q, q];
      }
      if (run && dist(run[0], run[1]) > 0) parts.push(run);
    }
    return parts.map(([a, b]) => `M${pt(a)}L${pt(b)}`).join('');
  };
  const poly = (fp, close = true, y = 0) => 'M' + fp.map((q) => pt(q, y).join(',')).join('L') + (close ? 'Z' : '');

  // the net: buses, the dots at their ends and in rows, and a few empty part footprints
  const net = [], vias = [];
  for (const [centre, n] of F.buses) {
    for (let j = 0; j < n; j++) {
      const d = (j - (n - 1) / 2) * G, line = d ? offsetLine(centre, d) : centre;
      net.push(clipped(line));
      for (const e of [line[0], line[line.length - 1]]) if (!excluded(e)) vias.push(e);
    }
  }
  for (const [[x, z], [dx, dz], n] of F.vias) for (let k = 0; k < n; k++) { const q = [x + dx * G * k, z + dz * G * k]; if (!excluded(q)) vias.push(q); }
  for (const [x, z, ax] of F.parts) {
    if (excluded([x, z])) continue;
    // a part reaches 11 mm from its middle: all of it stays clear of the labels
    if ([[x - 11, z - 3], [x + 11, z - 3], [x + 11, z + 3], [x - 11, z + 3], [x - 3, z - 11], [x + 3, z - 11], [x + 3, z + 11], [x - 3, z + 11]].some(nearLabel)) continue;
    const body = ax === 0 ? [[x - 6, z - 3], [x + 6, z - 3], [x + 6, z + 3], [x - 6, z + 3]] : [[x - 3, z - 6], [x + 3, z - 6], [x + 3, z + 6], [x - 3, z + 6]];
    const ends = ax === 0 ? [[x - 9, z], [x + 9, z]] : [[x, z - 9], [x, z + 9]];
    net.push(poly(body));
    for (const [px, pz] of ends) net.push(poly([[px - 2, pz - 2], [px + 2, pz - 2], [px + 2, pz + 2], [px - 2, pz + 2]]));
  }

  // the chip: its top 4 mm up, the two sides the camera sees, an inner square, the pins, a dot in the middle
  const sq = (o) => [[cx - CH + o, cz - CH + o], [cx + CH - o, cz - CH + o], [cx + CH - o, cz + CH - o], [cx - CH + o, cz + CH - o]];
  const top = sq(0), pins = [];
  for (let i = 0; i < 8; i++) {
    const o = -CH + 6 + (i * (2 * CH - 12)) / 7;
    for (const [a, b] of [[[cx + o, cz - CH], [cx + o, cz - CH - 6]], [[cx + o, cz + CH], [cx + o, cz + CH + 6]], [[cx - CH, cz + o], [cx - CH - 6, cz + o]], [[cx + CH, cz + o], [cx + CH + 6, cz + o]]]) pins.push(`M${pt(a)}L${pt(b)}`);
  }
  // the sides that face the camera: those whose outward normal points toward it (z up and x toward the camera's side)
  const sides = [];
  const c = F.camera, toward = [Math.sin(c.az * DEG), Math.cos(c.az * DEG)];
  for (let i = 0; i < 4; i++) {
    const a = top[i], b = top[(i + 1) % 4], nx = (b[1] - a[1]), nz = -(b[0] - a[0]);
    // the square runs clockwise on the floor seen from above, so (nx, nz) points out
    if (nx * toward[0] + nz * toward[1] > 0) sides.push(`M${pt(a).join(',')}L${pt(b).join(',')}L${pt(b, H).join(',')}L${pt(a, H).join(',')}Z`);
  }
  const cc = pt([cx, cz], H);
  const ex1 = P(cx + 110, cz), ez1 = P(cx, cz + 110), ez2 = P(cx, cz - 110), c0 = P(cx, cz);

  const live = {};
  for (const k of ['stand', 'coin', 'phone']) {
    const r = routes[k];
    live[k] = {
      pts: r.map((q) => pt(q)),
      side: [-G, G].map((d) => subLine(offsetLine(r, d), 0.3, 0.78).map((q) => pt(q))),
      pad: poly(pads[k]),
    };
  }
  return {
    size: F.size,
    pool: F.pool,
    net: net.join(''),
    vias: vias.map((q) => `M${pt(q)}h0`).join(''),
    chip: {
      top: poly(top, true, H), inner: poly(sq(9), true, H), sides, pins: pins.join(''), dot: cc,
      glow: [r1(c0[0]), r1(c0[1]), r1(Math.abs(ex1[0] - c0[0])), r1(Math.abs(ez1[1] - ez2[1]) / 2)],
      leader: (run ? [corner, bend, end] : [corner, bend]).map((q) => q.map(r1)),
    },
    live,
    empty: { pts: routes.empty.map((q) => pt(q)), pad: poly(pads.empty) },
    // where the words sit: the chip's word to the right (r) or left (l) of its leader or hanging below its end (d),
    // NEXT below (b) or above (a); the three names by their things
    labels: { studio: end.map(r1), studioSide, next: nextAt, nextSide: nextSide === 'above' ? 'a' : 'b', names },
    // the boxes the net keeps clear for the labels (picture pixels; for the proof sheet and the check)
    labelKeeps: labelKeeps.map((b) => b.map(r1)),
    // the pass strengths at which the light covers 40% and 70% of the race piece (second pass) and the coach phone
    // (third pass): each trace's head reaches its pad at the 70% mark
    arrive: (() => {
      const view = film.scenes[String(film.brainScene)][key];
      const fp = (q) => q.map(([x, z]) => P(x, z));
      return {
        coin: arrival(view, 1, fp(circle(T.coin[0], T.coin[1], T.coin[2], 120))),
        phone: arrival(view, 2, fp(rect(T.phone[0], T.phone[1], T.phone[3], T.phone[4], T.phone[2]))),
      };
    })(),
    // build 12H, the board at work (src/main.ts alive): the four tile pictures on the stand's tiles (three corners each:
    // the icon's top left, top right and bottom left, its top toward the stand's back), the route on the coin, the coach
    // phone's lit screen and the dial on it
    alive: (() => {
      const A = layout.alive, [ty, tz] = A.tileTop, h = A.icon / 2, D = 15 * DEG;
      const up = [0, Math.cos(D), Math.sin(D)], back = [0, Math.sin(D), -Math.cos(D)];
      const [sx0, sz0, st] = T.stand, c = Math.cos(st * DEG), sn = Math.sin(st * DEG);
      const W = ([x, y, z]) => pt([sx0 + x * c + z * sn, sz0 - x * sn + z * c], y);
      const tiles = A.tiles.map((x) => {
        // build 12I: on the pictures' top, raised 1 mm on the tile as on TAPZ
        const m = [x + up[0] * 1, ty + up[1] * 1, tz + up[2] * 1];
        const at = (a, k) => [m[0] + a, m[1] + back[1] * k, m[2] + back[2] * k];
        return [W(at(-h, h)), W(at(h, h)), W(at(-h, -h))];
      });
      const route = ROUTE.map(([x, y, z]) => pt([T.coin[0] + x, T.coin[1] + z], y));
      return { tiles, route, screen: F.screen, dial: A.dial };
    })(),
    footprints: {
      stand: poly(rect(T.stand[0], T.stand[1], T.stand[3], T.stand[4], T.stand[2])),
      coin: poly(circle(T.coin[0], T.coin[1], T.coin[2], 120)),
      phone: poly(rect(T.phone[0], T.phone[1], T.phone[3], T.phone[4], T.phone[2])),
    },
  };
}

const out = { _note: 'Made by scripts/board.mjs from src/film/board.json. Do not edit by hand.', desktop: form(layout.forms.desktop, 'desktop'), phone: form(layout.forms.phone, 'phone') };
const proof = process.argv.indexOf('--proof');
if (proof > 0) {
  const f = out[process.argv[proof + 1]];
  const [W, H] = f.size;
  console.log(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" fill="none" stroke-width="1">` +
    Object.values(f.footprints).map((d) => `<path d="${d}" stroke="#00ff66"/>`).join('')
    + f.labelKeeps.map(([x0, y0, x1, y1]) => `<rect x="${x0}" y="${y0}" width="${r1(x1 - x0)}" height="${r1(y1 - y0)}" stroke="#ff00ff"/>`).join('') + '</svg>');
} else {
  writeFileSync(ROOT + 'src/generated/board.json', JSON.stringify(out) + '\n');
  console.log(`board: wrote src/generated/board.json (${['desktop', 'phone'].map((k) => `${k} ${JSON.stringify(out[k]).length} bytes`).join(', ')})`);
}
