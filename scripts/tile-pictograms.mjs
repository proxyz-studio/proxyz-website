#!/usr/bin/env node
// Build 12I: the four tile pictures exactly as the TAPZ site draws them, so the film's stand matches the product's.
//
// The geometry is a port of the TAPZ site's src/three/stand/pictograms.ts (V5/V6, the live V13 site): the same grid, the
// same numbers, the same parts and tones. Grid coordinates are SVG style (x right, y down), 24 units = 23.5 mm (UNIT
// 0.98 mm), centred on the tile face; grid "up" points to the stand's back, so the drawing reads upright from the front.
// Each part is raised 1 mm on the black tile top (the dots on the chat bubble 1.3 mm). Left to right on the stand, as
// on TAPZ: chat (green bubble, white dots), photo (pink camera), menu (white fork and knife), web (white globe).
//
// This file is the one source of the drawings for the film:
//   - the picture maker's stills (a copy sits in ~/Code/proxyz-site-stills/pt-12i/src/export/tilePictograms.mjs, where
//     the parts are extruded into raised plastic),
//   - src/film/icons/<face>.svg (the board at work lays them over the tiles),
//   - src/world/tile-icons.webp (the live film's tiles where no still saw them; drawn by scripts/tile-pictograms.py).
//
//   node scripts/tile-pictograms.mjs            writes the four SVG files and scratch JSON for the atlas
//   node scripts/tile-pictograms.mjs --json     prints the parts as JSON (grid units)

export const UNIT = 0.98;
export const RAISE = 1;
/** On screen colours (TAPZ PICTOGRAM_COLOURS); ink is white on the black stand. */
export const COLOURS = { green: '#22C55E', pink: '#FF4193', white: '#FFFFFF', ink: '#FFFFFF' };
/** Left to right on the stand. */
export const FACES = ['chat', 'photo', 'menu', 'web'];

function arcPts(cx, cy, r, a0, a1, steps = 10) {
  const out = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((a0 + ((a1 - a0) * i) / steps) * Math.PI) / 180;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}
function ellipsePts(cx, cy, rx, ry, steps = 40) {
  const out = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return out;
}
const poly = (pts, holes = []) => ({ outer: pts, holes });
const disc = (c, r, steps = 20) => poly(ellipsePts(c[0], c[1], r, r, steps).slice(0, -1));
function roundRectPts(x0, y0, x1, y1, r) {
  return [...arcPts(x1 - r, y0 + r, r, -90, 0), ...arcPts(x1 - r, y1 - r, r, 0, 90), ...arcPts(x0 + r, y1 - r, r, 90, 180), ...arcPts(x0 + r, y0 + r, r, 180, 270)];
}
/** a stroked polyline: a disc (12 sides, as TAPZ) per point and a bar per segment, w in grid units; the line itself is
 *  kept too (the SVG draws it as a round stroke, the same shape in far fewer bytes) */
function stroke(line, w) {
  const out = strokePolys(line, w);
  out[0].line = { pts: line, w, n: out.length };
  return out;
}
function strokePolys(line, w) {
  const half = w / 2;
  const out = [];
  for (let i = 0; i < line.length; i++) {
    const p = line[i];
    const d = [];
    for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; d.push([p[0] + half * Math.cos(a), p[1] + half * Math.sin(a)]); }
    out.push(poly(d));
    const q = line[i + 1];
    if (!q) continue;
    const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy);
    if (l < 1e-4) continue;
    const nx = (-dy / l) * half, ny = (dx / l) * half;
    out.push(poly([[p[0] + nx, p[1] + ny], [p[0] - nx, p[1] - ny], [q[0] - nx, q[1] - ny], [q[0] + nx, q[1] + ny]]));
  }
  return out;
}
function ring(c, rOut, rIn) {
  return poly(ellipsePts(c[0], c[1], rOut, rOut, 36).slice(0, -1), [ellipsePts(c[0], c[1], rIn, rIn, 36).slice(0, -1).reverse()]);
}

function chat() {
  const x0 = 1.6, x1 = 22.4, y0 = 3.4, y1 = 17.2, r = 5.2;
  const body = [
    ...arcPts(x1 - r, y0 + r, r, -90, 0),
    ...arcPts(x1 - r, y1 - r, r, 0, 90),
    [9.6, y1], [4.6, 21.6], [6.2, y1 - 0.4],
    ...arcPts(x0 + r, y1 - r, r, 100, 180),
    ...arcPts(x0 + r, y0 + r, r, 180, 270),
  ];
  const dots = [6.6, 12, 17.4].map((x) => disc([x, 10.3], 1.75));
  return [{ tone: 'green', raise: RAISE, shapes: [poly(body)] }, { tone: 'white', raise: RAISE + 0.3, shapes: dots }];
}
function photo() {
  const outline = [
    ...arcPts(19.6, 9.6, 2.8, -90, 0), ...arcPts(19.6, 18.2, 2.8, 0, 90), ...arcPts(4.4, 18.2, 2.8, 90, 180), ...arcPts(4.4, 9.6, 2.8, 180, 270),
    [7.2, 6.8], [8.6, 3.9], [14.4, 3.9], [15.8, 6.8],
  ];
  const body = poly(outline, [ellipsePts(12, 13.2, 5.0, 5.0, 40).slice(0, -1).reverse(), ellipsePts(19.0, 9.4, 1.0, 1.0, 14).slice(0, -1).reverse()]);
  const lens = disc([12, 13.2], 3.3, 32);
  return [{ tone: 'pink', raise: RAISE, shapes: [body, lens] }];
}
function web() {
  const R = 9.6, w = 1.5;
  const shapes = [ring([12, 12], R + w * 0.5, R - w * 0.5)];
  shapes.push(...stroke(ellipsePts(12, 12, 4.4, R, 36), w));
  shapes.push(...stroke([[12, 12 - R], [12, 12 + R]], w));
  shapes.push(...stroke([[12 - R, 12], [12 + R, 12]], w));
  const yy = 5.2, half = Math.sqrt(R * R - yy * yy);
  shapes.push(...stroke([[12 - half, 12 - yy], [12 + half, 12 - yy]], w));
  shapes.push(...stroke([[12 - half, 12 + yy], [12 + half, 12 + yy]], w));
  return [{ tone: 'ink', raise: RAISE, shapes }];
}
function menu() {
  const shapes = [];
  const top = 2.5, bottom = 21.5, fx = 8.6;
  for (const dx of [-1.95, -0.65, 0.65, 1.95]) shapes.push(...stroke([[fx + dx, top + 0.35], [fx + dx, 8.4]], 0.72));
  shapes.push(poly([[fx - 2.31, 8.0], [fx + 2.31, 8.0], ...arcPts(fx, 8.0, 2.31, 0, 180, 12).map(([x, y]) => [x, 8.0 + (y - 8.0) * 0.9])]));
  shapes.push(poly([[fx - 0.95, 9.6], [fx + 0.95, 9.6], [fx + 0.8, 11.4], [fx - 0.8, 11.4]]));
  shapes.push(poly(roundRectPts(fx - 0.8, 11, fx + 0.8, bottom, 0.8)));
  const kx = 15.4, kw = 0.95;
  const blade = [[kx - kw, 12.2], [kx - kw, top + 1.4], ...arcPts(kx - kw + 1.4, top + 1.4, 1.4, 180, 360, 10), [kx + kw + 0.85, 9.0], [kx + kw, 11.6], [kx + kw, 12.2]];
  shapes.push(poly(blade));
  shapes.push(poly(roundRectPts(kx - kw, 11.8, kx + kw, bottom, 0.9)));
  return [{ tone: 'ink', raise: RAISE, shapes }];
}

/** The parts of each face, grid units. */
export function pictograms() {
  return { chat: chat(), photo: photo(), menu: menu(), web: web() };
}

// the SVG square is the 24 mm middle of the tile face (the board at work maps its 512 units onto it)
const SVG_MM = 24, PX = 512 / SVG_MM;
const sx = (g) => +(256 + (g - 12) * UNIT * PX).toFixed(1);
const sub = (pts) => 'M' + pts.map(([x, y]) => `${sx(x)} ${sx(y)}`).join('L') + 'Z';

export function svgOf(face) {
  const parts = pictograms()[face];
  const paths = parts.flatMap((p) => {
    const out = [];
    for (let i = 0; i < p.shapes.length; i++) {
      const s = p.shapes[i];
      if (s.line) {
        const d = 'M' + s.line.pts.map(([x, y]) => `${sx(x)} ${sx(y)}`).join('L');
        out.push(`<path fill="none" stroke="${COLOURS[p.tone]}" stroke-width="${+(s.line.w * UNIT * PX).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" d="${d}"/>`);
        i += s.line.n - 1;
        continue;
      }
      out.push(`<path fill="${COLOURS[p.tone]}"${s.holes.length ? ' fill-rule="evenodd"' : ''} d="${sub(s.outer)}${s.holes.map(sub).join('')}"/>`);
    }
    return out;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">\n${paths.join('\n')}\n</svg>\n`;
}

if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  const { writeFileSync } = await import('node:fs');
  if (process.argv.includes('--json')) {
    process.stdout.write(JSON.stringify({ unit: UNIT, colours: COLOURS, faces: FACES, parts: pictograms() }));
  } else {
    const dir = new URL('../src/film/icons/', import.meta.url);
    for (const f of FACES) writeFileSync(new URL(f + '.svg', dir), svgOf(f));
    console.log('wrote', FACES.map((f) => `src/film/icons/${f}.svg`).join(', '));
  }
}
