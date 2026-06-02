/* Shared partner-gate verification.
 *
 * Lives in api/_lib/ (underscore prefix → NOT routed as a serverless
 * function; imported by the partner-collab endpoints). Mirrors the HMAC
 * cookie check in api/partners-check.ts exactly — same secret, same
 * payload, same timing-safe compare — so the collab endpoints are gated by
 * the identical unlock the rest of the partner surface uses.
 */

import type { VercelRequest } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_PREFIX = 'partners_unlocked';
const COOKIE_PAYLOAD = 'v1';

/** Slugs we accept as a `partner` value. Mirrors api/partners-check.ts. */
const ALLOWED_SLUGS = new Set(['fast-fix', 'lazy-tiger', 'abacuz']);

export function safeSlug(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const cleaned = input.trim().toLowerCase();
  return ALLOWED_SLUGS.has(cleaned) ? cleaned : null;
}

/**
 * True when the request carries a valid unlock cookie for `slug`.
 * The per-partner cookie is the only one accepted; the legacy shared
 * cookie is honored ONLY for fast-fix (its pre-per-partner default).
 * Returns false (not throw) when the signing secret is unset.
 */
export function isUnlocked(req: VercelRequest, slug: string): boolean {
  const signingSecret = process.env.PARTNERS_AUTH_SECRET;
  if (!signingSecret) return false;

  const expected = createHmac('sha256', signingSecret)
    .update(COOKIE_PAYLOAD)
    .digest('hex');

  const candidates: string[] = [`${COOKIE_PREFIX}_${slug.replace(/-/g, '_')}`];
  if (slug === 'fast-fix') candidates.push(COOKIE_PREFIX);

  for (const name of candidates) {
    const cookie = req.cookies?.[name];
    if (!cookie || typeof cookie !== 'string') continue;
    try {
      const a = Buffer.from(cookie, 'hex');
      const b = Buffer.from(expected, 'hex');
      if (a.length === b.length && timingSafeEqual(a, b)) return true;
    } catch {
      // malformed cookie, try next
    }
  }
  return false;
}
