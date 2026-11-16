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

/* ---------- one form ---------- */
function form(F) {
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

  // the picture boxes kept clear (the giant words), and the floor kept clear around the things, the chip, the routes
  const keep = (q) => { const [x, y] = P(q[0], q[1]); return F.keep.some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1); };
  const excluded = (p) => {
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
    const body = ax === 0 ? [[x - 6, z - 3], [x + 6, z - 3], [x + 6, z + 3], [x - 6, z + 3]] : [[x - 3, z - 6], [x + 3, z - 6], [x + 3, z + 6], [x - 3, z + 6]];
    const ends = ax === 0 ? [[x - 9, z], [x + 9, z]] : [[x, z - 9], [x, z + 9]];
    net.push(poly(body));
    for (const [px, pz] of ends) net.push(poly([[px - 2, pz - 2], [px + 2, pz - 2], [px + 2, pz + 2], [px - 2, pz + 2]]));
  }

  // the chip: its top 4 mm up, the two sides the camera sees, an inner square, the pins, a dot in the middle
  const H = 4, sq = (o) => [[cx - CH + o, cz - CH + o], [cx + CH - o, cz - CH + o], [cx + CH - o, cz + CH - o], [cx - CH + o, cz + CH - o]];
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
  // the label's leader: from one corner of the chip's top, out at 45 degrees, then a short run to the word
  const { corner: [kx, kz], leader: [ldx, ldy, run], next: nextSide } = F.label;
  const corner = P(cx + kx * CH, cz + kz * CH, H);
  const bend = [corner[0] + ldx, corner[1] + ldy], end = [bend[0] + run, bend[1]];

  const live = {};
  for (const k of ['stand', 'coin', 'phone']) {
    const r = routes[k];
    live[k] = {
      pts: r.map((q) => pt(q)),
      side: [-G, G].map((d) => subLine(offsetLine(r, d), 0.3, 0.78).map((q) => pt(q))),
      pad: poly(pads[k]),
    };
  }
  const nextAt = pt([ex, nextSide === 'above' ? ez - ER - 4 : ez + ER + 4]);
  return {
    size: F.size,
    pool: F.pool,
    net: net.join(''),
    vias: vias.map((q) => `M${pt(q)}h0`).join(''),
    chip: {
      top: poly(top, true, H), inner: poly(sq(9), true, H), sides, pins: pins.join(''), dot: cc,
      glow: [r1(c0[0]), r1(c0[1]), r1(Math.abs(ex1[0] - c0[0])), r1(Math.abs(ez1[1] - ez2[1]) / 2)],
      leader: [corner, bend, end].map((q) => q.map(r1)),
    },
    live,
    empty: { pts: routes.empty.map((q) => pt(q)), pad: poly(pads.empty) },
    // where the words sit: the chip's word to the right (r) or left (l) of its leader, NEXT below (b) or above (a)
    labels: { studio: end.map(r1), studioSide: run < 0 ? 'l' : 'r', next: nextAt, nextSide: nextSide === 'above' ? 'a' : 'b' },
    footprints: {
      stand: poly(rect(T.stand[0], T.stand[1], T.stand[3], T.stand[4], T.stand[2])),
      coin: poly(circle(T.coin[0], T.coin[1], T.coin[2], 120)),
      phone: poly(rect(T.phone[0], T.phone[1], T.phone[3], T.phone[4], T.phone[2])),
    },
  };
}

const out = { _note: 'Made by scripts/board.mjs from src/film/board.json. Do not edit by hand.', desktop: form(layout.forms.desktop), phone: form(layout.forms.phone) };
const proof = process.argv.indexOf('--proof');
if (proof > 0) {
  const f = out[process.argv[proof + 1]];
  const [W, H] = f.size;
  console.log(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" fill="none" stroke-width="1">` +
    Object.values(f.footprints).map((d) => `<path d="${d}" stroke="#00ff66"/>`).join('') + '</svg>');
} else {
  writeFileSync(ROOT + 'src/generated/board.json', JSON.stringify(out) + '\n');
  console.log(`board: wrote src/generated/board.json (${['desktop', 'phone'].map((k) => `${k} ${JSON.stringify(out[k]).length} bytes`).join(', ')})`);
}
