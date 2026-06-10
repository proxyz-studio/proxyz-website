/* POST /api/proposal-auth   { slug, code }
 *
 * Unlocks a published proposal at /p/<slug>. The expected code lives in
 * Redis (proposal:<slug>:code) — NOT in env vars — so publishing a new
 * proposal never needs a redeploy. On match, sets the HttpOnly unlock
 * cookie proposal_unlocked_<slug> (HMAC-signed with PARTNERS_AUTH_SECRET,
 * same token format as the partner gate).
 *
 * Anti-enumeration: an unknown slug and a wrong code return the identical
 * delayed 401, so the auth step never reveals whether a slug exists.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getRedis,
  codeKey,
  cookieName,
  unlockToken,
  safeSlug,
  safeCompare,
} from './_lib/proposal-store';

export const config = { runtime: 'nodejs' };

async function deny(res: VercelResponse) {
  await new Promise((r) => setTimeout(r, 600));
  return res.status(401).json({ ok: false });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  if (!process.env.PARTNERS_AUTH_SECRET) {
    return res.status(500).json({ error: 'auth_not_configured' });
  }
  const redis = getRedis();
  if (!redis) {
    return res.status(500).json({ error: 'auth_not_configured' });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const slug = safeSlug(body.slug);
  const submitted = typeof body.code === 'string' ? body.code.trim() : '';

  // Malformed slug can't name a stored proposal — same denial as wrong code.
  if (!slug || !submitted) return deny(res);

  let expectedCode: string | null;
  try {
    expectedCode = await redis.get<string>(codeKey(slug));
  } catch {
    return res.status(500).json({ error: 'store_error' });
  }

  // Unknown slug → identical response to a wrong code (no enumeration).
  if (!expectedCode || !safeCompare(submitted, String(expectedCode))) {
    return deny(res);
  }

  const token = unlockToken(slug);
  if (!token) return res.status(500).json({ error: 'auth_not_configured' });

  const thirtyDays = 60 * 60 * 24 * 30;
  res.setHeader(
    'Set-Cookie',
    `${cookieName(slug)}=${token}; HttpOnly; Secure; Path=/; Max-Age=${thirtyDays}; SameSite=Lax`
  );
  return res.status(200).json({ ok: true });
}
