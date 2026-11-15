#!/usr/bin/env node
// Makes ONE self contained file from the real build in dist/: the film with its styles, script, fonts and pictures
// inside it, and the machine face and LEGAL reachable inside the same file. For looking at the site without a server
// (open it from a folder, or send it to a phone). Not part of the site.
//
//   npm run build && node scripts/preview-file.mjs <out.html>
//
// Preview only: links between the three pages become #machines and #legal, and a tiny inline script switches them.
// Pictures are WebP only (every browser that runs the film reads WebP), to keep the file small.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
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
css += '\n.pv-text #film,.pv-text .marks,.pv-text .bottom-sw,html.pv-text body::before{display:none!important}';

// script: the shared clock chunk and the film, joined into one module without imports
const mainSrc = home.match(/<script type="module"[^>]*src="([^"]+)"/)[1];
let js = read(mainSrc).toString();
for (const m of [...js.matchAll(/import\{([^}]*)\}from"\.\/([^"]+)";/g)]) {
  const chunk = read('assets/' + m[2]).toString();
  const exp = chunk.match(/export\{([^}]*)\};?\s*$/);
  const body = chunk.slice(0, exp.index);
  const map = exp[1].split(',').map((x) => x.trim().split(/\s+as\s+/)).map(([local, name]) => `${name ?? local}:${local}`).join(',');
  const binds = m[1].split(',').map((x) => x.trim().split(/\s+as\s+/)).map(([name, local]) => `${local ?? name}=__c.${name}`).join(',');
  js = js.replace(m[0], `const __c=(()=>{${body};return{${map}}})();const ${binds};`);
}

// pictures: WebP inside the file, AVIF left out
const pics = new Map();
const pic = (u) => { if (!pics.has(u)) pics.set(u, dataUri(u)); return pics.get(u); };
js = js.replace(/"\/pictures\/[^"]+\.avif"/g, '""').replace(/"(\/pictures\/[^"]+\.webp)"/g, (_, u) => `"${pic(u)}"`);
home = home
  .replace(/<source[^>]*type="image\/avif"[^>]*>/g, '')
  .replace(/<link rel="preload" as="image"[^>]*>/g, '')
  .replace(/(\/pictures\/[^"\s]+\.webp)/g, (u) => pic(u))
  .replace(/<link rel="preload" as="font"[^>]*>/, '')
  .replace(/<link rel="modulepreload"[^>]*>/g, '')
  .replace(/<link rel="stylesheet"[^>]*>/, `<style>${css}</style>`)
  .replace(/<script type="module"[^>]*><\/script>/, '')
  .replace(/<link rel="icon"[^>]*>/, `<link rel="icon" href="${dataUri('/favicon.svg')}">`)
  .replace(/<link rel="apple-touch-icon"[^>]*>/, '')
  .replace('<meta name="viewport"', '<meta name="robots" content="noindex">\n<meta name="viewport"');

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
home = home
  .replace('</main>', `</main>\n${machines}\n${legal}`)
  .replace(/href="\/machines\/"/g, 'href="#machines"')
  .replace(/href="\/legal\/"/g, 'href="#legal"')
  .replace(/href="\/"/g, 'href="#"')
  .replace('</body>', `${SWITCH}\n<script type="module">${js.replace(/<\/script/g, '<\\/script')}</script>\n</body>`);

const leftover = [...home.matchAll(/(?:src|href|srcset)="(\/[^"]*)"/g)].map((m) => m[1]);
if (leftover.length) { console.error('preview: local addresses left: ' + leftover.join(', ')); process.exit(1); }
mkdirSync(dirname(resolve(out)), { recursive: true });
writeFileSync(out, home);
const mb = Buffer.byteLength(home) / 1024 / 1024;
console.log(`wrote ${out} (${mb.toFixed(2)} MB, ${pics.size} pictures)`);
if (mb > 6) { console.error('preview: over 6 MB'); process.exit(1); }
