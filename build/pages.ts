// Builds every page, llms.txt, robots.txt, sitemap.xml and the picture placement styles
// from the three data files. No words are written here: they all come from content/site.json.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import type { BoardForm, Content, FilmData, Pictures, SceneWords, View, Venture } from '../src/types';
import { cutMask, frameMask, restingPass } from '../src/film/math';
import { readFont } from './font';
import { boardLabels, boardSvg, labelCss, nameCss } from './board';

const root = fileURLToPath(new URL('..', import.meta.url));
const readJson = <T>(rel: string): T => JSON.parse(readFileSync(root + rel, 'utf8')) as T;
export const load = () => ({
  content: readJson<Content>('content/site.json'),
  film: readJson<FilmData>('src/film/scenes.json'),
  pictures: readJson<Pictures>('src/generated/pictures.json'),
  board: readJson<Record<'desktop' | 'phone', BoardForm>>('src/generated/board.json'),
});

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** Escaped text in which an email address becomes a mail link (same words, only tappable). */
const escMail = (s: string) => esc(s).replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, (m) => `<a class="mail" href="mailto:${m}">${m}</a>`);
const PORTRAIT = '(max-aspect-ratio: 1/1)';
const LANDSCAPE = '(min-aspect-ratio: 1001/1000)';
/** The display face of the giant lines (its widths size every line in CSS, see typeCss). */
export const DISPLAY_FONT = 'src/fonts/anton-latin-400-normal.woff2';

/** The views of scene n. Scene 7 has a build time choice of picture in the content file: its own, or the twin of
 *  scene 6 (the same pool of light, now empty, framed exactly like scene 6). */
export function sceneViews(film: FilmData, c: Content, n: number): { desktop: View; phone: View } {
  const s = c.scenes[n - 1];
  if (s?.picture === 'twin') {
    const twin = film.scenes[`${n}twin`];
    if (!twin) throw new Error(`site-pages: scene ${n} asks for the twin picture, but src/film/scenes.json has no "${n}twin"`);
    return twin;
  }
  return film.scenes[String(n)];
}

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

/** The link section at the end of llms.txt: one line per page, "- [PEOPLE](https://.../): the film". */
export function llmsLinks(c: Content): string[] {
  const n = c.machines.pageNotes;
  return [
    `## ${c.machines.pagesHeading}`, '',
    `- [${c.border.people}](${c.site.url}${c.pages.home.path}): ${n.home}`,
    `- [${c.border.machines}](${c.site.url}${c.pages.machines.path}): ${n.machines}`,
    `- [${c.border.legal}](${c.site.url}${c.pages.legal.path}): ${n.legal}`,
  ];
}

export function llmsTxt(c: Content): string {
  const [summary, ...rest] = machineLines(c);
  return `# ${c.machines.title}\n\n> ${summary}\n${rest.join('\n')}\n\n${llmsLinks(c).join('\n')}\n`;
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
  const bottom = kind === 'notFound' ? '' : switchHtml(c, current, 'bottom-sw bord');
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

/** The phone lines of a scene, grouped by the wide screen line they belong to. A phone line may not run across two
 *  wide screen lines (each wide line keeps its own words, so the heading reads the same on every screen). */
export function lineGroups(s: SceneWords): string[][] {
  const phone = [...(s.phoneLines ?? s.lines)];
  const groups = s.lines.map((line) => {
    const group: string[] = [];
    let got = '';
    while (got !== line) {
      const next = phone.shift();
      if (next === undefined) throw new Error(`site-pages: the phone lines of scene "${s.id}" do not make "${line}"`);
      got = got ? `${got} ${next}` : next;
      group.push(next);
      if (got !== line && !line.startsWith(got + ' ')) throw new Error(`site-pages: the phone line "${next}" of scene "${s.id}" runs across two lines`);
    }
    return group;
  });
  if (phone.length) throw new Error(`site-pages: scene "${s.id}" has phone lines left over`);
  return groups;
}

/** The giant heading: one block per wide screen line (.ln), one block per phone line (.pl, numbered l1, l2 ...). */
function bigHeading(s: SceneWords, tag: string): string {
  let k = 0;
  const lns = lineGroups(s).map((g) => `<span class="ln">${g.map((pl) => `<span class="pl l${++k}">${esc(pl)}</span>`).join(' ')}</span>`);
  return `<${tag} class="big">${lns.join(' ')}</${tag}>`;
}

function sceneHtml(c: Content, film: FilmData, p: Pictures, n: number): string {
  const s = c.scenes[n - 1];
  const atBottom = film.type.bottom.includes(n);
  film = { ...film, scenes: { ...film.scenes, [n]: sceneViews(film, c, n) } };
  const heading = bigHeading(s, n === 1 ? 'h1' : 'h2');
  const extra = s.heightLine
    ? `<div class="hl" aria-hidden="true"><svg viewBox="0 0 1000 100" preserveAspectRatio="none"><polyline fill="none" stroke="rgba(242,242,242,.78)" stroke-width="1" vector-effect="non-scaling-stroke" points="${film.heightPoints}"/></svg><i class="dot"></i></div>`
    : s.toolLine ? `<p class="tool">${esc(s.toolLine)}</p>` : '';
  const small = (s.small ? `<p class="small">${esc(s.small)}</p>` : '') + (s.note ? `<p class="note">${esc(s.note)}</p>` : '');
  // the giant words: at the foot of the screen (with the small words, which ride a phone browser's bar), or at the
  // top under the border, where the thing lit from the first pass may stand in front of them (see .cut)
  const cut = atBottom ? '' : `<div class="cut">${heading}</div>`;
  const foot1 = atBottom ? heading + extra + small : extra + small;
  const words = foot1 ? `<div class="words">${foot1}</div>` : '';
  // the letterhead breaks only between its sentences on a narrow phone
  const addr = s.letterhead ? `<p class="addr">${s.letterhead.split(/(?<=\.) (?=[A-Z])/).map((t) => `<span>${esc(t)}</span>`).join(' ')}</p>` : '';
  const foot = n === c.scenes.length
    ? `<div class="foot"><a href="${c.pages.legal.path}">${esc(c.border.legal)}</a>${switchHtml(c, 'people', 'foot-sw')}</div>` : '';
  const mark = s.venture ? c.ventures.findIndex((v) => v.id === s.venture) : -1;
  const view = n === c.scenes.length && s.picture === 'twin' ? ' data-view="twin"' : '';
  // scene 6: the board on the floor, at rest, in the picture's own box (one drawing per screen shape); its labels in a
  // box of their own just after the pictures, the same size and place, where the picture's soft side edges never reach
  const b = s.board ? load().board : null;
  const board = s.board && b ? `<div class="bbox">${boardSvg(b.desktop, 'd')}${boardSvg(b.phone, 'p')}</div>` : '';
  const labels = s.board && b ? boardLabels(s.board, c.ventures, b.desktop, b.phone) : '';
  return `<section id="s${n}" class="scene" data-mark="${mark}"${view}><div class="layer"><div class="passes ready">${scenePicture(n, film, p, s.alt)}${board}</div>${labels}<div class="dim"></div><div class="shade"></div>${cut}${words}${addr}</div>${foot}</section>`;
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
<meta name="twitter:image" content="${c.site.url}${c.site.image}">
<link rel="alternate" type="text/plain" href="/llms.txt">` : '<meta name="robots" content="noindex">';
  // the film page is in the film's black from the first paint (its root, its body and the browser's own colour)
  const filmPage = kind === 'home';
  return `<!doctype html>
<html lang="en"${filmPage ? ' class="film-page"' : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
${social}
<meta name="theme-color" content="${filmPage ? '#010101' : '#0a0a0a'}">
<meta name="color-scheme" content="dark">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" as="font" type="font/woff2" href="${filmPage ? '/' + DISPLAY_FONT : '/src/fonts/IBMPlexMono-SemiBold-Latin1.woff2'}" crossorigin>
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
${border(c, 'home')}
<main id="film">
${scenes}
</main>
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
${border(c, 'machines')}
<main id="machine" class="plain">
<h1>${esc(c.machines.title)}</h1>
${body}
<p class="foot"><a href="${c.pages.legal.path}">${esc(c.border.legal)}</a></p>
</main>
</body>
</html>
`;
}

export function legalPage(): string {
  const { content: c } = load();
  const L = c.legal;
  const sections = L.sections.map((s) => {
    const parts = s.parts.map((pt) => `<h3>${esc(pt.heading)}</h3>${pt.text.map((t) => `<p>${escMail(t)}</p>`).join('')}${pt.list ? `<ul>${pt.list.map((t) => `<li>${escMail(t)}</li>`).join('')}</ul>` : ''}${(pt.after ?? []).map((t) => `<p>${escMail(t)}</p>`).join('')}`).join('');
    return `<section id="${s.id}"><h2>${esc(s.heading)}</h2>${s.lead.map((t) => `<p>${escMail(t)}</p>`).join('')}${parts}</section>`;
  }).join('\n');
  return `${head(c, 'legal', '/src/page.ts')}
<body class="text legal">
${border(c, 'legal')}
<main id="legal" class="plain">
<h1>${esc(L.title)}</h1>
<p class="revised">${esc(L.revised)}</p>
${sections}
</main>
</body>
</html>
`;
}

export function notFoundPage(): string {
  const { content: c } = load();
  return `${head(c, 'notFound', '/src/page.ts')}
<body class="text nf">
${border(c, 'notFound')}
<main id="nf"><h1 class="cap">${esc(c.pages.notFound.line)}</h1></main>
</body>
</html>
`;
}

/* ---------- picture placement without the script (and the first paint) ---------- */

const maskDecl = (m: Record<string, string>) => [
  `-webkit-mask-image:${m.image}`, `mask-image:${m.image}`, `-webkit-mask-size:${m.size}`, `mask-size:${m.size}`,
  `-webkit-mask-position:${m.position}`, `mask-position:${m.position}`, `-webkit-mask-repeat:${m.repeat}`, `mask-repeat:${m.repeat}`,
  `-webkit-mask-composite:${m.webkitComposite}`, `mask-composite:${m.composite}`,
];

/** The size rules of the giant lines, from the display face's own widths: on a wide screen one size per block (its
 *  widest line a share of the window width, the block never taller than a share of the height); on an upright screen
 *  each line fitted to the width between the side margins, but never taller than a share of the height. */
/** The font size of the giant lines of scene n as CSS: wide, one size for the block; upright, one per phone line. */
function typeSizes(film: FilmData, s: SceneWords, n: number): { wide: string; upright: string[] } {
  const T = film.type, font = readFont(root + DISPLAY_FONT);
  const w = (t: string) => font.width(t, T.letterSpacing);
  const share = T.share[n] ?? T.shareDefault;
  const widest = Math.max(...s.lines.map(w)).toFixed(5);
  return {
    wide: `min(calc(var(--W) * ${share} / ${widest}), calc(var(--H) * ${T.blockMax} / ${(T.lineHeight * s.lines.length).toFixed(3)}))`,
    upright: lineGroups(s).flat().map((pl) => `min(calc((var(--W) - 2 * var(--side)) / ${w(pl).toFixed(5)}), calc(var(--H) * ${T.lineMax}))`),
  };
}

/** The height of the giant words of scene n, as CSS (the line height times each line's size). */
function typeHeightCss(film: FilmData, s: SceneWords, n: number, form: 'desktop' | 'phone'): string {
  const z = typeSizes(film, s, n), lh = film.type.lineHeight;
  return form === 'desktop' ? `${(lh * s.lines.length).toFixed(3)} * ${z.wide}` : `${lh} * (${z.upright.join(' + ')})`;
}

export function typeCss(): string {
  const { content: c, film } = load();
  const T = film.type;
  // the letter spacing is set on each line too: an em value turns into pixels where it is declared, and an upright
  // screen sizes each line on its own
  const font = readFont(root + DISPLAY_FONT);
  const under = (T.lineHeight + font.descent - font.ascent) / 2;
  const out = [`.big{line-height:${T.lineHeight}}.big,.big .ln,.big .pl{letter-spacing:${T.letterSpacing}em}`,
    // in em of a giant line: its capitals' height, and how far its box reaches under the baseline (film and stills)
    `:root{--type-cap:${font.capHeight.toFixed(5)};--type-under:${under.toFixed(5)}}`];
  const wide: string[] = [], upright: string[] = [];
  c.scenes.forEach((s, i) => {
    const z = typeSizes(film, s, i + 1);
    wide.push(`#s${i + 1} .big{font-size:${z.wide}}`);
    z.upright.forEach((e, k) => upright.push(`#s${i + 1} .l${k + 1}{font-size:${e}}`));
  });
  out.push(`@media ${LANDSCAPE}{${wide.join('')}}`, `@media ${PORTRAIT}{${upright.join('')}}`);
  return out.join('\n') + '\n';
}

/** CSS that places each scene's HTML picture as the film would place it, in steady screen units. With scripts off,
 *  a scene with a matte also gets its cut in the giant words (the film sets its own once it runs). */
export function stillsCss(): string {
  const { content: c, film, pictures: p, board } = load();
  const out: string[] = [];
  for (const n of Object.keys(film.scenes).filter((k) => /^\d+$/.test(k))) {
    const sc = sceneViews(film, c, Number(n));
    for (const [form, media] of [['desktop', LANDSCAPE], ['phone', PORTRAIT]] as const) {
      const view = sc[form];
      const key = view.passes[n === '1' ? 0 : restingPass(view)];
      const [iw, ih] = p[key].size;
      const f = view.frame;
      const place = placement(film, c, p, Number(n), form, view, iw, ih);
      const mask = frameMask(view, [iw, ih]);
      const decl = [...place.vars, `width:${place.w}`, `height:${place.h}`, `left:${place.left}`, `top:${place.top}`];
      if (mask) decl.push(`-webkit-mask-image:${mask}`, `mask-image:${mask}`);
      if (view.filter) decl.push(`filter:${view.filter}`);
      out.push(`@media ${media}{#s${n} .still{${decl.join(';')}}}`);
      // sides: a picture narrower than the screen fades into black at its left and right edges (as the film does)
      if (f.sides) {
        const L = 'var(--l)', w = place.w, fe = `calc(0.14 * ${w})`;
        const grad = `linear-gradient(to right,transparent ${L},#000 calc(${L} + ${fe}),#000 calc(${L} + ${w} - ${fe}),transparent calc(${L} + ${w}))`;
        out.push(`@media ${media}{#s${n} .passes:has(.still){${place.vars.join(';')};--l:${place.left};-webkit-mask-image:${grad};mask-image:${grad}}}`);
      }
      // the cut, with scripts off (and once the film has given up): never while the film may still start, so the
      // mattes of later scenes do not load with the first screen
      const matte = view.matte && p[view.matte]?.matte ? p[view.matte] : null;
      if (matte && !film.type.bottom.includes(Number(n))) {
        const m = cutMask(matte.files[0].webp, view.opens ? '' : mask, { left: place.left, top: place.top, w: place.w, h: place.h });
        const rule = `#s${n} .cut{${place.vars.join(';')};${maskDecl(m).join(';')}}`;
        out.push(`@media (scripting: none) and ${media}{${rule}}`, `@media ${media}{.nofilm ${rule}}`);
      }
      // the board: in the picture's box, its lines in screen pixels (--bw: screen pixels per picture pixel), hidden
      // inside the three things (their matte), with scripts off and once the film has given up. While the film script
      // has not run (and for good when it never arrives) the board and its labels are not shown at all (style.css),
      // so no matte rule applies then and the matte is never fetched.
      const things = view.things && p[view.things]?.matte ? p[view.things] : null;
      if (things) {
        const f = board[form], k = form === 'desktop' ? 'd' : 'p';
        out.push(`@media ${media}{#s${n} .bbox,#s${n} .lbox{${[...place.vars, `--bw:calc(var(--sw) / ${iw})`, `width:${place.w}`, `height:${place.h}`, `left:${place.left}`, `top:${place.top}`].join(';')}}#s${n} .board:not(.b${k}){display:none}${labelCss(f).replace(/\.blab/g, `#s${n} .blab`)}}`);
        const u = `url("${things.files[0].webp}")`;
        const rule = `#s${n} .board{-webkit-mask:linear-gradient(#000,#000),${u};-webkit-mask-size:100% 100%;-webkit-mask-composite:xor;mask:linear-gradient(#000,#000),${u};mask-size:100% 100%;mask-composite:exclude}`;
        out.push(`@media (scripting: none) and ${media}{${rule}}`, `@media ${media}{.nofilm ${rule}}`);
      }
    }
  }
  out.push(nameCss());
  const last = film.heightPoints.trim().split(/\s+/).pop()!.split(',');
  out.push(`.hl .dot{top:${last[1]}%}`);
  // #film in the selector: it must outweigh the general `.film #film .scene` height
  for (const [n, k] of Object.entries(film.tall)) out.push(`.film #film #s${n}{height:${(k * 100).toFixed(0)}vh;height:${(k * 100).toFixed(0)}lvh}`);
  return out.join('\n') + '\n';
}

/** Lines a monospaced paragraph breaks into at a width of `chars` characters (words never split). */
function wrapCount(text: string, chars: number): number {
  let lines = 1, len = 0;
  for (const word of text.split(' ')) {
    if (len && len + 1 + word.length > chars) { lines++; len = word.length; } else len += (len ? 1 : 0) + word.length;
  }
  return lines;
}

/** On an upright screen, the height of the words at the foot of a scene with its giant words at the top (the
 *  height line, the small line and its note; as style.css sets them: 44 px, 15 px at 1.45, 20 px less 8, gaps of
 *  18 px). The small line is 30 characters wide on every phone of 302 px and more. The film measures the same block. */
function footPortrait(s: SceneWords): number {
  if (s.toolLine) throw new Error(`site-pages: scene "${s.id}" needs its foot height for a span, but its tool line wraps with the width`);
  const items = [...(s.heightLine ? [44] : []), ...(s.small ? [wrapCount(s.small, 30) * 15 * 1.45] : []), ...(s.note ? [20] : [])];
  return items.reduce((a, b) => a + b, 0) + 18 * Math.max(0, items.length - 1) - (s.note ? 8 : 0);
}

/** Where the film puts a scene's pictures, as CSS: the same arithmetic as geometry() in src/main.ts, in steady screen
 *  units (--H the large viewport, --S the small one, so nothing moves when a phone browser's bar slides). The scale is
 *  carried as the picture's width in px (--sw), never as px per picture pixel: Firefox keeps lengths in sixtieths of a
 *  pixel, so a tiny length like 0.547px would come back as 0.533px. */
function placement(film: FilmData, c: Content, p: Pictures, n: number, form: 'desktop' | 'phone', view: View, iw: number, ih: number): { vars: string[]; left: string; top: string; w: string; h: string } {
  const W = 'var(--W)', H = 'var(--H)', S = 'var(--S)';
  const f = view.frame, z = f.zoom ?? 1, r6 = (v: number) => +v.toFixed(6);
  const aspect = r6(ih / iw), per = (row: number) => r6(row / iw);   // a picture row as a share of the picture's width
  const roomN = view.placeAs ?? n, roomWords = c.scenes[roomN - 1];
  const atFoot = film.type.bottom.includes(roomN);
  const k0w = f.fit === 'width' ? `calc(${W} * ${z})`
    : f.fit === 'contain' ? `calc(min(${W}, ${H} * ${r6(iw / ih)}) * ${z})`
    : `calc(max(${W}, ${H} * ${r6(iw / ih)}) * ${z})`;
  const typeH = typeHeightCss(film, roomWords, roomN, form);
  // the words at the foot: the giant words of scenes 1 and 7, or the small words of the others (upright screens
  // only); where they start, at the small height (a phone browser's bar showing) or, without a bar, above the home bar
  const footTop = () => {
    const foot = atFoot ? typeH : form === 'phone' ? `${footPortrait(roomWords).toFixed(2)}px` : '0px';
    return `min(calc(${S} - var(--words-base) - ${foot}), calc(${H} - var(--words-base) - var(--safe-b) - ${foot}))`;
  };
  const vars = [`--k0w:${k0w}`];
  let sw = 'var(--k0w)';
  if (f.span) {
    if (form !== 'phone') throw new Error(`site-pages: scene ${n} has a span on a wide screen; only upright screens know their foot`);
    const rv = sceneViews(film, c, roomN)[form];
    const tuck = rv.matte && p[rv.matte]?.matte ? rv.frame.tuck ?? 0 : 0;
    const z2 = typeSizes(film, roomWords, roomN);
    const lastSize = z2.upright[z2.upright.length - 1];
    const roomTop = atFoot ? `calc(var(--strip) + var(--safe-t) + 12px)`
      : tuck ? `calc(var(--type-top) + ${typeH} - (var(--type-under) + ${tuck} * var(--type-cap)) * ${lastSize})`
      : `calc(var(--type-top) + ${typeH} + 12px)`;
    const rows = f.span[1] - f.span[0];
    vars.push(`--rt:${roomTop}`, `--rb:calc(${footTop()} - 16px)`);
    // the span's rows fill the room at most (never under half the picture's size)
    sw = `min(var(--k0w), max(calc((var(--rb) - var(--rt)) * ${r6(iw / rows)}), calc(0.5 * var(--k0w))))`;
  }
  vars.push(`--sw:${sw}`);
  const w = 'var(--sw)', h = `calc(var(--sw) * ${aspect})`;
  let left = `calc(${f.vx} * ${W} - ${f.fx} * var(--sw))`;
  let top = `calc(${f.vy} * ${H} - ${r6(f.fy * ih / iw)} * var(--sw))`;
  if (f.fit === 'cover') {
    // a picture wider than the screen covers it; one narrower stays inside it
    const dw = `calc(${W} - var(--sw))`, dh = `calc(${H} - var(--sw) * ${aspect})`;
    left = `clamp(min(0px, ${dw}), ${left}, max(0px, ${dw}))`;
    top = `clamp(min(0px, ${dh}), ${top}, max(0px, ${dh}))`;
  }
  if (f.above && atFoot) top = `min(${top}, calc(${footTop()} - ${f.above[1]}px - ${per(f.above[0])} * var(--sw)))`;
  if (f.below && !atFoot) top = `max(${top}, calc(var(--type-top) + ${typeH} + ${f.below[1]}px - ${per(f.below[0])} * var(--sw)))`;
  if (f.span) top = `clamp(calc(var(--rt) - ${per(f.span[0])} * var(--sw)), ${top}, calc(var(--rb) - ${per(f.span[1])} * var(--sw)))`;
  return { vars, left, top, w, h };
}

/* ---------- the Vite plugin ---------- */

const PAGES: Record<string, () => string> = {
  '/index.html': homePage,
  '/machines/index.html': machinesPage,
  '/legal/index.html': legalPage,
  '/404.html': notFoundPage,
};
const FILES: Record<string, () => string> = {
  'OFL.txt': () => readFileSync(root + 'src/fonts/OFL.txt', 'utf8'),
  'OFL-Anton.txt': () => readFileSync(root + 'src/fonts/OFL-Anton.txt', 'utf8'),
  'llms.txt': () => llmsTxt(load().content),
  'robots.txt': () => robotsTxt(load().content),
  'sitemap.xml': () => sitemapXml(load().content),
};

export function sitePages(): Plugin {
  return {
    name: 'site-pages',
    // the picture placement is added to the one style file, so every page shares one stylesheet
    transform(code, id) { return id.endsWith('/src/style.css') ? code + '\n' + typeCss() + stillsCss() : null; },
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
