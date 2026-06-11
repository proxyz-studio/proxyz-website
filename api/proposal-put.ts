/* POST /api/proposal-put   — admin publish endpoint
 *
 * Header:  x-proposal-admin: <PROPOSAL_ADMIN_SECRET>
 * Body:    { slug, code, title?, html }
 *
 * Stores a self-contained proposal HTML document + its access code + meta
 * in Redis, making https://proxyz.studio/p/<slug> live immediately — no
 * git push, no rebuild. Driven by scripts/publish-proposal.sh.
 *
 * Security: timing-safe secret check; non-POST and bad/missing header are
 * rejected without detail; the stored HTML and code are never logged or
 * echoed back in any response.
 *
 * Size: Upstash REST requests cap at 1 MB, so the HTML is rejected above
 * 950 KB and the response carries a warning above 900 KB.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getRedis,
  htmlKey,
  codeKey,
  metaKey,
  safeSlug,
  safeCode,
  safeCompare,
  coerceMeta,
  HTML_WARN_BYTES,
  HTML_MAX_BYTES,
  type ProposalMeta,
} from './_lib/proposal-store.js';

export const config = { runtime: 'nodejs' };

const MAX_TITLE = 200;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const adminSecret = process.env.PROPOSAL_ADMIN_SECRET;
  if (!adminSecret) {
    return res.status(500).json({ error: 'admin_not_configured' });
  }

  const submitted = req.headers['x-proposal-admin'];
  if (
    typeof submitted !== 'string' ||
    !safeCompare(submitted, adminSecret)
  ) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;

  const slug = safeSlug(body.slug);
  if (!slug) {
    return res
      .status(400)
      .json({ error: 'bad_slug', detail: 'slug must match [a-z0-9-]{2,40}' });
  }

  const code = safeCode(body.code);
  if (!code) {
    return res
      .status(400)
      .json({ error: 'bad_code', detail: 'code must be exactly 4 digits' });
  }

  const html = body.html;
  if (typeof html !== 'string' || html.trim().length === 0) {
    return res.status(400).json({ error: 'bad_html' });
  }
  const htmlBytes = Buffer.byteLength(html, 'utf8');
  if (htmlBytes > HTML_MAX_BYTES) {
    return res.status(413).json({
      error: 'html_too_large',
      detail: `html is ${htmlBytes} bytes; max ${HTML_MAX_BYTES} (Upstash 1 MB request limit)`,
    });
  }

  const title =
    typeof body.title === 'string' && body.title.trim().length > 0
      ? body.title.trim().slice(0, MAX_TITLE)
      : slug;

  const redis = getRedis();
  if (!redis) return res.status(500).json({ error: 'store_not_configured' });

  try {
    // Preserve the original publishedAt on re-publish.
    const existing = coerceMeta(await redis.get(metaKey(slug)));
    const now = new Date().toISOString();
    const meta: ProposalMeta = {
      title,
      publishedAt: existing?.publishedAt ?? now,
      updatedAt: now,
    };

    await Promise.all([
      redis.set(htmlKey(slug), html),
      redis.set(codeKey(slug), code),
      redis.set(metaKey(slug), JSON.stringify(meta)),
    ]);

    return res.status(200).json({
      ok: true,
      slug,
      bytes: htmlBytes,
      meta,
      ...(htmlBytes > HTML_WARN_BYTES
        ? {
            warning: `html is ${htmlBytes} bytes — close to the ${HTML_MAX_BYTES}-byte limit`,
          }
        : {}),
    });
  } catch {
    return res.status(500).json({ error: 'store_error' });
  }
}
