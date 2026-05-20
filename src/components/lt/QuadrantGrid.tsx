/* Competitive landscape 2x2 grid.
   X axis: brand-coupled (left) <-> brand-agnostic (right).
   Y axis: full-stack (top) <-> partial-layer (bottom).
   Three quadrants populated with named competitors. The fourth (top-right,
   brand-agnostic + full-stack) glows PROXYZ pink with the Lazy Tiger × PROXYZ
   label — the empty quadrant we're building toward. */

import type { QuadrantPlacement } from '../../config';

const FONT_MONO = "'IBM Plex Mono', monospace";
const PINK = '#FF4193';
const LIME = '#D2FF3B';

type Quad = 'tl' | 'tr' | 'bl' | 'br';

export default function QuadrantGrid({
  xLeftLabel,
  xRightLabel,
  yTopLabel,
  yBottomLabel,
  placements,
  emptyQuadrantLabel,
}: {
  xLeftLabel: string;
  xRightLabel: string;
  yTopLabel: string;
  yBottomLabel: string;
  placements: QuadrantPlacement[];
  emptyQuadrantLabel: string;
}) {
  const grouped: Record<Quad, string[]> = { tl: [], tr: [], bl: [], br: [] };
  placements.forEach((p) => grouped[p.quadrant].push(p.brand));

  const axisLabelStyle: React.CSSProperties = {
    fontFamily: FONT_MONO,
    fontSize: '11px',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.55)',
    fontVariantNumeric: 'tabular-nums',
  };

  const brandStyle: React.CSSProperties = {
    fontFamily: FONT_MONO,
    fontSize: '15px',
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.88)',
    margin: 0,
  };

  return (
    <div
      className="lt-quadrant"
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr 1fr',
        gridTemplateRows: 'auto 1fr 1fr auto',
        gap: 0,
        maxWidth: '960px',
        margin: '0 auto',
        fontFamily: FONT_MONO,
        color: '#fff',
      }}
    >
      {/* Top-left blank corner */}
      <div style={{ gridColumn: 1, gridRow: 1 }} />

      {/* Top Y-axis label */}
      <div
        style={{
          gridColumn: '2 / span 2',
          gridRow: 1,
          textAlign: 'center',
          padding: '0 0 18px 0',
          ...axisLabelStyle,
        }}
      >
        ↑ {yTopLabel}
      </div>

      {/* Left X-axis label (rotated, brand-coupled) */}
      <div
        style={{
          gridColumn: 1,
          gridRow: '2 / span 2',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          padding: '0 20px 0 0',
          alignSelf: 'center',
          justifySelf: 'center',
          ...axisLabelStyle,
        }}
      >
        ← {xLeftLabel} · {xRightLabel} →
      </div>

      {/* TL quadrant — brand-coupled + full-stack */}
      <QuadCell
        position="tl"
        title={`${xLeftLabel} · ${yTopLabel}`}
        brands={grouped.tl}
        brandStyle={brandStyle}
      />

      {/* TR quadrant — EMPTY (Lazy Tiger × PROXYZ) */}
      <QuadCell
        position="tr"
        title={`${xRightLabel} · ${yTopLabel}`}
        brands={grouped.tr}
        emptyLabel={emptyQuadrantLabel}
        brandStyle={brandStyle}
      />

      {/* BL quadrant — brand-coupled + partial-layer */}
      <QuadCell
        position="bl"
        title={`${xLeftLabel} · ${yBottomLabel}`}
        brands={grouped.bl}
        brandStyle={brandStyle}
      />

      {/* BR quadrant — brand-agnostic + partial-layer */}
      <QuadCell
        position="br"
        title={`${xRightLabel} · ${yBottomLabel}`}
        brands={grouped.br}
        brandStyle={brandStyle}
      />

      {/* Bottom Y-axis label */}
      <div
        style={{
          gridColumn: '2 / span 2',
          gridRow: 4,
          textAlign: 'center',
          padding: '18px 0 0 0',
          ...axisLabelStyle,
        }}
      >
        ↓ {yBottomLabel}
      </div>
    </div>
  );
}

function QuadCell({
  position,
  title,
  brands,
  emptyLabel,
  brandStyle,
}: {
  position: Quad;
  title: string;
  brands: string[];
  emptyLabel?: string;
  brandStyle: React.CSSProperties;
}) {
  const isEmpty = position === 'tr';
  const borderColor = isEmpty ? PINK : 'rgba(255,255,255,0.18)';
  const bg = isEmpty
    ? 'radial-gradient(ellipse at 60% 40%, rgba(255,65,147,0.16) 0%, rgba(255,65,147,0.04) 50%, transparent 70%)'
    : '#000';
  const gridColumn = position === 'tl' || position === 'bl' ? 2 : 3;
  const gridRow = position === 'tl' || position === 'tr' ? 2 : 3;

  return (
    <div
      style={{
        gridColumn,
        gridRow,
        position: 'relative',
        padding: '28px 24px',
        background: bg,
        border: `1px solid ${borderColor}`,
        // Avoid double borders between adjacent cells
        marginLeft: position === 'tr' || position === 'br' ? '-1px' : 0,
        marginTop: position === 'bl' || position === 'br' ? '-1px' : 0,
        minHeight: '180px',
        boxShadow: isEmpty ? `inset 0 0 0 1px rgba(255,65,147,0.4), 0 0 32px rgba(255,65,147,0.2)` : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: '10px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: isEmpty ? PINK : 'rgba(255,255,255,0.45)',
        }}
      >
        {title}
      </span>

      {isEmpty ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', flex: 1 }}>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: 'clamp(16px, 1.5vw, 20px)',
              lineHeight: 1.3,
              color: '#fff',
              margin: 0,
              letterSpacing: '-0.005em',
            }}
          >
            {emptyLabel}
          </p>
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: '10px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: LIME,
              marginTop: '6px',
            }}
          >
            ● The long game
          </span>
        </div>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {brands.map((b) => (
            <li key={b} style={brandStyle}>
              {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
