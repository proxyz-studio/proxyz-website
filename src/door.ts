// The doors: the hand-over from the film to a product's own site (build 9, rulebook v1 section 3).
// The studio serves each product under its own address (/tapz/ forwards to the product's site, see vercel.json), so
// between the two pages the browser can blend one picture into the other (cross-document view transitions).
//
// In the product's scene the door is its logo and an arrow; on the board, its name tag and its thing. A click, with
// motion allowed: the Z presses like a key and two thin cream rings spread from it (on the board: one pulse runs from
// the chip to the thing), the words, the border and its marks fade, only the picture stays (about 0.44 s). Then the
// browser goes to the product's page; the scene's picture, in a box placed so that the PROXYZ letters on the studio's
// stand land on the letters of the product's own stand, grows into the product's first picture (the product's page
// sets that blend's timing). Back plays it the other way (this page sets that timing), then the words come back.
// With less motion, scripts off or the film given up: a plain link. Without the blend (Firefox): the exit, then a cut.
//
// The way back always lands on the scene: before leaving, the place is saved at the scene's rest, and from the
// product's own scene the address takes the door's hash (/#tapz), which the film owns (src/main.ts).
import { doors as DOORS } from '../content/site.json';
import type { Door, DoorView, View } from './types';

export interface Box { left: number; top: number; w: number; h: number }
/** What the door needs from the film (src/main.ts). */
export interface FilmHooks {
  /** scene n's elements */
  scene(n: number): { el: HTMLElement; layer: HTMLElement; words: HTMLElement | null; top: HTMLElement | null };
  view(n: number): View;
  /** the logical size of scene n's picture */
  size(n: number): [number, number];
  /** where scene n's picture sits now, in its layer (null while it has none) */
  picture(n: number): Box | null;
  /** the steady screen heights: the large one (a phone's bar away) and the small one (its bar showing) */
  vh(): number; svh(): number;
  active(): number;
  reduced(): boolean;
  gaveUp(): boolean;
  /** while set, the place the film saves for a reload is scene n at rest (or further on in it) */
  hold(n: number | null): void;
  /** while on, the scroll moves nothing (the hand-over is running) */
  freeze(on: boolean): void;
  /** measure and place everything again (the screen may have turned while the visitor was away) */
  relayout(): void;
}
export interface Doors {
  /** place scene n's door from its picture box g (called by the film's own place) */
  place(n: number, g: Box): void;
  /** the strength of scene n's last light pass: the logo shows once the light rests */
  light(n: number, last: number): void;
  /** the film gave up: put everything back, the doors are plain links from now on */
  giveUp(): void;
  /** the scene a door's hash (/#tapz) lands on, or 0 */
  hashScene(hash: string): number;
}

const doc = document.documentElement;
const doors = (DOORS as unknown as Door[]).filter((d) => d.on);
const doorById = (id: string | undefined) => doors.find((d) => d.id === id) ?? null;
const hasVT = 'onpagereveal' in window;
// the words at the foot ride a phone browser's bar on these screens (as style.css)
const rideMQ = matchMedia('(max-width: 899px), (max-height: 500px) and (orientation: landscape)');
const deskMQ = matchMedia('(min-width: 900px) and (min-height: 501px)');
const EXIT = 440;
/** the product's first picture on this screen: the first, widest screens first, whose width the window reaches */
const pictureOf = (d: Door) => d.pictures?.find((p) => matchMedia(`(min-width: ${p.from}px)`).matches) ?? null;
// every door, taken as the page holds them, before the film runs: it lifts the board's labels box (which holds the
// board's door) out of the page until scene 6 is near
const LINKS = [...document.querySelectorAll<HTMLAnchorElement>('a.door')];
/** the door's size unit on each kind of screen, largest first: a pressing logo's tile (TAPZ, never under 16 px, its
 *  own floor), a route logo's height (TROPHYZ: 24 px and more, its primary cut) */
const TILES = { press: { desk: [24], ride: [20, 18, 16] }, route: { desk: [26], ride: [24] } };
/** each venture's trace on the board */
const TRACE: Record<string, string> = { stand: 'stand', race: 'coin', coach: 'phone' };

interface Wrap { layer: HTMLElement; box: HTMLElement; moved: Element[] }
interface Leaving { d: Door; n: number; wrap: Wrap | null; timers: number[]; rings: HTMLElement[]; pulse: SVGPathElement | null }

export function startDoors(film: FilmHooks): Doors {
  const links = LINKS;
  let leaving: Leaving | null = null;

  /* ---------- placing the logo: clear of the giant words, the small words and the things ---------- */
  type R = [number, number, number, number];
  const hit = (a: R, b: R, pad = 0) => a[0] < b[2] + pad && a[2] > b[0] - pad && a[1] < b[3] + pad && a[3] > b[1] - pad;
  const ink = (e: Element): R => { const g = document.createRange(); g.selectNodeContents(e); const r = g.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; };
  const shift = (r: R, dy: number): R => [r[0], r[1] + dy, r[2], r[3] + dy];
  function place(n: number, g: Box): void {
    for (const a of links) if (a.classList.contains('dlogo') && Number(a.dataset.scene) === n) placeLogo(a, n, g);
  }
  function placeLogo(a: HTMLAnchorElement, n: number, g: Box): void {
    const d = doorById(a.dataset.door), view = film.view(n), dv: DoorView | undefined = d ? view.doors?.[d.venture] : undefined;
    const s = film.scene(n);
    if (!d || !dv || !g.w) { a.classList.remove('placed'); return; }
    const L = s.layer.getBoundingClientRect(), k = g.w / film.size(n)[0];
    const pic = (b: number[]): R => [L.left + g.left + b[0] * k, L.top + g.top + b[1] * k, L.left + g.left + b[2] * k, L.top + g.top + b[3] * k];
    // the things as the light leaves them: the stand, and what the last pass shows
    const things = [dv.thing, ...(view.later ?? []).filter((l) => l[0] === view.passes.length).map(([, x, y, w, h]) => [x, y, x + w, y + h])].map(pic);
    const upright = innerWidth / Math.max(1, innerHeight) <= 1;
    const big = s.top ? [...s.top.querySelectorAll(upright ? '.pl' : '.ln')].map(ink) : [];
    const words = s.words ? [...s.words.children].filter((e) => !e.classList.contains('door')) : [];
    const small = words.map(ink);
    const ride = rideMQ.matches;
    // how far the words at the foot may still rise (a phone's bar sliding in) or sink (sliding away)
    const IH = innerHeight, lift = ride ? Math.max(0, IH - film.svh()) : 0, sink = ride ? Math.max(0, film.vh() - IH) : 0;
    const smallAll = [...small, ...small.map((r) => shift(r, -lift)), ...small.map((r) => shift(r, sink))];
    const last = words.length ? (() => { const g2 = document.createRange(); g2.selectNodeContents(words[words.length - 1]); const rs = g2.getClientRects(); return rs[rs.length - 1]; })() : null;
    const wr = s.words?.getBoundingClientRect();
    const sw = deskMQ.matches ? document.querySelector('.bottom-sw')?.getBoundingClientRect() : null;
    const frame = deskMQ.matches ? document.getElementById('frame')?.getBoundingClientRect() : null;
    const lo = Math.min(film.svh(), IH) - 4;
    const inside = (b: R, bottom = lo) => b[0] >= (frame ? frame.left + 8 : 4) && b[2] <= (frame ? frame.right - 8 : innerWidth - 4) && b[1] >= 4 && b[3] <= (frame ? Math.min(bottom, frame.bottom - 8) : bottom);
    // the link's own padding is the logo's clear space (half a tile), so the link may come within 2 px of each
    const clear = (b: R, smallRs: R[]) => !things.some((t) => hit(b, t, 2)) && !big.some((t) => hit(b, t, 2)) && !smallRs.some((t) => hit(b, t, 2)) && !(sw && sw.width && hit(b, [sw.left, sw.top, sw.right, sw.bottom], 8));
    const kind = TILES[d.move ?? 'press'], tiles = deskMQ.matches ? kind.desk : kind.ride;
    // the link's size and clear space for a size unit t, as style.css draws it
    const sizes = new Map<number, [number, number, number]>();
    const was = a.style.getPropertyValue('--t');
    for (const t of tiles) { a.style.setProperty('--t', t + 'px'); sizes.set(t, [a.offsetWidth, a.offsetHeight, parseFloat(getComputedStyle(a).paddingLeft) || t / 2]); }
    a.style.setProperty('--t', was);
    const size = (t: number) => sizes.get(t)!;
    const padOf = (t: number) => sizes.get(t)![2];
    type Spot = { name: string; t: number; box: R; rides: boolean };
    const spots: Spot[] = [];
    for (const t of tiles) {
      const [w, h] = size(t);
      const st = pic(dv.thing);
      // 1. just under the stand, the logo's left edge on the stand's left edge (it stays with the picture)
      spots.push({ name: 'under-thing', t, box: [st[0] - padOf(t), st[3] + 2, st[0] - padOf(t) + w, st[3] + 2 + h], rides: false });
      if (last && wr) {
        const mid = (last.top + last.bottom) / 2;
        // 2. on the line of the small words' last line: at the right margin on an upright screen, else just after it
        const x = upright ? wr.right + padOf(t) - w : small[small.length - 1][2] + 2;
        spots.push({ name: upright ? 'beside-words-margin' : 'beside-words', t, box: [x, mid - h / 2, x + w, mid + h / 2], rides: ride });
      }
    }
    if (wr && small.length) {
      // 3. just under the small words (narrow phones), on their left edge
      const t = tiles[0], [w, h] = size(t), b = Math.max(...small.map((r) => r[3]));
      spots.push({ name: 'under-words', t, box: [wr.left - padOf(t), b + 2, wr.left - padOf(t) + w, b + 2 + h], rides: ride });
    }
    const ok = (sp: Spot) => sp.rides
      // riding with the words: clear of the things wherever the bar puts the words, inside the screen where it is now
      ? inside(sp.box, IH - 2) && clear(sp.box, small) && clear(shift(sp.box, -lift), [])
      : inside(sp.box) && clear(sp.box, smallAll);
    const at = spots.find(ok) ?? spots[spots.length - 1];
    const st = a.style;
    st.setProperty('--t', at.t + 'px');
    if (at.rides) {
      // fixed like the words, its foot a set distance from theirs, so it rides the bar (and the home bar) with them
      const dy = (wr ? wr.bottom : IH) - at.box[3];
      Object.assign(st, { position: 'fixed', left: at.box[0].toFixed(1) + 'px', top: 'auto', right: 'auto', bottom: `calc(var(--words-base) + var(--safe-b) + ${dy.toFixed(1)}px)` });
    } else {
      Object.assign(st, { position: '', left: (at.box[0] - L.left).toFixed(1) + 'px', top: (at.box[1] - L.top).toFixed(1) + 'px', right: 'auto', bottom: 'auto' });
    }
    a.dataset.spot = ok(at) ? at.name : 'none';
    a.classList.add('placed');
  }
  function light(n: number, last: number): void {
    for (const a of links) if (a.classList.contains('dlogo') && Number(a.dataset.scene) === n) a.classList.toggle('lit', film.reduced() || last >= 0.98);
  }

  /* ---------- getting the product's page ready early ---------- */
  // On hover, focus or the first touch: the page, its style and its first picture (this site's own address, so the
  // security policy allows it). Its big script only at the tap. Never another host.
  const warm = new Map<string, Promise<string | null>>();
  const kept: HTMLImageElement[] = [];
  const same = (u: URL) => u.origin === location.origin;
  function early(d: Door): void {
    if (warm.has(d.id)) return;
    const page = new URL(d.open ?? d.path, location.href);
    const p = pictureOf(d);
    if (p) {
      const im = new Image();
      im.decoding = 'async';
      im.src = new URL(p.src, new URL(d.path, location.href)).href;
      kept.push(im);
    }
    warm.set(d.id, fetch(page.href, { credentials: 'same-origin' }).then((r) => (r.ok ? r.text() : '')).then((html) => {
      const at = (re: RegExp) => { const m = re.exec(html); if (!m) return null; const u = new URL(m[1], page); return same(u) ? u.href : null; };
      const css = at(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"/);
      if (css) fetch(css, { credentials: 'same-origin' }).catch(() => {});
      return at(/<script\b[^>]*\btype="module"[^>]*\bsrc="([^"]+)"/);
    }).catch(() => null));
  }
  function bigScript(d: Door): void {
    early(d);
    void warm.get(d.id)?.then((js) => { if (js) fetch(js, { credentials: 'same-origin', keepalive: true }).catch(() => {}); });
  }

  /* ---------- the exit ---------- */
  function ring(x: number, y: number, size: number, delay: number, dur: number): HTMLElement {
    const el = document.createElement('div');
    el.className = 'door-ring';
    el.setAttribute('aria-hidden', 'true');
    Object.assign(el.style, { left: x + 'px', top: y + 'px' });
    el.style.setProperty('--d', size.toFixed(0) + 'px');
    document.body.append(el);
    // a full circle drawn at its full size (a 1 px line) and grown from a dot, so the line stays thin
    el.animate([{ transform: 'translate(-50%,-50%) scale(.02)', opacity: 0.95 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 }],
      { duration: dur, delay, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'both' });
    return el;
  }
  /** the lit Z, pressed like a key; returns the middle of the tile */
  function press(a: HTMLAnchorElement): [number, number] | null {
    const z = a.querySelector<SVGGElement>('.dz');
    if (!z) return null;
    const from = getComputedStyle(z).transform === 'none' ? 'translateY(0px)' : 'translateY(20px)';
    z.animate([{ transform: from }, { transform: 'translateY(46px)', offset: 0.35 }, { transform: 'translateY(0px)' }], { duration: 300, easing: 'cubic-bezier(.3,0,.3,1)' });
    const b = z.getBoundingClientRect();
    return [b.left + b.width / 2, b.top + b.height / 2];
  }
  /** TROPHYZ: the red route draws itself, from its start ring to its finish dot (the route as drawn, revealed through a
   *  mask along the Z; the mask goes once it is whole) */
  function routeDraw(a: HTMLAnchorElement): void {
    const z = a.querySelector<SVGGElement>('.dz'), id = z?.dataset.mask, m = id ? document.getElementById(id)?.querySelector<SVGPathElement>('.dzm') : null;
    if (!z || !id || !m) return;
    m.style.strokeDasharray = '1 1';
    z.setAttribute('mask', `url(#${id})`);
    const an = m.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 280, easing: 'cubic-bezier(.45,0,.35,1)', fill: 'forwards' });
    const done = () => { z.removeAttribute('mask'); m.style.strokeDasharray = ''; an.cancel(); };
    an.finished.then(done, done);
  }
  /** on the board: one pulse from the chip along the product's trace */
  function boardPulse(n: number, d: Door): SVGPathElement | null {
    const svg = [...film.scene(n).el.querySelectorAll<SVGSVGElement>('svg.board')].find((e) => getComputedStyle(e).display !== 'none');
    const t = TRACE[d.venture] ?? 'stand';
    const co = svg?.querySelector<SVGPathElement>(`.t-${t} .co`), dd = co?.getAttribute('d');
    if (!co || !dd) return null;
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', dd); p.setAttribute('pathLength', '1'); p.setAttribute('class', 'door-pulse');
    p.style.strokeDasharray = '0.22 1.5';
    co.parentNode!.append(p);
    p.animate([{ strokeDashoffset: 0.22 }, { strokeDashoffset: -1 }], { duration: 340, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'both' });
    return p;
  }

  /** The box the blend grows from: the shape of the window, placed so that when it grows to the whole window this
   *  scene's anchor (TAPZ: the PROXYZ letters on the stand) lands on the product's first picture's anchor (fixed, full
   *  window, object-fit cover, centred). In the scene's layer. */
  function blendBox(d: Door, n: number): Box | null {
    const g = film.picture(n), dv = d ? film.view(n).doors?.[d.venture] : null, p = pictureOf(d);
    if (!g || !dv || !p || !g.w) return null;
    const k = g.w / film.size(n)[0], [l0, l1, ly] = dv.anchor;
    const sw = (l1 - l0) * k, sx = g.left + ((l0 + l1) / 2) * k, sy = g.top + ly * k;
    const W = innerWidth, H = innerHeight, kt = Math.max(W / p.size[0], H / p.size[1]);
    const ox = (W - p.size[0] * kt) / 2, oy = (H - p.size[1] * kt) / 2;
    const tw = (p.anchor[1] - p.anchor[0]) * kt, tx = ox + ((p.anchor[0] + p.anchor[1]) / 2) * kt, ty = oy + p.anchor[2] * kt;
    const s = sw / tw;
    // the layer starts at the window's top left, so layer and window points agree
    return { left: sx - s * tx, top: sy - s * ty, w: s * W, h: s * H };
  }
  function wrap(d: Door, n: number): Wrap | null {
    const b = blendBox(d, n), layer = film.scene(n).layer;
    if (!b) return null;
    const box = document.createElement('div'), inner = document.createElement('div');
    box.className = 'door-vt'; inner.className = 'door-in';
    Object.assign(box.style, { left: b.left + 'px', top: b.top + 'px', width: b.w + 'px', height: b.h + 'px' });
    Object.assign(inner.style, { left: -b.left + 'px', top: -b.top + 'px', width: layer.clientWidth + 'px', height: layer.clientHeight + 'px' });
    // the scene's picture, its board and labels, its dark bands: moved as they are (same nodes, same pixels)
    const moved = [...layer.children].filter((c) => c.matches('.passes, .lbox, .dim, .shade'));
    layer.insertBefore(box, moved[0] ?? null);
    box.append(inner);
    inner.append(...moved);
    return { layer, box, moved };
  }
  function unwrap(w: Wrap | null): void {
    if (!w || !w.box.isConnected) return;
    w.box.style.viewTransitionName = '';
    for (const m of w.moved) w.layer.insertBefore(m, w.box);
    w.box.remove();
  }

  /** The way back lands here whatever happens next: the place saved at the scene's rest, and from the product's own
   *  scene the door's hash in the address (a reload of this page, with or without the back/forward cache). */
  function keepPlace(d: Door, n: number): void {
    film.hold(n);
    const own = film.scene(n).el.querySelector(`#${CSS.escape(d.id)}`) !== null;
    const hash = own ? '#' + d.id : /^#s\d$/.test(location.hash) ? '' : location.hash;
    try { history.replaceState(history.state, '', location.pathname + location.search + hash); } catch { /* not allowed now */ }
  }

  function go(e: MouseEvent, a: HTMLAnchorElement): void {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const d = doorById(a.dataset.door), n = Number(a.dataset.scene);
    if (!d) return;
    if (leaving) { e.preventDefault(); return; }
    if (film.gaveUp() || !doc.classList.contains('film')) return;
    keepPlace(d, n);
    if (film.reduced()) { early(d); return; }   // less motion: a plain link
    e.preventDefault();
    const l: Leaving = { d, n, wrap: null, timers: [], rings: [], pulse: null };
    leaving = l;
    film.freeze(true);
    bigScript(d);
    const route = a.classList.contains('dlogo') && d.move === 'route';
    doc.classList.add('door-leaving', a.classList.contains('dboard') ? `door-via-${TRACE[d.venture] ?? 'stand'}` : 'door-from-scene', ...(route ? ['door-route'] : []));
    if (route) routeDraw(a);
    else if (a.classList.contains('dlogo')) {
      const z = press(a);
      if (z) {
        const big = Math.min(Math.max(innerWidth, innerHeight) * 0.55, 520);
        l.rings.push(ring(z[0], z[1], big, 60, 380), ring(z[0], z[1], big * 0.62, 140, 300));
      }
    } else l.pulse = boardPulse(n, d);
    l.timers.push(window.setTimeout(() => {
      if (leaving !== l) return;
      l.wrap = wrap(d, n);
      if (l.wrap && hasVT) l.wrap.box.style.viewTransitionName = 'product';
      location.assign(a.href);
      // a navigation that never happens (stopped, failed): the scene comes back
      l.timers.push(window.setTimeout(() => { if (leaving === l && document.visibilityState === 'visible') restore(true); }, 8000));
    }, EXIT));
  }

  function restore(fade: boolean): void {
    const l = leaving;
    if (!l) return;
    leaving = null;
    for (const t of l.timers) clearTimeout(t);
    for (const r of l.rings) r.remove();
    l.pulse?.remove();
    unwrap(l.wrap);
    doc.classList.remove('door-leaving', 'door-via-stand', 'door-via-coin', 'door-via-phone', 'door-from-scene', 'door-route', 'door-back');
    if (fade && !film.reduced()) { doc.classList.add('door-return'); window.setTimeout(() => doc.classList.remove('door-return'), 600); }
    film.hold(null);
    film.freeze(false);
  }

  /* ---------- the browser's own hand-over events ---------- */
  addEventListener('pageswap', (e: Event) => {
    const l = leaving;
    if (!l?.wrap) return;
    const ev = e as Event & { viewTransition?: unknown; activation?: { entry?: { url?: string } } };
    let to = '';
    try { to = ev.activation?.entry?.url ? new URL(ev.activation.entry.url).pathname : ''; } catch { to = ''; }
    // the name only for the blend into the door's own page
    l.wrap.box.style.viewTransitionName = ev.viewTransition && (!to || to.startsWith(l.d.path)) ? 'product' : '';
  });
  addEventListener('pagehide', () => { if (leaving) for (const t of leaving.timers) clearTimeout(t); });
  addEventListener('pagereveal', (e: Event) => {
    const vt = (e as Event & { viewTransition?: { finished: Promise<void>; skipTransition(): void } | null }).viewTransition ?? null;
    try {
      if (leaving) {
        // back from the product's page, this page kept as it was (the back/forward cache)
        const l = leaving;
        for (const t of l.timers) clearTimeout(t);
        for (const r of l.rings) r.remove();
        l.rings = [];
        if (!vt || film.reduced() || film.gaveUp()) { restore(true); return; }
        unwrap(l.wrap);
        film.relayout();   // the screen may have turned while away
        l.wrap = wrap(l.d, l.n);
        if (!l.wrap) { vt.skipTransition(); restore(true); return; }
        l.wrap.box.style.viewTransitionName = 'product';
        doc.classList.add('door-back');
        vt.finished.finally(() => restore(true));
        return;
      }
      // a fresh page arriving from a door with a blend (Back without the cache, or the product's own link to /#tapz):
      // the film has landed on the scene; its picture takes the blend while the words wait
      if (!vt || film.gaveUp() || film.reduced()) return;
      const d = doors.find((x) => '#' + x.id === location.hash), n = film.active();
      if (!d || !d.scenes?.includes(n)) return;
      const l: Leaving = { d, n, wrap: null, timers: [], rings: [], pulse: null };
      leaving = l;
      doc.classList.add('door-leaving', 'door-back');
      l.wrap = wrap(d, n);
      if (!l.wrap) { vt.skipTransition(); restore(false); return; }
      l.wrap.box.style.viewTransitionName = 'product';
      film.freeze(true);
      vt.finished.finally(() => restore(true));
    } catch { restore(false); }
  });
  // no reveal event in this browser (Firefox, older Safari): back from the cache, the scene comes back at once
  addEventListener('pageshow', (e) => { if (e.persisted && leaving && !hasVT) restore(true); });

  for (const a of links) {
    const d = doorById(a.dataset.door);
    if (!d) continue;
    a.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') early(d); });
    a.addEventListener('pointerdown', () => early(d));
    a.addEventListener('touchstart', () => early(d), { passive: true });
    a.addEventListener('focus', () => early(d));
    a.addEventListener('click', (e) => { try { go(e, a); } catch { restore(false); } });
  }

  return {
    place,
    light,
    giveUp() { restore(false); },
    hashScene(hash: string) {
      const d = (DOORS as unknown as Door[]).find((x) => '#' + x.id === hash);
      const mark = d ? document.getElementById(d.id) : null;
      const sec = mark?.classList.contains('at') ? mark.closest<HTMLElement>('#film .scene') : null;
      return sec ? [...document.querySelectorAll('#film .scene')].indexOf(sec) + 1 : 0;
    },
  };
}
