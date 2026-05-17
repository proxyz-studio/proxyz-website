import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const config = { runtime: 'nodejs' };

const COOKIE_NAME = 'partners_unlocked';
const COOKIE_PAYLOAD = 'v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const signingSecret = process.env.PARTNERS_AUTH_SECRET;
  if (!signingSecret) {
    return res.status(500).json({ ok: false, error: 'auth_not_configured' });
  }

  const cookie = req.cookies?.[COOKIE_NAME];
  if (!cookie || typeof cookie !== 'string') {
    return res.status(200).json({ ok: false });
  }

  const expected = createHmac('sha256', signingSecret).update(COOKIE_PAYLOAD).digest('hex');
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
