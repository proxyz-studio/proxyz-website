// Scene 2, version B (look 11): the same camera move as the live version, rendered ahead of time by the stills' path
// tracer into a strip of frames (scripts/s2-frames.mjs), played by the film's playhead: the two frames either side of
// the playhead, blended. Every frame is fetched once (small WebP files); only the frames near the playhead are kept
// decoded, so a phone never holds the whole strip as pictures.
import manifest from '../generated/s2-frames.json';
import type { Form } from './path';
import type { Box, Player } from './live';

interface Strip { size: number[]; s: number[]; files: string[] }
const M = manifest as unknown as Record<Form, Strip>;
/** frames kept decoded around the playhead (each side) */
const NEAR = 5;

export async function startStrip(form: Form, s0: number): Promise<Player> {
  const st = M[form];
  const n = st.files.length;
  const canvas = document.createElement('canvas');
  canvas.className = 's2live';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d', { alpha: false })!;
  const blobs: (Blob | null)[] = new Array(n).fill(null);
  const bitmaps = new Map<number, ImageBitmap>();
  const pending = new Set<number>();
  let alive = true, want = 0, lastKey = '';

  /** the place of s in the strip: frame i and how far to frame i + 1 */
  const at = (s: number): [number, number] => {
    if (s <= st.s[0]) return [0, 0];
    if (s >= st.s[n - 1]) return [n - 1, 0];
    let i = 0;
    while (i < n - 2 && st.s[i + 1] <= s) i++;
    return [i, (s - st.s[i]) / (st.s[i + 1] - st.s[i])];
  };
  const decode = (i: number) => {
    const b = blobs[i];
    if (!b || bitmaps.has(i) || pending.has(i) || !alive) return;
    pending.add(i);
    createImageBitmap(b).then((bm) => {
      pending.delete(i);
      if (!alive || Math.abs(i - want) > NEAR + 2) { bm.close(); return; }
      bitmaps.set(i, bm);
      lastKey = '';
      onReady?.();
    }, () => pending.delete(i));
  };
  const keep = (c: number) => {
    want = c;
    for (const [i, bm] of bitmaps) if (Math.abs(i - c) > NEAR + 2) { bm.close(); bitmaps.delete(i); }
    for (let d = 0; d <= NEAR; d++) { if (c + d < n) decode(c + d); if (c - d >= 0) decode(c - d); }
  };
  let onReady: (() => void) | null = null;

  // fetch every frame, nearest the playhead first, four at a time
  const order = [...Array(n).keys()].sort((a, b) => Math.abs(a - at(s0)[0]) - Math.abs(b - at(s0)[0]));
  let next = 0;
  await new Promise<void>((done, fail) => {
    let left = n, running = 0;
    const pump = () => {
      while (running < 4 && next < order.length) {
        const i = order[next++];
        running++;
        fetch(st.files[i]).then((r) => (r.ok ? r.blob() : Promise.reject(new Error(st.files[i])))).then((b) => {
          blobs[i] = b;
          running--; left--;
          if (Math.abs(i - want) <= NEAR) decode(i);
          if (!left) done(); else pump();
        }, fail);
      }
    };
    want = at(s0)[0];
    pump();
  });
  // ready once the frames round the playhead are decoded
  keep(at(s0)[0]);
  await new Promise<void>((res) => {
    const check = () => { if (bitmaps.has(want)) { onReady = null; res(); } };
    onReady = check;
    check();
  });

  /** the nearest decoded frame to i (a flick may outrun the decoding: it shows the nearest frame it has) */
  const nearest = (i: number): number => {
    for (let d = 0; d < n; d++) { if (bitmaps.has(i + d)) return i + d; if (bitmaps.has(i - d)) return i - d; }
    return -1;
  };
  let redraw: (() => void) | null = null;

  function draw(s: number, f: Form, box: Box, vw: number, vh: number): boolean {
    if (f !== form) return false;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = Math.round(vw * dpr), H = Math.round(vh * dpr);
    const [i, t] = at(s);
    keep(t > 0.5 ? i + 1 : i);
    const a = nearest(i), b = t > 0.002 && i + 1 < n && bitmaps.has(i + 1) && a === i ? i + 1 : -1;
    const sig = [a, b, t.toFixed(3), box.left.toFixed(1), box.top.toFixed(1), box.w.toFixed(1), box.h.toFixed(1), W, H].join('|');
    if (a < 0 || sig === lastKey) return false;
    lastKey = sig;
    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W; canvas.height = H;
      canvas.style.width = vw + 'px'; canvas.style.height = vh + 'px';
    }
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#010101';
    ctx.globalAlpha = 1;
    ctx.fillRect(0, 0, W, H);
    const put = (k: number, al: number) => { ctx.globalAlpha = al; ctx.drawImage(bitmaps.get(k)!, box.left * dpr, box.top * dpr, box.w * dpr, box.h * dpr); };
    put(a, 1);
    if (b >= 0) put(b, t);
    ctx.globalAlpha = 1;
    return true;
  }
  // a frame decoded late: the film draws again
  onReady = () => redraw?.();

  return {
    canvas,
    draw,
    set onLate(fn: () => void) { redraw = fn; },
    dispose() { alive = false; for (const bm of bitmaps.values()) bm.close(); bitmaps.clear(); },
  } as Player & { onLate: () => void };
}
