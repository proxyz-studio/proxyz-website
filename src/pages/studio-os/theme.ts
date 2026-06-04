/** Shared style tokens for the StudioOS experience page. */
export const PINK = '#ff4193';
export const LIME = '#d2ff3b';
export const FG = '#f2f2f2';
export const BG = '#0a0a0a';
export const MUTED = 'rgba(255,255,255,0.64)';
export const FAINT = 'rgba(255,255,255,0.40)';
export const HAIRLINE = 'rgba(255,255,255,0.10)';

// IBM Plex Mono everywhere — the PROXYZ brand face, matching the rest of the
// site. (Display headings just use a heavier weight for presence.)
export const MONO = "'IBM Plex Mono', monospace";
export const DISPLAY = "'IBM Plex Mono', monospace";

export const MAXW = '1180px';

/** Background direction options (the three variations Tew chooses between). */
export type SosVariant = 'still' | 'blueprint' | 'glow';

export const VARIANTS: { id: SosVariant; label: string; note: string }[] = [
  { id: 'still', label: 'Still', note: 'Pure editorial. No background. Type and space carry it.' },
  { id: 'blueprint', label: 'Blueprint', note: 'A faint static system grid. Structured, operating-system feel.' },
  { id: 'glow', label: 'Glow', note: 'A soft, still light. Warm and premium, no motion.' },
];

/** Mono uppercase section label (e.g. "01 / THE PROBLEM"). */
export const labelStyle: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: '12px',
  fontWeight: 400,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color: PINK,
  margin: 0,
};
