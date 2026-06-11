/* GET /api/proposal-responses?slug=<slug>   — admin response listing
 *
 * Header:  x-proposal-admin: <PROPOSAL_ADMIN_SECRET>
 *
 * Returns every captured response for a proposal, newest first (LPUSH
 * order). Same admin guard as proposal-put: timing-safe header check,
 * non-GET and bad/missing header rejected without detail. Driven by
 * scripts/publish-proposal.sh responses <slug>.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getRedis,
  responsesKey,
  safeSlug,
  safeCompare,
  coerceResponse,
  type ProposalResponse,
} from './_lib/proposal-store.js';

export const config = { runtime: 'nodejs' };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const adminSecret = process.env.PROPOSAL_ADMIN_SECRET;
  if (!adminSecret) {
    return res.status(500).json({ error: 'admin_not_configured' });
  }

  const submitted = req.headers['x-proposal-admin'];
  if (typeof submitted !== 'string' || !safeCompare(submitted, adminSecret)) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const slug = safeSlug(req.query.slug);
  if (!slug) {
    return res
      .status(400)
      .json({ error: 'bad_slug', detail: 'slug must match [a-z0-9-]{2,40}' });
  }

  const redis = getRedis();
  if (!redis) return res.status(500).json({ error: 'store_not_configured' });

  try {
    const raw = await redis.lrange(responsesKey(slug), 0, -1);
    const responses = (raw as unknown[])
      .map(coerceResponse)
      .filter((r): r is ProposalResponse => r !== null);
    return res.status(200).json({ ok: true, slug, count: responses.length, responses });
  } catch {
    return res.status(500).json({ error: 'store_error' });
  }
}
