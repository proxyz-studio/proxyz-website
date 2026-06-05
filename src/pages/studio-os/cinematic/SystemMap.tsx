import { useMemo } from 'react';
import { MODULES } from './system-map-data';

/**
 * Direction C — The System Map ("the whole company, in one place").
 * A central pink core linked to nine orbiting module nodes by thin lime lines,
 * with data pulses flowing inward. This is the visual answer to "what StudioOS
 * is" — the operating brain. (Tew's design; adapted to the app's stack/theme.)
 */
export default function SystemMap() {
  const reduced =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const CX = 800, CY = 470, RX = 400, RY = 300;

  const nodes = useMemo(
    () =>
      MODULES.map(([name, desc], i) => {
        const ang = ((-90 + i * (360 / MODULES.length)) * Math.PI) / 180;
        const x = CX + Math.cos(ang) * RX;
        const y = CY + Math.sin(ang) * RY;
        const lx = CX + Math.cos(ang) * (RX + 58);
        const ly = CY + Math.sin(ang) * (RY + 46);
        const cos = Math.cos(ang), sin = Math.sin(ang);
        let align: 'left' | 'right' | 'center' = 'center';
        let tx = '-50%';
        let ty = '-50%';
        if (cos > 0.3) { align = 'left'; tx = '0'; }
        else if (cos < -0.3) { align = 'right'; tx = '-100%'; }
        if (Math.abs(cos) <= 0.3) ty = sin > 0 ? '0' : '-100%';
        const isAI = name === 'Ask AI';
        return { name, desc, x, y, lx, ly, align, tx, ty, isAI, dur: 3 + (i % 4) * 0.7, begin: -i * 0.5 };
      }),
    [],
  );

  const pct = (v: number, d: number) => (v / d) * 100 + '%';

  return (
    <div className="sos-map">
      {/* core bloom */}
      <div
        style={{
          position: 'absolute', left: pct(CX, 1600), top: pct(CY, 900),
          width: 520, height: 520, transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(circle, rgba(255,65,147,0.18) 0%, rgba(255,65,147,0.05) 38%, transparent 64%)',
          filter: 'blur(8px)', pointerEvents: 'none',
        }}
      />

      <svg viewBox="0 0 1600 900" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <filter id="cBloom" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4" /></filter>
          <filter id="cBloomBig" x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur stdDeviation="14" /></filter>
        </defs>

        {/* connecting lines (lime) */}
        <g>
          {nodes.map((n, i) => (
            <line key={i} x1={n.x} y1={n.y} x2={CX} y2={CY} stroke="rgba(210,255,59,0.22)" strokeWidth="1" />
          ))}
        </g>

        {/* pulses flowing inward */}
        {!reduced && (
          <g filter="url(#cBloom)">
            {nodes.map((n, i) => (
              <circle key={i} r="2.6" fill="var(--lime)">
                <animateMotion dur={n.dur + 's'} begin={n.begin + 's'} repeatCount="indefinite" path={`M ${n.x} ${n.y} L ${CX} ${CY}`} />
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.78;1" dur={n.dur + 's'} begin={n.begin + 's'} repeatCount="indefinite" />
              </circle>
            ))}
          </g>
        )}

        {/* module hubs */}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r="13" fill={n.isAI ? 'rgba(210,255,59,0.10)' : 'rgba(232,232,232,0.05)'} filter="url(#cBloomBig)" />
            <circle cx={n.x} cy={n.y} r="9" fill="none" stroke={n.isAI ? 'var(--lime)' : 'var(--line)'} strokeWidth="1" />
            <circle cx={n.x} cy={n.y} r="3.4" fill={n.isAI ? 'var(--lime)' : 'var(--white)'} className="os-twinkle" style={{ animationDelay: i * 0.4 + 's' }} />
          </g>
        ))}

        {/* core */}
        <circle cx={CX} cy={CY} r="46" fill="rgba(255,65,147,0.16)" filter="url(#cBloomBig)" />
        {!reduced && <circle cx={CX} cy={CY} r="30" fill="none" stroke="var(--pink)" strokeWidth="1.4" className="os-ping" />}
        {!reduced && <circle cx={CX} cy={CY} r="30" fill="none" stroke="var(--pink)" strokeWidth="1.4" className="os-ping" style={{ animationDelay: '1.6s' }} />}
        <circle cx={CX} cy={CY} r="22" fill="rgba(255,65,147,0.10)" stroke="var(--pink)" strokeWidth="1.2" />
      </svg>

      {/* module labels (HTML for crisp type) */}
      {nodes.map((n, i) => (
        <div
          key={i}
          style={{ position: 'absolute', left: pct(n.lx, 1600), top: pct(n.ly, 900), transform: `translate(${n.tx}, ${n.ty})`, textAlign: n.align, zIndex: 10, pointerEvents: 'none', width: 168 }}
        >
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase', color: n.isAI ? 'var(--lime)' : 'var(--white)' }}>{n.name}</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: 'var(--faint)', marginTop: 4, letterSpacing: '0.04em' }}>{n.desc}</div>
        </div>
      ))}

      {/* core wordmark */}
      <div style={{ position: 'absolute', left: pct(CX, 1600), top: pct(CY + 64, 900), transform: 'translate(-50%,0)', textAlign: 'center', zIndex: 10, pointerEvents: 'none' }}>
        <div className="os-wordmark" style={{ fontSize: 22 }}>Studio<span className="os">OS</span></div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--teal)', marginTop: 10 }}>The operating brain that executes</div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: '0.08em', fontStyle: 'italic', color: 'var(--pink)', marginTop: 4 }}>So you don't have to</div>
      </div>

      {/* frame chrome */}
      <div style={{ position: 'absolute', left: 64, top: 56, zIndex: 10 }}>
        <p className="os-eyebrow" style={{ fontSize: 12.5 }}>One place to run your whole company</p>
      </div>
      <div style={{ position: 'absolute', left: 64, bottom: 60, zIndex: 10 }}>
        <span className="os-live"><span className="dot" />Nine modules · one brain</span>
      </div>
      <div style={{ position: 'absolute', right: 64, bottom: 60, zIndex: 10, textAlign: 'right' }}>
        <span className="os-tick">A PROXYZ Studio product</span>
      </div>
    </div>
  );
}
