/* Shared store + validation for instant proposal links.
 *
 * api/_lib/ → not routed. Imported by proposal-{auth,check,get,put}.ts.
 *
 * Persistence: Upstash Redis (REST), same client + env vars as
 * collab-store.ts. Keyed by proposal slug so publishing a new proposal is
 * a pure data write — no code change, no env var, no redeploy:
 *   proposal:<slug>:html   self-contained HTML document (string)
 *   proposal:<slug>:code   access code (string, digits)
 *   proposal:<slug>:meta   JSON { title, publishedAt, updatedAt }
 *
 * Unlike the partner gate (env-var codes + hardcoded slug allowlist), the
 * proposal gate reads its codes from Redis at request time. Slugs are
 * validated by shape only (SLUG_RE) — an unknown slug behaves exactly like
 * a wrong code at the auth step, so the gate never reveals whether a slug
 * exists before auth.
 */

import type { VercelRequest } from '@vercel/node';
import { Redis } from '@upstash/redis';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const COOKIE_PREFIX = 'proposal_unlocked';
const COOKIE_PAYLOAD = 'proposal-v1';

/** Proposal slugs: lowercase alphanumerics + hyphens, 2–40 chars. */
const SLUG_RE = /^[a-z0-9-]{2,40}$/;

/** Access codes: 4 digits, same shape the gate UI auto-submits on. */
const CODE_RE = /^[0-9]{4}$/;

/** Stored HTML size limits, in bytes. Upstash REST caps requests at 1 MB,
 *  so reject before the store does and leave headroom for JSON envelope. */
export const HTML_WARN_BYTES = 900 * 1024;
export const HTML_MAX_BYTES = 950 * 1024;

export type ProposalMeta = {
  title: string;
  publishedAt: string; // ISO timestamp of first publish
  updatedAt: string; // ISO timestamp of latest publish
};

export function safeSlug(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const cleaned = input.trim().toLowerCase();
  return SLUG_RE.test(cleaned) ? cleaned : null;
}

export function safeCode(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const cleaned = input.trim();
  return CODE_RE.test(cleaned) ? cleaned : null;
}

/** Returns a Redis client, or null when Upstash env is not configured. */
export function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export const htmlKey = (slug: string) => `proposal:${slug}:html`;
export const codeKey = (slug: string) => `proposal:${slug}:code`;
export const metaKey = (slug: string) => `proposal:${slug}:meta`;

export const cookieName = (slug: string) =>
  `${COOKIE_PREFIX}_${slug.replace(/-/g, '_')}`;

/**
 * Unlock token for a slug: HMAC-SHA256 over the payload, hex-encoded —
 * the same token format the partner gate uses, signed with the same
 * PARTNERS_AUTH_SECRET. The slug is part of the signed payload so one
 * proposal's cookie value can never unlock another slug.
 * Returns null when the signing secret is unset.
 */
export function unlockToken(slug: string): string | null {
  const signingSecret = process.env.PARTNERS_AUTH_SECRET;
  if (!signingSecret) return null;
  return createHmac('sha256', signingSecret)
    .update(`${COOKIE_PAYLOAD}:${slug}`)
    .digest('hex');
}

/** True when the request carries a valid unlock cookie for `slug`.
 *  Returns false (not throw) when the signing secret is unset. */
export function isUnlocked(req: VercelRequest, slug: string): boolean {
  const expected = unlockToken(slug);
  if (!expected) return false;

  const cookie = req.cookies?.[cookieName(slug)];
  if (!cookie || typeof cookie !== 'string') return false;
  try {
    const a = Buffer.from(cookie, 'hex');
    const b = Buffer.from(expected, 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false; // malformed cookie
  }
}

/** Timing-safe string compare (pad-to-length, same approach as
 *  partners-auth.ts) for codes and admin secrets. */
export function safeCompare(submitted: string, expected: string): boolean {
  const a = Buffer.from(submitted.padEnd(expected.length, '\0'));
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Coerce a stored meta value (object or JSON string) into ProposalMeta. */
export function coerceMeta(item: unknown): ProposalMeta | null {
  let obj: unknown = item;
  if (typeof item === 'string') {
    try {
      obj = JSON.parse(item);
    } catch {
      return null;
    }
  }
  if (
    obj &&
    typeof obj === 'object' &&
    'title' in obj &&
    'publishedAt' in obj &&
    'updatedAt' in obj
  ) {
    return obj as ProposalMeta;
  }
  return null;
}
