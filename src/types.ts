// Shapes of the three data files the site is built from.
// content/site.json: every word. src/film/scenes.json: how the film moves. src/generated/pictures.json: the web pictures.

export interface Venture {
  id: string;
  /** Shown beside its mark and at the start of its plain text line. Leave it out and no name appears anywhere. */
  name?: string;
  /** The venture's own site. With a name, the name in the border links here. */
  url?: string;
  hollow?: boolean;
  line: string;
}

export interface SceneWords {
  id: string;
  venture: string | null;
  /** The giant lines in capitals, as they stand on a wide screen (the same words make the heading's text). */
  lines: string[];
  /** The same words broken into other lines on an upright screen (each line is fitted to the width on its own).
   *  Left out: the lines above. A phone line never runs across two of the lines above. */
  phoneLines?: string[];
  /** The small line under the giant words. */
  small?: string;
  /** A short grey line in small capitals under the small line. */
  note?: string;
  alt: string;
  heightLine?: boolean;
  toolLine?: string;
  letterhead?: string;
  /** Last scene only, chosen at build time: "own" (its own picture, the default) or "twin" (the pool of light of
   *  scene 6, now empty, framed exactly like scene 6; film data "7twin"). */
  picture?: 'own' | 'twin';
  /** Scene 6 only: the two labels of the board drawn on its floor (the chip, and the place for the next one). */
  board?: BoardWords;
}

export interface BoardWords { chip: string; next: string }

/** One screen shape of the board on scene 6's floor, in picture pixels (src/generated/board.json, made by
 *  scripts/board.mjs). Paths are SVG path data; points are [x, y]. */
export interface BoardForm {
  size: [number, number];
  /** the pool of light of the last pass [cx, cy, rx, ry] */
  pool: number[];
  net: string;
  vias: string;
  chip: { top: string; inner: string; sides: string[]; pins: string; dot: number[]; glow: number[]; leader: number[][] };
  live: Record<'stand' | 'coin' | 'phone', { pts: number[][]; side: number[][][]; pad: string }>;
  empty: { pts: number[][]; pad: string };
  labels: { studio: number[]; studioSide: 'l' | 'r'; next: number[]; nextSide: 'a' | 'b' };
  footprints: Record<string, string>;
  /** the pass strengths [at 40%, at 70%] at which the light covers the race piece and the coach phone */
  arrive: Record<'coin' | 'phone', [number, number]>;
}

export interface PageMeta {
  path: string;
  title: string;
  description: string;
}

export interface LegalPart {
  heading: string;
  text: string[];
  list?: string[];
  after?: string[];
}

export interface Content {
  site: { url: string; name: string; legalName: string; locality: string; country: string; logo: string; image: string };
  pages: { home: PageMeta; machines: PageMeta; legal: PageMeta; notFound: { title: string; line: string } };
  border: { wordmark: string; place: string; people: string; machines: string; legal: string };
  ventures: Venture[];
  scenes: SceneWords[];
  machines: {
    title: string; summary: string; intro: string; toolIntro: string; pictures: string; company: string;
    /** the link section at the end of llms.txt: its heading, and a short note after each page's link */
    pagesHeading: string; pageNotes: { home: string; machines: string; legal: string };
  };
  legal: { title: string; revised: string; sections: { id: string; heading: string; lead: string[]; parts: LegalPart[] }[] };
}

export interface Frame {
  fit: 'cover' | 'width' | 'contain';
  /** [row, gap]: this picture row stays at least gap px above the giant words at the foot, at their low place (the
   *  picture moves up when it must; its foot should fade out, see fade, as the black below it then shows). */
  above?: [number, number];
  /** [row, gap]: this picture row stays at least gap px below the giant words at the top (the picture moves down
   *  when it must; its top rows should be black, as the black above it then shows). */
  below?: [number, number];
  zoom?: number;
  fx: number;
  fy: number;
  vx: number;
  vy: number;
  /** [a, b, c, d]: fade in from black between heights a and b, out between c and d (0 top, 1 bottom) */
  fade?: [number, number, number, number];
  /** [x1, y1, x2, y2, a, b]: black below a slanted line through two picture points, a px to b px below it */
  shade?: [number, number, number, number, number, number];
  oval?: boolean;
  /** [y0, y1]: picture rows that must fit in the room the words leave: between the border strip (or the giant words
   *  at the top) and the words at the foot of the screen */
  span?: [number, number];
  /** With a matte: how far the span's top row may reach up into the giant words at the top, as a share of the
   *  capitals' height of their lowest line (0.15: the thing hides at most the lowest 15% of those letters). Without a
   *  matte the room starts 12 px under the words. */
  tuck?: number;
  sides?: boolean;
}

export interface View {
  passes: string[];
  frame: Frame;
  hold?: number;
  rest?: number;
  still?: number;
  filter?: string;
  end?: 'dark';
  opens?: [number, number, number, number][];
  /** Place the picture exactly as scene n places its own (same words box for the span), so a cut keeps it in place. */
  placeAs?: number;
  /** The matte of the thing lit from the first pass (a key in the picture manifest, white thing on transparent, framed
   *  exactly like the passes). Where the thing overlaps the giant words it stands in front of them. Used only when the
   *  picture manifest holds that key. */
  matte?: string;
  /** Boxes of things that first appear in a later pass, [pass, x, y, w, h] in the picture's logical pixels (pass 1 is
   *  the first). They must never overlap the giant words, at any screen size. */
  later?: [number, number, number, number, number][];
  /** Scene 6: the matte of all three things together (a key in the picture manifest). The board on the floor is
   *  hidden inside it, so every line runs behind the things. No board without it. */
  things?: string;
}

/** How the giant lines are set (the same numbers for the page builder, the film and the check). */
export interface TypeRules {
  /** scenes whose giant words stand at the foot of the screen (the others stand at the top, under the border) */
  bottom: number[];
  /** wide screens: the widest line of a scene is this share of the window width (by scene; else shareDefault) */
  share: Record<string, number>;
  shareDefault: number;
  /** wide screens: the block of giant lines is never taller than this share of the window height */
  blockMax: number;
  /** upright screens: each line is fitted to the width, but never taller (its font size) than this share of the height */
  lineMax: number;
  lineHeight: number;
  /** in em, after every letter */
  letterSpacing: number;
}

export interface FilmData {
  lightShare: number;
  heightPoints: string;
  scenes: Record<string, { desktop: View; phone: View }>;
  tall: Record<string, number>;
  brainScene: number;
  type: TypeRules;
}

export interface PictureFile {
  w: number;
  webp: string;
  webpBytes: number;
  avif?: string;
  avifBytes?: number;
}

/** A picture, or with "matte": true a matte (white thing on transparent; WebP files only, read for their alpha). */
export type Pictures = Record<string, { size: [number, number]; matte?: boolean; files: PictureFile[] }>;
