import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const config = { runtime: 'nodejs' };

const COOKIE_PREFIX = 'partners_unlocked';
const COOKIE_PAYLOAD = 'v1';

/** Slugs we'll accept as a `partner` value. Mirrors the routes mounted under
 *  /partners/<slug>. New partners need to be added here AND to the env var
 *  list (PARTNERS_AUTH_CODE_<UPPER_SNAKE_CASE_SLUG>). */
const ALLOWED_SLUGS = new Set(['fast-fix', 'lazy-tiger']);

function slugToEnvKey(slug: string) {
  return `PARTNERS_AUTH_CODE_${slug.toUpperCase().replace(/-/g, '_')}`;
}

function safeSlug(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const cleaned = input.trim().toLowerCase();
  return ALLOWED_SLUGS.has(cleaned) ? cleaned : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const signingSecret = process.env.PARTNERS_AUTH_SECRET;
  if (!signingSecret) {
    return res.status(500).json({ error: 'auth_not_configured' });
  }

  const body = req.body ?? {};
  const submitted = typeof body.code === 'string' ? body.code.trim() : '';
  const partner = safeSlug(body.partner);

  // Per-partner code first, fall back to the legacy shared code so existing
  // partners (FAST-FIX) keep working without a migration step.
  const perPartnerCode = partner ? process.env[slugToEnvKey(partner)] : undefined;
  const legacyCode = process.env.PARTNERS_AUTH_CODE;
  const expectedCode = perPartnerCode || legacyCode;

  if (!expectedCode) {
    return res.status(500).json({ error: 'auth_not_configured' });
  }

  const a = Buffer.from(submitted.padEnd(expectedCode.length, '\0'));
  const b = Buffer.from(expectedCode);
  const match = a.length === b.length && timingSafeEqual(a, b);

  if (!match) {
    await new Promise((r) => setTimeout(r, 600));
    return res.status(401).json({ ok: false });
  }

  // Cookie scope: per-partner when a slug is provided, shared otherwise.
  const cookieName = partner ? `${COOKIE_PREFIX}_${partner.replace(/-/g, '_')}` : COOKIE_PREFIX;
  const token = createHmac('sha256', signingSecret).update(COOKIE_PAYLOAD).digest('hex');
  const tenYears = 60 * 60 * 24 * 365 * 10;

  res.setHeader(
    'Set-Cookie',
    `${cookieName}=${token}; HttpOnly; Secure; Path=/; Max-Age=${tenYears}; SameSite=Lax`
  );
  return res.status(200).json({ ok: true });
}
