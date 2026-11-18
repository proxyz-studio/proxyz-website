#!/usr/bin/env node
// Makes ONE self contained file from the real build in dist/: the film with its styles, script, fonts and pictures
// inside it, and the machine face and LEGAL reachable inside the same file. For looking at the site without a server
// (open it from a folder, or send it to a phone). Not part of the site.
//
//   npm run build && node scripts/preview-file.mjs <out.html>
//
// Preview only: links between the three pages become #machines and #legal, and a tiny inline script switches them.
// Pictures are AVIF only (every current browser reads it), each one stored once: the film's script carries every
// size; the page itself carries only the 1x resting pictures, plus both sizes of the first picture. Mattes (the cut
// in the giant words) are WebP with alpha and go in as they are, from the script and from the styles.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const doors = (JSON.parse(readFileSync(join(ROOT, 'content/site.json'), 'utf8')).doors ?? []).filter((d) => d.on);
const out = process.argv[2];
if (!out) { console.error('usage: node scripts/preview-file.mjs <out.html>'); process.exit(2); }

const read = (p) => readFileSync(join(DIST, p.replace(/^\//, '')));
const TYPES = { '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const dataUri = (p) => `data:${TYPES[p.slice(p.lastIndexOf('.'))]};base64,${read(p).toString('base64')}`;

let home = read('index.html').toString();
const pageMain = (p, id) => {
  const m = read(p).toString().match(/<main[\s\S]*?<\/main>/)[0];
  return m.replace(/^<main[^>]*>/, `<main id="${id}" class="plain pv-page" hidden>`);
};
const machines = pageMain('machines/index.html', 'machine');
const legal = pageMain('legal/index.html', 'legal');

// styles, with the fonts inside
const cssHref = home.match(/<link rel="stylesheet"[^>]*href="([^"]+)"/)[1];
let css = read(cssHref).toString().replace(/url\((\/assets\/[^)]+\.woff2)\)/g, (_, u) => `url(${dataUri(u)})`);
css += '\n.pv-text #film,html.pv-text body::before{display:none!important}.pv-text .marks{visibility:hidden}'
  + '@media (max-height:500px) and (orientation:landscape){.pv-text .row2{display:flex!important}}'
  + '.pv-note{position:relative;z-index:9;padding:120px 16px 0;font-size:12px;color:#f2f2f2}';

// script: the shared clock chunk and the film, joined into one module without imports
const mainSrc = home.match(/<script type="module"[^>]*src="([^"]+)"/)[1];
let js = read(mainSrc).toString();
for (const m of [...js.matchAll(/import\{([^}]*)\}from"\.\/([^"]+)";/g)]) {
  const chunk = read('assets/' + m[2]).toString();
  const exp = chunk.match(/export\{([^}]*)\};?\s*$/);
  const body = chunk.slice(0, exp.index);
  const map = exp[1].split(',').map((x) => x.trim().split(/\s+as\s+/)).map(([local, name]) => `${name ?? local}:${local}`).join(',');
  const binds = m[1].split(',').map((x) => x.trim().split(/\s+as\s+/)).map(([name, local]) => `${local ?? name}=__c.${name}`).join(',');
  // every replacement that carries a file's own text is given as a function: as plain text, "$&" and its like are
  // read as commands, and the film's small script can hold "$&&" (a name "$" followed by "&&")
  js = js.replace(m[0], () => `const __c=(()=>{${body};return{${map}}})();const ${binds};`);
}

// pictures: AVIF inside the file; a WebP address becomes a short token (a <picture> never fetches it when the AVIF
// source matches), so the film still tells its files apart
const pics = new Map();
const pic = (u) => { if (!pics.has(u)) pics.set(u, dataUri(u)); return pics.get(u); };
// to stay under 6 MB the preview leaves out the 2x files of scene 4 (the one that needs them least; scene 5 keeps its
// own, so the coach screens read on a sharp phone)
js = js.replace(/,\{w:(?:2880|1572),[^}]*\/pictures\/s4-[^}]*\}/g, '');
js = js.replace(/"(\/pictures\/[^"]+-matte-[^"]+\.webp)"/g, (_, u) => `"${pic(u)}"`);
js = js.replace(/"(\/pictures\/[^"]+\.avif)"/g, (_, u) => `"${pic(u)}"`).replace(/"\/pictures\/([^"]+)\.webp"/g, '"#$1"');
css = css.replace(/url\("?(\/pictures\/[^")]+-matte-[^")]+\.webp)"?\)/g, (_, u) => `url("${pic(u)}")`);
const firstKeys = /\/pictures\/s1-(?:desk|phone)-p1-/;
home = home
  .replace(/<source[^>]*type="image\/webp"[^>]*>/g, '')
  .replace(/<link rel="preload" as="image"[^>]*>/g, '')
  // the resting pictures in the page: 1x only, except the first picture (the film keeps that one)
  .replace(/srcset="([^"]+)"/g, (_, set) => `srcset="${set.split(', ').filter((e) => firstKeys.test(e) || / (?:1440|786)w$/.test(e)).map((e) => { const [u, w] = e.split(' '); return pic(u) + ' ' + w; }).join(', ')}"`)
  .replace(/<img class="pass still" src="(\/pictures\/[^"]+)\.webp"/g, (_, u) => `<img class="pass still" src="#${u.split('/').pop()}"`)
  .replace(/<link rel="preload" as="font"[^>]*>/, '')
  .replace(/<link rel="modulepreload"[^>]*>/g, '')
  .replace(/<link rel="stylesheet"[^>]*>/, () => `<style>${css}</style>`)
  .replace(/<script type="module"[^>]*><\/script>/, '')
  .replace(/<link rel="icon"[^>]*>/, () => `<link rel="icon" href="${dataUri('/favicon.svg')}">`)
  .replace(/<link rel="apple-touch-icon"[^>]*>/, '')
  .replace(/<link rel="alternate"[^>]*>/, '')
  .replace('<meta name="viewport"', '<meta name="robots" content="noindex">\n<meta name="viewport"')
  .replace('<body class="home">', '<body class="home">\n<noscript><p class="pv-note">Open this file in Safari or Chrome.</p></noscript>');

// the three pages in one file
const SWITCH = `<script>
(function(){
  function show(){
    var h = location.hash, t = h === '#machines' ? 'machine' : h === '#legal' || h === '#privacy' || h === '#terms' || h === '#credits' ? 'legal' : '';
    document.documentElement.classList.toggle('pv-text', !!t);
    document.body.classList.toggle('text', !!t);
    document.querySelectorAll('.pv-page').forEach(function(m){ m.hidden = m.id !== t; });
    document.querySelectorAll('.sw a').forEach(function(a){
      var on = (a.getAttribute('href') === '#' && !t) || (a.getAttribute('href') === '#machines' && t === 'machine');
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    if (t && (h === '#machines' || h === '#legal')) scrollTo(0, 0);
    if (!t && h === '#') scrollTo(0, 0);
  }
  addEventListener('hashchange', show); show();
})();
</script>`;
const inlined = js.replace(/<\/script/g, '<\\/script');
home = home
  .replace('</main>', () => `</main>\n${machines}\n${legal}`)
  .replace(/href="\/machines\/"/g, 'href="#machines"')
  .replace(/href="\/legal\/"/g, 'href="#legal"')
  .replace(/href="\/"/g, 'href="#"')
  // a door opens the product's own public address (one file has no studio address to forward it)
  .replace(/href="([^"]+)"/g, (all, to) => { const d = doors.find((x) => (x.open ?? x.path) === to); return d ? `href="${d.target}${to.slice(d.path.length - 1)}"` : all; })
  .replace('</body>', () => `${SWITCH}\n<script type="module">${inlined}</script>\n</body>`);
// the script and the styles must sit in the file exactly as they were built
if (!home.includes(inlined) || !home.includes(css)) { console.error('preview: the script or the styles changed while being put in'); process.exit(1); }

const leftover = [...home.matchAll(/(?:src|href|srcset)="(\/[^"]*)"/g), ...home.matchAll(/"(\/pictures\/[^"]*)"/g)].map((m) => m[1]);
if (leftover.length) { console.error('preview: local addresses left: ' + leftover.join(', ')); process.exit(1); }
mkdirSync(dirname(resolve(out)), { recursive: true });
writeFileSync(out, home);
const mb = Buffer.byteLength(home) / 1024 / 1024;
console.log(`wrote ${out} (${mb.toFixed(2)} MB, ${pics.size} pictures)`);
if (mb > 6) { console.error('preview: over 6 MB'); process.exit(1); }
