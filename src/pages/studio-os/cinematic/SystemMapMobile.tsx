import { FAINT, FG, HAIRLINE, LIME, MONO, MUTED, PINK } from '../theme';
import { MODULES } from './system-map-data';

/**
 * Phone version of the System Map. The desktop constellation can't fit a narrow
 * column, so here the "operating brain" is a small emblem (pink core + a ring of
 * nine dots, no labels on the diagram) above the nine modules listed as a tidy
 * two-column grid. Same nine modules as the desktop SystemMap.
 */
function BrainMark() {
  const N = MODULES.length;
  const cx = 80, cy = 80, R = 58;
  const dots = MODULES.map(([name], i) => {
    const ang = ((-90 + i * (360 / N)) * Math.PI) / 180;
    return { x: cx + Math.cos(ang) * R, y: cy + Math.sin(ang) * R, ai: name === 'Ask AI' };
  });
  return (
    <svg viewBox="0 0 160 160" width="148" height="148" style={{ display: 'block', margin: '0 auto' }} aria-hidden>
      <defs>
        <filter id="bm-bloom" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      {/* spokes */}
      {dots.map((d, i) => (
        <line key={`s${i}`} x1={cx} y1={cy} x2={d.x} y2={d.y} stroke="rgba(210,255,59,0.18)" strokeWidth="1" />
      ))}
      {/* core */}
      <circle cx={cx} cy={cy} r="22" fill="rgba(255,65,147,0.16)" filter="url(#bm-bloom)" />
      <circle cx={cx} cy={cy} r="13" fill="rgba(255,65,147,0.12)" stroke={PINK} strokeWidth="1.3" />
      {/* node dots */}
      {dots.map((d, i) => (
        <g key={`d${i}`}>
          <circle cx={d.x} cy={d.y} r="6" fill={d.ai ? 'rgba(210,255,59,0.12)' : 'rgba(232,232,232,0.06)'} filter="url(#bm-bloom)" />
          <circle cx={d.x} cy={d.y} r="3.4" fill={d.ai ? LIME : '#ffffff'} />
        </g>
      ))}
    </svg>
  );
}

export default function SystemMapMobile() {
  return (
    <div style={{ maxWidth: 460, margin: '0 auto', textAlign: 'center' }}>
      <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: PINK, margin: '0 0 26px' }}>
        One place to run your whole company
      </p>

      <BrainMark />

      <div style={{ marginTop: 20 }}>
        <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 27, letterSpacing: '0.01em', color: FG }}>
          Studio<span style={{ color: LIME }}>OS</span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: MUTED, marginTop: 8 }}>
          the operating brain
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 30, textAlign: 'left' }}>
        {MODULES.map(([name, desc]) => {
          const isAI = name === 'Ask AI';
          return (
            <div
              key={name}
              style={{
                border: `1px solid ${isAI ? 'rgba(210,255,59,0.28)' : HAIRLINE}`,
                borderRadius: 10,
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 12.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: isAI ? LIME : FG }}>
                {name}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: MUTED, marginTop: 4 }}>{desc}</div>
            </div>
          );
        })}
      </div>

      <p style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: FAINT, margin: '26px 0 0' }}>
        Nine modules · one brain · a PROXYZ Studio product
      </p>
    </div>
  );
}
