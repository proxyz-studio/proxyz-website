// Reads the advance widths and the pair kerning of a WOFF2 font file at build time, so the giant lines can be sized
// in CSS alone: a line's width at a font size of 1 px is known before any browser draws it, and no script has to
// measure and refit the words after the font arrives (no jump on the first screen, the same look with scripts off).
// Only what that needs is read: head, hhea, hmtx, cmap and the 'kern' feature of GPOS (pair adjustments).
import { readFileSync } from 'node:fs';
import { brotliDecompressSync } from 'node:zlib';

// WOFF2 known table tags, in the order the format numbers them (index 63 means the tag is written out)
const KNOWN = ['cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca', 'prep', 'CFF ',
  'VORG', 'EBDT', 'EBLC', 'gasp', 'hdmx', 'kern', 'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB',
  'EBSC', 'JSTF', 'MATH', 'CBDT', 'CBLC', 'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar', 'bdat', 'bloc', 'bsln', 'cvar',
  'fdsc', 'feat', 'fmtx', 'fvar', 'gvar', 'hsty', 'just', 'lcar', 'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf',
  'Glat', 'Gloc', 'Feat', 'Sill'];

interface Table { data: Buffer; transformed: boolean }

function tables(file: Buffer): Map<string, Table> {
  if (file.readUInt32BE(0) !== 0x774f4632) throw new Error('font: not a WOFF2 file');
  if (file.readUInt32BE(4) === 0x74746366) throw new Error('font: font collections are not read');
  const numTables = file.readUInt16BE(12);
  const compressed = file.readUInt32BE(20);
  let p = 48;
  const base128 = () => {
    let v = 0;
    for (let i = 0; i < 5; i++) {
      const b = file[p++];
      if (i === 0 && b === 0x80) throw new Error('font: bad number in the table directory');
      v = v * 128 + (b & 0x7f);
      if (!(b & 0x80)) return v;
    }
    throw new Error('font: number too long in the table directory');
  };
  const dir: { tag: string; length: number; transformed: boolean }[] = [];
  for (let i = 0; i < numTables; i++) {
    const flags = file[p++];
    const tag = (flags & 0x3f) === 63 ? file.toString('latin1', p, (p += 4)) : KNOWN[flags & 0x3f];
    const version = flags >> 6;
    const orig = base128();
    // glyf and loca: version 0 is transformed; every other table: version 0 is as it is
    const transformed = tag === 'glyf' || tag === 'loca' ? version === 0 : version !== 0;
    dir.push({ tag, length: transformed ? base128() : orig, transformed });
  }
  const stream = brotliDecompressSync(file.subarray(p, p + compressed));
  const out = new Map<string, Table>();
  let at = 0;
  for (const t of dir) {
    out.set(t.tag, { data: stream.subarray(at, at + t.length), transformed: t.transformed });
    at += t.length;
  }
  if (at !== stream.length) throw new Error('font: the tables do not add up to the font data');
  return out;
}

/** Glyph id for each character the font maps (cmap format 4 or 12 of the Windows Unicode table). */
function charMap(cmap: Buffer): (code: number) => number {
  const n = cmap.readUInt16BE(2);
  let best = -1, bestRank = 0;
  for (let i = 0; i < n; i++) {
    const platform = cmap.readUInt16BE(4 + i * 8), encoding = cmap.readUInt16BE(6 + i * 8), off = cmap.readUInt32BE(8 + i * 8);
    const format = cmap.readUInt16BE(off);
    const rank = format === 12 && (platform === 3 || platform === 0) ? 3 : format === 4 && ((platform === 3 && encoding === 1) || platform === 0) ? 2 : 0;
    if (rank > bestRank) { best = off; bestRank = rank; }
  }
  if (best < 0) throw new Error('font: no Unicode character map');
  const t = cmap.subarray(best);
  if (t.readUInt16BE(0) === 12) {
    const groups = t.readUInt32BE(12);
    return (code) => {
      for (let g = 0; g < groups; g++) {
        const s = t.readUInt32BE(16 + g * 12), e = t.readUInt32BE(20 + g * 12);
        if (code >= s && code <= e) return t.readUInt32BE(24 + g * 12) + code - s;
      }
      return 0;
    };
  }
  const segX2 = t.readUInt16BE(6);
  const ends = 14, starts = ends + segX2 + 2, deltas = starts + segX2, ranges = deltas + segX2;
  return (code) => {
    for (let s = 0; s < segX2; s += 2) {
      if (code > t.readUInt16BE(ends + s)) continue;
      const start = t.readUInt16BE(starts + s);
      if (code < start) return 0;
      const delta = t.readInt16BE(deltas + s), range = t.readUInt16BE(ranges + s);
      if (!range) return (code + delta) & 0xffff;
      const g = t.readUInt16BE(ranges + s + range + (code - start) * 2);
      return g ? (g + delta) & 0xffff : 0;
    }
    return 0;
  };
}

/** Index of a glyph in a coverage table, or -1. */
function coverage(t: Buffer, glyph: number): number {
  const format = t.readUInt16BE(0), count = t.readUInt16BE(2);
  for (let i = 0; i < count; i++) {
    if (format === 1) { if (t.readUInt16BE(4 + i * 2) === glyph) return i; continue; }
    const s = t.readUInt16BE(4 + i * 6), e = t.readUInt16BE(6 + i * 6);
    if (glyph >= s && glyph <= e) return t.readUInt16BE(8 + i * 6) + glyph - s;
  }
  return -1;
}

function classOf(t: Buffer, glyph: number): number {
  if (t.readUInt16BE(0) === 1) {
    const start = t.readUInt16BE(2), count = t.readUInt16BE(4);
    return glyph >= start && glyph < start + count ? t.readUInt16BE(6 + (glyph - start) * 2) : 0;
  }
  const n = t.readUInt16BE(2);
  for (let i = 0; i < n; i++) {
    const s = t.readUInt16BE(4 + i * 6), e = t.readUInt16BE(6 + i * 6);
    if (glyph >= s && glyph <= e) return t.readUInt16BE(8 + i * 6);
  }
  return 0;
}

const valueSize = (format: number) => { let n = 0; for (let f = format; f; f >>= 1) n += f & 1; return n * 2; };
/** The horizontal advance change in a value record (0 when the record has none). */
function xAdvance(t: Buffer, at: number, format: number): number {
  if (!(format & 4)) return 0;
  return t.readInt16BE(at + ((format & 1) ? 2 : 0) + ((format & 2) ? 2 : 0));
}

/** The pair kerning of the 'kern' feature: a function (left glyph, right glyph) to [advance change of the left glyph,
 *  advance change of the right glyph, whether the right glyph is used up by the pair]. */
function pairKerning(gpos: Buffer | undefined): (a: number, b: number) => [number, number, boolean] | null {
  if (!gpos) return () => null;
  const features = gpos.subarray(gpos.readUInt16BE(6)), lookups = gpos.subarray(gpos.readUInt16BE(8));
  const wanted = new Set<number>();
  for (let i = 0; i < features.readUInt16BE(0); i++) {
    if (features.toString('latin1', 2 + i * 6, 6 + i * 6) !== 'kern') continue;
    const f = features.subarray(features.readUInt16BE(6 + i * 6));
    for (let k = 0; k < f.readUInt16BE(2); k++) wanted.add(f.readUInt16BE(4 + k * 2));
  }
  const subtables: Buffer[] = [];
  for (const li of [...wanted].sort((a, b) => a - b)) {
    const l = lookups.subarray(lookups.readUInt16BE(2 + li * 2));
    const type = l.readUInt16BE(0);
    for (let s = 0; s < l.readUInt16BE(4); s++) {
      let st = l.subarray(l.readUInt16BE(6 + s * 2));
      let stType = type;
      if (type === 9) { stType = st.readUInt16BE(2); st = st.subarray(st.readUInt32BE(4)); }
      if (stType === 2) subtables.push(st);
    }
  }
  return (a, b) => {
    for (const st of subtables) {
      const ci = coverage(st.subarray(st.readUInt16BE(2)), a);
      if (ci < 0) continue;
      const f1 = st.readUInt16BE(4), f2 = st.readUInt16BE(6), s1 = valueSize(f1), s2 = valueSize(f2);
      if (st.readUInt16BE(0) === 1) {
        const set = st.subarray(st.readUInt16BE(10 + ci * 2));
        for (let k = 0; k < set.readUInt16BE(0); k++) {
          const at = 2 + k * (2 + s1 + s2);
          if (set.readUInt16BE(at) === b) return [xAdvance(set, at + 2, f1), xAdvance(set, at + 2 + s1, f2), f2 !== 0];
        }
        continue;   // a format 1 subtable that covers the left glyph but not this pair: the next subtable may
      }
      const c1 = classOf(st.subarray(st.readUInt16BE(8)), a), c2 = classOf(st.subarray(st.readUInt16BE(10)), b);
      const n2 = st.readUInt16BE(14), at = 16 + (c1 * n2 + c2) * (s1 + s2);
      return [xAdvance(st, at, f1), xAdvance(st, at + s1, f2), f2 !== 0];
    }
    return null;
  };
}

export interface FontMetrics {
  /** Width of a line of text at a font size of 1 px, with the font's pair kerning and a letter spacing (in em)
   *  after every character, as browsers draw it. */
  width(text: string, letterSpacing?: number): number;
  /** In em: the height of the capitals, and the ascent and descent browsers set the line by (hhea, or the typo
   *  metrics when the font asks for them). */
  capHeight: number;
  ascent: number;
  descent: number;
}

export function readFont(path: string): FontMetrics {
  const t = tables(readFileSync(path));
  const need = (tag: string) => { const x = t.get(tag); if (!x) throw new Error(`font: no ${tag} table`); return x; };
  const upm = need('head').data.readUInt16BE(18);
  const metrics = need('hhea').data.readUInt16BE(34);
  const hmtx = need('hmtx');
  // a transformed hmtx starts with one flags byte; the advance widths follow in both forms
  const advAt = hmtx.transformed ? 1 : 0, advStep = hmtx.transformed ? 2 : 4;
  const advance = (g: number) => hmtx.data.readUInt16BE(advAt + Math.min(g, metrics - 1) * advStep);
  const glyphOf = charMap(need('cmap').data);
  const kern = pairKerning(t.get('GPOS')?.data);
  const hhea = need('hhea').data, os2 = t.get('OS/2')?.data;
  const typo = !!os2 && (os2.readUInt16BE(62) & 0x80) !== 0;
  const ascent = (typo ? os2!.readInt16BE(68) : hhea.readInt16BE(4)) / upm;
  const descent = -(typo ? os2!.readInt16BE(70) : hhea.readInt16BE(6)) / upm;
  const capHeight = os2 && os2.readUInt16BE(0) >= 2 ? os2.readInt16BE(88) / upm : 0.7;
  return {
    capHeight, ascent, descent,
    width(text, letterSpacing = 0) {
      const chars = [...text];
      const glyphs = chars.map((c) => {
        const g = glyphOf(c.codePointAt(0)!);
        if (!g) throw new Error(`font: no glyph for "${c}" in "${text}"`);
        return g;
      });
      let units = glyphs.reduce((s, g) => s + advance(g), 0);
      for (let i = 0; i < glyphs.length - 1; i++) {
        const k = kern(glyphs[i], glyphs[i + 1]);
        if (!k) continue;
        units += k[0] + k[1];
        if (k[2]) i++;
      }
      return units / upm + letterSpacing * chars.length;
    },
  };
}
