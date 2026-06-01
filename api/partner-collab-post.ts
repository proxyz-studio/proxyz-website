/* POST /api/partner-collab
 *
 * Writes a collaboration entry for a partner. Body:
 *   { partner, author, action, ... }
 *     action 'note'      → { target: "chapter:<id>"|"decision:<id>", body }
 *     action 'answer'    → { decisionId }  marks a decision answered
 *     action 'unanswer'  → { decisionId }  clears the answered overlay
 *
 * Gated by the unlock cookie (401 without it). Rate-limited per
 * partner+author. Returns 503 { configured:false } when Upstash is unset,
 * so saving is cleanly disabled until provisioned.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isUnlocked, safeSlug } from './_lib/partner-gate';
import {
  getRedis,
  notesKey,
  decisionsKey,
  isAuthor,
  isValidTarget,
  sanitizeBody,
  newNote,
  allowWrite,
  MAX_NOTES,
  type DecisionOverlay,
} from './_lib/collab-store';

export const config = { runtime: 'nodejs' };

const DECISION_ID_RE = /^[a-z0-9-]{1,40}$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;

  const slug = safeSlug(body.partner);
  if (!slug) return res.status(400).json({ error: 'bad_partner' });
  if (!isUnlocked(req, slug)) return res.status(401).json({ error: 'locked' });

  const redis = getRedis();
  if (!redis) {
    return res.status(503).json({ configured: false, error: 'capture_not_configured' });
  }

  const author = body.author;
  if (!isAuthor(author)) return res.status(400).json({ error: 'bad_author' });

  // Rate limit per partner + author (fixed window).
  try {
    if (!(await allowWrite(redis, slug, author))) {
      return res.status(429).json({ error: 'rate_limited' });
    }
  } catch {
    return res.status(500).json({ error: 'store_error' });
  }

  const action = body.action;
  const isoNow = new Date().toISOString();

  try {
    if (action === 'note') {
      if (!isValidTarget(body.target)) return res.status(400).json({ error: 'bad_target' });
      const clean = sanitizeBody(body.body);
      if (!clean) return res.status(400).json({ error: 'bad_body' });
      const note = newNote(body.target, author, clean, isoNow);
      await redis.rpush(notesKey(slug), note);
      await redis.ltrim(notesKey(slug), -MAX_NOTES, -1);
      return res.status(200).json({ ok: true, note });
    }

    if (action === 'answer' || action === 'unanswer') {
      const decisionId = body.decisionId;
      if (typeof decisionId !== 'string' || !DECISION_ID_RE.test(decisionId)) {
        return res.status(400).json({ error: 'bad_decision' });
      }
      if (action === 'answer') {
        const overlay: DecisionOverlay = { answered: true, by: author, at: isoNow };
        await redis.hset(decisionsKey(slug), { [decisionId]: overlay });
        return res.status(200).json({ ok: true, decisionId, overlay });
      }
      await redis.hdel(decisionsKey(slug), decisionId);
      return res.status(200).json({ ok: true, decisionId, overlay: null });
    }

    return res.status(400).json({ error: 'bad_action' });
  } catch {
    return res.status(500).json({ error: 'store_error' });
  }
}
