import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const config = { runtime: 'nodejs' };

const COOKIE_PREFIX = 'media_unlocked_';
const COOKIE_PAYLOAD_PREFIX = 'media-v1:';

function isSafeSlug(slug: string) {
  return /^[a-z0-9-]{1,64}$/.test(slug);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const codesJson = process.env.MEDIA_AUTH_CODES;
  const signingSecret = process.env.MEDIA_AUTH_SECRET;

  if (!codesJson || !signingSecret) {
    return res.status(500).json({ error: 'auth_not_configured' });
  }

  let codeMap: Record<string, string>;
  try {
    codeMap = JSON.parse(codesJson);
  } catch {
    return res.status(500).json({ error: 'auth_codes_malformed' });
  }

  const body = req.body ?? {};
  const submittedSlug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const submittedCode = typeof body.code === 'string' ? body.code.trim() : '';

  if (!isSafeSlug(submittedSlug)) {
    return res.status(400).json({ error: 'invalid_slug' });
  }

  const expectedCode = codeMap[submittedSlug];
  if (!expectedCode) {
    await new Promise((r) => setTimeout(r, 600));
    return res.status(404).json({ error: 'slug_not_configured' });
  }

  const a = Buffer.from(submittedCode.padEnd(expectedCode.length, '\0'));
  const b = Buffer.from(expectedCode);
  const match = a.length === b.length && timingSafeEqual(a, b);

  if (!match) {
    await new Promise((r) => setTimeout(r, 600));
    return res.status(401).json({ ok: false });
  }

  const token = createHmac('sha256', signingSecret)
    .update(COOKIE_PAYLOAD_PREFIX + submittedSlug)
    .digest('hex');
  const tenYears = 60 * 60 * 24 * 365 * 10;
  const cookieName = COOKIE_PREFIX + submittedSlug;

  res.setHeader(
    'Set-Cookie',
    `${cookieName}=${token}; HttpOnly; Secure; Path=/; Max-Age=${tenYears}; SameSite=Lax`
  );
  return res.status(200).json({ ok: true });
}
