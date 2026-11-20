#!/usr/bin/env node
// npm run check: builds the site (see package.json), serves dist/ on this machine and proves, line by line,
// that the built site keeps the rules. Every line says PASS, FAIL or WARN. Exit code 1 when any line fails.
//
// Needs hidden (headless) browsers: playwright-core with Chromium, WebKit and Firefox already on this machine.
// It is not a dependency of the site. Set PLAYWRIGHT_CORE to its folder, or the check looks in the usual places
// under your home folder. It never downloads anything.
// BLOCKED_WORDS_FILE: an optional local file, one word or phrase per line, that must never ship (test 2 is skipped
// without it).
// CHECK_PORT: the local port (default 4302).
// CHECK_TESTS: an optional list of test numbers (for example 14,17) to run only those while working on them; the
// proof is the full run without it.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { standinsFromEnv, startServer } from './serve.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const PORT = Number(process.env.CHECK_PORT || 4302);
const BASE = `http://127.0.0.1:${PORT}`;
const content = JSON.parse(readFileSync(join(ROOT, 'content/site.json'), 'utf8'));
const film = JSON.parse(readFileSync(join(ROOT, 'src/film/scenes.json'), 'utf8'));
// scene 6's board as built: which venture each name tag stands for (src/generated/board.json, from src/film/board.json);
// the words themselves come from the ventures
const boardBuilt = JSON.parse(readFileSync(join(ROOT, 'src/generated/board.json'), 'utf8'));
const BOARD_NAMES = ['stand', 'coin', 'phone'].map((t) => [t, content.ventures.find((v) => v.id === boardBuilt.desktop.labels.names[t].venture)?.name]).filter((x) => x[1]);

// The four pictures every sent company email loads. Their bytes must never change.
const EMAIL_PICTURES = {
  'proxyz-lockup-e-horizontal-light-tight.png': '4f6e5ef699325dcf60a9f669637dc148c35bededa7057c3da86f41d7233f4f9b',
  'icon-whatsapp-dark.png': '571706dff1acdef649f9e0fa1b56ec5b0b35cd2d32c4cf8d9cd953fb83edbeaf',
  'icon-line-dark.png': '409f50b5d656b01873287c4d65cc72a72c758acf59c978482e29e5835c7eab05',
  'proxyz-lockup-e-horizontal-light.png': 'dcfaf306a333eb562c856b5b4815335172a42ec0c8ba607f1e1df37af1982da2',
};
const VIEWPORTS = [[393, 852], [430, 739], [320, 568], [852, 393], [932, 430], [1440, 900], [1512, 860], [2428, 1300], [430, 715], [430, 775], [430, 815], [393, 635],
  // short wide windows: the Claude app's side panel, a 4:3 tablet sideways, a small laptop
  [806, 516], [1024, 768], [1280, 720]];
// A phone browser's bar, copied with test styles (a hidden browser has none): [width, large viewport (bar away), small
// viewport (bar showing)]. 873/739 an older measure of the owner's phone; 815/715 and 815/775 Safari's classic bottom
// bar and its compact bar on that phone (measured in Safari); 735/635 the classic bar on a 393 wide phone (worked out).
const BARS = [[430, 873, 739], [430, 815, 715], [430, 815, 775], [393, 735, 635]];
/** The window and test styles of one bar state. Away: the window as tall as the large viewport, the small one held.
 *  Showing: the window as tall as the small viewport, the large one (and everything sized from it) held. */
const barState = ([w, L, Sm], state) => state === 'away'
  ? { w, h: L, css: `:root{--S:${Sm}px !important}.probe-s{height:${Sm}px !important}` }
  : { w, h: Sm, css: `:root{--H:${L}px !important}.probe{height:${L}px !important}.film #film .scene{height:${2.4 * L}px !important}${Object.entries(film.tall).map(([n, k]) => `.film #film #s${n}{height:${k * L}px !important}`).join('')}` };
const barLabel = ([w, L, Sm], state) => `${w}x${state === 'away' ? L : Sm} bar ${state} (${L}/${Sm})`;
/** Adds test styles to a page as soon as it has a head (passed to addInitScript). */
const INJECT = (css) => {
  const s = document.createElement('style'); s.textContent = css;
  const put = () => { const r = document.head || document.documentElement; if (r) r.appendChild(s); return !!r; };
  if (!put() || !document.head) new MutationObserver((_, o) => { if (document.head) { put(); o.disconnect(); } }).observe(document, { childList: true, subtree: true });
};
const BUDGET = { firstLoad: 250 * 1024, firstPicture: 80 * 1024, script: 20 * 1024, style: 10 * 1024 };
const ONLY = process.env.CHECK_TESTS ? new Set(process.env.CHECK_TESTS.split(',').map(Number)) : null;
const want = (n) => !ONLY || ONLY.has(n);

/* ---------- reporting ---------- */
const results = [];
// The watchdog: a browser that stops answering must fail the check with a clear line, never leave it waiting for ever.
// Every page opened, every scroll and every wait counts as progress; CHECK_STALL_S seconds without any fails the run.
const STALL = Number(process.env.CHECK_STALL_S || 180) * 1000;
let stepName = 'starting the browsers', stepAt = Date.now();
const step = (name) => { stepName = name; stepAt = Date.now(); };
setInterval(() => {
  if (Date.now() - stepAt < STALL) return;
  const was = stepName;
  step('recovering from a stall');
  if (onStall) { onStall(new Error(`no progress for ${STALL / 1000} s at: ${was}`)); return; }
  console.log(`FAIL   0. The check stalled: no progress for ${STALL / 1000} s, last step: ${was}`);
  console.log(`\ncheck: ${results.filter((r) => r === 'PASS').length} passed, ${results.filter((r) => r === 'FAIL').length + 1} failed, ${results.filter((r) => r === 'WARN').length} warnings`);
  process.exit(1);
}, 5000).unref();
/** set while a test runs: a stall ends that test, not the run */
let onStall = null;
const line = (status, n, name, detail = '') => {
  results.push(status);
  step(`after test ${n}`);
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
    ...content.scenes.flatMap((s) => [...(s.board ? [s.board.chip, ...BOARD_NAMES.map((x) => x[1]), s.board.next] : []), s.lines.join(' '), ...[s.toolLine, s.small, s.note, s.letterhead].filter(Boolean)]),
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
    // a heading in giant lines, a line in capitals, the letterhead and a LEGAL paragraph (it may hold a mail link)
    // count as one text each
    const whole = p.closest('.big,.cap,.addr,#legal p,#legal li');
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
  // the doors that are on are served from local copies of the products' sites, never the live ones
  const missing = (content.doors ?? []).filter((d) => d.on && d.target && !standinsFromEnv()[new URL(d.target).origin]);
  if (missing.length) { console.error(`check: no local stand-in for the door${missing.length > 1 ? 's' : ''} ${missing.map((d) => d.path).join(', ')}. Set ${missing.map((d) => `DOOR_STANDIN_${d.id.toUpperCase()}`).join(', ')} to a copy of the product's build (and _HEADERS to its vercel.json). Nothing is fetched from the live site.`); process.exit(2); }
  const server = await startServer({ dir: DIST, port: PORT });
  console.log(`check: serving dist/ at ${BASE}/ (rules from vercel.json), browsers from playwright-core ${JSON.parse(readFileSync(join(pw, 'package.json'), 'utf8')).version}\n`);

  const outside = [], errors = [], cookieJar = [];
  const browsers = {};
  for (const e of ['chromium', 'webkit', 'firefox']) browsers[e] = await lib[e].launch({ headless: true });
  // build 12: Chromium's own build with the graphics chip (still hidden), for the live film (tests 32 to 36)
  browsers.gpu = await lib.chromium.launch({ headless: true, channel: 'chromium' }).catch(() => null);
  if (!browsers.gpu) delete browsers.gpu;
  const contexts = [];
  // A hidden Firefox some minutes old stops answering: the page loads, the next evaluate never returns (seen 18 Nov 2026
  // on this site with and without the doors, in 7 of 8 runs at 5.5 minutes, none at 100 s; bringing the page to the
  // front, moving the mouse or switching off its spare processes does not help). So Firefox is started afresh before
  // use once it is 90 s old, and WebKit after a minute unused, whenever no context of theirs is open.
  const lastUse = {}, born = { firefox: Date.now() };
  async function useBrowser(engine) {
    if (engine === 'gpu') return browsers.gpu;
    const old = engine === 'firefox' ? Date.now() - born.firefox > 90000 : engine === 'webkit' && Date.now() - (lastUse.webkit ?? 0) > 60000;
    if (old && browsers[engine].contexts().length === 0) {
      step(`restarting ${engine}`);
      await browsers[engine].close().catch(() => {});
      browsers[engine] = await lib[engine].launch({ headless: true });
      if (engine === 'firefox') born.firefox = Date.now();
    }
    lastUse[engine] = Date.now();
    return browsers[engine];
  }
  async function ctx(engine, opts = {}) {
    step(`new ${engine} context ${opts.viewport?.width ?? ''}x${opts.viewport?.height ?? ''}`);
    const phone = (opts.viewport?.width ?? 1440) < 600;
    const o = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, ...opts };
    if (phone && engine !== 'firefox') o.isMobile = o.isMobile ?? true;
    if (phone) o.hasTouch = true;
    const c = await (await useBrowser(engine)).newContext(o);
    contexts.push(c);
    const close = c.close.bind(c);
    c.close = async () => { step(`closing a ${engine} context`); lastUse[engine] = Date.now(); cookieJar.push(...(await c.cookies())); contexts.splice(contexts.indexOf(c), 1); return close(); };
    c.on('request', (r) => { const u = r.url(); if (!u.startsWith(BASE) && !/^(data|blob|about):/.test(u)) outside.push(`${engine} ${u}`); });
    return c;
  }
  // a page a hidden browser does not finish loading in 30 s gets one more try; each is reported at the end of the run
  const retried = [];
  async function open(c, path, label) {
    step(`opening ${path} (${label})`);
    const attempt = async () => {
      const p = await c.newPage();
      // the not found page itself answers 404 on purpose; a browser logs that as an error line, which is expected
      p.on('console', (m) => { if (m.type() === 'error' && !(path.startsWith('/nope') && m.location().url === BASE + path && /404/.test(m.text()))) errors.push(`${label}: ${m.text().slice(0, 200)}`); });
      p.on('pageerror', (e) => errors.push(`${label}: ${String(e).slice(0, 200)}`));
      try { await p.goto(BASE + path, { waitUntil: 'load' }); return p; }
      catch (e) { await Promise.race([p.close().catch(() => {}), new Promise((r) => setTimeout(r, 5000))]); throw e; }
    };
    try { return await attempt(); }
    catch (e) {
      if (e.name !== 'TimeoutError') throw e;
      retried.push(`${c.browser()?.browserType().name()} ${path} (${label})`);
      step(`opening ${path} again (${label})`);
      return attempt();
    }
  }
  const settle = (p, ms = 350) => { step(`${stepName.split(' | ')[0]} | waiting ${ms} ms`); return p.waitForTimeout(ms); };
  /** scroll to scene n at light progress at (0 to 1); returns once its pictures are decoded */
  async function toScene(p, n, at = 1) {
    step(`${stepName.split(' | ')[0]} | scene ${n} at ${at}`);
    await p.evaluate(([n, at, share]) => {
      const s = document.getElementById('s' + n);
      const vh = document.querySelector('.probe')?.offsetHeight || innerHeight;
      scrollTo(0, Math.round(s.offsetTop + at * share * Math.max(0, s.offsetHeight - vh)));
    }, [n, at, film.lightShare]);
    await p.waitForFunction((n) => [...document.querySelectorAll(`#s${n} .passes img`)].every((i) => i.complete && i.naturalWidth > 0), n, { timeout: 8000 }).catch(() => {});
    await settle(p);
  }

  /** One test that cannot finish (a page a hidden browser will not load, a browser that stops answering) ends alone,
   *  with a line saying where; its contexts are closed, WebKit and Firefox start afresh and the run goes on. */
  const quick = (x) => Promise.race([Promise.resolve(x).catch(() => {}), new Promise((r) => setTimeout(r, 5000))]);
  async function guarded(n, fn, again = true) {
    const stalled = new Promise((_, no) => { onStall = no; });
    const run = fn();
    run.catch(() => {});
    try { await Promise.race([run, stalled]); }
    catch (e) {
      const at = stepName, why = `${String(e.message ?? e).split('\n')[0].slice(0, 170)}; last step: ${at}`;
      const firefox = /firefox/i.test(why);
      for (const c of [...contexts]) { contexts.splice(contexts.indexOf(c), 1); await quick(c.close()); }
      for (const e2 of ['webkit', 'firefox']) { await quick(browsers[e2].close()); browsers[e2] = await lib[e2].launch({ headless: true }); }
      born.firefox = Date.now();
      onStall = null;
      // the hidden Firefox stops answering now and then, on the site before the doors too (origin/main 9105ba8, 18 Nov
      // 2026): one more try with a fresh browser, then a warning, since it says nothing about the site
      if (firefox && again) return guarded(n, fn, false);
      if (firefox) warn(n, 'Not finished: the hidden Firefox stopped answering twice, as it also does on the site before the doors', why);
      else fail(n, 'This test could not finish', why);
    }
    onStall = null;
  }

  /* reading screenshots: a blank page in a hidden browser decodes them (it holds no site and no policy) */
  const labPage = await (await browsers.chromium.newContext()).newPage();
  const decode = `async (b64) => { const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode();
    const c = document.createElement('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight;
    const g = c.getContext('2d'); g.drawImage(i, 0, 0); return g.getImageData(0, 0, c.width, c.height); }`;
  /** For each box (css px; k = real pixels per css px of the screenshot): mean grey and the 95th percentile of
   *  luminance (the bright end of what lies behind text). */
  async function lab(png, boxes, k = 1) {
    return labPage.evaluate(async ([b64, boxes, decode, k]) => {
      const d = await (0, eval)(decode)(b64);
      const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      return boxes.map(([x, y, w, h]) => {
        const ys = [], x0 = Math.max(0, Math.round(x * k)), y0 = Math.max(0, Math.round(y * k));
        const x1 = Math.min(d.width, Math.round((x + w) * k)), y1 = Math.min(d.height, Math.round((y + h) * k));
        let sum = 0;
        for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) {
          const i = (yy * d.width + xx) * 4, r = d.data[i], g = d.data[i + 1], b = d.data[i + 2];
          ys.push(0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)); sum += 0.299 * r + 0.587 * g + 0.114 * b;
        }
        ys.sort((a, b) => a - b);
        return { mean: ys.length ? sum / ys.length : 0, p95: ys.length ? ys[Math.floor(ys.length * 0.95)] : 0 };
      });
    }, [png.toString('base64'), boxes, decode, k]);
  }
  /** The ink of each text: the pixels that change when the words are hidden (a letter hidden by the cut-out does not
   *  change, so it does not count), and the 95th percentile of the luminance behind them (from the shot without the
   *  words; a glow or backing behind the words stays in it). */
  async function labInk(shown, hidden, boxes) {
    return labPage.evaluate(async ([a64, b64, boxes, decode]) => {
      const dec = (0, eval)(decode);
      const [a, b] = await Promise.all([dec(a64), dec(b64)]);
      const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      return boxes.map(([x, y, w, h]) => {
        const ys = [];
        const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y)), x1 = Math.min(a.width, Math.round(x + w)), y1 = Math.min(a.height, Math.round(y + h));
        for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) {
          const i = (yy * a.width + xx) * 4;
          const d = Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2]));
          if (d >= 40) ys.push(0.2126 * lin(b.data[i]) + 0.7152 * lin(b.data[i + 1]) + 0.0722 * lin(b.data[i + 2]));
        }
        ys.sort((p, q) => p - q);
        return { ink: ys.length, p95: ys.length ? ys[Math.floor(ys.length * 0.95)] : 0 };
      });
    }, [shown.toString('base64'), hidden.toString('base64'), boxes, decode]);
  }
  // every kind of text on the film: its colour and opacity (the grey lines are see through), and the ratio it needs
  const TEXT_KINDS = [['.big', 'giant', [243, 238, 228, 1], 4.5], ['.small', 'small', [242, 215, 140, 1], 4.5], ['.note', 'note', [242, 242, 242, 0.52], 4.5],
    ['.tool', 'tool', [242, 242, 242, 0.52], 4.5], ['.hl', 'line', [242, 242, 242, 0.78], 3],
    ['.blab.chip', 'chip', [243, 238, 228, 1], 4.5], ['.blab.next', 'next', [243, 238, 228, 0.72], 4.5],
    // scene 6's three name tags, each in its trace's colour (build/board.ts BOARD_COLOURS)
    ['.blab.n-stand', 'n-stand', [242, 215, 140, 1], 4.5], ['.blab.n-coin', 'n-coin', [91, 201, 184, 1], 4.5], ['.blab.n-phone', 'n-phone', [255, 65, 147, 1], 4.5]];
  const INK_HIDE = '.big,.small,.note,.tool,.blab{color:transparent !important}.hl{visibility:hidden !important}';
  /** Contrast of a text kind against a background of luminance Y. */
  function contrastOf(Y, kind) {
    const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    let g = 0; while (g < 255 && lin(g) < Y) g++;
    const [r, gg, b, a] = TEXT_KINDS.find((t) => t[1] === kind)[2];
    const mix = (c) => lin(a * c + (1 - a) * g);
    return (0.2126 * mix(r) + 0.7152 * mix(gg) + 0.0722 * mix(b) + 0.05) / (Y + 0.05);
  }
  /** Each text of scene n on screen now, with its ink and its contrast (the page needs a context that lets the test
   *  add a style). */
  async function inkOf(p, n) {
    const items = await p.evaluate(([n, kinds]) => {
      const s = document.getElementById('s' + n);
      return kinds.flatMap(([sel, kind]) => [...s.querySelectorAll(sel)].map((e) => { const r = e.getBoundingClientRect(); return { kind, box: [r.left - 4, r.top - 4, r.width + 8, r.height + 8] }; }));
    }, [n, TEXT_KINDS.map((t) => t.slice(0, 2))]);
    const shown = await p.screenshot();
    await p.evaluate((css) => { const s = document.createElement('style'); s.id = 'ink-hide'; s.textContent = css; document.head.append(s); }, INK_HIDE);
    await settle(p, 120);
    const hidden = await p.screenshot();
    await p.evaluate(() => document.getElementById('ink-hide').remove());
    await settle(p, 60);
    const m = await labInk(shown, hidden, items.map((t) => t.box));
    return items.map((t, i) => ({ ...t, ink: m[i].ink, ratio: contrastOf(m[i].p95, t.kind), need: TEXT_KINDS.find((k) => k[1] === t.kind)[3] }));
  }
  /** The pool of light in each frame, as a percent of the end frame: measured where the two ends agree (the floor,
   *  not the three things) and the floor is lit, between the border and the words. pct.start: the first end. */
  async function pool(start, end, frames) {
    const out = await labPage.evaluate(async ([b64s, decode]) => {
      const dec = (0, eval)(decode);
      const [a, b, ...fs] = await Promise.all(b64s.map(dec));
      const grey = (d, i) => 0.299 * d.data[i] + 0.587 * d.data[i + 1] + 0.114 * d.data[i + 2];
      const idx = [];
      for (let y = Math.floor(b.height * 0.14); y < b.height * 0.78; y++) for (let x = 0; x < b.width; x++) {
        const i = (y * b.width + x) * 4, gb = grey(b, i);
        if (gb >= 18 && Math.abs(grey(a, i) - gb) < 4) idx.push(i);
      }
      const mean = (d) => idx.reduce((s, i) => s + grey(d, i), 0) / Math.max(1, idx.length);
      const ref = mean(b);
      return { start: (100 * mean(a)) / ref, frames: fs.map((d) => (100 * mean(d)) / ref), n: idx.length };
    }, [[start, end, ...frames].map((x) => x.toString('base64')), decode]);
    const pct = out.frames; pct.start = out.start; return pct;
  }

  /* 1. words */
  if (want(1)) await guarded(1, async () => {
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
        const lines = await p.evaluate(() => [...document.querySelectorAll('#film .scene')].map((s) => [
          [...s.querySelectorAll('.big .ln')].map((e) => e.textContent.replace(/\u00a0/g, ' ')),
          [...s.querySelectorAll('.big .pl')].map((e) => e.textContent.replace(/\u00a0/g, ' ')),
        ]));
        content.scenes.forEach((s, i) => {
          if (JSON.stringify(lines[i][0]) !== JSON.stringify(s.lines)) bad.push(`scene ${i + 1} wide lines ${JSON.stringify(lines[i][0])}`);
          if (JSON.stringify(lines[i][1]) !== JSON.stringify(s.phoneLines ?? s.lines)) bad.push(`scene ${i + 1} phone lines ${JSON.stringify(lines[i][1])}`);
        });
        // scene 6: each name tag is its venture's name, in its trace's colour class, in the labels' own box
        const tags = await p.evaluate(() => [...document.querySelectorAll('#film .layer > .lbox .blab.name')].map((e) => [e.className, e.textContent]));
        const wantTags = BOARD_NAMES.map(([t, n]) => [`blab name n-${t}`, n]);
        if (JSON.stringify(tags) !== JSON.stringify(wantTags)) bad.push(`scene 6 name tags ${JSON.stringify(tags)}, want ${JSON.stringify(wantTags)}`);
        const alts = await p.evaluate(() => [...document.querySelectorAll('#film img')].map((i) => i.alt));
        const dA = sameSeq(alts, content.scenes.map((s) => s.alt));
        if (!dA.equal) bad.push(`picture descriptions: ${dA.at}`);
        const ld = await p.evaluate(() => JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent));
        if (ld.name !== content.site.name || ld.legalName !== content.site.legalName || ld.address?.addressLocality !== content.site.locality) bad.push('structured data differs from the content file');
      }
      await p.close();
    }
    const llms = readFileSync(join(DIST, 'llms.txt'), 'utf8').split('\n').map((l) => l.replace(/^# |^> /, '')).filter(Boolean);
    const M = content.machines, P = content.pages, U = content.site.url;
    const wantLlms = [M.title, ...machineLines, `## ${M.pagesHeading}`,
      `- [${B.people}](${U}${P.home.path}): ${M.pageNotes.home}`,
      `- [${B.machines}](${U}${P.machines.path}): ${M.pageNotes.machines}`,
      `- [${B.legal}](${U}${P.legal.path}): ${M.pageNotes.legal}`];
    if (JSON.stringify(llms) !== JSON.stringify(wantLlms)) bad.push('llms.txt differs from the machine face');
    ok(!bad.length, 1, 'Words on /, /machines/, /llms.txt, /legal/ and the not found page equal content/site.json, in order (scene 6\'s board labels: StudioOS, the three venture names, NEXT); one h1 on the film; the giant lines as the content file breaks them, wide and upright', 'all equal', bad.join('; '));
  });

  /* 1. with the film running: each scene's description is on its stage from the start */
  if (want(1)) await guarded(1, async () => {
    const c = await ctx('chromium', { viewport: { width: 1440, height: 900 } });
    const p = await open(c, '/', 'descriptions');
    const got = await p.evaluate(() => [...document.querySelectorAll('#film .passes')].map((b) => (b.getAttribute('role') === 'img' ? b.getAttribute('aria-label') : '')));
    const d = sameSeq(got, content.scenes.map((s) => s.alt));
    ok(d.equal, 1, 'Film running: all seven picture descriptions are there before any scroll', 'all seven', d.at);
    await c.close();
  });

  /* 2. blocked words (and no local paths, no other email addresses) */
  if (want(2)) await guarded(2, async () => {
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
    const file = process.env.BLOCKED_WORDS_FILE;
    if (!file) warn(2, 'BLOCKED WORDS NOT CHECKED', 'set BLOCKED_WORDS_FILE to a local file with one word or phrase per line');
    else {
      const words = readFileSync(file, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
      const hits = [];
      words.forEach((word, i) => {
        const re = new RegExp(`(?<![A-Za-z0-9])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z0-9])`, 'i');
        for (const [f, t] of texts) if (re.test(t)) hits.push(`entry ${i + 1} in ${f}`);
        for (const f of files) if (re.test(relative(ROOT, f))) hits.push(`entry ${i + 1} in the file name ${relative(ROOT, f)}`);
      });
      ok(!hits.length && words.length > 0, 2, `None of the ${words.length} blocked words in ${texts.length} tracked and built text files or any file name`, 'none found', hits.join('; ') || 'the blocked words file is empty');
    }
    const home = '/' + 'Users' + '/';
    const leaks = [];
    for (const [f, t] of texts) {
      if (t.includes(home)) leaks.push(`local path in ${f}`);
      for (const m of t.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) if (m[0] !== 'hello@proxyz.studio' && !/^[\w.-]+@\d/.test(m[0])) leaks.push(`address ${m[0]} in ${f}`);
    }
    ok(!leaks.length, 2, 'No local path and no email address but hello@proxyz.studio in any tracked or built file', 'none found', [...new Set(leaks)].join('; '));
  });

  /* 3. dashes and the system's name */
  if (want(3)) await guarded(3, async () => {
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
  });

  /* 6. faults at every screen size (and console errors, collected throughout) */
  if (want(6)) await guarded(6, async () => {
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
  });

  /* 6. old privacy and terms links land with their heading in view, below the border */
  if (want(6)) await guarded(6, async () => {
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
  });

  /* 7. scripts off */
  if (want(7)) await guarded(7, async () => {
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
  });

  /* 8. less motion */
  if (want(8)) await guarded(8, async () => {
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
  });

  /* 9. turning the screen: every picture sits where a fresh load at that size puts it */
  if (want(9)) await guarded(9, async () => {
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
  });

  /* 9. fast turning in the Safari engine: twelve size changes in a row, three runs for each scene whose picture is
     sized to leave room for its words (3, 6 and the last). The engine used to leave such a picture the wrong size now
     and then, and nothing placed it again. A fresh load at each size is the answer to compare with. */
  if (want(9)) await guarded(9, async () => {
    const bad = [];
    const SEQ = [[430, 739], [739, 430], [430, 739], [1512, 860], [393, 852], [852, 393], [320, 568], [1512, 860], [430, 739], [600, 600], [1000, 1001], [430, 739]];
    const snap = (p, n) => p.evaluate((n) => [...document.querySelectorAll(`#s${n} .passes img`)].map((i) => { const r = i.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round); }), n);
    const fresh = {};
    const RUNS = 3, SCENES = [3, 6, content.scenes.length];
    let steps = 0;
    for (const n of SCENES) {
      for (let run = 0; run < RUNS; run++) {
        const c = await ctx('webkit', { viewport: { width: 430, height: 739 } });
        const p = await open(c, '/', `fast turning webkit scene ${n}`);
        await settle(p, 500);
        for (const [w, h] of SEQ) {
          await p.setViewportSize({ width: w, height: h });
          await settle(p, 250);
          await toScene(p, n, 0.6);
          const got = await snap(p, n);
          const key = `${w}x${h}|${n}`;
          if (!fresh[key]) {
            const c2 = await ctx('webkit', { viewport: { width: w, height: h } });
            const q = await open(c2, '/', `fresh webkit ${w}x${h}`);
            await settle(q, 400);
            await toScene(q, n, 0.6);
            fresh[key] = await snap(q, n);
            await c2.close();
          }
          const want = fresh[key];
          steps++;
          if (got.length !== want.length || got.some((b, i) => b.some((v, j) => Math.abs(v - want[i][j]) > 2))) bad.push(`scene ${n} run ${run + 1} at ${w}x${h}: ${JSON.stringify(got)}, fresh load ${JSON.stringify(want)}`);
        }
        await c.close();
      }
    }
    ok(!bad.length, 9, `Fast turning, Safari engine: ${SEQ.length} size changes in a row, ${RUNS} runs each for scenes ${SCENES.join(', ')}: every picture where a fresh load puts it, within 2 px`, `${steps} of ${steps} steps`, bad.slice(0, 4).join('; '));
  });

  /* 9. a reload in the middle of the film comes back to the same scene */
  if (want(9)) await guarded(9, async () => {
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
  });

  /* 7. the film script blocked, late or failed: the later pictures wait for it, and without it they all show */
  if (want(7)) await guarded(7, async () => {
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
        // each scene brought into view until its picture has really arrived (a lazy picture not yet asked for counts as complete)
        for (let n = 1; n <= content.scenes.length; n++) {
          await p.evaluate((n) => document.getElementById('s' + n).scrollIntoView(), n);
          await p.waitForFunction((n) => { const i = document.querySelector(`#s${n} img`); return i && i.complete && i.naturalWidth > 0; }, n, { timeout: 8000 }).catch(() => {});
        }
        const r = await p.evaluate(() => ({ film: document.documentElement.classList.contains('film'), pics: [...document.querySelectorAll('#film section img')].filter((i) => i.complete && i.naturalWidth > 0 && i.getBoundingClientRect().height > 0 && getComputedStyle(i).display !== 'none').length }));
        if (r.film || r.pics !== content.scenes.length) bad.push(`${engine} blocked: film ${r.film}, ${r.pics} pictures shown`);
        await c.close();
      }
    }
    ok(!bad.length, 7, 'Film script late: no picture of scenes 2 to 7 loads before the film runs; film script blocked: after about 4 s the plain page shows all seven pictures (Chromium, WebKit, Firefox)', 'held back, then seven pictures', bad.join('; '));
  });

  /* 12. phones, with the browser's bar showing and with it slid away */
  if (want(12)) await guarded(12, async () => {
    // Contexts that take screenshots skip the security policy: the Safari engine's test tool adds a style of its own
    // for each screenshot, which the policy refuses (a tool quirk, not the site).
    // A hidden browser has no sliding bar, so each state is copied with test styles (allowed past the security
    // policy in the test only), for every bar layout in BARS (the older measure and Safari's classic bar in both
    // engines, the others in Chromium).
    async function stateCtx(engine, state, css = '', o = {}, bar = BARS[0]) {
      const st = barState(bar, state);
      const c = await ctx(engine, { viewport: { width: st.w, height: st.h }, bypassCSP: true, ...o });
      await c.addInitScript(INJECT, st.css + css);
      return c;
    }
    const HIDE = INK_HIDE;
    const NOBACK = '.film .scene .words::before{display:none !important}';
    const where = (n) => {
      const s = document.getElementById('s' + n), words = s.querySelector('.words'), big = s.querySelector('.cut .big');
      const r = (e) => { const b = e.getBoundingClientRect(); return [b.left, b.top, b.width, b.height]; };
      const topEnd = document.querySelector('#top').getBoundingClientRect().bottom;
      const w = words ? words.getBoundingClientRect() : null;
      return {
        gap: w ? innerHeight - w.bottom : null,
        top: big ? r(big).map((v) => Math.round(v * 10) / 10) : null,
        pics: [...s.querySelectorAll('.passes img')].map((i) => r(i).map((v) => Math.round(v * 10) / 10)),
        above: w ? [0, topEnd + 30, innerWidth, w.top - topEnd - 30] : null,
      };
    };
    const place = [], read = [], back = [], s4 = [];
    const boxes = {}, tops = {};
    for (const bar of BARS) for (const engine of bar === BARS[0] || bar === BARS[1] ? ['chromium', 'webkit'] : ['chromium']) {
      const bk = `${engine} ${bar.join('/')}`;
      for (const state of ['away', 'showing']) {
        const c = await stateCtx(engine, state, '', {}, bar);
        const p = await open(c, '/', `bar ${state} ${engine}`);
        const tag = `${engine} ${barLabel(bar, state)}`;
        boxes[bk + state] = []; tops[bk + state] = [];
        for (let n = 1; n <= content.scenes.length; n++) {
          await toScene(p, n, 1);
          await settle(p, 700);   // the scene before has faded out
          const g = await p.evaluate(where, n);
          boxes[bk + state].push(g.pics);
          tops[bk + state].push(g.top);
          // the words at the foot (the giant words of the first and last scene, the small words of the others) ride
          // the visible bottom; the giant words at the top stay where they are
          if (g.gap !== null && Math.abs(g.gap - 60) > 1) place.push(`${tag} scene ${n}: words ${g.gap.toFixed(1)} px above the visible bottom`);
          const ink = await inkOf(p, n);
          for (const t of ink) if (t.ink >= 20 && t.ratio < t.need) read.push(`${tag} scene ${n} ${t.kind}: ${t.ratio.toFixed(2)} to 1`);
          if (!ink.some((t) => t.kind === 'giant' && t.ink >= 20)) read.push(`${tag} scene ${n}: no giant words drawn`);
          // with the bar away the backings of scenes 3 and 4 leave the picture above the words as it is
          await p.evaluate((css) => { const s = document.createElement('style'); s.id = 'hide-all'; s.textContent = css; document.head.append(s); }, HIDE);
          await settle(p, 120);
          const bare0 = await p.screenshot();
          await p.evaluate(() => document.getElementById('hide-all').remove());
          if (bar === BARS[0] && state === 'away' && (n === 3 || n === 4)) {
            const without = await stateCtx(engine, state, HIDE + NOBACK);
            const q = await open(without, '/', `bar away no backing ${engine}`);
            await toScene(q, n, 1);
            await settle(q, 700);
            const a = (await lab(bare0, [g.above]))[0].mean, b = (await lab(await q.screenshot(), [g.above]))[0].mean;
            if (Math.abs(a - b) > 0.02 * Math.max(b, 1)) back.push(`${engine} scene ${n}: above the words ${a.toFixed(2)} with the backing, ${b.toFixed(2)} without`);
            await without.close();
            // scene 4 against its own drawing (no shade, no backing): only the soft shade at the foot of every scene
            // may dim it, which keeps at least 88% of the drawing's light above the words (the old tall band kept 74%)
            if (n === 4) {
              const bare = await stateCtx(engine, state, HIDE + NOBACK + '.film .scene .shade,.film .scene .dim{display:none !important}');
              const r = await open(bare, '/', `bar away drawing only ${engine}`);
              await toScene(r, n, 1); await settle(r, 700);
              const d = (await lab(await r.screenshot(), [g.above]))[0].mean;
              s4.push(`${engine} ${(100 * a / d).toFixed(0)}%`);
              if (a < 0.88 * d) back.push(`${engine} scene 4: above the words ${a.toFixed(2)}, the drawing alone ${d.toFixed(2)}`);
              await bare.close();
            }
          }
        }
        await c.close();
      }
      // every picture box, and the giant words at the top, the same in both states (each film built fresh in its state)
      const a = boxes[bk + 'away'], b = boxes[bk + 'showing'];
      a.forEach((pics, n) => pics.forEach((box, i) => { if (!b[n][i] || box.some((v, j) => Math.abs(v - b[n][i][j]) > 1)) place.push(`${bk} scene ${n + 1} picture ${i + 1}: ${box} with the bar away, ${b[n][i]} with it showing`); }));
      tops[bk + 'away'].forEach((t, n) => { const u = tops[bk + 'showing'][n]; if (t && (!u || t.some((v, j) => Math.abs(v - u[j]) > 1))) place.push(`${bk} scene ${n + 1} giant words at the top: ${t} with the bar away, ${u} with it showing`); });
    }
    const bars = BARS.map((b) => `${b[0]} wide ${b[1]}/${b[2]}`).join(', ');
    ok(!place.length, 12, `Phone, bar showing and bar away (${bars}): the words at the foot (giant words of scenes 1 and 7, the small line of the others) sit 60 px above the visible bottom in each; the giant words at the top and every picture box are the same in both states (Chromium; WebKit for the first two)`, 'words on the edge, pictures and top words still', place.slice(0, 6).join('; '));
    ok(!read.length, 12, `Phone, both states (${bars}): the giant words, the small line, its note and the grey tool line at least 4.5 to 1 against what lies behind their letters, the height line at least 3 to 1, all seven scenes (Chromium; WebKit for the first two)`, 'all readable', read.slice(0, 6).join('; '));
    ok(!back.length, 12, 'Phone, bar away: the backings of scenes 3 and 4 leave the picture above the words as it is (within 2%); scene 4 keeps at least 88% of its drawing\'s light there', `no dimming; scene 4 keeps ${s4.join(', ')}`, back.join('; '));

    /* the last scene: the twin fades in over a steady pool of light */
    if (content.scenes[content.scenes.length - 1].picture === 'twin') {
      const bad = [], seen = [];
      for (const engine of ['chromium', 'webkit']) {
        for (const [form, mk] of [['phone', () => stateCtx(engine, 'away')], ['laptop', () => ctx(engine, { viewport: { width: 1512, height: 860 }, bypassCSP: true })]]) {
          const c = await mk();
          const p = await open(c, '/', `twin ${engine} ${form}`);
          const last = content.scenes.length;
          await toScene(p, last, 0); await toScene(p, last - 1, 1); await settle(p, 900);
          // the change plays with the scroll (src/film/motion.ts): from where the twin starts to come in to where it
          // has fully come in, stepped in eleven places
          const g = await p.evaluate((n) => { const s = document.getElementById('s' + n), vh = document.querySelector('.probe').offsetHeight || innerHeight; return { cut: s.offsetTop - vh / 2, span: vh * 0.8 }; }, last);
          const at = (w) => Math.round(g.cut + (w - 0.5) * g.span);
          const shot = async (w) => { await p.evaluate((y) => scrollTo(0, y), at(w)); await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))); await settle(p, 250); return p.screenshot(); };
          const before = await shot(0.12);
          const frames = [];
          for (let k = 0; k <= 10; k++) frames.push(await shot(0.12 + (k / 10) * 0.7));
          const after = await shot(0.82);
          const pct = await pool(before, after, frames);
          seen.push(`${engine} ${form} ${Math.min(...pct).toFixed(1)} to ${Math.max(...pct).toFixed(1)}%`);
          if (Math.min(...pct) < 96 || Math.max(...pct) > Math.max(pct.start, 100) + 1) bad.push(`${engine} ${form}: ${pct.map((v) => v.toFixed(1)).join(' ')}`);
          await c.close();
        }
      }
      ok(!bad.length, 12, 'Last scene is the twin: through the change from scene 6 the pool of light stays between 96% and the brightness of its two ends (phone and laptop, Chromium, WebKit)', seen.join(', '), bad.join('; '));
    }

    /* the bottom safe area changes as the bar slides (older iPhones: 0 with it showing, 34 px with it away). Forced in
       the test with a style: a scene placed at 0 is placed again once when it grows to 34 and then equals a fresh load
       at 34; going back to 0 changes nothing. On the laptop the inset never moves a picture. */
    {
      const bad = [], seen = [];
      const boxesOf = (p, n) => p.evaluate((n) => [...document.querySelectorAll(`#s${n} .passes img`)].map((i) => { const r = i.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map((v) => Math.round(v * 10) / 10); }), n);
      const setInset = (p, px) => p.evaluate((px) => { let s = document.getElementById('test-inset'); if (!s) { s = document.createElement('style'); s.id = 'test-inset'; document.head.append(s); } s.textContent = `:root{--safe-b:${px}px !important}`; }, px);
      const same = (a, b) => a.length === b.length && a.every((x, i) => x.every((v, j) => Math.abs(v - b[i][j]) <= 0.5));
      const last = content.scenes.length;
      for (const engine of ['chromium', 'webkit']) {
        for (const [w, h] of [[430, 873], [1512, 860]]) {
          const phone = w < 600;
          for (const n of [6, last]) {
            const c = await ctx(engine, { viewport: { width: w, height: h }, bypassCSP: true });
            const p = await open(c, '/', `inset ${engine} ${w}x${h} scene ${n}`);
            await toScene(p, n, 0.7);
            const at0 = await boxesOf(p, n);
            // counts each new place written for the pictures (light changes alone are not counted)
            await p.evaluate((n) => {
              const imgs = [...document.querySelectorAll(`#s${n} .passes img`)];
              const key = () => imgs.map((i) => [i.style.left, i.style.top, i.style.width].join()).join('|');
              let was = key(); window.__places = 0;
              const mo = new MutationObserver(() => { const now = key(); if (now !== was) { window.__places++; was = now; } });
              imgs.forEach((i) => mo.observe(i, { attributes: true, attributeFilter: ['style'] }));
            }, n);
            await setInset(p, 34); await settle(p, 500);
            await p.evaluate(() => scrollBy(0, 2)); await settle(p, 300);
            const at34 = await boxesOf(p, n), places34 = await p.evaluate(() => window.__places);
            await setInset(p, 0); await settle(p, 500);
            await p.evaluate(() => scrollBy(0, -2)); await settle(p, 300);
            const back = await boxesOf(p, n), placesAll = await p.evaluate(() => window.__places);
            await c.close();
            const c2 = await ctx(engine, { viewport: { width: w, height: h }, bypassCSP: true });
            await c2.addInitScript((css) => { const s = document.createElement('style'); s.textContent = css; const put = () => { if (document.head) { document.head.append(s); return true; } return false; }; if (!put()) new MutationObserver((_, o) => { if (put()) o.disconnect(); }).observe(document, { childList: true, subtree: true }); }, ':root{--safe-b:34px !important}');
            const q = await open(c2, '/', `inset fresh ${engine} ${w}x${h}`);
            await toScene(q, n, 0.7);
            const fresh34 = await boxesOf(q, n);
            await c2.close();
            const label = `${engine} ${phone ? 'phone' : 'laptop'} scene ${n}`;
            if (phone) {
              if (places34 !== 1 || !same(at34, fresh34) || same(at34, at0)) bad.push(`${label}: at 34 px placed ${places34} times, ${JSON.stringify(at34[0])}, fresh load ${JSON.stringify(fresh34[0])}, at 0 ${JSON.stringify(at0[0])}`);
              if (placesAll !== 1 || !same(back, at34)) bad.push(`${label}: back at 0 px ${JSON.stringify(back[0])}, placed ${placesAll} times in all`);
              seen.push(`${label} ${at0[0][2]} to ${at34[0][2]} px wide, placed once`);
            } else if (placesAll !== 0 || !same(at34, at0) || !same(back, at0) || !same(fresh34, at0)) bad.push(`${label}: the inset moved a picture (${JSON.stringify(at0[0])}, ${JSON.stringify(at34[0])}, fresh ${JSON.stringify(fresh34[0])})`);
          }
        }
      }
      ok(!bad.length, 12, 'Phone: when the bottom safe area grows (0 to 34 px, forced in the test) scenes 6 and 7 are placed again once, as a fresh load at 34 px places them; back to 0 changes nothing; on the laptop no picture moves (Chromium, WebKit)', seen.join(', '), bad.join('; '));
    }
  });

  /* 13. the page colour: the film page is in the film's black from the first paint (Safari paints the strip under its
     bar with the page's own colour), the text pages keep their own; checked with scripts off, so it is in the HTML */
  if (want(13)) await guarded(13, async () => {
    const bad = [];
    const WANT = { '/': ['rgb(1, 1, 1)', '#010101'], '/machines/': ['rgb(10, 10, 10)', '#0a0a0a'], '/legal/': ['rgb(10, 10, 10)', '#0a0a0a'], '/nope-nope/': ['rgb(10, 10, 10)', '#0a0a0a'] };
    for (const engine of ['chromium', 'webkit', 'firefox']) {
      for (const js of [false, true]) {
        const c = await ctx(engine, { viewport: { width: 430, height: 739 }, javaScriptEnabled: js });
        for (const [path, [bg, theme]] of Object.entries(WANT)) {
          const p = await open(c, path, `colour ${engine} ${path}`);
          const got = await p.evaluate(() => [getComputedStyle(document.documentElement).backgroundColor, getComputedStyle(document.body).backgroundColor, document.querySelector('meta[name=theme-color]')?.content]);
          if (got[0] !== bg || got[1] !== bg || got[2] !== theme) bad.push(`${engine} ${js ? 'scripts on' : 'scripts off'} ${path}: ${got.join(', ')}`);
          await p.close();
        }
        await c.close();
      }
    }
    ok(!bad.length, 13, 'Page colour: the film page root, body and theme colour are the film\'s black #010101; MACHINES, LEGAL and the not found page keep #0a0a0a; same with scripts off (Chromium, WebKit, Firefox)', 'as built', bad.join('; '));
  });

  /* 14. the giant lines: set in Anton (the display face, loaded from this site), every line the size the rules give:
     upright, each line as wide as the screen between its side margins, unless it would be taller than its share of
     the height; wide, the widest line its share of the width, unless the block would be taller than its share */
  if (want(14)) await guarded(14, async () => {
    const bad = [], seen = new Set();
    const T = film.type;
    const runs = [...VIEWPORTS.map(([w, h]) => ['chromium', w, h]), ['chromium', 430, 873], ['chromium', 834, 1194],
      ['webkit', 430, 739], ['webkit', 1512, 860], ['webkit', 852, 393], ['firefox', 430, 739], ['firefox', 1512, 860], ['firefox', 852, 393]];
    for (const [engine, w, h] of runs) {
      const c = await ctx(engine, { viewport: { width: w, height: h } });
      const p = await open(c, '/', `display face ${engine} ${w}x${h}`);
      await p.evaluate(() => document.fonts.ready);
      const r = await p.evaluate(() => {
        const face = [...document.fonts].find((f) => f.family.replace(/["']/g, '') === 'Site Display');
        const textW = (el) => { const g = document.createRange(); g.selectNodeContents(el); return g.getBoundingClientRect().width; };
        const H = document.querySelector('.probe')?.offsetHeight || innerHeight;
        const ends = [...document.querySelectorAll('#top .row')].filter((e) => getComputedStyle(e).display !== 'none').map((e) => e.getBoundingClientRect().bottom);
        return {
          face: face ? face.status : 'missing', H, border: Math.max(0, ...ends),
          scenes: [...document.querySelectorAll('#film .scene')].map((s) => {
            const big = s.querySelector('.big'), b = big.getBoundingClientRect();
            return {
              left: b.left, top: b.top, bottom: b.bottom, atTop: !!big.closest('.cut'),
              family: [...big.querySelectorAll('.ln,.pl')].map((e) => getComputedStyle(e).fontFamily.split(',')[0].replace(/["']/g, '').trim()),
              checked: document.fonts.check(`400 40px "Site Display"`, big.textContent),
              ln: [...big.querySelectorAll('.ln')].map((e) => ({ w: textW(e), h: e.getBoundingClientRect().height, fs: parseFloat(getComputedStyle(e).fontSize), right: e.getBoundingClientRect().left + textW(e) })),
              pl: [...big.querySelectorAll('.pl')].map((e) => ({ w: textW(e), fs: parseFloat(getComputedStyle(e).fontSize) })),
            };
          }),
        };
      });
      const tag = `${engine} ${w}x${h}`;
      if (r.face !== 'loaded') bad.push(`${tag}: the display face is ${r.face}`);
      r.scenes.forEach((s, i) => {
        const n = i + 1, lines = content.scenes[i].lines.length;
        if (s.family.some((f) => f !== 'Site Display') || !s.checked) bad.push(`${tag} scene ${n}: not set in the display face (${[...new Set(s.family)].join(', ')})`);
        if (w / h <= 1) {
          const room = w - 2 * s.left;
          s.pl.forEach((l, k) => {
            const cap = T.lineMax * r.H;
            if (l.fs < cap - 0.5 ? Math.abs(l.w - room) > 1 : (Math.abs(l.fs - cap) > 0.5 || l.w > room + 1)) bad.push(`${tag} scene ${n} line ${k + 1}: ${l.w.toFixed(1)} px wide at ${l.fs.toFixed(1)} px, room ${room.toFixed(1)}, cap ${cap.toFixed(1)}`);
          });
        } else {
          const share = T.share[n] ?? T.shareDefault, widest = Math.max(...s.ln.map((l) => l.w)), fs = s.ln[0].fs;
          const cap = (T.blockMax * r.H) / (T.lineHeight * lines), block = s.ln.reduce((a, l) => a + l.h, 0);
          if (fs < cap - 0.5 ? Math.abs(widest - share * w) > 1 : Math.abs(fs - cap) > 0.5 || widest > share * w + 1) bad.push(`${tag} scene ${n}: widest line ${widest.toFixed(1)} px at ${fs.toFixed(1)} px, want ${(share * w).toFixed(1)} (cap ${cap.toFixed(1)})`);
          if (block > T.blockMax * r.H + 1) bad.push(`${tag} scene ${n}: block ${block.toFixed(1)} px tall`);
        }
        // nothing clipped, nothing under the border
        if (s.ln.some((l) => l.right > w + 1)) bad.push(`${tag} scene ${n}: a line runs past the right edge`);
        if (s.atTop && s.top < r.border - 0.5) bad.push(`${tag} scene ${n}: the giant words start at ${s.top.toFixed(1)}, under the border (${r.border.toFixed(1)})`);
        seen.add(`${tag}`);
      });
      await c.close();
    }
    ok(!bad.length, 14, `The giant lines are set in the display face, loaded from this site, and sized by the rules (upright: each line the width between its margins, at most ${T.lineMax * 100}% of the height; wide: the widest line ${T.shareDefault * 100}% of the width, 60% on scenes ${Object.keys(T.share).join(' and ')}, the block at most ${T.blockMax * 100}% of the height), within 1 px; none clipped, none under the border`, `${seen.size} screens in three engines`, bad.slice(0, 8).join('; '));
  });

  /* 15. contrast at every listed size: the giant words, the small line and its note, the grey tool line (4.5 to 1) and
     the height line (3 to 1), against what lies behind their own letters, all seven scenes at rest */
  if (want(15)) await guarded(15, async () => {
    const bad = [], low = [];
    for (const [w, h] of VIEWPORTS) {
      const c = await ctx('chromium', { viewport: { width: w, height: h }, bypassCSP: true });
      const p = await open(c, '/', `contrast ${w}x${h}`);
      for (let n = 1; n <= content.scenes.length; n++) {
        await toScene(p, n, 1);
        await settle(p, 700);
        const ink = await inkOf(p, n);
        for (const t of ink) {
          if (t.ink < 20) continue;
          low.push([t.ratio, `${w}x${h} scene ${n} ${t.kind} ${t.ratio.toFixed(2)}`]);
          if (t.ratio < t.need) bad.push(`${w}x${h} scene ${n} ${t.kind}: ${t.ratio.toFixed(2)} to 1`);
        }
        if (!ink.some((t) => t.kind === 'giant' && t.ink >= 20)) bad.push(`${w}x${h} scene ${n}: no giant words drawn`);
      }
      await c.close();
    }
    low.sort((a, b) => a[0] - b[0]);
    ok(!bad.length, 15, `Contrast at ${VIEWPORTS.map((v) => v.join('x')).join(', ')} (Chromium): every text at least 4.5 to 1 (the height line 3 to 1) against what lies behind its letters`, `lowest: ${low.slice(0, 3).map((x) => x[1]).join(', ')}`, bad.slice(0, 8).join('; '));
  });

  /* 16. things that appear after the first pass never overlap the giant words, never touch the words at the foot
     (the small line, its note, the tool line, the height line) and stay fully on screen, at every listed size and in
     every bar state */
  if (want(16)) await guarded(16, async () => {
    const bad = [], foot = [], seen = [], seenFoot = [];
    const views = [];
    for (let n = 1; n <= content.scenes.length; n++) for (const form of ['desktop', 'phone']) if (viewOf(n, form).later?.length) views.push([n, form]);
    if (!views.length) warn(16, 'No scene lists things that appear after the first pass', 'nothing to test');
    else {
      const sizes = JSON.parse(readFileSync(join(ROOT, 'src/generated/pictures.json'), 'utf8'));
      const runs = [...VIEWPORTS.map(([w, h]) => ({ engine: 'chromium', w, h, css: '', label: `${w}x${h}` })),
        ...BARS.flatMap((bar) => ['away', 'showing'].map((state) => ({ engine: 'chromium', ...barState(bar, state), label: barLabel(bar, state) }))),
        { engine: 'chromium', w: 834, h: 1194, css: '', label: '834x1194' },
        ...[[430, 739], [1512, 860]].map(([w, h]) => ({ engine: 'webkit', w, h, css: '', label: `${w}x${h}` })),
        { engine: 'webkit', ...barState(BARS[1], 'showing'), label: barLabel(BARS[1], 'showing') }];
      for (const run of runs) {
        const { engine, w, h, css } = run, tag = `${engine} ${run.label}`;
        const c = await ctx(engine, { viewport: { width: w, height: h }, bypassCSP: !!css });
        if (css) await c.addInitScript(INJECT, css);
        const p = await open(c, '/', `later ${tag}`);
        const form = w / h <= 1 ? 'phone' : 'desktop';
        for (const [n, f] of views) {
          if (f !== form) continue;
          const view = viewOf(n, form), size = sizes[view.passes[0]].size;
          await toScene(p, n, 1);
          // the ink of each giant line: across its text, and from the top of its capitals to its baseline (the face's
          // own metrics, read by the browser; a text box would add the face's empty space above and below); the
          // words at the foot, each a box
          const r = await p.evaluate((n) => {
            const s = document.getElementById('s' + n), img = s.querySelector('.passes img').getBoundingClientRect();
            const upright = innerWidth / innerHeight <= 1;
            const g2 = document.createElement('canvas').getContext('2d');
            const lines = [...s.querySelectorAll(upright ? '.big .pl' : '.big .ln')].map((e) => {
              const box = e.getBoundingClientRect(), cs = getComputedStyle(e), fs = parseFloat(cs.fontSize);
              const g = document.createRange(); g.selectNodeContents(e); const t = g.getBoundingClientRect();
              g2.font = `400 ${fs}px "Site Display"`;
              const m = g2.measureText(e.textContent);
              const base = box.top + (parseFloat(cs.lineHeight) - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
              return [t.left, base - m.actualBoundingBoxAscent, t.right, base + m.actualBoundingBoxDescent];
            });
            const words = s.querySelector('.words');
            const small = words && !words.querySelector('.big') ? [...words.children].map((e) => {
              const g = document.createRange(); g.selectNodeContents(e); const t = e.classList.contains('hl') ? e.getBoundingClientRect() : g.getBoundingClientRect();
              return [t.left, t.top, t.right, t.bottom];
            }) : [];
            return { img: [img.left, img.top, img.width], lines, small, vw: innerWidth, vh: innerHeight };
          }, n);
          const k = r.img[2] / size[0];
          let gap = Infinity, gapFoot = Infinity;
          for (const [pass, x, y, bw, bh] of view.later) {
            const box = [r.img[0] + x * k, r.img[1] + y * k, r.img[0] + (x + bw) * k, r.img[1] + (y + bh) * k];
            for (const l of r.lines) {
              const dx = Math.max(l[0] - box[2], box[0] - l[2]), dy = Math.max(l[1] - box[3], box[1] - l[3]);
              gap = Math.min(gap, Math.max(dx, dy));
              if (dx < 0 && dy < 0) bad.push(`${tag} scene ${n}: the thing of pass ${pass} overlaps the giant words`);
            }
            for (const q of r.small) {
              const d = Math.max(q[0] - box[2], box[0] - q[2], q[1] - box[3], box[1] - q[3]);
              gapFoot = Math.min(gapFoot, d);
              if (d <= 0) foot.push(`${tag} scene ${n}: the thing of pass ${pass} touches the words at the foot (${d.toFixed(1)} px)`);
            }
            if (box[0] < -0.5 || box[1] < -0.5 || box[2] > r.vw + 0.5 || box[3] > r.vh + 0.5) foot.push(`${tag} scene ${n}: the thing of pass ${pass} runs off the visible area (${box.map(Math.round).join(', ')} in ${r.vw}x${r.vh})`);
          }
          seen.push([gap, `${tag} scene ${n} ${gap.toFixed(1)} px`]);
          if (gapFoot < Infinity) seenFoot.push([gapFoot, `${tag} scene ${n} ${gapFoot.toFixed(1)} px`]);
        }
        await c.close();
      }
      const what = `at ${VIEWPORTS.map((v) => v.join('x')).join(', ')}, 834x1194 and every bar state of ${BARS.map((b) => `${b[0]} wide ${b[1]}/${b[2]}`).join(', ')} (Chromium); 430x739, 1512x860 and Safari's classic bar showing (WebKit)`;
      ok(!bad.length, 16, `Things that first appear in a later pass (scene ${[...new Set(views.map((v) => v[0]))].join(', ')}) never overlap the giant words, ${what}`, `closest: ${seen.sort((a, b) => a[0] - b[0])[0]?.[1]}`, [...new Set(bad)].slice(0, 6).join('; '));
      ok(!foot.length, 16, `Those things never touch the words at the foot (the small line, its note, the tool and height lines) and stay fully on the visible screen, ${what}`, `closest to the words at the foot: ${seenFoot.sort((a, b) => a[0] - b[0])[0]?.[1] ?? 'none'}`, [...new Set(foot)].slice(0, 6).join('; '));
    }
  });

  /* 18. scripts off: every scene's picture sits where the film puts it at rest (same size, place and tuck), and every
     giant line keeps at least 85% of its ink (the thing in front may hide only a little of it) */
  if (want(18)) await guarded(18, async () => {
    const place = [], inkBad = [], seenPlace = [], seenInk = [];
    const runs = [...[[430, 873], [393, 852], [320, 568], [852, 393], [806, 516], [1512, 860], [2428, 1300]].map(([w, h]) => ({ w, h, css: '', label: `${w}x${h}` })),
      ...[BARS[1], BARS[3]].map((bar) => ({ ...barState(bar, 'showing'), label: barLabel(bar, 'showing') }))];
    for (const engine of ['chromium', 'webkit', 'firefox']) {
      for (const run of engine === 'chromium' ? runs : runs.filter((r) => ['430x873', '1512x860'].includes(r.label))) {
        const { w, h, css } = run, tag = `${engine} ${run.label}`;
        const film1 = await ctx(engine, { viewport: { width: w, height: h }, bypassCSP: true });
        if (css) await film1.addInitScript(INJECT, css);
        const pf = await open(film1, '/', `film ${tag}`);
        const off = await ctx(engine, { viewport: { width: w, height: h }, bypassCSP: true, javaScriptEnabled: false });
        const po = await open(off, '/', `scripts off ${tag}`);
        // with scripts off no init script runs: the test styles go in once the page is there
        if (css) await po.evaluate((css) => { const s = document.createElement('style'); s.textContent = css; document.head.append(s); }, css);
        let worst = 0, least = Infinity;
        // scene 6's board: with scripts off it is there at rest (every line whole, every part shown, its matte on) and
        // sits where the film puts it
        for (let n = 1; n <= content.scenes.length; n++) {
          if (!content.scenes[n - 1].board) continue;
          await toScene(pf, n, 1);
          await pf.waitForFunction((n) => { const b = document.querySelector(`#s${n} .bbox`); return b && b.isConnected && getComputedStyle(b).visibility !== 'hidden'; }, n, { timeout: 8000 }).catch(() => {});
          const fb = await pf.evaluate((n) => { const b = document.querySelector(`#s${n} .bbox`); if (!b || !b.isConnected) return null; const r = b.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }, n);
          const fl = await pf.evaluate((n) => { const b = document.querySelector(`#s${n} .lbox`); if (!b || !b.isConnected) return null; const r = b.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }, n);
          await po.evaluate((n) => document.getElementById('s' + n).scrollIntoView(), n);
          await settle(po, 150);
          // with scripts off the board waits 1.2 s before it fades in (time for its matte), then shows whole
          await po.waitForFunction(() => document.getAnimations().every((a) => a.playState === 'finished'), null, { timeout: 8000 }).catch(() => {});
          const ob = await po.evaluate((n) => {
            const s = document.getElementById('s' + n), l = s.querySelector('.layer').getBoundingClientRect(), b = s.querySelector('.bbox');
            const svg = [...s.querySelectorAll('svg.board')].filter((e) => getComputedStyle(e).display !== 'none');
            const op = (e) => { let o = 1; for (let x = e; x && x !== s; x = x.parentElement) o *= +getComputedStyle(x).opacity; return o; };
            const cs = svg[0] ? getComputedStyle(svg[0]) : null, mask = cs ? cs.getPropertyValue('mask-image') || cs.getPropertyValue('-webkit-mask-image') : '';
            const r = b.getBoundingClientRect(), lb = s.querySelector('.layer > .passes + .lbox'), q = lb ? lb.getBoundingClientRect() : null;
            return { lbox: q ? [q.left - l.left, q.top - l.top, q.width, q.height] : null, box: [r.left - l.left, r.top - l.top, r.width, r.height], shown: svg.length, empty: svg[0] ? [...svg[0].querySelectorAll('path.co, path.dr, path.pd, path.dp')].filter((e) => !e.getAttribute('d') || op(e) < 0.999).length : -1, labels: [...s.querySelectorAll('.blab')].filter((e) => op(e) < 0.999 || getComputedStyle(e).visibility === 'hidden').length, mask: /-matte-/.test(mask) };
          }, n);
          const err = fb ? Math.max(...fb.map((v, k) => Math.abs(v - ob.box[k]))) : Infinity;
          // the labels' own box: the board's box, film and scripts off
          const errL = fl && ob.lbox ? Math.max(...fl.map((v, k) => Math.abs(v - fb[k])), ...ob.lbox.map((v, k) => Math.abs(v - ob.box[k]))) : Infinity;
          worst = Math.max(worst, err);
          if (ob.shown !== 1 || ob.empty || ob.labels || !ob.mask || err > 1.5 || errL > 0.5) place.push(`${tag} scene ${n} board: ${ob.shown} drawings shown, ${ob.empty} parts missing, ${ob.labels} labels hidden, matte ${ob.mask}, ${err.toFixed(2)} px from the film's place, label box ${errL.toFixed(2)} px from the board's`);
        }
        for (let n = 1; n <= content.scenes.length; n++) {
          await toScene(pf, n, 1);
          const a = await pf.evaluate((n) => { const i = document.querySelector(`#s${n} .passes img`).getBoundingClientRect(); return [i.left, i.top, i.width, i.height]; }, n);
          await po.evaluate((n) => document.getElementById('s' + n).scrollIntoView(), n);
          await settle(po, 150);
          const b = await po.evaluate((n) => { const s = document.getElementById('s' + n), l = s.querySelector('.layer').getBoundingClientRect(), i = s.querySelector('.passes img').getBoundingClientRect(); return [i.left - l.left, i.top - l.top, i.width, i.height]; }, n);
          const err = Math.max(...a.map((v, k) => Math.abs(v - b[k])));
          worst = Math.max(worst, err);
          if (err > 1.5) place.push(`${tag} scene ${n}: film ${a.map((v) => v.toFixed(1)).join(', ')}, scripts off ${b.map((v) => v.toFixed(1)).join(', ')}`);
          // the ink of each giant line with the cut and without it, the pictures hidden (white letters on black)
          if (!(await po.evaluate((n) => !!document.querySelector(`#s${n} .cut`), n))) continue;
          const lines = await po.evaluate((n) => [...document.querySelectorAll(`#s${n} .big .pl`)].map((e) => { const g = document.createRange(); g.selectNodeContents(e); const t = g.getBoundingClientRect(); return [t.left, t.top, t.width, t.height]; }), n);
          const style = (x) => po.evaluate((x) => { let s = document.getElementById('t-ink'); if (!s) { s = document.createElement('style'); s.id = 't-ink'; document.head.append(s); } s.textContent = x; }, x);
          const bare = `#s${n} .passes,#s${n} .lbox,#s${n} .shade,#s${n} .words,#top,#frame,.bottom-sw{visibility:hidden !important}#s${n} .big{color:#fff !important}`;
          await style(bare); await settle(po, 120);
          const A = await po.screenshot();
          await style(bare + `#s${n} .cut{-webkit-mask:none !important;mask:none !important}`); await settle(po, 120);
          const B = await po.screenshot();
          await style('');
          const m = await labPage.evaluate(async ([a64, b64, boxes, decode]) => {
            const dec = (0, eval)(decode); const [a, b] = await Promise.all([dec(a64), dec(b64)]);
            return boxes.map(([x, y, w, h]) => {
              let na = 0, nb = 0;
              for (let yy = Math.max(0, Math.round(y)); yy < Math.min(a.height, Math.round(y + h)); yy++) for (let xx = Math.max(0, Math.round(x)); xx < Math.min(a.width, Math.round(x + w)); xx++) {
                const i = (yy * a.width + xx) * 4;
                if (b.data[i] >= 160) { nb++; if (a.data[i] >= 160) na++; }
              }
              return nb ? na / nb : 1;
            });
          }, [A.toString('base64'), B.toString('base64'), lines, decode]);
          m.forEach((v, i) => { least = Math.min(least, v); if (v < 0.85) inkBad.push(`${tag} scene ${n} line ${i + 1}: ${(100 * v).toFixed(1)}% of its ink shows`); });
        }
        seenPlace.push([worst, `${tag} ${worst.toFixed(2)} px`]);
        if (least < Infinity) seenInk.push([least, `${tag} ${(100 * least).toFixed(1)}%`]);
        await film1.close(); await off.close();
      }
    }
    // the first moment with scripts off: the board is not drawn yet (it would show over the things until its matte is in)
    {
      const early = [];
      for (const engine of ['chromium', 'webkit', 'firefox']) {
        const off = await ctx(engine, { viewport: { width: 1512, height: 860 }, javaScriptEnabled: false });
        const po = await off.newPage();
        await po.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
        // with scripts off the page can be ready before its stylesheet is in (seen in Firefox): look only once the
        // styles apply, which is also the first moment a browser paints anything
        await po.waitForFunction(() => getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() !== '', null, { timeout: 5000 }).catch(() => {});
        const r = await po.evaluate(() => {
          const one = (b) => { const a = b ? b.getAnimations().find((x) => x.animationName === 'board-in') : null; return { o: b ? getComputedStyle(b).opacity : 'none', anim: b ? b.getAnimations().map((x) => x.animationName).join(',') : '', delay: a ? a.effect.getTiming().delay : -1 }; };
          return { t: document.timeline.currentTime, b: one(document.querySelector('.bbox')), l: one(document.querySelector('.lbox')) };
        });
        for (const [what, x] of [['board', r.b], ['label box', r.l]]) {
          if (r.t < 1100 && x.o !== '0') early.push(`${engine}: ${what} opacity ${x.o} at ${Math.round(r.t)} ms`);
          if (!/board-in/.test(x.anim)) early.push(`${engine}: no fade-in on the ${what} (${x.anim || 'none'})`);
        }
        // the labels never before the board's lines: the same fade, starting no earlier
        if (r.l.delay < r.b.delay) early.push(`${engine}: the labels fade in at ${r.l.delay} ms, the board at ${r.b.delay} ms`);
        await off.close();
      }
      ok(!early.length, 18, 'Scripts off: scene 6\'s board and its labels\' box are not drawn for their first 1.2 s after the page starts, then fade in, the labels never before the board (time for the matte that hides it inside the things; Chromium, WebKit, Firefox)', 'hidden at the start, fade in place', early.join('; '));
    }
    // scripts on but the film script never arrives (blocked): every scene's resting picture comes back after a few
    // seconds, the board and its labels stay away for good (not displayed) and the things matte is never fetched
    {
      const bad = [], BN = content.scenes.findIndex((s) => s.board) + 1;
      for (const engine of ['chromium', 'webkit', 'firefox']) {
        for (const [w, h] of [[430, 739], [1512, 860]]) {
          const tag = `${engine} ${w}x${h}`;
          const c = await ctx(engine, { viewport: { width: w, height: h } });
          const p = await c.newPage();
          const asked = [];
          p.on('request', (r) => asked.push(r.url()));
          await p.route(/\/assets\/main-[^/]+\.js$/, (r) => r.abort());
          await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
          await p.waitForFunction(() => document.timeline.currentTime > 6000, null, { timeout: 15000, polling: 100 }).catch(() => {});
          for (let n = 1; n <= content.scenes.length; n++) {
            await p.evaluate((n) => document.getElementById('s' + n).scrollIntoView(), n);
            await p.waitForFunction((n) => { const i = document.querySelector(`#s${n} .passes img`); return i && i.complete && i.naturalWidth > 0; }, n, { timeout: 8000 }).catch(() => {});
            await settle(p, 150);
            const r = await p.evaluate((n) => {
              const s = document.getElementById('s' + n), i = s.querySelector('.passes img'), q = i ? i.getBoundingClientRect() : null, cs = i ? getComputedStyle(i) : null;
              const disp = (sel) => { const e = s.querySelector(sel); return e ? getComputedStyle(e).display : 'absent'; };
              return { film: document.documentElement.className, img: !!i, loaded: !!i && i.complete && i.naturalWidth > 0, onScreen: !!q && q.bottom > 0 && q.top < innerHeight && q.right > 0 && q.left < innerWidth && q.width > 0,
                shown: !!cs && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.99, moved: getComputedStyle(s.querySelector('.passes')).transform, bbox: disp('.bbox'), lbox: disp('.lbox') };
            }, n);
            if (!r.img || !r.loaded || !r.onScreen || !r.shown || (r.moved !== 'none' && r.moved !== 'matrix(1, 0, 0, 1, 0, 0)')) bad.push(`${tag} scene ${n}: resting picture ${r.img ? (r.loaded ? 'loaded' : 'not loaded') : 'missing'}, on screen ${r.onScreen}, shown ${r.shown}, moved ${r.moved} (root ${r.film})`);
            if (n === BN && (r.bbox !== 'none' || r.lbox !== 'none')) bad.push(`${tag}: the board is ${r.bbox}, the labels' box ${r.lbox}`);
          }
          const matte = asked.filter((u) => /-things-matte/.test(u));
          if (matte.length) bad.push(`${tag}: the things matte was fetched (${matte.length})`);
          await c.close();
        }
      }
      ok(!bad.length, 18, 'Scripts on but the film script blocked: 6 s in, every scene\'s resting picture shows where it belongs, scene 6\'s board and its labels\' box are not displayed and the things matte is never fetched (Chromium, WebKit, Firefox; 430x739 and 1512x860)', 'as specified', bad.slice(0, 6).join('; '));
    }
    ok(!place.length, 18, 'Scripts off: every scene\'s picture, and scene 6\'s board at rest (whole, its matte on), sits where the film puts it at rest, within 1.5 px (phones, both Safari bar layouts showing, laptop, monitor; Chromium, and 430x873 and 1512x860 in WebKit and Firefox)', `largest ${seenPlace.sort((a, b) => b[0] - a[0])[0]?.[1]}`, place.slice(0, 6).join('; '));
    ok(!inkBad.length, 18, 'Scripts off: every giant line keeps at least 85% of its ink (the thing in front hides only a little), the same sizes and engines', `least: ${seenInk.sort((a, b) => a[0] - b[0])[0]?.[1] ?? 'no cut'}`, inkBad.slice(0, 6).join('; '));
  });

  /* 17. the cut-out: where a scene has the matte of the thing lit from its first pass, the letters are hidden inside
     the thing and show outside it, and the mask sits where the picture sits (within 1 px), in both screen shapes, at
     every size, after resizes and turns, in Chromium, WebKit and Firefox */
  if (want(17)) await guarded(17, async () => {
    const pics = JSON.parse(readFileSync(join(ROOT, 'src/generated/pictures.json'), 'utf8'));
    const matted = [];
    for (let n = 1; n <= content.scenes.length; n++) for (const form of ['desktop', 'phone']) { const v = viewOf(n, form); if (v.matte && pics[v.matte]?.matte) matted.push([n, form]); }
    if (!matted.length) warn(17, 'CUT-OUT NOT TESTED', 'no scene of this build has a matte yet (the machinery is in place; the test runs as soon as one is added)');
    else {
      const scenes = [...new Set(matted.map((m) => m[0]))];
      /** the mask layers of the cut against the first pass, in px relative to the cut box */
      const cutAt = (p, n) => p.evaluate((n) => {
        const s = document.getElementById('s' + n), cut = s.querySelector('.cut'), img = s.querySelector('.passes img');
        const cs = getComputedStyle(cut), a = cut.getBoundingClientRect(), b = img.getBoundingClientRect();
        const prop = (k) => cs.getPropertyValue(k) || cs.getPropertyValue('-webkit-' + k);
        const second = (v) => v.split(/,(?![^(]*\))/)[1]?.trim() ?? '';
        return { ready: s.querySelector('.passes').classList.contains('ready'), image: prop('mask-image'), pos: second(prop('mask-position')), size: second(prop('mask-size')), want: [b.left - a.left, b.top - a.top, b.width, b.height], src: img.currentSrc };
      }, n);
      const geoBad = [], pixBad = [], seen = [];
      const checkGeo = (g, label) => {
        const px = (s) => s.split(/\s+/).map(parseFloat);
        const [x, y] = px(g.pos), [w, h] = px(g.size);
        const err = Math.max(Math.abs(x - g.want[0]), Math.abs(y - g.want[1]), Math.abs(w - g.want[2]), Math.abs(h - g.want[3]));
        if (!g.ready || !/-matte-/.test(g.image) || !(err <= 1)) geoBad.push(`${label}: ready ${g.ready}, mask ${g.pos} / ${g.size}, picture ${g.want.map((v) => v.toFixed(1)).join(' ')}`);
        return err;
      };
      let worst = 0;
      for (const engine of ['chromium', 'webkit', 'firefox']) {
        const sizes = engine === 'chromium' ? [[430, 873], [430, 739], [393, 852], [320, 568], [852, 393], [1512, 860], [2428, 1300], [1440, 900]] : [[430, 739], [1512, 860]];
        for (const [w, h] of sizes) {
          const c = await ctx(engine, { viewport: { width: w, height: h } });
          const p = await open(c, '/', `cut ${engine} ${w}x${h}`);
          for (const n of scenes) {
            if (!matted.some((m) => m[0] === n && m[1] === (w / h <= 1 ? 'phone' : 'desktop'))) continue;
            await toScene(p, n, 1);
            await p.waitForFunction((n) => document.querySelector(`#s${n} .passes`).classList.contains('ready'), n, { timeout: 8000 }).catch(() => {});
            worst = Math.max(worst, checkGeo(await cutAt(p, n), `${engine} ${w}x${h} scene ${n}`));
          }
          await c.close();
        }
        // after resizes and turns, in any order
        const c = await ctx(engine, { viewport: { width: 430, height: 739 } });
        const p = await open(c, '/', `cut turning ${engine}`);
        for (const [w, h] of [[739, 430], [430, 739], [1512, 860], [393, 852], [852, 393], [1000, 1001], [1512, 860], [430, 873]]) {
          await p.setViewportSize({ width: w, height: h });
          await settle(p, 300);
          for (const n of scenes) {
            if (!matted.some((m) => m[0] === n && m[1] === (w / h <= 1 ? 'phone' : 'desktop'))) continue;
            await toScene(p, n, 1);
            await p.waitForFunction((n) => document.querySelector(`#s${n} .passes`).classList.contains('ready'), n, { timeout: 8000 }).catch(() => {});
            worst = Math.max(worst, checkGeo(await cutAt(p, n), `${engine} turned to ${w}x${h} scene ${n}`));
          }
        }
        await c.close();
        // pixels: the letters moved onto the thing (the cut covers the whole stage, so it stays where the picture is),
        // the pictures hidden. Inside the thing (where its matte, through the frame's own mask, is solid) the letters
        // must be hidden; outside it (where the matte is empty) they must show. The matte is read here from its own
        // file and drawn at the picture's box, so this does not trust the mask it checks.
        for (const [w, h] of [[1512, 860], [430, 873]]) {
          const form = w / h <= 1 ? 'phone' : 'desktop';
          for (const n of scenes) {
            if (!matted.some((m) => m[0] === n && m[1] === form)) continue;
            const view = viewOf(n, form), matteFile = pics[view.matte].files[0].webp;
            const c = await ctx(engine, { viewport: { width: w, height: h }, bypassCSP: true });
            const p = await open(c, '/', `cut pixels ${engine} ${w}x${h}`);
            await toScene(p, n, 1);
            await p.waitForFunction((n) => document.querySelector(`#s${n} .passes`).classList.contains('ready'), n, { timeout: 8000 }).catch(() => {});
            await settle(p, 600);
            // the matte's solid box on screen, and the frame's own mask as the browser draws it (not under test)
            const geo = await p.evaluate(async ([n, file]) => {
              const s = document.getElementById('s' + n), img = s.querySelector('.passes img'), b = img.getBoundingClientRect();
              const m = new Image(); m.src = file; await m.decode();
              const cv = document.createElement('canvas'); cv.width = innerWidth; cv.height = innerHeight;
              const g = cv.getContext('2d'); g.drawImage(m, b.left, b.top, b.width, b.height);
              const d = g.getImageData(0, 0, cv.width, cv.height).data;
              let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
              for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3] > 240) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
              const a = []; for (let i = 3; i < d.length; i += 4) a.push(d[i]);
              return { box: [x0, y0, x1, y1], alpha: a, frame: getComputedStyle(img).maskImage || getComputedStyle(img).webkitMaskImage || 'none', img: [b.left, b.top, b.width, b.height] };
            }, [n, matteFile]);
            const style = (css) => p.evaluate((css) => { let s = document.getElementById('t-cut'); if (!s) { s = document.createElement('style'); s.id = 't-cut'; document.head.append(s); } s.textContent = css; }, css);
            // the letters across the thing's upper left edge: part inside, part outside
            const [bx0, by0, bx1, by1] = geo.box;
            const move = `#s${n} .cut .big{left:${Math.max(0, bx0 - (bx1 - bx0) * 0.25).toFixed(0)}px !important;top:${(by0 + (by1 - by0) * 0.15).toFixed(0)}px !important;color:#fff !important}`;
            const bare = `#s${n} .passes,#s${n} .lbox,#s${n} .shade,#s${n} .words,#top,#frame,.bottom-sw{visibility:hidden !important}`;
            await style(bare + move); await settle(p, 200);
            const A = await p.screenshot();
            await style(bare + move + `#s${n} .cut{-webkit-mask:none !important;mask:none !important}`); await settle(p, 200);
            const Bs = await p.screenshot();
            // the frame's own mask, drawn by the browser on a white box at the picture's place
            await style(`#film,#top,#frame,.bottom-sw{visibility:hidden !important}`);
            await p.evaluate(([b, mask]) => { const d = document.createElement('div'); d.id = 't-frame'; Object.assign(d.style, { position: 'fixed', left: b[0] + 'px', top: b[1] + 'px', width: b[2] + 'px', height: b[3] + 'px', background: '#fff', zIndex: 99, maskImage: mask, webkitMaskImage: mask }); document.body.append(d); }, [geo.img, geo.frame]);
            await settle(p, 200);
            const F = await p.screenshot();
            const r = await labPage.evaluate(async ([a64, b64, f64, alpha, decode]) => {
              const dec = (0, eval)(decode);
              const [a, b, f] = await Promise.all([dec(a64), dec(b64), dec(f64)]);
              let inside = 0, insideHid = 0, outside = 0, outsideShown = 0;
              for (let i = 0, j = 0; i < a.data.length; i += 4, j++) {
                if (b.data[i] < 160) continue;                           // only where a letter is drawn (whole letters)
                const m = (alpha[j] / 255) * (f.data[i] / 255);          // the thing, as far as its frame shows it
                if (m > 0.97) { inside++; if (a.data[i] < 24) insideHid++; }
                else if (alpha[j] < 3) { outside++; if (a.data[i] >= 160) outsideShown++; }
              }
              return { inside, insideHid, outside, outsideShown };
            }, [A.toString('base64'), Bs.toString('base64'), F.toString('base64'), geo.alpha, decode]);
            const label = `${engine} ${w}x${h} scene ${n}`;
            seen.push(`${label} ${(100 * r.insideHid / Math.max(1, r.inside)).toFixed(1)}% hidden inside, ${(100 * r.outsideShown / Math.max(1, r.outside)).toFixed(1)}% shown outside`);
            if (r.inside < 500 || r.outside < 500) pixBad.push(`${label}: too few letter pixels to judge (${r.inside} inside, ${r.outside} outside)`);
            else if (r.insideHid < 0.99 * r.inside || r.outsideShown < 0.99 * r.outside) pixBad.push(`${label}: ${r.insideHid} of ${r.inside} hidden inside, ${r.outsideShown} of ${r.outside} shown outside`);
            await c.close();
          }
        }
      }
      ok(!geoBad.length, 17, `Cut-out placement (scenes ${scenes.join(', ')}): the matte sits on the picture within 1 px, at every size, after resizes and turns (Chromium, WebKit, Firefox)`, `largest error ${worst.toFixed(2)} px`, geoBad.slice(0, 6).join('; '));
      // how much of a giant line the thing in front hides, as the film shows it at rest: the hidden part may reach at
      // most the lowest 15% of the capitals (17% allowed for the soft edge), at every listed phone size and bar state
      {
        const deepBad = [];
        let deepest = 0, deepAt = '';
        const runs = [...[[430, 873], [393, 852], [320, 568], [834, 1194], [1512, 860], [852, 393]].map(([w, h]) => ({ w, h, css: '', label: `${w}x${h}` })),
          ...BARS.map((bar) => ({ ...barState(bar, 'showing'), label: barLabel(bar, 'showing') }))];
        for (const run of runs) {
          const c = await ctx('chromium', { viewport: { width: run.w, height: run.h }, bypassCSP: true });
          if (run.css) await c.addInitScript(INJECT, run.css);
          const p = await open(c, '/', `cut depth ${run.label}`);
          for (const n of scenes) {
            await toScene(p, n, 1);
            await p.waitForFunction((n) => document.querySelector(`#s${n} .passes`).classList.contains('ready'), n, { timeout: 8000 }).catch(() => {});
            // each line's text box, baseline and capitals' height, from the browser's own metrics of the face
            const lines = await p.evaluate((n) => {
              const g2 = document.createElement('canvas').getContext('2d');
              return [...document.querySelectorAll(`#s${n} .big .pl`)].map((e) => {
                const g = document.createRange(); g.selectNodeContents(e); const t = g.getBoundingClientRect();
                const cs = getComputedStyle(e), fs = parseFloat(cs.fontSize), line = (innerWidth / innerHeight <= 1 ? e : e.closest('.ln')).getBoundingClientRect();
                g2.font = `400 ${fs}px "Site Display"`; const m = g2.measureText('H');
                const base = line.top + (parseFloat(cs.lineHeight) - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
                return { box: [t.left, t.top, t.width, t.height], base, cap: m.actualBoundingBoxAscent };
              });
            }, n);
            const style = (x) => p.evaluate((x) => { let s = document.getElementById('t-deep'); if (!s) { s = document.createElement('style'); s.id = 't-deep'; document.head.append(s); } s.textContent = x; }, x);
            const bare = `#s${n} .passes,#s${n} .lbox,#s${n} .shade,#s${n} .words,#top,#frame,.bottom-sw{visibility:hidden !important}#s${n} .big{color:#fff !important}`;
            await style(bare); await settle(p, 150);
            const A = await p.screenshot();
            await style(bare + `#s${n} .cut{-webkit-mask:none !important;mask:none !important}`); await settle(p, 150);
            const Bs = await p.screenshot();
            await style('');
            const res = await labPage.evaluate(async ([a64, b64, lines, decode]) => {
              const dec = (0, eval)(decode); const [a, b] = await Promise.all([dec(a64), dec(b64)]);
              return lines.map(({ box: [x, y, w, h], base, cap }) => {
                let top = Infinity;
                for (let yy = Math.max(0, Math.round(y)); yy < Math.min(a.height, Math.round(y + h)); yy++) for (let xx = Math.max(0, Math.round(x)); xx < Math.min(a.width, Math.round(x + w)); xx++) {
                  const i = (yy * a.width + xx) * 4;
                  if (b.data[i] >= 160 && a.data[i] < 80) { top = Math.min(top, yy); break; }
                }
                return top === Infinity ? 0 : (base - top) / cap;
              });
            }, [A.toString('base64'), Bs.toString('base64'), lines, decode]);
            res.forEach((d, i) => {
              if (d > deepest) { deepest = d; deepAt = `${run.label} scene ${n} line ${i + 1}`; }
              if (d > 0.17) deepBad.push(`${run.label} scene ${n} line ${i + 1}: the thing hides up to ${(100 * d).toFixed(1)}% of the capitals`);
            });
          }
          await c.close();
        }
        ok(!deepBad.length, 17, 'The thing in front hides at most the lowest 15% of a giant line\'s capitals (17% allowed for the soft edge), as the film shows each scene at rest, at the phone sizes, every bar layout showing, 834x1194, 1512x860 and 852x393 (Chromium)', `deepest ${(100 * deepest).toFixed(1)}% (${deepAt || 'nothing hidden'})`, deepBad.slice(0, 6).join('; '));
      }
      ok(!pixBad.length, 17, `Cut-out pixels (scenes ${scenes.join(', ')}): letters moved onto the thing are hidden inside it and show outside it, at least 99% each (Chromium, WebKit, Firefox; laptop and phone)`, seen.join('; '), pixBad.join('; '));
    }
  });

  /* 19 to 23. scene 6, the board on the floor: placed as the picture, hidden inside the things, no tell before each
     step, clear of the giant words, its two labels readable and on screen, still with less motion */
  const BOARD_N = content.scenes.findIndex((s) => s.board) + 1;
  const boardForms = BOARD_N ? ['desktop', 'phone'].filter((f) => viewOf(BOARD_N, f).things) : [];
  const wantBoard = [19, 20, 21, 22, 23, 24].some(want);
  if (wantBoard && !boardForms.length) warn(19, 'BOARD NOT TESTED', 'no scene of this build has a board with a things matte');
  /** Scroll scene 6 to a point of its film: u, a share of its scroll (0 its top, 1 its end), or pre, the half screen
   *  before its top (0 the moment it comes on, 1 its top). Waits for its pictures and for the board to show. */
  async function toBoard(p, at) {
    await p.evaluate(([n, at]) => {
      const s = document.getElementById('s' + n), vh = document.querySelector('.probe')?.offsetHeight || innerHeight;
      scrollTo(0, Math.round(at.pre !== undefined ? s.offsetTop - vh / 2 + (at.pre * vh) / 2 : s.offsetTop + at.u * Math.max(0, s.offsetHeight - vh)));
    }, [BOARD_N, at]);
    await p.waitForFunction((n) => {
      const s = document.getElementById('s' + n), b = s.querySelector('.bbox');
      return [...s.querySelectorAll('.passes img')].every((i) => i.complete && i.naturalWidth > 0) && b && b.isConnected && getComputedStyle(b).visibility !== 'hidden';
    }, BOARD_N, { timeout: 8000 }).catch(() => {});
    await settle(p, 600);
  }
  const styleIt = (p, css) => p.evaluate((css) => { let s = document.getElementById('t-board'); if (!s) { s = document.createElement('style'); s.id = 't-board'; document.head.append(s); } s.textContent = css; }, css);
  const QUIET = '#top,#frame,.bottom-sw,.marks{visibility:hidden !important}';
  /** the board's box and the picture's box (first pass, or the resting picture with scripts off), relative to the layer */
  const boxes = (p) => p.evaluate((n) => {
    const s = document.getElementById('s' + n), l = s.querySelector('.layer').getBoundingClientRect();
    const r = (e) => { const b = e.getBoundingClientRect(); return [b.left - l.left, b.top - l.top, b.width, b.height]; };
    const b = s.querySelector('.bbox'), lb = s.querySelector('.lbox');
    return { board: b && b.isConnected ? r(b) : null, img: r(s.querySelector('.passes img')),
      // the labels' own box: just after the pictures in the layer, the board's --bw
      labels: lb && lb.isConnected ? r(lb) : null, after: !!lb && lb.parentElement === s.querySelector('.layer') && lb.previousElementSibling === s.querySelector('.passes'),
      bw: [b, lb].map((e) => (e ? getComputedStyle(e).getPropertyValue('--bw').trim() : '')) };
  }, BOARD_N);
  /** the things matte of the form on screen: its address (from the board's mask) */
  const matteUrl = (p) => p.evaluate((n) => {
    const svg = [...document.querySelectorAll(`#s${n} svg.board`)].find((e) => getComputedStyle(e).display !== 'none');
    const cs = svg ? getComputedStyle(svg) : null, m = cs ? (cs.getPropertyValue('mask-image') || cs.getPropertyValue('-webkit-mask-image')) : '';
    return (/url\("?([^")]+)"?\)/.exec(m) || [])[1] ?? null;
  }, BOARD_N);
  /** In the lab: the matte drawn where the board's box is, as alpha per screen pixel (0 to 255), w x h. */
  const matteLab = `async (url64, box, w, h) => { const i = new Image(); i.src = 'data:image/webp;base64,' + url64; await i.decode();
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    g.drawImage(i, box[0], box[1], box[2], box[3]); const d = g.getImageData(0, 0, w, h).data;
    const a = new Uint8Array(w * h); for (let k = 0; k < w * h; k++) a[k] = d[k * 4 + 3]; return a; }`;
  const matteBytes = (url) => readFileSync(join(DIST, new URL(url, BASE).pathname)).toString('base64');
  /** each live trace's resting main run, as built, per drawing: { bd: { stand: 'M..', ... }, bp: {...} } */
  const traceRest = {};
  for (const m of readFileSync(join(DIST, 'index.html'), 'utf8').matchAll(/<svg class="board (b[dp])"[\s\S]*?<\/svg>/g)) {
    traceRest[m[1]] = {};
    for (const g of m[0].matchAll(/<g class="tr t-(\w+)"[\s\S]*?<\/g>/g)) traceRest[m[1]][g[1]] = /class="co wl" d="([^"]*)"/.exec(g[0])[1];
  }
  /** in the page: for each live trace, whether its head has reached its pad, how far it has come along its main run
   *  (picture px), and how far along that run each side line reaches (its end's nearest place on the run) */
  const traceState = (p, rest) => p.evaluate(([n, rest]) => {
    const svg = [...document.querySelectorAll(`#s${n} svg.board`)].find((e) => getComputedStyle(e).display !== 'none');
    const k = [...svg.classList].find((c) => /^b[dp]$/.test(c));
    const pts = (d) => [...(d || '').matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((m) => [+m[1], +m[2]]);
    const along = (line, q) => { let best = Infinity, at = 0, acc = 0; for (let i = 1; i < line.length; i++) { const a = line[i - 1], b = line[i], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, t = Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / (L * L))), d = Math.hypot(a[0] + dx * t - q[0], a[1] + dy * t - q[1]); if (d < best) { best = d; at = acc + t * L; } acc += L; } return at; };
    return Object.fromEntries(['stand', 'coin', 'phone'].map((t) => {
      const g = svg.querySelector('.t-' + t), main = pts(rest[k][t]), co = g.querySelector('.co').getAttribute('d') || '';
      const head = co ? along(main, pts(co).pop()) : 0;
      const sides = [...g.querySelectorAll('.sd')].map((e) => { const q = pts(e.getAttribute('d')); return q.length ? along(main, q[q.length - 1]) : -1; });
      return [t, { arrived: co === rest[k][t], head, sides }];
    }));
  }, [BOARD_N, rest]);

  // 19. the board's box is the picture's box, film and scripts off, every listed size and bar state
  if (want(19) && boardForms.length) await guarded(19, async () => {
    const bad = [], seen = [];
    const runs = [...VIEWPORTS, [1000, 1000], [834, 1194]].map(([w, h]) => ({ engine: 'chromium', w, h, css: '', label: `${w}x${h}` }))
      .concat(BARS.flatMap((bar) => ['away', 'showing'].map((state) => ({ engine: 'chromium', ...barState(bar, state), label: barLabel(bar, state) }))))
      .concat(['webkit', 'firefox'].flatMap((engine) => [[430, 873], [1512, 860]].map(([w, h]) => ({ engine, w, h, css: '', label: `${w}x${h}` }))));
    for (const run of runs) {
      const { engine, w, h, css } = run, tag = `${engine} ${run.label}`;
      const c = await ctx(engine, { viewport: { width: w, height: h }, bypassCSP: !!css });
      if (css) await c.addInitScript(INJECT, css);
      const p = await open(c, '/', `board box ${tag}`);
      await toBoard(p, { u: 1 });
      const f = await boxes(p);
      const off = await ctx(engine, { viewport: { width: w, height: h }, bypassCSP: true, javaScriptEnabled: false });
      const po = await open(off, '/', `board box scripts off ${tag}`);
      if (css) await styleIt(po, css);
      await po.evaluate((n) => document.getElementById('s' + n).scrollIntoView(), BOARD_N);
      await settle(po, 200);
      const o = await boxes(po);
      for (const [mode, b] of [['film', f], ['scripts off', o]]) {
        if (!b.board) { bad.push(`${tag} ${mode}: no board`); continue; }
        if (!b.labels || !b.after) { bad.push(`${tag} ${mode}: no label box just after the pictures`); continue; }
        const err = Math.max(...b.board.map((v, k) => Math.abs(v - b.img[k])), ...b.labels.map((v, k) => Math.abs(v - b.img[k])));
        seen.push([err, `${tag} ${mode} ${err.toFixed(2)} px`]);
        if (err > 0.5) bad.push(`${tag} ${mode}: board ${b.board.map((v) => v.toFixed(1)).join(', ')}, labels ${b.labels.map((v) => v.toFixed(1)).join(', ')}, picture ${b.img.map((v) => v.toFixed(1)).join(', ')}`);
        if (Math.abs(parseFloat(b.bw[0]) - parseFloat(b.bw[1])) > 1e-3) bad.push(`${tag} ${mode}: --bw ${b.bw.join(' / ')}`);
      }
      await c.close(); await off.close();
    }
    ok(!bad.length, 19, `Scene ${BOARD_N}: the board's box and its labels' box (just after the pictures, the same --bw) are the picture's box within 0.5 px, with the film and with scripts off, at every listed size, 1000x1000, 834x1194 and every bar state (Chromium; 430x873 and 1512x860 in WebKit and Firefox)`, `largest ${seen.sort((a, b) => b[0] - a[0])[0]?.[1]}`, bad.slice(0, 6).join('; '));
  });

  // 19. the labels never show before the scene's pictures, and follow the board in and out: a reload in the middle of
  // the scene, every frame of its first 2.5 s; and the scene let go and built again
  if (want(19) && boardForms.length) await guarded(19, async () => {
    const bad = [], seen = [], noReturn = [];
    const WATCH = (n) => {
      const out = []; window.__lab = out;
      const op = (e, stop) => { let o = 1; for (let x = e; x && x !== stop; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.visibility === 'hidden' || cs.display === 'none') return 0; o *= +cs.opacity; } return o; };
      const tick = () => {
        const s = document.getElementById('s' + n), pa = s && s.querySelector('.passes'), lb = s && s.querySelector('.lbox'), bb = s && s.querySelector('.bbox');
        if (pa) {
          const labs = lb && lb.isConnected ? Math.max(0, ...[...lb.querySelectorAll('.blab')].map((e) => op(e, s))) : 0;
          out.push([performance.now(), op(pa, s), labs, bb && bb.isConnected ? (getComputedStyle(bb).visibility === 'hidden' ? 0 : 1) : 0, lb && lb.isConnected ? (getComputedStyle(lb).visibility === 'hidden' ? 0 : 1) : 0]);
        }
        if (out.length < 400) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    for (const [engine, w, h] of [['chromium', 430, 739], ['chromium', 1512, 860], ['webkit', 430, 739], ['webkit', 1512, 860], ['firefox', 1512, 860]]) {
      const tag = `${engine} ${w}x${h}`;
      const c = await ctx(engine, { viewport: { width: w, height: h } });
      const p = await open(c, '/', `labels reload ${tag}`);
      await toBoard(p, { u: 1 });
      await settle(p, 400);   // the film remembers the place
      await c.addInitScript(WATCH, BOARD_N);
      await p.reload({ waitUntil: 'load' });
      // a browser that drops the page's history state on a reload (Firefox here) starts at the top: then the scene is
      // reached by scrolling, and the frames watched are its first arrival
      if (await p.evaluate((n) => !document.getElementById('s' + n).classList.contains('on'), BOARD_N)) { noReturn.push(tag); await toBoard(p, { u: 1 }); }
      await settle(p, 2500);
      // then until the board shows (a slow engine may need longer for the things matte), and read the rest state
      await p.waitForFunction((n) => { const b = document.querySelector(`#s${n} .bbox`); return b && b.isConnected && getComputedStyle(b).visibility !== 'hidden'; }, BOARD_N, { timeout: 8000 }).catch(() => {});
      await settle(p, 600);
      const rows = await p.evaluate(() => window.__lab || []);
      const restNow = await p.evaluate((n) => { const s = document.getElementById('s' + n), l = s.querySelector('.lbox'); if (!l || !l.isConnected || getComputedStyle(l).visibility === 'hidden') return 0; let o = 1; for (let x = l; x && x !== s; x = x.parentElement) o *= +getComputedStyle(x).opacity; return Math.min(o, ...[...l.querySelectorAll('.blab')].map((e) => +getComputedStyle(e).opacity)); }, BOARD_N);
      const ahead = rows.filter((r) => r[2] > r[1] + 0.05);
      const apart = rows.filter((r) => r[3] !== r[4]);
      const end = rows[rows.length - 1];
      seen.push(`${tag} ${rows.length} frames`);
      if (rows.length < 30) bad.push(`${tag}: only ${rows.length} frames watched`);
      if (ahead.length) bad.push(`${tag}: a label at ${ahead[0][2].toFixed(2)} while the pictures are at ${ahead[0][1].toFixed(2)} (${ahead.length} frames)`);
      if (apart.length) bad.push(`${tag}: the label box ${apart[0][4] ? 'shown' : 'hidden'} while the board is ${apart[0][3] ? 'shown' : 'hidden'} (${apart.length} frames)`);
      if (restNow < 0.999) bad.push(`${tag}: after the reload the labels are not at rest (${restNow}; last frame watched ${end ? end[2] : 'none'})`);
      // let the scene go (far away) and come back: the box leaves and returns with the board
      await p.evaluate(() => scrollTo(0, 0)); await settle(p, 600);
      const gone = await p.evaluate((n) => ({ b: !!document.querySelector(`#s${n} .bbox`)?.isConnected, l: !!document.querySelector(`#s${n} .lbox`)?.isConnected }), BOARD_N);
      if (gone.b !== gone.l) bad.push(`${tag}: at the top the board ${gone.b ? 'is in' : 'is out'}, the labels ${gone.l ? 'in' : 'out'}`);
      await toBoard(p, { u: 1 });
      const back = await boxes(p);
      if (!back.board || !back.labels || !back.after || Math.max(...back.labels.map((v, k) => Math.abs(v - back.img[k]))) > 0.5) bad.push(`${tag}: back in the scene the label box is not on the picture`);
      await c.close();
    }
    ok(!bad.length, 19, `Scene ${BOARD_N}: after a reload in the middle of the scene no label shows ahead of the scene's pictures and the label box is shown or hidden exactly with the board, every frame watched (about the first 6 s); then at rest; it leaves and returns with the board (Chromium, WebKit 430x739 and 1512x860; Firefox 1512x860)`, seen.join(', ') + (noReturn.length ? `; no return to the scene after the reload in ${noReturn.join(', ')} (reached by scrolling)` : ''), bad.slice(0, 6).join('; '));
  });

  // 25. the film gives up (its safety net): an error thrown while it runs hands back the plain page whole and the film
  // stops for good. Given up before any scroll, in scene 2 half way through its light, in scene 6 at pass 2's hold and
  // at rest, and in scene 7; checked at once, 1.5 s on and after a scroll through the whole page and back
  if (want(25)) await guarded(25, async () => {
    const bad = [], seen = [];
    const html = readFileSync(join(DIST, 'index.html'), 'utf8'), restD = {};
    for (const m of html.matchAll(/<svg class="board (b[dp])"[\s\S]*?<\/svg>/g)) restD[m[1]] = [...m[0].matchAll(/<path[^>]*?\sd="([^"]*)"/g)].map((x) => x[1]);
    const INJECTED = 'check: the film gives up';
    const NS = content.scenes.length, BN = content.scenes.findIndex((s) => s.board) + 1;
    /** every scene's picture relative to its layer, and how many pictures each scene holds */
    const pics = (p) => p.evaluate(() => [...document.querySelectorAll('#film .scene')].map((s) => {
      const l = s.querySelector('.layer').getBoundingClientRect(), imgs = [...s.querySelectorAll('.passes img')];
      const r = imgs[0] ? imgs[0].getBoundingClientRect() : null;
      return { n: imgs.length, still: !!imgs[0] && imgs[0].classList.contains('still'), r: r ? [r.left - l.left, r.top - l.top, r.width, r.height] : null };
    }));
    /** the state checks (a), (b), (c), (e); full: the board's fade must be over */
    const judge = async (p, tag, ref, onScene, full) => {
      const P = await pics(p);
      P.forEach((x, i) => {
        if (x.n !== 1 || !x.still || !x.r) { bad.push(`${tag} scene ${i + 1}: ${x.n} pictures (resting one ${x.still})`); return; }
        const err = Math.max(...x.r.map((v, k) => Math.abs(v - ref[i][k])));
        seen.push(err);
        if (err > 1.5) bad.push(`${tag} scene ${i + 1}: picture ${err.toFixed(1)} px from the scripts off place`);
      });
      const st = await p.evaluate(([n, restD]) => {
        const s = document.getElementById('s' + n), pa = s.querySelector('.passes'), b = s.querySelector('.bbox'), l = s.querySelector('.lbox');
        const svg = [...s.querySelectorAll('svg.board')].filter((e) => getComputedStyle(e).display !== 'none');
        const k = svg[0] ? [...svg[0].classList].find((c) => /^b[dp]$/.test(c)) : null;
        const ds = svg[0] ? [...svg[0].querySelectorAll('path')].map((e) => e.getAttribute('d')) : [];
        const cs = svg[0] ? getComputedStyle(svg[0]) : null, mask = cs ? cs.getPropertyValue('mask-image') || cs.getPropertyValue('-webkit-mask-image') : '';
        const op = (e) => { let o = 1; for (let x = e; x && x !== s; x = x.parentElement) o *= +getComputedStyle(x).opacity; return o; };
        const im = pa.querySelector('img'), pic = im ? im.getBoundingClientRect() : { left: NaN, top: NaN, width: NaN, height: NaN }, lr = l ? l.getBoundingClientRect() : null, br = b ? b.getBoundingClientRect() : null;
        const off = (r) => (r ? Math.max(Math.abs(r.left - pic.left), Math.abs(r.top - pic.top), Math.abs(r.width - pic.width), Math.abs(r.height - pic.height)) : Infinity);
        const styled = [...document.querySelectorAll('#film, #film *, #top, #top *')].filter((e) => e.hasAttribute('style')).map((e) => e.tagName + '.' + (e.getAttribute('class') || ''));
        const vh = innerHeight, mid = scrollY + vh / 2, on = [...document.querySelectorAll('#film .scene')].findIndex((x) => x.offsetTop <= mid && mid < x.offsetTop + x.offsetHeight) + 1;
        const labs = l ? [...l.querySelectorAll('.blab')] : [];
        return {
          root: document.documentElement.className, boardIn: !!b && b.parentElement === pa, labelsAfter: !!l && l.parentElement === s.querySelector('.layer') && l.previousElementSibling === pa,
          shown: svg.length, whole: k ? ds.length === restD[k].length && ds.every((d, i) => d === restD[k][i]) : false, matte: /-matte-/.test(mask),
          labs: labs.length, labsOwn: labs.filter((e) => +getComputedStyle(e).opacity < 0.999 || getComputedStyle(e).visibility === 'hidden').length,
          labsFull: labs.filter((e) => op(e) < 0.999).length, boardFull: b ? op(b) : 0, offL: off(lr), offB: off(br), styled, on,
        };
      }, [BN, restD]);
      if (!/\bnofilm\b/.test(st.root) || /\bfilm\b/.test(st.root.replace('film-page', ''))) bad.push(`${tag}: the root is "${st.root}"`);
      if (!st.boardIn || !st.labelsAfter || st.shown !== 1 || !st.whole || !st.matte) bad.push(`${tag} scene ${BN}: board in the pictures ${st.boardIn}, labels just after them ${st.labelsAfter}, ${st.shown} drawings shown, lines whole ${st.whole}, matte ${st.matte}`);
      if (st.labs !== 2 + BOARD_NAMES.length || st.labsOwn || !(st.offL <= 1.5) || !(st.offB <= 1.5)) bad.push(`${tag} scene ${BN}: ${st.labs} labels, ${st.labsOwn} not at rest, label box ${st.offL.toFixed(1)} px and board ${st.offB.toFixed(1)} px from the picture`);
      if (full && (st.labsFull || st.boardFull < 0.999)) bad.push(`${tag} scene ${BN}: after the fade ${st.labsFull} labels and the board at ${st.boardFull.toFixed(2)} not at full strength`);
      if (st.styled.length) bad.push(`${tag}: inline styles left on ${[...new Set(st.styled)].slice(0, 4).join(', ')} (${st.styled.length})`);
      if (st.on !== onScene) bad.push(`${tag}: scene ${st.on} on screen, scene ${onScene} was`);
      // the plain page restores its own place on a reload, its clock runs, and an attribute an outsider added stays
      const more = await p.evaluate(() => ({ restore: history.scrollRestoration, clock: document.querySelector('#top .clock .time')?.textContent ?? '', outsider: ['top', 's2'].map((id) => document.getElementById(id)?.getAttribute('data-outsider')) }));
      if (more.restore !== 'auto') bad.push(`${tag}: scroll restoration is "${more.restore}"`);
      if (!/^\d\d:\d\d:\d\d$/.test(more.clock)) bad.push(`${tag}: the clock shows "${more.clock}"`);
      if (more.outsider.some((v) => v !== '1')) bad.push(`${tag}: an outsider's attribute was taken off (#top, #s2: ${more.outsider.join(', ')})`);
    };
    /** (d) nothing still running: two pictures of the screen 1 s apart, the clock hidden */
    const still = async (p, tag) => {
      await p.addStyleTag({ content: '.clock{visibility:hidden !important}' });
      await settle(p, 100);
      const a = await p.screenshot(); await settle(p, 1000); const b = await p.screenshot();
      if (!a.equals(b)) {
        const n = await labPage.evaluate(async ([a64, b64, decode]) => { const dec = (0, eval)(decode); const [x, y] = await Promise.all([dec(a64), dec(b64)]); let n = 0; for (let i = 0; i < x.data.length; i += 4) if (x.data[i] !== y.data[i] || x.data[i + 1] !== y.data[i + 1] || x.data[i + 2] !== y.data[i + 2]) n++; return n; }, [a.toString('base64'), b.toString('base64'), decode]);
        bad.push(`${tag}: the screen changes over 1 s (${n} pixels)`);
      }
    };
    // 'early': the error comes from the film's own first read of the page (the bottom safe area probe, as the module
    // starts), before it has started its clock or its scroll work
    const moments = [['at the very start', 1, null, true], ['before any scroll', 1, null], ['scene 2 half way', 2, (p) => toScene(p, 2, 0.5)], ["scene 6 at pass 2's hold", BN, (p) => toBoard(p, { u: 0.4 })], ['scene 6 at rest', BN, (p) => toBoard(p, { u: 1 })], ['scene 7', NS, (p) => toScene(p, NS, 1)]];
    const EARLY = (msg) => {
      const d = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
      let done = false;
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get() { if (!done && this.classList && this.classList.contains('probe-b')) { done = true; throw new Error(msg); } return d.get.call(this); } });
      // an attribute an outsider (a translator, a reader's extension) adds, which the give-up must leave alone
      const mark = () => { for (const id of ['top', 's2']) document.getElementById(id)?.setAttribute('data-outsider', '1'); };
      if (document.readyState === 'loading') document.addEventListener('readystatechange', mark, { once: true }); else mark();
    };
    for (const engine of ['chromium', 'webkit', 'firefox']) {
      for (const [w, h] of [[430, 739], [1512, 860]]) {
        // the scripts off page: where every scene's picture sits
        const off = await ctx(engine, { viewport: { width: w, height: h }, javaScriptEnabled: false });
        const po = await open(off, '/', `give up reference ${engine} ${w}x${h}`);
        await settle(po, 300);
        const ref = (await pics(po)).map((x) => x.r);
        await off.close();
        for (const [name, onScene, go, early] of moments) {
          const tag = `${engine} ${w}x${h} ${name}`;
          const c = await ctx(engine, { viewport: { width: w, height: h }, bypassCSP: true });
          if (early) await c.addInitScript(EARLY, INJECTED);
          const p = await c.newPage(), errs = [];
          p.on('pageerror', (e) => { if (!String(e).includes(INJECTED)) errs.push(String(e).slice(0, 160)); });
          p.on('console', (m) => { if (m.type() === 'error' && !m.text().includes(INJECTED)) errs.push(m.text().slice(0, 160)); });
          await p.goto(BASE + '/', { waitUntil: 'load' });
          await settle(p, 300);
          if (go) await go(p);
          if (!early) {
            await p.evaluate(() => { for (const id of ['top', 's2']) document.getElementById(id)?.setAttribute('data-outsider', '1'); });
            // a real error, thrown where the film runs
            await p.evaluate((msg) => setTimeout(() => { throw new Error(msg); }), INJECTED);
          }
          await p.waitForFunction(() => document.documentElement.classList.contains('nofilm'), null, { timeout: 5000 }).catch(() => bad.push(`${tag}: the film never gave up`));
          await judge(p, `${tag}, at once`, ref, onScene, false);
          await settle(p, 1500);
          await judge(p, `${tag}, 1.5 s on`, ref, onScene, false);
          await settle(p, 600);
          await still(p, `${tag}, 2 s on`);
          // through the whole page and back
          for (let n = 1; n <= NS; n++) { await p.evaluate((n) => document.getElementById('s' + n).scrollIntoView(), n); await settle(p, 250); }
          await p.evaluate((n) => document.getElementById('s' + n).scrollIntoView(), onScene);
          await p.waitForFunction(() => [...document.querySelectorAll('#film .scene')].filter((s) => { const r = s.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }).every((s) => { const i = s.querySelector('.passes img'); return i && i.complete && i.naturalWidth > 0; }), null, { timeout: 8000 }).catch(() => {});
          await p.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'), null, { timeout: 8000 }).catch(() => {});
          await settle(p, 400);
          await judge(p, `${tag}, after a scroll through the page`, ref, onScene, true);
          await still(p, `${tag}, after a scroll through the page`);
          if (errs.length) bad.push(`${tag}: ${errs.slice(0, 2).join(' | ')}`);
          await c.close();
        }
      }
    }
    seen.sort((a, b) => b - a);
    ok(!bad.length, 25, 'The film gives up (an error thrown by the film\'s very first read of the page as it starts, before any scroll, in scene 2 half way, in scene 6 at pass 2\'s hold and at rest, in scene 7): at once, 1.5 s on and after a scroll through the page and back, no scene is empty and each holds only its resting picture, where the scripts off page puts it; scene 6\'s board whole, its matte on, its five labels at rest on the picture\'s box (at full strength once the fade is over); no inline style in the film or the border; the scene that was on screen is on screen; scroll restoration back to auto, the clock running, an attribute an outsider added left alone; the screen still over 1 s (clock hidden); no other error (Chromium, WebKit, Firefox; 430x739 and 1512x860)', `largest picture offset ${(seen[0] ?? 0).toFixed(2)} px`, [...new Set(bad)].slice(0, 8).join('; '));
  });

  // 20. behind the things: the board forced to one flat colour shows nothing inside the things matte
  if (want(20) && boardForms.length) await guarded(20, async () => {
    const bad = [], seen = [];
    const FLAT = `#s${BOARD_N} .board *{stroke:#ff00ff !important;fill:#ff00ff !important;stroke-opacity:1 !important;fill-opacity:1 !important;opacity:1 !important}#s${BOARD_N} .blab{visibility:hidden !important}`;
    for (const engine of ['chromium', 'webkit', 'firefox']) {
      for (const [w, h] of [[430, 739], [1512, 860]]) {
        const tag = `${engine} ${w}x${h}`;
        const c = await ctx(engine, { viewport: { width: w, height: h }, bypassCSP: true });
        const p = await open(c, '/', `behind ${tag}`);
        await toBoard(p, { u: 1 });
        const url = await matteUrl(p), b = (await boxes(p)).board;
        if (!url || !b) { bad.push(`${tag}: no board or no matte`); await c.close(); continue; }
        const lay = await p.evaluate((n) => { const l = document.querySelector(`#s${n} .layer`).getBoundingClientRect(); return [l.left, l.top]; }, BOARD_N);
        const box = [b[0] + lay[0], b[1] + lay[1], b[2], b[3]];
        await styleIt(p, QUIET + `#s${BOARD_N} .bbox,#s${BOARD_N} .lbox{visibility:hidden !important}`); await settle(p, 150);
        const A = await p.screenshot();
        await styleIt(p, QUIET + FLAT); await settle(p, 150);
        const B = await p.screenshot();
        const r = await labPage.evaluate(async ([a64, b64, m64, box, decode, matte]) => {
          const dec = (0, eval)(decode); const [a, b] = await Promise.all([dec(a64), dec(b64)]);
          const al = await (0, eval)(matte)(m64, box, a.width, a.height);
          let n = 0, hid = 0, flat = 0;
          for (let y = 2; y < a.height - 2; y++) for (let x = 2; x < a.width - 2; x++) {
            let core = true;
            for (let dy = -2; dy <= 2 && core; dy++) for (let dx = -2; dx <= 2; dx++) if (al[(y + dy) * a.width + x + dx] < 250) { core = false; break; }
            const i = (y * a.width + x) * 4, d = Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2]));
            if (core) { n++; if (d <= 3) hid++; } else if (al[y * a.width + x] === 0 && d > 3) flat++;
          }
          return { n, hid, flat };
        }, [A.toString('base64'), B.toString('base64'), matteBytes(url), box, decode, matteLab]);
        const share = r.n ? r.hid / r.n : 0;
        seen.push([share, `${tag} ${(100 * share).toFixed(2)}% of ${r.n} px`]);
        // the flat colour must also show outside the things (else the test proves nothing)
        if (!r.n || share < 0.99 || r.flat < 1000) bad.push(`${tag}: ${(100 * share).toFixed(2)}% of ${r.n} pixels inside the things show none of the board (${r.flat} board pixels outside)`);
        await c.close();
      }
    }
    ok(!bad.length, 20, `Scene ${BOARD_N}: behind the things: with the board forced to one flat colour, at least 99% of the pixels inside the three things' matte show none of it (Chromium, WebKit, Firefox; 430x739 and 1512x860)`, `least: ${seen.sort((a, b) => a[0] - b[0])[0]?.[1]}`, bad.slice(0, 6).join('; '));
  });

  // 21. no tell: before step 1 nothing of the board shows; at pass 1's hold nothing of the race piece's and the phone's
  // traces, side lines and pads, nor the net, the dashed trace, the empty place and NEXT; at pass 2's hold nothing of
  // the phone's nor of the last step
  if (want(21) && boardForms.length) await guarded(21, async () => {
    const bad = [], N = `#s${BOARD_N}`;
    const STEP4 = [`${N} .b4`, `${N} .blab.next`];
    // each name shows with its pad's outline, never before: TAPZ not while the stand's trace is on its way, TROPHYZ
    // and PULZ not at pass 1's hold, PULZ not at pass 2's
    const states = [
      ['before step 1', { pre: 0 }, [`${N} .board`, `${N} .blab`]],
      ["the stand's trace on its way", { pre: 0.45 }, [`${N} .blab.n-stand`, `${N} .t-stand .pd`]],
      ["pass 1's hold", { u: 0.06 }, [`${N} .t-coin`, `${N} .t-phone`, `${N} .blab.n-coin`, `${N} .blab.n-phone`, ...STEP4]],
      ["pass 2's hold", { u: 0.4 }, [`${N} .t-phone`, `${N} .blab.n-phone`, ...STEP4]],
    ];
    const runs = [['chromium', 1512, 860], ['chromium', 806, 516], ['chromium', 430, 739], ['chromium', 393, 635], ['webkit', 430, 739], ['webkit', 1512, 860], ['firefox', 1512, 860]];
    for (const [engine, w, h] of runs) {
      const c = await ctx(engine, { viewport: { width: w, height: h }, bypassCSP: true });
      const p = await open(c, '/', `no tell ${engine} ${w}x${h}`);
      for (const [name, at, forbid] of states) {
        await styleIt(p, ''); await toBoard(p, at);
        const all = forbid.map((s) => `${s},${s} *`).join(',');
        await styleIt(p, QUIET + `${N} .board *,${N} .blab{visibility:hidden !important}`); await settle(p, 150);
        const A = await p.screenshot();
        await styleIt(p, QUIET + `${N} .board *,${N} .blab{visibility:hidden !important}${all}{visibility:visible !important;stroke:#ff00ff !important;color:#ff00ff !important;text-shadow:none !important}`); await settle(p, 150);
        const B = await p.screenshot();
        const n = await labPage.evaluate(async ([a64, b64, decode]) => {
          const dec = (0, eval)(decode); const [a, b] = await Promise.all([dec(a64), dec(b64)]);
          let n = 0;
          for (let i = 0; i < a.data.length; i += 4) if (Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2])) > 2) n++;
          return n;
        }, [A.toString('base64'), B.toString('base64'), decode]);
        if (n) bad.push(`${engine} ${w}x${h} ${name}: ${n} pixels show`);
      }
      await c.close();
    }
    // the dim side lines never run ahead of their trace's head (more than 2 px), all through the steps, both forms
    const sideBad = [];
    let sideMax = -Infinity;
    for (const [w, h] of [[1512, 860], [430, 739]]) {
      const c = await ctx('chromium', { viewport: { width: w, height: h } });
      const p = await open(c, '/', `side lines ${w}x${h}`);
      for (let i = 0; i <= 48; i++) {
        await toBoard(p, i < 8 ? { pre: i / 8 } : { u: ((i - 8) / 40) * 0.72 });
        const st = await traceState(p, traceRest);
        for (const [t, v] of Object.entries(st)) for (const e of v.sides) {
          if (e < 0) continue;
          sideMax = Math.max(sideMax, e - v.head);
          if (e > v.head + 2) sideBad.push(`${w}x${h} step ${i} ${t}: a side line ${(e - v.head).toFixed(1)} px ahead of the head`);
        }
      }
      await c.close();
    }
    ok(!sideBad.length, 21, `Scene ${BOARD_N}: no dim side line is drawn ahead of its trace's head (by more than 2 picture px), at 49 points from before the scene through the third pass (Chromium, 1512x860 and 430x739)`, `furthest ahead: ${sideMax.toFixed(1)} px`, sideBad.slice(0, 6).join('; '));
    ok(!bad.length, 21, `Scene ${BOARD_N}: no tell: before its first step nothing of the board and no label shows; while the stand's trace is on its way no pixel of TAPZ or the stand's pad; at pass 1's hold no pixel of the race piece's and the phone's traces, side lines, pads and names, the net, the dashed trace, the empty place or NEXT; at pass 2's hold none of the phone's (its name too) or of the last step (Chromium at 1512x860, 806x516, 430x739, 393x635; WebKit, Firefox)`, 'zero pixels each time', bad.slice(0, 6).join('; '));
  });

  // 24. the current and the light arrive together: through the change that lights the race piece (second pass) and
  // the coach phone (third pass), the thing's own brightness (its box, board hidden) as a share of the change; the
  // head of its trace must be on its pad once that share is 75% and must not be there while it is at most 40%
  if (want(24) && boardForms.length) await guarded(24, async () => {
    const bad = [], seen = [], nameRows = [];
    /** a name tag's opacity and its pad outline's, as the browser has them now */
    const nameAndPad = (p, t) => p.evaluate(([n, t]) => {
      const s = document.getElementById('s' + n), svg = [...s.querySelectorAll('svg.board')].find((e) => getComputedStyle(e).display !== 'none');
      const nm = s.querySelector('.lbox .blab.n-' + t), pd = svg?.querySelector(`.t-${t} .pd`);
      return [nm ? +getComputedStyle(nm).opacity : -1, pd ? +getComputedStyle(pd).opacity : -2];
    }, [BOARD_N, t]);
    const sizes = JSON.parse(readFileSync(join(ROOT, 'src/generated/pictures.json'), 'utf8'));
    for (const [engine, w, h] of [['chromium', 1512, 860], ['chromium', 430, 739], ['webkit', 1512, 860], ['webkit', 430, 739]]) {
      const form = w / h <= 1 ? 'phone' : 'desktop', view = viewOf(BOARD_N, form), iw = sizes[view.passes[0]].size[0];
      const c = await ctx(engine, { viewport: { width: w, height: h }, bypassCSP: true });
      const p = await open(c, '/', `sync ${engine} ${w}x${h}`);
      for (const [thing, k] of [['coin', 2], ['phone', 3]]) {
        const box = view.later.find((b) => b[0] === k);
        // the film's scroll window of pass k's change (src/film/math.ts passStrength, light share of the scene)
        const n = view.passes.length - 1, hold = view.hold || 0, rest = view.rest ?? 1;
        const q0 = (k - 2 + hold / 2) / n, q1 = (k - 1 - hold / 2) / n;
        const u = (q) => (q / rest) * film.lightShare;
        const rows = [];
        for (let i = 0; i <= 30; i++) {
          await toBoard(p, { u: u(q0 + ((q1 - q0) * i) / 30) });
          const st = (await traceState(p, traceRest))[thing];
          nameRows.push([`${engine} ${w}x${h} ${thing} point ${i}`, ...(await nameAndPad(p, thing))]);
          await styleIt(p, QUIET + `#s${BOARD_N} .bbox,#s${BOARD_N} .lbox,#s${BOARD_N} .cut{visibility:hidden !important}`); await settle(p, 80);
          const img = await p.evaluate((n) => { const r = document.querySelector(`#s${n} .passes img`).getBoundingClientRect(); return [r.left, r.top, r.width]; }, BOARD_N);
          const kk = img[2] / iw, shot = await p.screenshot();
          const [m] = await lab(shot, [[img[0] + box[1] * kk, img[1] + box[2] * kk, box[3] * kk, box[4] * kk]]);
          await styleIt(p, '');
          rows.push({ mean: m.mean, arrived: st.arrived });
        }
        const L0 = rows[0].mean, L1 = rows[rows.length - 1].mean;
        const share = rows.map((r) => (r.mean - L0) / ((L1 - L0) || 1));
        const first = rows.findIndex((r) => r.arrived);
        seen.push(`${engine} ${w}x${h} ${thing} arrives at ${first < 0 ? 'never' : (100 * share[first]).toFixed(0) + '%'}`);
        rows.forEach((r, i) => {
          if (share[i] >= 0.75 && !r.arrived) bad.push(`${engine} ${w}x${h} ${thing}: ${(100 * share[i]).toFixed(0)}% lit, its trace not there yet`);
          if (share[i] <= 0.4 && r.arrived) bad.push(`${engine} ${w}x${h} ${thing}: its trace there at only ${(100 * share[i]).toFixed(0)}% lit`);
        });
      }
      await c.close();
    }
    // the stand's name through its trace coming in (the half screen before the scene's top)
    for (const [engine, w, h] of [['chromium', 1512, 860], ['chromium', 430, 739], ['webkit', 1512, 860], ['webkit', 430, 739]]) {
      const c = await ctx(engine, { viewport: { width: w, height: h } });
      const p = await open(c, '/', `name sync ${engine} ${w}x${h}`);
      for (let i = 0; i <= 30; i++) { await toBoard(p, { pre: i / 30 }); nameRows.push([`${engine} ${w}x${h} stand pre ${(i / 30).toFixed(2)}`, ...(await nameAndPad(p, 'stand'))]); }
      await c.close();
    }
    const off = nameRows.filter(([, a, b]) => a < 0 || b < 0 || Math.abs(a - b) > 0.001);
    const lit = nameRows.filter(([, a]) => a > 0 && a < 1).length;
    ok(!off.length && nameRows.length >= 31 * 3 * 4, 24, `Scene ${BOARD_N}: each name shows with its own pad outline, never ahead: through the race piece's and the coach phone's changes (31 points each) and the stand's trace coming in (31 points), the name's opacity equals its pad outline's (Chromium, WebKit; 1512x860 and 430x739)`, `${nameRows.length} points, ${lit} part way`, off.slice(0, 6).map((r) => `${r[0]}: name ${r[1]}, pad ${r[2]}`).join('; '));
    ok(!bad.length, 24, `Scene ${BOARD_N}: the race piece and the coach phone wake as their current arrives: through each one's change (31 points), its trace is on its pad by the time the thing is 75% lit and never while it is 40% lit or less (Chromium, WebKit; 1512x860 and 430x739)`, seen.join(', '), [...new Set(bad)].slice(0, 6).join('; '));
  });

  // 22. no board ink within 8 px of the giant words' ink; the five labels (StudioOS, the three names, NEXT) at least
  // 12 px, at least 4.5 to 1 against their own colour, fully on the visible screen, never on the giant words, the small
  // line, a thing or each other (4 px apart at least), never dimmed (no mask above them; on short phones their
  // brightest ink at their colour's brightness), no net ink within 6 px of them; on big screens they grow
  if (want(22) && boardForms.length) await guarded(22, async () => {
    const bad = [], lbad = [], dbad = [], nbad = [], gbad = [], seen = [], seenC = [], seenGap = [], seenNet = [], seenDim = [], grow = [], N = `#s${BOARD_N}`;
    const runs = [...VIEWPORTS, [1000, 1000], [834, 1194], [360, 640], [402, 874], [1366, 768], [1920, 1080]].map(([w, h]) => ({ w, h, css: '', label: `${w}x${h}` }))
      .concat(BARS.flatMap((bar) => ['away', 'showing'].map((state) => ({ ...barState(bar, state), label: barLabel(bar, state) }))));
    const PICS = `${N} .passes picture,${N} .passes img{visibility:hidden !important}`;
    const DIM_AT = ['320x568', '393x635', '430x715'];
    const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const Y = ([r, g, b, a]) => 0.2126 * lin(a * r) + 0.7152 * lin(a * g) + 0.0722 * lin(a * b);
    const kindOf = (cls) => TEXT_KINDS.find((t) => t[0] === '.' + cls.trim().split(/\s+/).filter((c) => c === 'blab' || c === 'chip' || c === 'next' || c.startsWith('n-')).join('.'));
    for (const run of runs) {
      const { w, h, css } = run, tag = run.label;
      const c = await ctx('chromium', { viewport: { width: w, height: h }, bypassCSP: true });
      if (css) await c.addInitScript(INJECT, css);
      const p = await open(c, '/', `board words ${tag}`);
      await toBoard(p, { u: 1 });
      // the ink of the giant words alone (white on black), then the board alone in one flat colour (its darkened floor
      // and the chip's soft glow left out: they are shade, not lines), its labels too
      await styleIt(p, QUIET + PICS + `${N} .bbox,${N} .lbox{visibility:hidden !important}${N} .big{color:#fff !important}`); await settle(p, 150);
      const W = await p.screenshot();
      await styleIt(p, QUIET + PICS + `${N} .cut{visibility:hidden !important}${N} .board *{stroke:#ff00ff !important;stroke-opacity:1 !important;fill-opacity:1 !important}${N} .board rect,${N} .board ellipse{visibility:hidden !important}${N} .board path[fill]{fill:#ff00ff !important}${N} .blab{color:#ff00ff !important;text-shadow:none !important}`); await settle(p, 150);
      const K = await p.screenshot();
      // the net alone (the .b4 group without the dashed trace and its ring, its darkened floor left out), in one flat colour
      await styleIt(p, QUIET + PICS + `${N} .cut,${N} .words,${N} .lbox,${N} .board *{visibility:hidden !important}${N} .board g.b4:not(.nx),${N} .board g.b4:not(.nx) path{visibility:visible !important;stroke:#ff00ff !important;stroke-opacity:1 !important}`); await settle(p, 150);
      const NET = await p.screenshot();
      // the labels alone on black, as the visitor sees them (the dark band at the foot left in)
      await styleIt(p, QUIET + PICS + `${N} .cut,${N} .words,${N} .bbox{visibility:hidden !important}`); await settle(p, 150);
      const D = await p.screenshot();
      await styleIt(p, '');
      const d = await labPage.evaluate(async ([w64, k64, decode]) => {
        const dec = (0, eval)(decode); const [a, b] = await Promise.all([dec(w64), dec(k64)]);
        const W = a.width, H = a.height, R = 30, word = new Uint8Array(W * H);
        for (let k = 0; k < W * H; k++) word[k] = a.data[k * 4] > 100 && a.data[k * 4 + 1] > 100 ? 1 : 0;
        let best = Infinity, near = 0;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4, r = b.data[i], g = b.data[i + 1], bl = b.data[i + 2];
          if (!(r > 40 && bl > 40 && g < 0.5 * Math.min(r, bl))) continue;
          for (let dy = -R; dy <= R; dy++) { const yy = y + dy; if (yy < 0 || yy >= H) continue; for (let dx = -R; dx <= R; dx++) { const xx = x + dx; if (xx < 0 || xx >= W || !word[yy * W + xx]) continue; const dd = Math.hypot(dx, dy); if (dd < best) best = dd; if (dd <= 8) near++; } }
        }
        return { best, near };
      }, [W.toString('base64'), K.toString('base64'), decode]);
      seen.push([d.best, `${tag} ${d.best === Infinity ? 'over 30' : d.best.toFixed(1)} px`]);
      if (d.near) bad.push(`${tag}: board ink ${d.best.toFixed(1)} px from the giant words`);
      // the labels
      const L = await p.evaluate((n) => {
        const s = document.getElementById('s' + n), rect = (e) => { const g = document.createRange(); g.selectNodeContents(e); const t = g.getBoundingClientRect(); return [t.left, t.top, t.right, t.bottom]; };
        const top = document.getElementById('top').getBoundingClientRect().bottom, layer = s.querySelector('.layer');
        const masked = (e) => { const out = []; for (let x = e; x; x = x.parentElement) { const cs = getComputedStyle(x), m = cs.getPropertyValue('mask-image') || cs.getPropertyValue('-webkit-mask-image'); if (m && m !== 'none') out.push(x.className || x.tagName); if (x === layer) break; } return out; };
        return { top, vw: document.documentElement.clientWidth, vh: innerHeight, labs: [...s.querySelectorAll('.blab')].map((e) => ({ k: e.className, text: e.textContent, size: parseFloat(getComputedStyle(e).fontSize), r: rect(e), o: getComputedStyle(e).opacity, masked: masked(e) })),
          words: [...s.querySelectorAll('.big .pl, .small')].map(rect) };
      }, BOARD_N);
      const hit = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
      const gap = (a, b) => Math.max(a[0] - b[2], b[0] - a[2], a[1] - b[3], b[1] - a[3]);
      if (L.labs.length !== 2 + BOARD_NAMES.length) lbad.push(`${tag}: ${L.labs.length} labels`);
      for (const l of L.labs) {
        if (l.size < 12) lbad.push(`${tag} ${l.k}: ${l.size} px`);
        if (l.r[0] < 0 || l.r[2] > L.vw || l.r[1] < L.top || l.r[3] > L.vh) lbad.push(`${tag} ${l.k}: off the visible screen (${l.r.map(Math.round).join(', ')} in ${L.vw}x${L.vh}, border to ${Math.round(L.top)})`);
        if (L.words.some((q) => hit(l.r, q))) lbad.push(`${tag} ${l.k}: on the giant words or the small line`);
        if (+l.o < 1) lbad.push(`${tag} ${l.k}: not fully shown at rest (${l.o})`);
        if (l.masked.length) dbad.push(`${tag} ${l.k}: a mask on ${l.masked.join(', ')}`);
      }
      for (let i = 0; i < L.labs.length; i++) for (let j = i + 1; j < L.labs.length; j++) {
        const g = gap(L.labs[i].r, L.labs[j].r);
        seenGap.push([g, `${tag} ${L.labs[i].text} and ${L.labs[j].text} ${g.toFixed(1)} px`]);
        if (g < 4) lbad.push(`${tag}: ${L.labs[i].text} and ${L.labs[j].text} ${g.toFixed(1)} px apart`);
      }
      // big screens: the labels grow with the picture; at 1440x900 and below (and every upright screen) their base size
      const big = ['2428x1300', '1920x1080'].includes(tag), base = (w <= 1440 && h <= 900) || w / h <= 1;
      for (const l of L.labs) {
        const b0 = / chip/.test(' ' + l.k) ? 14 : 12;
        if (big && !(l.size > b0)) gbad.push(`${tag} ${l.text}: ${l.size} px, not grown`);
        if (base && Math.abs(l.size - b0) > 0.01) gbad.push(`${tag} ${l.text}: ${l.size} px, not its base ${b0} px`);
        if (big) grow.push(`${tag} ${l.text} ${l.size.toFixed(1)}`);
      }
      const url = await matteUrl(p), b = (await boxes(p)).board;
      if (url && b) {
        const lay = await p.evaluate((n) => { const l = document.querySelector(`#s${n} .layer`).getBoundingClientRect(); return [l.left, l.top]; }, BOARD_N);
        const on = await labPage.evaluate(async ([m64, box, w, h, rects, matte]) => {
          const al = await (0, eval)(matte)(m64, box, w, h);
          return rects.map((r) => { let mx = 0; for (let y = Math.max(0, Math.floor(r[1])); y < Math.min(h, Math.ceil(r[3])); y++) for (let x = Math.max(0, Math.floor(r[0])); x < Math.min(w, Math.ceil(r[2])); x++) mx = Math.max(mx, al[y * w + x]); return mx; });
        }, [matteBytes(url), [b[0] + lay[0], b[1] + lay[1], b[2], b[3]], w, h, L.labs.map((l) => l.r), matteLab]);
        on.forEach((mx, i) => { if (mx > 25) lbad.push(`${tag} ${L.labs[i].k}: on a thing (matte ${mx})`); });
      } else lbad.push(`${tag}: no board`);
      // the net: no ink within 6 px of a label's box; and the labels' brightest ink
      const m = await labPage.evaluate(async ([n64, d64, rects, decode]) => {
        const dec = (0, eval)(decode); const [a, b] = await Promise.all([dec(n64), dec(d64)]);
        const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
        return rects.map((r) => {
          let net = 0, close = Infinity, peak = 0;
          for (let y = Math.max(0, Math.floor(r[1] - 12)); y < Math.min(a.height, Math.ceil(r[3] + 12)); y++) for (let x = Math.max(0, Math.floor(r[0] - 12)); x < Math.min(a.width, Math.ceil(r[2] + 12)); x++) {
            const i = (y * a.width + x) * 4, R = a.data[i], G = a.data[i + 1], B = a.data[i + 2];
            if (R > 40 && B > 40 && G < 0.5 * Math.min(R, B)) {
              const dx = Math.max(r[0] - (x + 1), x - r[2], 0), dy = Math.max(r[1] - (y + 1), y - r[3], 0), dd = Math.hypot(dx, dy);
              close = Math.min(close, dd); if (dd <= 6) net++;
            }
            if (x >= r[0] && x < r[2] && y >= r[1] && y < r[3]) peak = Math.max(peak, 0.2126 * lin(b.data[i]) + 0.7152 * lin(b.data[i + 1]) + 0.0722 * lin(b.data[i + 2]));
          }
          return { net, close, peak };
        });
      }, [NET.toString('base64'), D.toString('base64'), L.labs.map((l) => l.r), decode]);
      m.forEach((x, i) => {
        const l = L.labs[i];
        seenNet.push([x.close, `${tag} ${l.text} ${x.close === Infinity ? 'over 12' : x.close.toFixed(1)} px`]);
        if (x.net) nbad.push(`${tag} ${l.text}: ${x.net} net pixels within 6 px (closest ${x.close.toFixed(1)} px)`);
        if (DIM_AT.includes(tag)) {
          const kind = kindOf(l.k), want = kind ? Y(kind[2]) : 1, share = x.peak / want;
          seenDim.push([share, `${tag} ${l.text} ${(100 * share).toFixed(1)}%`]);
          if (!kind || share < 0.95) dbad.push(`${tag} ${l.text}: brightest ink ${(100 * share).toFixed(1)}% of its colour's brightness`);
        }
      });
      for (const t of await inkOf(p, BOARD_N)) {
        if (!/^(chip|next|n-)/.test(t.kind)) continue;
        seenC.push([t.ratio, `${tag} ${t.kind} ${t.ratio.toFixed(2)}`]);
        if (t.ink < 20 || t.ratio < t.need) lbad.push(`${tag} ${t.kind}: ${t.ratio.toFixed(2)} to 1 (${t.ink} ink pixels)`);
      }
      await c.close();
    }
    const what = `at every listed size, 1000x1000, 834x1194, 360x640, 402x874, 1366x768, 1920x1080 and every bar state (Chromium)`;
    ok(!bad.length, 22, `Scene ${BOARD_N}: no board ink within 8 px of the giant words' ink, ${what}`, `closest: ${seen.sort((a, b) => a[0] - b[0])[0]?.[1]}`, bad.slice(0, 6).join('; '));
    ok(!lbad.length, 22, `Scene ${BOARD_N}: its ${2 + BOARD_NAMES.length} labels at least 12 px, at least 4.5 to 1 against their own colour, fully on the visible screen below the border, never on the giant words, the small line, a thing or each other (at least 4 px apart), ${what}`, `lowest contrast: ${seenC.sort((a, b) => a[0] - b[0]).slice(0, 2).map((x) => x[1]).join(', ')}; closest pair: ${seenGap.sort((a, b) => a[0] - b[0])[0]?.[1]}`, [...new Set(lbad)].slice(0, 8).join('; '));
    ok(!dbad.length, 22, `Scene ${BOARD_N}: no label is dimmed: no mask on a label or any box above it up to the layer (every size above), and at ${DIM_AT.join(', ')} each label's brightest ink is within 5% of its colour's brightness`, `least: ${seenDim.sort((a, b) => a[0] - b[0]).slice(0, 2).map((x) => x[1]).join(', ')}`, [...new Set(dbad)].slice(0, 8).join('; '));
    ok(!nbad.length, 22, `Scene ${BOARD_N}: no net ink (the faint net, its dots and parts) within 6 px of any label, ${what}`, `closest: ${seenNet.sort((a, b) => a[0] - b[0])[0]?.[1]}`, [...new Set(nbad)].slice(0, 8).join('; '));
    ok(!gbad.length, 22, `Scene ${BOARD_N}: on big screens the labels grow with the picture (2428x1300 and 1920x1080: StudioOS over 14 px, the others over 12 px); at 1440x900 and below, and upright, their base sizes (14 px, 12 px)`, grow.filter((g) => /StudioOS|NEXT/.test(g)).join(', '), [...new Set(gbad)].slice(0, 8).join('; '));
  });

  // 23. less motion: nothing on the board moves and its rest state is complete; with motion, the pulses run at rest
  // and stop once the scene is off screen
  if (want(23) && boardForms.length) await guarded(23, async () => {
    const bad = [];
    // every path's d in the page as built (the rest state), per drawing
    const html = readFileSync(join(DIST, 'index.html'), 'utf8'), restOf = {};
    for (const m of html.matchAll(/<svg class="board (b[dp])"[\s\S]*?<\/svg>/g)) restOf[m[1]] = [...m[0].matchAll(/<path[^>]*?\sd="([^"]*)"/g)].map((x) => x[1]);
    for (const engine of ['chromium', 'webkit', 'firefox']) {
      for (const [w, h] of [[430, 739], [1512, 860]]) {
        const tag = `${engine} ${w}x${h}`;
        const c = await ctx(engine, { viewport: { width: w, height: h }, reducedMotion: 'reduce', bypassCSP: true });
        const p = await open(c, '/', `board less motion ${tag}`);
        await toBoard(p, { u: 0.3 });
        const st = await p.evaluate(([n, restOf]) => {
          const svg = [...document.querySelectorAll(`#s${n} svg.board`)].find((e) => getComputedStyle(e).display !== 'none');
          const want = restOf[[...svg.classList].find((k) => /^b[dp]$/.test(k))] ?? [];
          const live = [...svg.querySelectorAll('path')];
          const op = (e) => { let o = 1; for (let x = e; x && x !== document.body; x = x.parentElement) o *= +getComputedStyle(x).opacity; return o; };
          const diff = live.filter((e, i) => !e.classList.contains('pu') && !e.classList.contains('fl') && e.getAttribute('d') !== want[i]).length;
          const dim = live.filter((e) => !e.classList.contains('pu') && !e.classList.contains('fl') && op(e) < 0.999).length;
          const all = [...document.querySelectorAll(`#s${n} .blab`)], labs = all.filter((e) => op(e) < 0.999).length;
          return { diff, dim, labs, count: all.length, pulses: svg.querySelectorAll('.pu:not([d=""])').length };
        }, [BOARD_N, restOf]);
        if (st.diff || st.dim || st.labs || st.pulses || st.count !== 2 + BOARD_NAMES.length) bad.push(`${tag} less motion: ${st.diff} lines not whole, ${st.dim} parts not full, ${st.labs} of ${st.count} labels not full, ${st.pulses} pulses`);
        await styleIt(p, QUIET);
        const a = await p.screenshot(); await settle(p, 800); const b = await p.screenshot();
        if (!a.equals(b)) bad.push(`${tag} less motion: the scene changes over 0.8 s`);
        await c.close();
        const c2 = await ctx(engine, { viewport: { width: w, height: h }, bypassCSP: true });
        const p2 = await open(c2, '/', `board pulses ${tag}`);
        await toBoard(p2, { u: 1 });
        const ds = () => p2.evaluate((n) => [...document.querySelectorAll(`#s${n} .board .pu`)].map((e) => e.getAttribute('d')).join('|'), BOARD_N);
        const d1 = await ds(); await settle(p2, 300); const d2 = await ds();
        if (d1 === d2) bad.push(`${tag}: no pulses at rest`);
        await p2.evaluate(() => scrollTo(0, 0)); await settle(p2, 600);
        const e1 = await ds(); await settle(p2, 400); const e2 = await ds();
        if (e1.replace(/\|/g, '') || e2.replace(/\|/g, '')) bad.push(`${tag}: pulses still drawn with the scene off screen`);
        await c2.close();
      }
    }
    ok(!bad.length, 23, `Scene ${BOARD_N}: with less motion every line of the board whole, every part and all ${2 + BOARD_NAMES.length} labels fully shown, no pulse, nothing changes over 0.8 s; with motion the pulses run at rest and stop once the scene is off screen (Chromium, WebKit, Firefox; 430x739, 1512x860)`, 'as specified', bad.slice(0, 6).join('; '));
  });

  /* 6. LEGAL: the email address is a mail link, in the text's grey, underlined, at least 44 px tall to tap */
  if (want(6)) await guarded(6, async () => {
    const bad = [];
    for (const [engine, w, h] of [['chromium', 430, 739], ['chromium', 320, 568], ['chromium', 1512, 860], ['webkit', 430, 739], ['firefox', 430, 739]]) {
      const c = await ctx(engine, { viewport: { width: w, height: h } });
      const p = await open(c, '/legal/', `mail links ${engine} ${w}x${h}`);
      const links = await p.evaluate(() => [...document.querySelectorAll('#legal a[href^="mailto:"]')].map((a) => {
        const b = a.getBoundingClientRect(), cs = getComputedStyle(a), line = parseFloat(getComputedStyle(a.parentElement).lineHeight);
        return { href: a.getAttribute('href'), text: a.textContent, w: b.width, h: b.height, color: cs.color === getComputedStyle(a.parentElement).color, under: cs.textDecorationLine.includes('underline'), line, lines: Math.round(a.parentElement.getBoundingClientRect().height / line) };
      }));
      const want = content.legal.sections.flatMap((s) => [...s.lead, ...s.parts.flatMap((pt) => [...pt.text, ...(pt.list ?? []), ...(pt.after ?? [])])]).join(' ').match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g) ?? [];
      if (links.length !== want.length) bad.push(`${engine} ${w}x${h}: ${links.length} mail links for ${want.length} addresses`);
      for (const l of links) if (l.href !== 'mailto:' + l.text || l.h < 44 || l.w < 44 || !l.color || !l.under) bad.push(`${engine} ${w}x${h}: ${JSON.stringify(l)}`);
      await c.close();
    }
    ok(!bad.length, 6, 'LEGAL: every email address is a mail link in the text\'s own grey, underlined, with a tap area at least 44 x 44 px', 'all', bad.slice(0, 4).join('; '));
  });

  /* 10. old addresses and unknown addresses (as far as a local server can tell) */
  if (want(10)) await guarded(10, async () => {
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
    // the only rewrites are the open doors' (test 26 checks them one by one); no routes
    if (/"routes"/.test(cfg)) bad.push('vercel.json has routes');
    for (const r of JSON.parse(cfg).rewrites ?? []) if (!(content.doors ?? []).some((d) => d.on && r.source.startsWith(d.path))) bad.push(`vercel.json rewrites ${r.source}, which is no open door`);
    for (const old of ['privacy.html', 'terms.html', 'privacy/index.html', 'terms/index.html']) if (existsSync(join(DIST, old))) bad.push(`dist/${old} exists: a second, older page`);
    for (const path of ['/Privacy', '/legal/privacy']) { const r = await hop(path); if (r.status !== 404) bad.push(`${path}: ${r.chain.join(' > ')}`); }
    ok(!bad.length, 10, '/privacy and /terms (with and without the slash) reach LEGAL, matched as strictly as the host does; unknown addresses give 404 with the not found page; no rule touches the email pictures; the only rewrites are the open doors\'', 'as vercel.json says', bad.join('; '));
    warn(10, 'Not testable here', 'the host\'s own 404 status, the # in its redirect and its real headers need one curl on the first test address');
  });

  /* 11. weights */
  if (want(11)) await guarded(11, async () => {
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
    const face = got.filter((r) => /\/assets\/anton-latin-400-normal-[^/]+\.woff2$/.test(r.url));
    ok(face.length === 1, 11, 'The display face loads once with the first screen, from this site, inside that budget', face.map((r) => kb(r.bytes)).join(', '), `${face.length} requests for it`);
    await c.close();
  });

  /* 11. each engine asks for one file per picture: where it takes AVIF it never also fetches the WebP (the Safari
     engine used to, for every picture the film script makes); and the phone's first load stays in budget everywhere */
  if (want(11)) await guarded(11, async () => {
    const bad = [], seen = [];
    for (const engine of ['chromium', 'webkit', 'firefox']) {
      for (const [w, h, dpr] of [[430, 739, 3], [1512, 860, 2]]) {
        const c = await ctx(engine, { viewport: { width: w, height: h }, deviceScaleFactor: dpr });
        const p = await c.newPage();
        p.on('pageerror', (e) => errors.push(`one file ${engine}: ${String(e).slice(0, 200)}`));
        const got = [];
        let phase = 'first';
        p.on('requestfinished', async (r) => { const name = r.url().split('/').pop(); try { const s = await r.sizes(); got.push({ phase, name, bytes: s.responseBodySize + s.responseHeadersSize }); } catch { got.push({ phase, name, bytes: 0 }); } });
        await p.goto(BASE + '/', { waitUntil: 'load' });
        await settle(p, 2500);
        const first = got.reduce((a, r) => a + r.bytes, 0);
        phase = 'scroll';
        const shown = [];
        for (let n = 1; n <= content.scenes.length; n++) {
          await p.evaluate(async (n) => {
            const s = document.getElementById('s' + n), vh = document.querySelector('.probe').offsetHeight;
            for (let y = s.offsetTop; y <= s.offsetTop + s.offsetHeight - vh; y += 240) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); }
          }, n);
          await toScene(p, n, 1);
          shown.push(await p.evaluate((n) => { const im = [...document.querySelectorAll(`#s${n} .passes img`)]; return im.length > 0 && im.every((i) => i.complete && i.naturalWidth > 0); }, n));
        }
        const pics = got.filter((r) => /\.(avif|webp)$/.test(r.name) && !/-matte-/.test(r.name));
        const webp = pics.filter((r) => r.name.endsWith('.webp')), avif = pics.length - webp.length;
        if (avif && webp.length) bad.push(`${engine} ${w}x${h}: ${webp.length} WebP besides ${avif} AVIF (${webp.slice(0, 3).map((r) => r.name).join(', ')})`);
        if (shown.some((s) => !s)) bad.push(`${engine} ${w}x${h}: scenes without their pictures: ${shown.map((s, i) => (s ? '' : i + 1)).filter(Boolean).join(', ')}`);
        if (w < 600 && first >= BUDGET.firstLoad) bad.push(`${engine} phone first load ${(first / 1024).toFixed(1)} KB`);
        if (w < 600) seen.push(`${engine} ${(first / 1024).toFixed(1)} KB (pixel ratio ${await p.evaluate(() => devicePixelRatio)})`);
        await c.close();
      }
    }
    ok(!bad.length, 11, 'One file per picture: over a full scroll of the film no WebP is fetched where AVIF is taken, every scene shows its pictures; phone (430x739, 3 real pixels per point) first load under 250 KB (Chromium, WebKit, Firefox; also 1512x860 at 2)', `phone first load ${seen.join(', ')}`, bad.join('; '));
  });

  /* ---------- the doors (build 9): a product's own site under the studio's address, and the hand-over to it ---------- */
  const DOORS_ON = (content.doors ?? []).filter((d) => d.on);
  const BASE2 = `http://127.0.0.1:${PORT + 1}`;
  const pictureSizes = JSON.parse(readFileSync(join(ROOT, 'src/generated/pictures.json'), 'utf8'));
  /** the scenes holding each open door: [door, scene n, board?] */
  const doorScenes = DOORS_ON.flatMap((d) => (d.scenes ?? []).map((n) => [d, n, !!content.scenes[n - 1]?.board]));
  const onDoor = (path) => DOORS_ON.some((d) => path.startsWith(d.path));
  /** A context for the hand-over: every request to another host is stopped (never sent) and noted, as the studio's
   *  page's or as the product's page's own (the product loads web fonts from another host; that is its own choice).
   *  The page logs the hand-over's own events in sessionStorage (shared by the two pages of one address). */
  const DLOG = () => {
    const log = (k, v) => { try { const a = JSON.parse(sessionStorage.getItem('doorlog') || '[]'); a.push([k, Math.round(performance.timeOrigin + performance.now()), location.pathname + location.hash, v ?? '']); sessionStorage.setItem('doorlog', JSON.stringify(a)); } catch { /* storage off */ } };
    try { const nav = performance.getEntriesByType('navigation')[0]; log('doc', nav?.type ?? ''); } catch { /* old engine */ }
    addEventListener('pagereveal', (e) => {
      const vt = e.viewTransition;
      log('reveal', vt ? 'vt' : 'novt');
      if (vt) {
        vt.ready.then(() => { const g = document.getAnimations().filter((a) => a.effect?.pseudoElement?.includes('group(product)')); log('group', JSON.stringify(g.map((a) => a.effect.getKeyframes().map((k) => [k.transform, k.width, k.height])))); }, () => log('vt-skipped'));
        vt.finished.then(() => log('vt-finished'));
      }
    });
    addEventListener('pageswap', (e) => { const b = document.querySelector('.door-vt'); const r = b?.getBoundingClientRect(); log('swap', (e.viewTransition ? 'vt' : 'novt') + (r ? ` ${b.style.viewTransitionName} ${[r.left, r.top, r.width, r.height].map((v) => v.toFixed(2)).join(',')}` : '')); });
    addEventListener('pageshow', (e) => log('show', e.persisted ? 'persisted' : 'fresh'));
  };
  async function doorCtx(browser, engine, o = {}) {
    const phone = (o.viewport?.width ?? 1440) < 600;
    const opts = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, ...o };
    if (phone && engine !== 'firefox') opts.isMobile = true;
    if (phone) opts.hasTouch = true;
    const c = await browser.newContext(opts);
    c.studioOut = []; c.doorOut = []; c.errs = [];
    await c.route((u) => !u.href.startsWith(BASE) && !u.href.startsWith(BASE2), (r) => {
      let from = '';
      try { from = new URL(r.request().frame().url()).pathname; } catch { from = '?'; }
      (onDoor(from) ? c.doorOut : c.studioOut).push(`${from} -> ${r.request().url().slice(0, 90)}`);
      return r.abort();
    });
    await c.addInitScript(DLOG);
    const close = c.close.bind(c);
    c.close = async () => { cookieJar.push(...(await c.cookies())); return close(); };
    return c;
  }
  async function doorPage(c, base, path, label) {
    step(`door page ${label}`);
    const p = await c.newPage();
    const own = () => { try { return onDoor(new URL(p.url()).pathname); } catch { return false; } };
    // the product's page's own messages (its stopped web fonts) are not the studio's
    p.on('console', (m) => { if (m.type() === 'error' && !own() && !/Transition was skipped/.test(m.text())) c.errs.push(`${label}: ${m.text().slice(0, 160)}`); });
    p.on('pageerror', (e) => { if (!own() && !/Transition was skipped/.test(String(e))) c.errs.push(`${label}: ${String(e).slice(0, 160)}`); });
    await p.goto(base + path, { waitUntil: 'load' });
    return p;
  }
  const doorLog = (p) => p.evaluate(() => JSON.parse(sessionStorage.getItem('doorlog') || '[]'));
  /** where scene n rests: its scroll, the scene on screen, its door's state */
  const restState = (p, n) => p.evaluate(([n, share]) => {
    const s = document.getElementById('s' + n), vh = document.querySelector('.probe')?.offsetHeight || innerHeight;
    const on = document.querySelector('#film .scene.on');
    const w = on?.querySelector('.cut') ?? on?.querySelector('.words');
    return { y: scrollY, rest: s.offsetTop + share * Math.max(0, s.offsetHeight - vh), end: s.offsetTop + s.offsetHeight - vh / 2, on: on?.id, url: location.pathname + location.hash, root: document.documentElement.className,
      words: w ? +getComputedStyle(w).opacity : -1, top: +getComputedStyle(document.getElementById('top')).opacity, rings: document.querySelectorAll('.door-ring').length, boxes: document.querySelectorAll('.door-vt').length };
  }, [n, film.lightShare]);
  const restBad = (r, n, tag) => {
    const out = [];
    if (r.on !== 's' + n || r.y < r.rest - 3 || r.y > r.end) out.push(`${tag}: scene ${r.on} at ${r.y}, want scene ${n} between ${Math.round(r.rest)} and ${Math.round(r.end)}`);
    if (/door-/.test(r.root) || r.rings || r.boxes) out.push(`${tag}: left over: classes "${r.root}", ${r.rings} rings, ${r.boxes} blend boxes`);
    if (r.words < 0.99 || r.top < 0.99) out.push(`${tag}: words at ${r.words}, border at ${r.top}`);
    return out;
  };

  /* 26. the doors on the host: forwarding, headers, the speculation rules, the logo */
  if (want(26)) await guarded(26, async () => {
    const bad = [];
    const cfg = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));
    // exactly the open doors are forwarded, each to its product's public address
    const wantRw = DOORS_ON.flatMap((d) => [[d.path, d.target.replace(/\/$/, '') + '/'], [d.path + ':path*', d.target.replace(/\/$/, '') + '/:path*']]);
    const gotRw = (cfg.rewrites ?? []).map((r) => [r.source, r.destination]);
    if (JSON.stringify(gotRw) !== JSON.stringify(wantRw)) bad.push(`vercel.json rewrites ${JSON.stringify(gotRw)}, want ${JSON.stringify(wantRw)}`);
    if (cfg.routes) bad.push('vercel.json has routes');
    const hdr = (cfg.headers ?? []).find((h) => h.source === '/')?.headers?.find((x) => x.key === 'Speculation-Rules')?.value;
    if (DOORS_ON.length ? hdr !== '"/doors.json"' : hdr) bad.push(`the home page's Speculation-Rules header is ${hdr}`);
    const head = async (path, base = BASE) => {
      const r = await fetch(base + path, { redirect: 'manual' });
      const raw = r.headers.get('cross-origin-opener-policy');
      return { status: r.status, loc: r.headers.get('location'), csp: r.headers.get('content-security-policy') ?? '', type: r.headers.get('content-type'), coop: raw, coops: raw ? raw.split(',').length : 0, perm: r.headers.get('permissions-policy'), spec: r.headers.get('speculation-rules'), body: r.status === 200 ? await r.text() : '' };
    };
    const studioCsp = (await head('/')).csp;
    if (!/script-src 'self'/.test(studioCsp)) bad.push(`the home page's policy is "${studioCsp}"`);
    for (const path of ['/', '/legal/', '/machines/', '/doors.json', '/nope-nope/']) {
      const r = await head(path);
      if (r.csp !== studioCsp || r.coops !== 1) bad.push(`${path}: the studio's policy ${r.csp === studioCsp}, opener policies ${r.coops}`);
    }
    for (const d of DOORS_ON) {
      const bare = d.path.replace(/\/$/, '');
      const q = new URL(d.open ?? d.path, BASE).search;
      const red = await head(bare + q);
      if (red.status !== 308 || red.loc !== d.path + q) bad.push(`${bare}${q}: ${red.status} to ${red.loc}, want 308 to ${d.path}${q}`);
      const page = await head(d.open ?? d.path);
      const pic = d.pictures?.length ? await head(d.path + d.pictures[0].src) : null;
      for (const [what, r] of [[d.open ?? d.path, page], ...(pic ? [[d.path + d.pictures[0].src, pic]] : [])]) {
        if (r.status !== 200) bad.push(`${what}: ${r.status}`);
        if (r.coops !== 1 || r.coop !== 'same-origin') bad.push(`${what}: Cross-Origin-Opener-Policy "${r.coop}" (${r.coops}), want exactly one same-origin`);
        if (r.csp.includes("script-src 'self'") || r.perm || r.spec) bad.push(`${what}: the studio's own headers reach the door (policy "${r.csp.slice(0, 40)}", ${r.perm ? 'permissions' : ''} ${r.spec ? 'speculation rules' : ''})`);
      }
      if (!/view-transition-name:\s*product/.test(page.body)) bad.push(`${d.path}: the stand-in names no picture "product" (not a copy with the rulebook's asks)`);
    }
    const sr = await head('/doors.json');
    let rules = null;
    try { rules = JSON.parse(sr.body); } catch { /* none */ }
    const urls = (rules?.prefetch ?? rules?.prerender ?? []).flatMap((r) => r.urls ?? []);
    if (sr.type !== 'application/speculationrules+json' || JSON.stringify(urls) !== JSON.stringify(DOORS_ON.map((d) => d.open ?? d.path))) bad.push(`/doors.json: ${sr.type}, ${JSON.stringify(rules)}`);
    // the logo in the page is the kit's file, shape for shape
    const html = readFileSync(join(DIST, 'index.html'), 'utf8');
    for (const d of DOORS_ON) {
      const src = readFileSync(join(ROOT, d.logo), 'utf8'), shapes = (s) => [...s.matchAll(/<path\b[^>]*\/>/g)].map((m) => m[0]);
      const inline = new RegExp(`<a class="door dlogo"[^>]*data-door="${d.id}"[^>]*>(<svg class="tlogo"[\\s\\S]*?<\\/svg>)`).exec(html);
      // its shapes byte for byte (the route's mask, used only while the route draws itself, is no shape of the logo)
      const drawn = inline ? inline[1].replace(/<defs>[\s\S]*?<\/defs>/, '') : '';
      if (!inline || JSON.stringify(shapes(drawn)) !== JSON.stringify(shapes(src))) bad.push(`${d.id}: the logo in the page is not the shapes of ${d.logo}`);
      if (drawn.toUpperCase().split(d.lit.toUpperCase()).length - 1 !== 1) bad.push(`${d.id}: the logo has more or less than one shape in ${d.lit}`);
    }
    ok(!bad.length, 26, `The doors on the host: vercel.json forwards exactly the open doors (${DOORS_ON.map((d) => d.path).join(', ') || 'none'}) to their public addresses; the address without its slash answers 308 to it, query kept; a door's page and picture carry exactly one opener policy (same-origin) and none of the studio's own headers, while every studio page keeps its policy; the home page names /doors.json, served as application/speculationrules+json and listing the open doors; the logo in the page is the kit's file shape for shape, one orange tile (local stand-in, never the live site)`, 'as specified', bad.slice(0, 8).join('; '));
    warn(26, 'Not testable here', "the host's own handling of a rewrite's headers (one opener policy, none of the studio's) needs one curl on the test address");
  });

  /* 27. the door at rest: placed clear of the giant words, the small words and the things, at every listed size and
     bar state; a real link with its name, keyboard reachable, tiles at least 16 px; it shows only once the light rests */
  if (want(27) && doorScenes.length) await guarded(27, async () => {
    const bad = [], seen = [];
    /** the door of scene n and what it must stay clear of, on screen now */
    const doorAt = (p, n, stand, later) => p.evaluate(([n, stand, later]) => {
      const s = document.getElementById('s' + n), a = s.querySelector('a.door.dlogo'), img = s.querySelector('.passes img');
      const upright = innerWidth / innerHeight <= 1;
      const R = (b) => [b.left, b.top, b.right, b.bottom];
      const ink = (e) => { const g = document.createRange(); g.selectNodeContents(e); return R(g.getBoundingClientRect()); };
      const i = img.getBoundingClientRect(), k = i.width / (upright ? 786 : 1440);
      const pic = (b) => [i.left + b[0] * k, i.top + b[1] * k, i.left + b[2] * k, i.top + b[3] * k];
      const cs = getComputedStyle(a), logo = a.querySelector('.tlogo').getBoundingClientRect();
      return { name: a.getAttribute('aria-label'), href: a.getAttribute('href'), box: R(a.getBoundingClientRect()), logo: R(logo), tile: logo.height / 1.1,
        op: +cs.opacity, vis: cs.visibility, spot: a.dataset.spot, vw: document.documentElement.clientWidth, vh: innerHeight,
        big: [...s.querySelectorAll(upright ? '.cut .big .pl' : '.cut .big .ln')].map(ink), small: [...(s.querySelector('.words')?.children ?? [])].map(ink),
        things: [stand, ...later].map(pic) };
    }, [n, stand, later]);
    const overlap = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
    const judgeDoor = (r, tag, d) => {
      if (r.name !== d.label || r.href !== (d.open ?? d.path)) bad.push(`${tag}: name "${r.name}", href ${r.href}`);
      if (r.op < 0.99 || r.vis !== 'visible') bad.push(`${tag}: the door is not shown at rest (opacity ${r.op}, ${r.vis})`);
      if (r.tile < 15.9) bad.push(`${tag}: tiles ${r.tile.toFixed(1)} px tall`);
      if (r.box[3] - r.box[1] < 43.9 || r.box[2] - r.box[0] < 43.9) bad.push(`${tag}: touch area ${Math.round(r.box[2] - r.box[0])}x${Math.round(r.box[3] - r.box[1])}`);
      if (r.box[0] < 0 || r.box[1] < 0 || r.box[2] > r.vw || r.box[3] > r.vh) bad.push(`${tag}: off the screen ${r.box.map(Math.round)}`);
      for (const [what, list] of [['giant words', r.big], ['small words', r.small], ['things', r.things]]) for (const b of list) if (overlap(r.box, b)) bad.push(`${tag}: overlaps the ${what} (${spotOf(r)})`);
      const gap = Math.min(...[...r.big, ...r.small, ...r.things].map((b) => Math.max(b[0] - r.logo[2], r.logo[0] - b[2], b[1] - r.logo[3], r.logo[1] - b[3])));
      seen.push([gap, `${tag} ${spotOf(r)} ${gap.toFixed(1)} px`]);
    };
    const spotOf = (r) => r.spot ?? 'scripts off';
    const runs = [...VIEWPORTS.map(([w, h]) => ({ engine: 'chromium', w, h, css: '', label: `${w}x${h}` })), { engine: 'chromium', w: 834, h: 1194, css: '', label: '834x1194' }, { engine: 'chromium', w: 375, h: 667, css: '', label: '375x667' },
      ...BARS.flatMap((bar) => ['away', 'showing'].map((state) => ({ engine: 'chromium', ...barState(bar, state), label: barLabel(bar, state) }))),
      ...['webkit', 'firefox'].flatMap((engine) => [[430, 739], [1512, 860]].map(([w, h]) => ({ engine, w, h, css: '', label: `${w}x${h}` }))),
      { engine: 'webkit', ...barState(BARS[1], 'showing'), label: barLabel(BARS[1], 'showing') }];
    for (const [d, n, board] of doorScenes) {
      if (board) continue;
      for (const run of runs) {
        const form = run.w / run.h <= 1 ? 'phone' : 'desktop', view = viewOf(n, form), dv = view.doors?.[d.venture];
        const tag = `${run.engine} ${run.label} scene ${n}`;
        if (!dv) { bad.push(`${tag}: no door data`); continue; }
        const later = (view.later ?? []).filter((l) => l[0] === view.passes.length).map(([, x, y, w, h]) => [x, y, x + w, y + h]);
        const c = await ctx(run.engine, { viewport: { width: run.w, height: run.h }, bypassCSP: !!run.css });
        if (run.css) await c.addInitScript(INJECT, run.css);
        const p = await open(c, '/', `door ${tag}`);
        // no tell: half way through the light the logo is not shown yet
        await toScene(p, n, 0.5);
        const early = await p.evaluate((n) => +getComputedStyle(document.querySelector(`#s${n} a.door.dlogo`)).opacity, n);
        if (early > 0.01) bad.push(`${tag}: the door shows (${early.toFixed(2)}) before the light rests`);
        await toScene(p, n, 1);
        await settle(p, 450);
        judgeDoor(await doorAt(p, n, dv.thing, later), tag, d);
        await c.close();
      }
      // scripts off, a few sizes: the door is a plain link where build/door.ts puts it
      for (const [w, h] of [[320, 568], [393, 852], [430, 739], [852, 393], [1512, 860], [2428, 1300]]) {
        const form = w / h <= 1 ? 'phone' : 'desktop', view = viewOf(n, form), dv = view.doors[d.venture];
        const later = (view.later ?? []).filter((l) => l[0] === view.passes.length).map(([, x, y, ww, hh]) => [x, y, x + ww, y + hh]);
        const c = await ctx('chromium', { viewport: { width: w, height: h }, javaScriptEnabled: false });
        const p = await open(c, '/', `door scripts off ${w}x${h}`);
        await p.evaluate((n) => document.getElementById('s' + n).scrollIntoView(), n);
        await settle(p, 300);
        judgeDoor(await doorAt(p, n, dv.thing, later), `scripts off ${w}x${h} scene ${n}`, d);
        await c.close();
      }
      // less motion: shown at any point of its scene; the keyboard reaches it with a visible ring
      {
        const c = await ctx('chromium', { viewport: { width: 1512, height: 860 }, reducedMotion: 'reduce' });
        const p = await open(c, '/', 'door less motion');
        await toScene(p, n, 0.2);
        const op = await p.evaluate((n) => +getComputedStyle(document.querySelector(`#s${n} a.door.dlogo`)).opacity, n);
        if (op < 0.99) bad.push(`less motion: the door at ${op} early in its scene`);
        await c.close();
        const k = await ctx('chromium', { viewport: { width: 1512, height: 860 } });
        const q = await open(k, '/', 'door keyboard');
        await toScene(q, n, 1);
        let found = null;
        for (let i = 0; i < 12 && !found; i++) {
          await q.keyboard.press('Tab');
          found = await q.evaluate((n) => { const a = document.activeElement; if (!a?.matches?.(`#s${n} a.door`)) return null; const cs = getComputedStyle(a); return { name: a.getAttribute('aria-label'), ring: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 1, y: scrollY }; }, n);
        }
        if (!found || found.name !== d.label || !found.ring) bad.push(`keyboard: the door ${found ? `has no visible ring (${JSON.stringify(found)})` : 'is not reached by Tab'}`);
        await k.close();
      }
    }
    // the board: one link over the stand and its name tag (the tag carries the arrow), at rest, every listed size
    for (const [d, n, board] of doorScenes) {
      if (!board) continue;
      for (const [engine, w, h] of [...VIEWPORTS.map(([w, h]) => ['chromium', w, h]), ['webkit', 430, 739], ['firefox', 1512, 860]]) {
        const tag = `${engine} ${w}x${h} board`;
        const c = await ctx(engine, { viewport: { width: w, height: h } });
        const p = await open(c, '/', `board door ${tag}`);
        await toBoard(p, { u: 1 });
        const t = BOARD_NAMES.find(([, name]) => name === content.ventures.find((v) => v.id === d.venture)?.name)?.[0];
        const r = await p.evaluate(([n, t, id]) => {
          const a = document.querySelector(`#s${n} a.door.dboard[data-door="${id}"]`), tagEl = document.querySelector(`#s${n} .blab.n-${t}`);
          const R = (e) => { const b = e.getBoundingClientRect(); return [b.left, b.top, b.right, b.bottom]; };
          return { name: a?.getAttribute('aria-label'), box: a ? R(a) : null, tag: tagEl ? R(tagEl) : null, arrow: !!tagEl?.querySelector('svg.arr'), vis: a ? getComputedStyle(a).visibility : '', vw: innerWidth, vh: innerHeight };
        }, [n, t, d.id]);
        if (r.name !== d.label || r.vis !== 'visible' || !r.box || !r.tag || !r.arrow) bad.push(`${tag}: ${JSON.stringify(r)}`);
        else if (r.tag[0] < r.box[0] - 1 || r.tag[1] < r.box[1] - 1 || r.tag[2] > r.box[2] + 1 || r.tag[3] > r.box[3] + 1) bad.push(`${tag}: the name tag ${r.tag.map(Math.round)} is not inside the link ${r.box.map(Math.round)}`);
        await c.close();
      }
    }
    seen.sort((a, b) => a[0] - b[0]);
    ok(!bad.length, 27, `The door at rest: in its scene the logo and arrow, one link named as content/site.json says, tiles at least 16 px, a touch area at least 44 px, on screen and clear of the giant words, the small words and the things the light leaves, at ${VIEWPORTS.map((v) => v.join('x')).join(', ')}, 834x1194, 375x667 and every bar state (Chromium), 430x739 and 1512x860 (WebKit, Firefox), with scripts off at six sizes; not shown half way through the light, shown at once with less motion; Tab reaches it with a visible ring; on the board one link holds the stand and its name tag (with the arrow), every listed size`, `closest: ${seen[0]?.[1] ?? 'none'}`, [...new Set(bad)].slice(0, 8).join('; '));
  });

  /* 28. the hand-over, both ways, against a local copy of the product's site WITH the rulebook's asks */
  if (want(28) && doorScenes.length) await guarded(28, async () => {
    const bad = [], seen = [];
    // the back/forward cache: Chromium's full browser in its own hidden mode (the test tool turns the cache off by default)
    let bf = null;
    try { bf = await lib.chromium.launch({ headless: true, channel: 'chromium', ignoreDefaultArgs: ['--disable-back-forward-cache'] }); } catch { bf = null; }
    if (!bf) warn(28, 'Back/forward cache not tested', "this playwright-core has no full Chromium build; Back is tested without the cache only");
    const RUNS = [
      { engine: 'chromium', browser: bf ?? browsers.chromium, w: 1512, h: 860, scene: 'own', cache: !!bf },
      { engine: 'chromium', browser: bf ?? browsers.chromium, w: 430, h: 739, scene: 'own', cache: !!bf },
      { engine: 'chromium', browser: bf ?? browsers.chromium, w: 1512, h: 860, scene: 'board', cache: !!bf },
      // Safari brings a page back from the cache at the top of the page, and leaves it there when the page keeps its own place
      ...(bf ? [{ engine: 'chromium', browser: bf, w: 430, h: 739, scene: 'own', cache: true, atTop: true }] : []),
      { engine: 'chromium', browser: browsers.chromium, w: 1512, h: 860, scene: 'own', cache: false },
      { engine: 'chromium', browser: browsers.chromium, w: 430, h: 739, scene: 'own', cache: false, key: true },
      { engine: 'chromium', browser: browsers.chromium, w: 1512, h: 860, scene: 'own', cache: false, reduced: true },
      { engine: 'webkit', w: 1512, h: 860, scene: 'own', cache: false },
      { engine: 'firefox', w: 1512, h: 860, scene: 'own', cache: false },
    ];
    for (const run of RUNS) {
      for (const [d, n, board] of doorScenes) {
        if ((run.scene === 'board') !== board) continue;
        const tag = `${run.engine} ${run.w}x${run.h} scene ${n}${run.cache ? ' (cache on)' : ''}${run.key ? ' (keyboard)' : ''}${run.reduced ? ' (less motion)' : ''}${run.atTop ? ' (back at the top, as Safari)' : ''}`;
        const form = run.w / run.h <= 1 ? 'phone' : 'desktop', dv = viewOf(n, form).doors[d.venture];
        step(`hand-over ${tag}`);
        const c = await doorCtx(run.engine === 'chromium' ? run.browser : await useBrowser(run.engine), run.engine, { viewport: { width: run.w, height: run.h }, reducedMotion: run.reduced ? 'reduce' : 'no-preference' });
        const p = await doorPage(c, BASE, '/', tag);
        if (board) await toBoard(p, { u: 1 }); else await toScene(p, n, 1);
        await settle(p, 500);
        const sel = `#s${n} a.door[data-door="${d.id}"]`;
        // the studio's letters now (from its picture and the film data), and where the product's sit at this size
        const letters = await p.evaluate(([n, L, iw]) => { const i = document.querySelector(`#s${n} .passes img`).getBoundingClientRect(), k = i.width / iw; return [i.left + ((L[0] + L[1]) / 2) * k, i.top + L[2] * k]; }, [n, dv.anchor, pictureSizes[viewOf(n, form).passes[0]].size[0]]);
        const fp = d.pictures.find((q) => run.w >= q.from), kt = Math.max(run.w / fp.size[0], run.h / fp.size[1]);
        const theirs = [(run.w - fp.size[0] * kt) / 2 + ((fp.anchor[0] + fp.anchor[1]) / 2) * kt, (run.h - fp.size[1] * kt) / 2 + fp.anchor[2] * kt];
        const b = await p.evaluate((sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel);
        if (run.atTop) await p.evaluate(() => addEventListener('pagehide', () => scrollTo(0, 0)));
        const t0 = Date.now();
        if (run.key) { await p.focus(sel); await p.keyboard.press('Enter'); }
        else if (run.w < 600) await p.touchscreen.tap(b[0], b[1]);
        else await p.mouse.click(b[0], b[1]);
        // during the exit: two thin cream rings, full circles, from the Z (its own scene); the words fading
        if (!run.reduced) {
          await p.waitForTimeout(180);
          const ex = await p.evaluate((sel) => {
            const z = document.querySelector(`${sel} .dz`)?.getBoundingClientRect(), rings = [...document.querySelectorAll('.door-ring')];
            const m = document.querySelector(`${sel} .dz`)?.getAttribute('mask');
            return { mask: m, cls: document.documentElement.className, rings: rings.map((r) => { const cs = getComputedStyle(r); return { round: cs.borderRadius === '50%', colour: cs.borderTopColor, w: cs.borderTopWidth, x: parseFloat(cs.left), y: parseFloat(cs.top) }; }), z: z ? [z.left + z.width / 2, z.top + z.height / 2] : null };
          }, sel).catch(() => null);
          if (!ex || !/door-leaving/.test(ex.cls)) bad.push(`${tag}: no exit (${ex?.cls})`);
          // a route logo: its route draws itself through its mask (no rings)
          else if (!board && d.move === 'route' && (!ex.mask || ex.rings.length)) bad.push(`${tag}: the route is not drawing itself (mask ${ex.mask}, ${ex.rings.length} rings)`);
          else if (!board && d.move === 'press' && (ex.rings.length !== 2 || ex.rings.some((r) => !r.round || r.colour !== 'rgb(240, 232, 216)' || r.w !== '1px' || Math.hypot(r.x - ex.z[0], r.y - ex.z[1]) > 3))) bad.push(`${tag}: rings ${JSON.stringify(ex.rings)} from ${ex.z}`);
          await p.waitForTimeout(220);
          const fade = await p.evaluate(() => [...document.querySelectorAll('#film .scene.on .cut, #film .scene.on .words, #top')].map((e) => +getComputedStyle(e).opacity)).catch(() => [0]);
          if (fade.some((o) => o > 0.05)) bad.push(`${tag}: the words and border still at ${fade.map((o) => o.toFixed(2))} 400 ms after the click`);
        }
        await p.waitForURL((u) => u.pathname.startsWith(d.path), { timeout: 15000 }).catch(() => bad.push(`${tag}: never reached ${d.path}`));
        await settle(p, 2200);
        let L = await doorLog(p);
        const tc = t0, swap = L.find((x) => x[0] === 'swap' && !onDoor(x[2])), reveal = L.find((x) => x[0] === 'reveal' && onDoor(x[2]));
        const group = L.find((x) => x[0] === 'group' && onDoor(x[2])), fin = L.find((x) => x[0] === 'vt-finished' && onDoor(x[2]));
        const vtWant = !run.reduced && run.engine !== 'firefox';
        if (vtWant) {
          if (!swap || !/vt product/.test(swap[3])) bad.push(`${tag}: the picture was not named for the blend (${swap?.[3]})`);
          if (!reveal || reveal[3] !== 'vt' || !group) bad.push(`${tag}: no blend on the product's page (${reveal?.[3]})`);
          else {
            // the blend's group grows from the box to the whole window, and the box carries the studio's letters onto
            // the product's letters
            const kf = JSON.parse(group[3])[0] ?? [];
            const m = /matrix\(1, 0, 0, 1, (-?[\d.]+), (-?[\d.]+)\)/.exec(kf[0]?.[0] ?? '');
            const bw = parseFloat(kf[0]?.[1]), bh = parseFloat(kf[0]?.[2]);
            if (!m || parseFloat(kf[1]?.[1]) !== run.w || parseFloat(kf[1]?.[2]) !== run.h) bad.push(`${tag}: the blend's group ${JSON.stringify(kf)}`);
            else {
              const to = [(letters[0] - +m[1]) * (run.w / bw), (letters[1] - +m[2]) * (run.h / bh)];
              const off = Math.hypot(to[0] - theirs[0], to[1] - theirs[1]);
              seen.push(`${tag} letters ${off.toFixed(1)} px, swap ${swap[1] - tc} ms, blend ${fin ? fin[1] - reveal[1] : '?'} ms`);
              if (off > 3) bad.push(`${tag}: the studio's letters land ${off.toFixed(1)} px from the product's (${to.map(Math.round)} vs ${theirs.map(Math.round)})`);
              if (Math.abs(bw / bh - run.w / run.h) > 0.01) bad.push(`${tag}: the blend's box is not the window's shape (${bw}x${bh})`);
            }
            if (swap[1] - tc < 380 || swap[1] - tc > 900) bad.push(`${tag}: the page left ${swap[1] - tc} ms after the click (the exit is about 440 ms)`);
          }
        } else if (reveal && reveal[3] === 'vt') bad.push(`${tag}: a blend ran (${run.reduced ? 'less motion' : run.engine})`);
        if (run.reduced && swap && swap[1] - tc > 250) bad.push(`${tag}: less motion waited ${swap[1] - tc} ms before leaving`);
        // Back: the studio, on the scene at rest
        await p.goBack({ waitUntil: 'commit' }).catch(() => bad.push(`${tag}: Back failed`));
        await settle(p, 1800);
        await p.waitForFunction(() => document.querySelector('#film .scene.on') && !/door-/.test(document.documentElement.className), null, { timeout: 4000 }).catch(() => {});
        const r = await restState(p, n);
        bad.push(...restBad(r, n, `${tag}, Back`));
        if (!board && r.url !== '/#' + d.id) bad.push(`${tag}, Back: the address is ${r.url}, want /#${d.id}`);
        if (!board) { const dn = await p.evaluate((sel) => +getComputedStyle(document.querySelector(sel)).opacity, sel); if (dn < 0.99) bad.push(`${tag}, Back: the door at ${dn}`); }
        L = await doorLog(p);
        const shows = L.filter((x) => x[0] === 'show' && !onDoor(x[2]));
        const back = shows[shows.length - 1], rev = L.filter((x) => x[0] === 'reveal' && !onDoor(x[2])).pop();
        if (run.cache && back?.[3] !== 'persisted') bad.push(`${tag}, Back: the page was not kept by the back/forward cache (${back?.[3]})`);
        if (run.cache && vtWant && rev?.[3] !== 'vt') bad.push(`${tag}, Back: no blend coming back (${rev?.[3]})`);
        seen.push(`${tag} back: ${back?.[3]} ${rev?.[3] ?? 'no reveal'}`);
        if (c.studioOut.length) bad.push(`${tag}: the studio's page asked another host: ${[...new Set(c.studioOut)].slice(0, 2).join(', ')}`);
        if (c.errs.length) bad.push(...c.errs.slice(0, 2));
        await c.close();
      }
    }
    if (bf) await bf.close();
    ok(!bad.length, 28, `The hand-over, against a local copy of the product's site with the rulebook's asks: a click (a tap on a phone, Enter from the keyboard) plays the exit (TAPZ: two 1 px cream rings, full circles from the Z; TROPHYZ: the red route draws itself; words and border gone by 400 ms), leaves about 0.44 s after it, names the picture for the blend, and the product's page blends its first picture in from a box of the window's shape that carries the studio's anchor onto the product's (TAPZ: the PROXYZ letters; TROPHYZ: the disc; within 3 px); Back lands on the scene at rest (at /#${DOORS_ON.map((d) => d.id).join(', /#')}), words and border back, nothing left over, kept by the back/forward cache with the blend in reverse where the cache is on, and without the cache too; less motion: a plain link, no blend; Chromium 1512x860 and 430x739 (scene 2, the board), WebKit (the blend) and Firefox (the exit, then a cut) at 1512x860; the studio's page asks no other host`, seen.join('; '), [...new Set(bad)].slice(0, 8).join('; '));
  });

  /* 29. against a copy of the product's site WITHOUT the asks: the exit, then a clean cut, and Back */
  if (want(29) && doorScenes.length) await guarded(29, async () => {
    const plain = standinsFromEnv(process.env, 'DOOR_PLAIN_');
    if (!Object.keys(plain).length) warn(29, 'Not tested', 'set DOOR_PLAIN_<ID> (and _HEADERS) to a copy of the product\'s site without the rulebook\'s asks');
    else {
      const bad = [];
      const s2 = await startServer({ dir: DIST, port: PORT + 1, standins: plain });
      for (const [d, n, board] of doorScenes) {
        // only the doors with such a copy
        if (board || !plain[new URL(d.target).origin]) continue;
        const c = await doorCtx(browsers.chromium, 'chromium', { viewport: { width: 1512, height: 860 } });
        const p = await doorPage(c, BASE2, '/', 'clean cut');
        await toScene(p, n, 1);
        await settle(p, 400);
        await p.click(`#s${n} a.door`);
        await p.waitForURL((u) => u.pathname.startsWith(d.path), { timeout: 15000 }).catch(() => bad.push(`never reached ${d.path}`));
        await settle(p, 2000);
        const L = await doorLog(p), reveal = L.find((x) => x[0] === 'reveal' && onDoor(x[2]));
        if (!reveal || reveal[3] !== 'novt') bad.push(`the product's page without the asks: ${reveal?.[3] ?? 'no reveal'}`);
        const first = await p.evaluate(() => [document.title, !!document.getElementById('root')]);
        if (!first[1]) bad.push(`the product's page did not load: ${first[0]}`);
        await p.goBack({ waitUntil: 'commit' });
        await settle(p, 1800);
        bad.push(...restBad(await restState(p, n), n, 'clean cut, Back'));
        if (c.studioOut.length) bad.push(`the studio's page asked another host: ${c.studioOut[0]}`);
        bad.push(...c.errs.slice(0, 2));
        await c.close();
      }
      s2.close();
      ok(!bad.length, 29, 'Against a copy of the product\'s site without the rulebook\'s asks (no blend, no opener policy): the exit, then a clean cut to its page (no blend, no error), and Back lands on the scene at rest (Chromium 1512x860)', 'a clean cut', bad.slice(0, 6).join('; '));
    }
  });

  /* 30. no empty frame: the change between two scenes plays with the scroll (the arriving scene comes in over the one
     leaving, the lines of words leave and arrive one by one); sampled in eleven places through every change, a
     picture and words always show */
  if (want(30)) await guarded(30, async () => {
    const bad = [], seen = [];
    const HIDE = '.big,.small,.note,.tool,.addr{color:transparent !important}.hl,.door{visibility:hidden !important}';
    for (const [engine, w, h] of [['chromium', 430, 739], ['chromium', 1512, 860], ['webkit', 430, 739]]) {
      const c = await ctx(engine, { viewport: { width: w, height: h }, bypassCSP: true });
      const p = await open(c, '/', `changes ${engine} ${w}x${h}`);
      const geo = await p.evaluate(() => ({ vh: document.querySelector('.probe').offsetHeight, band: document.getElementById('top').getBoundingClientRect().bottom, tops: [...document.querySelectorAll('#film .scene')].map((s) => s.offsetTop) }));
      // the picture under the border (on a phone the border is a dark band; on a wide screen the band of its words)
      const box = [0, Math.round(Math.max(geo.band, 90)), w, Math.round(h - Math.max(geo.band, 90))];
      for (let k = 1; k < geo.tops.length; k++) {
        await toScene(p, k, 1);
        const rows = [];
        for (let i = 0; i <= 10; i++) {
          step(`changes ${engine} ${w}x${h} | change ${k} at ${i / 10}`);
          await p.evaluate((y) => scrollTo(0, y), Math.round(geo.tops[k] - geo.vh / 2 + (i / 10 - 0.5) * 0.8 * geo.vh));
          await p.waitForFunction((k) => [k, k + 1].every((n) => [...document.querySelectorAll(`#s${n} .passes img`)].every((im) => im.complete)), k, { timeout: 4000 }).catch(() => {});
          await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
          await settle(p, 200);
          const shown = await p.screenshot();
          await p.evaluate((css) => { const s = document.createElement('style'); s.id = 't-hide'; s.textContent = css; document.head.append(s); }, HIDE);
          await settle(p, 80);
          const hidden = await p.screenshot();
          await p.evaluate(() => document.getElementById('t-hide').remove());
          const [pic] = await lab(hidden, [box]), [ink] = await labInk(shown, hidden, [box]);
          rows.push({ at: i / 10, pic: pic.mean, ink: ink.ink });
        }
        const pic0 = Math.min(rows[0].pic, rows[10].pic), ink0 = Math.min(rows[0].ink, rows[10].ink);
        const tag = `${engine} ${w}x${h} scene ${k} to ${k + 1}`;
        if (!(pic0 > 1) || !(ink0 > 200)) bad.push(`${tag}: the ends show no picture or no words (${pic0.toFixed(1)}, ${ink0} ink px)`);
        const lowPic = rows.reduce((a, r) => (r.pic < a.pic ? r : a)), lowInk = rows.reduce((a, r) => (r.ink < a.ink ? r : a));
        seen.push([lowInk.ink, `${tag}: picture at least ${((100 * lowPic.pic) / pic0).toFixed(0)}% (at ${lowPic.at}), words at least ${lowInk.ink} ink px (at ${lowInk.at})`]);
        for (const r of rows) {
          if (r.pic < 0.5 * pic0) bad.push(`${tag} at ${r.at}: the picture at ${r.pic.toFixed(1)}, its ends ${rows[0].pic.toFixed(1)} and ${rows[10].pic.toFixed(1)}`);
          // a line of the small words is about 2000 to 3000 ink px; the giant words tens of thousands
          if (r.ink < 1000) bad.push(`${tag} at ${r.at}: words ${r.ink} ink px, its ends ${rows[0].ink} and ${rows[10].ink}`);
        }
      }
      await c.close();
    }
    seen.sort((a, b) => a[0] - b[0]);
    ok(!bad.length, 30, 'No empty frame: through every change between two scenes, eleven places along the scroll, a picture always shows (at least half the darker end\'s light) and words always show (at least 1000 ink px, about half a line of the small words; the giant lines at the top leave before the next ones arrive, so for a moment the words at the foot carry the screen) (Chromium 430x739 and 1512x860, WebKit 430x739)', seen.slice(0, 3).map((s) => s[1]).join('; '), bad.slice(0, 8).join('; '));
  });

  /* 31. the rest of every scene is the composition as built: at rest nothing of the film's motion is left on it */
  if (want(31)) await guarded(31, async () => {
    const bad = [];
    for (const [engine, w, h] of [['chromium', 430, 739], ['chromium', 393, 852], ['chromium', 1512, 860], ['chromium', 2428, 1300], ['webkit', 430, 739], ['firefox', 1512, 860]]) {
      const c = await ctx(engine, { viewport: { width: w, height: h } });
      const p = await open(c, '/', `rest ${engine} ${w}x${h}`);
      for (let n = 1; n <= content.scenes.length; n++) {
        await toScene(p, n, 1);
        await settle(p, 300);
        const r = await p.evaluate((n) => {
          const s = document.getElementById('s' + n), cs = (e) => getComputedStyle(e), out = [];
          const moved = (e) => { const t = cs(e).transform; return t !== 'none' && t !== 'matrix(1, 0, 0, 1, 0, 0)'; };
          const lay = s.querySelector('.layer');
          if (cs(lay).visibility !== 'visible' || +cs(lay).opacity !== 1) out.push(`its stage at ${cs(lay).opacity}, ${cs(lay).visibility}`);
          for (const e of [...s.querySelectorAll('.passes, .frame, .cam, .cut, .lbox, .lens, .cut .big .ln, .cut .big .pl, .addr, .words > *, .words .big .ln, .words .big .pl, .door.dlogo')]) {
            if (moved(e)) out.push(`${e.className} moved (${cs(e).transform})`);
            if (+cs(e).opacity !== 1) out.push(`${e.className} at ${cs(e).opacity}`);
          }
          // nothing that moves keeps a layer of its own at rest (a picture or a word on its own layer may be drawn a
          // little softer than the page draws it)
          for (const e of [...s.querySelectorAll('.pass, .lbox, .lens, .cut .big .ln, .cut .big .pl, .addr, .words > *, .words .big .ln, .words .big .pl')]) {
            if (cs(e).willChange !== 'auto') out.push(`${e.className || e.tagName} keeps a layer (${cs(e).willChange})`);
          }
          for (const o of document.querySelectorAll('#film .scene')) {
            if (o === s) continue;
            const l = o.querySelector('.layer');
            if (cs(l).visibility === 'visible' && +cs(l).opacity > 0) out.push(`${o.id} also shows (${cs(l).opacity})`);
          }
          return out;
        }, n);
        for (const x of r) bad.push(`${engine} ${w}x${h} scene ${n}: ${x}`);
      }
      await c.close();
    }
    ok(!bad.length, 31, 'At rest every scene is the composition as built: its stage alone at full strength, its picture, its giant words, every line of words and its door in place, unmoved and at full strength, none of them on a layer of its own (Chromium 430x739, 393x852, 1512x860, 2428x1300; WebKit 430x739; Firefox 1512x860)', 'all seven, every size', [...new Set(bad)].slice(0, 8).join('; '));
  });

  /* ---------- build 12: the whole film as one live 3D world (src/world/) ---------- */
  // The live film needs a real graphics chip: Chromium's own build with the chip (channel "chromium", hidden), and
  // WebKit. The hidden Chromium shell the other tests use draws WebGL in software; there the film rightly falls back to
  // the still film (test 34 proves it). The page root carries data-world: the scenes drawn live now, then those whose
  // stills are in the chip, then the first frame's time in ms.
  // (a function, never a string: the page's policy allows no evaluated strings)
  const LIVE = (n) => ((document.documentElement.dataset.world ?? '').split('|')[0] ?? '').split(',').includes(String(n));
  const restAt = (p, n) => p.evaluate((n) => { const s = document.getElementById('s' + n), vh = document.querySelector('.probe').offsetHeight; scrollTo(0, Math.round(s.offsetTop + 0.8 * Math.max(0, s.offsetHeight - vh)) + 1); }, n);
  /** the share of pixels whose largest channel differs by more than lim, and the mean of that difference, in a box */
  async function diff(a, b, box, lim = 24) {
    return labPage.evaluate(async ([a64, b64, box, decode, lim]) => {
      const dec = (0, eval)(decode);
      const [A, B] = await Promise.all([dec(a64), dec(b64)]);
      const [x, y, w, h] = box.map(Math.round);
      let n = 0, sum = 0, over = 0;
      for (let yy = y; yy < Math.min(A.height, y + h); yy++) for (let xx = x; xx < Math.min(A.width, x + w); xx++) {
        const i = (yy * A.width + xx) * 4;
        const d = Math.max(Math.abs(A.data[i] - B.data[i]), Math.abs(A.data[i + 1] - B.data[i + 1]), Math.abs(A.data[i + 2] - B.data[i + 2]));
        sum += d; n++; if (d > lim) over++;
      }
      return { mean: n ? sum / n : 0, over: n ? over / n : 0 };
    }, [a.toString('base64'), b.toString('base64'), box, decode, lim]);
  }
  const SIZES12 = [[430, 739, 3, 'phone'], [1512, 860, 2, 'laptop']];
  const gpuOk = !!browsers.gpu;
  if (!gpuOk && [32, 33, 34, 35, 36].some(want)) warn(32, 'LIVE FILM NOT TESTED', 'no Chromium with a graphics chip (playwright-core\'s chromium channel) could start');

  /* 32. the live film loads at the first sign of intent, never with the first screen */
  if (want(32) && gpuOk) await guarded(32, async () => {
    const bad = [], seen = [];
    for (const [w, h, dpr, name] of SIZES12) {
      const c = await ctx('gpu', { viewport: { width: w, height: h }, deviceScaleFactor: dpr });
      const asked = [];
      c.on('request', (r) => { if (/\/assets\/(film3d|world)-/.test(r.url())) asked.push(r.url().split('/').pop()); });
      const p = await open(c, '/', `intent ${name}`);
      await settle(p, 3000);
      if (asked.length) bad.push(`${name}: ${asked.join(', ')} asked for before any sign of intent`);
      if (w < 600) await p.touchscreen.tap(w / 2, h / 2); else await p.mouse.move(w / 2, h / 2);
      const t0 = Date.now();
      const live = await p.waitForFunction(LIVE, 1, { timeout: 15000 }).then(() => true, () => false);
      if (!live) bad.push(`${name}: scene 1 not live 15 s after the first sign of intent (${await p.evaluate(() => document.documentElement.dataset.world)})`);
      seen.push(`${name} live ${((Date.now() - t0) / 1000).toFixed(1)} s after it`);
      await c.close();
    }
    ok(!bad.length, 32, 'The live film loads at the first sign of intent (a touch, the wheel, a key, the pointer moving), never before: no request for its script or shapes in the first 3 s, then scene 1 live (Chromium with a graphics chip, phone 430x739 and laptop 1512x860)', seen.join(', '), bad.join('; '));
  });

  /* 33. at rest every scene drawn live is its still */
  if (want(33) && gpuOk) await guarded(33, async () => {
    const bad = [], seen = [];
    for (const [engine, [w, h, dpr, name]] of [...SIZES12.map((s) => ['gpu', s]), ['webkit', [1512, 860, 2, 'laptop']]]) {
      const c = await ctx(engine, { viewport: { width: w, height: h }, deviceScaleFactor: dpr });
      const still = await open(c, '/', `rest still ${engine} ${name}`);
      const live = await open(c, '/', `rest live ${engine} ${name}`);
      await settle(live, 600);
      await live.keyboard.press('Shift');
      // below the border (its clock ticks)
      const band = await still.evaluate(() => Math.ceil(document.getElementById('top').getBoundingClientRect().bottom) + 4);
      const box = [0, band * dpr, w * dpr, (h - band) * dpr];
      let worst = { mean: 0, over: 0, n: 0 };
      for (let n = 1; n <= content.scenes.length; n++) {
        step(`rest ${engine} ${name} | scene ${n}`);
        await restAt(still, n); await restAt(live, n);
        await toScene(still, n, 1);
        const ok2 = await live.waitForFunction(LIVE, n, { timeout: 20000 }).then(() => true, () => false);
        if (!ok2) { bad.push(`${engine} ${name} scene ${n}: not live at rest`); continue; }
        await settle(live, 700); await settle(still, 300);
        const [a, b] = [await still.screenshot(), await live.screenshot()];
        const d = await diff(a, b, box);
        if (d.mean > worst.mean) worst = { ...d, n };
        if (!(d.mean <= 2.5) || !(d.over <= 0.025)) bad.push(`${engine} ${name} scene ${n}: mean difference ${d.mean.toFixed(2)} of 255, ${(100 * d.over).toFixed(2)}% of pixels more than 24 apart`);
      }
      seen.push(`${engine} ${name} largest scene ${worst.n} ${worst.mean.toFixed(2)} (${(100 * worst.over).toFixed(2)}%)`);
      await c.close();
    }
    ok(!bad.length, 33, 'At rest every scene drawn live is its still: below the border a mean difference of at most 2.5 of 255 and at most 2.5% of the pixels more than 24 apart, all seven scenes (Chromium with a graphics chip, phone 430x739 at 3 and laptop 1512x860 at 2; WebKit laptop)', seen.join('; '), bad.slice(0, 8).join('; '));
  });

  /* 34. every way the live film cannot run shows the still film, never a black or empty frame */
  if (want(34)) await guarded(34, async () => {
    const bad = [], seen = [];
    const pictureLight = async (p) => (await lab(await p.screenshot(), [[0, 120, 1512, 600]]))[0].mean;
    const run = async (engine, label, opts, init, act) => {
      const c = await ctx(engine, { viewport: { width: 1512, height: 860 }, ...opts });
      const asked = [];
      c.on('request', (r) => { if (/\/assets\/(film3d|world)-/.test(r.url())) asked.push(r.url()); });
      if (init) await c.addInitScript(init);
      const p = await open(c, '/', `fallback ${label}`);
      await settle(p, 600);
      await p.mouse.move(700, 400); await p.keyboard.press('Shift');
      await restAt(p, 2); await toScene(p, 2, 1);
      await settle(p, 2500);
      const r = await act(p, asked);
      const st = await p.evaluate(() => ({ world: document.documentElement.dataset.world ?? '', canvas: !!document.querySelector('canvas.world'), hidden: [...document.querySelectorAll('#s2 .passes picture')].filter((e) => getComputedStyle(e).visibility === 'hidden').length, pics: document.querySelectorAll('#s2 .passes picture').length }));
      const light = await pictureLight(p);
      seen.push(`${label} ${light.toFixed(1)}`);
      if (!(light > 20)) bad.push(`${label}: the picture's light ${light.toFixed(1)}`);
      if (r) bad.push(...r.map((x) => `${label}: ${x}`));
      await c.close();
      return st;
    };
    // less motion: never loaded
    if (gpuOk) {
      const s = await run('gpu', 'less motion', { reducedMotion: 'reduce' }, null, async (p, asked) => (asked.length ? ['the live film was asked for'] : null));
      if (s.canvas || s.world) bad.push('less motion: a live canvas');
      // no WebGL 2
      const s2 = await run('gpu', 'no WebGL', {}, () => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (k, o) { return k === 'webgl2' ? null : g.call(this, k, o); }; }, async () => null);
      if (s2.canvas || s2.hidden || s2.pics !== 3) bad.push(`no WebGL: ${JSON.stringify(s2)}`);
      // a context lost: the still film at once; given back: live again
      await run('gpu', 'context lost', {}, null, async (p) => {
        const out = [];
        if (!(await p.evaluate(LIVE, 2))) return ['not live before the loss'];
        const before = await pictureLight(p);
        await p.evaluate(() => { window.__lose = document.querySelector('canvas.world').getContext('webgl2').getExtension('WEBGL_lose_context'); window.__lose.loseContext(); });
        await settle(p, 120);
        const during = await p.evaluate(() => [...document.querySelectorAll('#s2 .passes picture')].filter((e) => getComputedStyle(e).visibility === 'hidden').length);
        const light = await pictureLight(p);
        if (during) out.push(`${during} still pictures still hidden after the loss`);
        if (Math.abs(light - before) > 2) out.push(`the light ${before.toFixed(1)} before, ${light.toFixed(1)} after the loss`);
        await p.evaluate(() => window.__lose.restoreContext());
        await p.mouse.wheel(0, 30); await settle(p, 600); await p.mouse.wheel(0, -30);
        const back = await p.waitForFunction(LIVE, 2, { timeout: 10000 }).then(() => true, () => false);
        if (!back) out.push('not live again once the context came back');
        return out;
      });
    }
    // a chip too slow for it (the hidden Chromium shell draws WebGL in software): the still film for good
    const s4 = await run('chromium', 'software chip', {}, null, async () => null);
    if (s4.canvas || s4.hidden || !/^\|/.test(s4.world || '|')) bad.push(`software chip: ${JSON.stringify(s4)}`);
    ok(!bad.length, 34, 'Every way the live film cannot run shows the still film, never a black or empty frame: less motion (never loaded), no WebGL 2, a lost context (the stills at once, live again once it comes back), a chip too slow (Chromium in software: given up after its first frame) (laptop 1512x860; the picture\'s light in each)', seen.join(', '), bad.slice(0, 8).join('; '));
  });

  /* 35. no stall over 50 ms anywhere in the film, at a fourth of a laptop's speed */
  if (want(35) && gpuOk) await guarded(35, async () => {
    const bad = [], seen = [];
    for (const [w, h, dpr, name] of SIZES12) {
      let best = null;
      for (let run = 0; run < 2 && !(best && best.max <= 50); run++) {
        const c = await ctx('gpu', { viewport: { width: w, height: h }, deviceScaleFactor: dpr });
        await c.addInitScript(() => { window.__ft = []; let last = 0; const f = (t) => { if (last) window.__ft.push([t - last, scrollY]); last = t; requestAnimationFrame(f); }; requestAnimationFrame(f); });
        const p = await open(c, '/', `stall ${name}`);
        const cdp = await c.newCDPSession(p);
        await settle(p, 800);
        if (w < 600) await p.touchscreen.tap(w / 2, h / 2); else await p.mouse.move(w / 2, h / 2);
        await p.waitForFunction(LIVE, 1, { timeout: 15000 }).catch(() => {});
        await settle(p, 1500);
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
        await p.evaluate(() => { window.__ft.length = 0; });
        const H = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
        step(`stall ${name} | through the film and back`);
        for (const dir of [1, -1]) {
          for (let i = 0; i < 500; i++) {
            if (w < 600) {
              const y0 = dir > 0 ? 650 : 60;
              await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: w / 2, y: y0 }] });
              for (let k = 1; k <= 20; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: w / 2, y: y0 - dir * k * 30 }] }); await p.waitForTimeout(40); }
              await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
              await p.waitForTimeout(250);
            } else { await p.mouse.wheel(0, 100 * dir); await p.waitForTimeout(111); }
            const y = await p.evaluate(() => scrollY);
            if ((dir > 0 && y >= H - 2) || (dir < 0 && y <= 0)) break;
          }
          await settle(p, 800);
        }
        const ft = await p.evaluate(() => window.__ft);
        const d = ft.map((r) => r[0]).sort((a, b) => a - b);
        const r = { frames: d.length, median: d[Math.floor(d.length / 2)], max: d[d.length - 1], at: ft.reduce((a, x) => (x[0] > a[0] ? x : a), [0, 0])[1] };
        if (!best || r.max < best.max) best = r;
        await c.close();
      }
      seen.push(`${name}: ${best.frames} frames, median ${best.median.toFixed(1)} ms, worst ${best.max.toFixed(1)} ms`);
      if (!(best.max <= 50)) bad.push(`${name}: a frame of ${best.max.toFixed(1)} ms at ${best.at} px`);
    }
    ok(!bad.length, 35, 'No stall over 50 ms through the whole live film and back, the processor at a fourth of its speed: a mouse wheel of 100 px every 111 ms (about 900 px a second) at 1512x860, drags of 600 px at about 700 px a second at 430x739 (Chromium with a graphics chip; a second run if the first one shows one)', seen.join('; '), bad.join('; '));
  });

  /* 36. the doors with the live film: the hand-over, and Back to the scene at rest, live again */
  if (want(36) && gpuOk) await guarded(36, async () => {
    const bad = [], seen = [];
    for (const d of DOORS_ON) {
      for (const n of (d.scenes ?? []).filter((x) => !content.scenes[x - 1]?.board)) {
        const c = await doorCtx(browsers.gpu, 'chromium', { viewport: { width: 1512, height: 860 } });
        const p = await doorPage(c, BASE, '/', `live door ${d.id}`);
        await settle(p, 600);
        await p.mouse.move(700, 400);
        await restAt(p, n); await toScene(p, n, 1);
        if (!(await p.waitForFunction(LIVE, n, { timeout: 20000 }).then(() => true, () => false))) { bad.push(`${d.id}: scene ${n} not live`); await c.close(); continue; }
        await settle(p, 800);
        const y0 = await p.evaluate(() => scrollY);
        await p.click(`#s${n} a.dlogo[data-door="${d.id}"]`);
        const left = await p.waitForURL((u) => u.pathname.startsWith(d.path), { timeout: 8000 }).then(() => true, () => false);
        if (!left) bad.push(`${d.id}: the door did not open its page`);
        await settle(p, 1200);
        await p.goBack();
        await settle(p, 1500);
        const back = await p.evaluate(() => ({ hash: location.hash, y: scrollY, active: document.querySelector('#film .scene.on')?.id }));
        const live = await p.waitForFunction(LIVE, n, { timeout: 15000 }).then(() => true, () => false);
        if (back.active !== `s${n}` || Math.abs(back.y - y0) > 3) bad.push(`${d.id}: back at ${back.active} ${back.y} px, left from s${n} ${y0} px`);
        if (!live) bad.push(`${d.id}: not live again after Back`);
        seen.push(`${d.id} scene ${n}: opened, back at rest${live ? ', live' : ''}`);
        bad.push(...c.studioOut.map((x) => `${d.id}: the studio asked another host: ${x}`), ...c.errs.map((x) => `${d.id}: ${x}`));
        await c.close();
      }
    }
    ok(!bad.length, 36, 'The doors from a scene drawn live: the click opens the product\'s page, Back lands on the scene at rest and the live film comes back (Chromium with a graphics chip, 1512x860; the blend itself is test 28)', seen.join('; '), bad.join('; '));
  });

  /* 5. the email pictures */
  if (want(5)) await guarded(5, async () => {
    const bad = [];
    for (const [name, sum] of Object.entries(EMAIL_PICTURES)) {
      for (const dir of ['public', 'dist']) {
        const f = join(ROOT, dir, name);
        const got = existsSync(f) ? createHash('sha256').update(readFileSync(f)).digest('hex') : 'missing';
        if (got !== sum) bad.push(`${dir}/${name} ${got.slice(0, 12)}`);
      }
    }
    ok(!bad.length, 5, 'The four email pictures: same sha256 as recorded, in public/ and in dist/', 'all eight equal', bad.join('; '));
  });

  /* 4. requests to other hosts, cookies (collected across every page opened above; always, whatever ran) */
  {
    const cookies = [...cookieJar];
    for (const c of contexts) cookies.push(...(await c.cookies()));
    ok(!outside.length, 4, 'Zero requests to any other host (all pages, all three engines)', 'none', [...new Set(outside)].slice(0, 6).join('; '));
    ok(!cookies.length, 4, 'Zero cookies', 'none', cookies.map((k) => k.name).join(', '));
    ok(!errors.length, 6, 'Zero console errors and page errors (including content security policy reports) in every run above', 'none', [...new Set(errors)].slice(0, 8).join('; '));
  }

  if (retried.length) warn(4, 'Pages a hidden browser did not load in 30 s, loaded at the second try', retried.join('; '));
  for (const b of Object.values(browsers)) await b.close();
  server.close();
  const failed = results.filter((r) => r === 'FAIL').length;
  console.log(`\ncheck: ${results.filter((r) => r === 'PASS').length} passed, ${failed} failed, ${results.filter((r) => r === 'WARN').length} warnings`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
