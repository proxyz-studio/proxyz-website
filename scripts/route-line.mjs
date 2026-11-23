#!/usr/bin/env node
// Build 12H: the race piece's route as one line on the coin, for scene 6's board coming alive (the route draws itself in
// along its real line). Read from the real files, run by hand like npm run board:
//   node scripts/route-line.mjs <the stills project folder>
// The line is the race's own GPX track (models/coin-lines/samui-course.gpx), placed on the coin exactly as the print
// file placed it (the route part's box, pt/tools/pt/coin-lines/route.pos.bin: centred, the scale fitted to its length
// north to south), each point at the height of the route's top there. Writes src/film/route.json (coin mm: x east,
// y up, z south; the coin's middle at 0, its underside at 0), which scripts/board.mjs projects into the pictures.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = process.argv[2];
if (!SRC) { console.error('usage: node scripts/route-line.mjs <stills project folder>'); process.exit(2); }
const gpx = readFileSync(join(SRC, 'models/coin-lines/samui-course.gpx'), 'utf8');
const ll = [...gpx.matchAll(/<trkpt lat="([-\d.]+)" lon="([-\d.]+)"/g)].map((m) => [+m[1], +m[2]]);
const buf = readFileSync(join(SRC, 'pt/tools/pt/coin-lines/route.pos.bin'));
const P = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
for (let i = 0; i < P.length; i++) { const k = i % 3; lo[k] = Math.min(lo[k], P[i]); hi[k] = Math.max(hi[k], P[i]); }
// the track in metres (east, north) round its own box's middle
const lat0 = ll.reduce((s, p) => s + p[0], 0) / ll.length, R = 6371008.8, D = Math.PI / 180;
const en = ll.map(([la, lo2]) => [lo2 * D * R * Math.cos(lat0 * D), la * D * R]);
const ex = [Math.min(...en.map((p) => p[0])), Math.max(...en.map((p) => p[0]))], ny = [Math.min(...en.map((p) => p[1])), Math.max(...en.map((p) => p[1]))];
// the printed route is a ribbon: its box is the track's box plus half its width all round
const half = 0.5;
const s = (hi[2] - lo[2] - 2 * half) / (ny[1] - ny[0]);
const sx = (hi[0] - lo[0] - 2 * half) / (ex[1] - ex[0]);
const cx = (lo[0] + hi[0]) / 2, cz = (lo[2] + hi[2]) / 2;
const flat = en.map(([e, n]) => [cx + (e - (ex[0] + ex[1]) / 2) * s, cz - (n - (ny[0] + ny[1]) / 2) * s]);
// the route's top at each point: the highest route vertex within 0.9 mm (a grid of its vertices)
const cell = 1, grid = new Map();
for (let i = 0; i < P.length; i += 3) { const k = Math.floor(P[i] / cell) + ',' + Math.floor(P[i + 2] / cell); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(i); }
const top = ([x, z]) => {
  let y = -Infinity;
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (const i of grid.get((Math.floor(x / cell) + a) + ',' + (Math.floor(z / cell) + b)) ?? []) if (Math.hypot(P[i] - x, P[i + 2] - z) < 0.9) y = Math.max(y, P[i + 1]);
  return y;
};
// thinned to points at least 1 mm apart, each with its height
const out = [];
for (const p of flat) if (!out.length || Math.hypot(p[0] - out[out.length - 1][0], p[1] - out[out.length - 1][2]) >= 1.0) out.push([p[0], top(p), p[1]]);
const miss = out.filter((p) => !Number.isFinite(p[1])).length;
for (let i = 0; i < out.length; i++) if (!Number.isFinite(out[i][1])) out[i][1] = out[i - 1]?.[1] ?? 4;
const r2 = (v) => Math.round(v * 100) / 100;
writeFileSync(join(ROOT, 'src/film/route.json'), JSON.stringify({ _note: 'Made by scripts/route-line.mjs from the race GPX track and the coin print file. Do not edit by hand.', scale: { ns: r2(s * 1000), ew: r2(sx * 1000) }, pts: out.map((p) => p.map(r2)) }) + '\n');
console.log(`route: ${ll.length} track points, ${out.length} kept, ${miss} with no route under them (scale north to south ${(s * 1000).toFixed(3)} mm a km, east to west ${(sx * 1000).toFixed(3)})`);
