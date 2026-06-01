/* ─── ABACUZ shared types ─────────────────────────────────────────── */

export type Lang = 'th' | 'en';
export type Bilingual = { th: string; en: string };
export type BilingualList = { th: string[]; en: string[] };

export type DecisionStatus = 'locked' | 'discuss' | 'joy';

export type Decision = {
  id: string;
  label: Bilingual;
  status: DecisionStatus;
  chapter: number; // 1..9
};

export type Chapter = {
  num: string; // "01" .. "09"
  id: string;  // slug for anchor + nav
  title: Bilingual;
  source: Bilingual; // small line under the title
  eyebrow: Bilingual;
  pull?: Bilingual; // optional pull-quote highlight
  body: BilingualList; // array of paragraphs
  closing?: Bilingual; // small italic closing line
  inset?: 'compliance-calendar' | 'number-checklist' | 'brand-identity'; // optional inline component
};

export type PaletteRow = { role: Bilingual; name: string; hex: string; use: Bilingual };

/* ─── Collaboration capture wire types ────────────────────────────── */

export type CollabAuthor = 'tew' | 'joy';

export type CollabNote = {
  id: string;
  target: string; // "chapter:<id>" | "decision:<id>"
  author: CollabAuthor;
  body: string; // plain text — rendered via React, never via innerHTML
  ts: string;   // ISO timestamp
};

export type DecisionOverlay = {
  answered: boolean;
  by: CollabAuthor;
  at: string; // ISO timestamp
};
