import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const config = { runtime: 'nodejs' };

const COOKIE_PREFIX = 'partners_unlocked';
const COOKIE_PAYLOAD = 'v1';

const ALLOWED_SLUGS = new Set(['fast-fix', 'lazy-tiger']);

function safeSlug(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const cleaned = input.trim().toLowerCase();
  return ALLOWED_SLUGS.has(cleaned) ? cleaned : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const signingSecret = process.env.PARTNERS_AUTH_SECRET;
  if (!signingSecret) {
    return res.status(500).json({ ok: false, error: 'auth_not_configured' });
  }

  const partner = safeSlug(req.query.partner);
  const expected = createHmac('sha256', signingSecret).update(COOKIE_PAYLOAD).digest('hex');

  // Per-partner cookie is the only one accepted when a partner is specified.
  // The legacy shared cookie is honored ONLY for fast-fix (the partner that
  // existed before per-partner codes), and ONLY when no partner is named.
  // Lazy Tiger is intentionally NOT covered by the legacy fallback — its
  // unlock requires its own cookie, set by entering its own code.
  const candidates: string[] = [];
  if (partner) {
    candidates.push(`${COOKIE_PREFIX}_${partner.replace(/-/g, '_')}`);
    if (partner === 'fast-fix') candidates.push(COOKIE_PREFIX);
  } else {
    candidates.push(COOKIE_PREFIX);
  }

  for (const name of candidates) {
    const cookie = req.cookies?.[name];
    if (!cookie || typeof cookie !== 'string') continue;
    try {
      const a = Buffer.from(cookie, 'hex');
      const b = Buffer.from(expected, 'hex');
      if (a.length === b.length && timingSafeEqual(a, b)) {
        return res.status(200).json({ ok: true });
      }
    } catch {
      // malformed cookie, try next
    }
  }
  return res.status(200).json({ ok: false });
}
