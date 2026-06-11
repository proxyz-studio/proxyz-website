/* GET /api/proposal-get?slug=<slug>
 *
 * Returns the published proposal HTML + meta for an UNLOCKED visitor.
 * 401 without a valid unlock cookie (auth comes first, so this endpoint
 * never confirms a slug's existence to a locked caller). 404 only after
 * auth, when the slug has no stored HTML.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getRedis,
  htmlKey,
  metaKey,
  isUnlocked,
  safeSlug,
  coerceMeta,
} from './_lib/proposal-store.js';

export const config = { runtime: 'nodejs' };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const slug = safeSlug(req.query.slug);
  if (!slug) return res.status(401).json({ error: 'locked' });
  if (!isUnlocked(req, slug)) return res.status(401).json({ error: 'locked' });

  const redis = getRedis();
  if (!redis) return res.status(500).json({ error: 'store_error' });

  try {
    const [html, rawMeta] = await Promise.all([
      redis.get<string>(htmlKey(slug)),
      redis.get(metaKey(slug)),
    ]);
    if (!html || typeof html !== 'string') {
      return res.status(404).json({ error: 'not_found' });
    }
    return res.status(200).json({ ok: true, html, meta: coerceMeta(rawMeta) });
  } catch {
    return res.status(500).json({ error: 'store_error' });
  }
}
