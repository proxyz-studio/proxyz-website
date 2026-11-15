#!/usr/bin/env node
// npm run check: builds the site (see package.json), serves dist/ on this machine and proves, line by line,
// that the built site keeps the rules. Every line says PASS, FAIL or WARN. Exit code 1 when any line fails.
//
// Needs hidden (headless) browsers: playwright-core with Chromium, WebKit and Firefox already on this machine.
// It is not a dependency of the site. Set PLAYWRIGHT_CORE to its folder, or the check looks in the usual places
// under your home folder. It never downloads anything.
// HIDDEN_NAMES_FILE: a file with one name per line that must not appear anywhere (test 2 is skipped without it).
// CHECK_PORT: the local port (default 4302).
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './serve.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const PORT = Number(process.env.CHECK_PORT || 4302);
const BASE = `http://127.0.0.1:${PORT}`;
const content = JSON.parse(readFileSync(join(ROOT, 'content/site.json'), 'utf8'));
const film = JSON.parse(readFileSync(join(ROOT, 'src/film/scenes.json'), 'utf8'));

// The four pictures every sent company email loads. Their bytes must never change.
const EMAIL_PICTURES = {
  'proxyz-lockup-e-horizontal-light-tight.png': '4f6e5ef699325dcf60a9f669637dc148c35bededa7057c3da86f41d7233f4f9b',
  'icon-whatsapp-dark.png': '571706dff1acdef649f9e0fa1b56ec5b0b35cd2d32c4cf8d9cd953fb83edbeaf',
  'icon-line-dark.png': '409f50b5d656b01873287c4d65cc72a72c758acf59c978482e29e5835c7eab05',
  'proxyz-lockup-e-horizontal-light.png': 'dcfaf306a333eb562c856b5b4815335172a42ec0c8ba607f1e1df37af1982da2',
};
const VIEWPORTS = [[393, 852], [430, 739], [320, 568], [852, 393], [932, 430], [1440, 900], [1512, 860], [2428, 1300]];
const BUDGET = { firstLoad: 250 * 1024, firstPicture: 80 * 1024, script: 20 * 1024, style: 10 * 1024 };

/* ---------- reporting ---------- */
const results = [];
const line = (status, n, name, detail = '') => {
  results.push(status);
  console.log(`${status.padEnd(4)}  ${String(n).padStart(2)}. ${name}${detail ? ': ' + detail : ''}`);
};
const pass = (n, name, d) => line('PASS', n, name, d);
const fail = (n, name, d) => line('FAIL', n, name, d);
const warn = (n, name, d) => line('WARN', n, name, d);
const ok = (cond, n, name, good, bad) => (cond ? pass(n, name, good) : fail(n, name, bad));

/* ---------- what the content file says each page must show ---------- */
const B = content.border;
const ventureLine = (v, i) => `${String(i + 1).padStart(2, '0')}  ${v.name ? v.name + '. ' : ''}${v.line}${v.name && v.url ? ' ' + v.url : ''}`;
const tool = content.scenes.find((s) => s.toolLine).toolLine;
const machineLines = [content.machines.summary, content.machines.intro, ...content.ventures.map(ventureLine),
  content.machines.toolIntro, tool, content.machines.pictures, content.machines.company];
const named = content.ventures.filter((v) => v.name).map((v) => v.name);
const SWITCHES = [B.people, B.machines, B.people, B.machines];   // the top and the bottom copy
// every word each page must show, in the order a reader meets it (the border first, then the page)
const EXPECT = {
  '/': [B.place, ...named, ...SWITCHES,
    ...content.scenes.flatMap((s) => [...(s.letterhead ? [s.letterhead] : []), ...(s.toolLine ? [s.toolLine] : []), s.lines.join(' ')]),
    B.legal, B.people, B.machines],
  '/machines/': [B.place, ...SWITCHES, content.machines.title, ...machineLines, B.legal],
  '/legal/': [B.place, ...SWITCHES, content.legal.title, content.legal.revised,
    ...content.legal.sections.flatMap((s) => [s.heading, ...s.lead, ...s.parts.flatMap((p) => [p.heading, ...p.text, ...(p.list ?? []), ...(p.after ?? [])])])],
  '/nope-nope/': [B.place, content.pages.notFound.line],
};
/** The film data of scene n as the build chose it (scene 7 may use the twin of scene 6). */
const viewOf = (n, form) => film.scenes[content.scenes[n - 1]?.picture === 'twin' ? `${n}twin` : String(n)][form];
const META = {
  '/': content.pages.home, '/machines/': content.pages.machines, '/legal/': content.pages.legal,
};
/** Same words in the same order; on a difference, says where it starts. */
const sameSeq = (got, want) => {
  const n = Math.max(got.length, want.length);
  for (let i = 0; i < n; i++) if (got[i] !== want[i]) return { equal: false, at: `item ${i + 1}: got "${got[i] ?? '(nothing)'}", want "${want[i] ?? '(nothing)'}"` };
  return { equal: true };
};

/* ---------- browsers ---------- */
function findPlaywright() {
  const home = homedir(), cache = join(home, 'Library/Caches/ms-playwright');
  const cands = process.env.PLAYWRIGHT_CORE ? [process.env.PLAYWRIGHT_CORE] : [];
  for (const dir of [join(home, '.npm/_npx'), join(home, 'Code')]) {
    if (existsSync(dir)) for (const d of readdirSync(dir)) cands.push(join(dir, d, 'node_modules/playwright-core'));
  }
  for (const c of cands) {
    try {
      const bs = JSON.parse(readFileSync(join(c, 'browsers.json'), 'utf8')).browsers;
      const rev = (n) => bs.find((b) => b.name === n)?.revision;
      const has = (n) => existsSync(join(cache, `${n}-${rev(n)}`)) || (n === 'chromium' && existsSync(join(cache, `chromium_headless_shell-${rev(n)}`)));
      if (has('chromium') && has('webkit') && has('firefox')) return c;
    } catch { /* next */ }
  }
  return null;
}

/** Visible words of a page in page order: every text node in the body, trimmed (scripts, styles and the ticking time
 *  left out). A line in capitals and the letterhead count as one text each; a no-break space counts as a space. */
const TEXT_NODES = () => {
  const out = [], seen = new Set(), w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const norm = (t) => t.replace(/\u00a0/g, ' ').trim();
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const p = n.parentElement;
    if (!p || p.closest('script,style,noscript') || p.classList.contains('time')) continue;
    const whole = p.closest('.cap,.addr');
    if (whole) { if (!seen.has(whole)) { seen.add(whole); out.push(norm(whole.textContent)); } continue; }
    const t = norm(n.nodeValue);
    if (t) out.push(t);
  }
  return out;
};

/** Layout faults on the current screen: sideways scroll, text under 12 px, touch areas under 44 px. */
const FAULTS = () => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const small = [], tiny = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('svg,script,style')) continue;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim());
    if (own && vis(el) && parseFloat(getComputedStyle(el).fontSize) < 12) small.push(el.tagName + ' ' + el.textContent.trim().slice(0, 30));
  }
  for (const el of document.querySelectorAll('a,button')) {
    if (!vis(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.height < 44 || r.width < 44) tiny.push(`${el.textContent.trim() || el.getAttribute('aria-label') || el.tagName} ${Math.round(r.width)}x${Math.round(r.height)}`);
  }
  const de = document.documentElement;
  // exactly one PEOPLE / MACHINES switch is shown at a time (the border keeps copies for each screen shape)
  const switches = [...document.querySelectorAll('nav.sw')].filter(vis).length;
  return { sideways: de.scrollWidth > de.clientWidth + 1 ? de.scrollWidth - de.clientWidth : 0, small, tiny, switches };
};

async function main() {
  if (!existsSync(join(DIST, 'index.html'))) { console.error('check: no dist/index.html, run npm run build first'); process.exit(2); }
  const pw = findPlaywright();
  if (!pw) { console.error('check: no playwright-core with Chromium, WebKit and Firefox found. Set PLAYWRIGHT_CORE. Nothing is downloaded.'); process.exit(2); }
  const lib = createRequire(import.meta.url)(pw);
  const server = await startServer({ dir: DIST, port: PORT });
  console.log(`check: serving dist/ at ${BASE}/ (rules from vercel.json), browsers from playwright-core ${JSON.parse(readFileSync(join(pw, 'package.json'), 'utf8')).version}\n`);

  const outside = [], errors = [], cookieJar = [];
  const browsers = {};
  for (const e of ['chromium', 'webkit', 'firefox']) browsers[e] = await lib[e].launch({ headless: true });
  const contexts = [];
  async function ctx(engine, opts = {}) {
    const phone = (opts.viewport?.width ?? 1440) < 600;
    const o = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, ...opts };
    if (phone && engine !== 'firefox') o.isMobile = o.isMobile ?? true;
    if (phone) o.hasTouch = true;
    const c = await browsers[engine].newContext(o);
    contexts.push(c);
    const close = c.close.bind(c);
    c.close = async () => { cookieJar.push(...(await c.cookies())); contexts.splice(contexts.indexOf(c), 1); return close(); };
    c.on('request', (r) => { const u = r.url(); if (!u.startsWith(BASE) && !/^(data|blob|about):/.test(u)) outside.push(`${engine} ${u}`); });
    return c;
  }
  async function open(c, path, label) {
    const p = await c.newPage();
    // the not found page itself answers 404 on purpose; a browser logs that as an error line, which is expected
    p.on('console', (m) => { if (m.type() === 'error' && !(path.startsWith('/nope') && m.location().url === BASE + path && /404/.test(m.text()))) errors.push(`${label}: ${m.text().slice(0, 200)}`); });
    p.on('pageerror', (e) => errors.push(`${label}: ${String(e).slice(0, 200)}`));
    await p.goto(BASE + path, { waitUntil: 'load' });
    return p;
  }
  const settle = (p, ms = 350) => p.waitForTimeout(ms);
  /** scroll to scene n at light progress at (0 to 1); returns once its pictures are decoded */
  async function toScene(p, n, at = 1) {
    await p.evaluate(([n, at, share]) => {
      const s = document.getElementById('s' + n);
      const vh = document.querySelector('.probe')?.offsetHeight || innerHeight;
      scrollTo(0, Math.round(s.offsetTop + at * share * Math.max(0, s.offsetHeight - vh)));
    }, [n, at, film.lightShare]);
    await p.waitForFunction((n) => [...document.querySelectorAll(`#s${n} .passes img`)].every((i) => i.complete && i.naturalWidth > 0), n, { timeout: 8000 }).catch(() => {});
    await settle(p);
  }

  /* 1. words */
  {
    const c = await ctx('chromium', { javaScriptEnabled: false });
    const bad = [];
    for (const [path, want] of Object.entries(EXPECT)) {
      const p = await open(c, path, 'words ' + path);
      const got = await p.evaluate(TEXT_NODES);
      const d = sameSeq(got, want);
      if (!d.equal) bad.push(`${path} ${d.at}`);
      const meta = META[path];
      if (meta) {
        const m = await p.evaluate(() => ({
          title: document.title,
          desc: document.querySelector('meta[name=description]')?.content,
          og: document.querySelector('meta[property="og:title"]')?.content,
          ogd: document.querySelector('meta[property="og:description"]')?.content,
          canon: document.querySelector('link[rel=canonical]')?.href,
        }));
        if (m.title !== meta.title || m.desc !== meta.description || m.og !== meta.title || m.ogd !== meta.description) bad.push(`${path} title or description differs from the content file`);
        if (m.canon !== content.site.url + meta.path) bad.push(`${path} canonical ${m.canon}`);
      } else {
        const t = await p.evaluate(() => [document.title, document.querySelector('meta[name=robots]')?.content]);
        if (t[0] !== content.pages.notFound.title || t[1] !== 'noindex') bad.push('not found page: title or noindex');
      }
      if (path === '/') {
        const h = await p.evaluate(() => [...document.querySelectorAll('h1')].map((e) => [...e.children].map((s) => s.textContent.replace(/\u00a0/g, ' ')).join('|')));
        if (h.length !== 1 || h[0] !== content.scenes[0].lines.join('|')) bad.push(`film page h1: ${JSON.stringify(h)}`);
        const alts = await p.evaluate(() => [...document.querySelectorAll('#film img')].map((i) => i.alt));
        const dA = sameSeq(alts, content.scenes.map((s) => s.alt));
        if (!dA.equal) bad.push(`picture descriptions: ${dA.at}`);
        const ld = await p.evaluate(() => JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent));
        if (ld.name !== content.site.name || ld.legalName !== content.site.legalName || ld.address?.addressLocality !== content.site.locality) bad.push('structured data differs from the content file');
      }
      await p.close();
    }
    const llms = readFileSync(join(DIST, 'llms.txt'), 'utf8').split('\n').map((l) => l.replace(/^# |^> /, '')).filter(Boolean);
    const wantLlms = [content.machines.title, ...machineLines];
    if (JSON.stringify(llms) !== JSON.stringify(wantLlms)) bad.push('llms.txt differs from the machine face');
    ok(!bad.length, 1, 'Words on /, /machines/, /llms.txt, /legal/ and the not found page equal content/site.json, in order; one h1 on the film', 'all equal', bad.join('; '));
  }

  /* 1. with the film running: each scene's description is on its stage from the start */
  {
    const c = await ctx('chromium', { viewport: { width: 1440, height: 900 } });
    const p = await open(c, '/', 'descriptions');
    const got = await p.evaluate(() => [...document.querySelectorAll('#film .passes')].map((b) => (b.getAttribute('role') === 'img' ? b.getAttribute('aria-label') : '')));
    const d = sameSeq(got, content.scenes.map((s) => s.alt));
    ok(d.equal, 1, 'Film running: all seven picture descriptions are there before any scroll', 'all seven', d.at);
    await c.close();
  }

  /* 2. hidden names (and no local paths, no other email addresses) */
  {
    const tracked = execFileSync('git', ['ls-files', '-co', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean).map((f) => join(ROOT, f));
    const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
    const files = [...new Set([...tracked.filter((f) => existsSync(f)), ...walk(DIST)])];
    const BINARY = new Set(['.png', '.avif', '.webp', '.woff2', '.jpg', '.jpeg', '.ico', '.gif']);
    const texts = [];
    for (const f of files) {
      if (BINARY.has(extname(f).toLowerCase())) continue;
      const buf = readFileSync(f);
      if (buf.subarray(0, 8000).includes(0)) continue;
      // long random strings (lock file checksums, hashed names) are not words; leave them out
      texts.push([relative(ROOT, f), buf.toString('utf8').replace(/[A-Za-z0-9+/=_-]{40,}/g, ' ')]);
    }
    const file = process.env.HIDDEN_NAMES_FILE;
    if (!file) warn(2, 'HIDDEN NAMES NOT CHECKED', 'set HIDDEN_NAMES_FILE to the file with one name per line');
    else {
      const names = readFileSync(file, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
      const hits = [];
      names.forEach((name, i) => {
        const re = new RegExp(`(?<![A-Za-z0-9])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z0-9])`, 'i');
        for (const [f, t] of texts) if (re.test(t)) hits.push(`name ${i + 1} in ${f}`);
        for (const f of files) if (re.test(relative(ROOT, f))) hits.push(`name ${i + 1} in the file name ${relative(ROOT, f)}`);
      });
      ok(!hits.length && names.length > 0, 2, `None of the ${names.length} hidden names in ${texts.length} tracked and built text files or any file name`, 'none found', hits.join('; ') || 'the names file is empty');
    }
    const home = '/' + 'Users' + '/';
    const leaks = [];
    for (const [f, t] of texts) {
      if (t.includes(home)) leaks.push(`local path in ${f}`);
      for (const m of t.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) if (m[0] !== 'hello@proxyz.studio' && !/^[\w.-]+@\d/.test(m[0])) leaks.push(`address ${m[0]} in ${f}`);
    }
    ok(!leaks.length, 2, 'No local path and no email address but hello@proxyz.studio in any tracked or built file', 'none found', [...new Set(leaks)].join('; '));
  }

  /* 3. dashes and the system's name */
  {
    const c = await ctx('chromium');
    const bad = [];
    for (const path of ['/', '/machines/', '/legal/', '/nope-nope/']) {
      const p = await open(c, path, 'dashes ' + path);
      const t = (await p.evaluate(TEXT_NODES)).join('\n') + (await p.evaluate(() => [...document.querySelectorAll('[alt],[aria-label],title')].map((e) => e.getAttribute('alt') || e.getAttribute('aria-label') || e.textContent).join('\n')));
      if (/[–—]/.test(t)) bad.push(`dash on ${path}`);
      if (/Studio OS/i.test(t) || t.includes('STUDIOOS')) bad.push(`wrong system name on ${path}`);
      await p.close();
    }
    const llms = readFileSync(join(DIST, 'llms.txt'), 'utf8');
    if (/[–—]/.test(llms) || /Studio OS/i.test(llms) || llms.includes('STUDIOOS')) bad.push('llms.txt');
    ok(!bad.length, 3, 'No em dash or en dash in visible words; no "Studio OS", no "STUDIOOS"', 'clean', bad.join('; '));
  }

  /* 6. faults at every screen size (and console errors, collected throughout) */
  {
    const bad = [];
    for (const [w, h] of VIEWPORTS) {
      const c = await ctx('chromium', { viewport: { width: w, height: h } });
      const p = await open(c, '/', `film ${w}x${h}`);
      // each scene is as tall as the film data says (2.4 screens, scene 6 3.6)
      const tall = await p.evaluate(() => { const vh = document.querySelector('.probe').offsetHeight; return [...document.querySelectorAll('#film .scene')].map((s) => s.offsetHeight / vh); });
      tall.forEach((k, i) => { const want = film.tall[String(i + 1)] ?? 2.4; if (Math.abs(k - want) > 0.01) bad.push(`${w}x${h} scene ${i + 1}: ${k.toFixed(2)} screens tall, want ${want}`); });
      // the first Tab stop is the wordmark, and the page does not move
      await p.keyboard.press('Tab');
      const tab = await p.evaluate(() => [document.activeElement?.className, scrollY]);
      if (tab[0] !== 'homelink' || tab[1] !== 0) bad.push(`${w}x${h}: first Tab goes to "${tab[0]}" at scroll ${tab[1]}`);
      for (let n = 1; n <= content.scenes.length; n++) {
        for (const at of [0.5, 1]) {
          await toScene(p, n, at);
          const f = await p.evaluate(FAULTS);
          if (f.sideways) bad.push(`${w}x${h} scene ${n}: sideways ${f.sideways}px`);
          for (const s of f.small) bad.push(`${w}x${h} scene ${n}: small text ${s}`);
          for (const s of f.tiny) bad.push(`${w}x${h} scene ${n}: touch area ${s}`);
          if (f.switches !== 1) bad.push(`${w}x${h} scene ${n}: ${f.switches} switches shown`);
        }
      }
      await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      await settle(p);
      const f = await p.evaluate(FAULTS);
      for (const s of [...f.small, ...f.tiny]) bad.push(`${w}x${h} foot: ${s}`);
      for (const path of ['/machines/', '/legal/', '/nope-nope/']) {
        const q = await open(c, path, `${path} ${w}x${h}`);
        const g = await q.evaluate(FAULTS);
        if (g.sideways) bad.push(`${w}x${h} ${path}: sideways ${g.sideways}px`);
        if (g.switches !== (path === '/nope-nope/' ? 0 : 1)) bad.push(`${w}x${h} ${path}: ${g.switches} switches shown`);
        for (const s of [...g.small, ...g.tiny]) bad.push(`${w}x${h} ${path}: ${s}`);
        await q.close();
      }
      await c.close();
    }
    // the Safari engine and Firefox, at a large phone and a laptop
    for (const engine of ['webkit', 'firefox']) {
      for (const [w, h] of [[430, 739], [1512, 860]]) {
        const c = await ctx(engine, { viewport: { width: w, height: h } });
        const p = await open(c, '/', `${engine} film ${w}x${h}`);
        for (let n = 1; n <= content.scenes.length; n++) {
          await toScene(p, n, 1);
          const f = await p.evaluate(FAULTS);
          if (f.sideways) bad.push(`${engine} ${w}x${h} scene ${n}: sideways`);
          for (const s of [...f.small, ...f.tiny]) bad.push(`${engine} ${w}x${h} scene ${n}: ${s}`);
        }
        for (const path of ['/machines/', '/legal/', '/nope-nope/']) await (await open(c, path, `${engine} ${path}`)).close();
        await c.close();
      }
    }
    ok(!bad.length, 6, `No sideways scroll, no text under 12 px, no touch area under 44 px, one switch shown, scenes as tall as the film data, first Tab on the wordmark, at ${VIEWPORTS.map((v) => v.join('x')).join(', ')} (Chromium) and 430x739, 1512x860 (WebKit, Firefox)`, 'none', [...new Set(bad)].slice(0, 20).join('; '));
  }

  /* 6. old privacy and terms links land with their heading in view, below the border */
  {
    const bad = [];
    for (const [engine, w, h] of [['chromium', 393, 852], ['chromium', 1512, 860], ['webkit', 430, 739], ['firefox', 2428, 1300]]) {
      const c = await ctx(engine, { viewport: { width: w, height: h } });
      for (const part of ['privacy', 'terms']) {
        const p = await open(c, '/' + part, `landing ${engine} ${part}`);
        await settle(p, 500);
        const r = await p.evaluate((part) => ({ head: document.querySelector(`#${part} h2`).getBoundingClientRect().top, band: document.querySelector('#top').getBoundingClientRect().bottom, url: location.pathname + location.hash }), part);
        if (r.url !== `/legal/#${part}` || r.head < r.band || r.head > h / 2) bad.push(`${engine} ${w}x${h} /${part}: at ${r.url}, heading at ${Math.round(r.head)}, border ends at ${Math.round(r.band)}`);
        await p.close();
      }
      await c.close();
    }
    ok(!bad.length, 6, 'Old /privacy and /terms links land on LEGAL with the heading in view, below the border (Chromium, WebKit, Firefox)', 'heading in view', bad.join('; '));
  }

  /* 7. scripts off */
  {
    const c = await ctx('chromium', { javaScriptEnabled: false, viewport: { width: 393, height: 852 }, isMobile: true });
    const p = await open(c, '/', 'scripts off');
    await p.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 15000 }).catch(() => {});
    const r = await p.evaluate(() => ({
      sections: document.querySelectorAll('#film section').length,
      pics: [...document.querySelectorAll('#film section img')].filter((i) => i.complete && i.naturalWidth > 0).length,
      heights: [...document.querySelectorAll('#film section')].map((s) => s.offsetHeight),
      links: [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')))],
    }));
    const dead = [];
    for (const href of r.links) {
      const res = await c.request.get(BASE + href, { maxRedirects: 5 });
      if (res.status() !== 200) dead.push(`${href} ${res.status()}`);
    }
    const n = content.scenes.length;
    ok(r.sections === n && r.pics === n && !dead.length && r.heights.every((h) => h >= 500), 7,
      'Scripts off: seven sections, seven pictures, all words (test 1 ran with scripts off), working links',
      `${r.sections} sections, ${r.pics} pictures, ${r.links.length} links all answer 200`,
      `${r.sections} sections, ${r.pics} pictures, dead links [${dead.join(', ')}]`);
    await c.close();
  }

  /* 8. less motion */
  {
    const bad = [];
    for (const [engine, w, h] of [['chromium', 393, 852], ['chromium', 1440, 900], ['webkit', 430, 739], ['firefox', 1512, 860]]) {
      const c = await ctx(engine, { viewport: { width: w, height: h }, reducedMotion: 'reduce' });
      const p = await open(c, '/', `less motion ${engine} ${w}x${h}`);
      const form = w / h <= 1 ? 'phone' : 'desktop';
      for (let n = 1; n <= content.scenes.length; n++) {
        const view = viewOf(n, form);
        const q = view.still ?? view.rest ?? 1;
        const x = q * Math.max(0, view.passes.length - 1), hold = view.hold || 0;
        const want = view.passes.map((_, k) => (k === 0 ? 1 : Math.min(1, Math.max(0, (x - (k - 1) - hold / 2) / (1 - hold)))));
        for (const at of [0, 0.6]) {
          await toScene(p, n, at);
          const got = await p.evaluate((n) => ({
            op: [...document.querySelectorAll(`#s${n} .passes img`)].map((i) => parseFloat(getComputedStyle(i).opacity)),
            dim: parseFloat(getComputedStyle(document.querySelector(`#s${n} .dim`)).opacity),
            fade: getComputedStyle(document.querySelector(`#s${n} .layer`)).transitionDuration,
          }), n);
          const wantOp = view.opens ? want.map((v) => (v > 0 ? 1 : 0)) : want;
          if (got.op.length !== want.length || got.op.some((v, k) => Math.abs(v - wantOp[k]) > 0.02)) bad.push(`${engine} ${w}x${h} scene ${n} at ${at}: ${got.op.map((v) => v.toFixed(2))} want ${wantOp.map((v) => v.toFixed(2))}`);
          const wantDim = view.end === 'dark' ? q * 0.75 : 0;
          if (Math.abs(got.dim - wantDim) > 0.02) bad.push(`${engine} scene ${n}: dim ${got.dim}`);
          if (got.fade !== '0s') bad.push(`${engine} scene ${n}: fade ${got.fade}`);
        }
      }
      await c.close();
    }
    ok(!bad.length, 8, 'Less motion: every scene in its resting light, at any scroll point, with no fades (Chromium, WebKit, Firefox)', 'all scenes', bad.slice(0, 8).join('; '));
  }

  /* 9. turning the screen: every picture sits where a fresh load at that size puts it */
  {
    const bad = [];
    const SHAPES = [[393, 852], [852, 393], [393, 852], [1440, 900], [801, 800], [799, 800], [801, 800], [393, 852], [1512, 860]];
    const rects = async (p) => {
      const out = {};
      for (let n = 1; n <= content.scenes.length; n++) {
        await toScene(p, n, 0.7);
        out[n] = await p.evaluate((n) => [...document.querySelectorAll(`#s${n} .passes img`)].map((i) => {
          const r = i.getBoundingClientRect();
          return { src: (i.currentSrc || i.src).split('/').pop().split('.')[0], box: [r.left, r.top, r.width, r.height].map(Math.round) };
        }), n);
      }
      return out;
    };
    for (const engine of ['chromium', 'webkit', 'firefox']) {
      const c = await ctx(engine, { viewport: { width: 393, height: 852 } });
      const p = await open(c, '/', `turning ${engine}`);
      const fresh = {};
      for (const [w, h] of SHAPES) {
        await p.setViewportSize({ width: w, height: h });
        await settle(p, 400);
        const got = await rects(p);
        const key = `${w}x${h}`;
        if (!fresh[key]) {
          const c2 = await ctx(engine, { viewport: { width: w, height: h } });
          fresh[key] = await rects(await open(c2, '/', `fresh ${engine} ${key}`));
          await c2.close();
        }
        for (let n = 1; n <= content.scenes.length; n++) {
          const a = got[n], b = fresh[key][n];
          const form = w / h <= 1 ? '-phone-' : '-desk-';
          if (a.some((x) => !x.src.includes(form))) bad.push(`${engine} ${key} scene ${n}: ${a.map((x) => x.src).join(', ')}`);
          else if (a.length !== b.length || a.some((x, i) => x.box.some((v, j) => Math.abs(v - b[i].box[j]) > 2))) bad.push(`${engine} ${key} scene ${n}: placed ${JSON.stringify(a.map((x) => x.box))}, fresh load ${JSON.stringify(b.map((x) => x.box))}`);
        }
      }
      await c.close();
    }
    ok(!bad.length, 9, 'Turning the screen back and forth and resizing a window (near square too): every picture is the right one and sits where a fresh load puts it, within 2 px (Chromium, WebKit, Firefox)', 'same as a fresh load every time', bad.slice(0, 6).join('; '));
  }

  /* 9. a reload in the middle of the film comes back to the same scene */
  {
    // Firefox under this test tool starts a reload with an empty history entry (history.state is null afterwards),
    // so the film cannot know where the visitor was; reported, not failed
    const bad = [], soft = [];
    for (const engine of ['chromium', 'webkit', 'firefox']) {
      const c = await ctx(engine, { viewport: { width: 393, height: 852 } });
      const p = await open(c, '/', `reload ${engine}`);
      for (const n of [3, 6, 7]) {
        await toScene(p, n, 0.5);
        const before = await p.evaluate(() => [document.querySelector('#film .scene.on')?.id, scrollY]);
        await p.reload({ waitUntil: 'load' });
        await settle(p, 600);
        const after = await p.evaluate(() => [document.querySelector('#film .scene.on')?.id, scrollY]);
        if (after[0] !== before[0] || Math.abs(after[1] - before[1]) > 4) (engine === 'firefox' ? soft : bad).push(`${engine} ${before[0]} at ${before[1]}: back at ${after[0]} ${after[1]}`);
      }
      await c.close();
    }
    ok(!bad.length, 9, 'Reload in the middle of the film: back in the same scene at the same light (Chromium, WebKit)', 'same place every time', bad.join('; '));
    if (soft.length) warn(9, 'Reload in Firefox (this test tool keeps no history entry over a reload)', soft.join('; '));
  }

  /* 7. the film script blocked, late or failed: the later pictures wait for it, and without it they all show */
  {
    const bad = [];
    const sceneOf = (u) => (/\/pictures\/s(\d)/.exec(u) || [])[1];
    for (const engine of ['chromium', 'webkit', 'firefox']) {
      // late by 3 s: nothing of scenes 2 to 7 is asked for before the film runs (the styles hold them back)
      {
        const c = await ctx(engine, { viewport: { width: 393, height: 852 } });
        await c.route(/\/assets\/main-[^/]*\.js$/, async (r) => { await new Promise((s) => setTimeout(s, 3000)); r.continue(); });
        const asked = new Set();
        c.on('request', (r) => { const n = sceneOf(r.url()); if (n) asked.add(n); });
        const p = await open(c, '/', `script late ${engine}`);
        await p.waitForTimeout(3500);
        const early = [...asked].filter((n) => n !== '1');
        if (early.length) bad.push(`${engine}: with the script late, pictures of scenes ${early.sort().join(', ')} loaded before the film ran`);
        await c.close();
      }
      // blocked: after about 4 s the plain page, and every picture loads as the visitor scrolls
      {
        const c = await ctx(engine, { viewport: { width: 393, height: 852 } });
        await c.route(/\/assets\/main-[^/]*\.js$/, (r) => r.abort());
        const p = await c.newPage();   // no error listener: the blocked script is the point of this test
        await p.goto(BASE + '/', { waitUntil: 'load' });
        await p.waitForTimeout(4500);
        const total = await p.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < total; y += 400) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(60); }
        await p.waitForFunction(() => [...document.querySelectorAll('#film img')].every((i) => i.complete), null, { timeout: 15000 }).catch(() => {});
        const r = await p.evaluate(() => ({ film: document.documentElement.classList.contains('film'), pics: [...document.querySelectorAll('#film section img')].filter((i) => i.complete && i.naturalWidth > 0 && i.getBoundingClientRect().height > 0 && getComputedStyle(i).display !== 'none').length }));
        if (r.film || r.pics !== content.scenes.length) bad.push(`${engine} blocked: film ${r.film}, ${r.pics} pictures shown`);
        await c.close();
      }
    }
    ok(!bad.length, 7, 'Film script late: no picture of scenes 2 to 7 loads before the film runs; film script blocked: after about 4 s the plain page shows all seven pictures (Chromium, WebKit, Firefox)', 'held back, then seven pictures', bad.join('; '));
  }

  /* 10. old addresses and unknown addresses (as far as a local server can tell) */
  {
    const bad = [];
    const hop = async (path) => {
      const chain = [];
      let url = BASE + path;
      for (let i = 0; i < 5; i++) {
        const r = await fetch(url, { redirect: 'manual' });
        chain.push(`${r.status}${r.headers.get('location') ? ' ' + r.headers.get('location') : ''}`);
        if (r.status >= 300 && r.status < 400) { url = new URL(r.headers.get('location'), url).href; continue; }
        return { status: r.status, url, chain, body: await r.text(), headers: r.headers };
      }
      return { status: 0, chain };
    };
    for (const [old, part] of [['/privacy', 'privacy'], ['/privacy/', 'privacy'], ['/terms', 'terms'], ['/terms/', 'terms']]) {
      const r = await hop(old);
      if (r.status !== 200 || !r.chain.some((c) => c.includes(`/legal/#${part}`)) || !r.body.includes(`id="${part}"`)) bad.push(`${old}: ${r.chain.join(' > ')}`);
    }
    for (const nope of ['/nope-nope', '/old/page/', '/pipeline/x', '/x.html']) {
      const r = await hop(nope);
      if (r.status !== 404 || !r.body.includes(content.pages.notFound.line)) bad.push(`${nope}: ${r.chain.join(' > ')}`);
    }
    for (const name of Object.keys(EMAIL_PICTURES)) {
      const r = await fetch(`${BASE}/${name}`, { redirect: 'manual' });
      const touched = ['content-security-policy', 'x-content-type-options', 'cross-origin-opener-policy', 'permissions-policy', 'referrer-policy'].filter((k) => r.headers.has(k));
      if (r.status !== 200 || r.headers.get('content-type') !== 'image/png' || touched.length) bad.push(`${name}: ${r.status} ${r.headers.get('content-type')} ${touched.join(',')}`);
    }
    const cfg = readFileSync(join(ROOT, 'vercel.json'), 'utf8');
    if (/"rewrites"|"routes"/.test(cfg)) bad.push('vercel.json has a rewrite or route');
    for (const old of ['privacy.html', 'terms.html', 'privacy/index.html', 'terms/index.html']) if (existsSync(join(DIST, old))) bad.push(`dist/${old} exists: a second, older page`);
    for (const path of ['/Privacy', '/legal/privacy']) { const r = await hop(path); if (r.status !== 404) bad.push(`${path}: ${r.chain.join(' > ')}`); }
    ok(!bad.length, 10, '/privacy and /terms (with and without the slash) reach LEGAL, matched as strictly as the host does; unknown addresses give 404 with the not found page; no rule touches the email pictures', 'as vercel.json says', bad.join('; '));
    warn(10, 'Not testable here', 'the host\'s own 404 status, the # in its redirect and its real headers need one curl on the first test address');
  }

  /* 11. weights */
  {
    const c = await ctx('chromium', { viewport: { width: 393, height: 852 }, deviceScaleFactor: 3, isMobile: true });
    const p = await c.newPage();
    p.on('pageerror', (e) => errors.push('weights: ' + e));
    const got = [];
    p.on('requestfinished', async (r) => { try { const s = await r.sizes(); got.push({ url: r.url(), bytes: s.responseBodySize + s.responseHeadersSize, type: r.resourceType() }); } catch { /* gone */ } });
    await p.goto(BASE + '/', { waitUntil: 'load' });
    await p.waitForTimeout(2500);
    const cls = await p.evaluate(() => new Promise((res) => {
      let v = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) v += e.value; }).observe({ type: 'layout-shift', buffered: true });
      setTimeout(() => res(v), 300);
    }));
    const total = got.reduce((a, r) => a + r.bytes, 0);
    const firstPic = got.filter((r) => /s1-phone-p1/.test(r.url)).reduce((a, r) => a + r.bytes, 0);
    const js = got.filter((r) => r.url.endsWith('.js')).reduce((a, r) => a + r.bytes, 0);
    const css = got.filter((r) => r.url.endsWith('.css')).reduce((a, r) => a + r.bytes, 0);
    const kb = (b) => (b / 1024).toFixed(1) + ' KB';
    ok(total < BUDGET.firstLoad, 11, 'Phone first load, before any scroll, under 250 KB', `${kb(total)} in ${got.length} requests`, `${kb(total)}: ${got.map((r) => r.url.split('/').pop() + ' ' + kb(r.bytes)).join(', ')}`);
    ok(firstPic > 0 && firstPic < BUDGET.firstPicture, 11, 'First picture under 80 KB', kb(firstPic), kb(firstPic));
    ok(js < BUDGET.script, 11, 'Script under 20 KB compressed', kb(js), kb(js));
    ok(css < BUDGET.style, 11, 'Styles under 10 KB compressed', kb(css), kb(css));
    ok(cls < 0.001, 11, 'No layout shift on first load', `shift ${cls.toFixed(4)}`, `shift ${cls.toFixed(4)}`);
    await c.close();
  }

  /* 5. the email pictures */
  {
    const bad = [];
    for (const [name, sum] of Object.entries(EMAIL_PICTURES)) {
      for (const dir of ['public', 'dist']) {
        const f = join(ROOT, dir, name);
        const got = existsSync(f) ? createHash('sha256').update(readFileSync(f)).digest('hex') : 'missing';
        if (got !== sum) bad.push(`${dir}/${name} ${got.slice(0, 12)}`);
      }
    }
    ok(!bad.length, 5, 'The four email pictures: same sha256 as recorded, in public/ and in dist/', 'all eight equal', bad.join('; '));
  }

  /* 4. requests to other hosts, cookies (collected across every page opened above) */
  {
    const cookies = [...cookieJar];
    for (const c of contexts) cookies.push(...(await c.cookies()));
    ok(!outside.length, 4, 'Zero requests to any other host (all pages, all three engines)', 'none', [...new Set(outside)].slice(0, 6).join('; '));
    ok(!cookies.length, 4, 'Zero cookies', 'none', cookies.map((k) => k.name).join(', '));
    ok(!errors.length, 6, 'Zero console errors and page errors (including content security policy reports) in every run above', 'none', [...new Set(errors)].slice(0, 8).join('; '));
  }

  for (const b of Object.values(browsers)) await b.close();
  server.close();
  const failed = results.filter((r) => r === 'FAIL').length;
  console.log(`\ncheck: ${results.filter((r) => r === 'PASS').length} passed, ${failed} failed, ${results.filter((r) => r === 'WARN').length} warnings`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
