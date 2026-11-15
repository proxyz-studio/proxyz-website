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
  lines: string[];
  alt: string;
  heightLine?: boolean;
  toolLine?: string;
  letterhead?: string;
  /** Last scene only, chosen at build time: "own" (its own picture, the default) or "twin" (the pool of light of
   *  scene 6, now empty, framed exactly like scene 6; film data "7twin"). */
  picture?: 'own' | 'twin';
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
  machines: { title: string; summary: string; intro: string; toolIntro: string; pictures: string; company: string };
  legal: { title: string; revised: string; sections: { id: string; heading: string; lead: string[]; parts: LegalPart[] }[] };
}

export interface Frame {
  fit: 'cover' | 'width' | 'contain';
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
  /** [y0, y1]: picture rows that must fit between the border strip and the words */
  span?: [number, number];
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
}

export interface FilmData {
  lightShare: number;
  heightPoints: string;
  scenes: Record<string, { desktop: View; phone: View }>;
  tall: Record<string, number>;
  brainScene: number;
}

export interface PictureFile {
  w: number;
  webp: string;
  webpBytes: number;
  avif?: string;
  avifBytes?: number;
}

export type Pictures = Record<string, { size: [number, number]; files: PictureFile[] }>;
