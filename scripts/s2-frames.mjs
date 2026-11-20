// Scene 2, version B (look 11): the job list for the frames rendered ahead of time, one per place along the camera
// move of src/s2/path.ts, for the stills' own picture maker (the path tracer in
// /Users/tews/Code/proxyz-site-stills/pt, obj=stand5: the same stand, phone, menu, floor and light as today's three
// passes of scene 2). Each job is the pass 3 still's own settings with the camera, the key's strength, the phone's
// pose, the glow and the screen of that place.
//
//   node scripts/s2-frames.mjs jobs <out.json> [--n 96] [--spp 128] [--scale 1]   the jobs (desk and phone)
//   node scripts/s2-frames.mjs pack <folder of rendered PNGs> [--q 78]          WebP frames into public/s2frames/
//                                                                                and src/generated/s2-frames.json
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Euler, Quaternion, Vector3 } from 'three';
import { PATH, S_FROM, S_REST, S_TO, shotAt } from '../src/s2/path.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEG = Math.PI / 180;
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? Number(process.argv[i + 1]) : d; };

/** The phone between its tap and lifted poses: position on a straight line raised a little in the middle (it clears
 *  the tile), turn by the shortest way. Shared with the live version (src/s2/live.ts does the same). */
export function phonePose(form, lift) {
  const { tap, lift: up } = PATH[form];
  const q0 = new Quaternion().setFromEuler(new Euler(tap.rot[0] * DEG, tap.rot[1] * DEG, tap.rot[2] * DEG, 'YXZ'));
  const q1 = new Quaternion().setFromEuler(new Euler(up.rot[0] * DEG, up.rot[1] * DEG, up.rot[2] * DEG, 'YXZ'));
  const q = q0.clone().slerp(q1, lift);
  const p = new Vector3(...tap.pos).lerp(new Vector3(...up.pos), lift);
  p.y += 14 * Math.sin(Math.PI * lift);
  const e = new Euler().setFromQuaternion(q, 'YXZ');
  return { pos: p.toArray(), rot: [e.x / DEG, e.y / DEG, e.z / DEG] };
}

// pass 3 of today's scene 2, per form (out5/s2v2-<form>-p3@2x.json): everything but the camera, the phone, the glow and
// the screen
const BASE = {
  desktop: { fstop: 16, fx: 14.1, fy: 60.3, fz: 34.4, kax: 20, kay: 30, kaz2: 30 },
  phone: { fstop: 22, fx: 20.7, fy: 82.6, fz: 58.9, kax: 10, kay: 30, kaz2: 30 },
};
const COMMON = {
  obj: 'stand5', black: 0.011, sheen: 0, fill: 0, floor: 0.006, ftex: 0.3, print: 0.8, grough: 0.05, pframe: 0.45, pfoot: 1,
  fov: 30, kpx: -721.8, kpy: 776, kpz: 383.8, kcone: 9, kpen: 0.2, ksize: 20, st5: '0,0,0', limit: 900,
  scr: '/tools/pt/stills5/screens/menu-page2.png',
};
const KINT = 11000000;

/** Frame i of n: evenly spaced, with one frame exactly at the rest (the still's own composition). */
export function sOf(i, n) {
  const a = Math.round(((S_REST - S_FROM) / (S_TO - S_FROM)) * (n - 1));
  return i <= a ? S_FROM + (i * (S_REST - S_FROM)) / a : S_REST + ((i - a) * (S_TO - S_REST)) / (n - 1 - a);
}

function jobs() {
  const out = process.argv[3];
  const n = arg('n', 96), spp = arg('spp', 128), scale = arg('scale', 1), pscale = arg('pscale', 1.5), pspp = arg('pspp', 96);
  const list = [];
  for (const form of ['desktop', 'phone']) {
    const [w, h] = form === 'desktop' ? [Math.round(1440 * scale), Math.round(900 * scale)] : [Math.round(786 * pscale), Math.round(1704 * pscale)];
    for (let i = 0; i < n; i++) {
      const s = sOf(i, n);
      const sh = shotAt(form, s), c = sh.cam, ph = phonePose(form, sh.lift);
      const f = (v) => +v.toFixed(3);
      list.push({
        ...COMMON, ...BASE[form],
        name: `s2f-${form === 'desktop' ? 'desk' : 'phone'}-${String(i).padStart(3, '0')}`,
        w, h, spp: form === 'desktop' ? spp : pspp, seed: form === 'desktop' ? 202 : 212, gscale: 1,
        az: f(c.az), el: f(c.el), dist: f(c.dist), lx: c.lx, ly: c.ly, lz: c.lz, sx: f(c.sx), sy: f(c.sy),
        kint: Math.round(KINT * sh.key),
        ph5: `free,${ph.pos.map(f).join(',')},${ph.rot.map(f).join(',')}`,
        ...(sh.glow > 0.01 ? { glow: `2,${f(sh.glow)},1.4` } : {}),
        sint: f(sh.screen),
        s: f(s),
      });
    }
  }
  writeFileSync(out, JSON.stringify(list, null, 1));
  console.log(`${list.length} jobs to ${out}`);
}

// Frames: WebP (Pillow), the file name carries a content hash so a frame can be cached for a year.
function pack() {
  const dir = process.argv[3], q = arg('q', 78);
  const outDir = path.join(root, 'public/s2frames');
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const man = { desktop: { size: [1440, 900], s: [], files: [] }, phone: { size: [786, 1704], s: [], files: [] }, bytes: { desktop: 0, phone: 0 } };
  const pngs = readdirSync(dir).filter((f) => /^s2f-(desk|phone)-\d{3}\.png$/.test(f)).sort();
  const py = `
import sys, io
from PIL import Image
src, q = sys.argv[1], int(sys.argv[2])
im = Image.open(src).convert('RGB')
b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6)
sys.stdout.buffer.write(b.getvalue())
`;
  for (const f of pngs) {
    const form = f.includes('-desk-') ? 'desktop' : 'phone';
    const buf = execFileSync('python3', ['-c', py, path.join(dir, f), String(q)], { maxBuffer: 64 << 20 });
    const hash = createHash('sha256').update(buf).digest('hex').slice(0, 10);
    const name = `${f.replace(/\.png$/, '')}.${hash}.webp`;
    writeFileSync(path.join(outDir, name), buf);
    man[form].files.push(`/s2frames/${name}`);
    man[form].s.push(JSON.parse(readFileSync(path.join(dir, f.replace(/\.png$/, '.json')), 'utf8')).job.s);
    man.bytes[form] += buf.length;
  }
  writeFileSync(path.join(root, 'src/generated/s2-frames.json'), JSON.stringify(man, null, 1) + '\n');
  console.log(`desk ${man.desktop.files.length} frames ${(man.bytes.desktop / 1024).toFixed(0)} KB, phone ${man.phone.files.length} frames ${(man.bytes.phone / 1024).toFixed(0)} KB`);
}

if (process.argv[2] === 'jobs') jobs();
else if (process.argv[2] === 'pack') pack();
else console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(0, 10).join('\n'));
