/* GET /api/proposal-check?slug=<slug>
 *
 * Reports whether the request carries a valid unlock cookie for the
 * proposal. Mirrors api/partners-check.ts: always 200 with { ok } so the
 * client can branch checking → locked/unlocked without error handling.
 * Says nothing about whether the slug exists — only cookie validity.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isUnlocked, safeSlug } from './_lib/proposal-store';

export const config = { runtime: 'nodejs' };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  if (!process.env.PARTNERS_AUTH_SECRET) {
    return res.status(500).json({ ok: false, error: 'auth_not_configured' });
  }

  const slug = safeSlug(req.query.slug);
  if (!slug) return res.status(200).json({ ok: false });

  return res.status(200).json({ ok: isUnlocked(req, slug) });
}
