#!/usr/bin/env node
// A small local server for dist/ that follows vercel.json as closely as a local server can:
// trailing slash, redirects, headers (including the content security policy), real files, then 404.html with status 404.
// Text is sent compressed (brotli or gzip), as the host does. Only for checks on this machine.
//
//   node scripts/serve.mjs [port] [folder]      (default 4301, dist)
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};
const TEXT = /^(text\/|application\/(json|xml)|image\/svg)/;

/** Turns a host path pattern (the forms used in vercel.json) into a regular expression, like the host's matcher:
 *  ignores capitals, allows one trailing slash. Supports literal text, (regex), :name(regex), :name. */
export function patternToRegExp(src) {
  let out = '', i = 0;
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
      const m = /^:[A-Za-z_]\w*/.exec(src.slice(i)); i += m[0].length;
      if (src[i] === '(') out += group(); else out += '([^\\/#\\?]+?)';
    } else if (ch === '(') out += group();
    else { out += ch.replace(/[.*+?^${}|[\]\\/]/g, '\\$&'); i++; }
  }
  return new RegExp('^' + out + '[\\/#\\?]?$', 'i');
}

export function loadRules(dir) {
  const cfg = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));
  if (cfg.rewrites?.length || cfg.routes?.length) throw new Error('serve: vercel.json has rewrites or routes; this server does not copy them');
  return {
    dir,
    trailingSlash: cfg.trailingSlash === true,
    redirects: (cfg.redirects ?? []).map((r) => ({ re: patternToRegExp(r.source), to: r.destination, status: r.statusCode ?? (r.permanent ? 308 : 307) })),
    headers: (cfg.headers ?? []).map((h) => ({ re: patternToRegExp(h.source), headers: h.headers })),
  };
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
    const send = (status, headers, body) => {
      for (const h of rules.headers) if (h.re.test(path)) for (const { key, value } of h.headers) headers[key] = value;
      headers['Cache-Control'] ??= 'public, max-age=0, must-revalidate';
      const enc = String(req.headers['accept-encoding'] ?? '');
      if (body && TEXT.test(headers['Content-Type'] ?? '')) {
        if (enc.includes('br')) { body = brotliCompressSync(body); headers['Content-Encoding'] = 'br'; }
        else if (enc.includes('gzip')) { body = gzipSync(body); headers['Content-Encoding'] = 'gzip'; }
      }
      if (body) headers['Content-Length'] = body.length;
      res.writeHead(status, headers);
      res.end(req.method === 'HEAD' ? undefined : body);
    };
    if (rules.trailingSlash && !path.endsWith('/') && !extname(path)) return send(308, { Location: path + '/' + url.search });
    for (const r of rules.redirects) if (r.re.test(path)) return send(r.status, { Location: r.to });
    const file = fileFor(rules.dir, path);
    if (file) return send(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' }, readFileSync(file));
    const nf = fileFor(rules.dir, '/404.html');
    return send(404, { 'Content-Type': 'text/html; charset=utf-8' }, nf ? readFileSync(nf) : Buffer.from('not found'));
  };
}

export function startServer({ dir = join(ROOT, 'dist'), port = 4301 } = {}) {
  const server = createServer(handler(loadRules(dir)));
  return new Promise((res, rej) => { server.once('error', rej); server.listen(port, '127.0.0.1', () => res(server)); });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2] || 4301);
  const dir = resolve(process.argv[3] || join(ROOT, 'dist'));
  startServer({ dir, port }).then(() => console.log(`serving ${dir} at http://127.0.0.1:${port}/`));
}
