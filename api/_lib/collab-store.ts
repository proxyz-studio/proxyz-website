/* Shared store + validation for the partner collaboration capture.
 *
 * api/_lib/ → not routed. Imported by partner-collab-{get,post}.ts.
 *
 * Persistence: Upstash Redis (REST). Keyed by partner slug so it
 * generalises to future partners with no code change:
 *   collab:<slug>:notes       LIST of CollabNote (capped to MAX_NOTES)
 *   collab:<slug>:decisions    HASH decisionId -> DecisionOverlay
 *   collab:<slug>:rl:<who>     fixed-window rate-limit counter
 *
 * XSS note: note bodies are stored RAW (only trimmed + length-capped +
 * control-chars stripped). The client renders them as plain text through
 * React, which output-encodes — so storing HTML-escaped text would
 * double-escape legitimate characters like "<". Output-encoding on render
 * is the correct defense; the client must never use dangerouslySetInnerHTML.
 */

import { Redis } from '@upstash/redis';
import { randomUUID } from 'node:crypto';

export const MAX_NOTES = 500;
export const MAX_BODY = 2000;
export const RATE_MAX = 20; // writes per window
export const RATE_WINDOW_SECONDS = 60;

export type Author = 'tew' | 'joy';

export type CollabNote = {
  id: string;
  target: string; // "chapter:<id>" | "decision:<id>"
  author: Author;
  body: string; // raw text, rendered as plain text on the client
  ts: string; // ISO timestamp
};

export type DecisionOverlay = {
  answered: boolean;
  by: Author;
  at: string; // ISO timestamp
};

/** Returns a Redis client, or null when Upstash env is not configured. */
export function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export const notesKey = (slug: string) => `collab:${slug}:notes`;
export const decisionsKey = (slug: string) => `collab:${slug}:decisions`;
const rateKey = (slug: string, who: string) => `collab:${slug}:rl:${who}`;

export function isAuthor(v: unknown): v is Author {
  return v === 'tew' || v === 'joy';
}

const TARGET_RE = /^(chapter|decision):[a-z0-9-]{1,40}$/;
export function isValidTarget(v: unknown): v is string {
  return typeof v === 'string' && TARGET_RE.test(v);
}

/* Strip C0 + DEL control chars, keeping \t (09) and \n (0A). Built from a
 * hex-escaped string so the source carries no literal control bytes. */
// eslint-disable-next-line no-control-regex -- deliberately strips C0/DEL control chars from user input
const CONTROL_CHARS = new RegExp('[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]', 'g');

/**
 * Trim, reject empty, cap length, strip control chars (keep newlines/tabs).
 * Returns the cleaned string, or null when invalid. Stores RAW (no HTML
 * escaping) — see the file header.
 */
export function sanitizeBody(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const cleaned = raw.replace(CONTROL_CHARS, '').trim();
  if (cleaned.length === 0) return null;
  if (cleaned.length > MAX_BODY) return null;
  return cleaned;
}

export function newNote(
  target: string,
  author: Author,
  body: string,
  isoNow: string,
): CollabNote {
  return { id: randomUUID(), target, author, body, ts: isoNow };
}

/**
 * Fixed-window rate limit per partner+author. Returns true if the write is
 * allowed, false if the window is exhausted.
 */
export async function allowWrite(
  redis: Redis,
  slug: string,
  who: string,
): Promise<boolean> {
  const key = rateKey(slug, who);
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, RATE_WINDOW_SECONDS);
  return n <= RATE_MAX;
}

/** Coerce a stored list item (object or JSON string) into a CollabNote. */
export function coerceNote(item: unknown): CollabNote | null {
  let obj: unknown = item;
  if (typeof item === 'string') {
    try {
      obj = JSON.parse(item);
    } catch {
      return null;
    }
  }
  if (obj && typeof obj === 'object' && 'id' in obj && 'body' in obj) {
    return obj as CollabNote;
  }
  return null;
}
