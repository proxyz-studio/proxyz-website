/* Meetings loader.
 *
 * Reads every src/content/<partner>/meetings/*.md file at build time via
 * Vite's import.meta.glob, parses a tiny frontmatter block, and exposes
 * a partner-keyed array of meeting records sorted newest first.
 *
 * Frontmatter schema (all required except `attendees`):
 *
 *   ---
 *   date: 2026-05-23T09:07:00+07:00   # ISO-8601, with timezone
 *   title: Pipeline kickoff with Cathal
 *   attendees: [Tew, Cathal]
 *   teaser: One short paragraph that previews the meeting.
 *   ---
 *
 * The body below the second `---` is raw markdown.
 */

import { marked } from 'marked';

export interface Meeting {
  /** Stable id derived from filename (e.g. "2026-05-23-cathal-pipeline-kickoff"). */
  id: string;
  /** ISO-8601 date string from frontmatter. */
  date: string;
  /** Human title from frontmatter. */
  title: string;
  /** Optional attendee list. */
  attendees: string[];
  /** One-paragraph teaser shown in the collapsed card. */
  teaser: string;
  /** Raw markdown body (everything after the closing frontmatter). */
  body: string;
  /** Pre-rendered HTML for the body. */
  html: string;
}

/* Glob all partner meeting files at build time. The first wildcard becomes
 * the partner slug; the second wildcard becomes the file id. */
const rawFiles = import.meta.glob('../content/*/meetings/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

/* marked options: keep it simple, sanitize via default HTML escaping. */
marked.setOptions({
  gfm: true,
  breaks: false,
});

const PARTNER_RE = /\.\.\/content\/([^/]+)\/meetings\/(.+)\.md$/;

function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  if (!raw.startsWith('---')) {
    return { data: {}, body: raw };
  }
  const end = raw.indexOf('\n---', 3);
  if (end === -1) {
    return { data: {}, body: raw };
  }
  const yaml = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\n/, '');

  const data: Record<string, unknown> = {};
  for (const line of yaml.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colon = trimmed.indexOf(':');
    if (colon === -1) continue;
    const key = trimmed.slice(0, colon).trim();
    let value: string | string[] = trimmed.slice(colon + 1).trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else {
      value = value.replace(/^["']|["']$/g, '');
    }
    data[key] = value;
  }
  return { data, body };
}

const allMeetings: Record<string, Meeting[]> = {};

for (const [path, raw] of Object.entries(rawFiles)) {
  const match = PARTNER_RE.exec(path);
  if (!match) continue;
  const [, partner, id] = match;
  const { data, body } = parseFrontmatter(raw);
  const date = typeof data.date === 'string' ? data.date : '';
  const title = typeof data.title === 'string' ? data.title : id;
  const teaser = typeof data.teaser === 'string' ? data.teaser : '';
  const attendees = Array.isArray(data.attendees)
    ? (data.attendees as string[])
    : typeof data.attendees === 'string'
      ? [data.attendees]
      : [];

  const meeting: Meeting = {
    id,
    date,
    title,
    attendees,
    teaser,
    body,
    html: marked.parse(body) as string,
  };

  if (!allMeetings[partner]) allMeetings[partner] = [];
  allMeetings[partner].push(meeting);
}

for (const partner of Object.keys(allMeetings)) {
  allMeetings[partner].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getMeetings(partner: string): Meeting[] {
  return allMeetings[partner] ?? [];
}

export function formatMeetingDate(iso: string): { date: string; time: string } {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: iso, time: '' };
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  // Display the wall-clock time from the original ISO string (after the T),
  // not a recomputed local time, so the published date matches what the
  // author wrote.
  const tMatch = iso.match(/T(\d{2}):(\d{2})/);
  const time = tMatch ? `${tMatch[1]}:${tMatch[2]}` : '';
  return { date: `${yyyy}-${mm}-${dd}`, time };
}
