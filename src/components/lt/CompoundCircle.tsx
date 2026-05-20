/* Four-beat compounding diagram.
   Layer icons (waveform, leaderboard, drop, chat) arranged on a circle.
   Arrows connect each to the next. Center reveals the moat label. */

const FONT_MONO = "'IBM Plex Mono', monospace";
const FONT_DISPLAY = "'Cinzel', serif";
const ORANGE = '#FF4193'; // PROXYZ pink (kept the name for diff-friendliness)
const PINK = '#FF4193';

export default function CompoundCircle({ centerLabel }: { centerLabel: string }) {
  // Positions on the circle (12, 3, 6, 9 o'clock)
  const cx = 300;
  const cy = 300;
  const r = 180;
  const positions = [
    { x: cx, y: cy - r, label: 'Sensors' },
    { x: cx + r, y: cy, label: 'Gaming' },
    { x: cx, y: cy + r, label: 'Merch' },
    { x: cx - r, y: cy, label: 'Coach' },
  ];

  return (
    <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
      <svg viewBox="0 0 600 600" width="100%" height="auto" aria-label="Compounding member graph diagram">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <path d="M 0 0 L 8 4 L 0 8 Z" fill={ORANGE} />
          </marker>
          <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={ORANGE} stopOpacity="0.18" />
            <stop offset="100%" stopColor={ORANGE} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer circle (rule) */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,110,31,0.16)" strokeWidth="1" strokeDasharray="2 4" />
        {/* Center glow */}
        <circle cx={cx} cy={cy} r="120" fill="url(#center-glow)" />

        {/* Arrows between positions — slightly inset so they don't touch the dots */}
        {positions.map((p, i) => {
          const next = positions[(i + 1) % positions.length];
          const dx = next.x - p.x;
          const dy = next.y - p.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const ux = dx / len;
          const uy = dy / len;
          const inset = 36;
          const x1 = p.x + ux * inset;
          const y1 = p.y + uy * inset;
          const x2 = next.x - ux * inset;
          const y2 = next.y - uy * inset;
          // Curve outward
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          const perpX = -uy;
          const perpY = ux;
          const curve = 30;
          const cpx = mx + perpX * curve;
          const cpy = my + perpY * curve;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`}
              fill="none"
              stroke={ORANGE}
              strokeWidth="1.5"
              strokeOpacity="0.65"
              markerEnd="url(#arrowhead)"
            />
          );
        })}

        {/* Layer nodes */}
        {positions.map((p) => (
          <g key={p.label} transform={`translate(${p.x}, ${p.y})`}>
            <circle r="34" fill="#000" stroke={ORANGE} strokeWidth="1.5" />
            <circle r="34" fill="none" stroke={ORANGE} strokeWidth="1" strokeOpacity="0.3" strokeDasharray="2 3" />
            <text
              y="6"
              textAnchor="middle"
              fontFamily={FONT_MONO}
              fontSize="13"
              fill="#fff"
              letterSpacing="0.04em"
            >
              {p.label}
            </text>
          </g>
        ))}

        {/* Center label */}
        <g transform={`translate(${cx}, ${cy})`}>
          <circle r="80" fill="#000" stroke={PINK} strokeWidth="1" />
          <text
            y="-6"
            textAnchor="middle"
            fontFamily={FONT_DISPLAY}
            fontSize="16"
            fill={PINK}
            letterSpacing="0.06em"
          >
            The
          </text>
          <text
            y="14"
            textAnchor="middle"
            fontFamily={FONT_DISPLAY}
            fontSize="16"
            fill="#fff"
            letterSpacing="0.04em"
          >
            compounding
          </text>
          <text
            y="34"
            textAnchor="middle"
            fontFamily={FONT_DISPLAY}
            fontSize="16"
            fill="#fff"
            letterSpacing="0.04em"
          >
            member graph
          </text>
        </g>
      </svg>

      <p style={{ display: 'none' }}>{centerLabel}</p>
    </div>
  );
}
