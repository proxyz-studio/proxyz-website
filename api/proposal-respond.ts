/* POST /api/proposal-respond   { slug, option, name, role, email, message }
 *
 * Captures a recipient's response from INSIDE a published proposal (scope
 * option picked + contact details). Called by studio-authored proposal
 * HTML running in the /p/<slug> iframe — the iframe is sandboxed with
 * allow-same-origin, so a relative fetch from the proposal carries the
 * gate cookie.
 *
 * Auth: requires a valid proposal_unlocked_<slug> cookie (same check as
 * proposal-get) — only people who entered the code can respond. 401
 * without it; says nothing about whether the slug exists.
 *
 * Storage: LPUSH proposal:<slug>:responses (newest first), trimmed to
 * RESPONSES_MAX. Rate-limited per slug+ip so a leaked link can't evict
 * real responses by flooding the capped list. Submitted values are never
 * logged or echoed back — validation errors name only the field.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getRedis,
  responsesKey,
  respondRateKey,
  isUnlocked,
  safeSlug,
  parseResponse,
  RESPONSES_MAX,
  RESPOND_RATE_MAX,
  RESPOND_RATE_WINDOW_SECONDS,
  type ProposalResponse,
} from './_lib/proposal-store.js';

export const config = { runtime: 'nodejs' };

/** Generous body cap — the field caps add up to ~4.7 KB. */
const MAX_BODY_BYTES = 32 * 1024;

function clientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  const first = (Array.isArray(fwd) ? fwd[0] : fwd ?? '').split(',')[0].trim();
  return first.slice(0, 64) || 'unknown';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const contentLength = Number(req.headers['content-length'] ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return res.status(413).json({ error: 'body_too_large' });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;

  // Auth before anything else — a locked caller learns nothing beyond 401.
  const slug = safeSlug(body.slug);
  if (!slug) return res.status(401).json({ error: 'locked' });
  if (!isUnlocked(req, slug)) return res.status(401).json({ error: 'locked' });

  const parsed = parseResponse(body);
  if (!parsed.ok) {
    return res.status(400).json({ error: 'bad_field', field: parsed.field });
  }

  const redis = getRedis();
  if (!redis) return res.status(500).json({ error: 'store_error' });

  const ip = clientIp(req);

  try {
    // Fixed-window rate limit per slug+ip (same pattern as collab-store).
    const rk = respondRateKey(slug, ip);
    const n = await redis.incr(rk);
    if (n === 1) await redis.expire(rk, RESPOND_RATE_WINDOW_SECONDS);
    if (n > RESPOND_RATE_MAX) {
      return res.status(429).json({ error: 'rate_limited' });
    }

    const entry: ProposalResponse = {
      ts: new Date().toISOString(),
      ...parsed.response,
      ip,
    };
    await redis.lpush(responsesKey(slug), JSON.stringify(entry));
    await redis.ltrim(responsesKey(slug), 0, RESPONSES_MAX - 1);

    // NOTE: no outbound notification — the repo has no email/webhook
    // sender to reuse (booking is a client-side Cal.com embed). Responses
    // are pulled via scripts/publish-proposal.sh responses <slug>.
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'store_error' });
  }
}
