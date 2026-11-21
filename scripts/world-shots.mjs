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

// scene 2's phone where it taps the third tile: the stills' tap mode, written out as a pose by look 11
// (scripts/s2-frames.mjs --tap; the same numbers as look 11's src/s2/path.ts)
const TAP = {
  desk: { pos: [62.16, 26.05, 74.24], rot: [-2.36, 38.625, 9.59] },
  phone: { pos: [55.2, 35.06, 77.34], rot: [-9.505, 32.63, 8.662] },
};
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
  const form = j.w >= j.h ? 'desk' : 'phone';
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
  const shot = {
    obj: j.obj,
    cam: { az: j.az, el: j.el, dist: j.dist, look: [j.lx, j.ly, j.lz], fov: j.fov ?? 30, sx: j.sx ?? 0, sy: j.sy ?? 0, w: j.w, h: j.h },
    light,
  };
  if (j.obj === 'stand5') {
    const ph = String(j.ph5 ?? '').split(',');
    if (ph[0] === 'tap') shot.phone = TAP[form];
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
