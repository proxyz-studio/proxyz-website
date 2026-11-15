// Builds every page, llms.txt, robots.txt, sitemap.xml and the picture placement styles
// from the three data files. No words are written here: they all come from content/site.json.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import type { Content, FilmData, Pictures, View, Venture } from '../src/types';
import { frameMask, restingPass } from '../src/film/math';

const root = fileURLToPath(new URL('..', import.meta.url));
const readJson = <T>(rel: string): T => JSON.parse(readFileSync(root + rel, 'utf8')) as T;
export const load = () => ({
  content: readJson<Content>('content/site.json'),
  film: readJson<FilmData>('src/film/scenes.json'),
  pictures: readJson<Pictures>('src/generated/pictures.json'),
});

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PORTRAIT = '(max-aspect-ratio: 1/1)';
const LANDSCAPE = '(min-aspect-ratio: 1001/1000)';

/* ---------- words shared by several outputs ---------- */

/** One venture's plain text line: "04  StudioOS. One brain ..." (the name and the address only when set). */
export function ventureLine(v: Venture, i: number): string {
  return `${String(i + 1).padStart(2, '0')}  ${v.name ? v.name + '. ' : ''}${v.line}${v.name && v.url ? ' ' + v.url : ''}`;
}

/** The machine face as lines of plain text (also the body of llms.txt). */
export function machineLines(c: Content): string[] {
  const tool = c.scenes.find((s) => s.toolLine)?.toolLine ?? '';
  return [
    c.machines.summary, '', c.machines.intro, '',
    ...c.ventures.map(ventureLine), '',
    c.machines.toolIntro, tool, '',
    c.machines.pictures, '',
    c.machines.company,
  ];
}

export function llmsTxt(c: Content): string {
  const [summary, ...rest] = machineLines(c);
  return `# ${c.machines.title}\n\n> ${summary}\n${rest.join('\n')}\n`;
}

export function robotsTxt(c: Content): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${c.site.url}/sitemap.xml\n`;
}

export function sitemapXml(c: Content): string {
  const urls = [c.pages.home, c.pages.machines, c.pages.legal].map((p) => `  <url><loc>${c.site.url}${p.path}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

/* ---------- the border ---------- */

const WORDMARK_PATHS = [
  ['M174 0V296H344C473 296 543 371 543 497C543 623 473 698 344 698H90V0ZM174 625H342C412 625 454 588 454 523V471C454 406 412 369 342 369H174Z', 181, '#ffffff'],
  ['M174 298H285L455 0H549L371 302C482 313 543 385 543 497C543 623 473 698 344 698H90V0H174ZM174 369V625H342C412 625 454 588 454 523V471C454 406 412 369 342 369Z', 303, '#ffffff'],
  ['M300 -12C470 -12 544 121 544 349C544 577 470 710 300 710C130 710 56 577 56 349C56 121 130 -12 300 -12ZM300 61C189 61 145 152 145 292V406C145 546 189 637 300 637C411 637 455 546 455 406V292C455 152 411 61 300 61Z', 425, '#ffffff'],
  ['M352 357 568 698H476L392 563L306 422H302L215 563L134 698H39L254 356L26 0H118L206 139L301 291H305L397 139L480 0H575Z', 547, '#F2D78C'],
  ['M342 0V274L583 698H489L389 516L302 357H298L213 516L113 698H17L258 274V0Z', 669, '#5BC9B8'],
  ['M552 73H139L535 623V698H65V625H443L48 75V0H552Z', 791, '#FF4193'],
] as const;

function wordmark(label: string): string {
  const paths = WORDMARK_PATHS.map(([d, x, fill]) => `<path d="${d}" transform="translate(${x} 262.82) scale(.18 -.18)" fill="${fill}"/>`).join('');
  return `<svg class="wm" viewBox="195 133 698 134" role="img" aria-label="${esc(label)}">${paths}</svg>`;
}

const ARROW = '<svg class="arr" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 8 8 2M3.5 2H8V6.5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';

function switchHtml(c: Content, current: 'people' | 'machines' | null, cls: string): string {
  const a = (href: string, word: string, on: boolean) => `<a href="${href}"${on ? ' aria-current="page"' : ''}>${esc(word)}</a>`;
  return `<nav class="sw ${cls}">${a(c.pages.home.path, c.border.people, current === 'people')}${a(c.pages.machines.path, c.border.machines, current === 'machines')}</nav>`;
}

function marks(c: Content): string {
  const items = c.ventures.map((v, i) => {
    const mark = `<i${v.hollow ? ' class="hollow"' : ''} aria-hidden="true"></i>`;
    if (!v.name) return mark;
    const nm = v.url
      ? `<a class="nm" data-mark="${i}" href="${esc(v.url)}" hidden>${esc(v.name)}${ARROW}</a>`
      : `<span class="nm" data-mark="${i}" hidden>${esc(v.name)}</span>`;
    return mark + nm;
  });
  return `<div class="marks">${items.join('')}</div>`;
}

type Kind = 'home' | 'machines' | 'legal' | 'notFound';

function border(c: Content, kind: Kind): string {
  const current = kind === 'home' ? 'people' : kind === 'machines' ? 'machines' : null;
  const home = `<a class="homelink" href="${c.pages.home.path}"${kind === 'home' ? ' aria-current="page"' : ''}>${wordmark(c.border.wordmark)}</a>`;
  const clock = `<p class="clock"><span class="place">${esc(c.border.place)}</span> <b class="time"></b></p>`;
  const row2 = kind === 'notFound' ? '' : `<div class="row row2">${kind === 'home' ? marks(c) : '<div></div>'}${switchHtml(c, current, 'top-sw')}</div>`;
  const bottom = kind === 'home' ? switchHtml(c, current, 'bottom-sw bord') : '';
  return `<div id="frame" aria-hidden="true"><span class="hair"></span><i></i><i></i><i></i><i></i></div>
<header id="top" class="bord"><div class="row row1">${home}${clock}</div>${row2}</header>${bottom}`;
}

/* ---------- pictures ---------- */

function srcset(p: Pictures, key: string, fmt: 'avif' | 'webp'): string {
  return p[key].files.filter((f) => f[fmt]).map((f) => `${f[fmt]} ${f.w}w`).join(', ');
}
function sizesOf(view: View): string {
  const z = view.frame.zoom ?? 1;
  return view.frame.fit === 'width' ? `${Math.round(z * 100)}vw` : '100vw';
}

/** The picture of one scene in the HTML: pass 1 for scene 1 (the first paint), the resting pass for the others. */
function scenePicture(n: number, film: FilmData, p: Pictures, alt: string): string {
  const { desktop, phone } = film.scenes[n];
  const pick = (v: View) => v.passes[n === 1 ? 0 : restingPass(v)];
  const dk = pick(desktop), pk = pick(phone);
  const sources: string[] = [];
  const add = (key: string, view: View, media: string) => {
    for (const fmt of ['avif', 'webp'] as const) {
      const s = srcset(p, key, fmt);
      if (s) sources.push(`<source media="${media}" type="image/${fmt}" srcset="${s}" sizes="${sizesOf(view)}">`);
    }
  };
  add(dk, desktop, LANDSCAPE);
  add(pk, phone, PORTRAIT);
  const base = p[pk].files[0];
  const [w, h] = p[pk].size;
  const load = n === 1 ? 'fetchpriority="high" decoding="sync"' : 'loading="lazy" decoding="async"';
  return `<picture>${sources.join('')}<img class="pass still" src="${base.webp}" width="${w}" height="${h}" alt="${esc(alt)}" ${load}></picture>`;
}

/** Preload of the first paint picture, one per screen shape. */
function firstPreload(film: FilmData, p: Pictures): string {
  const out: string[] = [];
  for (const [view, media] of [[film.scenes[1].desktop, LANDSCAPE], [film.scenes[1].phone, PORTRAIT]] as const) {
    const key = view.passes[0];
    const fmt = p[key].files.some((f) => f.avif) ? 'avif' : 'webp';
    out.push(`<link rel="preload" as="image" type="image/${fmt}" imagesrcset="${srcset(p, key, fmt)}" imagesizes="${sizesOf(view)}" media="${media}" fetchpriority="high">`);
  }
  return out.join('\n');
}

/* ---------- the film page ---------- */

function sceneHtml(c: Content, film: FilmData, p: Pictures, n: number): string {
  const s = c.scenes[n - 1];
  const tag = n === 1 ? 'h1' : 'h2';
  const cap = `<${tag} class="cap${n === film.brainScene ? ' w14' : ''}">${s.lines.map((l) => `<span>${esc(l)}</span>`).join('')}</${tag}>`;
  const extra = s.heightLine
    ? `<div class="hl" aria-hidden="true"><svg viewBox="0 0 1000 100" preserveAspectRatio="none"><polyline fill="none" stroke="rgba(242,242,242,.78)" stroke-width="1" vector-effect="non-scaling-stroke" points="${film.heightPoints}"/></svg><i class="dot"></i></div>`
    : s.toolLine ? `<p class="tool">${esc(s.toolLine)}</p>` : '';
  const addr = s.letterhead ? `<p class="addr">${esc(s.letterhead)}</p>` : '';
  const foot = n === c.scenes.length
    ? `<div class="foot"><a href="${c.pages.legal.path}">${esc(c.border.legal)}</a>${switchHtml(c, 'people', 'foot-sw')}</div>` : '';
  const mark = s.venture ? c.ventures.findIndex((v) => v.id === s.venture) : -1;
  return `<section id="s${n}" class="scene" data-mark="${mark}"><div class="layer"><div class="passes ready">${scenePicture(n, film, p, s.alt)}</div><div class="dim"></div><div class="shade"></div>${addr}<div class="words">${extra}${cap}</div></div>${foot}</section>`;
}

function head(c: Content, kind: Kind, entry: string, extra = ''): string {
  const meta = kind === 'notFound' ? null : c.pages[kind];
  const title = kind === 'notFound' ? c.pages.notFound.title : meta!.title;
  const url = meta ? c.site.url + meta.path : '';
  const desc = meta ? meta.description : '';
  const social = meta ? `<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(c.site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${c.site.url}${c.site.image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(c.scenes[0].alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${c.site.url}${c.site.image}">` : '<meta name="robots" content="noindex">';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
${social}
<meta name="theme-color" content="#0a0a0a">
<meta name="color-scheme" content="dark">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" as="font" type="font/woff2" href="/src/fonts/IBMPlexMono-600-normal.woff2" crossorigin>
${extra}
<script type="module" src="${entry}"></script>
</head>`;
}

function organisation(c: Content): string {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: c.site.name,
    legalName: c.site.legalName,
    url: c.site.url + '/',
    logo: c.site.url + c.site.logo,
    address: { '@type': 'PostalAddress', addressLocality: c.site.locality, addressCountry: c.site.country },
  };
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

export function homePage(): string {
  const { content: c, film, pictures: p } = load();
  const scenes = c.scenes.map((_, i) => sceneHtml(c, film, p, i + 1)).join('\n');
  return `${head(c, 'home', '/src/main.ts', firstPreload(film, p) + '\n' + organisation(c))}
<body class="home">
<main id="film">
${scenes}
</main>
${border(c, 'home')}
</body>
</html>
`;
}

export function machinesPage(): string {
  const { content: c } = load();
  const lines = machineLines(c);
  // blocks of lines, split at the blank lines; the five venture lines are a list
  const blocks: string[][] = [[]];
  for (const l of lines) if (l === '') blocks.push([]); else blocks[blocks.length - 1].push(l);
  const body = blocks.map((b) => {
    if (b.length === c.ventures.length && b.every((l, i) => l === ventureLine(c.ventures[i], i))) {
      return `<ol class="vl">${b.map((l) => `<li>${esc(l)}</li>`).join('')}</ol>`;
    }
    return `<p>${b.map((l) => `<span>${esc(l)}</span>`).join('')}</p>`;
  }).join('\n');
  return `${head(c, 'machines', '/src/page.ts')}
<body class="text machines">
<main id="machine" class="plain">
<h1>${esc(c.machines.title)}</h1>
${body}
<p class="foot"><a href="${c.pages.legal.path}">${esc(c.border.legal)}</a></p>
</main>
${border(c, 'machines')}
</body>
</html>
`;
}

export function legalPage(): string {
  const { content: c } = load();
  const L = c.legal;
  const sections = L.sections.map((s) => {
    const parts = s.parts.map((pt) => `<h3>${esc(pt.heading)}</h3>${pt.text.map((t) => `<p>${esc(t)}</p>`).join('')}${pt.list ? `<ul>${pt.list.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}${(pt.after ?? []).map((t) => `<p>${esc(t)}</p>`).join('')}`).join('');
    return `<section id="${s.id}"><h2>${esc(s.heading)}</h2>${s.lead.map((t) => `<p>${esc(t)}</p>`).join('')}${parts}</section>`;
  }).join('\n');
  return `${head(c, 'legal', '/src/page.ts')}
<body class="text legal">
<main id="legal" class="plain">
<h1>${esc(L.title)}</h1>
<p class="revised">${esc(L.revised)}</p>
${sections}
</main>
${border(c, 'legal')}
</body>
</html>
`;
}

export function notFoundPage(): string {
  const { content: c } = load();
  return `${head(c, 'notFound', '/src/page.ts')}
<body class="text nf">
<main id="nf"><h1 class="cap">${esc(c.pages.notFound.line)}</h1></main>
${border(c, 'notFound')}
</body>
</html>
`;
}

/* ---------- picture placement without the script (and the first paint) ---------- */

/** CSS that places each scene's HTML picture as the film would place it, in steady screen units. */
export function stillsCss(): string {
  const { film, pictures: p } = load();
  const out: string[] = [];
  const W = 'var(--W)', H = 'var(--H)';
  for (const [n, sc] of Object.entries(film.scenes)) {
    for (const [form, media] of [['desktop', LANDSCAPE], ['phone', PORTRAIT]] as const) {
      const view = sc[form];
      const key = view.passes[n === '1' ? 0 : restingPass(view)];
      const [iw, ih] = p[key].size;
      const f = view.frame, z = f.zoom ?? 1;
      const s = f.fit === 'width' ? `calc(${W} / ${iw} * ${z})`
        : f.fit === 'contain' ? `calc(min(${W} / ${iw}, ${H} / ${ih}) * ${z})`
        : `calc(max(${W} / ${iw}, ${H} / ${ih}) * ${z})`;
      let left = `calc(${f.vx} * ${W} - ${f.fx} * var(--s) * ${iw})`;
      let top = `calc(${f.vy} * ${H} - ${f.fy} * var(--s) * ${ih})`;
      if (f.fit === 'cover') {
        left = `clamp(calc(${W} - var(--s) * ${iw}), ${left}, 0px)`;
        top = `clamp(calc(${H} - var(--s) * ${ih}), ${top}, 0px)`;
      }
      const mask = frameMask(view, [iw, ih]);
      const decl = [`--s:${s}`, `width:calc(var(--s) * ${iw})`, `height:calc(var(--s) * ${ih})`, `left:${left}`, `top:${top}`];
      if (mask) decl.push(`-webkit-mask-image:${mask}`, `mask-image:${mask}`);
      if (view.filter) decl.push(`filter:${view.filter}`);
      out.push(`@media ${media}{#s${n} .still{${decl.join(';')}}}`);
    }
  }
  const last = film.heightPoints.trim().split(/\s+/).pop()!.split(',');
  out.push(`.hl .dot{top:${last[1]}%}`);
  for (const [n, k] of Object.entries(film.tall)) out.push(`.film #s${n}{height:${(k * 100).toFixed(0)}vh;height:${(k * 100).toFixed(0)}lvh}`);
  return out.join('\n') + '\n';
}

/* ---------- the Vite plugin ---------- */

const PAGES: Record<string, () => string> = {
  '/index.html': homePage,
  '/machines/index.html': machinesPage,
  '/legal/index.html': legalPage,
  '/404.html': notFoundPage,
};
const FILES: Record<string, () => string> = {
  'llms.txt': () => llmsTxt(load().content),
  'robots.txt': () => robotsTxt(load().content),
  'sitemap.xml': () => sitemapXml(load().content),
};

export function sitePages(): Plugin {
  return {
    name: 'site-pages',
    // the picture placement is added to the one style file, so every page shares one stylesheet
    transform(code, id) { return id.endsWith('/src/style.css') ? code + '\n' + stillsCss() : null; },
    transformIndexHtml: {
      order: 'pre',
      handler(_html, ctx) {
        const make = PAGES[ctx.path];
        if (!make) throw new Error(`site-pages: no page for ${ctx.path}`);
        return make();
      },
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const name = (req.url ?? '').replace(/^\//, '').split('?')[0];
        const make = FILES[name];
        if (!make) return next();
        res.setHeader('Content-Type', name.endsWith('.xml') ? 'application/xml' : 'text/plain; charset=utf-8');
        res.end(make());
      });
    },
    generateBundle() {
      for (const [fileName, make] of Object.entries(FILES)) this.emitFile({ type: 'asset', fileName, source: make() });
    },
  };
}
