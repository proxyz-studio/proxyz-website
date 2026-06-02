/* GET /api/partner-collab-get?partner=abacuz
 *
 * Returns the collaboration capture for a partner: the notes list + the
 * decision overlay. Gated by the same unlock cookie as the rest of the
 * partner surface (401 without it). Degrades to { configured:false } when
 * Upstash env is not set, so the feature is inert-but-safe until provisioned.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isUnlocked, safeSlug } from './_lib/partner-gate';
import {
  getRedis,
  notesKey,
  decisionsKey,
  coerceNote,
  type CollabNote,
} from './_lib/collab-store';

export const config = { runtime: 'nodejs' };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const slug = safeSlug(req.query.partner);
  if (!slug) return res.status(400).json({ error: 'bad_partner' });
  if (!isUnlocked(req, slug)) return res.status(401).json({ error: 'locked' });

  const redis = getRedis();
  if (!redis) {
    return res.status(200).json({ configured: false, notes: [], decisions: {} });
  }

  try {
    const [rawNotes, decisions] = await Promise.all([
      redis.lrange(notesKey(slug), 0, -1),
      redis.hgetall(decisionsKey(slug)),
    ]);
    const notes = (rawNotes as unknown[])
      .map(coerceNote)
      .filter((n): n is CollabNote => n !== null);
    return res
      .status(200)
      .json({ configured: true, notes, decisions: decisions ?? {} });
  } catch {
    return res.status(500).json({ error: 'store_error' });
  }
}
