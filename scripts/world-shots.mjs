// Build 12: the cameras, lights and poses of every still the film draws, copied from the stills' own settings into
// src/world/shots.json, so the live 3D film can cast each picture back from exactly where it was drawn.
//
//   node scripts/world-shots.mjs <the stills project folder>
//
// For each picture of pictures/sources.json (not the mattes) it reads the `.json` the picture maker saved beside the
// drawing (`<name>.json`, or `<name>@2x.json` for a 1x halved from a 2x drawing) and keeps: what was drawn (obj), the
// camera (turn az, height el, distance dist, look point, lens 30 degrees over the height, lens shift sx sy, the picture's
// shape), the one key light (where it stands, where it aims, its cone; or the soft panel of scene 3's first pass), and the
// poses that change between passes (scene 2's phone; the three things of scene 6). Every number in the stills' own
// millimetres, in the drawing's own room (src/world/world.ts places each room in the film's one world).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stills = process.argv[2];
if (!stills) { console.error('usage: node scripts/world-shots.mjs <stills project folder>'); process.exit(2); }
const sources = JSON.parse(readFileSync(path.join(root, 'pictures/sources.json'), 'utf8'));

// scene 2's phone where it taps a tile: the stills' tap mode (pt ptRound5.ts tapPose), written out as a pose. Build 12H:
// worked out here from the job's own numbers (tile, along, side, spin, tilt, gap) and the tile's face as the picture maker
// measures it (its notes: 30 mm squares tipped 15 degrees, their faces' middles at y 21.4, z 7.29); look 11 wrote the
// third tile's pose out by hand (desk 62.16, 26.05, 74.24 / -2.36, 38.625, 9.59), which this gives back within 0.01 mm
// and 0.01 degrees
function tapPose([tile, along, side, spin, tilt, gap = 0.3]) {
  const D = Math.PI / 180, T = 8, L = 150;
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const nrm = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };
  const add = (a, b, k = 1) => a.map((v, i) => v + b[i] * k);
  const turn = (v, k, t) => { const c = Math.cos(t), s = Math.sin(t), kv = cross(k, v), d = k[0] * v[0] + k[1] * v[1] + k[2] * v[2]; return v.map((x, i) => x * c + kv[i] * s + k[i] * d * (1 - c)); };
  const top = [[-51.9, -17.3, 17.3, 51.9][tile], 21.4, 7.29], up = [0, Math.cos(15 * D), Math.sin(15 * D)], fwd = [0, -Math.sin(15 * D), Math.cos(15 * D)];
  const ez0 = turn(fwd, up, spin * D), ex = nrm(cross(up, ez0)), ey = turn(up, ex, -tilt * D), ez = turn(ez0, ex, -tilt * D);
  const pos = add(add(add(add(top, fwd, along), nrm(cross(fwd, up)), side), ey, T / 2 + gap), ez, L / 2 - 2);
  const rot = [Math.asin(-Math.max(-1, Math.min(1, ez[1]))), Math.atan2(ez[0], ez[2]), Math.atan2(ex[1], ey[1])];
  return { pos: pos.map((v) => Math.round(v * 100) / 100), rot: rot.map((v) => Math.round((v / D) * 1000) / 1000) };
}
const DEG = Math.PI / 180;
const dirFrom = (az, el) => [Math.sin(az * DEG) * Math.cos(el * DEG), Math.sin(el * DEG), Math.cos(az * DEG) * Math.cos(el * DEG)];
const r1 = (v) => Math.round(v * 1000) / 1000;

const out = { _note: 'Made by scripts/world-shots.mjs from the stills\' own settings. Do not edit by hand.', pictures: {} };
for (const [key, v] of Object.entries(sources)) {
  if (key.startsWith('_') || (typeof v === 'object' && v.matte)) continue;
  const src = typeof v === 'string' ? v : v.src;
  let file = path.join(stills, src.replace(/\.png$/, '.json'));
  if (!existsSync(file)) file = path.join(stills, src.replace(/@1x\.png$/, '@2x.json'));
  if (!existsSync(file)) throw new Error(`no settings for ${key} (${src})`);
  const j = JSON.parse(readFileSync(file, 'utf8')).job;
  // the key light (ptDark.ts buildDarkScene): a spot (cone) at a fixed place or kdist from its aim, else a soft panel
  const target = j.obj === 'stand' ? [0, 60, 0] : j.obj === 'empty' ? [0, 0, 0] : [0, 8, 0];
  const aim = j.kax !== undefined ? [j.kax, j.kay, j.kaz2] : target;
  let light;
  if (j.kcone > 0) {
    const d = dirFrom(j.kaz, j.kel);
    const pos = j.kpx !== undefined ? [j.kpx, j.kpy, j.kpz] : aim.map((a, i) => a + d[i] * j.kdist);
    light = { kind: 'spot', pos: pos.map(r1), aim: aim.map(r1), cone: j.kcone, pen: j.kpen, int: j.kint };
  } else {
    const d = dirFrom(j.kaz, j.kel);
    light = { kind: 'panel', pos: target.map((a, i) => r1(a + d[i] * j.kdist)), aim: target, size: j.ksize, int: j.kint };
  }
  // build 12E: a black card (a flag) in the light's path keeps it off a thing (scene 5: the coin). The picture maker's fl
  // setting lists the cards, the key light's first; the live film carries that one (its centre and two half sides, mm)
  if (j.fl && light.kind === 'spot') {
    const n = String(j.fl).split(';')[0].split(',').map(Number);
    light.flag = { c: n.slice(0, 3), u: n.slice(3, 6), v: n.slice(6, 9) };
  }
  const shot = {
    obj: j.obj,
    cam: { az: j.az, el: j.el, dist: j.dist, look: [j.lx, j.ly, j.lz], fov: j.fov ?? 30, sx: j.sx ?? 0, sy: j.sy ?? 0, w: j.w, h: j.h },
    light,
  };
  if (j.obj === 'stand5') {
    const ph = String(j.ph5 ?? '').split(',');
    if (ph[0] === 'tap') shot.phone = tapPose(ph.slice(1).map(Number));
    else if (ph[0] === 'free') shot.phone = { pos: ph.slice(1, 4).map(Number), rot: ph.slice(4, 7).map(Number) };
    else shot.phone = null;
    if (j.scr) shot.screen = path.basename(j.scr);
  }
  if (j.obj === 'coach') {
    const ph = String(j.ph5).split(',');
    shot.phone = { floor: [Number(ph[1]), Number(ph[2]), Number(ph[3])] };
    if (j.scr) shot.screen = path.basename(j.scr);
  }
  if (j.obj === 'trio' || (j.obj === 'empty' && j.trio)) shot.trio = String(j.trio).split(',').map(Number);
  // build 12D: the other things of the one room this still's camera sees, drawn in it where they stand (x mm, z mm,
  // turn degrees in the still's own room; the picture maker's x12 setting)
  if (j.x12) shot.extra = String(j.x12).split(';').filter(Boolean).map((e) => { const [name, x, z, turn] = e.split(','); return { name, x: Number(x), z: Number(z), turn: Number(turn) }; });
  out.pictures[key] = shot;
}
writeFileSync(path.join(root, 'src/world/shots.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`src/world/shots.json: ${Object.keys(out.pictures).length} pictures`);
