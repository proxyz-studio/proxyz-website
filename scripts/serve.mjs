#!/usr/bin/env node
// A small local server for dist/ that follows vercel.json as closely as a local server can:
// trailing slash, redirects, headers (including the content security policy), real files, the doors' rewrites, then
// 404.html with status 404. Text is sent compressed (brotli or gzip), as the host does. Only for checks on this machine.
//
// A rewrite to another host (a product's door, /tapz/ to its own site) is NEVER fetched from that host: it is served
// from a local stand-in folder (a copy of that site's build) with that site's own header rules, given per door in
// content/site.json by its id: DOOR_STANDIN_TAPZ=<folder> and DOOR_STANDIN_TAPZ_HEADERS=<its vercel.json>. Without a
// stand-in the door answers 502. The studio's own header rules are added only where vercel.json says they apply (by
// the address asked for, as the host matches them), so a door path shows exactly what the studio adds to it.
//
//   node scripts/serve.mjs [port] [folder]      (default 4301, dist)
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { brotliCompressSync, constants as Z, gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.mjs': 'text/javascript; charset=utf-8',
};
const TEXT = /^(text\/|application\/(json|xml)|image\/svg)/;
/** Compressed bodies, kept: a door's big script (megabytes) would take seconds to compress on every request. */
const packed = new Map();
function pack(body, enc) {
  const key = enc + ':' + createHash('sha1').update(body).digest('hex');
  let out = packed.get(key);
  if (!out) {
    out = enc === 'br' ? brotliCompressSync(body, { params: { [Z.BROTLI_PARAM_QUALITY]: body.length > 512 * 1024 ? 5 : 11 } }) : gzipSync(body);
    packed.set(key, out);
  }
  return out;
}

/** Turns a host path pattern (the forms used in vercel.json) into a regular expression, as strict as the host's
 *  matcher: capitals count and the path must end where the pattern ends (no optional trailing slash). The host also
 *  adds the trailing slash before it looks at the redirects, as handler() does. Supports literal text, (regex),
 *  :name(regex), :name and :name* (the rest of the path, empty too). The names of the :name parts are kept on the
 *  expression as .keys (for a rewrite's destination). */
export function patternToRegExp(src) {
  let out = '', i = 0;
  const keys = [];
  const group = () => { // reads a balanced ( ... ) starting at src[i] === '('
    let depth = 0, j = i;
    for (; j < src.length; j++) {
      if (src[j] === '\\') { j++; continue; }
      if (src[j] === '(') depth++;
      else if (src[j] === ')' && --depth === 0) break;
    }
    const g = src.slice(i, j + 1); i = j + 1; return g;
  };
  while (i < src.length) {
    const ch = src[i];
    if (ch === ':') {
      const m = /^:([A-Za-z_]\w*)/.exec(src.slice(i)); i += m[0].length;
      keys.push(m[1]);
      if (src[i] === '(') out += group();
      else if (src[i] === '*') { i++; out += '(.*)'; }
      else out += '([^\\/#\\?]+?)';
    } else if (ch === '(') { keys.push(null); out += group(); }
    else { out += ch.replace(/[.*+?^${}|[\]\\/]/g, '\\$&'); i++; }
  }
  const re = new RegExp('^' + out + '$');
  re.keys = keys;
  return re;
}

/** The stand-ins named in the environment for the doors of content/site.json: { [target origin]: { dir, headers } }. */
export function standinsFromEnv(env = process.env, prefix = 'DOOR_STANDIN_') {
  const doors = JSON.parse(readFileSync(join(ROOT, 'content/site.json'), 'utf8')).doors ?? [];
  const out = {};
  for (const d of doors) {
    const k = prefix + d.id.toUpperCase(), dir = env[k];
    if (!d.target || !dir) continue;
    const hf = env[k + '_HEADERS'];
    const hs = hf && existsSync(hf) ? JSON.parse(readFileSync(hf, 'utf8')).headers ?? [] : [];
    out[new URL(d.target).origin] = { dir: resolve(dir), headers: hs.map((h) => ({ re: patternToRegExp(h.source), headers: h.headers })) };
  }
  return out;
}

export function loadRules(dir, standins = {}) {
  const cfg = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));
  if (cfg.routes?.length) throw new Error('serve: vercel.json has routes; this server does not copy them');
  return {
    dir,
    standins,
    trailingSlash: cfg.trailingSlash === true,
    redirects: (cfg.redirects ?? []).map((r) => ({ re: patternToRegExp(r.source), to: r.destination, status: r.statusCode ?? (r.permanent ? 308 : 307) })),
    rewrites: (cfg.rewrites ?? []).map((r) => ({ re: patternToRegExp(r.source), to: r.destination })),
    headers: (cfg.headers ?? []).map((h) => ({ re: patternToRegExp(h.source), headers: h.headers })),
  };
}

/** A rewrite's destination with the matched parts put in (":path*" and ":path" by name). */
function destination(rule, m) {
  let to = rule.to;
  rule.re.keys.forEach((k, i) => { if (k) to = to.replace(new RegExp(`:${k}\\*?`, 'g'), m[i + 1] ?? ''); });
  return to;
}

function fileFor(dir, path) {
  const p = decodeURIComponent(path);
  if (p.includes('..')) return null;
  const tries = p.endsWith('/') ? [join(dir, p, 'index.html')] : [join(dir, p)];
  for (const t of tries) { try { if (statSync(t).isFile()) return t; } catch { /* none */ } }
  return null;
}

export function handler(rules) {
  return (req, res) => {
    const url = new URL(req.url, 'http://local');
    const path = url.pathname;
    /** own: the headers of the answer itself (a stand-in's own rules); then the studio's rules for this address.
     *  Sent as a list, so a header that both add goes out twice (as a host might), where a check can see it. */
    const send = (status, own, body) => {
      const list = Object.entries(own);
      for (const h of rules.headers) if (h.re.test(path)) for (const { key, value } of h.headers) {
        const at = list.findIndex(([k]) => k.toLowerCase() === key.toLowerCase());
        // the studio's own Content-Type rule (the speculation rules file) replaces the type by extension
        if (at >= 0 && key.toLowerCase() === 'content-type' && !own.__door) list[at] = [key, value]; else list.push([key, value]);
      }
      const get = (k) => list.find(([n]) => n.toLowerCase() === k.toLowerCase())?.[1];
      if (!get('Cache-Control')) list.push(['Cache-Control', 'public, max-age=0, must-revalidate']);
      const enc = String(req.headers['accept-encoding'] ?? '');
      if (body && TEXT.test(get('Content-Type') ?? '')) {
        if (enc.includes('br')) { body = pack(body, 'br'); list.push(['Content-Encoding', 'br']); }
        else if (enc.includes('gzip')) { body = pack(body, 'gzip'); list.push(['Content-Encoding', 'gzip']); }
      }
      if (body) list.push(['Content-Length', String(body.length)]);
      res.writeHead(status, list.filter(([k]) => k !== '__door').flat());
      res.end(req.method === 'HEAD' ? undefined : body);
    };
    if (rules.trailingSlash && !path.endsWith('/') && !extname(path)) return send(308, { Location: path + '/' + url.search });
    for (const r of rules.redirects) if (r.re.test(path)) return send(r.status, { Location: r.to });
    const file = fileFor(rules.dir, path);
    if (file) return send(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' }, readFileSync(file));
    // the doors: a rewrite to another host is served from its local stand-in, never fetched
    for (const r of rules.rewrites) {
      const m = r.re.exec(path);
      if (!m) continue;
      const to = new URL(destination(r, m), 'http://local');
      if (to.origin === 'http://local') { req.url = to.pathname + url.search; return handler({ ...rules, rewrites: [] })(req, res); }
      const st = rules.standins?.[to.origin];
      if (!st) return send(502, { __door: '1', 'Content-Type': 'text/plain; charset=utf-8' }, Buffer.from(`serve: no local stand-in for ${to.origin} (set DOOR_STANDIN_<ID>)`));
      const own = { __door: '1' };
      for (const h of st.headers) if (h.re.test(to.pathname)) for (const { key, value } of h.headers) own[key] = value;
      const f = fileFor(st.dir, to.pathname);
      if (!f) return send(404, { ...own, 'Content-Type': 'text/plain; charset=utf-8' }, Buffer.from('not found'));
      return send(200, { 'Content-Type': TYPES[extname(f)] ?? 'application/octet-stream', ...own }, readFileSync(f));
    }
    const nf = fileFor(rules.dir, '/404.html');
    return send(404, { 'Content-Type': 'text/html; charset=utf-8' }, nf ? readFileSync(nf) : Buffer.from('not found'));
  };
}

export function startServer({ dir = join(ROOT, 'dist'), port = 4301, standins = standinsFromEnv() } = {}) {
  const server = createServer(handler(loadRules(dir, standins)));
  return new Promise((res, rej) => { server.once('error', rej); server.listen(port, '127.0.0.1', () => res(server)); });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2] || 4301);
  const dir = resolve(process.argv[3] || join(ROOT, 'dist'));
  startServer({ dir, port }).then((s) => {
    console.log(`serving ${dir} at http://127.0.0.1:${port}/`);
    for (const [o, st] of Object.entries(loadRules(dir, standinsFromEnv()).standins)) console.log(`  door ${o} from the stand-in ${st.dir}`);
    return s;
  });
}
