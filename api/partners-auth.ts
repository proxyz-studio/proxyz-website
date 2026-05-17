import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const config = { runtime: 'nodejs' };

const COOKIE_NAME = 'partners_unlocked';
const COOKIE_PAYLOAD = 'v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const expectedCode = process.env.PARTNERS_AUTH_CODE;
  const signingSecret = process.env.PARTNERS_AUTH_SECRET;

  if (!expectedCode || !signingSecret) {
    return res.status(500).json({ error: 'auth_not_configured' });
  }

  const body = req.body ?? {};
  const submitted = typeof body.code === 'string' ? body.code.trim() : '';

  const a = Buffer.from(submitted.padEnd(expectedCode.length, '\0'));
  const b = Buffer.from(expectedCode);
  const match = a.length === b.length && timingSafeEqual(a, b);

  if (!match) {
    await new Promise((r) => setTimeout(r, 600));
    return res.status(401).json({ ok: false });
  }

  const token = createHmac('sha256', signingSecret).update(COOKIE_PAYLOAD).digest('hex');
  const tenYears = 60 * 60 * 24 * 365 * 10;

  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; HttpOnly; Secure; Path=/; Max-Age=${tenYears}; SameSite=Lax`
  );
  return res.status(200).json({ ok: true });
}
