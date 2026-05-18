import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const config = { runtime: 'nodejs' };

const COOKIE_PREFIX = 'media_unlocked_';
const COOKIE_PAYLOAD_PREFIX = 'media-v1:';

function isSafeSlug(slug: string) {
  return /^[a-z0-9-]{1,64}$/.test(slug);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const signingSecret = process.env.MEDIA_AUTH_SECRET;
  if (!signingSecret) {
    return res.status(500).json({ ok: false, error: 'auth_not_configured' });
  }

  const slug = typeof req.query.slug === 'string' ? req.query.slug.trim() : '';
  if (!isSafeSlug(slug)) {
    return res.status(400).json({ ok: false, error: 'invalid_slug' });
  }

  const cookie = req.cookies?.[COOKIE_PREFIX + slug];
  if (!cookie || typeof cookie !== 'string') {
    return res.status(200).json({ ok: false });
  }

  const expected = createHmac('sha256', signingSecret)
    .update(COOKIE_PAYLOAD_PREFIX + slug)
    .digest('hex');

  try {
    const a = Buffer.from(cookie, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length === b.length && timingSafeEqual(a, b)) {
      return res.status(200).json({ ok: true });
    }
  } catch {
    // malformed cookie
  }
  return res.status(200).json({ ok: false });
}
